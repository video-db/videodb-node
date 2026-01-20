/**
 * VideoDB Recorder Module
 *
 * This module provides client-side recording capabilities using a native binary.
 * It supports capturing audio (microphone, system audio) and video (screen capture).
 *
 * @example
 * ```typescript
 * import { CaptureClient } from 'videodb/capture';
 *
 * const client = new CaptureClient({ sessionToken: token });
 *
 * // Request permissions
 * await client.requestPermission('microphone');
 * await client.requestPermission('screen_capture');
 *
 * // List available channels
 * const channels = await client.listChannels();
 * console.log(channels);
 *
 * // Start capture
 * await client.startCapture({
 *   channels: [
 *     { channelId: 'mic:default', type: 'audio', record: true, transcript: true },
 *     { channelId: 'display:1', type: 'video', record: true, store: true },
 *   ],
 *   primaryVideoChannelId: 'display:1',
 *   wssConnectionId: ws.connectionId,
 * });
 *
 * // Listen for events
 * client.on('transcript', (data) => {
 *   console.log('Transcript:', data.text);
 * });
 *
 * // Stop capture
 * await client.stopCapture();
 *
 * // Cleanup
 * await client.shutdown();
 * ```
 */

// Main class
export { CaptureClient } from './captureClient';

// Utility classes
export { RecorderInstaller } from './installer';
export { BinaryManager } from './binaryManager';

// Types
export {
  // Constants
  PROTOCOL_PREFIX,
  MAX_AUTO_RESTARTS,
  ERROR_BUFFER_SIZE,
  HEALTH_CHECK_INTERVAL,
  HEALTH_CHECK_TIMEOUT,
  PermissionType,
  PermissionStatus,
  TrackType,
  // Type definitions
  type BinaryConfig,
  type PlatformInfo,
  type BinaryChannel,
  type RecordingChannelConfig,
  type PermissionTypeValue,
  type PermissionStatusValue,
  type BinaryCommand,
  type BinaryResponse,
  type BinaryEvent,
  type BinaryMessage,
  type CaptureClientEvents,
  type StartCaptureClientConfig,
  type CaptureClientOptions,
  type TrackTypeValue,
} from './types';
