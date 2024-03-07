import { AudioBase, VideoBase, ImageBase } from '@/interfaces/core';

export enum IndexTypeValues {
  semantic,
}
export type IndexType = keyof typeof IndexTypeValues;

export type IndexConfig = {
  index_type: IndexType;
};

export type MediaBase = VideoBase | AudioBase | ImageBase;
