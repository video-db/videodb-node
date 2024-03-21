import { IndexTypeValues, SearchTypeValues } from '@/core/search';

export type SearchType = keyof typeof SearchTypeValues;
export type IndexType = keyof typeof IndexTypeValues;

export type SceneSearchBase = {
  query: string;
  resultThreshold?: number;
  scoreThreshold?: number;
};

export type SceneVideoSearch = {
  videoId: string;
} & SceneSearchBase;

export type SceneCollectionSearch = {
  collectionId: string;
} & SceneSearchBase;

export type SemanticSearchBase = {
  query: string;
  resultThreshold?: number;
  scoreThreshold?: number;
};

export type SemanticVideoSearch = {
  videoId: string;
} & SemanticSearchBase;

export type SemanticCollectionSearch = {
  collectionId: string;
} & SemanticSearchBase;

export type KeywordSearchBase = {
  query: string;
  resultThreshold?: number;
  scoreThreshold?: number;
};

export type KeywordVideoSearch = {
  videoId: string;
} & SemanticSearchBase;

export type KeywordCollectionSearch = {
  collectionId: string;
} & SemanticSearchBase;
