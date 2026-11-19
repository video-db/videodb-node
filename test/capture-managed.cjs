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
const screenOnly = process.argv.includes('--screen-only');
const audioOnly = process.argv.includes('--audio-only');
assert.ok(!(audioOnly && screenOnly), 'Choose audio-only or screen-only');
assert.ok(!(withMic && screenOnly), 'Choose --with-mic or --screen-only');
const progress = [];
const readyEvents = [];
let completionSeen = false;
function observe(c) {
  c.on('processing-progress', event => {
    progress.push({ event, afterCompletion: completionSeen });
  });
  c.on('recording-ready', event => readyEvents.push(event));
  c.on('processing-complete', event => {
    if (event.recordingId === recordingId) completionSeen = true;
  });
}
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
  observe(client);
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
      ...(audioOnly ? [] : [{ channelId: 'window:none', type: 'video' }]),
      ...(screenOnly
        ? []
        : [{ channelId: 'system_audio:default', type: 'audio' }]),
      ...(withMic || audioOnly
        ? [{ channelId: 'mic:default', type: 'audio' }]
        : []),
    ],
  });
  recordingId = started.recordingId;
  privacy(started);
  console.log(
    'STEP recording ' +
      (screenOnly
        ? 'screen only'
        : withMic || audioOnly
          ? 'microphone + system audio'
          : 'system audio') +
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
  const readyEvent = readyEvents.find(
    event => event.recordingId === recordingId
  );
  assert.ok(readyEvent);
  privacy(readyEvent);
  assert.equal(readyEvent.partial, false);
  assert.equal(readyEvent.partialReason, null);
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
  observe(client);
  const jobs = await client.listRecordings({ owner });
  privacy(jobs);
  const job = jobs.find(r => r.recordingId === recordingId);
  assert.ok(job);
  assert.equal(job.partial, false);
  assert.equal(job.partialReason, null);
  // Listing alone adopts the retained job and triggers a fresh-token request.
  const done = await client.waitForProcessing({
    recordingId,
    timeoutMs: 240000,
  });
  privacy(done);
  assert.ok(done.result.videoId);
  console.log('STEP fresh-token requests after recovery:', requests);
  assert.equal(requests, 1);
  const seen = progress.filter(
    sample => sample.event.recordingId === recordingId
  );
  assert.ok(seen.length > 0, 'No SDK processing-progress events received');
  for (let i = 0; i < seen.length; i++) {
    const { event, afterCompletion } = seen[i];
    privacy(event);
    assert.deepEqual(Object.keys(event).sort(), [
      'etaSeconds',
      'owner',
      'percent',
      'recordingId',
    ]);
    assert.equal(event.owner, owner);
    assert.equal(afterCompletion, false);
    assert.ok(
      Number.isInteger(event.percent) &&
        event.percent >= 0 &&
        event.percent <= 99
    );
    assert.ok(
      event.etaSeconds === null ||
        (Number.isInteger(event.etaSeconds) && event.etaSeconds >= 0)
    );
  }
  console.log(
    'PASS SDK progress events, nullable ETA, partial fields and completion ordering'
  );
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
    audio: screenOnly ? 'none' : withMic || audioOnly ? 'both' : 'system',
    audioOnly,
    progressEvents: seen.length,
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
    console.log(
      'FAIL location:',
      String(e.stack)
        .split('\n')
        .filter(line => line.includes('capture-managed.cjs:'))
        .join(' ')
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await client?.shutdown({ waitForProcessing: false }).catch(() => {});
  });
