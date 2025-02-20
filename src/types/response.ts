/**
 * All types for API responses (The API is written in
 * python and sends data in snake_case and the NodeJS
 * lib uses camelCase so a separation is necessary)
 */

import { ResponseStatus } from '@/constants';
import type { StreamableURL } from './video';
import { SceneIndexRecords } from '.';

/**
 * All error responses sent by the server are of this type
 */
export type ErrorResponse = {
  message: string;
  success?: boolean;
  status?: string;
};

/**
 * All sucessfull responses are wrapped by this type
 * @param D - Type of the response data
 *
 * TODO: Fix this type after server update
 */
export type ResponseOf<D> = {
  data: D;
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
    end: string;
    start: string;
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
  sceneIndexRecords: SceneIndexRecords;
};

export type SceneIndex = {
  name: string;
  scene_index_id: string;
  status: string;
};

export type ListSceneIndex = {
  scene_indexes: SceneIndex[];
};

export type SceneCollectionResponse = {
  scene_collection: {
    config: object;
    scene_collection_id: string;
    scenes: object[];
  };
};

export type ListSceneCollection = {
  scene_collections: {
    config: object;
    scene_collection_id: string;
    status: string;
  }[];
};
