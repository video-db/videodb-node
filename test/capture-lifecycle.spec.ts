import { EventEmitter } from 'node:events';
import { CaptureClient } from '../src/capture/captureClient';
import { BinaryManager } from '../src/capture/binaryManager';
import { connect } from '../src';

jest.mock('../src/capture/binaryManager', () => ({
  BinaryManager: jest.fn().mockImplementation(() => {
    const manager = new (require('node:events').EventEmitter)();
    manager.start = jest.fn().mockResolvedValue(undefined);
    manager.stop = jest.fn().mockResolvedValue(undefined);
    manager.sendCommand = jest.fn(async (command: string, params: object) => {
      if (command === 'listLocalRecordings') return { recordings: [] };
      return { ...params, status: 'accepted' };
    });
    return manager;
  }),
}));
const identity = { recordingId: 'recording-1', sessionId: 'session-1' };
const complete = {
  ...identity,
  result: { videoId: 'video-1' },
  fileRetained: false,
};
const tick = () => new Promise(resolve => setImmediate(resolve));
function setup(
  provider?: (request: unknown) => Promise<string | null>,
  maxTokenRefreshAttempts?: number
) {
  const client = new CaptureClient({
    sessionToken: 'initial',
    apiUrl: 'https://api.dev.videodb.io',
    getRecorderToken: provider,
    maxTokenRefreshAttempts,
  });
  const manager = (BinaryManager as unknown as jest.Mock).mock.results.at(-1)
    .value as EventEmitter & {
    start: jest.Mock;
    stop: jest.Mock;
    sendCommand: jest.Mock;
  };
  return { client, manager };
}
beforeEach(() => jest.clearAllMocks());

test('refreshes on every native auth request, never reuses initial token', async () => {
  const provider = jest
    .fn()
    .mockResolvedValueOnce('fresh-1')
    .mockResolvedValueOnce('fresh-2');
  const { client, manager } = setup(provider);
  manager.emit('recording-token-needed', identity);
  await tick();
  manager.emit('recording-token-needed', identity); // native relay rejected authorization
  await tick();
  expect(provider).toHaveBeenCalledTimes(2);
  expect(provider).toHaveBeenLastCalledWith({
    ...identity,
    forceRefresh: true,
  });
  expect(
    manager.sendCommand.mock.calls
      .filter(([cmd]) => cmd === 'relayRecording')
      .map(([, p]) => p.uploadToken)
  ).toEqual(['fresh-1', 'fresh-2']);
  expect(manager.start).toHaveBeenCalledWith({
    sessionToken: 'initial',
    apiUrl: 'https://api.dev.videodb.io',
  });
  manager.emit('processing-complete', complete);
  await client.shutdown();
});

test('cached token is rejected without an automatic retry loop', async () => {
  const { client, manager } = setup(
    jest.fn().mockResolvedValue('cached-secret')
  );
  const errors: unknown[] = [];
  client.on('recording-token-error', e => errors.push(e));
  manager.emit('recording-token-needed', identity);
  await tick();
  manager.emit('recording-token-needed', identity);
  await tick();
  expect(manager.sendCommand).toHaveBeenCalledTimes(1);
  expect(errors).toHaveLength(1);
  expect(JSON.stringify(errors)).not.toContain('cached-secret');
  await expect(
    client.waitForProcessing({ recordingId: identity.recordingId })
  ).rejects.toThrow('fresh recorder token');
});

test('bounds repeated fresh-but-rejected tokens and redacts provider exceptions', async () => {
  const provider = jest
    .fn()
    .mockResolvedValueOnce('a')
    .mockResolvedValueOnce('b');
  const { client, manager } = setup(provider, 2);
  for (let i = 0; i < 3; i++) {
    manager.emit('recording-token-needed', identity);
    await tick();
  }
  expect(provider).toHaveBeenCalledTimes(2);
  await expect(
    client.waitForProcessing({ sessionId: identity.sessionId })
  ).rejects.toThrow('fresh recorder token');
  const other = setup(async () => {
    throw new Error('Authorization: secret');
  });
  const errors = jest.fn();
  other.client.on('recording-token-error', errors);
  other.manager.emit('recording-token-needed', identity);
  await tick();
  expect(JSON.stringify(errors.mock.calls)).not.toContain('Authorization');
  expect(other.manager.sendCommand).not.toHaveBeenCalled();
});

test('serializes auth requests arriving before relay acceptance', async () => {
  let release!: () => void;
  const provider = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<string>(r => {
          release = () => r('first');
        })
    )
    .mockResolvedValueOnce('second');
  const { manager } = setup(provider);
  manager.emit('recording-token-needed', identity);
  manager.emit('recording-token-needed', identity);
  await tick();
  expect(provider).toHaveBeenCalledTimes(1);
  release();
  await tick();
  expect(provider).toHaveBeenCalledTimes(2);
  expect(manager.sendCommand).toHaveBeenCalledTimes(2);
});

test('does not relay without a provider or when host declines unrelated recovery', async () => {
  const manual = setup();
  manual.manager.emit('recording-token-needed', identity);
  await tick();
  expect(manual.manager.sendCommand).not.toHaveBeenCalled();
  const ignored = setup(async () => null);
  ignored.manager.emit('recording-token-needed', identity);
  await tick();
  await ignored.client.listLocalRecordings();
  await ignored.client.shutdown();
  expect(ignored.manager.sendCommand).toHaveBeenCalledTimes(1);
});

test('discovers and explicitly resumes retained jobs; acceptance is not completion', async () => {
  const { client, manager } = setup();
  manager.sendCommand.mockImplementation(async command =>
    command === 'listLocalRecordings'
      ? { recordings: [{ ...identity, stage: 'processing' }] }
      : { recordingId: identity.recordingId, status: 'accepted' }
  );
  expect(await client.listLocalRecordings()).toEqual([
    { ...identity, stage: 'processing' },
  ]);
  await client.relayRecording({
    recordingId: identity.recordingId,
    uploadToken: 'fresh',
  });
  let done = false;
  const waiting = client
    .waitForProcessing({ recordingId: identity.recordingId })
    .then(r => {
      done = true;
      return r;
    });
  await tick();
  expect(done).toBe(false);
  manager.emit('processing-complete', complete);
  expect(await waiting).toEqual(complete);
  expect(
    await client.waitForProcessing({ sessionId: identity.sessionId })
  ).toEqual(complete);
});

test('shutdown waits through asynchronous finalization after stop acknowledgement', async () => {
  const { client, manager } = setup(async () => 'fresh');
  // This test deliberately exercises macOS local video behavior on any CI host.
  const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;
  Object.defineProperty(process, 'platform', { value: 'darwin' });
  try {
    await client.startSession({
      sessionId: identity.sessionId,
      channels: [{ channelId: 'display:1', type: 'video', store: false }],
    });
    await client.stopSession();
    const stopping = client.shutdown();
    await tick();
    expect(manager.stop).not.toHaveBeenCalled();
    manager.emit('local-recording-ready', identity);
    manager.emit('recording-token-needed', identity);
    await tick();
    expect(manager.stop).not.toHaveBeenCalled();
    manager.emit('processing-complete', complete);
    await stopping;
    expect(manager.stop).toHaveBeenCalledTimes(1);
  } finally {
    Object.defineProperty(process, 'platform', platform);
  }
});

test('timeout/failure keeps recorder alive; explicit suspension permits shutdown', async () => {
  const { client, manager } = setup();
  await client.relayRecording({
    recordingId: identity.recordingId,
    uploadToken: 'fresh',
  });
  await expect(client.shutdown({ timeoutMs: 5 })).rejects.toThrow('timed out');
  expect(manager.stop).not.toHaveBeenCalled();
  manager.emit('recording-relay-failed', { ...identity, error: 'failed' });
  await expect(
    client.waitForProcessing({ recordingId: identity.recordingId })
  ).rejects.toThrow('retained');
  await client.shutdown({ waitForProcessing: false });
  expect(manager.stop).toHaveBeenCalledTimes(1);
});

test('manual recovery clears stale failures; exit rejects waiters', async () => {
  const { client, manager } = setup();
  manager.emit('local-recording-failed', { ...identity, error: 'failed' });
  await client.relayRecording({
    recordingId: identity.recordingId,
    uploadToken: 'fresh',
  });
  const wait = client.waitForProcessing({ sessionId: identity.sessionId });
  await tick();
  manager.emit('shutdown', { code: 1 });
  await expect(wait).rejects.toThrow('exited');
});

test('backend token issuance supports same-user identity without changing legacy signature', async () => {
  const conn = connect({
    apiKey: 'test',
    baseUrl: 'https://api.dev.videodb.io',
  });
  const http = (conn as unknown as { vhttp: { post: jest.Mock } }).vhttp;
  const post = jest
    .spyOn(http, 'post')
    .mockResolvedValue({ data: { token: 'fresh' } });
  expect(await conn.generateClientToken(120, 'owner')).toBe('fresh');
  expect(post.mock.calls[0][1]).toEqual({ expires_in: 120, user_id: 'owner' });
  await conn.generateClientToken(120);
  expect(post.mock.calls[1][1]).toEqual({ expires_in: 120 });
});

test('a token provider resolving after explicit suspension cannot restart the recorder', async () => {
  let release!: (value: string) => void;
  const { client, manager } = setup(
    () =>
      new Promise(resolve => {
        release = resolve;
      })
  );
  await client.listLocalRecordings();
  manager.emit('recording-token-needed', identity);
  await tick();
  await client.shutdown({ waitForProcessing: false });
  release('too-late');
  await tick();
  expect(manager.start).toHaveBeenCalledTimes(1);
  expect(manager.sendCommand.mock.calls.map(([command]) => command)).toEqual([
    'listLocalRecordings',
  ]);
});

test('completion before relay acknowledgement is retained for a later waiter', async () => {
  const { client, manager } = setup();
  manager.sendCommand.mockImplementation(async () => {
    manager.emit('processing-complete', complete);
    return { recordingId: identity.recordingId, status: 'accepted' };
  });
  await client.relayRecording({
    recordingId: identity.recordingId,
    uploadToken: 'fresh',
  });
  expect(
    await client.waitForProcessing({ recordingId: identity.recordingId })
  ).toEqual(complete);
  await client.shutdown();
});

test('Windows capture keeps legacy shutdown without waiting for unsupported local events', async () => {
  const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;
  Object.defineProperty(process, 'platform', { value: 'win32' });
  try {
    const { client, manager } = setup();
    await client.startSession({
      sessionId: identity.sessionId,
      channels: [{ channelId: 'display:1', type: 'video' }],
    });
    await client.shutdown();
    expect(manager.stop).toHaveBeenCalledTimes(1);
  } finally {
    Object.defineProperty(process, 'platform', platform);
  }
});

test('concurrent public operations share binary initialization', async () => {
  const { client, manager } = setup();
  await Promise.all([
    client.listLocalRecordings(),
    client.listLocalRecordings(),
  ]);
  expect(manager.start).toHaveBeenCalledTimes(1);
});
