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
  ListCaptureSessionsConfig,
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
      if (sceneIndexId !== undefined) data.scene_index_id = sceneIndexId;
      if (resultThreshold !== undefined) data.result_threshold = resultThreshold;
      if (scoreThreshold !== undefined) data.score_threshold = scoreThreshold;
      if (dynamicScorePercentage !== undefined)
        data.dynamic_score_percentage = dynamicScorePercentage;
      if (filter !== undefined) data.filter = filter;

      const res = await this.#vhttp.post<{ results: unknown[] }, typeof data>(
        [rtstream, collection, this.id, search],
        data
      );

      const results = (res.data?.results || []) as Array<
        Record<string, unknown>
      >;
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
      dynamicScorePercentage: dynamicScorePercentage,
      filter: filter,
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
   * Connect to an RTStream
   * @param url - URL of the RTStream
   * @param name - Name of the RTStream
   * @param mediaTypes - List of media types to capture (default: ['video']). Valid values: 'video', 'audio'
   * @param sampleRate - Sample rate of the RTStream (optional, server default: 30)
   * @param store - Enable recording storage (optional, default: false). When true, the stream recording is stored and can be exported via RTStream.export()
   * @param enableTranscript - Enable real-time transcription (optional)
   * @param wsConnectionId - WebSocket connection ID for receiving events (optional)
   * @returns RTStream object
   */
  public connectRTStream = async (
    url: string,
    name: string,
    mediaTypes?: Array<'video' | 'audio'>,
    sampleRate?: number,
    store?: boolean,
    enableTranscript?: boolean,
    wsConnectionId?: string
  ): Promise<RTStream> => {
    if (mediaTypes !== undefined) {
      const validTypes = new Set(['video', 'audio']);
      const invalidTypes = mediaTypes.filter(t => !validTypes.has(t));
      if (invalidTypes.length > 0 || mediaTypes.length === 0) {
        throw new VideodbError(
          `Invalid mediaTypes: ${invalidTypes.join(', ')}. Valid values: 'video', 'audio'`
        );
      }
    }

    const data: Record<string, unknown> = {
      collection_id: this.id,
      url,
      name,
      media_types: mediaTypes ?? ['video'],
    };
    if (sampleRate !== undefined) data.sample_rate = sampleRate;
    if (store !== undefined) data.store = store;
    if (enableTranscript !== undefined)
      data.enable_transcript = enableTranscript;
    if (wsConnectionId !== undefined) data.ws_connection_id = wsConnectionId;

    const res = await this.#vhttp.post<RTStreamBase, typeof data>(
      [rtstream],
      data
    );
    return new RTStream(this.#vhttp, res.data);
  };

  /**
   * Get an RTStream by its ID
   * @param id - ID of the RTStream
   * @returns RTStream object
   */
  public getRTStream = async (id: string): Promise<RTStream> => {
    const res = await this.#vhttp.get<RTStreamBase>([rtstream, id]);
    return new RTStream(this.#vhttp, res.data);
  };

  /**
   * List all RTStreams in the collection
   * @param options - Query options: limit (default 10), offset (default 0), status, name, ordering
   * @returns List of RTStream objects
   */
  public listRTStreams = async (options?: {
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
      { prompt, aspect_ratio: aspectRatio, callback_url: callbackUrl }
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
      { prompt, duration, audio_type: 'music', callback_url: callbackUrl }
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
      { prompt, duration, audio_type: 'sound_effect', config, callback_url: callbackUrl }
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
      { text: textContent, audio_type: 'voice', voice_name: voiceName, config, callback_url: callbackUrl }
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
      { prompt, duration, callback_url: callbackUrl }
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
      model_name: modelName,
      response_type: responseType,
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
      { video_id: videoId, language_code: languageCode, callback_url: callbackUrl }
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
      { query, search_type: SearchTypeValues.llm }
    );
    return (res.data || []).map(result => ({
      video: new Video(this.#vhttp, result.video),
    }));
  };

  /**
   * Make the collection public
   */
  public makePublic = async (): Promise<void> => {
    await this.#vhttp.patch([collection, this.id], { is_public: true });
  };

  /**
   * Make the collection private
   */
  public makePrivate = async (): Promise<void> => {
    await this.#vhttp.patch([collection, this.id], { is_public: false });
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
      meeting_url: config.meetingUrl,
      bot_name: config.botName,
      bot_image_url: config.botImageUrl,
      meeting_title: config.meetingTitle,
      callback_url: config.callbackUrl,
      callback_data: config.callbackData || {},
      time_zone: config.timeZone || 'UTC',
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
   * const token = await conn.generateClientToken(86400);
   * // Send token to desktop client
   * ```
   */
  public createCaptureSession = async (
    config: CreateCaptureSessionConfig
  ): Promise<CaptureSession> => {
    const data: Record<string, unknown> = {
      end_user_id: config.endUserId,
    };
    if (config.callbackUrl) data.callback_url = config.callbackUrl;
    if (config.wsConnectionId) data.ws_connection_id = config.wsConnectionId;
    if (config.metadata) data.metadata = config.metadata;

    const res = await this.#vhttp.post<
      {
        sessionId: string;
        endUserId?: string;
        status?: string;
        createdAt?: number;
      },
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

  /**
   * Get an existing capture session by ID
   * @param sessionId - ID of the capture session
   * @returns CaptureSession object
   *
   * @example
   * ```typescript
   * const session = await coll.getCaptureSession('cap-xxx');
   * await session.refresh();
   * console.log(session.status);
   * ```
   */
  public getCaptureSession = async (
    sessionId: string
  ): Promise<CaptureSession> => {
    const res = await this.#vhttp.get<
      CaptureSessionBase & { rtstreams?: Array<Record<string, unknown>> }
    >([ApiPath.collection, this.id, ApiPath.capture, ApiPath.session, sessionId]);

    const responseData = res.data as Record<string, unknown>;

    // Normalize rtstreams before passing to CaptureSession
    const rtstreams = (responseData.rtstreams as Array<Record<string, unknown>>) || [];
    for (const rts of rtstreams) {
      if (rts && typeof rts === 'object') {
        if ('rtstream_id' in rts && !('id' in rts)) {
          rts.id = rts.rtstream_id;
          delete rts.rtstream_id;
        }
        if (!('collection_id' in rts)) {
          rts.collection_id = this.id;
        }
      }
    }

    // Extract id and collection_id from response to avoid duplicate arguments
    delete responseData.id;
    delete responseData.collection_id;

    return new CaptureSession(this.#vhttp, {
      id: sessionId,
      collectionId: this.id,
      ...responseData,
    } as CaptureSessionBase);
  };

  /**
   * List all capture sessions in this collection
   * @param config - Filter configuration
   * @returns List of CaptureSession objects
   *
   * @example
   * ```typescript
   * const sessions = await coll.listCaptureSessions({ status: 'active' });
   * ```
   */
  public listCaptureSessions = async (
    config: ListCaptureSessionsConfig = {}
  ): Promise<CaptureSession[]> => {
    const params: Record<string, unknown> = {};
    if (config.status) params.status = config.status;

    const res = await this.#vhttp.get<{
      sessions: Array<Record<string, unknown>>;
    }>([ApiPath.collection, this.id, ApiPath.capture, ApiPath.session], { params });

    const sessions: CaptureSession[] = [];
    for (const sessionData of res.data?.sessions || []) {
      // Extract session_id with fallback like Python
      const sessionId =
        (sessionData.id as string) || (sessionData.session_id as string);
      delete sessionData.id;
      delete sessionData.session_id;

      // Normalize rtstreams
      const rtstreams = (sessionData.rtstreams as Array<Record<string, unknown>>) || [];
      for (const rts of rtstreams) {
        if (rts && typeof rts === 'object') {
          if ('rtstream_id' in rts && !('id' in rts)) {
            rts.id = rts.rtstream_id;
            delete rts.rtstream_id;
          }
          if (!('collection_id' in rts)) {
            rts.collection_id = this.id;
          }
        }
      }

      // Remove collection_id from data
      delete sessionData.collection_id;

      sessions.push(
        new CaptureSession(this.#vhttp, {
          id: sessionId,
          collectionId: this.id,
          ...sessionData,
        } as CaptureSessionBase)
      );
    }
    return sessions;
  };
}
