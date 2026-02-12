/**
 * Recorder module types for native binary communication
 */

/** Protocol prefix for binary communication */
export const PROTOCOL_PREFIX = 'videodb_recorder|';

/** Maximum auto-restart attempts */
export const MAX_AUTO_RESTARTS = 10;

/** Error buffer size for last N errors */
export const ERROR_BUFFER_SIZE = 100;

/** Health check interval in milliseconds */
export const HEALTH_CHECK_INTERVAL = 30000;

/** Health check timeout in milliseconds */
export const HEALTH_CHECK_TIMEOUT = 60000;

/**
 * Binary configuration from package.json
 */
export interface BinaryConfig {
  baseUrl: string;
  version: string;
  checksums: Record<string, string>;
}

/**
 * Platform information
 */
export interface PlatformInfo {
  platform: NodeJS.Platform;
  arch: string;
  platformKey: string;
}

/**
 * Binary channel from native recorder
 */
export interface BinaryChannel {
  /** Channel identifier (e.g., 'mic:default', 'display:1') */
  channelId: string;
  /** Channel type */
  type: 'audio' | 'video';
  /** Human-readable name */
  name: string;
  /** Whether this is the default device */
  isDefault?: boolean;
}

/**
 * Recording channel configuration
 */
export interface RecordingChannelConfig {
  /** Channel identifier */
  channelId: string;
  /** Channel type */
  type: 'audio' | 'video';
  /** Whether to record this channel */
  record?: boolean;
  /** Whether to enable transcription */
  transcript?: boolean;
  /** Whether to store the recording */
  store?: boolean;
}

/**
 * Permission types for native recording
 */
export const PermissionType = {
  microphone: 'microphone',
  screenCapture: 'screen-capture',
  accessibility: 'accessibility',
} as const;

export type PermissionTypeValue =
  (typeof PermissionType)[keyof typeof PermissionType];

/**
 * Permission status values
 */
export const PermissionStatus = {
  granted: 'granted',
  denied: 'denied',
  undetermined: 'undetermined',
  restricted: 'restricted',
} as const;

export type PermissionStatusValue =
  (typeof PermissionStatus)[keyof typeof PermissionStatus];

/**
 * Binary command structure
 */
export interface BinaryCommand {
  command: string;
  commandId: string;
  params: Record<string, unknown>;
}

/**
 * Binary response structure
 */
export interface BinaryResponse {
  type: 'response';
  commandId: string;
  status: 'success' | 'error';
  result?: unknown;
}

/**
 * Binary event structure
 */
export interface BinaryEvent {
  type: 'event';
  event: string;
  payload: Record<string, unknown>;
}

/**
 * Binary message type (response or event)
 */
export type BinaryMessage = BinaryResponse | BinaryEvent;

/**
 * CaptureClient event types
 */
export interface CaptureClientEvents {
  /** Recording started */
  'recording:started': { sessionId: string };
  /** Recording stopped */
  'recording:stopped': { sessionId: string };
  /** Recording error */
  'recording:error': { error: string; code?: string };
  /** Binary process error */
  error: { type: string; message: string };
  /** Binary process shutdown */
  shutdown: { code: number; signal?: string };
  /** Transcript data received */
  transcript: { text: string; timestamp: number; isFinal: boolean };
  /** Upload progress */
  'upload:progress': { channelId: string; progress: number };
  /** Upload complete */
  'upload:complete': { channelId: string; url: string };
}

/**
 * Start capture session configuration
 * Matches API: POST /capture/session/start
 */
export interface StartCaptureSessionClientConfig {
  /** Session ID from backend CaptureSession (required) */
  sessionId: string;
  /** Channels to capture */
  channels: RecordingChannelConfig[];
}

/**
 * CaptureClient constructor options
 */
export interface CaptureClientOptions {
  /** Session token for authentication */
  sessionToken: string;
  /** API URL for the VideoDB API (defaults to https://api.videodb.io) */
  apiUrl?: string;
  /** Whether to run in dev mode (uses mock binary) */
  dev?: boolean;
  /** Whether to auto-restart on error */
  restartOnError?: boolean;
}

/**
 * Track types that can be paused/resumed
 */
export const TrackType = {
  mic: 'mic',
  systemAudio: 'system_audio',
  screen: 'screen',
} as const;

export type TrackTypeValue = (typeof TrackType)[keyof typeof TrackType];
