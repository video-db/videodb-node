const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const tar = require('tar');

class Installer {
    constructor(config) {
        this.config = config;
        this.platform = process.platform;
        this.arch = process.arch;
        this.binDir = path.join(__dirname, '..', 'bin');
    }

    isPlatformSupported() {
        const platformKey = `${this.platform}-${this.arch}`;
        return this.config.checksums && this.config.checksums[platformKey];
    }

    getDownloadUrl() {
        const platformKey = `${this.platform}-${this.arch}`;
        return `${this.config.baseUrl}/v${this.config.version}/recorder-${platformKey}.tar.gz`;
    }

    getExpectedChecksum() {
        const platformKey = `${this.platform}-${this.arch}`;
        return this.config.checksums[platformKey];
    }

    async downloadFile(url, destPath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destPath);
            https.get(url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
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
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);
            stream.on('data', data => hash.update(data));
            stream.on('end', () => {
                const actualChecksum = hash.digest('hex');
                if (actualChecksum !== expectedChecksum) {
                    reject(new Error(`Checksum mismatch: expected ${expectedChecksum}, got ${actualChecksum}`));
                } else {
                    resolve(true);
                }
            });
            stream.on('error', reject);
        });
    }

    async install() {
        console.log(`Installing VideoDB Recorder for ${this.platform}-${this.arch}...`);

        if (!this.isPlatformSupported()) {
            const platformKey = `${this.platform}-${this.arch}`;
            console.warn(`Platform ${platformKey} is not currently supported.`);
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

        if (fs.existsSync(binaryPath)) {
            console.log('Binary already installed, skipping download.');
            return;
        }

        try {
            console.log(`Downloading from ${url}...`);
            await this.downloadFile(url, tarPath);

            console.log('Verifying checksum...');
            await this.verifyChecksum(tarPath, this.getExpectedChecksum());
            console.log('Checksum verified.');

            console.log('Extracting binary...');
            await tar.x({
                file: tarPath,
                cwd: this.binDir
            });

            fs.unlinkSync(tarPath);

            if (this.platform !== 'win32') {
                fs.chmodSync(binaryPath, 0o755);
            }

            console.log('Installation complete!');
        } catch (error) {
            console.error('Installation failed:', error.message);
            if (fs.existsSync(tarPath)) {
                fs.unlinkSync(tarPath);
            }
            process.exit(1);
        }
    }
}

module.exports = Installer;
