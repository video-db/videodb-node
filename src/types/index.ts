export enum SearchTypeValues {
  semantic,
}
export type SearchType = keyof typeof SearchTypeValues;

export enum IndexTypeValues {
  semantic,
}
export type IndexType = keyof typeof IndexTypeValues;

export type SearchConfig = {
  query: string;
  type?: SearchType;
  resultThreshold?: number;
  scoreThreshold?: number;
};

export type IndexConfig = {
  index_type: IndexType;
};
