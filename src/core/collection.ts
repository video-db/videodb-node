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
} from '@/interfaces/core';
import { IndexType, SearchType } from '@/types/search';
import type { FileUploadConfig, URLUploadConfig } from '@/types/collection';
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
import { Video } from './video';
import { Audio } from './audio';
import { Image } from './image';
import { Meeting } from './meeting';
import { RTStream } from './rtstream';
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
  public meta: CollectionBase;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: CollectionBase) {
    this.meta = data;
    this.#vhttp = http;
  }

  /** * Get all videos from the collection
   * @returns A list of objects of the Video class
   * @throws an error if the request fails
   */
  public getVideos = async () => {
    const res = await this.#vhttp.get<GetVideos>([video], {
      params: { collection_id: this.meta.id },
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
      params: { collection_id: this.meta.id },
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
      params: { collection_id: this.meta.id },
    });
  };

  /** * Get all audios from the collection
   * @returns A list of objects of the Audio class
   * @throws an error if the request fails
   */
  public getAudios = async () => {
    const res = await this.#vhttp.get<GetAudios>([audio], {
      params: { collection_id: this.meta.id },
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
      params: { collection_id: this.meta.id },
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
      params: { collection_id: this.meta.id },
    });
  };

  /** * Get all images from the collection
   * @returns A list of objects of the Image class
   * @throws an error if the request fails
   */
  public getImages = async () => {
    const res = await this.#vhttp.get<GetImages>([image], {
      params: { collection_id: this.meta.id },
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
      params: { collection_id: this.meta.id },
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
      params: { collection_id: this.meta.id },
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
    return uploadToServer(this.#vhttp, this.meta.id, data);
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
    return uploadToServer(this.#vhttp, this.meta.id, data);
  };

  /**
   * @param query - Search query
   * @param searchType - [optional] Type of search to be performed
   * @param resultThreshold - [optional] Result Threshold
   * @param scoreThreshold - [optional] Score Threshold
   */
  public search = async (
    query: string,
    searchType?: SearchType,
    indexType?: IndexType,
    resultThreshold?: number,
    scoreThreshold?: number
  ) => {
    const s = new SearchFactory(this.#vhttp);
    const searchFunc = s.getSearch(searchType ?? DefaultSearchType);

    const results = await searchFunc.searchInsideCollection({
      collectionId: this.meta.id,
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
      this.meta.id,
    ]);
  };

  /**
   * Connect to an rtstream
   * @param url - URL of the rtstream
   * @param name - Name of the rtstream
   * @param sampleRate - Sample rate of the rtstream (optional)
   * @returns RTStream object
   */
  public connectRtstream = async (
    url: string,
    name: string,
    sampleRate?: number
  ): Promise<RTStream> => {
    const res = await this.#vhttp.post<RTStreamBase, object>([rtstream], {
      collectionId: this.meta.id,
      url,
      name,
      sampleRate,
    });
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
   * @returns List of RTStream objects
   */
  public listRtstreams = async (): Promise<RTStream[]> => {
    const res = await this.#vhttp.get<{ results: RTStreamBase[] }>([rtstream]);
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
      [collection, this.meta.id, generate, image],
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
      [collection, this.meta.id, generate, audio],
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
      [collection, this.meta.id, generate, audio],
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
      [collection, this.meta.id, generate, audio],
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
      [collection, this.meta.id, generate, video],
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
    >([collection, this.meta.id, generate, text], {
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
      [collection, this.meta.id, generate, video, dub],
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
      [collection, this.meta.id, search, title],
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
    await this.#vhttp.patch([collection, this.meta.id], { isPublic: true });
  };

  /**
   * Make the collection private
   */
  public makePrivate = async (): Promise<void> => {
    await this.#vhttp.patch([collection, this.meta.id], { isPublic: false });
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
    >([collection, this.meta.id, meeting, record], {
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
      collectionId: this.meta.id,
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
      collectionId: this.meta.id,
    });
    await meetingObj.refresh();
    return meetingObj;
  };
}
