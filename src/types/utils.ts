import {
  AuthenticationError,
  InvalidRequestError,
  VideodbError,
} from '@/utils/error';

export type JobType = 'async' | 'sync';

export type JobSuccessCallback<D> = (data: D) => unknown;
export type JobErrorCallback = (
  err: VideodbError | AuthenticationError | InvalidRequestError
) => unknown;

export type URLSeries = string[];

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
