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
 * await client.requestPermission('screen-capture');
 *
 * // List available channels (returns Channels object with mics, displays, systemAudio)
 * const channels = await client.listChannels();
 * console.log(channels.mics.default);     // Default microphone
 * console.log(channels.displays.default); // Default display
 *
 * // Pause/resume individual channels
 * await channels.mics.default?.pause();
 * await channels.mics.default?.resume();
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

export {
  Channel,
  AudioChannel,
  VideoChannel,
  ChannelList,
  Channels,
  createChannel,
  groupChannels,
  type ChannelClient,
} from './channel';

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
