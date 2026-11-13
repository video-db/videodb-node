// Opt-in macOS SDK acceptance. Captures fixture windows and optional default audio.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, execFileSync, spawnSync } = require('node:child_process');
const { CaptureClient } = require('../dist/capture');
if (
  !process.argv.includes('--record') ||
  !process.env.CAPTURE_FIXTURE_BIN ||
  !process.env.CAPTURE_FRAMES_BIN
) {
  console.error(
    'Requires --record, CAPTURE_FIXTURE_BIN, and CAPTURE_FRAMES_BIN; see docs/capture-offline.md'
  );
  process.exit(1);
}
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'videodb-sdk-window-'));
const client = new CaptureClient({
  apiUrl: 'http://127.0.0.1:9',
  restartOnError: false,
});
const events = [],
  phases = [];
let fixture;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
for (const name of [
  'local-recording-ready',
  'local-recording-failed',
  'window-switched',
  'window-suspended',
  'window-resumed',
  'window-closed',
]) {
  client.on(name, payload => events.push({ name, payload }));
}
client.on('error', e => console.error('Recorder error:', e.type));
async function launch() {
  fs.writeFileSync(path.join(root, 'control'), 'restore');
  fixture = spawn(process.env.CAPTURE_FIXTURE_BIN, [root], { stdio: 'ignore' });
  for (let i = 0; i < 30; i++) {
    const list = await client.getWindows();
    assert.equal(list.supportsDeferredWindow, true);
    const a = list.windows.find(w => w.title === 'VideoDB Review A');
    const b = list.windows.find(w => w.title === 'VideoDB Review B');
    if (a && b) return { a, b };
    await sleep(500);
  }
  throw new Error('Fixture windows not available');
}
async function stopFixture() {
  if (!fixture || fixture.exitCode !== null) return;
  const exited = new Promise(resolve => fixture.once('exit', resolve));
  fixture.kill();
  await exited;
  fixture = undefined;
}
async function hold(name, expected, ms = 3000) {
  const start = Date.now() / 1000;
  await sleep(ms);
  phases.push({ name, expected, start, end: Date.now() / 1000 });
}
function decode(result, audio = 0, verifyPhases = false) {
  assert.equal(result.mode, 'deferred');
  assert.equal(result.metadata.complete, true);
  const decoded = JSON.parse(
    execFileSync(process.env.CAPTURE_FRAMES_BIN, [result.files[0]], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    })
  );
  assert.equal(decoded.videoTracks, 1);
  assert.equal(decoded.audioTracks, audio);
  assert.ok(decoded.frames.length > 0);
  if (audio) assert.ok(decoded.audioSamples > 0);
  assert.equal(
    new Set(decoded.frames.map(f => `${f.width}x${f.height}`)).size,
    1
  );
  for (let i = 1; i < decoded.frames.length; i++)
    assert.ok(decoded.frames[i].pts > decoded.frames[i - 1].pts);
  if (verifyPhases) {
    const origin = result.metadata.media_start_time_unix_ms / 1000;
    for (const phase of phases.filter(p => p.expected)) {
      const frames = decoded.frames.filter(
        f =>
          origin + f.pts > phase.start + 0.6 && origin + f.pts < phase.end - 0.2
      );
      assert.ok(frames.length, `No frames in ${phase.name}`);
      for (const f of frames) {
        const [r, g, b] = f.rgb;
        const matches =
          phase.expected === 'gray'
            ? Math.max(r, g, b) - Math.min(r, g, b) < 0.04 &&
              r > 0.35 &&
              r < 0.65
            : {
                red: r > g + 0.3 && r > b + 0.3,
                green: g > r + 0.3 && g > b + 0.3,
                blue: b > r + 0.3 && b > g + 0.3,
              }[phase.expected];
        assert.ok(matches, `${phase.name}: unexpected decoded pixels`);
      }
    }
  }
  return {
    recordingId: result.recordingId,
    files: result.files,
    frames: decoded.frames.length,
    audioTracks: decoded.audioTracks,
  };
}
(async () => {
  try {
    let windows = await launch();
    await assert.rejects(
      client.startLocalRecording({
        channels: [{ channelId: 'window:stale', type: 'video' }],
      })
    );
    await client.startLocalRecording({
      channels: [{ channelId: 'window:none', type: 'video' }],
    });
    await hold('placeholder', 'gray');
    await client.switchWindow({ channelId: windows.a.channelId });
    await hold('selected A', 'red');
    fs.writeFileSync(path.join(root, 'control'), 'cover');
    await hold('covered A', 'blue');
    await client.setWindowEnabled({ enabled: false });
    await hold('off', 'gray');
    await client.switchWindow({ channelId: windows.b.channelId });
    await hold('switch while off', 'gray');
    await client.setWindowEnabled({ enabled: true });
    await hold('on B', 'green');
    await client.pauseTracks(['screen']);
    await client.switchWindow({ channelId: windows.a.channelId });
    await hold('paused switch', null, 1000);
    await client.resumeTracks(['screen']);
    await hold('resume A', 'blue');
    fs.writeFileSync(path.join(root, 'control'), 'minimize');
    await hold('minimize settle', null, 4000);
    await hold('minimized', 'gray');
    fs.writeFileSync(path.join(root, 'control'), 'restore');
    await hold('restore settle', null, 2000);
    await hold('restored', 'blue');
    await stopFixture();
    await hold('closed settle', null, 5000);
    await hold('closed', 'gray');
    windows = await launch();
    await client.switchWindow({ channelId: windows.b.channelId });
    await hold('replacement', 'green');
    // Inspect sockets only in this opt-in acceptance test; production consumers use public APIs.
    const sockets = spawnSync(
      'lsof',
      ['-nP', '-a', '-p', String(client.binaryManager.process.pid), '-i'],
      { encoding: 'utf8' }
    );
    assert.equal(
      sockets.stdout.trim(),
      '',
      'Offline binary opened network sockets'
    );
    const windowResult = decode(await client.stopLocalRecording(), 0, true);
    console.log(
      'PASS SDK window selection, off/on, pause, minimize/restore, app exit/replacement, MP4 pixels and no sockets'
    );
    await client.startLocalRecording({
      channels: [
        { channelId: windows.a.channelId, type: 'video' },
        { channelId: 'system_audio:default', type: 'audio' },
        { channelId: 'mic:default', type: 'audio' },
      ],
    });
    await sleep(5000);
    const audioResult = decode(await client.stopLocalRecording(), 1);
    console.log('PASS SDK selected audio yields one decodable mixed track');
    const final = await client.startLocalRecording({
      channels: [{ channelId: 'window:none', type: 'video' }],
    });
    await sleep(2500);
    await client.shutdown();
    const finalized = events.find(
      e =>
        e.name === 'local-recording-ready' &&
        e.payload.recordingId === final.recordingId
    );
    assert.ok(finalized);
    decode(finalized.payload);
    const report = {
      windowResult,
      audioResult,
      shutdownFinalized: true,
      noNetworkSockets: true,
      phases,
      events,
    };
    fs.writeFileSync(
      path.join(root, 'report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log(
      'PASS SDK shutdown waits for local finalization; report:',
      path.join(root, 'report.json')
    );
  } finally {
    await client.shutdown({ waitForProcessing: false }).catch(() => {});
    await stopFixture();
  }
})().catch(error => {
  console.error('FAIL', error.message);
  process.exitCode = 1;
});
