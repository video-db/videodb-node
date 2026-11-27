# Local recording, tokens, and recovery

Node `release-0.4.3` uses binary 0.3.6 on macOS, Windows and Linux for the live + local recording lifecycle through `videodb/capture`. For deferred recording without RTStreams, use the [migration guide](capture-offline.md).

- `listLocalRecordings(): Promise<LocalRecording[]>` returns durable jobs for the configured API environment, including their `recordingId`, `sessionId`, `stage`, duration, partial status, and result. It does not itself relay jobs. Initialization can emit token requests for retained jobs, invoking a configured provider.
- `relayRecording({ recordingId, uploadToken })` resolves with `{ recordingId, status: 'accepted' }`. Acceptance is not upload or ingestion completion.
- `waitForProcessing({ recordingId, timeoutMs })` (or `{ sessionId, timeoutMs }`) waits for `processing-complete`. It also handles completion that arrived before the call. Final failures, process exit, and timeout reject. Failures with `retrying: true` keep the wait open. The default timeout is 15 minutes. A session target is useful immediately after stop, before finalization supplies a recording ID.
- `shutdown()` stops active capture, waits for tracked local processing, then shuts down the process. On terminal processing failure/timeout it rejects and leaves the recorder running. Delayed retries remain available for recovery instead of blocking shutdown. `shutdown({ waitForProcessing: false })` explicitly suspends pending work for later recovery. Do not treat `stopSession()` or `recording-complete` as ingestion completion.

The client forwards `recording-notice`, `processing-progress`, `local-recording-ready`, `recording-token-needed`, `processing-complete`, `local-recording-failed`, and `recording-relay-failed`. It emits `recording-token-error` when automatic token acquisition/submission fails. Native `recording-started` and `recording-complete` also retain the SDK's `recording:started` / `recording:stopped` aliases.

## Fresh tokens

Supply `getRecorderToken` to handle native token requests automatically. Every invocation receives `{ recordingId, sessionId, forceRefresh: true }`. Issue a new token for the session's owning user; bypass any cached session token. `conn.generateClientToken(expiresIn, userId)` now supports that user identity without changing the existing one-argument signature.

The provider may return `null` for retained sessions the current user does not own. Never authorize a recording solely because it exists on disk: validate session ownership on the backend. The SDK does not persist tokens, rejects a repeated token for the same recording, and limits automatic submissions to three per recording (`maxTokenRefreshAttempts`). Provider exceptions are replaced by a credential-free error. After a failed automatic attempt, fix authorization and explicitly call `relayRecording` with a fresh token. A provider should have its own HTTP timeout.

Choose automatic relay through the provider or manual relay in a `recording-token-needed` listener. Do not do both for the same event.

## Minimal Node example (trusted backend/dev harness)

This example holds an API key and therefore belongs in a trusted Node process. A desktop app should replace token generation with an authenticated request to its backend, which verifies session ownership, bypasses caches, and issues a same-user token. Persist the session-to-user mapping in your backend for recovery after an app restart.

```js
const { connect } = require('videodb');
const { CaptureClient } = require('videodb/capture');

const apiUrl = 'https://api.dev.videodb.io';
const conn = connect({ apiKey: process.env.VIDEO_DB_API_KEY, baseUrl: apiUrl });
const userId = 'your-authenticated-user-id';
const collection = await conn.getCollection();
const session = await collection.createCaptureSession({ endUserId: userId });
const ownedSessions = new Set([session.id]); // Restore authorized IDs from your backend.

const client = new CaptureClient({
  apiUrl, // dev:true selects a mock binary, not the development API.
  sessionToken: await conn.generateClientToken(3600, userId),
  getRecorderToken: async ({ sessionId, forceRefresh }) => {
    if (!ownedSessions.has(sessionId)) return null;
    // forceRefresh is always true. Make a new request; never return a cached token.
    return conn.generateClientToken(3600, userId);
  },
});
client.on('error', event => console.error(event.type));
client.on('recording-token-error', event => console.error(event.error));
client.on('processing-complete', event => console.log(event.result.videoId));

const channels = await client.listChannels();
const display = channels.displays.default;
if (!display) throw new Error('No display available');
await client.startSession({
  sessionId: session.id,
  channels: [{ channelId: display.id, type: 'video', store: false, isPrimary: true }],
});
await new Promise(resolve => setTimeout(resolve, 5000));
await client.stopSession();
await client.waitForProcessing({ sessionId: session.id, timeoutMs: 900_000 });
await client.shutdown();
```

Run the body inside an async function in CommonJS. Recording requires the platform capture permissions. The example uses explicit `baseUrl` / `apiUrl` and never enables mock mode.

## Explicit recovery after restart

For manual recovery, create a client **without** a token provider. Restore the authorized session IDs from your backend first. `listLocalRecordings()` does not filter by user, so only resume jobs that backend authorization permits.

```js
const recovery = new CaptureClient({
  apiUrl,
  sessionToken: await conn.generateClientToken(3600, userId),
});
recovery.on('error', event => console.error(event.type));
// Also supply fresh tokens if authorization expires during the resumed upload.
recovery.on('recording-token-needed', event => {
  if (!ownedSessions.has(event.sessionId)) return;
  // This listener handles both startup recovery and subsequent expiry requests.
  void conn.generateClientToken(3600, userId)
    .then(uploadToken => recovery.relayRecording({
      recordingId: event.recordingId, uploadToken,
    }))
    .catch(() => console.error('Recovery token/relay failed; recording retained'));
});
const jobs = await recovery.listLocalRecordings();
for (const job of jobs) {
  if (!ownedSessions.has(job.sessionId)) continue;
  if (['recording', 'finalizing', 'failed', 'complete'].includes(job.stage)) continue;
  // Startup token-needed events above initiate relay; do not submit a duplicate here.
  await recovery.waitForProcessing({ recordingId: job.recordingId });
}
await recovery.shutdown({ waitForProcessing: false });
```

Alternatively, omit the listener and explicitly fetch a fresh token and call `relayRecording` for one selected finalized job; then await `waitForProcessing`. To handle expiry in that manual flow, install the listener before relay. Do not retry incomplete/failed media blindly. Successful ingestion keeps the completion journal but removes owned media; `fileRetained` reports whether cleanup succeeded.

## Verification

`npm test -- --runInBand` runs deterministic tests for token refresh, repeated-token rejection, retry limits, event ordering, recovery, shutdown waits, and command timeouts.

For an opt-in live macOS test, set `VIDEO_DB_API_KEY` to a development API key and run `npm run test:capture:dev`. This captures five seconds of screen, microphone, and system audio and uploads that new recording to `https://api.dev.videodb.io`. It explicitly suspends after finalization, restarts, discovers only its own job, submits a one-second token after expiry, and requires a second token request followed by ingestion completion. A sanitized report is written to the OS temporary directory. Permissions must already be granted. It never relays another user's retained jobs.

For managed deferred recording without RTStreams, see the [migration guide](capture-offline.md). Its owner-scoped history and events differ from the legacy live-session flow above.

## Python correspondence

Python `release-0-5-5` prepares the same capture 0.3.6 lifecycle. Its arguments use
snake_case and timeout seconds; native response and event payload keys remain
camelCase. Python keeps boolean `request_permission()` and async event envelopes;
Node keeps permission status strings and EventEmitter listeners. Use
`getPermissionStatus()` / `get_permission_status()` for precise permission state.
Set channel `store` explicitly when sharing configuration: existing Python Channel
objects default to false. Neither SDK release nor the 0.3.6 Python wheels have
been published as part of this preparation.
