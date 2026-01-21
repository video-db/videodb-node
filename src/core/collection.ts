import { ApiPath } from '@/constants';
import type {
  CollectionBase,
  ICollection,
  VideoBase,
  AudioBase,
  ImageBase,
} from '@/interfaces/core';
import { IndexType, SearchType } from '@/types/search';
import type {
  DubVideoConfig,
  FileUploadConfig,
  GenerateAudioConfig,
  GenerateImageConfig,
  GenerateVideoConfig,
  URLUploadConfig,
} from '@/types/collection';
import type {
  GetVideos,
  GetAudios,
  GetImages,
  VideoResponse,
  AudioResponse,
  ImageResponse,
} from '@/types/response';
import { fromSnakeToCamel } from '@/utils';
import { HttpClient } from '@/utils/httpClient';
import { uploadToServer } from '@/utils/upload';
import { DefaultSearchType, DefaultIndexType } from '@/core/config';
import { SearchFactory } from './search';
import { Video } from './video';
import { Audio } from './audio';
import { Image } from './image';
import { VideodbError } from '@/utils/error';
import {
  DubVideoJob,
  GenerateAudioJob,
  GenerateImageJob,
  GenerateVideoJob,
} from '@/utils/job';

const { video, audio, image } = ApiPath;

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
    const videos = res.data.videos;
    return videos.map(vid => {
      const data = fromSnakeToCamel(vid) as VideoBase;
      return new Video(this.#vhttp, data);
    });
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
    const data = fromSnakeToCamel(res.data) as VideoBase;
    return new Video(this.#vhttp, data);
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
    const audios = res.data.audios;
    return audios.map(audio => {
      const data = fromSnakeToCamel(audio) as AudioBase;
      return new Audio(this.#vhttp, data);
    });
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
    const data = fromSnakeToCamel(res.data) as AudioBase;
    return new Audio(this.#vhttp, data);
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
    const images = res.data.images;
    return images.map(audio => {
      const data = fromSnakeToCamel(audio) as ImageBase;
      return new Image(this.#vhttp, data);
    });
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
    const data = fromSnakeToCamel(res.data) as ImageBase;
    return new Image(this.#vhttp, data);
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
   * @param filePath - absolute path to a file
   * @param callbackUrl- [optional] A url that will be called once upload is finished
   * @param name - [optional] Name of the file
   * @param description - [optional] Description of the file
   *
   * @see
   * Providing a callbackUrl will return undefined and not providing one
   * will return a Job object (TODO: Implement proper type for this condition)
   */
  public uploadFile = async (data: FileUploadConfig) => {
    return uploadToServer(this.#vhttp, this.meta.id, data);
  };

  /**
   * @param URL - URL of the hosted file
   * @param callbackUrl- [optional] A url that will be called once upload is finished
   * @param name - [optional] Name of the file
   * @param description - [optional] Description of the file
   *
   * @see
   * Providing a callbackUrl will return undefined and not providing one
   * will return a Job object (TODO: Implement proper type for this condition)
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
   * Generate an image from a prompt.
   * @param prompt - Prompt for the image generation
   * @param aspectRatio - Aspect ratio of the image (default: '1:1')
   * @param callbackUrl - Optional URL to receive a callback when generation is complete
   * @returns An Image object containing the generated image metadata
   */
  public generateImage = async (
    prompt: string,
    aspectRatio: '1:1' | '9:16' | '16:9' | '4:3' | '3:4' = '1:1',
    callbackUrl?: string
  ) => {
    const generateImageConfig: GenerateImageConfig = {
      prompt,
      aspect_ratio: aspectRatio,
      callback_url: callbackUrl,
    };
    if (generateImageConfig.callback_url) {
      const res = await this.#vhttp.post(
        [
          ApiPath.collection,
          this.meta.id,
          ApiPath.generate,
          ApiPath.image,
        ] as string[],
        {
          prompt,
          aspect_ratio: aspectRatio,
          callback_url: callbackUrl,
        }
      );
    } else {
      const job = new GenerateImageJob(
        generateImageConfig,
        this.meta.id,
        this.#vhttp
      );
      return job;
    }
  };

  /**
   * Generate music from a prompt.
   * @param prompt - Prompt for the music generation
   * @param duration - Duration of the music in seconds (default: 5)
   * @param callbackUrl - Optional URL to receive a callback when generation is complete
   * @returns An Audio object containing the generated music metadata
   */
  public generateMusic = async (
    prompt: string,
    duration: number = 5,
    callbackUrl?: string
  ) => {
    const generateAudioConfig: GenerateAudioConfig = {
      prompt,
      duration,
      audio_type: 'music',
      callback_url: callbackUrl,
    };

    if (generateAudioConfig.callback_url) {
      await this.#vhttp.post(
        [
          ApiPath.collection,
          this.meta.id,
          ApiPath.generate,
          ApiPath.audio,
        ] as string[],
        generateAudioConfig
      );
    } else {
      const job = new GenerateAudioJob(
        generateAudioConfig,
        this.meta.id,
        this.#vhttp
      );
      return job;
    }
  };

  /**
   * Generate a sound effect from a prompt.
   * @param prompt - Prompt for the sound effect generation
   * @param duration - Duration of the sound effect in seconds (default: 2)
   * @param config - Optional configuration for the sound effect generation
   * @param callbackUrl - Optional URL to receive a callback when generation is complete
   * @returns An Audio object containing the generated sound effect metadata
   */
  public generateSoundEffect = async (
    prompt: string,
    duration: number = 2,
    config: Record<string, unknown> = {},
    callbackUrl?: string
  ) => {
    const generateAudioConfig: GenerateAudioConfig = {
      prompt,
      duration,
      audio_type: 'sound_effect',
      config,
      callback_url: callbackUrl,
    };

    if (generateAudioConfig.callback_url) {
      await this.#vhttp.post(
        [
          ApiPath.collection,
          this.meta.id,
          ApiPath.generate,
          ApiPath.audio,
        ] as string[],
        generateAudioConfig
      );
    } else {
      const job = new GenerateAudioJob(
        generateAudioConfig,
        this.meta.id,
        this.#vhttp
      );
      return job;
    }
  };

  /**
   * Generate a voice audio from text.
   * @param text - Text to convert to voice
   * @param voiceName - Name of the voice to use (default: 'Default')
   * @param config - Optional configuration for the voice generation
   * @param callbackUrl - Optional URL to receive a callback when generation is complete
   * @returns An Audio object containing the generated voice metadata
   */
  public generateVoice = async (
    text: string,
    voiceName: string = 'Default',
    config: Record<string, unknown> = {},
    callbackUrl?: string
  ) => {
    const generateVoiceConfig: GenerateAudioConfig = {
      text,
      voice_name: voiceName,
      config,
      callback_url: callbackUrl,
      audio_type: 'voice',
    };

    if (generateVoiceConfig.callback_url) {
      await this.#vhttp.post(
        [
          ApiPath.collection,
          this.meta.id,
          ApiPath.generate,
          ApiPath.audio,
        ] as string[],
        generateVoiceConfig
      );
    } else {
      return new GenerateAudioJob(
        generateVoiceConfig,
        this.meta.id,
        this.#vhttp
      );
    }
  };

  /**
   * Generate a video from a prompt.
   * @param prompt - Prompt for the video generation
   * @param duration - Duration of the video in seconds (default: 5)
   * @param callbackUrl - Optional URL to receive a callback when generation is complete
   * @returns A Video object containing the generated video metadata
   */
  public generateVideo = async (
    prompt: string,
    duration: number = 5,
    callbackUrl?: string
  ) => {
    const generateVideoConfig: GenerateVideoConfig = {
      prompt,
      duration,
      callback_url: callbackUrl,
    };

    if (generateVideoConfig.callback_url) {
      await this.#vhttp.post(
        [
          ApiPath.collection,
          this.meta.id,
          ApiPath.generate,
          ApiPath.video,
        ] as string[],
        {
          prompt,
          duration,
          callback_url: callbackUrl,
        }
      );
    } else {
      const job = new GenerateVideoJob(
        generateVideoConfig,
        this.meta.id,
        this.#vhttp
      );
      return job;
    }
  };

  /**
   * Dub a video in a different language.
   * @param videoId - ID of the video to dub
   * @param languageCode - Language code to dub the video to
   * @param callbackUrl - Optional URL to receive a callback when dubbing is complete
   * @returns A Video object containing the dubbed video metadata
   */
  public dubVideo = async (
    videoId: string,
    languageCode: string,
    callbackUrl?: string
  ) => {
    const dubVideoConfig: DubVideoConfig = {
      video_id: videoId,
      language_code: languageCode,
      callback_url: callbackUrl,
    };

    if (dubVideoConfig.callback_url) {
      await this.#vhttp.post(
        [
          ApiPath.collection,
          this.meta.id,
          ApiPath.generate,
          ApiPath.video,
          ApiPath.dub,
        ] as string[],
        dubVideoConfig
      );
    } else {
      return new DubVideoJob(dubVideoConfig, this.meta.id, this.#vhttp);
    }
  };

  /**
   * Search for videos by title using LLM search.
   * @param query - Query string to search for in video titles
   * @returns An array of objects each containing a Video instance matching the title
   */
  public searchTitle = async (query: string): Promise<{ video: Video }[]> => {
    const res = await this.#vhttp.post(
      [ApiPath.collection, this.meta.id, ApiPath.search, 'title'] as string[],
      {
        query,
        search_type: 'llm',
      }
    );
    if (Array.isArray(res?.data)) {
      return res.data.map((result: { video: VideoBase }) => ({
        video: new Video(
          this.#vhttp,
          fromSnakeToCamel(result.video) as VideoBase
        ),
      }));
    }
    return [];
  };

  /**
   * Make the collection public.
   * @returns A promise that resolves when the collection is made public
   */
  public makePublic = async (): Promise<void> => {
    await this.#vhttp.patch([ApiPath.collection, this.meta.id] as string[], {
      is_public: true,
    });
    this.meta.isPublic = true;
  };

  /**
   * Make the collection private.
   * @returns A promise that resolves when the collection is made private
   */
  public makePrivate = async (): Promise<void> => {
    await this.#vhttp.patch([ApiPath.collection, this.meta.id] as string[], {
      is_public: false,
    });
    this.meta.isPublic = false;
  };
}
