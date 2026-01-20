#!/usr/bin/env node

/**
 * VideoDB Recorder Binary Postinstall Script
 *
 * This script installs the native recorder binary during npm install.
 */

async function main() {
  console.log('VideoDB Recorder: Installing binary...');

  try {
    // Try to load the installer from the built dist
    let RecorderInstaller;
    try {
      const recorder = require('../dist/recorder/installer.js');
      RecorderInstaller = recorder.RecorderInstaller;
    } catch {
      // If dist doesn't exist, we're in development - skip
      console.log('VideoDB Recorder: Build not found, skipping binary installation.');
      return;
    }

    const installer = new RecorderInstaller();

    // Check platform support
    if (!installer.isPlatformSupported()) {
      const info = installer.getPlatformInfo();
      console.log(
        `VideoDB Recorder: Platform ${info.platformKey} is not supported. ` +
        'Binary installation skipped.'
      );
      return;
    }

    // Check if already installed
    if (installer.isInstalled()) {
      console.log('VideoDB Recorder: Binary already installed.');
      return;
    }

    // Install the binary
    await installer.install({ skipChecksum: true });
    console.log('VideoDB Recorder: Binary installation complete.');
  } catch (error) {
    console.error('VideoDB Recorder: Binary installation failed:', error.message);
    // Don't fail the install - users can try again or use the SDK without recorder
    process.exit(0);
  }
}

main().catch(console.error);
