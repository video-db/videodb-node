const Installer = require('./lib/installer');
const packageJson = require('./package.json');

const installer = new Installer(packageJson.binaryConfig);
installer.install().catch(error => {
  console.warn(`VideoDB Capture setup skipped: ${error.message}`);
});
