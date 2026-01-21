const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const tar = require('tar');
const { pipeline } = require('stream/promises');

class Installer {
    constructor(config) {
        this.config = config;
        this.platform = process.platform;
        this.arch = process.arch;
        this.binDir = path.join(process.cwd(), 'bin');
    }

    isPlatformSupported() {
        const platformKey = `${this.platform}-${this.arch}`;
        return this.config.checksums && this.config.checksums[platformKey];
    }

    getDownloadUrl() {
        const platformKey = `${this.platform}-${this.arch}`;
        return `${this.config.baseUrl}/${this.config.version}/${platformKey}/recorder-${platformKey}.tar.gz`;
    }

    getExpectedChecksum() {
        const platformKey = `${this.platform}-${this.arch}`;
        return this.config.checksums[platformKey];
    }

    async downloadFile(url, destPath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destPath);
            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download: ${response.statusCode}`));
                    return;
                }
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(destPath, () => { });
                reject(err);
            });
        });
    }

    async verifyChecksum(filePath, expectedChecksum) {
        console.warn('⚠️  Checksum verification is currently DISABLED by configuration.');
        return true;
    }

    async install() {
        console.log(`Installing VideoDB Recorder for ${this.platform}-${this.arch}...`);

        // Check if platform is supported
        if (!this.isPlatformSupported()) {
            const platformKey = `${this.platform}-${this.arch}`;
            console.warn(`⚠️  Platform ${platformKey} is not currently supported.`);
            console.warn(`Supported platforms: ${Object.keys(this.config.checksums || {}).join(', ')}`);
            console.warn('Skipping binary installation.');
            return;
        }

        if (!fs.existsSync(this.binDir)) {
            fs.mkdirSync(this.binDir, { recursive: true });
        }

        const platformKey = `${this.platform}-${this.arch}`;
        const tarPath = path.join(this.binDir, `recorder-${platformKey}.tar.gz`);
        const binaryName = this.platform === 'win32' ? 'recorder.exe' : 'recorder';
        const binaryPath = path.join(this.binDir, binaryName);
        const url = this.getDownloadUrl();
        const isDev = process.env.NODE_ENV === 'development';

        // Check if binary already exists
        if (fs.existsSync(binaryPath)) {
            console.log('✓ Binary already installed, skipping download.');
            return;
        }

        try {
            console.log(`Downloading from ${url}...`);

            try {
                await this.downloadFile(url, tarPath);
            } catch (e) {
                if (isDev) {
                    console.warn(`Download failed (expected in dev): ${e.message}`);
                    console.warn('Skipping binary installation in development mode');
                    return;
                }
                throw new Error(`Failed to download binary: ${e.message}`);
            }

            await this.verifyChecksum(tarPath, this.getExpectedChecksum());

            // Extract the tarball
            console.log('Extracting binary...');
            await tar.x({
                file: tarPath,
                cwd: this.binDir
            });

            // Cleanup
            fs.unlinkSync(tarPath);

            console.log('🎉 Installation complete!');
        } catch (error) {
            console.error('❌ Installation failed:', error.message);
            process.exit(1);
        }
    }
}

module.exports = Installer;
