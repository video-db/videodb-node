/**
 * Capture Session and Channel type definitions
 */

/**
 * Connection configuration for dual authentication modes
 */
export interface ConnectionConfig {
  /** API key for backend mode - full API access */
  apiKey?: string;
  /** Session token for client mode - backend handles auth */
  sessionToken?: string;
  /** Base URL for the API (optional, defaults to https://api.videodb.io) */
  baseUrl?: string;
}

/**
 * CaptureSession status values
 */
export const CaptureSessionStatus = {
  created: 'created',
  starting: 'starting',
  active: 'active',
  stopped: 'stopped',
  exported: 'exported',
  failed: 'failed',
} as const;

export type CaptureSessionStatusType =
  (typeof CaptureSessionStatus)[keyof typeof CaptureSessionStatus];

/**
 * Channel type values
 */
export const ChannelType = {
  audio: 'audio',
  video: 'video',
} as const;

export type ChannelTypeValue = (typeof ChannelType)[keyof typeof ChannelType];

/**
 * Permission kinds for native binary
 */
export const PermissionKind = {
  microphone: 'microphone',
  screenCapture: 'screen_capture',
  accessibility: 'accessibility',
} as const;

export type PermissionKindType =
  (typeof PermissionKind)[keyof typeof PermissionKind];

/**
 * Channel configuration for starting capture sessions
 *
 * Available channel IDs (v1 scope):
 * - mic:default (audio)
 * - system_audio:default (audio)
 * - display:1, display:2, ... (video)
 */
export interface ChannelConfig {
  /** Channel identifier (e.g., 'mic:default', 'system_audio:default', 'display:1') */
  channelId: string;
  /** Type of the channel */
  type: ChannelTypeValue;
  /** Whether to record this channel */
  record?: boolean;
  /** Whether to enable transcription for this channel (audio only) */
  transcript?: boolean;
  /** Whether to store the recorded content */
  store?: boolean;
}

/**
 * Configuration for creating a capture session
 */
export interface CreateCaptureSessionConfig {
  /** End user identifier (prefer non-PII or hashed) */
  endUserId: string;
  /** Callback URL for capture session lifecycle notifications */
  callbackUrl?: string;
  /** WebSocket connection ID for real-time status updates */
  wsConnectionId?: string;
  /** Optional metadata passthrough */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for listing capture sessions
 */
export interface ListCaptureSessionsConfig {
  /** Filter by status */
  status?: string;
  /** Filter by end user ID */
  endUserId?: string;
  /** Maximum number of sessions to return */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string;
}

/**
 * Configuration for starting a capture session (client-side)
 * Matches API: POST /capture/session/start
 */
export interface StartCaptureSessionConfig {
  /** Session ID from CaptureSession.id */
  sessionId: string;
  /** Channels to capture */
  channels: ChannelConfig[];
}

/**
 * Transcript segment data
 */
export interface TranscriptSegment {
  /** Start time in milliseconds */
  startMs: number;
  /** End time in milliseconds */
  endMs: number;
  /** Transcript text */
  text: string;
  /** Whether this is a final transcript */
  isFinal?: boolean;
  /** Speaker identifier */
  speaker?: string;
  /** Confidence score */
  confidence?: number;
}

/**
 * Transcript status values
 */
export const TranscriptStatusValues = {
  inactive: 'inactive',
  active: 'active',
  stopping: 'stopping',
  stopped: 'stopped',
} as const;

export type TranscriptStatus =
  (typeof TranscriptStatusValues)[keyof typeof TranscriptStatusValues];

/**
 * Result from stopping transcript
 */
export interface StopTranscriptResult {
  /** Current status after stop request */
  status: TranscriptStatus;
  /** If stopping was blocked, the ID of what blocked it */
  blockedBy?: string;
}

/**
 * Transcript status response
 */
export interface TranscriptStatusResult {
  /** Current transcript status */
  status: TranscriptStatus;
  /** Socket ID if transcript is active */
  socketId?: string;
  /** ID of what blocked stopping, if applicable */
  blockedBy?: string;
  /** Whether stop has been requested */
  stopRequested?: boolean;
}

/**
 * Batch configuration for indexing
 */
export interface BatchConfig {
  /** Batch type: 'time', 'word', 'sentence', or 'shot' */
  type: 'time' | 'word' | 'sentence' | 'shot';
  /** Batch value (seconds for time, count for word/sentence) */
  value: number;
  /** Number of frames to extract (for visual indexing) */
  frameCount?: number;
}

/**
 * Configuration for visual indexing (scene indexing)
 */
export interface IndexVisualsConfig {
  /** Batch configuration */
  batchConfig: BatchConfig;
  /** Prompt for scene description */
  prompt?: string;
  /** Socket ID for real-time updates */
  socketId?: string;
  /** Model name for scene analysis */
  modelName?: string;
  /** Model configuration */
  modelConfig?: Record<string, unknown>;
  /** Name for the scene index */
  name?: string;
}

/**
 * Configuration for spoken word indexing
 */
export interface IndexSpokenWordsConfig {
  /** Batch configuration */
  batchConfig: BatchConfig;
  /** Prompt for spoken word analysis */
  prompt?: string;
  /** Socket ID for real-time updates */
  socketId?: string;
  /** Whether to auto-start transcript if not running (default: true) */
  autoStartTranscript?: boolean;
  /** Model name for analysis */
  modelName?: string;
  /** Model configuration */
  modelConfig?: Record<string, unknown>;
  /** Name for the spoken index */
  name?: string;
}

/**
 * Base scene index data from API
 */
export interface SceneIndexBase {
  id: string;
  rtstreamId: string;
  status?: string;
  name?: string;
  batchConfig?: BatchConfig;
  prompt?: string;
}

/**
 * Base spoken index data from API
 */
export interface SpokenIndexBase {
  id: string;
  rtstreamId: string;
  status?: string;
  name?: string;
  prompt?: string;
  batchConfig?: BatchConfig;
}

/**
 * WebSocket channel types for filtering
 */
export const WebSocketChannel = {
  transcript: 'transcript',
  sceneIndex: 'scene_index',
  spokenIndex: 'spoken_index',
  captureSession: 'capture_session',
  alert: 'alert',
} as const;

export type WebSocketChannelType =
  (typeof WebSocketChannel)[keyof typeof WebSocketChannel];

/**
 * Filter configuration for WebSocket stream
 */
export interface WebSocketStreamFilter {
  /** Channel type to filter */
  channel?: WebSocketChannelType;
  /** Specific ID to filter (e.g., rtstream ID, index ID) */
  id?: string;
}

/**
 * Generate session token configuration
 */
export interface GenerateSessionTokenConfig {
  /** Token expiration time in seconds (default: 600) */
  expiresIn?: number;
}

/**
 * Scene data from scene index
 */
export interface SceneData {
  id: string;
  start: number;
  end: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Result from getScenes
 */
export interface GetScenesResult {
  scenes: SceneData[];
  nextPage: boolean;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  /** Event ID to trigger the alert */
  eventId: string;
  /** Callback URL for alert notifications */
  callbackUrl: string;
}

/**
 * Alert data from API
 */
export interface AlertBase {
  id: string;
  eventId: string;
  callbackUrl: string;
  status?: string;
}
