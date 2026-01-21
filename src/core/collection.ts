import { ApiPath } from '@/constants';
import type {
  CollectionBase,
  ICollection,
  VideoBase,
  AudioBase,
  ImageBase,
  MeetingBase,
  RTStreamBase,
  RecordMeetingConfig,
  CaptureSessionBase,
} from '@/interfaces/core';
import { IndexType, SearchType } from '@/types/search';
import type { FileUploadConfig, URLUploadConfig } from '@/types/collection';
import type {
  CreateCaptureSessionConfig,
  CaptureSessionStatusType,
} from '@/types/capture';
import type {
  GetVideos,
  GetAudios,
  GetImages,
  VideoResponse,
  AudioResponse,
  ImageResponse,
} from '@/types/response';
import { HttpClient } from '@/utils/httpClient';
import { uploadToServer } from '@/utils/upload';
import {
  DefaultSearchType,
  DefaultIndexType,
  SearchTypeValues,
} from '@/core/config';
import { SearchFactory } from './search';
import { SearchResult } from './search/searchResult';
import { Video } from './video';
import { Audio } from './audio';
import { Image } from './image';
import { Meeting } from './meeting';
import { CaptureSession } from './captureSession';
import { RTStream, RTStreamSearchResult, RTStreamShot } from './rtstream';
import { VideodbError } from '@/utils/error';

const {
  video,
  audio,
  image,
  collection,
  rtstream,
  generate,
  text,
  dub,
  search,
  title,
  meeting,
  record,
} = ApiPath;

/**
 * The base VideoDB class
 * @remarks
 * The base class through which all videodb actions are possible
 */
export class Collection implements ICollection {
  public readonly id: string;
  public readonly name?: string;
  public readonly description?: string;
  public readonly isPublic?: boolean;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: CollectionBase) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.isPublic = data.isPublic;
    this.#vhttp = http;
  }

  /** * Get all videos from the collection
   * @returns A list of objects of the Video class
   * @throws an error if the request fails
   */
  public getVideos = async () => {
    const res = await this.#vhttp.get<GetVideos>([video], {
      params: { collection_id: this.id },
    });
    return res.data.videos.map(vid => new Video(this.#vhttp, vid as VideoBase));
  };

  /**
   * Get all the information for a specific video
   * @param videoId - Unique ID of the video.
   * @returns An object of the Video class
   * @throws an error if the request fails
   */
  public getVideo = async (videoId: string) => {
    if (!videoId.trim()) {
      throw new VideodbError('Video ID cannot be empty');
    }
    const res = await this.#vhttp.get<VideoResponse>([video, videoId], {
      params: { collection_id: this.id },
    });
    return new Video(this.#vhttp, res.data as VideoBase);
  };

  /**
   *
   * @param videoId - Id of the video to be deleted
   * @returns A promise that resolves when delete is successful
   * @throws an error if the request fails
   */
  public deleteVideo = async (videoId: string) => {
    if (!videoId.trim()) {
      throw new VideodbError('Video ID cannot be empty');
    }
    return await this.#vhttp.delete<Record<string, never>>([video, videoId], {
      params: { collection_id: this.id },
    });
  };

  /** * Get all audios from the collection
   * @returns A list of objects of the Audio class
   * @throws an error if the request fails
   */
  public getAudios = async () => {
    const res = await this.#vhttp.get<GetAudios>([audio], {
      params: { collection_id: this.id },
    });
    return res.data.audios.map(aud => new Audio(this.#vhttp, aud as AudioBase));
  };

  /**
   * Get all the information for a specific audio
   * @param audioId- Unique ID of the audio.
   * @returns An object of the Audio class
   * @throws an error if the request fails
   */
  public getAudio = async (audioId: string) => {
    if (!audioId.trim()) {
      throw new VideodbError('Audio ID cannot be empty');
    }
    const res = await this.#vhttp.get<AudioResponse>([audio, audioId], {
      params: { collection_id: this.id },
    });
    return new Audio(this.#vhttp, res.data as AudioBase);
  };

  /**
   *
   * @param audioId- Id of the audio to be deleted
   * @returns A promise that resolves when delete is successful
   * @throws an error if the request fails
   */
  public deleteAudio = async (audioId: string) => {
    if (!audioId.trim()) {
      throw new VideodbError('Audio ID cannot be empty');
    }
    return await this.#vhttp.delete<Record<string, never>>([audio, audioId], {
      params: { collection_id: this.id },
    });
  };

  /** * Get all images from the collection
   * @returns A list of objects of the Image class
   * @throws an error if the request fails
   */
  public getImages = async () => {
    const res = await this.#vhttp.get<GetImages>([image], {
      params: { collection_id: this.id },
    });
    return res.data.images.map(img => new Image(this.#vhttp, img as ImageBase));
  };

  /**
   * Get all the information for a specific image
   * @param imageId- Unique ID of the image.
   * @returns An object of the Image class
   * @throws an error if the request fails
   */
  public getImage = async (imageId: string) => {
    if (!imageId.trim()) {
      throw new VideodbError('Image ID cannot be empty');
    }
    const res = await this.#vhttp.get<ImageResponse>([image, imageId], {
      params: { collection_id: this.id },
    });
    return new Image(this.#vhttp, res.data as ImageBase);
  };

  /**
   *
   * @param imageId- Id of the image to be deleted
   * @returns A promise that resolves when delete is successful
   * @throws an error if the request fails
   */
  public deleteImage = async (imageId: string) => {
    if (!imageId.trim()) {
      throw new VideodbError('Image ID cannot be empty');
    }
    return await this.#vhttp.delete<Record<string, never>>([image, imageId], {
      params: { collection_id: this.id },
    });
  };

  /**
   * Upload a file from the local filesystem.
   * @param data - Upload configuration containing:
   *   - filePath: absolute path to a file
   *   - callbackUrl: (optional) A url that will be called once upload is finished
   *   - name: (optional) Name of the file
   *   - description: (optional) Description of the file
   * @returns Video, Audio, or Image object. Returns undefined if callbackUrl is provided.
   */
  public uploadFile = async (data: FileUploadConfig) => {
    return uploadToServer(this.#vhttp, this.id, data);
  };

  /**
   * Upload a file from a URL.
   * @param data - Upload configuration containing:
   *   - url: URL of the hosted file
   *   - callbackUrl: (optional) A url that will be called once upload is finished
   *   - name: (optional) Name of the file
   *   - description: (optional) Description of the file
   * @returns Video, Audio, or Image object. Returns undefined if callbackUrl is provided.
   */
  public uploadURL = async (data: URLUploadConfig) => {
    return uploadToServer(this.#vhttp, this.id, data);
  };

  /**
   * Search for a query in the collection
   * @param query - Search query
   * @param searchType - [optional] Type of search to be performed
   * @param indexType - [optional] Index type
   * @param resultThreshold - [optional] Result Threshold
   * @param scoreThreshold - [optional] Score Threshold
   * @param dynamicScorePercentage - [optional] Percentage of dynamic score to consider
   * @param filter - [optional] Additional metadata filters
   * @param namespace - [optional] Search namespace ("rtstream" to search RTStreams)
   * @param sceneIndexId - [optional] Filter by specific scene index
   * @returns SearchResult or RTStreamSearchResult object
   */
  public search = async (
    query: string,
    searchType?: SearchType,
    indexType?: IndexType,
    resultThreshold?: number,
    scoreThreshold?: number,
    dynamicScorePercentage?: number,
    filter?: Array<Record<string, unknown>>,
    namespace?: string,
    sceneIndexId?: string
  ): Promise<SearchResult | RTStreamSearchResult> => {
    // Handle RTStream search
    if (namespace === 'rtstream') {
      const data: Record<string, unknown> = { query };
      if (sceneIndexId !== undefined) data.sceneIndexId = sceneIndexId;
      if (resultThreshold !== undefined) data.resultThreshold = resultThreshold;
      if (scoreThreshold !== undefined) data.scoreThreshold = scoreThreshold;
      if (dynamicScorePercentage !== undefined)
        data.dynamicScorePercentage = dynamicScorePercentage;
      if (filter !== undefined) data.filter = filter;

      const res = await this.#vhttp.post<{ results: unknown[] }, typeof data>(
        [rtstream, collection, this.id, search],
        data
      );

      const results = (res.data?.results || []) as Array<Record<string, unknown>>;
      const shots = results.map(
        (result: Record<string, unknown>) =>
          new RTStreamShot(this.#vhttp, {
            rtstreamId:
              (result.rtstreamId as string) || (result.id as string) || '',
            rtstreamName: result.rtstreamName as string | undefined,
            start: (result.start as number) || 0,
            end: (result.end as number) || 0,
            text: result.text as string | undefined,
            searchScore: result.score as number | undefined,
            sceneIndexId: result.sceneIndexId as string | undefined,
            sceneIndexName: result.sceneIndexName as string | undefined,
            metadata: result.metadata as Record<string, unknown> | undefined,
          })
      );
      return new RTStreamSearchResult(this.id, shots);
    }

    // Handle regular search
    const s = new SearchFactory(this.#vhttp);
    const searchFunc = s.getSearch(searchType ?? DefaultSearchType);

    const results = await searchFunc.searchInsideCollection({
      collectionId: this.id,
      query: query,
      searchType: searchType ?? DefaultSearchType,
      indexType: indexType ?? DefaultIndexType,
      resultThreshold: resultThreshold,
      scoreThreshold: scoreThreshold,
    });
    return results;
  };

  /**
   * Delete the collection
   * @returns A promise that resolves when delete is successful
   */
  public delete = async () => {
    return await this.#vhttp.delete<Record<string, never>>([
      collection,
      this.id,
    ]);
  };

  /**
   * Connect to an rtstream
   * @param url - URL of the rtstream
   * @param name - Name of the rtstream
   * @param sampleRate - Sample rate of the rtstream (optional, server default: 30)
   * @param video - Enable video streaming (optional, server default: true)
   * @param audio - Enable audio streaming (optional, server default: false)
   * @param enableTranscript - Enable real-time transcription (optional)
   * @param wsConnectionId - WebSocket connection ID for receiving events (optional)
   * @returns RTStream object
   */
  public connectRtstream = async (
    url: string,
    name: string,
    sampleRate?: number,
    video?: boolean,
    audio?: boolean,
    enableTranscript?: boolean,
    wsConnectionId?: string
  ): Promise<RTStream> => {
    const data: Record<string, unknown> = {
      collectionId: this.id,
      url,
      name,
    };
    if (sampleRate !== undefined) data.sampleRate = sampleRate;
    if (video !== undefined) data.video = video;
    if (audio !== undefined) data.audio = audio;
    if (enableTranscript !== undefined) data.enableTranscript = enableTranscript;
    if (wsConnectionId !== undefined) data.wsConnectionId = wsConnectionId;

    const res = await this.#vhttp.post<RTStreamBase, typeof data>(
      [rtstream],
      data
    );
    return new RTStream(this.#vhttp, res.data);
  };

  /**
   * Get an rtstream by its ID
   * @param id - ID of the rtstream
   * @returns RTStream object
   */
  public getRtstream = async (id: string): Promise<RTStream> => {
    const res = await this.#vhttp.get<RTStreamBase>([rtstream, id]);
    return new RTStream(this.#vhttp, res.data);
  };

  /**
   * List all rtstreams in the collection
   * @param options - Query options: limit (default 10), offset (default 0), status, name, ordering
   * @returns List of RTStream objects
   */
  public listRtstreams = async (options?: {
    limit?: number;
    offset?: number;
    status?: string;
    name?: string;
    ordering?: string;
  }): Promise<RTStream[]> => {
    const params: Record<string, string | number> = {};
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.offset !== undefined) params.offset = options.offset;
    if (options?.status !== undefined) params.status = options.status;
    if (options?.name !== undefined) params.name = options.name;
    if (options?.ordering !== undefined) params.ordering = options.ordering;

    const res = await this.#vhttp.get<{ results: RTStreamBase[] }>([rtstream], {
      params,
    });
    return (res.data?.results || []).map(rt => new RTStream(this.#vhttp, rt));
  };

  /**
   * Generate an image from a prompt
   * @param prompt - Prompt for the image generation
   * @param aspectRatio - Aspect ratio of the image (optional)
   * @param callbackUrl - URL to receive the callback (optional)
   * @returns Image object
   */
  public generateImage = async (
    prompt: string,
    aspectRatio: '1:1' | '9:16' | '16:9' | '4:3' | '3:4' = '1:1',
    callbackUrl?: string
  ): Promise<Image | undefined> => {
    const res = await this.#vhttp.post<ImageBase, object>(
      [collection, this.id, generate, image],
      { prompt, aspectRatio, callbackUrl }
    );
    if (res.data) {
      return new Image(this.#vhttp, res.data);
    }
  };

  /**
   * Generate music from a prompt
   * @param prompt - Prompt for the music generation
   * @param duration - Duration of the music in seconds
   * @param callbackUrl - URL to receive the callback (optional)
   * @returns Audio object
   */
  public generateMusic = async (
    prompt: string,
    duration: number = 5,
    callbackUrl?: string
  ): Promise<Audio | undefined> => {
    const res = await this.#vhttp.post<AudioBase, object>(
      [collection, this.id, generate, audio],
      { prompt, duration, audioType: 'music', callbackUrl }
    );
    if (res.data) {
      return new Audio(this.#vhttp, res.data);
    }
  };

  /**
   * Generate sound effect from a prompt
   * @param prompt - Prompt for the sound effect generation
   * @param duration - Duration of the sound effect in seconds
   * @param config - Configuration for the sound effect generation
   * @param callbackUrl - URL to receive the callback (optional)
   * @returns Audio object
   */
  public generateSoundEffect = async (
    prompt: string,
    duration: number = 2,
    config: Record<string, unknown> = {},
    callbackUrl?: string
  ): Promise<Audio | undefined> => {
    const res = await this.#vhttp.post<AudioBase, object>(
      [collection, this.id, generate, audio],
      { prompt, duration, audioType: 'sound_effect', config, callbackUrl }
    );
    if (res.data) {
      return new Audio(this.#vhttp, res.data);
    }
  };

  /**
   * Generate voice from text
   * @param textContent - Text to convert to voice
   * @param voiceName - Name of the voice to use
   * @param config - Configuration for the voice generation
   * @param callbackUrl - URL to receive the callback (optional)
   * @returns Audio object
   */
  public generateVoice = async (
    textContent: string,
    voiceName: string = 'Default',
    config: Record<string, unknown> = {},
    callbackUrl?: string
  ): Promise<Audio | undefined> => {
    const res = await this.#vhttp.post<AudioBase, object>(
      [collection, this.id, generate, audio],
      { text: textContent, audioType: 'voice', voiceName, config, callbackUrl }
    );
    if (res.data) {
      return new Audio(this.#vhttp, res.data);
    }
  };

  /**
   * Generate a video from the given text prompt
   * @param prompt - Text prompt used as input for video generation
   * @param duration - Duration of the generated video in seconds (5-8)
   * @param callbackUrl - URL to receive callback once video generation is complete
   * @returns Video object
   */
  public generateVideo = async (
    prompt: string,
    duration: number = 5,
    callbackUrl?: string
  ): Promise<Video | undefined> => {
    const res = await this.#vhttp.post<VideoBase, object>(
      [collection, this.id, generate, video],
      { prompt, duration, callbackUrl }
    );
    if (res.data) {
      return new Video(this.#vhttp, res.data);
    }
  };

  /**
   * Generate text from a prompt using genai offering
   * @param prompt - Prompt for the text generation
   * @param modelName - Model name to use ("basic", "pro" or "ultra")
   * @param responseType - Desired response type ("text" or "json")
   * @returns Generated text response
   */
  public generateText = async (
    prompt: string,
    modelName: 'basic' | 'pro' | 'ultra' = 'basic',
    responseType: 'text' | 'json' = 'text'
  ): Promise<string | Record<string, unknown>> => {
    const res = await this.#vhttp.post<
      string | Record<string, unknown>,
      object
    >([collection, this.id, generate, text], {
      prompt,
      modelName,
      responseType,
    });
    return res.data;
  };

  /**
   * Dub a video to another language
   * @param videoId - ID of the video to dub
   * @param languageCode - Language code to dub the video to
   * @param callbackUrl - URL to receive the callback (optional)
   * @returns Video object
   */
  public dubVideo = async (
    videoId: string,
    languageCode: string,
    callbackUrl?: string
  ): Promise<Video | undefined> => {
    const res = await this.#vhttp.post<VideoBase, object>(
      [collection, this.id, generate, video, dub],
      { videoId, languageCode, callbackUrl }
    );
    if (res.data) {
      return new Video(this.#vhttp, res.data);
    }
  };

  /**
   * Search by video title
   * @param query - Search query
   * @returns List of video search results
   */
  public searchTitle = async (
    query: string
  ): Promise<Array<{ video: Video }>> => {
    const res = await this.#vhttp.post<Array<{ video: VideoBase }>, object>(
      [collection, this.id, search, title],
      { query, searchType: SearchTypeValues.scene }
    );
    return (res.data || []).map(result => ({
      video: new Video(this.#vhttp, result.video),
    }));
  };

  /**
   * Make the collection public
   */
  public makePublic = async (): Promise<void> => {
    await this.#vhttp.patch([collection, this.id], { isPublic: true });
  };

  /**
   * Make the collection private
   */
  public makePrivate = async (): Promise<void> => {
    await this.#vhttp.patch([collection, this.id], { isPublic: false });
  };

  /**
   * Record a meeting and upload it to this collection
   * @param config - Meeting recording configuration
   * @returns Meeting object representing the recording bot
   */
  public recordMeeting = async (
    config: RecordMeetingConfig
  ): Promise<Meeting> => {
    const res = await this.#vhttp.post<
      MeetingBase & { meetingId: string },
      object
    >([collection, this.id, meeting, record], {
      meetingUrl: config.meetingUrl,
      botName: config.botName,
      botImageUrl: config.botImageUrl,
      meetingTitle: config.meetingTitle,
      callbackUrl: config.callbackUrl,
      callbackData: config.callbackData || {},
      timeZone: config.timeZone || 'UTC',
    });
    return new Meeting(this.#vhttp, {
      ...res.data,
      id: res.data.meetingId,
      collectionId: this.id,
    });
  };

  /**
   * Get a meeting by its ID
   * @param meetingId - ID of the meeting
   * @returns Meeting object
   */
  public getMeeting = async (meetingId: string): Promise<Meeting> => {
    const meetingObj = new Meeting(this.#vhttp, {
      id: meetingId,
      collectionId: this.id,
    });
    await meetingObj.refresh();
    return meetingObj;
  };

  /**
   * Create a capture session for video recording
   * @param config - Capture session configuration
   * @returns CaptureSession object
   *
   * @example
   * ```typescript
   * const coll = await conn.getCollection('col-xxx');
   *
   * const session = await coll.createCaptureSession({
   *   endUserId: 'user_abc',
   *   callbackUrl: 'https://example.com/webhook',
   *   metadata: { clientName: 'desktop-app' },
   * });
   *
   * const token = await session.generateSessionToken({ expiresIn: 600 });
   * // Send token to desktop client
   * ```
   */
  public createCaptureSession = async (
    config: CreateCaptureSessionConfig
  ): Promise<CaptureSession> => {
    const data: Record<string, unknown> = {
      endUserId: config.endUserId,
    };
    if (config.callbackUrl) data.callbackUrl = config.callbackUrl;
    if (config.wsConnectionId) data.wsConnectionId = config.wsConnectionId;
    if (config.metadata) data.metadata = config.metadata;

    const res = await this.#vhttp.post<
      { sessionId: string; endUserId?: string; status?: string; createdAt?: number },
      typeof data
    >([ApiPath.collection, this.id, ApiPath.capture, ApiPath.session], data);

    return new CaptureSession(this.#vhttp, {
      id: res.data.sessionId,
      collectionId: this.id,
      endUserId: res.data.endUserId,
      status: res.data.status as CaptureSessionStatusType | undefined,
      callbackUrl: config.callbackUrl,
      metadata: config.metadata,
      createdAt: res.data.createdAt,
    });
  };
}
