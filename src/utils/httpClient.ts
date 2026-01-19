import { HttpClientDefaultValues, ResponseStatus } from '@/constants';
import type {
  ApiResponseOf,
  ErrorResponse,
  ResponseOf,
} from '@/types/response';
import {
  AuthenticationError,
  InvalidRequestError,
  VideodbError,
} from '@/utils/error';
import { fromCamelToSnake, fromSnakeToCamel } from '@/utils';
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

const POLLING_INTERVAL = 5000;
const MAX_POLLING_TIME = 500000;

/**
 * Api initialization to make axios config
 * options available to all child classes
 * internally.
 *
 * Handles automatic conversion between camelCase (SDK) and snake_case (API):
 * - Request data: camelCase → snake_case
 * - Response data: snake_case → camelCase
 */
export class HttpClient {
  #db: AxiosInstance;
  #baseURL: string;
  #apiKey: string;

  protected constructor(baseURL: string, apiKey: string) {
    this.#db = axios.create({
      baseURL,
      headers: {
        'x-access-token': apiKey,
        'x-videodb-client': SDK_CLIENT_HEADER,
      },
      timeout: HttpClientDefaultValues.timeout,
    });
    this.#baseURL = baseURL;
    this.#apiKey = apiKey;
  }

  #sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

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
  #getOutput = async <R>(url: string): Promise<R> => {
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLLING_TIME) {
      const response = await this.#db.get<ApiResponseOf<R>>(url);
      const data = response.data;

      if (
        data.status === ResponseStatus.in_progress ||
        data.status === ResponseStatus.processing
      ) {
        await this.#sleep(POLLING_INTERVAL);
        continue;
      }

      if (data.success === false) {
        throw new VideodbError(data.message);
      }

      if (data.response) {
        if (data.response.success === false) {
          throw new VideodbError(data.response.message);
        }
        return this.#convertResponseData(data.response.data);
      }
      return this.#convertResponseData(data.data);
    }

    throw new VideodbError(
      'Job timed out after ' + MAX_POLLING_TIME / 1000 + ' seconds'
    );
  };

  /**
   * Converts request data from camelCase to snake_case if it's an object
   * Skips conversion for FormData and non-objects
   */
  #convertRequestData = <D>(data: D): D => {
    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      return fromCamelToSnake(data as object) as D;
    }
    return data;
  };

  /**
   * Makes HTTP request with automatic case conversion
   * @typeParam R - The snake_case API response data type
   * @typeParam D - The camelCase request data type (converted to snake_case before sending)
   */
  #makeRequest = async <R, D = undefined>(
    options: AxiosRequestConfig<D>
  ): Promise<ResponseOf<R>> => {
    // Convert request data from camelCase to snake_case
    const convertedOptions = {
      ...options,
      data:
        options.data !== undefined
          ? this.#convertRequestData(options.data)
          : undefined,
    };

    try {
      const response = await this.#db.request<
        ApiResponseOf<R>,
        AxiosResponse<ApiResponseOf<R>, D>,
        D
      >(convertedOptions);
      const data = response.data;

      if (data.status === ResponseStatus.processing) {
        if (data.request_type === 'async') {
          return {
            ...data,
            data: this.#convertResponseData(data.data),
          } as ResponseOf<R>;
        }

        const outputUrl = (data.data as { output_url?: string })?.output_url;
        if (outputUrl) {
          const result = await this.#getOutput<R>(outputUrl);
          return { data: result, success: true } as ResponseOf<R>;
        }
      }

      return this.#parseResponse(data);
    } catch (error) {
      if (error instanceof VideodbError) {
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
  #parseResponse = <R>(data: ApiResponseOf<R>): ResponseOf<R> => {
    if (data.success === false) {
      throw new VideodbError(data.message);
    }
    return {
      ...data,
      data: this.#convertResponseData(data.data),
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
        return new AuthenticationError();
      }
      return new InvalidRequestError(error.response, {
        cause: errData?.message || error.message || 'Unknown cause',
      });
    } else if (error.request) {
      return new VideodbError('Request failed', {
        cause: error.message,
      });
    } else {
      return new VideodbError('Unidentified Error', {
        cause: error,
      });
    }
  };

  public get = async <R>(
    urlSeries: string[],
    options?: AxiosRequestConfig<undefined>
  ) => {
    return await this.#makeRequest<R>({
      method: 'GET',
      url: urlSeries.join('/'),
      ...options,
    });
  };

  public delete = async <R>(
    urlSeries: string[],
    options?: AxiosRequestConfig<undefined>
  ) => {
    return await this.#makeRequest<R>({
      method: 'DELETE',
      url: urlSeries.join('/') + '/',
      ...options,
    });
  };

  public post = async <R, D = undefined>(
    urlSeries: string[],
    data?: D,
    options?: AxiosRequestConfig<D>
  ) => {
    return await this.#makeRequest<R, D>({
      method: 'POST',
      url: urlSeries.join('/') + '/',
      data,
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...options?.headers,
      }),
      ...options,
    });
  };

  public put = async <R, D = undefined>(
    urlSeries: string[],
    data?: D,
    options?: AxiosRequestConfig<D>
  ) => {
    return await this.#makeRequest<R, D>({
      method: 'PUT',
      url: urlSeries.join('/') + '/',
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
      url: urlSeries.join('/') + '/',
      data,
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...options?.headers,
      }),
      ...options,
    });
  };
}
