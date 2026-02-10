const fs = require('fs');
const path = require('path');

const installerPath = path.join(__dirname, 'dist', 'recorder', 'installer.js');

// Check if dist exists (it won't exist when installing from git clone)
if (!fs.existsSync(installerPath)) {
    console.log('VideoDB Recorder: Skipping binary install (dist not built yet)');
    console.log('Run "npm run build" first, then "node setup.js" to install binaries');
    process.exit(0);
}

const { RecorderInstaller } = require('./dist/recorder/installer');
const packageJson = require('./package.json');

const installer = new RecorderInstaller(packageJson.binaryConfig);
installer.install();
