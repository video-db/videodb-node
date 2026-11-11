import { AxiosResponse } from 'axios';

/** HTTP details attached to errors raised from an API response. */
export interface VideodbErrorDetails {
  /** HTTP status code, when the error came from an API response. */
  status?: number;
  /** Machine-readable server error code, e.g. `llm_dollar_budget_reached`. */
  code?: string;
  /** Raw server response body. */
  data?: unknown;
}

/** Base class for every error the SDK throws; catch this to handle all of them. */
export class VideodbError<T = unknown> extends Error {
  public status?: number;
  public code?: string;
  public data?: unknown;

  constructor(message?: string, cause?: T, details: VideodbErrorDetails = {}) {
    super(`VideoDB Error: ${message}`, { cause });
    this.name = 'VideodbError';
    this.status = details.status;
    this.code = details.code;
    this.data = details.data;
  }

  /** Swaps the default "VideoDB Error:" prefix for a subclass-specific one. */
  protected setMessage(prefix: string, message?: string) {
    this.message = message ? `${prefix}: ${message}` : prefix;
  }
}

/** @deprecated Use {@link VideodbError}, which every SDK error now extends. */
export const VdbBaseError = VideodbError;

export class AuthenticationError<T = unknown> extends VideodbError<T> {
  // Also accepts the 0.3.x form `new AuthenticationError(cause)`; cause still defaults to the message.
  constructor(
    messageOrCause?: string | T,
    details?: VideodbErrorDetails,
    cause?: T
  ) {
    const isMessage = typeof messageOrCause === 'string';
    const message = isMessage ? messageOrCause : 'Invalid API key';
    super(
      message,
      (isMessage ? (cause ?? message) : (messageOrCause ?? message)) as T,
      details
    );
    this.name = 'AuthenticationError';
    this.setMessage('Authentication Error', message);
  }
}

export class InvalidRequestError<C = unknown> extends VideodbError<C> {
  public response?: AxiosResponse;
  constructor(responseOrMessage: AxiosResponse | string, cause?: C) {
    const isResponse = typeof responseOrMessage !== 'string';
    const body = isResponse
      ? (responseOrMessage.data as
          | { message?: string; error_code?: string | number }
          | undefined)
      : undefined;
    const message = isResponse
      ? `Error ${responseOrMessage.status}: ${body?.message || responseOrMessage.statusText}`
      : responseOrMessage;
    super(
      message,
      cause,
      isResponse
        ? {
            status: responseOrMessage.status,
            code:
              body?.error_code != null ? String(body.error_code) : undefined,
            data: body,
          }
        : {}
    );
    this.name = 'InvalidRequestError';
    if (isResponse) {
      this.message = message;
      this.response = responseOrMessage;
    } else {
      this.setMessage('Invalid Request Error', message);
    }
  }
}

/**
 * Raised when a request or a client-side poll loop times out.
 * Mirrors `videodb.exceptions.RequestTimeoutError`.
 */
export class RequestTimeoutError<T = unknown> extends VideodbError<T> {
  constructor(message?: string, cause?: T) {
    super(message, cause);
    this.name = 'RequestTimeoutError';
    this.setMessage('Request Timeout Error', message);
  }
}

/**
 * Error thrown when a capture operation fails
 */
export class CaptureError extends VideodbError {
  public captureId?: string;
  public operation?: string;

  constructor(message: string, captureId?: string, operation?: string) {
    super(message);
    this.name = 'CaptureError';
    this.setMessage('Capture Error', message);
    this.captureId = captureId;
    this.operation = operation;
  }
}

/**
 * Error thrown when a binary operation fails
 */
export class BinaryError extends VideodbError {
  public command?: string;
  public exitCode?: number;

  constructor(message: string, command?: string, exitCode?: number) {
    super(message);
    this.name = 'BinaryError';
    this.setMessage('Binary Error', message);
    this.command = command;
    this.exitCode = exitCode;
  }
}

/**
 * Error thrown when a permission is denied
 */
export class PermissionError extends VideodbError {
  public permissionType?: string;

  constructor(message: string, permissionType?: string) {
    super(message);
    this.name = 'PermissionError';
    this.setMessage('Permission Error', message);
    this.permissionType = permissionType;
  }
}
