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
  'local-recording-ready': SessionRecordingReady | LocalRecordingResult;
  'recording-token-needed':
    | (RecordingIdentity & { stage?: LocalRecordingStage })
    | ManagedTokenRequest;
  'recording-token-error':
    | RecordingFailure
    | { recordingId: string; owner: string; error: string };
  'local-recording-failed': RecordingFailure | LocalRecordingFailure;
  'local-recording-started': Pick<LocalRecordingStarted, 'recordingId'>;
  'windows-available': AvailableWindows;
  'window-suspended': WindowEvent & { reason: string };
  'window-resumed': WindowEvent;
  'window-closed': WindowEvent & { reason: string };
  'window-switched': WindowEvent;
  'recording-relay-failed': RecordingFailure;
  'processing-progress': ManagedProcessingProgress;
  'processing-complete': ProcessingComplete | ManagedProcessingComplete;
  'recording-ready': ManagedRecordingReady;
  'recording-failed': ManagedRecordingFailure;
  'processing-failed': ManagedRecordingFailure;
  'recording-started': { sessionId: string } | { recordingId: string };
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
  sessionToken?: string;
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
  request: RecorderTokenRequest | (ManagedTokenRequest & { forceRefresh: true })
) => Promise<string | null>;
export interface RelayRecordingOptions {
  /** Required for managed deferred recordings. */
  owner?: string;
  recordingId: string;
  /** Fresh token issued for the user who owns this recording's session. */
  uploadToken: string;
}
export interface RelayRecordingResult {
  recordingId: string;
  status: 'accepted' | 'complete';
  result?: ProcessingResult | null;
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

/** Local UI metadata. Tokens are valid only for this recorder process. */
export interface CaptureWindow {
  channelId: string;
  token: string;
  title: string;
  appName: string;
  bundleId: string;
  width: number;
  height: number;
  isOnScreen: boolean;
}
export interface AvailableWindows {
  supported: boolean;
  supportsSwitchWindow: boolean;
  supportsDeferredWindow: boolean;
  supportsPlaceholder: boolean;
  supportsSetWindowEnabled: boolean;
  supportsAddWindowMidRecording: boolean;
  windows: CaptureWindow[];
}
export interface WindowEvent {
  sourceId: number;
  channel: string;
  channelId: string;
}
export interface SwitchWindowOptions {
  channelId: string;
  sourceChannelId?: string;
}
export interface SetWindowEnabledOptions {
  enabled: boolean;
  channelId?: string;
  sourceChannelId?: string;
}
export interface WindowEnabledResult {
  channelId: string;
  enabled: boolean;
  suspended: boolean;
}
export interface StartLocalRecordingOptions {
  /** Exactly one screen/display/window target, plus optional selected audio. No server storage. */
  channels: Array<Pick<RecordingChannelConfig, 'channelId' | 'type'>>;
}
export interface LocalRecordingStarted {
  recordingId: string;
  mode: 'deferred';
}
/** Standalone finalization is local success, not server ingestion. */
export interface LocalRecordingResult extends LocalRecordingStarted {
  status: 'ready';
  path: string;
  files: string[];
  durationSeconds: number;
  metadata: Record<string, unknown>;
  finalizedOnShutdown: boolean;
}
export interface LocalRecordingFailure {
  recordingId: string;
  error?: string;
  retained: boolean;
}
export interface SessionRecordingReady extends RecordingIdentity {
  path: string;
  metadata: Record<string, unknown>;
  source?: string;
  mode?: never;
}

/** Managed capture authorizes before capture and delivers automatically on stop. */
export interface StartRecordingOptions extends StartLocalRecordingOptions {
  owner: string;
  collectionId: string;
  uploadToken: string;
  name?: string;
  /** Resume an authorizing receipt after a lost reply; never resumes capture implicitly. */
  recordingId?: string;
}
export interface ManagedTokenRequest {
  recordingId: string;
  owner: string;
  collectionId: string;
  sessionId?: string | null;
  purpose: 'recording-delivery';
}
export interface ManagedProcessingComplete {
  recordingId: string;
  owner: string;
  result: ProcessingResult;
}
/** Delivery estimate; completion is signalled only by processing-complete. */
export interface ManagedProgress {
  /** Native estimate from 0 to 99 while processing. */
  percent: number;
  /** Null when no reliable estimate is available. */
  etaSeconds: number | null;
}
export interface ManagedProcessingProgress extends ManagedProgress {
  recordingId: string;
  owner: string;
}
export interface ManagedRecordingReady {
  partial: boolean;
  partialReason: string | null;
  recordingId: string;
  owner: string;
  status: 'ready';
  durationSeconds: number;
  mode: 'deferred';
  finalizedOnShutdown: boolean;
}
export interface ManagedRecordingFailure {
  recordingId: string;
  owner?: string;
  errorCode: string;
  retryable?: boolean;
}
export interface ManagedRecording {
  partial: boolean;
  partialReason: string | null;
  /** Present while this recorder process has a delivery estimate. */
  progress?: ManagedProgress;
  recordingId: string;
  owner: string;
  name: string | null;
  stage:
    | 'authorizing'
    | 'recording'
    | 'finalizing'
    | 'ready'
    | 'uploaded'
    | 'processing'
    | 'needs_recovery'
    | 'reconciliation_required'
    | 'discarding'
    | 'complete'
    | 'failed'
    | 'discarded';
  createdAt: number;
  durationSeconds: number | null;
  result: ProcessingResult | null;
  errorCode: string | null;
  retryable: boolean;
}
export interface RecordingStopResult {
  recordingId: string;
  status: 'ready';
  durationSeconds: number;
}
export interface RecorderCapabilities {
  managedDeferredRecording: boolean;
}
