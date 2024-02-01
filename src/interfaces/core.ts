import { SearchResult } from '@/core/search/searchResult';
import { Video } from '@/core/video';
import type { IndexType, SearchType } from '@/types';
import type { FileUploadConfig, URLUploadConfig } from '@/types/collection';
import type { StreamableURL, Timeline, Transcript } from '@/types/video';
import { IndexJob, TranscriptJob, UploadJob } from '@/utils/job';
import { AudioAsset, VideoAsset } from '..';

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
  uploadFile: (data: FileUploadConfig) => Promise<void | UploadJob>;
  uploadURL: (data: URLUploadConfig) => Promise<void | UploadJob>;
  search: (query: string, type?: SearchType) => Promise<SearchResult>;
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
  getTranscript: (forceCreate?: boolean) => Transcript | TranscriptJob;
  index: (indexType: IndexType) => IndexJob;
  search: (query: string, type?: SearchType) => Promise<SearchResult>;
  generateThumbnail: () => Promise<string>;
  addSubtitle: () => Promise<string>;
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
