// Compile-time coverage of the public managed.5 contract.
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
