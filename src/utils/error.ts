import { AxiosResponse } from 'axios';

export abstract class VdbBaseError extends Error {}

export class VideodbError<T = undefined> extends VdbBaseError {
  constructor(message?: string, cause?: T) {
    super(`VideoDB Error: ${message}`, { cause: cause });
  }
}

export class AuthenticationError<T = unknown> extends VdbBaseError {
  constructor(cause?: T) {
    super('Authentication Error: ', { cause: cause || 'Invalid API Key' });
  }
}

export class InvalidRequestError<C = unknown> extends VdbBaseError {
  public response: AxiosResponse;
  constructor(response: AxiosResponse, cause?: C) {
    super(`Error ${response.status}: ${response.statusText}`, { cause });
    this.response = response;
  }
}
