import { SearchResult } from '@/core/search/searchResult';
import { Video } from '@/core/video';
import { Audio } from '@/core/audio';
import { Image } from '@/core/image';
import type { SearchType } from '@/types/search';
import type { FileUploadConfig, URLUploadConfig } from '@/types/collection';
import type { StreamableURL, Timeline, Transcript } from '@/types/video';
import { AudioAsset, VideoAsset } from '..';
import { IndexSceneConfig, SubtitleStyleProps } from '@/types/config';

/**
 * Base type for all collection objects
 */
export interface CollectionBase {
  id: string;
  name?: string;
  description?: string;
}
/**
 * Collection class interface for reference
 */
export interface ICollection {
  meta: CollectionBase;
  getVideos: () => Promise<Video[]>;
  getVideo: (videoId: string) => Promise<Video>;
  deleteVideo: (videoId: string) => Promise<object>;
  uploadFile: (
    data: FileUploadConfig
  ) => Promise<Video | Audio | Image | undefined>;
  uploadURL: (
    data: URLUploadConfig
  ) => Promise<Video | Audio | Image | undefined>;
  search: (query: string, searchType?: SearchType) => Promise<SearchResult>;
}

/**
 * Base type for all video objects
 */
export interface VideoBase {
  collectionId: string;
  id: string;
  length: string;
  name: string;
  size: string;
  streamUrl: StreamableURL;
  userId: string;
  playerUrl: StreamableURL;
  thumbnail?: string;
}

/**
 * Video class interface for reference
 */
export interface IVideo {
  meta: VideoBase;
  transcript?: Transcript;
  generateStream: (timeline: Timeline) => Promise<string>;
  play: () => string;
  getTranscript: (forceCreate?: boolean) => Promise<Transcript>;
  indexSpokenWords: () => Promise<{ success: boolean; message?: string }>;
  indexScenes: (config: IndexSceneConfig) => Promise<string | undefined>;
  search: (query: string, searchType?: SearchType) => Promise<SearchResult>;
  generateThumbnail: () => Promise<string>;
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
export interface IAudio {
  meta: AudioBase;
}

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
export interface IImage {}

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
}

/**
 * Shot class interface for reference
 */
export interface IShot {
  meta: ShotBase;
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
