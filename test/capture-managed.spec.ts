import { EventEmitter } from 'node:events';
import { CaptureClient } from '../src/capture/captureClient';
import {
  BinaryManager,
  CaptureCommandError,
} from '../src/capture/binaryManager';
import type { CaptureClientOptions } from '../src/capture/types';
jest.mock('../src/capture/binaryManager', () => ({
  CaptureCommandError: jest.requireActual('../src/capture/binaryManager')
    .CaptureCommandError,
  BinaryManager: jest.fn().mockImplementation(() =>
    Object.assign(new (require('node:events').EventEmitter)(), {
      capabilities: { managedDeferredRecording: true },
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      sendCommand: jest.fn(),
    })
  ),
}));
const start = {
  owner: 'alice',
  collectionId: 'coll',
  uploadToken: 'initial',
  channels: [{ channelId: 'window:none', type: 'video' as const }],
};
const complete = {
  recordingId: 'rec-one',
  owner: 'alice',
  result: { videoId: 'video-one' },
};
const needed = {
  ...complete,
  collectionId: 'coll',
  sessionId: 'server-session',
  purpose: 'recording-delivery',
};
const tick = () => new Promise(r => setImmediate(r));
const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(process, 'platform', { value: 'darwin' });
});
afterEach(() => Object.defineProperty(process, 'platform', platform));
function setup(options: CaptureClientOptions = {}) {
  const client = new CaptureClient(options);
  const manager = (BinaryManager as unknown as jest.Mock).mock.results.at(-1)
    .value as EventEmitter & {
    capabilities: { managedDeferredRecording: boolean };
    start: jest.Mock;
    stop: jest.Mock;
    sendCommand: jest.Mock;
  };
  manager.sendCommand.mockImplementation(async command => {
    if (command === 'startRecording')
      return { recordingId: 'rec-one', mode: 'deferred' };
    if (command === 'stopRecording')
      return { recordingId: 'rec-one', status: 'ready', durationSeconds: 5 };
    if (command === 'relayRecording')
      return { recordingId: 'rec-one', status: 'accepted' };
    if (command === 'listRecordings') return { recordings: [] };
  });
  return { client, manager };
}
test('requires authorization and capability, and never sends tokenless local capture', async () => {
  const { client, manager } = setup();
  await expect(
    client.startRecording({ ...start, uploadToken: '' })
  ).rejects.toThrow('required');
  await expect(
    client.startLocalRecording({ channels: start.channels })
  ).rejects.toThrow('Tokenless');
  expect(manager.sendCommand).not.toHaveBeenCalled();
  manager.capabilities.managedDeferredRecording = false;
  await expect(client.startRecording(start)).rejects.toThrow(
    'does not support'
  );
  expect(manager.sendCommand).not.toHaveBeenCalled();
});
test('managed start forwards authorization; stop readiness is not completion', async () => {
  const { client, manager } = setup();
  await client.startRecording(start);
  expect(manager.sendCommand).toHaveBeenCalledWith(
    'startRecording',
    {
      mode: 'deferred',
      owner: 'alice',
      collectionId: 'coll',
      uploadToken: 'initial',
      channels: [{ channel_id: 'window:none', type: 'video' }],
    },
    310000
  );
  expect(client.isCapturing).toBe(true);
  await client.stopRecording();
  expect(client.isCapturing).toBe(false);
  let finished = false;
  const wait = client
    .waitForProcessing({ recordingId: 'rec-one', timeoutMs: 1000 })
    .then(r => {
      finished = true;
      return r;
    });
  await tick();
  expect(finished).toBe(false);
  manager.emit('processing-complete', complete);
  expect(await wait).toEqual(complete);
  await client.shutdown();
});
test('completion preceding wait is retained; managed events have no local-file fields', async () => {
  const { client, manager } = setup();
  const event = jest.fn();
  client.on('processing-complete', event);
  await client.startRecording(start);
  await client.stopRecording();
  manager.emit('processing-complete', complete);
  expect(await client.waitForProcessing({ recordingId: 'rec-one' })).toEqual(
    complete
  );
  expect(event).toHaveBeenCalledWith(complete);
  await client.shutdown();
});
test('owner-scoped listing recovers completed result without restarting capture', async () => {
  const { client, manager } = setup();
  manager.sendCommand.mockResolvedValue({
    recordings: [{ ...complete, stage: 'complete' }],
  });
  await client.listRecordings({ owner: 'alice' });
  expect(await client.waitForProcessing({ recordingId: 'rec-one' })).toEqual(
    complete
  );
  expect(manager.sendCommand).toHaveBeenCalledTimes(1);
  await expect(
    client.relayRecording({ recordingId: 'rec-one', uploadToken: 'token' })
  ).rejects.toThrow('owner');
});
test('token refresh includes owner, collection and forces a new token; repeated cache token fails', async () => {
  const provider = jest.fn().mockResolvedValue('fresh');
  const { client, manager } = setup({ getRecorderToken: provider });
  await client.startRecording(start);
  await client.stopRecording();
  manager.emit('recording-token-needed', needed);
  await tick();
  expect(provider).toHaveBeenCalledWith({ ...needed, forceRefresh: true });
  expect(manager.sendCommand).toHaveBeenCalledWith('relayRecording', {
    recordingId: 'rec-one',
    owner: 'alice',
    uploadToken: 'fresh',
  });
  manager.emit('recording-token-needed', needed);
  await tick();
  await expect(
    client.waitForProcessing({ recordingId: 'rec-one' })
  ).rejects.toMatchObject({ code: 'TOKEN_REFRESH_FAILED' });
  expect(
    manager.sendCommand.mock.calls.filter(([c]) => c === 'relayRecording')
  ).toHaveLength(1);
  await client.shutdown({ waitForProcessing: false });
});
test('unowned token events cannot trigger provider or block shutdown', async () => {
  const provider = jest.fn();
  const { client, manager } = setup({ getRecorderToken: provider });
  await client.getCapabilities();
  manager.emit('recording-token-needed', needed);
  await tick();
  expect(provider).not.toHaveBeenCalled();
  await client.shutdown();
});
test('processing failure rejects waiter without retrying a terminal native failure', async () => {
  const { client, manager } = setup();
  await client.startRecording(start);
  await client.stopRecording();
  manager.emit('processing-failed', {
    recordingId: 'rec-one',
    owner: 'alice',
    errorCode: 'DURATION_MISMATCH',
    retryable: false,
  });
  await expect(
    client.waitForProcessing({ recordingId: 'rec-one' })
  ).rejects.toMatchObject({ code: 'DURATION_MISMATCH' });
  await client.shutdown({ waitForProcessing: false });
});
test('shutdown stops capture and waits for processing complete', async () => {
  const { client, manager } = setup();
  await client.startRecording(start);
  const closing = client.shutdown();
  await tick();
  expect(manager.stop).not.toHaveBeenCalled();
  manager.emit('processing-complete', complete);
  await closing;
  expect(manager.stop).toHaveBeenCalledTimes(1);
});
test('explicit suspension finalizes capture but does not wait for delivery', async () => {
  const { client, manager } = setup();
  await client.startRecording(start);
  await client.shutdown({ waitForProcessing: false });
  expect(manager.sendCommand).toHaveBeenCalledWith('stopRecording', {}, 155000);
  expect(manager.stop).toHaveBeenCalledTimes(1);
});
test('finalization failure permits explicit suspension and exposes error', async () => {
  const { client, manager } = setup();
  await client.startRecording(start);
  manager.sendCommand.mockRejectedValue(
    new CaptureCommandError({ code: 'FINALIZE_FAILED' })
  );
  await expect(client.stopRecording()).rejects.toMatchObject({
    code: 'FINALIZE_FAILED',
  });
  await client.shutdown({ waitForProcessing: false });
});
test('live and managed starts cannot overlap; withdrawn discard is absent', async () => {
  const { client, manager } = setup({ sessionToken: 'live' });
  await client.startRecording(start);
  await expect(
    client.startSession({ sessionId: 'live', channels: start.channels })
  ).rejects.toThrow('already active');
  await expect(client.stopSession()).rejects.toThrow('stopRecording');
  expect('discardRecording' in client).toBe(false);
});

test('backend recorder token request binds collection and returns resolved identity', async () => {
  const { connect } = await import('../src');
  const conn = connect({
    apiKey: 'fixture',
    baseUrl: 'https://api.dev.videodb.io',
  });
  const http = (conn as unknown as { vhttp: { post: jest.Mock } }).vhttp;
  const post = jest.spyOn(http, 'post').mockResolvedValue({
    data: { token: 'bound-token', collectionId: 'resolved' },
  });
  expect(
    await conn.generateRecorderToken({
      collectionId: 'default',
      userId: 'alice',
      expiresIn: 60,
    })
  ).toEqual({ token: 'bound-token', collectionId: 'resolved' });
  expect(post).toHaveBeenCalledWith(['capture', 'session', 'token'], {
    collection_id: 'default',
    user_id: 'alice',
    expires_in: 60,
  });
  post.mockResolvedValue({ data: { token: 'unbound' } });
  await expect(
    conn.generateRecorderToken({ collectionId: 'default', userId: 'alice' })
  ).rejects.toThrow('resolved collection');
  post.mockRestore();
});

test('progress forwards native estimates unchanged and never resolves processing waits', async () => {
  const { client, manager } = setup();
  const listener = jest.fn();
  client.on('processing-progress', listener);
  await client.startRecording(start);
  await client.stopRecording();
  let finished = false;
  const waiting = client
    .waitForProcessing({ recordingId: 'rec-one', timeoutMs: 1000 })
    .then(result => {
      finished = true;
      return result;
    });
  const samples = [
    { recordingId: 'rec-one', owner: 'alice', percent: 0, etaSeconds: null },
    { recordingId: 'rec-one', owner: 'alice', percent: 49, etaSeconds: 12 },
    { recordingId: 'rec-one', owner: 'alice', percent: 99, etaSeconds: null },
  ];
  for (const progress of samples) manager.emit('processing-progress', progress);
  await tick();
  expect(finished).toBe(false);
  expect(listener.mock.calls.map(([value]) => value)).toEqual(samples);
  manager.emit('processing-complete', complete);
  expect(await waiting).toEqual(complete);
  await client.shutdown();
});
test('partial ready events and listing snapshots retain public metadata, including absent progress', async () => {
  const { client, manager } = setup();
  const listener = jest.fn();
  client.on('recording-ready', listener);
  const ready = {
    recordingId: 'rec-one',
    owner: 'alice',
    status: 'ready',
    mode: 'deferred',
    durationSeconds: 5,
    finalizedOnShutdown: false,
    partial: true,
    partialReason: 'interrupted',
  };
  manager.emit('recording-ready', ready);
  expect(listener).toHaveBeenCalledWith(ready);
  const jobs = [
    {
      ...complete,
      stage: 'processing',
      partial: true,
      partialReason: 'interrupted',
      progress: { percent: 34, etaSeconds: null },
    },
    {
      recordingId: 'rec-two',
      owner: 'alice',
      stage: 'ready',
      partial: false,
      partialReason: null,
    },
  ];
  manager.sendCommand.mockResolvedValue({ recordings: jobs });
  expect(await client.listRecordings({ owner: 'alice' })).toEqual(jobs);
  expect(manager.sendCommand).toHaveBeenCalledTimes(1);
  await client.shutdown({ waitForProcessing: false });
});

test('retrying managed failures keep processing waits open and let shutdown retain delayed jobs', async () => {
  const { client, manager } = setup();
  await client.startRecording(start);
  await client.stopRecording();
  let finished = false;
  const waiting = client
    .waitForProcessing({ recordingId: 'rec-one', timeoutMs: 1000 })
    .then(value => {
      finished = true;
      return value;
    });
  manager.emit('processing-failed', {
    ...complete,
    errorCode: 'DELIVERY_INTERRUPTED',
    retryable: true,
    retrying: true,
  });
  await tick();
  expect(finished).toBe(false);
  manager.emit('processing-complete', complete);
  expect(await waiting).toEqual(complete);
  await client.shutdown();

  const other = setup();
  await other.client.startRecording(start);
  const closing = other.client.shutdown();
  await tick();
  expect(other.manager.stop).not.toHaveBeenCalled();
  other.manager.emit('processing-failed', {
    ...complete,
    errorCode: 'PROCESSING_STALLED',
    retrying: true,
  });
  await closing;
  expect(other.manager.stop).toHaveBeenCalledTimes(1);
});

test('listing adopts early token events once, isolates owners, and waits for resumed delivery on shutdown', async () => {
  const provider = jest.fn().mockResolvedValue('fresh');
  const { client, manager } = setup({ getRecorderToken: provider });
  manager.sendCommand.mockImplementation(async command => {
    if (command === 'listRecordings') {
      manager.emit('recording-token-needed', needed);
      manager.emit('recording-token-needed', {
        ...needed,
        recordingId: 'unlisted',
      });
      manager.emit('recording-token-needed', { ...needed, owner: 'bob' });
      return { recordings: [{ ...complete, stage: 'ready' }] };
    }
    return { recordingId: 'rec-one', status: 'accepted' };
  });
  await client.listRecordings({ owner: 'alice' });
  await tick();
  expect(provider).toHaveBeenCalledTimes(1);
  const closing = client.shutdown();
  await tick();
  expect(manager.stop).not.toHaveBeenCalled();
  manager.emit('processing-complete', complete);
  await closing;
});

test('failed listing never adopts a token request and leaves no shutdown wait', async () => {
  const provider = jest.fn();
  const { client, manager } = setup({ getRecorderToken: provider });
  manager.sendCommand.mockImplementation(async () => {
    manager.emit('recording-token-needed', needed);
    throw new Error('listing failed');
  });
  await expect(client.listRecordings({ owner: 'alice' })).rejects.toThrow(
    'listing failed'
  );
  await tick();
  expect(provider).not.toHaveBeenCalled();
  await client.shutdown();
});

test('measured delivery resets consecutive refresh limit but never allows cached tokens', async () => {
  let issued = 0;
  const provider = jest
    .fn()
    .mockImplementation(async () => `fresh-${++issued}`);
  const { client, manager } = setup({
    getRecorderToken: provider,
    maxTokenRefreshAttempts: 2,
  });
  await client.startRecording(start);
  await client.stopRecording();
  for (let n = 0; n < 5; n++) {
    manager.emit('recording-token-needed', needed);
    await tick();
    manager.emit('processing-progress', {
      ...complete,
      percent: 50,
      etaSeconds: 10,
    });
  }
  expect(provider).toHaveBeenCalledTimes(5);
  provider.mockResolvedValue('fresh-1');
  manager.emit('recording-token-needed', needed);
  await tick();
  await expect(
    client.waitForProcessing({ recordingId: 'rec-one' })
  ).rejects.toMatchObject({ code: 'TOKEN_REFRESH_FAILED' });
  await client.shutdown({ waitForProcessing: false });
});

test('relay acceptance and unknown ETA do not reset rejected-token limit', async () => {
  let issued = 0;
  const provider = jest
    .fn()
    .mockImplementation(async () => `rejected-${++issued}`);
  const { client, manager } = setup({
    getRecorderToken: provider,
    maxTokenRefreshAttempts: 2,
  });
  await client.startRecording(start);
  await client.stopRecording();
  for (let n = 0; n < 3; n++) {
    manager.emit('recording-token-needed', needed);
    await tick();
    manager.emit('processing-progress', {
      ...complete,
      percent: 0,
      etaSeconds: null,
    });
  }
  expect(provider).toHaveBeenCalledTimes(2);
  await expect(
    client.waitForProcessing({ recordingId: 'rec-one' })
  ).rejects.toMatchObject({ code: 'TOKEN_REFRESH_FAILED' });
  await client.shutdown({ waitForProcessing: false });
});

test('late readiness clears capture after a stop timeout and ignores another owner', async () => {
  const { client, manager } = setup();
  await client.startRecording(start);
  manager.sendCommand.mockRejectedValueOnce(new Error('Command timed out'));
  await expect(client.stopRecording({ timeoutMs: 200 })).rejects.toThrow(
    'timed out'
  );
  expect(manager.sendCommand).toHaveBeenLastCalledWith(
    'stopRecording',
    {},
    200
  );
  expect(client.isCapturing).toBe(true);
  manager.emit('recording-ready', { ...complete, owner: 'bob' });
  expect(client.isCapturing).toBe(true);
  manager.emit('recording-ready', complete);
  expect(client.isCapturing).toBe(false);
  await client.startRecording(start);
  await client.shutdown({ waitForProcessing: false });
});

test('long recordings scale the finalization timeout and reject invalid overrides', async () => {
  jest.useFakeTimers();
  try {
    const { client, manager } = setup();
    await client.startRecording(start);
    jest.advanceTimersByTime(4 * 60 * 60 * 1000);
    await expect(client.stopRecording({ timeoutMs: 0 })).rejects.toThrow(
      'positive'
    );
    await client.stopRecording();
    expect(manager.sendCommand).toHaveBeenLastCalledWith(
      'stopRecording',
      {},
      3630000
    );
    await client.shutdown({ waitForProcessing: false });
  } finally {
    jest.useRealTimers();
  }
});

test('startup and listing token requests coalesce before submission but rejection after submission refreshes', async () => {
  let releaseToken!: (value: string) => void;
  let releaseRelay!: () => void;
  const provider = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<string>(resolve => {
          releaseToken = resolve;
        })
    )
    .mockResolvedValue('second-token');
  const { client, manager } = setup({ getRecorderToken: provider });
  await client.startRecording(start);
  await client.stopRecording();
  manager.sendCommand.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        releaseRelay = () => resolve({ status: 'accepted' });
      })
  );
  manager.emit('recording-token-needed', needed);
  manager.emit('recording-token-needed', needed);
  await tick();
  expect(provider).toHaveBeenCalledTimes(1);
  releaseToken('first-token');
  await tick();
  manager.emit('recording-token-needed', needed); // Auth rejected before relay acknowledgement.
  manager.emit('recording-token-needed', needed);
  releaseRelay();
  await tick();
  expect(provider).toHaveBeenCalledTimes(2);
  manager.emit('processing-complete', complete);
  await client.shutdown();
});

test('a host declining a listed token request releases an ongoing shutdown wait', async () => {
  let decline!: (value: null) => void;
  const { client, manager } = setup({
    getRecorderToken: () =>
      new Promise(resolve => {
        decline = resolve;
      }),
  });
  manager.sendCommand.mockImplementation(async () => {
    manager.emit('recording-token-needed', needed);
    return { recordings: [{ ...complete, stage: 'ready' }] };
  });
  await client.listRecordings({ owner: 'alice' });
  await tick();
  const closing = client.shutdown();
  await tick();
  expect(manager.stop).not.toHaveBeenCalled();
  decline(null);
  await closing;
  expect(manager.stop).toHaveBeenCalledTimes(1);
});

test.each([
  ['mic:default'],
  ['system_audio:default'],
  ['mic:default', 'system_audio:default'],
])('managed audio-only forwards selected sources: %j', async (...sources) => {
  const { client, manager } = setup();
  const channels = sources.map(channelId => ({
    channelId,
    type: 'audio' as const,
  }));
  await client.startRecording({ ...start, channels });
  expect(manager.sendCommand).toHaveBeenCalledWith(
    'startRecording',
    expect.objectContaining({
      channels: sources.map(channel_id => ({ channel_id, type: 'audio' })),
    }),
    310000
  );
  await client.stopRecording();
  manager.emit('processing-complete', complete);
  await client.shutdown();
});

test('managed selection still rejects empty, unsupported and multiple-video sources', async () => {
  const { client, manager } = setup();
  for (const channels of [
    [],
    [{ channelId: 'camera:0', type: 'video' as const }],
    [{ channelId: 'mic:other', type: 'audio' as const }],
    [...start.channels, ...start.channels],
  ]) {
    await expect(client.startRecording({ ...start, channels })).rejects.toThrow(
      'Select'
    );
  }
  expect(manager.sendCommand).not.toHaveBeenCalled();
});

test('managed-capable macOS live audio-only shutdown waits for local delivery', async () => {
  const { client, manager } = setup({ sessionToken: 'live' });
  await client.startSession({
    sessionId: 'live-audio',
    channels: [{ channelId: 'mic:default', type: 'audio' }],
  });
  const closing = client.shutdown();
  await tick();
  expect(manager.stop).not.toHaveBeenCalled();
  manager.emit('processing-complete', {
    recordingId: 'local-audio',
    sessionId: 'live-audio',
    result: { videoId: 'audio-video' },
    fileRetained: false,
  });
  await closing;
  expect(manager.stop).toHaveBeenCalledTimes(1);
});

test.each([
  start.channels,
  [{ channelId: 'mic:default', type: 'audio' as const }],
])(
  'Windows managed capture forwards channels and waits for completion',
  async (...channels) => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    const { client, manager } = setup();
    await client.startRecording({ ...start, channels });
    const closing = client.shutdown();
    await tick();
    expect(manager.stop).not.toHaveBeenCalled();
    manager.emit('processing-complete', complete);
    await closing;
  }
);

test('Windows still requires managed capability before deferred capture', async () => {
  Object.defineProperty(process, 'platform', { value: 'win32' });
  const { client, manager } = setup();
  manager.capabilities.managedDeferredRecording = false;
  await expect(client.startRecording(start)).rejects.toThrow(
    'does not support'
  );
  expect(manager.sendCommand).not.toHaveBeenCalled();
  await client.shutdown();
});

test('Windows discovers and controls windows without the removed localRecording capability', async () => {
  Object.defineProperty(process, 'platform', { value: 'win32' });
  const { client, manager } = setup();
  manager.sendCommand.mockResolvedValue({
    supported: true,
    windows: [{ channelId: 'window:test' }],
  });
  expect(await client.getWindows()).toMatchObject({ supported: true });
  await client.switchWindow({ channelId: 'window:test' });
  await client.setWindowEnabled({ enabled: false });
  expect(manager.sendCommand.mock.calls.map(([command]) => command)).toEqual([
    'getWindows',
    'switchWindow',
    'setWindowEnabled',
  ]);
  await client.shutdown();
});

test.each(['audio', 'video'] as const)(
  'Windows live %s capture waits for delivery without optional capability fields',
  async type => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    const { client, manager } = setup({ sessionToken: 'live' });
    manager.capabilities = {} as typeof manager.capabilities;
    await client.startSession({
      sessionId: 'windows-live',
      channels: [
        { channelId: type === 'audio' ? 'mic:default' : 'display:1', type },
      ],
    });
    const closing = client.shutdown();
    await tick();
    expect(manager.stop).not.toHaveBeenCalled();
    manager.emit('processing-complete', {
      recordingId: 'win-local',
      sessionId: 'windows-live',
      result: { videoId: 'video' },
      fileRetained: false,
    });
    await closing;
    expect(manager.stop).toHaveBeenCalledTimes(1);
  }
);

test.each(['720p', '1080p'] as const)(
  'forwards %s for managed and live audio-only capture',
  async resolution => {
    const { client, manager } = setup({ sessionToken: 'live-token' });
    await client.startRecording({ ...start, resolution });
    expect(manager.sendCommand).toHaveBeenCalledWith(
      'startRecording',
      expect.objectContaining({ resolution }),
      310000
    );
    await client.stopRecording();
    manager.emit('processing-complete', complete);
    await client.startSession({
      sessionId: 'live',
      channels: [{ channelId: 'mic:default', type: 'audio' }],
      resolution,
    });
    expect(manager.sendCommand).toHaveBeenLastCalledWith(
      'startRecording',
      expect.objectContaining({ resolution, sessionId: 'live' }),
      310000
    );
    await client.stopSession();
    let finished = false;
    const shutdown = client.shutdown().then(() => {
      finished = true;
    });
    await tick();
    expect(finished).toBe(false);
    manager.emit('processing-complete', {
      recordingId: 'live-rec',
      sessionId: 'live',
      result: { videoId: 'live-video' },
      fileRetained: false,
    });
    await shutdown;
  }
);
test('forwards notice activation, clearing, unknown codes and active snapshot', async () => {
  const { client, manager } = setup();
  const listener = jest.fn();
  client.on('recording-notice', listener);
  const notice = {
    recordingId: 'r',
    code: 'MIC_SILENT',
    severity: 'warning',
    active: true,
    source: 'mic',
  };
  manager.emit('recording-notice', notice);
  manager.emit('recording-notice', { ...notice, active: false });
  manager.emit('recording-notice', { ...notice, code: 'FUTURE_CODE' });
  expect(
    listener.mock.calls.map(([event]) => [event.code, event.active])
  ).toEqual([
    ['MIC_SILENT', true],
    ['MIC_SILENT', false],
    ['FUTURE_CODE', true],
  ]);
  manager.sendCommand.mockResolvedValueOnce({ notices: [notice] });
  expect(await client.getNotices()).toEqual({ notices: [notice] });
  expect(manager.sendCommand).toHaveBeenLastCalledWith('getNotices');
  await client.shutdown();
});
test.each(['INSUFFICIENT_STORAGE', 'INVALID_RESOLUTION'])(
  'preserves %s and allows another start after rejection',
  async code => {
    const { client, manager } = setup();
    manager.sendCommand.mockRejectedValueOnce(
      new CaptureCommandError({ code, message: code })
    );
    await expect(client.startRecording(start)).rejects.toMatchObject({ code });
    expect(client.isCapturing).toBe(false);
    await client.startRecording(start);
    await client.shutdown({ waitForProcessing: false });
  }
);
