import { EventEmitter } from 'node:events';
import { CaptureClient } from '../src/capture/captureClient';
import {
  BinaryManager,
  CaptureCommandError,
} from '../src/capture/binaryManager';
import type {
  CaptureClientOptions,
  LocalRecordingResult,
} from '../src/capture/types';

jest.mock('../src/capture/binaryManager', () => ({
  CaptureCommandError: jest.requireActual('../src/capture/binaryManager')
    .CaptureCommandError,
  BinaryManager: jest.fn().mockImplementation(() => {
    const manager = new (require('node:events').EventEmitter)();
    manager.start = jest.fn().mockResolvedValue(undefined);
    manager.stop = jest.fn().mockResolvedValue(undefined);
    manager.sendCommand = jest.fn();
    return manager;
  }),
}));
const capabilities = {
  supported: true,
  supportsDeferredWindow: true,
  supportsSwitchWindow: true,
  supportsPlaceholder: true,
  supportsSetWindowEnabled: true,
  supportsAddWindowMidRecording: false,
  windows: [
    {
      channelId: 'window:token',
      token: 'token',
      title: 'Fixture',
      appName: 'Fixture',
      bundleId: 'test.fixture',
      width: 800,
      height: 600,
      isOnScreen: true,
    },
  ],
};
const ready: LocalRecordingResult = {
  recordingId: 'rec-1',
  mode: 'deferred',
  status: 'ready',
  path: '/tmp/rec-1',
  files: ['/tmp/rec-1/recording.mp4'],
  durationSeconds: 5,
  metadata: { complete: true },
  finalizedOnShutdown: false,
};
const config = {
  channels: [
    { channelId: 'window:token', type: 'video' as const },
    { channelId: 'mic:default', type: 'audio' as const },
  ],
};
const tick = () => new Promise(resolve => setImmediate(resolve));
const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!;
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(process, 'platform', { value: 'darwin' });
});
afterEach(() => Object.defineProperty(process, 'platform', originalPlatform));
function setup(options?: CaptureClientOptions) {
  const client = new CaptureClient(options);
  const manager = (BinaryManager as unknown as jest.Mock).mock.results.at(-1)
    .value as EventEmitter & {
    start: jest.Mock;
    stop: jest.Mock;
    sendCommand: jest.Mock;
  };
  manager.sendCommand.mockImplementation(async (command, params) => {
    if (command === 'getWindows') return capabilities;
    if (command === 'startRecording')
      return { recordingId: 'rec-1', mode: 'deferred' };
    if (command === 'stopRecording') {
      manager.emit('local-recording-ready', ready);
      return { recordingId: 'rec-1', status: 'ready' };
    }
    return params;
  });
  return { client, manager };
}
test('tokenless discovery returns native capabilities and metadata directly', async () => {
  const { client, manager } = setup({ apiUrl: 'http://127.0.0.1:9' });
  expect(await client.getWindows()).toEqual(capabilities);
  expect(manager.start).toHaveBeenCalledWith({ apiUrl: 'http://127.0.0.1:9' });
});
test('standalone start sends only deferred selection and returns finalized file paths', async () => {
  const { client, manager } = setup();
  expect(await client.startLocalRecording(config)).toEqual({
    recordingId: 'rec-1',
    mode: 'deferred',
  });
  expect(manager.sendCommand).toHaveBeenCalledWith(
    'startRecording',
    {
      mode: 'deferred',
      channels: [
        { channel_id: 'window:token', type: 'video' },
        { channel_id: 'mic:default', type: 'audio' },
      ],
    },
    310000
  );
  expect(client.isCapturing).toBe(true);
  expect(await client.stopLocalRecording()).toEqual(ready);
  expect(client.isCapturing).toBe(false);
  await client.shutdown();
  expect(manager.stop).toHaveBeenCalledTimes(1);
});
test('shutdown finalizes standalone output without waiting for server processing', async () => {
  const provider = jest.fn();
  const { client, manager } = setup({
    sessionToken: 'server',
    getRecorderToken: provider,
  });
  await client.startLocalRecording(config);
  await client.shutdown();
  expect(provider).not.toHaveBeenCalled();
  expect(manager.sendCommand.mock.calls.map(([c]) => c)).toEqual([
    'getWindows',
    'startRecording',
    'stopRecording',
  ]);
  expect(manager.stop).toHaveBeenCalledTimes(1);
});
test('tokenless discovery ignores unrelated server recovery jobs during shutdown', async () => {
  const { client, manager } = setup();
  await client.getWindows();
  manager.emit('recording-token-needed', {
    recordingId: 'old',
    sessionId: 'unrelated',
  });
  await client.shutdown();
  expect(manager.stop).toHaveBeenCalledTimes(1);
});
test('waits for ready when it arrives after the stop acknowledgement', async () => {
  const { client, manager } = setup();
  await client.startLocalRecording(config);
  manager.sendCommand.mockResolvedValue({
    recordingId: 'rec-1',
    status: 'ready',
  });
  let done = false;
  const stopping = client.stopLocalRecording().then(r => {
    done = true;
    return r;
  });
  await tick();
  expect(done).toBe(false);
  manager.emit('local-recording-ready', ready);
  expect(await stopping).toEqual(ready);
});
test('finalization failure rejects with native code, leaves output and permits shutdown', async () => {
  const { client, manager } = setup();
  await client.startLocalRecording(config);
  manager.sendCommand.mockImplementation(async () => {
    manager.emit('local-recording-failed', {
      recordingId: 'rec-1',
      retained: true,
    });
    throw new CaptureCommandError({
      code: 'FINALIZE_FAILED',
      message: 'Output retained',
    });
  });
  await expect(client.stopLocalRecording()).rejects.toMatchObject({
    code: 'FINALIZE_FAILED',
  });
  await client.shutdown();
  expect(manager.stop).toHaveBeenCalledTimes(1);
});
test('window controls forward source options and preserve target errors without fallback', async () => {
  const { client, manager } = setup();
  await client.switchWindow({
    channelId: 'window:next',
    sourceChannelId: 'window:none',
  });
  await client.setWindowEnabled({ enabled: false });
  expect(manager.sendCommand).toHaveBeenCalledWith('switchWindow', {
    channelId: 'window:next',
    sourceChannelId: 'window:none',
  });
  expect(manager.sendCommand).toHaveBeenCalledWith('setWindowEnabled', {
    enabled: false,
  });
  manager.sendCommand.mockRejectedValue(
    new CaptureCommandError({
      code: 'TARGET_NOT_FOUND',
      message: 'Select again',
    })
  );
  await expect(
    client.switchWindow({ channelId: 'window:stale' })
  ).rejects.toMatchObject({ code: 'TARGET_NOT_FOUND' });
  expect(
    manager.sendCommand.mock.calls.some(([c]) => c === 'startRecording')
  ).toBe(false);
});
test('native window events are forwarded with their opaque channel identity', () => {
  const { client, manager } = setup();
  for (const name of [
    'windows-available',
    'window-suspended',
    'window-resumed',
    'window-closed',
    'window-switched',
  ]) {
    const listener = jest.fn();
    client.on(name, listener);
    const payload = {
      channelId: 'window:token',
      sourceId: 0,
      channel: 'screen',
      reason: 'minimized',
    };
    manager.emit(name, payload);
    expect(listener).toHaveBeenCalledWith(payload);
  }
});
test('unsupported binary and invalid target selections fail before capture', async () => {
  const { client, manager } = setup();
  await expect(
    client.startLocalRecording({
      channels: [{ channelId: 'camera:0', type: 'video' }],
    })
  ).rejects.toThrow('Unsupported');
  await expect(client.startLocalRecording({ channels: [] })).rejects.toThrow(
    'exactly one'
  );
  await expect(
    client.startLocalRecording({
      channels: [{ channelId: 'mic:default', type: 'audio' }],
    })
  ).rejects.toThrow('exactly one');
  manager.sendCommand.mockResolvedValue({
    ...capabilities,
    supportsDeferredWindow: false,
  });
  await expect(client.startLocalRecording(config)).rejects.toMatchObject({
    code: 'DEFERRED_TARGET_UNSUPPORTED',
  });
  expect(
    manager.sendCommand.mock.calls.every(([c]) => c === 'getWindows')
  ).toBe(true);
});
test('Windows remains unsupported without starting the older binary', async () => {
  Object.defineProperty(process, 'platform', { value: 'win32' });
  const { client, manager } = setup();
  expect(await client.getWindows()).toMatchObject({
    supported: false,
    windows: [],
  });
  await expect(client.startLocalRecording(config)).rejects.toThrow('macOS');
  expect(manager.start).not.toHaveBeenCalled();
});
test('session capture still requires a token and cannot overlap standalone capture', async () => {
  const local = setup();
  await expect(
    local.client.startSession({ sessionId: 's', channels: config.channels })
  ).rejects.toThrow('sessionToken');
  const { client } = setup({ sessionToken: 'token' });
  const first = client.startLocalRecording(config);
  const duplicate = client.startLocalRecording(config);
  await first;
  await expect(duplicate).rejects.toThrow('already active');
  await expect(
    client.startSession({ sessionId: 's', channels: config.channels })
  ).rejects.toThrow('already active');
  await expect(client.stopSession()).rejects.toThrow('stopLocalRecording');
});
test('stop then start operations serialize to avoid stopping a newer recording', async () => {
  const { client, manager } = setup();
  await client.startLocalRecording(config);
  const stopping = client.stopLocalRecording();
  const starting = client.startLocalRecording(config);
  await stopping;
  await starting;
  expect(manager.sendCommand.mock.calls.map(([c]) => c)).toEqual([
    'getWindows',
    'startRecording',
    'stopRecording',
    'getWindows',
    'startRecording',
  ]);
});
