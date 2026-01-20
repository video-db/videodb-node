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
 * // List available channels (returns mic:default, system_audio:default, display:1, etc.)
 * const channels = await client.listChannels();
 * console.log(channels);
 *
 * // Start capture session (sessionId from backend CaptureSession)
 * await client.startCaptureSession({
 *   sessionId: 'ss-xxx', // Required: from CaptureSession.id
 *   channels: [
 *     { channelId: 'mic:default', type: 'audio', record: true, transcript: true },
 *     { channelId: 'display:1', type: 'video', record: true },
 *   ],
 * });
 *
 * // Listen for events
 * client.on('transcript', (data) => {
 *   console.log('Transcript:', data.text);
 * });
 *
 * // Stop capture
 * await client.stopCaptureSession();
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
  type StartCaptureSessionClientConfig,
  type CaptureClientOptions,
  type TrackTypeValue,
} from './types';
