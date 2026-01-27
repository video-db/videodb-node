import { Connection } from '@/core/connection';
import { AuthenticationError } from '@/utils/error';
import { VIDEO_DB_API } from './constants';
import type { ConnectionConfig } from './types/capture';

/**
 * Entry function for the VideoDB SDK
 * Supports dual authentication modes:
 * - API key (backend mode): Full API access
 * - Session token (client mode): Limited access, backend handles auth
 *
 * @example
 * ```typescript
 * // Backend mode with API key
 * const conn = connect({ apiKey: process.env.VIDEO_DB_API_KEY });
 *
 * // Client mode with session token
 * const conn = connect({ sessionToken: token });
 *
 * // Legacy signature (still supported)
 * const conn = connect(apiKey, baseURL);
 * ```
 */
function connect(config: ConnectionConfig): Connection;
function connect(apiKey?: string, baseURL?: string): Connection;
function connect(
  configOrApiKey?: string | ConnectionConfig,
  baseURL: string = VIDEO_DB_API
): Connection {
  // Handle legacy signature: connect(apiKey, baseUrl)
  if (typeof configOrApiKey === 'string' || configOrApiKey === undefined) {
    const apiKey = configOrApiKey || process.env.VIDEO_DB_API_KEY;
    if (!apiKey) {
      throw new AuthenticationError(
        'No API key provided. Set an API key either as an environment variable (VIDEO_DB_API_KEY) or pass it as an argument.'
      );
    }
    return new Connection(baseURL, { apiKey });
  }

  // Handle new signature: connect({ apiKey?, sessionToken?, baseUrl? })
  const config = configOrApiKey;
  const url = config.baseUrl || VIDEO_DB_API;

  // If neither apiKey nor sessionToken provided, try env var fallback
  if (!config.apiKey && !config.sessionToken) {
    config.apiKey = process.env.VIDEO_DB_API_KEY;
  }

  if (!config.apiKey && !config.sessionToken) {
    throw new AuthenticationError(
      'No API key or session token provided. Set an API key as an environment variable (VIDEO_DB_API_KEY) or pass it in the config object.'
    );
  }

  return new Connection(url, {
    apiKey: config.apiKey,
    sessionToken: config.sessionToken,
  });
}

export { Collection } from './core/collection';
export { Timeline } from './core/timeline';
export { Video } from './core/video';
export { Audio } from './core/audio';
export { Image, Frame } from './core/image';
export { VideoAsset, AudioAsset, ImageAsset, TextAsset } from './core/asset';
export {
  SceneExtractionType,
  SearchTypeValues,
  IndexTypeValues,
  SubtitleStyle,
  VideoConfigClass,
  AudioConfigClass,
} from './core/config';
export {
  ImageAssetConfig,
  TextAssetConfig,
  VideoAssetConfig,
  AudioAssetConfig,
} from './types/config';
export { SubtitleAlignment, SubtitleBorderStyle } from './core/config';
export { Shot } from './core/shot';
export { Scene, SceneCollection } from './core/scene';
export {
  VideodbError,
  AuthenticationError,
  InvalidRequestError,
  CaptureError,
  BinaryError,
  PermissionError,
} from './utils/error';
export { SearchResult } from './core/search/searchResult';
export { Meeting } from './core/meeting';
export {
  RTStream,
  RTStreamSceneIndex,
  RTStreamSearchResult,
  RTStreamShot,
} from './core/rtstream';
export {
  WebSocketConnection,
  type WebSocketMessage,
  type WebSocketStreamFilter,
} from './core/websocket';
export {
  CaptureSession,
  type CaptureSessionBase,
  type RTStreamCategory,
} from './core/captureSession';
export { SceneIndex, type SceneData, type AlertData } from './core/sceneIndex';
export { SpokenIndex } from './core/spokenIndex';

// Capture session types
export {
  type ConnectionConfig,
  CaptureSessionStatus,
  ChannelType,
  PermissionKind,
  TranscriptStatusValues,
  WebSocketChannel,
  type CaptureSessionStatusType,
  type ChannelTypeValue,
  type PermissionKindType,
  type ChannelConfig,
  type CreateCaptureSessionConfig,
  type ListCaptureSessionsConfig,
  type StartCaptureSessionConfig,
  type TranscriptSegment as CaptureTranscriptSegment,
  type TranscriptStatus as CaptureTranscriptStatus,
  type StopTranscriptResult as CaptureStopTranscriptResult,
  type TranscriptStatusResult as CaptureTranscriptStatusResult,
  type BatchConfig,
  type IndexVisualsConfig,
  type IndexSpokenWordsConfig,
  type SceneIndexBase,
  type SpokenIndexBase,
  type WebSocketChannelType,
  type WebSocketStreamFilter as CaptureWebSocketStreamFilter,
  type SceneData as CaptureSceneData,
  type GetScenesResult,
  type AlertConfig,
  type AlertBase,
} from './types/capture';

// Editor module exports
export {
  // Enums
  AssetType,
  Fit,
  Position,
  Filter,
  TextAlignment,
  HorizontalAlignment,
  VerticalAlignment,
  CaptionBorderStyle,
  CaptionAlignment,
  CaptionAnimation,
  // Helper classes
  Offset,
  Crop,
  Transition,
  Font,
  Border,
  Shadow,
  Background,
  Alignment,
  FontStyling,
  BorderAndShadow,
  Positioning,
  // Asset classes
  EditorVideoAsset,
  EditorImageAsset,
  EditorAudioAsset,
  EditorTextAsset,
  CaptionAsset,
  // Timeline classes
  Clip,
  TrackItem,
  Track,
  EditorTimeline,
  // Config types
  type OffsetConfig,
  type CropConfig,
  type TransitionConfig,
  type FontConfig,
  type BorderConfig,
  type ShadowConfig,
  type BackgroundConfig,
  type AlignmentConfig,
  type FontStylingConfig,
  type BorderAndShadowConfig,
  type PositioningConfig,
  type EditorVideoAssetConfig,
  type EditorImageAssetConfig,
  type EditorAudioAssetConfig,
  type EditorTextAssetConfig,
  type CaptionAssetConfig,
  type ClipConfig,
  type AnyEditorAsset,
} from './core/editor';

export {
  MeetingStatus,
  Segmenter,
  SegmentationType,
  ReframeMode,
  ReframePreset,
  TranscodeMode,
  ResizeMode,
  MediaType,
  TextStyle,
  type TextStyleConfig,
} from './constants';

export { playStream } from './utils/index';
export { connect, Connection };
