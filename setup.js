const { RecorderInstaller } = require('./dist/recorder/installer');
const packageJson = require('./package.json');

const installer = new RecorderInstaller(packageJson.binaryConfig);
installer.install();
