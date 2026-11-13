import { RecorderInstaller } from '../src/capture/installer';
import type { BinaryConfig } from '../src/capture/types';

const InstallTimeInstaller = require('../lib/installer');
const { binaryConfig } = require('../package.json');

describe('capture binary version selection', () => {
  it.each([
    ['darwin', 'arm64', '0.3.3'],
    ['darwin', 'x64', '0.3.3'],
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
