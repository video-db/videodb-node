import { RecorderInstaller } from '../src/capture/installer';
import type { BinaryConfig } from '../src/capture/types';

const InstallTimeInstaller = require('../lib/installer');
const { binaryConfig } = require('../package.json');

describe('capture binary version selection', () => {
  it.each([
    ['darwin', 'arm64', '0.3.3-window.1'],
    ['darwin', 'x64', '0.3.3-window.1'],
    ['win32', 'x64', '0.3.1'],
  ] as const)(
    'selects %s-%s version %s in both installers',
    (platform, arch, version) => {
      const platformKey = `${platform}-${arch}`;
      const runtime = new RecorderInstaller();
      jest
        .spyOn(runtime, 'getPlatformInfo')
        .mockReturnValue({ platform, arch, platformKey });
      const installTime = new InstallTimeInstaller(binaryConfig);
      installTime.platform = platform;
      installTime.arch = arch;

      const expectedUrl = `${binaryConfig.baseUrl}/v${version}/capture-${platformKey}.tar.gz`;
      expect(runtime.getDownloadUrl()).toBe(expectedUrl);
      expect(installTime.getDownloadUrl()).toBe(expectedUrl);
      expect(runtime.getExpectedChecksum()).toMatch(/^[a-f0-9]{64}$/);
      expect(runtime.getExpectedChecksum()).toBe(
        installTime.getExpectedChecksum()
      );
      expect(runtime.isPlatformSupported()).toBe(true);
    }
  );

  it.each([undefined, { 'darwin-arm64': '2.0.0' }])(
    'keeps the default version for platforms without an override (%j)',
    platformVersions => {
      const config: BinaryConfig = {
        baseUrl: 'https://example.com/capture',
        version: '1.2.3',
        platformVersions,
        checksums: { 'win32-x64': 'a'.repeat(64) },
      };
      const runtime = new RecorderInstaller(config);
      jest.spyOn(runtime, 'getPlatformInfo').mockReturnValue({
        platform: 'win32',
        arch: 'x64',
        platformKey: 'win32-x64',
      });
      const installTime = new InstallTimeInstaller(config);
      installTime.platform = 'win32';
      installTime.arch = 'x64';
      const expected =
        'https://example.com/capture/v1.2.3/capture-win32-x64.tar.gz';
      expect(runtime.getDownloadUrl()).toBe(expected);
      expect(installTime.getDownloadUrl()).toBe(expected);
    }
  );
});

it('both installers reject stale/missing artifact markers and agree on current archives', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'capture-marker-'));
  const runtime = new RecorderInstaller();
  (runtime as unknown as { binDir: string }).binDir = directory;
  const installTime = new InstallTimeInstaller(binaryConfig);
  installTime.binDir = directory;
  try {
    fs.mkdirSync(path.dirname(runtime.getBinaryPath()), { recursive: true });
    fs.writeFileSync(runtime.getBinaryPath(), 'fixture');
    expect(runtime.isInstalled()).toBe(false);
    expect(installTime.isInstalled()).toBe(false);
    const marker = path.join(directory, '.artifact.json');
    fs.writeFileSync(
      marker,
      JSON.stringify({
        url: 'old-release',
        checksum: runtime.getExpectedChecksum(),
      })
    );
    expect(runtime.isInstalled()).toBe(false);
    expect(installTime.isInstalled()).toBe(false);
    fs.writeFileSync(
      marker,
      JSON.stringify({
        url: runtime.getDownloadUrl(),
        checksum: runtime.getExpectedChecksum(),
      })
    );
    expect(runtime.isInstalled()).toBe(true);
    expect(installTime.isInstalled()).toBe(true);
    fs.writeFileSync(
      marker,
      JSON.stringify({ url: runtime.getDownloadUrl(), checksum: 'wrong' })
    );
    expect(runtime.isInstalled()).toBe(false);
    expect(installTime.isInstalled()).toBe(false);
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});
