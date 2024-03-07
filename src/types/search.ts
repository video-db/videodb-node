import { SearchTypeValues } from '@/core/search';

export type SearchType = keyof typeof SearchTypeValues;

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
