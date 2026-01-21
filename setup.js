const Installer = require('./lib/installer');
const packageJson = require('./package.json');

const installer = new Installer(packageJson.binaryConfig);
installer.install();
