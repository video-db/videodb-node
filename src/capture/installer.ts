import * as fs from 'node:fs';
import * as path from 'node:path';
import * as https from 'node:https';
import * as crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import type { BinaryConfig, PlatformInfo } from './types';

/** Name of the macOS .app bundle that wraps the capture binary for TCC compatibility */
const MACOS_APP_BUNDLE = 'VideoDBCapture.app';

/** Supported platforms */
const SUPPORTED_PLATFORMS: Record<string, string[]> = {
  darwin: ['x64', 'arm64'],
  win32: ['x64'],
  // linux: ['x64', 'arm64'], // Linux support can be added later
};

/**
 * RecorderInstaller class for managing binary installation
 *
 * @example
 * ```typescript
 * const installer = new RecorderInstaller();
 *
 * if (!installer.isInstalled()) {
 *   await installer.install();
 * }
 *
 * const binaryPath = installer.getBinaryPath();
 * ```
 */
export class RecorderInstaller {
  private binaryConfig: BinaryConfig;
  private binDir: string;

  constructor(binaryConfig?: BinaryConfig) {
    // Default binary config - can be overridden or loaded from package.json
    this.binaryConfig = binaryConfig || {
      baseUrl: 'https://artifacts.videodb.io/capture',
      version: '0.3.1',
      checksums: {
        'darwin-x64':
          '8b456607ba3628092081d92c1a22fcf4e8156f4e83b2d3d119bf0244eaa870b2',
        'darwin-arm64':
          'cefc35883acd53f63dc50f8deb186ea0a8e17c65e646af8e81a309251a220b9d',
        'win32-x64':
          'e388639c15ab35ac32179d3fc05a363f0f71d4d90265c6b48fb1af56ecae7736',
      },
    };

    // Binary directory is in the module's bin folder
    this.binDir = path.join(__dirname, '..', '..', 'bin');
  }

  /**
   * Get platform information
   */
  public getPlatformInfo(): PlatformInfo {
    const platform = process.platform;
    const arch = process.arch;
    const platformKey = `${platform}-${arch}`;

    return { platform, arch, platformKey };
  }

  /**
   * Check if the current platform is supported
   */
  public isPlatformSupported(): boolean {
    const { platform, arch } = this.getPlatformInfo();
    return SUPPORTED_PLATFORMS[platform]?.includes(arch) || false;
  }

  /**
   * Get the download URL for the current platform
   */
  public getDownloadUrl(): string {
    const { platformKey } = this.getPlatformInfo();
    const { baseUrl, version } = this.binaryConfig;
    return `${baseUrl}/v${version}/capture-${platformKey}.tar.gz`;
  }

  /**
   * Get the path where the binary should be installed.
   *
   * On macOS the binary lives inside a .app bundle so that TCC
   * (macOS 26+) can grant screen-recording permissions.
   */
  public getBinaryPath(): string {
    let binPath: string;

    if (process.platform === 'darwin') {
      // macOS: binary is inside the .app bundle
      binPath = path.join(
        this.binDir,
        MACOS_APP_BUNDLE,
        'Contents',
        'MacOS',
        'capture'
      );
    } else if (process.platform === 'win32') {
      binPath = path.join(this.binDir, 'capture.exe');
    } else {
      binPath = path.join(this.binDir, 'capture');
    }

    // Try multiple paths in order of priority
    const possiblePaths = [
      // 1. Electron unpacked (highest priority)
      binPath.replace('app.asar', 'app.asar.unpacked'),
      // 2. Standard location
      binPath,
    ];

    // Find the first path that exists
    const existingPath = possiblePaths.find(p => fs.existsSync(p));
    return existingPath || possiblePaths[1]; // Default to standard location
  }

  /**
   * Check if the binary is installed
   */
  public isInstalled(): boolean {
    const binaryPath = this.getBinaryPath();
    return fs.existsSync(binaryPath);
  }

  /**
   * Get the expected checksum for the current platform
   */
  public getExpectedChecksum(): string | undefined {
    const { platformKey } = this.getPlatformInfo();
    return this.binaryConfig.checksums[platformKey];
  }

  /**
   * Calculate SHA256 checksum of a file
   */
  private async calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Download a file from URL
   */
  private async downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);

      const options = {
        headers: {
          'User-Agent': 'videodb-node-installer',
        },
      };

      const request = https.get(url, options, response => {
        // Handle redirects
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          file.close();
          fs.unlinkSync(destPath);
          this.downloadFile(response.headers.location, destPath)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destPath);
          reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve();
        });
      });

      request.on('error', err => {
        file.close();
        fs.unlinkSync(destPath);
        reject(err);
      });

      file.on('error', err => {
        file.close();
        fs.unlinkSync(destPath);
        reject(err);
      });
    });
  }

  /**
   * Extract tar.gz archive
   */
  private async extractTarGz(
    archivePath: string,
    destDir: string
  ): Promise<void> {
    // Use require for tar to avoid TypeScript module resolution issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tar = require('tar') as {
      extract: (opts: { file: string; cwd: string }) => Promise<void>;
    };
    await tar.extract({
      file: archivePath,
      cwd: destDir,
    });
  }

  /**
   * Install the binary for the current platform
   * @param options - Installation options
   * @param options.force - Force reinstall even if already installed
   * @param options.skipChecksum - Skip checksum verification
   */
  public async install(
    options: { force?: boolean; skipChecksum?: boolean } = {}
  ): Promise<void> {
    const { force = false, skipChecksum = false } = options;

    // Check if already installed
    if (!force && this.isInstalled()) {
      console.log('VideoDB Capture: Binary already installed');
      return;
    }

    // Check platform support
    if (!this.isPlatformSupported()) {
      const { platformKey } = this.getPlatformInfo();
      throw new Error(
        `VideoDB Capture: Platform ${platformKey} is not supported. ` +
          `Supported platforms: ${Object.entries(SUPPORTED_PLATFORMS)
            .map(([p, archs]) => archs.map(a => `${p}-${a}`).join(', '))
            .join(', ')}`
      );
    }

    // Create bin directory if it doesn't exist
    if (!fs.existsSync(this.binDir)) {
      fs.mkdirSync(this.binDir, { recursive: true });
    }

    const downloadUrl = this.getDownloadUrl();
    const archivePath = path.join(this.binDir, 'capture.tar.gz');

    console.log(`VideoDB Capture: Downloading from ${downloadUrl}...`);

    try {
      // Download the archive
      await this.downloadFile(downloadUrl, archivePath);

      // Verify checksum if available and not skipped
      if (!skipChecksum) {
        const expectedChecksum = this.getExpectedChecksum();
        if (expectedChecksum) {
          const actualChecksum = await this.calculateChecksum(archivePath);
          if (actualChecksum !== expectedChecksum) {
            throw new Error(
              `Checksum mismatch: expected ${expectedChecksum}, got ${actualChecksum}`
            );
          }
          console.log('VideoDB Capture: Checksum verified');
        }
      }

      // Extract the archive
      console.log('VideoDB Capture: Extracting...');
      await this.extractTarGz(archivePath, this.binDir);

      // Make binary executable (Unix)
      if (process.platform !== 'win32') {
        const binaryPath = this.getBinaryPath();
        fs.chmodSync(binaryPath, 0o755);
      }

      // Re-sign the .app bundle on macOS so TCC recognises it.
      // The bundle ships pre-signed, but extraction can invalidate
      // the signature on some systems.  Sign inside-out: dylib, then
      // binary, then the bundle itself.
      if (process.platform === 'darwin') {
        const appBundlePath = path.join(this.binDir, MACOS_APP_BUNDLE);
        if (fs.existsSync(appBundlePath)) {
          try {
            const macosDir = path.join(appBundlePath, 'Contents', 'MacOS');
            const dylibPath = path.join(macosDir, 'librecorder.dylib');
            const capturePath = path.join(macosDir, 'capture');

            if (fs.existsSync(dylibPath)) {
              execFileSync('codesign', ['--force', '--sign', '-', dylibPath]);
            }
            execFileSync('codesign', ['--force', '--sign', '-', capturePath]);
            execFileSync('codesign', ['--force', '--sign', '-', appBundlePath]);
            console.log('VideoDB Capture: Code signed .app bundle');
          } catch (e) {
            console.warn(
              'VideoDB Capture: codesign failed, screen recording may not work on macOS 26+'
            );
          }
        }
      }

      // Clean up archive
      fs.unlinkSync(archivePath);

      console.log('VideoDB Capture: Installation complete');
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(archivePath)) {
        fs.unlinkSync(archivePath);
      }
      throw error;
    }
  }

  /**
   * Uninstall the binary
   */
  public uninstall(): void {
    if (process.platform === 'darwin') {
      // Remove the entire .app bundle directory
      const appBundlePath = path.join(this.binDir, MACOS_APP_BUNDLE);
      if (fs.existsSync(appBundlePath)) {
        fs.rmSync(appBundlePath, { recursive: true });
        console.log('VideoDB Capture: App bundle uninstalled');
        return;
      }
    }

    const binaryPath = this.getBinaryPath();
    if (fs.existsSync(binaryPath)) {
      fs.unlinkSync(binaryPath);
      console.log('VideoDB Capture: Binary uninstalled');
    }
  }

  /**
   * Get the binary version (by running capture --version)
   */
  public async getInstalledVersion(): Promise<string | null> {
    if (!this.isInstalled()) {
      return null;
    }

    return new Promise(resolve => {
      const { spawn } = require('node:child_process');
      const binaryPath = this.getBinaryPath();

      const proc = spawn(binaryPath, ['--version']);
      let output = '';

      proc.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      proc.on('close', () => {
        const version = output.trim();
        resolve(version || null);
      });

      proc.on('error', () => {
        resolve(null);
      });
    });
  }
}
