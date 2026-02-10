import { IndexTypeValues, SearchTypeValues } from '@/core/config';

export type SearchType = keyof typeof SearchTypeValues;
export type IndexType = `${IndexTypeValues}`;

export type SearchBase = {
  query: string;
  searchType: SearchType;
  indexType: IndexType;
  resultThreshold?: number;
  scoreThreshold?: number;
  dynamicScorePercentage?: number;
  filter?: Array<Record<string, unknown>>;
};

export type SemanticSearchBase = SearchBase;

export type SemanticVideoSearch = {
  videoId: string;
} & SemanticSearchBase;

export type SemanticCollectionSearch = {
  collectionId: string;
} & SemanticSearchBase;

export type KeywordSearchBase = SearchBase;

export type KeywordVideoSearch = {
  videoId: string;
} & KeywordSearchBase;

export type KeywordCollectionSearch = {
  collectionId: string;
} & KeywordSearchBase;

export type SceneSearchBase = SearchBase;

export type SceneVideoSearch = {
  videoId: string;
} & SceneSearchBase;

export type SceneCollectionSearch = {
  collectionId: string;
} & SceneSearchBase;
