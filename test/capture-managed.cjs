// Opt-in dev acceptance; use a trusted backend credential, never ship it in an app.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { connect } = require('../dist');
const { CaptureClient } = require('../dist/capture');
if (!process.argv.includes('--record') || !process.env.VIDEO_DB_API_KEY)
  throw new Error('Requires --record and VIDEO_DB_API_KEY');
const withMic = process.argv.includes('--with-mic');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const api = 'https://api.dev.videodb.io';
const owner = 'sdk-managed-' + randomUUID();
const conn = connect({ apiKey: process.env.VIDEO_DB_API_KEY, baseUrl: api });
let client, recordingId;
function privacy(value) {
  if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) {
      assert.ok(
        ![
          'path',
          'files',
          'metadata',
          'fileRetained',
          'retained',
          'upload_url',
          'upload_headers',
          'upload_fields',
        ].includes(k)
      );
      privacy(v);
    }
}
(async () => {
  const initial = await conn.generateRecorderToken({
    collectionId: 'default',
    userId: owner,
    expiresIn: 600,
  });
  const expired = await conn.generateRecorderToken({
    collectionId: initial.collectionId,
    userId: owner,
    expiresIn: 1,
  });
  client = new CaptureClient({ apiUrl: api, restartOnError: false });
  client.on('error', () => {});
  assert.equal((await client.getCapabilities()).managedDeferredRecording, true);
  await assert.rejects(
    client.startLocalRecording({
      channels: [{ channelId: 'window:none', type: 'video' }],
    })
  );
  console.log('PASS managed capability and tokenless rejection');
  const started = await client.startRecording({
    owner,
    collectionId: initial.collectionId,
    uploadToken: initial.token,
    channels: [
      { channelId: 'window:none', type: 'video' },
      { channelId: 'system_audio:default', type: 'audio' },
      ...(withMic ? [{ channelId: 'mic:default', type: 'audio' }] : []),
    ],
  });
  recordingId = started.recordingId;
  privacy(started);
  console.log(
    'STEP recording ' +
      (withMic ? 'microphone + system audio' : 'system audio') +
      ' for 5 seconds'
  );
  await sleep(5000);
  const tokenNeeded = new Promise(resolve =>
    client.on('recording-token-needed', e => {
      if (e.recordingId === recordingId) resolve(e);
    })
  );
  const stopStarted = performance.now();
  const ready = await client.stopRecording({ uploadToken: expired.token });
  const stopMs = performance.now() - stopStarted;
  assert.ok(stopMs < 30000, 'Short capture finalization exceeded 30 seconds');
  console.log('PASS stop/finalization in ' + Math.round(stopMs) + ' ms');
  privacy(ready);
  let timer;
  try {
    privacy(
      await Promise.race([
        tokenNeeded,
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(new Error('Refresh event timeout')),
            45000
          );
        }),
      ])
    );
  } finally {
    clearTimeout(timer);
  }
  assert.deepEqual(
    await client.listRecordings({ owner: 'unrelated-' + owner }),
    []
  );
  await client.shutdown({ waitForProcessing: false });
  console.log(
    'PASS expired authorization requests refresh; owner isolation; explicit suspension'
  );
  let requests = 0;
  client = new CaptureClient({
    apiUrl: api,
    restartOnError: false,
    getRecorderToken: async request => {
      assert.equal(request.owner, owner);
      assert.equal(request.collectionId, initial.collectionId);
      assert.equal(request.forceRefresh, true);
      requests++;
      return (
        await conn.generateRecorderToken({
          collectionId: request.collectionId,
          userId: owner,
          expiresIn: 600,
        })
      ).token;
    },
  });
  client.on('error', () => {});
  const jobs = await client.listRecordings({ owner });
  privacy(jobs);
  assert.ok(jobs.some(r => r.recordingId === recordingId));
  await client.relayRecording({
    recordingId,
    owner,
    uploadToken: expired.token,
  });
  const done = await client.waitForProcessing({
    recordingId,
    timeoutMs: 240000,
  });
  privacy(done);
  assert.ok(done.result.videoId);
  assert.equal(requests, 1);
  const fresh = await conn.generateRecorderToken({
    collectionId: initial.collectionId,
    userId: owner,
  });
  const duplicate = await client.relayRecording({
    recordingId,
    owner,
    uploadToken: fresh.token,
  });
  privacy(duplicate);
  assert.equal(duplicate.result.videoId, done.result.videoId);
  await client.shutdown();
  const report = {
    apiUrl: api,
    recordingId,
    tokenRequests: requests,
    audio: withMic ? 'both' : 'system',
    stopMs,
    processingComplete: done,
    passed: true,
  };
  const file = path.join(
    os.tmpdir(),
    'videodb-managed-' + randomUUID() + '.json'
  );
  fs.writeFileSync(file, JSON.stringify(report, null, 2), { mode: 0o600 });
  console.log(
    'PASS restart recovery, fresh token, upload, deduplication, payload privacy and completion before shutdown'
  );
  console.log('PASS report:', file);
})()
  .catch(e => {
    console.log('FAIL managed SDK acceptance:', e.code || e.constructor.name);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client?.shutdown({ waitForProcessing: false }).catch(() => {});
  });
