import { AudioBase, VideoBase, ImageBase } from '@/interfaces/core';

export type MediaBase = VideoBase | AudioBase | ImageBase;

export type SceneIndexRecord = {
  start: number;
  end: number;
  description: string;
};
export type SceneIndexRecords = SceneIndexRecord[];

export type SceneIndex = {
  sceneIndexId: string;
  status: string;
  name: string;
};

export type SceneIndexes = SceneIndex[];
