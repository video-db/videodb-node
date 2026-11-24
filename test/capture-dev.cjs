// Opt-in live acceptance: captures screen/system audio/microphone and uploads to dev.
if (!process.argv.includes('--record') || !process.env.VIDEO_DB_API_KEY) {
  console.error(
    'Requires --record and VIDEO_DB_API_KEY. See docs/capture-local-recording.md.'
  );
  process.exit(1);
}
const root = require('node:path').resolve(__dirname, '..');
const { connect } = require(root + '/dist');
const { CaptureClient } = require(root + '/dist/capture');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const api = 'https://api.dev.videodb.io';
  const conn = connect({ apiKey: process.env.VIDEO_DB_API_KEY, baseUrl: api });
  const owner = 'sdk-refresh-' + randomUUID();
  const coll = await conn.getCollection();
  const session = await coll.createCaptureSession({ endUserId: owner });
  const initial = await conn.generateClientToken(3600, owner);
  const expired = await conn.generateClientToken(1, owner);
  console.log('STEP session and tokens created');
  const exp = Date.now() / 1000 + 1;
  let client = new CaptureClient({
    sessionToken: initial,
    apiUrl: api,
    restartOnError: false,
    getRecorderToken: async () => null,
  });
  let recording;
  let readyTimer;
  client.on('error', () => {});
  const failures = [];
  client.on('recording-token-error', () => failures.push('token-error'));
  client.on('local-recording-failed', () => failures.push('local-failure'));
  try {
    const channels = await client.listChannels();
    console.log('STEP channel discovery passed');
    const display = channels.displays.default,
      mic = channels.mics.default,
      system = channels.systemAudio.default;
    if (!display || !mic || !system) throw new Error('Missing channels');
    const ready = new Promise((resolve, reject) => {
      const timer = (readyTimer = setTimeout(
        () => reject(new Error('Finalization timeout')),
        180000
      ));
      client.on('local-recording-ready', event => {
        if (event.sessionId === session.id) {
          clearTimeout(timer);
          recording = event;
          resolve(event);
        }
      });
      client.on('local-recording-failed', () => {
        clearTimeout(timer);
        reject(new Error('Finalization failure'));
      });
    });
    // Attach immediately so a native failure cannot create an unhandled rejection.
    ready.catch(() => {});
    await client.startSession({
      sessionId: session.id,
      channels: [display, mic, system].map((c, i) => ({
        channelId: c.id,
        type: i === 0 ? 'video' : 'audio',
        store: false,
        isPrimary: i === 0,
      })),
    });
    console.log('STEP recording 5 seconds');
    await sleep(5000);
    await client.stopSession();
    await ready;
    await client.shutdown({ waitForProcessing: false });
    console.log('PASS finalized recording retained across explicit shutdown');
    await sleep(Math.max(0, exp * 1000 - Date.now() + 1500));
    let requests = 0;
    client = new CaptureClient({
      sessionToken: initial,
      apiUrl: api,
      restartOnError: false,
      getRecorderToken: async request => {
        if (request.sessionId !== session.id) return null;
        if (!request.forceRefresh)
          throw new Error('Expected fresh-token request');
        requests++;
        return requests === 1 ? expired : conn.generateClientToken(3600, owner);
      },
    });
    client.on('error', () => {});
    client.on('recording-token-error', () => failures.push('token-error'));
    const jobs = await client.listLocalRecordings();
    if (!jobs.some(j => j.recordingId === recording.recordingId))
      throw new Error('Recovery discovery missing job');
    console.log('PASS pending recording discovered after restart');
    const result = await client.waitForProcessing({
      recordingId: recording.recordingId,
      timeoutMs: 180000,
    });
    if (requests < 2) throw new Error('Expired token did not trigger refresh');
    if (failures.length) throw new Error('Unexpected lifecycle failure');
    await client.shutdown();
    const report = {
      sessionId: session.id,
      recordingId: recording.recordingId,
      tokenRequests: requests,
      expiredTokenRejected: true,
      processingComplete: result,
      apiUrl: api,
    };
    const reportPath = require('node:path').join(
      require('node:os').tmpdir(),
      'videodb-capture-' + randomUUID() + '.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), {
      mode: 0o600,
    });
    console.log('PASS report:', reportPath);
    console.log('PASS expired relay token triggered fresh same-user token');
    console.log(
      'PASS recovered recording uploaded and processed before shutdown'
    );
  } finally {
    clearTimeout(readyTimer);
    await client.shutdown({ waitForProcessing: false }).catch(() => {});
    await fetch(api + '/capture/session/' + session.id + '/stop', {
      method: 'POST',
      headers: {
        'x-access-token': process.env.VIDEO_DB_API_KEY,
        'Content-Type': 'application/json',
      },
      body: '{}',
    }).catch(() => {});
  }
})().catch(e => {
  console.log(
    'FAIL live SDK check:',
    e.constructor.name,
    e.message?.startsWith('Recorder command') ||
      [
        'sessionId is required',
        'A recording is already active',
        'CaptureClient is shutting down',
        'channels must include channelId for each channel',
        'Missing channels',
        'sessionToken is required for session-backed capture',
      ].includes(e.message)
      ? e.message
      : 'See test stage; credentials suppressed'
  );
  console.log(
    'FAIL location:',
    e.stack
      ?.split('\n')
      .filter(line => line.trim().startsWith('at '))
      .slice(0, 2)
      .join(' | ')
  );
  process.exitCode = 1;
});
