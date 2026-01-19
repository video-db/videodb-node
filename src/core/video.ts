import { ApiPath, ReframeMode, Segmenter, Workflows } from '@/constants';
import type {
  IVideo,
  VideoBase,
  MeetingBase,
  ImageBase,
} from '@/interfaces/core';
import { Frame, Image } from '@/core/image';
import { Scene, SceneCollection } from '@/core/scene';
import {
  ListSceneIndex,
  IndexScenesResponse,
  type GenerateStreamResponse,
  ListSceneCollection,
  SceneCollectionResponse,
  SceneCollectionData,
  TranscriptResponse,
  GetSceneIndexResponse,
  NoDataResponse,
} from '@/types/response';
import type { Timeline, Transcript } from '@/types/video';
import { playStream, SnakeKeysToCamelCase } from '@/utils';
import { HttpClient } from '@/utils/httpClient';
import {
  DefaultIndexType,
  DefaultSearchType,
  IndexTypeValues,
  SceneExtractionType,
} from '@/core/config';
import { SearchFactory } from './search';
import {
  ExtractSceneConfig,
  IndexSceneConfig,
  SubtitleStyleProps,
} from '@/types/config';
import { SearchType, IndexType } from '@/types/search';
import { SceneIndexRecords, SceneIndexes } from '@/types';
import { Shot } from './shot';
import { VideodbError } from '@/utils/error';

const {
  video,
  stream,
  thumbnail,
  thumbnails,
  workflow,
  index,
  scene,
  scenes,
  transcription,
  storage,
  translate,
  meeting,
  reframe,
  compile,
  collection,
} = ApiPath;

/**
 * The base Video class
 * @remarks
 * Use this to initialize a video stored in videoDB
 */
export class Video implements IVideo {
  public readonly id: string;
  public readonly collectionId: string;
  public readonly length: string;
  public readonly name: string;
  public readonly size: string;
  public readonly streamUrl: string;
  public readonly userId: string;
  public readonly playerUrl: string;
  public thumbnail?: string;
  public transcript?: Transcript;
  #vhttp: HttpClient;

  /**
   * Initializes a videoDB Instance
   * @param http - HttpClient object
   * @param data - Data needed to initialize a video instance
   */
  constructor(http: HttpClient, data: VideoBase) {
    this.id = data.id;
    this.collectionId = data.collectionId;
    this.length = data.length;
    this.name = data.name;
    this.size = data.size;
    this.streamUrl = data.streamUrl;
    this.userId = data.userId;
    this.playerUrl = data.playerUrl;
    this.thumbnail = data.thumbnail;
    this.#vhttp = http;
  }

  /**
   * @param query - Search query
   * @param searchType- [optional] Type of search to be performed
   * @param indexType- [optional] Index Type
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
    const results = await searchFunc.searchInsideVideo({
      videoId: this.id,
      query: query,
      searchType: searchType ?? DefaultSearchType,
      indexType: indexType ?? DefaultIndexType,
      resultThreshold: resultThreshold,
      scoreThreshold: scoreThreshold,
    });
    return results;
  };

  /**
   * Returns an empty promise that resolves when the video is deleted
   * @returns A promise that resolves when delete is successful
   * @throws an InvalidRequestError if the request fails
   */
  public delete = async () => {
    return await this.#vhttp.delete<Record<string, never>>([
      video,
      this.id,
    ]);
  };

  /**
   * Generates a new streaming URL with the given timeline.
   * @param timeline - Of the format [[start, end], [start, end]...]
   * @returns a streaming URL
   */
  public generateStream = async (timeline?: Timeline) => {
    if (!timeline && this.streamUrl) {
      return this.streamUrl;
    }

    const body: { length: number; timeline?: Timeline } = {
      length: Number(this.length),
    };
    if (timeline) body.timeline = timeline;

    const res = await this.#vhttp.post<GenerateStreamResponse, typeof body>(
      [video, this.id, stream],
      body
    );

    return res.data.streamUrl;
  };

  /**
   * Generate the thumbnail of the video
   * @param time - Optional time in seconds to generate thumbnail at specific frame
   * @returns Image object if time is provided, else the thumbnail URL string
   */
  public generateThumbnail = async (time?: number): Promise<string | Image> => {
    if (this.thumbnail && time === undefined) return this.thumbnail;

    if (time !== undefined) {
      const res = await this.#vhttp.post<ImageBase, object>(
        [video, this.id, thumbnail],
        { time }
      );
      return new Image(this.#vhttp, res.data);
    }

    const res = await this.#vhttp.get<{ thumbnail: string; thumbnailUrl?: string }>([
      video,
      this.id,
      thumbnail,
    ]);
    this.thumbnail = res.data.thumbnail || res.data.thumbnailUrl;
    return this.thumbnail!;
  };

  /**
   * Fetches the transcript of the video if it exists, generates one
   * if it doesn't.
   * @param forceCreate - Forces transcript generation even if it exists
   * @returns The transcript data
   */
  public getTranscript = async (forceCreate = false): Promise<Transcript> => {
    if (this.transcript && !forceCreate) return this.transcript;

    const res = await this.#vhttp.get<TranscriptResponse>([
      video,
      this.id,
      transcription,
      `?force=${String(forceCreate)}`,
    ]);

    this.transcript = res.data as Transcript;
    return this.transcript;
  };

  /**
   * Generate transcript for the video using POST method
   * @param force - Force generate new transcript even if one exists
   * @returns Success status or transcript data
   */
  public generateTranscript = async (
    force: boolean = false
  ): Promise<{ success: boolean; message: string } | Transcript> => {
    const res = await this.#vhttp.post<TranscriptResponse, object>(
      [video, this.id, transcription],
      { force }
    );

    const transcript = res.data?.wordTimestamps;
    if (transcript && transcript.length > 0) {
      return {
        success: true,
        message: 'Transcript generated successfully',
      };
    }
    return res.data as Transcript;
  };

  /**
   * Indexes the video semantically
   * @returns Whether the process was successful
   */
  public indexSpokenWords = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const res = await this.#vhttp.post<NoDataResponse, { indexType: string }>(
      [video, this.id, index],
      { indexType: IndexTypeValues.spoken }
    );

    if (res.data?.success !== undefined) {
      return {
        success: res.data.success,
        message: res.data.message,
      };
    }
    return { success: true };
  };

  /** Camelcase version of SceneCollectionData after HttpClient conversion */
  public _formatSceneCollectionData = (
    sceneCollectionData: SnakeKeysToCamelCase<SceneCollectionData>
  ): SceneCollection => {
    const scenes: Scene[] = [];

    for (const sceneData of sceneCollectionData.scenes) {
      const frames: Frame[] = [];
      for (const frameData of sceneData.frames) {
        frames.push(
          new Frame(this.#vhttp, {
            id: frameData.frameId,
            videoId: this.id,
            sceneId: sceneData.sceneId,
            url: frameData.url,
            frameTime: frameData.frameTime,
            description: frameData.description,
          })
        );
      }
      scenes.push(
        new Scene(this.#vhttp, {
          id: sceneData.sceneId,
          videoId: this.id,
          start: sceneData.start,
          end: sceneData.end,
          frames: frames,
        })
      );
    }
    return new SceneCollection(this.#vhttp, {
      id: sceneCollectionData.sceneCollectionId,
      videoId: this.id,
      scenes: scenes,
      config: sceneCollectionData.config,
    });
  };

  public extractScenes = async (
    config: Partial<ExtractSceneConfig> = {}
  ): Promise<SceneCollection> => {
    const defaultConfig = {
      extractionType: SceneExtractionType.shotBased,
      extractionConfig: {},
      force: false,
    };

    const res = await this.#vhttp.post<
      SceneCollectionResponse,
      Partial<ExtractSceneConfig>
    >([video, this.id, scenes], { ...defaultConfig, ...config });

    return this._formatSceneCollectionData(res.data.sceneCollection);
  };

  public listSceneCollection = async () => {
    const res = await this.#vhttp.get<ListSceneCollection>([
      video,
      this.id,
      scenes,
    ]);
    return res.data.sceneCollections;
  };

  public getSceneCollection = async (sceneCollectionId: string) => {
    const res = await this.#vhttp.get<SceneCollectionResponse>([
      video,
      this.id,
      scenes,
      sceneCollectionId,
    ]);
    return this._formatSceneCollectionData(res.data.sceneCollection);
  };

  public deleteSceneCollection = async (sceneCollectionId: string) => {
    const res = await this.#vhttp.delete([
      video,
      this.id,
      scenes,
      sceneCollectionId,
    ]);
    return res;
  };

  /**
   * Indexs the video with scenes
   * @returns an awaited boolean signifying whether the process
   * was successful or not
   */
  public indexScenes = async (config: Partial<IndexSceneConfig> = {}) => {
    const defaultConfig = {
      extractionType: SceneExtractionType.shotBased,
      extractionConfig: {},
    };
    const payload: Record<string, unknown> = { ...defaultConfig, ...config };
    if (config.scenes) {
      payload.scenes = config.scenes.map((s: Scene) => s.getRequestData());
    }
    const res = await this.#vhttp.post<IndexScenesResponse, typeof payload>(
      [video, this.id, index, scene],
      payload
    );
    if (res.data) {
      return res.data.sceneIndexId;
    }
  };

  public listSceneIndex = async () => {
    const res = await this.#vhttp.get<ListSceneIndex>([
      video,
      this.id,
      index,
      scene,
    ]);
    return res.data.sceneIndexes as SceneIndexes;
  };

  public getSceneIndex = async (
    sceneIndexId: string
  ): Promise<SceneIndexRecords> => {
    const res = await this.#vhttp.get<GetSceneIndexResponse>([
      video,
      this.id,
      index,
      scene,
      sceneIndexId,
    ]);
    return res.data.sceneIndexRecords as SceneIndexRecords;
  };

  public deleteSceneIndex = async (sceneIndexId: string) => {
    const res = await this.#vhttp.delete([
      video,
      this.id,
      index,
      scene,
      sceneIndexId,
    ]);
    return res;
  };

  /**
   * Overlays subtitles on top of a video
   * @returns an awaited stream url for subtitled overlayed video
   *
   */
  public addSubtitle = async (config?: Partial<SubtitleStyleProps>) => {
    const res = await this.#vhttp.post<
      GenerateStreamResponse,
      { type: string; subtitleStyle: Partial<SubtitleStyleProps> }
    >([video, this.id, workflow], {
      type: Workflows.addSubtitles,
      subtitleStyle: { ...config },
    });
    return res.data.streamUrl;
  };

  /**
   * Generates a new playable stream URL with the given timeline.
   * @returns a URL that can be opened in browser
   */
  public play = () => {
    return playStream(this.streamUrl);
  };

  /**
   * Remove the video storage
   * @returns A promise that resolves when the removal is successful
   */
  public removeStorage = async () => {
    return await this.#vhttp.delete<Record<string, never>>([
      video,
      this.id,
      storage,
    ]);
  };

  /**
   * Get all the thumbnails of the video
   * @returns List of Image objects
   */
  public getThumbnails = async (): Promise<Image[]> => {
    const res = await this.#vhttp.get<ImageBase[]>([
      video,
      this.id,
      thumbnails,
    ]);
    return (res.data || []).map(thumb => new Image(this.#vhttp, thumb));
  };

  /**
   * Get plain text transcript for the video
   * @param start - Start time in seconds
   * @param end - End time in seconds
   * @returns Full transcript text as string
   */
  public getTranscriptText = async (
    start?: number,
    end?: number
  ): Promise<string> => {
    const res = await this.#vhttp.get<TranscriptResponse>(
      [video, this.id, transcription],
      {
        params: {
          start,
          end,
          segmenter: Segmenter.word,
          length: 1,
        },
      }
    );
    return res.data?.text || '';
  };

  /**
   * Translate transcript of a video to a given language
   * @param language - Language to translate the transcript
   * @param additionalNotes - Additional notes for the style of language
   * @param callbackUrl - URL to receive the callback (optional)
   * @returns List of translated transcript
   */
  public translateTranscript = async (
    language: string,
    additionalNotes: string = '',
    callbackUrl?: string
  ): Promise<unknown[] | undefined> => {
    const res = await this.#vhttp.post<
      { translatedTranscript: unknown[] },
      object
    >([collection, this.collectionId, video, this.id, translate], {
      language,
      additionalNotes,
      callbackUrl,
    });
    return res.data?.translatedTranscript;
  };

  /**
   * Insert a video into another video at a specific timestamp
   * @param insertVideo - The video to be inserted
   * @param timestamp - The timestamp where the video should be inserted
   * @returns The stream url of the combined video
   */
  public insertVideo = async (
    insertVideo: Video,
    timestamp: number
  ): Promise<string | null> => {
    const videoLength = Number(this.length);
    if (timestamp > videoLength) {
      timestamp = videoLength;
    }

    const preShot = new Shot(this.#vhttp, {
      videoId: this.id,
      videoLength: timestamp,
      videoTitle: '',
      start: 0,
      end: timestamp,
    });

    const insertedShot = new Shot(this.#vhttp, {
      videoId: insertVideo.id,
      videoLength: Number(insertVideo.length),
      videoTitle: '',
      start: 0,
      end: Number(insertVideo.length),
    });

    const postShot = new Shot(this.#vhttp, {
      videoId: this.id,
      videoLength: videoLength - timestamp,
      videoTitle: '',
      start: timestamp,
      end: videoLength,
    });

    const allShots = [preShot, insertedShot, postShot];

    const res = await this.#vhttp.post<{ streamUrl: string }, object[]>(
      [compile],
      allShots.map(shot => ({
        videoId: shot.videoId,
        collectionId: this.collectionId,
        shots: [[shot.start, shot.end]],
      }))
    );
    return res.data?.streamUrl || null;
  };

  /**
   * Get meeting information associated with the video
   * @returns Meeting object if meeting is associated, null otherwise
   */
  public getMeeting = async (): Promise<unknown | null> => {
    const { Meeting } = await import('./meeting');
    const res = await this.#vhttp.get<MeetingBase & { meetingId: string }>([
      video,
      this.id,
      meeting,
    ]);
    if (res.data) {
      return new Meeting(this.#vhttp, {
        ...res.data,
        id: res.data.meetingId,
        collectionId: this.collectionId,
      });
    }
    return null;
  };

  /**
   * Reframe video to a new aspect ratio with optional object tracking
   * @param start - Start time in seconds (optional)
   * @param end - End time in seconds (optional)
   * @param target - Target format - preset string or {width, height}
   * @param mode - Reframing mode - "simple" or "smart"
   * @param callbackUrl - URL to receive callback when processing completes
   * @returns Video object if no callbackUrl, undefined otherwise
   */
  public reframe = async (
    start?: number,
    end?: number,
    target: string | { width: number; height: number } = 'vertical',
    mode: string = ReframeMode.smart,
    callbackUrl?: string
  ): Promise<Video | undefined> => {
    const res = await this.#vhttp.post<VideoBase, object>(
      [video, this.id, reframe],
      { start, end, target, mode, callbackUrl }
    );

    if (callbackUrl) return undefined;
    if (res.data) {
      return new Video(this.#vhttp, res.data);
    }
  };

  /**
   * Convenience method for object-aware vertical reframing
   * @param start - Start time in seconds (optional)
   * @param end - End time in seconds (optional)
   * @param callbackUrl - URL to receive callback when processing completes
   * @returns Video object if no callbackUrl, undefined otherwise
   */
  public smartVerticalReframe = async (
    start?: number,
    end?: number,
    callbackUrl?: string
  ): Promise<Video | undefined> => {
    return this.reframe(start, end, 'vertical', ReframeMode.smart, callbackUrl);
  };

  /**
   * Download the video from its stream URL
   * @param name - Name for the downloaded file (optional)
   * @returns Download response data
   */
  public download = async (name?: string): Promise<Record<string, unknown>> => {
    if (!this.streamUrl) {
      throw new VideodbError('Video does not have a stream_url');
    }

    const downloadName = name || this.name || `video_${this.id}`;
    const res = await this.#vhttp.post<Record<string, unknown>, object>(
      [ApiPath.download],
      { streamLink: this.streamUrl, name: downloadName }
    );
    return res.data;
  };
}
