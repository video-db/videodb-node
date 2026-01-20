/**
 * Capture and Channel type definitions
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
 * Capture status values (matches spec: created|starting|active|stopped|exported|failed)
 */
export const CaptureStatus = {
  created: 'created',
  starting: 'starting',
  active: 'active',
  stopped: 'stopped',
  exported: 'exported',
  failed: 'failed',
} as const;

export type CaptureStatusType = (typeof CaptureStatus)[keyof typeof CaptureStatus];

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

export type PermissionKindType = (typeof PermissionKind)[keyof typeof PermissionKind];

/**
 * Channel configuration for creating captures
 */
export interface ChannelConfig {
  /** Unique identifier for the channel (e.g., 'mic:default', 'display:1') */
  channelId: string;
  /** Type of the channel */
  type: ChannelTypeValue;
  /** Whether to record this channel */
  record?: boolean;
  /** Whether to enable transcription for this channel */
  transcript?: boolean;
  /** Whether to store the recorded content */
  store?: boolean;
}

/**
 * Base channel data from API
 */
export interface ChannelBase {
  channelId: string;
  type: ChannelTypeValue;
  rtstreamId?: string;
  status?: string;
}

/**
 * Base capture data from API
 */
export interface CaptureBase {
  id: string;
  status?: CaptureStatusType;
  clientSessionId?: string;
  endUserId?: string;
  collectionId?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  exportedVideoId?: string;
  channels?: ChannelBase[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Configuration for creating a capture
 */
export interface CreateCaptureConfig {
  /** End user identifier */
  endUserId: string;
  /** Client-provided session identifier */
  clientSessionId: string;
  /** Collection ID to store the capture (default: 'default') */
  collectionId?: string;
  /** Callback URL for capture completion notification */
  callbackUrl?: string;
  /** Optional metadata passthrough */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for listing captures
 */
export interface ListCapturesConfig {
  /** Filter by collection ID */
  collectionId?: string;
  /** Filter by end user ID */
  endUserId?: string;
  /** Filter by status */
  status?: CaptureStatusType;
  /** Maximum number of captures to return */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string;
}

/**
 * Configuration for starting a capture
 */
export interface StartCaptureConfig {
  /** Channels to capture */
  channels: ChannelConfig[];
  /** Primary video channel ID for the capture */
  primaryVideoChannelId?: string;
  /** WebSocket connection ID for real-time events */
  wssConnectionId?: string;
}

/**
 * Transcript segment data
 */
export interface TranscriptSegment {
  /** Start time in milliseconds */
  start: number;
  /** End time in milliseconds */
  end: number;
  /** Transcript text */
  text: string;
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
 * Configuration for scene indexing
 */
export interface SceneIndexConfig {
  /** Type of scene extraction */
  extractionType?: string;
  /** Extraction configuration */
  extractionConfig?: Record<string, unknown>;
  /** Prompt for scene description */
  prompt?: string;
  /** Model name for scene analysis */
  modelName?: string;
  /** Model configuration */
  modelConfig?: Record<string, unknown>;
  /** Name for the scene index */
  name?: string;
  /** Socket ID for real-time updates */
  socketId?: string;
}

/**
 * Configuration for spoken word indexing
 */
export interface SpokenIndexConfig {
  /** Prompt for spoken word analysis */
  prompt?: string;
  /** Segmenter type (time, word, sentence) */
  segmenter?: string;
  /** Segment length */
  length?: number;
  /** Model name for analysis */
  modelName?: string;
  /** Model configuration */
  modelConfig?: Record<string, unknown>;
  /** Name for the spoken index */
  name?: string;
  /** Socket ID for real-time updates */
  socketId?: string;
  /** Whether to auto-start transcript if not running */
  autoStartTranscript?: boolean;
}

/**
 * Base scene index data from API
 */
export interface SceneIndexBase {
  id: string;
  rtstreamId: string;
  status?: string;
  name?: string;
  extractionType?: string;
  extractionConfig?: Record<string, unknown>;
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
  segmenter?: string;
}

/**
 * WebSocket channel types for filtering
 */
export const WebSocketChannel = {
  transcript: 'transcript',
  sceneIndex: 'scene_index',
  spokenIndex: 'spoken_index',
  capture: 'capture',
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
