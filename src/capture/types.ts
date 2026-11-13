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
  /** Per-platform overrides; other platforms continue to use version. */
  platformVersions?: Record<string, string>;
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
 * Binary channel from native capture
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
  /** Whether to store the recording */
  store?: boolean;
  /** Whether this is the primary video channel */
  isPrimary?: boolean;
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
  'local-recording-ready': RecordingIdentity & {
    path: string;
    metadata: Record<string, unknown>;
    source?: string;
  };
  'recording-token-needed': RecordingIdentity & { stage?: LocalRecordingStage };
  'recording-token-error': RecordingFailure;
  'local-recording-failed': RecordingFailure;
  'recording-relay-failed': RecordingFailure;
  'processing-complete': ProcessingComplete;
  'recording-started': { sessionId: string };
  'recording-complete': { sessionId: string };

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
  /** Request fresh tokens automatically for native recording-token-needed events. */
  getRecorderToken?: RecorderTokenProvider;
  /** Maximum automatic token requests per recording (default 3). */
  maxTokenRefreshAttempts?: number;
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

/** Identity supplied by the recorder; use sessionId to authorize the owning user. */
export interface RecordingIdentity {
  recordingId: string;
  sessionId: string;
}
export type LocalRecordingStage =
  | 'recording'
  | 'finalizing'
  | 'awaiting_token'
  | 'uploading'
  | 'uploaded'
  | 'processing'
  | 'complete'
  | 'failed';
export interface ProcessingResult {
  videoId: string;
  playerUrl?: string | null;
  streamUrl?: string | null;
  indexStatus?: string | null;
}
export interface LocalRecording extends RecordingIdentity {
  stage: LocalRecordingStage;
  path: string;
  metadata: Record<string, unknown> | null;
  error: string | null;
  result: ProcessingResult | null;
}
export interface ProcessingComplete extends RecordingIdentity {
  result: ProcessingResult;
  fileRetained: boolean;
}
export interface RecordingFailure extends RecordingIdentity {
  error: string;
  retryable?: boolean;
  fileRetained?: boolean;
  retained?: boolean;
}
export interface RecorderTokenRequest extends RecordingIdentity {
  stage?: LocalRecordingStage;
  /** Always true: bypass host token caches and issue a new same-user token. */
  forceRefresh: true;
}
/** Return null to leave an unrelated retained recording untouched. */
export type RecorderTokenProvider = (
  request: RecorderTokenRequest
) => Promise<string | null>;
export interface RelayRecordingOptions {
  recordingId: string;
  /** Fresh token issued for the user who owns this recording's session. */
  uploadToken: string;
}
export interface RelayRecordingResult {
  recordingId: string;
  status: 'accepted';
}
export type WaitForProcessingOptions = (
  | { recordingId: string; sessionId?: never }
  | { sessionId: string; recordingId?: never }
) & { timeoutMs?: number };
export interface CaptureShutdownOptions {
  /** Default true. False suspends pending work for explicit recovery later. */
  waitForProcessing?: boolean;
  /** Processing wait budget, default 15 minutes. On timeout the binary stays running. */
  timeoutMs?: number;
}
