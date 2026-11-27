import { EventEmitter } from 'node:events';
import { CaptureClient } from '../src/capture/captureClient';
import {
  BinaryManager,
  CaptureCommandError,
} from '../src/capture/binaryManager';
import type { RecorderCapabilities, TrackSelector } from '../src/capture';

jest.mock('../src/capture/binaryManager', () => ({
  CaptureCommandError: jest.requireActual('../src/capture/binaryManager')
    .CaptureCommandError,
  BinaryManager: jest.fn().mockImplementation(() =>
    Object.assign(new EventEmitter(), {
      capabilities: {},
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      sendCommand: jest.fn().mockResolvedValue({}),
    })
  ),
}));

function setup(capabilities: Partial<RecorderCapabilities> = {}) {
  const client = new CaptureClient({ sessionToken: 'token' });
  const manager = (BinaryManager as unknown as jest.Mock).mock.results.at(-1)
    .value as EventEmitter & {
    capabilities: Partial<RecorderCapabilities>;
    sendCommand: jest.Mock;
  };
  manager.capabilities = capabilities;
  return { client, manager };
}
const config = {
  sessionId: 'session',
  channels: [{ channelId: 'display:1', type: 'video' as const }],
};
beforeEach(() => jest.clearAllMocks());

test('returns the native recording identity before live streams attach', async () => {
  const { client, manager } = setup({ instantStart: true });
  const reply = {
    sessionId: 'session',
    recordingId: 'recording',
    status: 'recording',
  };
  manager.sendCommand.mockResolvedValue(reply);
  const live = jest.fn();
  client.on('recording-live', live);
  expect(await client.startSession(config)).toEqual(reply);
  expect(live).not.toHaveBeenCalled();
  manager.emit('recording-live', { ...reply, streams: [] });
  expect(live).toHaveBeenCalledTimes(1);
});

test('older start replies remain usable without an invented recording ID', async () => {
  const { client, manager } = setup();
  manager.sendCommand.mockResolvedValue({
    sessionId: 'session',
    status: 'recording',
  });
  expect(await client.startSession(config)).toEqual({
    sessionId: 'session',
    status: 'recording',
  });
  expect(manager.sendCommand.mock.calls[0][1]).not.toHaveProperty('live');
});

test('native start rejection leaves the client able to retry', async () => {
  const { client, manager } = setup();
  const error = new CaptureCommandError({
    code: 'INSUFFICIENT_STORAGE',
    message: 'Full',
  });
  manager.sendCommand
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce({ sessionId: 'session', status: 'recording' });
  await expect(client.startSession(config)).rejects.toBe(error);
  await expect(client.startSession(config)).resolves.toHaveProperty(
    'sessionId',
    'session'
  );
});

test('exposes advertised capabilities without guessing for older binaries or sharing mutable arrays', async () => {
  const { client, manager } = setup({
    managedDeferredRecording: true,
    resolutions: ['720p', '1080p'],
    recordingNotices: true,
    instantStart: true,
  });
  const actual = await client.getCapabilities();
  expect(actual).toEqual(manager.capabilities);
  actual.resolutions!.pop();
  expect(manager.capabilities.resolutions).toEqual(['720p', '1080p']);
  manager.capabilities = {
    managedDeferredRecording: true,
    instantStart: false,
  };
  expect(await client.getCapabilities()).toEqual({
    managedDeferredRecording: true,
    instantStart: false,
  });
  manager.capabilities = {};
  expect(await client.getCapabilities()).toEqual({
    managedDeferredRecording: false,
  });
});

test('pauses and resumes channel IDs unchanged alongside legacy names', async () => {
  const { client, manager } = setup();
  await client.getCapabilities();
  const tracks: TrackSelector[] = [
    'display:1',
    'mic:default',
    'system_audio:default',
    'window:token',
    'screen',
    'mic',
    'system_audio',
  ];
  await client.pauseTracks(tracks);
  await client.resumeTracks(tracks);
  expect(manager.sendCommand.mock.calls).toEqual([
    ['pauseTracks', { tracks }],
    ['resumeTracks', { tracks }],
  ]);
  const error = new CaptureCommandError({
    code: 'INVALID_TRACK',
    message: 'Channel was not selected',
  });
  manager.sendCommand.mockRejectedValueOnce(error);
  await expect(client.pauseTracks(['display:99'])).rejects.toBe(error);
});

test.each(
  [[''], ['display:'], ['bogus'], [null], []].map(tracks => ({ tracks }))
)(
  'rejects malformed track selectors %j before native commands',
  async ({ tracks }) => {
    const { client, manager } = setup();
    await client.getCapabilities();
    await expect(
      client.pauseTracks(tracks as unknown as TrackSelector[])
    ).rejects.toThrow();
    await expect(
      client.resumeTracks(tracks as unknown as TrackSelector[])
    ).rejects.toThrow();
    expect(manager.sendCommand).not.toHaveBeenCalled();
  }
);
