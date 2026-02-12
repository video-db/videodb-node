import { SearchResult } from '@/core/search/searchResult';
import { Video } from '@/core/video';
import { Audio } from '@/core/audio';
import { Image } from '@/core/image';
import type { SearchType } from '@/types/search';
import type { FileUploadConfig, URLUploadConfig } from '@/types/collection';
import type { StreamableURL, Timeline, Transcript } from '@/types/video';
import { AudioAsset, VideoAsset } from '..';
import { IndexSceneConfig, SubtitleStyleProps } from '@/types/config';
import type { BatchConfig, CaptureSessionStatusType } from '@/types/capture';

/**
 * Base type for all collection objects
 */
export interface CollectionBase {
  id: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
}
/**
 * Collection class interface for reference
 */
export interface ICollection extends CollectionBase {
  getVideos: () => Promise<Video[]>;
  getVideo: (videoId: string) => Promise<Video>;
  deleteVideo: (videoId: string) => Promise<object>;
  uploadFile: (
    data: FileUploadConfig
  ) => Promise<Video | Audio | Image | undefined>;
  uploadURL: (
    data: URLUploadConfig
  ) => Promise<Video | Audio | Image | undefined>;
  // Note: search method signature is more complex in implementation to support RTStream namespace
  search: (query: string, searchType?: SearchType) => Promise<unknown>;
}

/**
 * Base type for all video objects
 */
export interface VideoBase {
  collectionId: string;
  id: string;
  length: string;
  name: string;
  description?: string;
  size: string;
  streamUrl: StreamableURL;
  userId: string;
  playerUrl: StreamableURL;
  thumbnail?: string;
}

/**
 * Video class interface for reference
 */
export interface IVideo extends Omit<VideoBase, 'thumbnail'> {
  thumbnail?: string;
  transcript?: Transcript;
  generateStream: (timeline: Timeline) => Promise<string>;
  play: () => string;
  getTranscript: (
    start?: number,
    end?: number,
    segmenter?: string,
    length?: number,
    force?: boolean
  ) => Promise<Transcript>;
  indexSpokenWords: (
    languageCode?: string,
    segmentationType?: string,
    force?: boolean,
    callbackUrl?: string
  ) => Promise<{ success: boolean; message?: string }>;
  indexScenes: (config: IndexSceneConfig) => Promise<string | undefined>;
  search: (query: string, searchType?: SearchType) => Promise<SearchResult>;
  generateThumbnail: (time?: number) => Promise<string | Image>;
  addSubtitle: (config: SubtitleStyleProps) => Promise<string>;
}

/**
 * Base type for all audio objects
 */
export interface AudioBase {
  collectionId: string;
  id: string;
  length: string;
  name: string;
  size: string;
  userId: string;
}

/**
 * Audio class interface for reference
 */
export interface IAudio extends AudioBase {}

/**
 * Base type for all Image objects
 */
export interface ImageBase {
  collectionId?: string;
  id: string;
  name?: string;
  url?: string;
}

export interface FrameBase {
  id: string;
  videoId: string;
  sceneId: string;
  frameTime: number;
  description: string;
  url: string;
}

/**
 * Image class interface for reference
 */
export interface IImage extends ImageBase {}

/**
 * Base type for all Shot objects
 */
export interface ShotBase {
  videoId: string;
  videoLength: number;
  videoTitle: string;
  start: number;
  end: number;
  text?: string;
  searchScore?: number;
  streamUrl?: StreamableURL;
  playerUrl?: StreamableURL;
  sceneIndexId?: string;
  sceneIndexName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Shot class interface for reference
 */
export interface IShot extends ShotBase {
  /**
   * Fetches the streaming Url of the shot
   * @returns An awaited streaming URL
   */
  generateStream: () => Promise<StreamableURL>;
}

/**
 * Search class interface for implementations of different
 * search types
 */
export interface Search<V, C> {
  searchInsideVideo: (data: V) => Promise<SearchResult>;
  searchInsideCollection: (data: C) => Promise<SearchResult>;
}

export interface ITimeline {
  timeline: Array<object>;
  streamUrl: string;
  playerUrl: string;
  addInline(asset: VideoAsset): void;
  addOverlay(start: number, asset: AudioAsset): void;
  generateStream(): Promise<string>;
}

/**
 * Base type for Meeting objects
 */
export interface MeetingBase {
  id: string;
  collectionId: string;
  botName?: string;
  meetingTitle?: string;
  meetingUrl?: string;
  status?: string;
  timeZone?: string;
  videoId?: string;
  speakerTimeline?: Record<string, unknown>;
}

/**
 * Base type for RTStream objects
 */
export interface RTStreamBase {
  id: string;
  /** Stable key for RTStream lookup (e.g., 'mic:default', 'display:1') */
  name?: string;
  collectionId?: string;
  createdAt?: string;
  sampleRate?: number;
  status?: string;
  /** Channel ID (may differ from name in some contexts) */
  channelId?: string;
  /** Media types this rtstream handles */
  mediaTypes?: string[];
}

/**
 * Base type for RTStreamSceneIndex objects (legacy)
 */
export interface RTStreamSceneIndexBase {
  rtstreamIndexId: string;
  rtstreamId: string;
  extractionType?: string;
  extractionConfig?: Record<string, unknown>;
  prompt?: string;
  name?: string;
  status?: string;
}

/**
 * Configuration for RTStream visual indexing
 */
export interface IndexVisualsConfig {
  /** Batch configuration */
  batchConfig: BatchConfig;
  /** Prompt for scene description */
  prompt?: string;
  /** Model name for scene analysis */
  modelName?: string;
  /** Model configuration */
  modelConfig?: Record<string, unknown>;
  /** Name for the scene index */
  name?: string;
  /** WebSocket connection ID for real-time delivery */
  socketId?: string;
}

/**
 * Base type for RTStreamShot objects
 */
export interface RTStreamShotBase {
  rtstreamId: string;
  rtstreamName?: string;
  start: number;
  end: number;
  text?: string;
  searchScore?: number;
  sceneIndexId?: string;
  sceneIndexName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for RTStream index spoken words
 */
export interface RTStreamIndexSpokenWordsConfig {
  /** Batch configuration */
  batchConfig: BatchConfig;
  /** Prompt for spoken word analysis */
  prompt?: string;
  /** Model name for analysis */
  modelName?: string;
  /** Model configuration */
  modelConfig?: Record<string, unknown>;
  /** Name for the spoken index */
  name?: string;
  /** WebSocket connection ID for real-time delivery */
  socketId?: string;
  /** Whether to auto-start transcript if not running (default: true) */
  autoStartTranscript?: boolean;
}

/**
 * Configuration for RTStream search
 */
export interface RTStreamSearchConfig {
  query: string;
  indexType?: string;
  indexId?: string;
  resultThreshold?: number;
  scoreThreshold?: number;
  dynamicScorePercentage?: number;
  filter?: Array<Record<string, unknown>>;
}

/**
 * Video configuration for transcoding
 */
export interface VideoConfig {
  resolution?: number;
  quality?: number;
  framerate?: number;
  aspectRatio?: string;
  resizeMode?: string;
}

/**
 * Audio configuration for transcoding
 */
export interface AudioConfig {
  mute?: boolean;
}

/**
 * Configuration for recording a meeting
 */
export interface RecordMeetingConfig {
  meetingUrl: string;
  botName?: string;
  botImageUrl?: string;
  meetingTitle?: string;
  callbackUrl?: string;
  callbackData?: Record<string, unknown>;
  timeZone?: string;
}

/**
 * Base type for CaptureSession objects
 */
export interface CaptureSessionBase {
  id: string;
  collectionId: string;
  status?: CaptureSessionStatusType;
  endUserId?: string;
  clientId?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  exportedVideoId?: string;
  createdAt?: number;
}

/**
 * RTStream category for filtering
 */
export type RTStreamCategory = 'mics' | 'displays' | 'system_audio' | 'cameras';

/**
 * CaptureSession interface for reference
 */
export interface ICaptureSession extends CaptureSessionBase {
  rtstreams: RTStreamBase[];
  refresh: () => Promise<void>;
  getRTStream: (category: RTStreamCategory) => RTStreamBase[];
}

/**
 * Base type for SceneIndex objects
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
 * SceneIndex interface for reference
 */
export interface ISceneIndex extends SceneIndexBase {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  createAlert: (config: {
    eventId: string;
    callbackUrl: string;
  }) => Promise<string>;
  getScenes: (
    start?: number,
    end?: number,
    page?: number,
    pageSize?: number
  ) => Promise<{ scenes: unknown[]; nextPage: boolean } | null>;
}

/**
 * Base type for SpokenIndex objects
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
 * SpokenIndex interface for reference
 */
export interface ISpokenIndex extends SpokenIndexBase {
  start: () => Promise<void>;
  stop: () => Promise<void>;
}
