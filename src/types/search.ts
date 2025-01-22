import { IndexTypeValues, SearchTypeValues } from '@/core/config';

export type SearchType = keyof typeof SearchTypeValues;
export type IndexType = keyof typeof IndexTypeValues;

export type SearchBase = {
  query: string;
  searchType: SearchType;
  indexType: IndexType;
  resultThreshold?: number;
  scoreThreshold?: number;
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
