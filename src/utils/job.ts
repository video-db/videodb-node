import { ApiPath, ResponseStatus } from '@/constants';
import { Video } from '@/core/video';
import { Audio } from '@/core/audio';
import { Image } from '@/core/image';
import type { AudioBase, ImageBase, VideoBase } from '@/interfaces/core';
import type {
  SyncDubVideoConfig,
  SyncGenerateAudioConfig,
  SyncGenerateImageConfig,
  SyncGenerateVideoConfig,
  SyncUploadConfig,
} from '@/types/collection';
import type { MediaBase, SceneIndexRecords } from '@/types/index';
import type { ExtractSceneConfig, IndexConfig } from '@/types/config';
import type { IndexType } from '@/types/search';
import type {
  NoDataResponse,
  SyncJobResponse,
  TranscriptResponse,
  MediaResponse,
  GetSceneIndexResponse,
  VideoResponse,
  AudioResponse,
  ImageResponse,
} from '@/types/response';
import type { JobErrorCallback, JobSuccessCallback } from '@/types/utils';
import type { Transcript } from '@/types/video';
import { fromCamelToSnake, fromSnakeToCamel } from '.';
import {
  AuthenticationError,
  InvalidRequestError,
  VideodbError,
} from './error';
import { HttpClient } from './httpClient';
import { IndexSceneConfig } from '@/types/config';

const { in_progress, processing } = ResponseStatus;
const {
  video,
  transcription,
  collection,
  upload,
  index,
  scene,
  scenes,
  generate,
  audio,
  image,
  dub,
} = ApiPath;

/**
 * Base Job class used to create different kinds of jobs
 * @remarks
 * Jobs are used for long running tasks where a simple
 * async call would take too long causing a timeout.
 *
 * @see
 * This class accepts 3 type params
 * - ApiResponse: The response recieved from the API on calling
 */
export abstract class Job<
  ApiResponse extends object,
  SdkBase,
  FinalReturn = SdkBase,
> {
  private _on: {
    success?: JobSuccessCallback<FinalReturn>;
    error?: JobErrorCallback;
  } = {};
  private readonly _delayMultiplier = 2;
  private readonly _maxDelay = 1000000;
  private currentDelaySeconds = 2000;
  protected vhttp: HttpClient;
  protected convertResponseToCamelCase = true;
  protected jobTitle: string;

  /**
   * @param http - HttpClient object
   */
  constructor(http: HttpClient) {
    this.vhttp = http;
    this.jobTitle = 'Job';
  }
  protected abstract beforeSuccess: (data: SdkBase) => FinalReturn;
  public abstract start: () => Promise<void>;

  public on(option: 'success', method: JobSuccessCallback<FinalReturn>): void;
  public on(option: 'error', method: JobErrorCallback): void;
  public on(
    option: 'success' | 'error',
    method: JobSuccessCallback<FinalReturn> | JobErrorCallback
  ): void {
    if (option === 'success') {
      this._on[option] = method as JobSuccessCallback<FinalReturn>;
    } else if (option === 'error') {
      this._on[option] = method as JobErrorCallback;
    }
  }

  private _incrementDelay(): void {
    this.currentDelaySeconds = this._delayMultiplier * this.currentDelaySeconds;
  }

  protected _handleError = (err: unknown) => {
    if (this._on.error) {
      if (
        err instanceof AuthenticationError ||
        err instanceof InvalidRequestError ||
        err instanceof VideodbError
      )
        this._on.error(err);
      else {
        this._on.error(new VideodbError('Unknown Error', err));
      }
    } else {
      console.error('Unregistered Job Error', err);
    }
  };

  protected _handleSuccess = (data: ApiResponse) => {
    const transformedResponse = fromSnakeToCamel(data) as SdkBase;
    const finalData = this.beforeSuccess(transformedResponse);
    if (this._on.success) {
      this._on.success(finalData);
    } else {
      console.log(
        `${this.jobTitle} Completed but success listener wasn't registered`,
        data
      );
    }
  };

  /**
   * Initiates a backoff-like system where we check the status
   * of the job in an exponentially increasing interval.
   * @param http - HttpClient instance
   * @param callbackUrl - URL sent by the server to check status
   *
   * @returns NOTHING. Do not await this function. This will call the
   * success or error listener depending on the status.
   */
  protected _initiateBackoff = async (callbackUrl: string) => {
    try {
      const res = await this.vhttp.get<ApiResponse>([callbackUrl]);
      if (res.status === in_progress || res.status === processing) {
        if (this.currentDelaySeconds >= this._maxDelay) {
          throw new VideodbError('Job timed out');
        }
        setTimeout(() => {
          void this._initiateBackoff(callbackUrl);
          this._incrementDelay();
        }, this.currentDelaySeconds);
      } else {
        // If an error hasn't been thrown unitl now, the job has succeeded
        // TODO: remove the ignore comment after server update
        // @ts-ignore
        if ('response' in res && res.response) {
          if (res.response.success === false) {
            throw new VideodbError(res.response.message);
          }
          this._handleSuccess(res.response.data);
        } else {
          this._handleSuccess(res.data);
        }
      }
    } catch (err) {
      this._handleError(err);
    }
  };
}

/**
 * TranscriptJob is used to initalize a new trancsript generation call.
 *
 * @remarks
 * Uses the base Job class to implement a backoff to get the transcript
 */
export class TranscriptJob extends Job<TranscriptResponse, Transcript> {
  videoId: string;
  force: boolean;
  constructor(http: HttpClient, videoId: string, force = false) {
    super(http);
    this.videoId = videoId;
    this.force = force;
    this.jobTitle = 'Transcript Job';
  }
  /**
   * If the transcript exists, it immediately calls
   * the success listener. If it doesn't exist, it
   * initiates a backoff.
   */
  public start = async () => {
    try {
      const res = await this.vhttp.get<SyncJobResponse | TranscriptResponse>([
        video,
        this.videoId,
        transcription,
        `?force=${String(this.force)}`,
      ]);

      if ('output_url' in res.data) {
        void this._initiateBackoff(res.data.output_url);
      } else {
        this._handleSuccess(res.data);
      }
    } catch (err) {
      this._handleError(err);
    }
  };

  // Transcript job doesn't need a beforeSuccess call so simply returns the same data
  protected beforeSuccess = (data: Transcript) => data;
}

/**
 * UploadJob is used to initalize a new video upload.
 *
 * @remarks
 * Uses the base Job class to implement a backoff to get the uploaded video data.
 */
export class UploadJob extends Job<
  MediaResponse,
  MediaBase,
  Video | Audio | Image
> {
  public uploadData: SyncUploadConfig;
  public collectionId: string;
  constructor(data: SyncUploadConfig, collectionId: string, http: HttpClient) {
    super(http);
    this.uploadData = data;
    this.collectionId = collectionId;
    this.jobTitle = 'Upload Job';
  }

  /**
   * Fetches the callbackURL from the server and initiates a backoff
   */
  public start = async () => {
    try {
      const res = await this.vhttp.post<SyncJobResponse, SyncUploadConfig>(
        [collection, this.collectionId, upload],
        this.uploadData
      );

      void this._initiateBackoff(res.data.output_url);
    } catch (err) {
      this._handleError(err);
    }
  };

  /**
   * Initializes a new video object with the returned data
   * @param data - Media data returned from the API and converted to camelCase
   * @returns a new Video object
   */
  protected beforeSuccess = (data: MediaBase) => {
    const mediaId = data.id;
    if (mediaId.startsWith('img-')) {
      return new Image(this.vhttp, data as ImageBase);
    } else if (mediaId.startsWith('a-')) {
      return new Audio(this.vhttp, data as AudioBase);
    }
    return new Video(this.vhttp, data as VideoBase);
  };
}

export class IndexJob extends Job<NoDataResponse, NoDataResponse> {
  videoId: string;
  indexConfig: IndexConfig;

  constructor(
    http: HttpClient,
    videoId: string,
    indexType: IndexType,
    additionalConfig: IndexSceneConfig = {}
  ) {
    super(http);
    this.videoId = videoId;
    this.indexConfig = {
      indexType: indexType,
      ...additionalConfig,
    };
    this.jobTitle = 'Index Job';
  }

  public start = async () => {
    try {
      const reqData = fromCamelToSnake(this.indexConfig);
      const res = await this.vhttp.post<NoDataResponse, IndexConfig>(
        [video, this.videoId, index],
        reqData
      );
      this._handleSuccess(res);
    } catch (err) {
      this._handleError(err);
    }
  };

  protected beforeSuccess = (data: NoDataResponse) => {
    if (data.success) {
      return {
        success: data.success,
      };
    } else {
      return {
        success: data.success,
        message: data.message,
      };
    }
  };
}

/**
 * SceneIndexJob is used to initalize a new video upload.
 *
 * @remarks
 * Uses the base Job class to implement a backoff to get the uploaded video data.
 */
export class SceneIndexJob extends Job<
  GetSceneIndexResponse,
  GetSceneIndexResponse,
  SceneIndexRecords
> {
  videoId: string;
  sceneIndexId: string;
  constructor(http: HttpClient, videoId: string, sceneIndexId: string) {
    super(http);
    this.videoId = videoId;
    this.sceneIndexId = sceneIndexId;
    this.jobTitle = 'Scene Index Job';
  }

  /**
   * Fetches the callbackURL from the server and initiates a backoff
   */
  public start = async () => {
    try {
      const res = await this.vhttp.get<SyncJobResponse>([
        video,
        this.videoId,
        index,
        scene,
        this.sceneIndexId,
      ]);
      if (res.status === processing) {
        void this._initiateBackoff(res.data.output_url);
      } else {
        // @ts-ignore
        this._handleSuccess(res.data);
      }
    } catch (err) {
      this._handleError(err);
    }
  };

  /**
   * Initializes a new video object with the returned data
   * @param data - Media data returned from the API and converted to camelCase
   * @returns a new Video object
   */
  protected beforeSuccess = (data: GetSceneIndexResponse) => {
    return data.sceneIndexRecords;
  };
}

export class ExtractScenesJob extends Job<object, object, object> {
  videoId: string;
  config: Partial<ExtractSceneConfig>;
  constructor(
    http: HttpClient,
    videoId: string,
    config: Partial<ExtractSceneConfig>
  ) {
    super(http);
    this.videoId = videoId;
    this.config = config;
    this.jobTitle = 'Extract Scenes Job';
  }

  /**
   * Fetches the callbackURL from the server and initiates a backoff
   */
  public start = async () => {
    try {
      const res = await this.vhttp.post<
        SyncJobResponse,
        Partial<ExtractSceneConfig>
      >([video, this.videoId, scenes], this.config);
      if (res.status === processing) {
        void this._initiateBackoff(res.data.output_url);
      } else {
        // @ts-ignore
        this._handleSuccess(res.data);
      }
    } catch (err) {
      this._handleError(err);
    }
  };

  /**
   * Initializes a new video object with the returned data
   * @param data - Media data returned from the API and converted to camelCase
   * @returns a new Video object
   */
  //@ts-ignore
  protected beforeSuccess = (data: object) => {
    //@ts-ignore
    if (data?.sceneCollection) {
      //@ts-ignore
      return data.sceneCollection;
    }
  };
}

/**
 * GenerateVideoJob is used to initialize a new video generation job.
 *
 * @remarks
 * Uses the base Job class to implement a backoff to get the generated video data.
 */
export class GenerateVideoJob extends Job<VideoResponse, VideoBase, Video> {
  public uploadData: SyncGenerateVideoConfig;
  public collectionId: string;
  constructor(
    data: SyncGenerateVideoConfig,
    collectionId: string,
    http: HttpClient
  ) {
    super(http);
    this.uploadData = data;
    this.collectionId = collectionId;
    this.jobTitle = 'Generate Video Job';
  }

  /**
   * Fetches the callbackURL from the server and initiates a backoff
   */
  public start = async () => {
    try {
      const res = await this.vhttp.post<
        SyncJobResponse,
        SyncGenerateVideoConfig
      >([collection, this.collectionId, generate, video], this.uploadData);

      void this._initiateBackoff(res.data.output_url);
    } catch (err) {
      this._handleError(err);
    }
  };

  /**
   * Converts the API response to a Video instance.
   * @param data - Video data returned from the API and converted to camelCase
   * @returns a new Video object
   */
  protected beforeSuccess = (data: VideoBase) => {
    return new Video(this.vhttp, data);
  };
}

/**
 * GenerateAudioJob is used to initialize a new audio generation job (music, sound effect, or voice).
 *
 * @remarks
 * Uses the base Job class to implement a backoff to get the generated audio data.
 */
export class GenerateAudioJob extends Job<AudioResponse, AudioBase, Audio> {
  public uploadData: SyncGenerateAudioConfig;
  public collectionId: string;
  constructor(
    data: SyncGenerateAudioConfig,
    collectionId: string,
    http: HttpClient
  ) {
    super(http);
    this.uploadData = data;
    this.collectionId = collectionId;
    this.jobTitle = 'Generate Audio Job';
  }

  /**
   * Fetches the callbackURL from the server and initiates a backoff
   */
  public start = async () => {
    try {
      const res = await this.vhttp.post<
        SyncJobResponse,
        SyncGenerateAudioConfig
      >([collection, this.collectionId, generate, audio], this.uploadData);

      void this._initiateBackoff(res.data.output_url);
    } catch (err) {
      this._handleError(err);
    }
  };

  /**
   * Converts the API response to an Audio instance.
   * @param data - Audio data returned from the API and converted to camelCase
   * @returns a new Audio object
   */
  protected beforeSuccess = (data: AudioBase) => {
    return new Audio(this.vhttp, data);
  };
}

/**
 * GenerateImageJob is used to initialize a new image generation job.
 *
 * @remarks
 * Uses the base Job class to implement a backoff to get the generated image data.
 */
export class GenerateImageJob extends Job<ImageResponse, ImageBase, Image> {
  public uploadData: SyncGenerateImageConfig;
  public collectionId: string;
  constructor(
    data: SyncGenerateImageConfig,
    collectionId: string,
    http: HttpClient
  ) {
    super(http);
    this.uploadData = data;
    this.collectionId = collectionId;
    this.jobTitle = 'Generate Image Job';
  }

  /**
   * Fetches the callbackURL from the server and initiates a backoff
   */
  public start = async () => {
    try {
      const res = await this.vhttp.post<
        SyncJobResponse,
        SyncGenerateImageConfig
      >([collection, this.collectionId, generate, image], this.uploadData);

      void this._initiateBackoff(res.data.output_url);
    } catch (err) {
      this._handleError(err);
    }
  };

  /**
   * Converts the API response to an Image instance.
   * @param data - Image data returned from the API and converted to camelCase
   * @returns a new Image object
   */
  protected beforeSuccess = (data: ImageBase) => {
    return new Image(this.vhttp, data);
  };
}

/**
 * DubVideoJob is used to initialize a new video dubbing job.
 *
 * @remarks
 * Uses the base Job class to implement a backoff to get the dubbed video data.
 */
export class DubVideoJob extends Job<VideoResponse, VideoBase, Video> {
  public uploadData: SyncDubVideoConfig;
  public collectionId: string;
  constructor(
    data: SyncDubVideoConfig,
    collectionId: string,
    http: HttpClient
  ) {
    super(http);
    this.uploadData = data;
    this.collectionId = collectionId;
    this.jobTitle = 'Dub Video Job';
  }

  /**
   * Fetches the callbackURL from the server and initiates a backoff
   */
  public start = async () => {
    try {
      const res = await this.vhttp.post<SyncJobResponse, SyncDubVideoConfig>(
        [collection, this.collectionId, generate, video, dub],
        this.uploadData
      );

      void this._initiateBackoff(res.data.output_url);
    } catch (err) {
      this._handleError(err);
    }
  };

  /**
   * Converts the API response to a Video instance.
   * @param data - Video data returned from the API and converted to camelCase
   * @returns a new Video object
   */
  protected beforeSuccess = (data: VideoBase) => {
    return new Video(this.vhttp, data);
  };
}
