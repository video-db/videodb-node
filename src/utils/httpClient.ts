import { HttpClientDefaultValues } from '@/constants';
import type { ErrorResponse, ResponseOf } from '@/types/response';
import {
  AuthenticationError,
  InvalidRequestError,
  VideodbError,
} from '@/utils/error';
import { SDK_CLIENT_HEADER } from '@/version';
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
} from 'axios';

/**
 * Api initialization to make axios config
 * options available to all child classes
 * internally.
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

  #makeRequest = async <R, D = undefined>(
    options: AxiosRequestConfig<D>
  ): Promise<ResponseOf<R>> => {
    return this.#db
      .request<ResponseOf<R>, AxiosResponse<ResponseOf<R>, D>, D>(options)
      .then(successResponse => {
        return this.parseResponse(successResponse.data);
      })
      .catch(
        (
          error:
            | AxiosError<ErrorResponse | undefined, AxiosRequestConfig<D>>
            | VideodbError
        ) => {
          if (error instanceof VideodbError) {
            throw error;
          }
          throw this.#getPlausibleError(error);
        }
      );
  };

  parseResponse = <D>(data: ResponseOf<D>) => {
    if (data.success === false) {
      throw new VideodbError(data.message);
    }
    return data;
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
