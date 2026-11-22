import { HttpClientDefaultValues, ResponseStatus } from '@/constants';
import type {
  ApiResponseOf,
  ErrorResponse,
  ResponseOf,
} from '@/types/response';
import {
  AuthenticationError,
  InvalidRequestError,
  JobTimeoutError,
  VdbBaseError,
  VideodbError,
} from '@/utils/error';
import { fromSnakeToCamel } from '@/utils';
import { PollSchedule, retryAfterFrom } from '@/utils/poll';
import { SDK_CLIENT_HEADER } from '@/version';
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
} from 'axios';
import FormData from 'form-data';

const MAX_POLL_RETRIES = 3;

/** Network errors, 429 and 5xx are worth retrying; other failures are not. */
const isTransient = (error: unknown): boolean => {
  const status = (error as AxiosError)?.response?.status;
  if (status === undefined) return (error as AxiosError)?.request !== undefined;
  return status === 429 || status >= 500;
};

/** Builds an error from a `success: false` body, keeping its message and code. */
const apiError = (body: {
  message?: string;
  error_code?: string | number;
}): VideodbError =>
  new VideodbError(body.message, undefined, {
    // A numeric error_code mirrors an HTTP status, so callers can rely on e.status.
    status: /^\d{3}$/.test(String(body.error_code ?? ''))
      ? Number(body.error_code)
      : undefined,
    code: body.error_code != null ? String(body.error_code) : undefined,
    data: body,
  });
/**
 * Per-call polling controls, mirroring the Python client's
 * `wait` / `max_poll_time` / `poll_interval` kwargs.
 */
export interface RequestPollOptions {
  /** When false, skip polling the async output URL and return immediately. */
  wait?: boolean;
  /**
   * Deadline (ms) for this call. Default 500s, which the server's `max_wait`
   * may extend; an explicit value is kept as given.
   */
  maxPollTime?: number;
  /**
   * Force a fixed poll interval (ms) for this call. Default: the server's
   * `retry_after` hint, else 5s.
   */
  pollInterval?: number;
  /**
   * When false, do NOT snake→camel convert the response body. Use for endpoints
   * whose payload contains user-defined opaque key maps (e.g. index `data`,
   * `field_schema`, aggregate buckets) that must be preserved verbatim to match
   * the server/Python SDK. Defaults to true.
   */
  convert?: boolean;
}

/**
 * Authentication configuration for HttpClient
 */
export interface HttpClientAuthConfig {
  /** API key for backend mode - full API access */
  apiKey?: string;
  /** Session token for client mode - limited access */
  sessionToken?: string;
}

/**
 * Optional configuration for HttpClient
 *
 * `headers` is a free-form bag of extra headers merged into every
 * request. Keys are auto-formatted to `x-kebab-case` to mirror
 * `videodb-python`'s kwarg-to-header behavior, e.g. `org_id` → `x-org-id`.
 */
export interface HttpClientOptions {
  headers?: Record<string, string>;
}

const formatExtraHeaders = (
  headers?: Record<string, string>
): Record<string, string> => {
  if (!headers) return {};
  const formatted: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const normalized = key.toLowerCase().replace(/_/g, '-');
    const headerKey = normalized.startsWith('x-')
      ? normalized
      : `x-${normalized}`;
    formatted[headerKey] = value;
  }
  return formatted;
};

/**
 * Api initialization to make axios config
 * options available to all child classes
 * internally.
 *
 * Response data is converted from snake_case to camelCase.
 * Request data must be provided in snake_case format at the call site.
 *
 * Supports dual authentication modes:
 * - API key: Full backend access
 * - Session token: Limited client access (backend handles distinguishing)
 */
export class HttpClient {
  #db: AxiosInstance;
  #baseURL: string;
  #authConfig: HttpClientAuthConfig;

  /**
   * Create an HttpClient with auth configuration
   * @param baseURL - Base URL for the API
   * @param authConfig - Authentication configuration (apiKey or sessionToken)
   * @param options - Optional client configuration (custom headers)
   */
  protected constructor(
    baseURL: string,
    authConfig: HttpClientAuthConfig,
    options?: HttpClientOptions
  );
  /**
   * Create an HttpClient with API key (legacy signature)
   * @param baseURL - Base URL for the API
   * @param apiKey - API key for authentication
   * @param options - Optional client configuration (custom headers)
   * @deprecated Use the object-based constructor instead
   */
  protected constructor(
    baseURL: string,
    apiKey: string,
    options?: HttpClientOptions
  );
  protected constructor(
    baseURL: string,
    authConfigOrApiKey: HttpClientAuthConfig | string,
    options?: HttpClientOptions
  ) {
    // Handle both signatures
    const authConfig: HttpClientAuthConfig =
      typeof authConfigOrApiKey === 'string'
        ? { apiKey: authConfigOrApiKey }
        : authConfigOrApiKey;

    // Get the token to use (apiKey or sessionToken)
    // Both use the same header - backend handles distinguishing
    const token = authConfig.apiKey || authConfig.sessionToken;

    this.#db = axios.create({
      baseURL,
      headers: {
        'x-access-token': token || '',
        'x-videodb-client': SDK_CLIENT_HEADER,
        ...formatExtraHeaders(options?.headers),
      },
      timeout: HttpClientDefaultValues.timeout,
    });
    this.#baseURL = baseURL;
    this.#authConfig = authConfig;
  }

  /** Base URL this client sends requests to. */
  public get baseURL(): string {
    return this.#baseURL;
  }

  /**
   * Converts response data from snake_case to camelCase
   */
  #convertResponseData = <R>(data: R): R => {
    if (data && typeof data === 'object') {
      return fromSnakeToCamel(data as object) as R;
    }
    return data;
  };

  /**
   * Polls the output URL until the job completes or times out.
   * @param url - The output URL to poll
   * @returns The final response data (already converted to camelCase)
   */
  #getOutput = async <R>(
    url: string,
    maxPollTime?: number,
    pollInterval?: number,
    convert: boolean = true,
    accepted?: AxiosResponse
  ): Promise<R> => {
    const schedule = new PollSchedule({ interval: pollInterval, maxPollTime });
    if (accepted) {
      await schedule.waitBeforeFirstPoll(accepted.data, accepted);
      this.#throwPollTimeout(schedule, url, accepted.data);
    }

    // Counts consecutive transient failures only; a good poll resets it, so a
    // flapping endpoint keeps polling until the deadline.
    let transientFailures = 0;

    for (;;) {
      let response: AxiosResponse<ApiResponseOf<R>>;
      try {
        response = await this.#db.get<ApiResponseOf<R>>(url);
        transientFailures = 0;
      } catch (error) {
        // A dropped connection or 5xx/429 mid-poll shouldn't kill a long job.
        if (isTransient(error) && ++transientFailures <= MAX_POLL_RETRIES) {
          this.#throwPollTimeout(schedule, url);
          await schedule.sleep((error as AxiosError).response);
          continue;
        }
        throw error;
      }
      const data = response.data;

      if (
        data.status === ResponseStatus.in_progress ||
        data.status === ResponseStatus.processing
      ) {
        schedule.observe(data);
        this.#throwPollTimeout(schedule, url, data);
        await schedule.sleep(retryAfterFrom(data) !== null ? data : response);
        continue;
      }

      if (data.success === false) {
        throw apiError(data);
      }

      if (data.response) {
        if (data.response.success === false) {
          throw apiError(data.response);
        }
        return convert
          ? this.#convertResponseData(data.response.data)
          : data.response.data;
      }
      return convert ? this.#convertResponseData(data.data) : data.data;
    }
  };

  /** Throws a {@link JobTimeoutError} for `url` once the schedule's deadline has passed. */
  #throwPollTimeout = (
    schedule: PollSchedule,
    url: string,
    lastResponse?: unknown
  ): void => {
    if (!schedule.expired) return;
    throw new JobTimeoutError(
      `Polling timed out after ${Math.round(schedule.maxPollTime / 1000)}s. ` +
        `The job may still finish; its result will be at ${url}`,
      { outputUrl: url, response: lastResponse }
    );
  };

  /**
   * Makes HTTP request
   * @typeParam R - The API response data type (converted to camelCase)
   * @typeParam D - The request data type (must be provided in snake_case)
   */
  #makeRequest = async <R, D = undefined>(
    options: AxiosRequestConfig<D>,
    poll?: RequestPollOptions
  ): Promise<ResponseOf<R>> => {
    try {
      const response = await this.#db.request<
        ApiResponseOf<R>,
        AxiosResponse<ApiResponseOf<R>, D>,
        D
      >(options);
      const data = response.data;
      const convert = poll?.convert !== false;

      // wait=false: do not poll the async output URL; return data as-is.
      if (poll?.wait === false) {
        return {
          ...data,
          data: convert ? this.#convertResponseData(data.data) : data.data,
        } as ResponseOf<R>;
      }

      if (data.status === ResponseStatus.processing) {
        if (data.request_type === 'async') {
          return {
            ...data,
            data: convert ? this.#convertResponseData(data.data) : data.data,
          } as ResponseOf<R>;
        }

        const outputUrl = (data.data as { output_url?: string })?.output_url;
        if (outputUrl) {
          const result = await this.#getOutput<R>(
            outputUrl,
            poll?.maxPollTime,
            poll?.pollInterval,
            convert,
            response
          );
          return { data: result, success: true } as ResponseOf<R>;
        }
      }

      return this.#parseResponse(data, convert);
    } catch (error) {
      // Any SDK error (including a poll RequestTimeoutError) passes through as is.
      if (error instanceof VdbBaseError) {
        throw error;
      }
      throw this.#getPlausibleError(
        error as AxiosError<ErrorResponse | undefined, AxiosRequestConfig<D>>
      );
    }
  };

  /**
   * Parses API response and converts data to camelCase
   */
  #parseResponse = <R>(
    data: ApiResponseOf<R>,
    convert: boolean = true
  ): ResponseOf<R> => {
    if (data.success === false) {
      throw apiError(data);
    }
    return {
      ...data,
      data: convert ? this.#convertResponseData(data.data) : data.data,
    } as ResponseOf<R>;
  };

  /**
   * Used for getting a human readble and usable error type
   * @param error - The error recieved from the axios request
   * @returns An error class instance from one of the Videodb Error types
   */
  #getPlausibleError = <D>(
    error: AxiosError<ErrorResponse | undefined, AxiosRequestConfig<D>>
  ) => {
    if (error.response) {
      const errData = error.response.data;
      if (error.status === HttpStatusCode.Unauthorized) {
        // For now, the only reason for getting a 401 is an invalid API Key
        return new AuthenticationError(undefined, {
          status: error.response.status,
          data: errData,
        });
      }
      return new InvalidRequestError(error.response, {
        cause: errData?.message || error.message || 'Unknown cause',
      });
    } else if (error.request) {
      return new VideodbError(`Request failed: ${error.message}`, {
        cause: error.message,
      });
    } else {
      return new VideodbError(
        `Unidentified Error: ${(error as Error)?.message ?? String(error)}`,
        { cause: error }
      );
    }
  };

  public get = async <R>(
    urlSeries: string[],
    options?: AxiosRequestConfig<undefined>,
    poll?: RequestPollOptions
  ) => {
    return await this.#makeRequest<R>(
      {
        method: 'GET',
        url: urlSeries.join('/'),
        ...options,
      },
      poll
    );
  };

  public delete = async <R>(
    urlSeries: string[],
    options?: AxiosRequestConfig<undefined>
  ) => {
    return await this.#makeRequest<R>({
      method: 'DELETE',
      url: urlSeries.join('/'),
      ...options,
    });
  };

  public post = async <R, D = undefined>(
    urlSeries: string[],
    data?: D,
    options?: AxiosRequestConfig<D>,
    poll?: RequestPollOptions
  ) => {
    return await this.#makeRequest<R, D>(
      {
        method: 'POST',
        url: urlSeries.join('/'),
        data,
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
          ...options?.headers,
        }),
        ...options,
      },
      poll
    );
  };

  public put = async <R, D = undefined>(
    urlSeries: string[],
    data?: D,
    options?: AxiosRequestConfig<D>
  ) => {
    return await this.#makeRequest<R, D>({
      method: 'PUT',
      url: urlSeries.join('/'),
      data,
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...options?.headers,
      }),
      ...options,
    });
  };

  public patch = async <R, D = undefined>(
    urlSeries: string[],
    data?: D,
    options?: AxiosRequestConfig<D>
  ) => {
    return await this.#makeRequest<R, D>({
      method: 'PATCH',
      url: urlSeries.join('/'),
      data,
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...options?.headers,
      }),
      ...options,
    });
  };
}
