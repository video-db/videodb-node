import { AxiosResponse } from 'axios';

/** HTTP details attached to errors raised from an API response. */
export interface VideodbErrorDetails {
  /** HTTP status code, when the error came from an API response. */
  status?: number;
  /** Machine-readable server error code, e.g. `llm_dollar_budget_reached`. */
  code?: string;
  /** Raw server response body; `data.message` is the server's explanation. */
  data?: unknown;
}

/** Common base of every SDK error; catch it to handle them all. */
export abstract class VdbBaseError extends Error {
  declare status?: number;
  declare code?: string;
  declare data?: unknown;

  /** Sets only the details that are present, so other errors gain no new keys. */
  protected setDetails(details: VideodbErrorDetails = {}) {
    for (const key of ['status', 'code', 'data'] as const) {
      if (details[key] !== undefined)
        Object.assign(this, { [key]: details[key] });
    }
  }
}

export class VideodbError<T = undefined> extends VdbBaseError {
  constructor(message?: string, cause?: T, details?: VideodbErrorDetails) {
    super(`VideoDB Error: ${message}`, { cause: cause });
    this.setDetails(details);
  }
}

export class AuthenticationError<T = unknown> extends VdbBaseError {
  constructor(cause?: T, details?: VideodbErrorDetails) {
    super('Authentication Error: ', { cause: cause || 'Invalid API Key' });
    this.setDetails(details);
  }
}

export class InvalidRequestError<C = unknown> extends VdbBaseError {
  public response?: AxiosResponse;
  constructor(responseOrMessage: AxiosResponse | string, cause?: C) {
    if (typeof responseOrMessage === 'string') {
      super(`Invalid Request Error: ${responseOrMessage}`, { cause });
    } else {
      super(
        `Error ${responseOrMessage.status}: ${responseOrMessage.statusText}`,
        { cause }
      );
      this.response = responseOrMessage;
      const body = responseOrMessage.data as
        | { error_code?: string | number }
        | undefined;
      this.setDetails({
        status: responseOrMessage.status,
        code: body?.error_code != null ? String(body.error_code) : undefined,
        data: body,
      });
    }
    this.name = 'InvalidRequestError';
  }
}

/**
 * Raised when a request or a client-side poll loop times out.
 * Mirrors `videodb.exceptions.RequestTimeoutError`.
 */
export class RequestTimeoutError<T = undefined> extends VdbBaseError {
  constructor(message?: string, cause?: T) {
    super(`Request Timeout Error: ${message}`, { cause });
    this.name = 'RequestTimeoutError';
  }
}

/**
 * Error thrown when a capture operation fails
 */
export class CaptureError extends VdbBaseError {
  public captureId?: string;
  public operation?: string;

  constructor(message: string, captureId?: string, operation?: string) {
    super(`Capture Error: ${message}`);
    this.name = 'CaptureError';
    this.captureId = captureId;
    this.operation = operation;
  }
}

/**
 * Error thrown when a binary operation fails
 */
export class BinaryError extends VdbBaseError {
  public command?: string;
  public exitCode?: number;

  constructor(message: string, command?: string, exitCode?: number) {
    super(`Binary Error: ${message}`);
    this.name = 'BinaryError';
    this.command = command;
    this.exitCode = exitCode;
  }
}

/**
 * Error thrown when a permission is denied
 */
export class PermissionError extends VdbBaseError {
  public permissionType?: string;

  constructor(message: string, permissionType?: string) {
    super(`Permission Error: ${message}`);
    this.name = 'PermissionError';
    this.permissionType = permissionType;
  }
}
