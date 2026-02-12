/**
 * All types for API responses (The API is written in
 * python and sends data in snake_case and the NodeJS
 * lib uses camelCase so a separation is necessary)
 */

import { ResponseStatus } from '@/constants';
import type { StreamableURL } from './video';
import { SceneIndexRecords } from '.';
import type { SnakeKeysToCamelCase } from '@/utils';

/**
 * All error responses sent by the server are of this type
 */
export type ErrorResponse = {
  message: string;
  success?: boolean;
  status?: string;
};

/**
 * Raw API response wrapper (snake_case from server)
 * Used internally by HttpClient
 */
export type ApiResponseOf<D> = {
  data: D;
  success?: boolean;
  message?: string;
  status?: (typeof ResponseStatus)[keyof typeof ResponseStatus];
  request_type?: 'sync' | 'async';
  response?: ApiResponseOf<D>;
};

/**
 * Converted response wrapper with camelCase data
 * Returned to SDK consumers
 */
export type ResponseOf<D> = {
  data: SnakeKeysToCamelCase<D>;
  success?: boolean;
  message?: string;
  status?: (typeof ResponseStatus)[keyof typeof ResponseStatus];
  request_type?: 'sync' | 'async';
  response?: ResponseOf<D>;
};

export type UpdateResponse = {
  status: number;
  message: string;
  response: unknown;
};

export type NoDataResponse = {
  message?: string;
  success?: boolean;
};

export type VideoResponse = {
  collection_id: string;
  id: string;
  length: string;
  name: string;
  size: string;
  stream_url: string;
  user_id: string;
  player_url: string;
};

//#TODO: cross check the arugments
export type AudioResponse = {
  collection_id: string;
  id: string;
  length: string;
  name: string;
  size: string;
  user_id: string;
};

export type ImageResponse = {
  collection_id: string;
  id: string;
  name: string;
};

export type CollectionResponse = {
  id: string;
  name: string;
  description: string;
};

export type GetCollections = {
  collections: CollectionResponse[];
  default_collection: string;
};

export type TranscriptionResponse = {
  output_url: string;
};

export type SyncJobResponse = {
  output_url: string;
};

export type GetUploadUrl = {
  upload_url: string;
};

export type GetVideos = {
  videos: VideoResponse[];
};

export type GetAudios = {
  audios: AudioResponse[];
};

export type GetImages = {
  images: ImageResponse[];
};

export type SceneBase = {
  response: string;
  start: number;
  end: number;
};
export type GenerateStreamResponse = {
  player_url: string;
  stream_url: string;
};

export type TranscriptResponse = {
  text: string;
  word_timestamps: {
    end: number;
    start: number;
    word: string;
  }[];
};

export type SearchResponse = {
  results: {
    collection_id: string;
    docs: {
      end: number;
      score: number;
      start: number;
      stream_url: string;
      text: string;
      scene_index_id?: string;
      scene_index_name?: string;
      metadata?: Record<string, unknown>;
    }[];
    length: string;
    max_score: number;
    platform: string;
    stream_url: StreamableURL;
    thumbnail: string;
    title: string;
    video_id: string;
  }[];
};

export type IndexScenesResponse = {
  scene_index_id: string;
};

export type MediaResponse = VideoResponse | AudioResponse | ImageResponse;

export type GetSceneIndexResponse = {
  scene_index_records: SceneIndexRecords;
};

export type SceneIndex = {
  name: string;
  scene_index_id: string;
  status: string;
};

export type ListSceneIndex = {
  scene_indexes: SceneIndex[];
};

/** API response structure for a frame within a scene */
export type FrameResponse = {
  frame_id: string;
  url: string;
  frame_time: number;
  description: string;
};

/** API response structure for a scene within a collection */
export type SceneResponse = {
  scene_id: string;
  start: number;
  end: number;
  frames: FrameResponse[];
  description?: string;
};

/** API response structure for scene collection data */
export type SceneCollectionData = {
  scene_collection_id: string;
  config: object;
  scenes: SceneResponse[];
};

export type SceneCollectionResponse = {
  scene_collection: SceneCollectionData;
};

export type ListSceneCollection = {
  scene_collections: {
    config: object;
    scene_collection_id: string;
    status: string;
  }[];
};
