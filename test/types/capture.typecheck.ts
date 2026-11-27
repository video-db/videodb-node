// Compile-time coverage of the public 0.3.4 contract.
import type {
  CaptureClient,
  ManagedProcessingProgress,
  ManagedRecording,
  ManagedRecordingReady,
} from '../../src/capture';
declare const client: CaptureClient;
client.on('processing-progress', event => {
  const typed: ManagedProcessingProgress = event;
  const eta: number | null = typed.etaSeconds;
  return eta;
});
client.on('recording-ready', event => {
  const typed: ManagedRecordingReady = event;
  const partial: boolean = typed.partial;
  const reason: string | null = typed.partialReason;
  return { partial, reason };
});
async function listing() {
  const records: ManagedRecording[] = await client.listRecordings({
    owner: 'fixture',
  });
  const eta: number | null | undefined = records[0].progress?.etaSeconds;
  return { eta, partial: records[0].partial, reason: records[0].partialReason };
}
// @ts-expect-error The native command was withdrawn; apps must not offer discard.
client.discardRecording({ recordingId: 'fixture', owner: 'fixture' });
void listing;

client.on('processing-failed', event => {
  const retrying: boolean | undefined = event.retrying;
  void retrying;
});
client.on('recording-relay-failed', event => {
  const retrying: boolean | undefined = event.retrying;
  void retrying;
});
void client.stopRecording({ timeoutMs: 600000 });

client.on('recording-notice', notice => {
  const active: boolean = notice.active;
  const severity: 'info' | 'warning' | 'critical' = notice.severity;
  return { active, severity };
});
void client.getNotices().then(({ notices }) => notices.map(n => n.code));
const resolution: import('../../src/capture').RecordingResolution = '1080p';
// @ts-expect-error Only 720p and 1080p are supported.
const invalidResolution: import('../../src/capture').RecordingResolution =
  '1440p';
void resolution;
void invalidResolution;
client.on('local-recording-ready', event => {
  if ('sessionId' in event) {
    const partial: boolean = event.partial;
    // @ts-expect-error Current live recording events expose no local path.
    event.path;
    // @ts-expect-error Current live recording events expose no media internals.
    event.metadata;
    return partial;
  }
});

async function interface036() {
  const caps = await client.getCapabilities();
  const instant: boolean | undefined = caps.instantStart;
  const notices: boolean | undefined = caps.recordingNotices;
  const heights: import('../../src/capture').RecordingResolution[] | undefined =
    caps.resolutions;
  const started: import('../../src/capture').CaptureSessionStarted =
    await client.startSession({
      sessionId: 'session',
      channels: [{ channelId: 'display:1', type: 'video' }],
    });
  const id: string | undefined = started.recordingId;
  await client.pauseTracks(['display:1', 'mic:default', 'screen']);
  await client.resumeTracks(['window:token', 'system_audio:default']);
  await client.startRecording({
    owner: 'owner',
    collectionId: 'collection',
    uploadToken: 'token',
    channels: [{ channelId: 'display:1', type: 'video' }],
    live: false,
  });
  const invalid: import('../../src/capture').StartRecordingOptions = {
    owner: 'owner',
    collectionId: 'collection',
    uploadToken: 'token',
    channels: [],
    // @ts-expect-error Managed recording cannot request live streams.
    live: true,
  };
  void invalid;
  return { instant, notices, heights, id };
}
void interface036;
