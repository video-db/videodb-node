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
