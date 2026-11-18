# Deferred recording migration

SDK `0.5.3` on `release-0-5-3` selects macOS artifact `0.3.3-managed.4` (embedded native version `0.3.3`). This is a breaking change from `0.3.3-window.1`.

`startLocalRecording()` is rejected by the new artifact. Tokenless local-only recording and local file paths are no longer its supported contract. Use `startRecording({owner, collectionId, uploadToken, channels})`; it authorizes a deferred server session before capture, without creating RTStreams. Connectivity is required at start. Stop automatically queues delivery.

On your trusted backend, `connect({apiKey, baseUrl}).generateRecorderToken({collectionId, userId, expiresIn})` returns `{token, collectionId}`. Pass the resolved collection ID and token to the app. Keep API keys on the backend. Always mint a fresh token when the SDK provider requests `forceRefresh:true`.

```js
const {CaptureClient} = require('videodb/capture');
const client = new CaptureClient({
  apiUrl: 'https://api.dev.videodb.io',
  getRecorderToken: async ({owner, collectionId}) =>
    (await yourAuthenticatedBackend.getFreshRecorderToken({owner, collectionId})).token,
});
client.on('error', event => console.error(event.type));
client.on('recording-failed', event => showFailure(event.errorCode));
client.on('processing-failed', event => showFailure(event.errorCode));
client.on('recording-token-error', () => showAuthenticationRequired());
if (!(await client.getCapabilities()).managedDeferredRecording) throw new Error('Update recorder');
const {windows} = await client.getWindows();
const selected = await showYourWindowPicker(windows);
const authorization = await yourAuthenticatedBackend.getFreshRecorderToken({owner, collectionId});
const {recordingId} = await client.startRecording({
  owner, collectionId: authorization.collectionId, uploadToken: authorization.token,
  channels: [
    {channelId: selected.channelId, type: 'video'},
    {channelId: 'system_audio:default', type: 'audio'},
  ],
});
// Later, when the user stops:
await client.stopRecording(); // Readiness, not upload completion.
const {result} = await client.waitForProcessing({recordingId});
showVideo(result.videoId);
await client.shutdown();
```

Picker/backend/UI functions in the example are supplied by the host application. Window discovery returns metadata directly, without thumbnails; refresh tokens after a recorder restart. `switchWindow`, `setWindowEnabled`, pause/resume and window events retain their existing interfaces. Off produces gray video; pause freezes the last picture. `window:none` begins with gray video until selection.

After restart, `listRecordings({owner})` returns owner-scoped history without automatically relaying it. Resume ready/uploaded/processing jobs with `relayRecording({recordingId, owner, uploadToken})`, then `waitForProcessing({recordingId})`. For an `authorizing` receipt after a lost start reply, pass its `recordingId` to `startRecording` with the same owner/collection and fresh authorization. Never restart capture automatically. Inspect `errorCode`, `stage` and `retryable` before retrying failed/uncertain jobs. `discardRecording` has been removed: the native command was withdrawn. Remove discard controls from host applications.

Managed events are `recording-started`, `recording-ready`, `recording-failed`, `recording-token-needed`, `processing-progress`, `processing-complete`, and `processing-failed`. Managed results contain recording identity and video results, not local paths. They differ from legacy live-session events: discriminate using `owner` or `sessionId`. `listLocalRecordings()` remains the legacy live-session API.

Shutdown defaults to stopping active capture and waiting for delivery. `shutdown({waitForProcessing:false})` finalizes capture and suspends waiting for explicit recovery. Timeouts reject without claiming successful delivery.

`processing-progress` carries `{recordingId, owner, percent, etaSeconds}`. Percent is an estimate from 0–99; ETA is `number | null`. Neither 99% nor an expired ETA means success: wait for `processing-complete`. The SDK forwards native values without inventing stages, file details, or completion. `listRecordings()` may include `progress: {percent, etaSeconds}` while the current process is delivering a recording; it can be absent after restart until delivery resumes.

`recording-ready` and each recording-list entry include `partial: boolean` and `partialReason: string | null`. A recovered or interrupted recording can still be delivered successfully with `partial: true`; show that distinction in the UI. `recording-ready` has no progress snapshot. Completion payloads keep their existing shape; use readiness/history for partial status.

```js
client.on('processing-progress', ({recordingId, percent, etaSeconds}) => {
  updateProcessingIndicator(recordingId, percent, etaSeconds); // Host UI function.
});
client.on('recording-ready', ({recordingId, partial, partialReason}) => {
  if (partial) showPartialRecordingNotice(recordingId, partialReason);
});
```

Managed recording requires the deferred-session server routes currently verified on **dev**. Use `https://api.dev.videodb.io` explicitly; production readiness requires the corresponding server deployment. Publishing this SDK does not deploy server routes.

The reproduced microphone-stop deadlock is fixed in this artifact. Microphone plus system-audio capture is covered by the opt-in acceptance test.

**Release limitations:** USB/Bluetooth device switching and sleep/wake remain separate validation gates. The macOS binaries are ad-hoc signed, not notarized. Physical Intel and oldest-supported macOS capture remain unverified; x64 checks use Rosetta. Windows remains on its existing artifact and does not support these managed deferred APIs. Updating this SDK does not update Bloom's installed dependency automatically.

The opt-in dev acceptance test is `npm run test:capture:managed` with a backend-only `VIDEO_DB_API_KEY`. Pass `-- --with-mic` to include the microphone, or `-- --screen-only` to verify video without selected audio. Screen-only recording has a native silent audio track for ingestion. It uses explicit `baseUrl`/`apiUrl`, captures five seconds of selected audio, checks stop/finalization against a 30-second limit, checks progress events and partial fields, tests an expired token, restart recovery, fresh authorization, ingestion, repeated relay and payload privacy. The older `test:capture:offline` belongs to the previous tokenless artifact and is not an acceptance test for this release.
