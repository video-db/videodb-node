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
