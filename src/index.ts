import { Connection } from '@/core/connection';
import { AuthenticationError } from '@/utils/error';
import { VIDEO_DB_API } from './constants';

/**
 * Entry function for the VideoDB SDK
 * @param apiKey - Your personal API Key. If you don't have one, get one from our {@link https://console.videodb.io | Console}
 * @param baseURL - Server base URL. If you're not sure what this is, skip it. We'll default to our own baseURL
 * @returns A Connection instance that can be used to fetch any collection
 */
function connect(apiKey?: string, baseURL = VIDEO_DB_API) {
  apiKey = apiKey || process.env.VIDEO_DB_API_KEY;
  if (!apiKey) {
    throw new AuthenticationError(
      'No API key provided. Set an API key either as an environment variable (VIDEO_DB_API_KEY) or pass it as an argument.'
    );
  }
  return new Connection(baseURL, apiKey);
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
export { VideodbError } from './utils/error';
export { SearchResult } from './core/search/searchResult';
export { Meeting } from './core/meeting';
export { RTStream, RTStreamSceneIndex } from './core/rtstream';

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
  ReframeMode,
  TranscodeMode,
  ResizeMode,
  MediaType,
  TextStyle,
  type TextStyleConfig,
} from './constants';

export { playStream } from './utils/index';
export { connect, Connection };
