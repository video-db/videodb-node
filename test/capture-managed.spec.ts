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
test('live and managed starts cannot overlap; native discard refusal is preserved', async () => {
  const { client, manager } = setup({ sessionToken: 'live' });
  await client.startRecording(start);
  await expect(
    client.startSession({ sessionId: 'live', channels: start.channels })
  ).rejects.toThrow('already active');
  await expect(client.stopSession()).rejects.toThrow('stopRecording');
  manager.sendCommand.mockRejectedValue(
    new CaptureCommandError({ code: 'DISCARD_REJECTED' })
  );
  await expect(
    client.discardRecording({ recordingId: 'rec-one', owner: 'alice' })
  ).rejects.toMatchObject({ code: 'DISCARD_REJECTED' });
});

test('backend recorder token request binds collection and returns resolved identity', async () => {
  const { connect } = await import('../src');
  const conn = connect({
    apiKey: 'fixture',
    baseUrl: 'https://api.dev.videodb.io',
  });
  const http = (conn as unknown as { vhttp: { post: jest.Mock } }).vhttp;
  const post = jest
    .spyOn(http, 'post')
    .mockResolvedValue({
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
