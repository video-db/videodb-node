# macOS standalone capture and window selection

Standalone capture records a local MP4 without a backend session, upload token, RTStreams, or RTSP publishers. It is separate from `startSession()` and server relay. The local MP4 stays on disk after success; it is not a job for `relayRecording()` or `waitForProcessing()`.

This branch selects artifact revision **0.3.3-window.1** for macOS arm64/x64. The tested native executable reports **0.3.3**; the artifact revision identifies the newer window-capable build. The original `v0.3.3` archives and Windows `0.3.1` selection are unchanged. Both installers check the selected archive URL/checksum marker, so an older installed file is not silently reused.

## Local recording

```js
const { CaptureClient } = require('videodb/capture');

async function record() {
  const client = new CaptureClient(); // No credentials required.
  client.on('error', event => console.error(event.type));
  client.on('local-recording-failed', () => console.error('Output retained; finalization failed'));

  const available = await client.getWindows();
  if (!available.supportsDeferredWindow) {
    await client.shutdown();
    throw new Error('Install the window-capable macOS recorder');
  }

  // Bloom renders its own picker using appName + title. Do not automatically
  // select the first window in a real app; use the user's explicit selection.
  const selected = await showYourWindowPicker(available.windows);
  if (!selected) { await client.shutdown(); return; }

  await client.startLocalRecording({
    channels: [
      { channelId: selected.channelId, type: 'video' },
      { channelId: 'mic:default', type: 'audio' },
      { channelId: 'system_audio:default', type: 'audio' },
    ],
  });

  // Later, when the user presses Stop:
  const result = await client.stopLocalRecording();
  console.log(result.files); // Finalized local MP4 paths, not cloud assets.
  await client.shutdown();
}
```

`showYourWindowPicker` is application UI supplied by Bloom. `getWindows()` returns the result directly, not `{result: ...}`. The list contains `channelId`, `token`, `title`, `appName`, `bundleId`, dimensions, and `isOnScreen`; no thumbnails. Keep window titles local. Tokens belong to the current recorder process: refresh the picker on opening and before starting, and discard old tokens after restart. Minimized/offscreen windows can still appear in the list.

Exactly one video source is required: `screen`, `display:<id>` from `listChannels()`, `window:<opaque-token>` from `getWindows()`, or `window:none`. Optional audio sources are `mic:default` and `system_audio:default`. Camera, audio-only, multiple-video and invalid targets are rejected. There is no fallback from a missing window to a display.

## Controls and events

```js
const available = await client.getWindows();
// Use another user-selected window from available.windows:
await client.switchWindow({ channelId: selected.channelId });
await client.setWindowEnabled({ enabled: false }); // Gray frames in the MP4.
await client.setWindowEnabled({ enabled: true });
await client.pauseTracks(['screen']); // Freezes the last image; NOT a privacy-off control.
await client.resumeTracks(['screen']);
```

Start with `window:none` for gray output until the user chooses a window. A recording started with a display cannot become a window source mid-recording. Switching preserves the output size/timeline and retains off/paused state. `setWindowEnabled({enabled: true, channelId})` can select a replacement when re-enabling. Audio continues during window off unless explicitly paused.

The SDK forwards `windows-available`, `window-switched`, `window-suspended`, `window-resumed`, and `window-closed`. Window state events contain `sourceId`, `channel`, and `channelId`; suspension/closure also includes `reason`. Native capability flags (`supported`, `supportsDeferredWindow`, `supportsSwitchWindow`, `supportsSetWindowEnabled`, `supportsPlaceholder`, `supportsAddWindowMidRecording`) should control which UI actions are offered.

Native command rejections are `CaptureCommandError` instances with a stable `.code`:

```js
try {
  await client.switchWindow({ channelId });
} catch (error) {
  if (error.code === 'TARGET_NOT_FOUND') {
    // Refresh getWindows() and ask the user to choose again.
  } else {
    throw error;
  }
}
```

## Lifecycle and compatibility

`stopLocalRecording()` resolves with the finalized `LocalRecordingResult`: `recordingId`, `mode: 'deferred'`, `status`, `path`, `files`, `durationSeconds`, `metadata`, and `finalizedOnShutdown`. It handles the ready event arriving before or after the stop reply. `shutdown()` finalizes an active standalone recording even with `waitForProcessing:false`, then waits for process exit. It never waits for server ingestion of a standalone file. Inspect retained output on failure; don't claim a failed MP4 is playable.

The existing `local-recording-ready` event is now a union: check `event.mode === 'deferred'` for local-only output; otherwise it is a session-backed event with `sessionId`. Local failure events may have no session ID. Start/stop/window/pause commands are serialized in the SDK; live and standalone recordings cannot overlap.

Session-backed capture remains available through `new CaptureClient({sessionToken, apiUrl, getRecorderToken})` and `startSession()`. It still requires a token and backend session and may use RTStreams. Use `connect({baseUrl})` on the backend and `CaptureClient({apiUrl})` for the recorder. `dev:true` selects a mock executable, not a development server. For a wholly offline client, omit the token provider; it will not adopt or relay unrelated retained server jobs during initialization.

## Tests and release limits

`npm test -- --runInBand` covers public commands, mode-specific lifecycle, event forwarding, target errors, races, old-binary rejection, and artifact selection. The opt-in `test/capture-offline.cjs --record` uses the recorder repository's compiled `Fixture.swift` and `Frames.swift` tools, supplied as `CAPTURE_FIXTURE_BIN` and `CAPTURE_FRAMES_BIN`. It captures controlled windows and five seconds of selected default audio, checks decoded frames and mixed audio, verifies no recorder network sockets with an unreachable API, and checks shutdown finalization. Reports go to the OS temporary directory.

The binary is ad-hoc signed, not notarized. Apple Silicon capture and Rosetta x64 IPC are testable here; physical Intel capture, older macOS, sleep/wake, permission-loss stress and live-server window exports remain separate acceptance gates. No Windows standalone/window support is enabled by this SDK update.
