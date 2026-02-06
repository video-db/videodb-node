import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as crypto from 'crypto';
import type { BinaryConfig, PlatformInfo } from './types';

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
      baseUrl: 'https://recorder-sdk-binaries.s3.amazonaws.com',
      version: '0.2.5',
      checksums: {
        'darwin-x64': '3fb822c1caa45ae4cac8f9e4eab8a8003a21bc2d267947538b42e9ac6fbe4880',
        'darwin-arm64': '3fb822c1caa45ae4cac8f9e4eab8a8003a21bc2d267947538b42e9ac6fbe4880',
        'win32-x64': '3c54ea519e31dfc9a92f531f2816e9feb1df84f66bcb8e9401c3603bbe4df8ab',
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
    return `${baseUrl}/v${version}/recorder-${platformKey}.tar.gz`;
  }

  /**
   * Get the path where the binary should be installed
   */
  public getBinaryPath(): string {
    const binName = process.platform === 'win32' ? 'recorder.exe' : 'recorder';

    // Try multiple paths in order of priority
    const possiblePaths = [
      // 1. Electron unpacked (highest priority)
      path.join(this.binDir, binName).replace('app.asar', 'app.asar.unpacked'),
      // 2. Standard location
      path.join(this.binDir, binName),
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

      const request = https.get(url, response => {
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
      console.log('VideoDB Recorder: Binary already installed');
      return;
    }

    // Check platform support
    if (!this.isPlatformSupported()) {
      const { platformKey } = this.getPlatformInfo();
      throw new Error(
        `VideoDB Recorder: Platform ${platformKey} is not supported. ` +
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
    const archivePath = path.join(this.binDir, 'recorder.tar.gz');

    console.log(`VideoDB Recorder: Downloading from ${downloadUrl}...`);

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
          console.log('VideoDB Recorder: Checksum verified');
        }
      }

      // Extract the archive
      console.log('VideoDB Recorder: Extracting...');
      await this.extractTarGz(archivePath, this.binDir);

      // Make binary executable (Unix)
      if (process.platform !== 'win32') {
        const binaryPath = this.getBinaryPath();
        fs.chmodSync(binaryPath, 0o755);
      }

      // Clean up archive
      fs.unlinkSync(archivePath);

      console.log('VideoDB Recorder: Installation complete');
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
    const binaryPath = this.getBinaryPath();
    if (fs.existsSync(binaryPath)) {
      fs.unlinkSync(binaryPath);
      console.log('VideoDB Recorder: Binary uninstalled');
    }
  }

  /**
   * Get the binary version (by running recorder --version)
   */
  public async getInstalledVersion(): Promise<string | null> {
    if (!this.isInstalled()) {
      return null;
    }

    return new Promise(resolve => {
      const { spawn } = require('child_process');
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
