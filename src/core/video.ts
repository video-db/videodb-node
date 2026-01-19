import { ApiPath, Workflows } from '@/constants';
import type { IVideo, VideoBase } from '@/interfaces/core';
import { Frame } from '@/core/image';
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

const {
  video,
  stream,
  thumbnail,
  workflow,
  index,
  scene,
  scenes,
  transcription,
} = ApiPath;

/**
 * The base Video class
 * @remarks
 * Use this to initialize a video stored in videoDB
 */
export class Video implements IVideo {
  public meta: VideoBase;
  public transcript?: Transcript;
  #vhttp: HttpClient;

  /**
   * Initializes a videoDB Instance
   * @param http - HttpClient object
   * @param data - Data needed to initialize a video instance
   */
  constructor(http: HttpClient, data: VideoBase) {
    this.meta = data;
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
      videoId: this.meta.id,
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
      this.meta.id,
    ]);
  };

  /**
   * Generates a new streaming URL with the given timeline.
   * @param timeline - Of the format [[start, end], [start, end]...]
   * @returns a streaming URL
   */
  public generateStream = async (timeline?: Timeline) => {
    if (!timeline && this.meta.streamUrl) {
      return this.meta.streamUrl;
    }

    const body: { length: number; timeline?: Timeline } = {
      length: Number(this.meta.length),
    };
    if (timeline) body.timeline = timeline;

    const res = await this.#vhttp.post<GenerateStreamResponse, typeof body>(
      [video, this.meta.id, stream],
      body
    );

    return res.data.streamUrl;
  };

  /**
   * Gets the thumbnail of the video or generates one if it doesn't exist.
   * @returns An awaited URL to the video's thumbnail
   */
  public generateThumbnail = async () => {
    if (this.meta.thumbnail) return this.meta.thumbnail;
    const res = await this.#vhttp.get<{ thumbnail: string }>([
      video,
      this.meta.id,
      thumbnail,
    ]);
    this.meta.thumbnail = res.data.thumbnail;
    return res.data.thumbnail;
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
      this.meta.id,
      transcription,
      `?force=${String(forceCreate)}`,
    ]);

    this.transcript = res.data as Transcript;
    return this.transcript;
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
      [video, this.meta.id, index],
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
            videoId: this.meta.id,
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
          videoId: this.meta.id,
          start: sceneData.start,
          end: sceneData.end,
          frames: frames,
        })
      );
    }
    return new SceneCollection(this.#vhttp, {
      id: sceneCollectionData.sceneCollectionId,
      videoId: this.meta.id,
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
    >([video, this.meta.id, scenes], { ...defaultConfig, ...config });

    return this._formatSceneCollectionData(res.data.sceneCollection);
  };

  public listSceneCollection = async () => {
    const res = await this.#vhttp.get<ListSceneCollection>([
      video,
      this.meta.id,
      scenes,
    ]);
    return res.data.sceneCollections;
  };

  public getSceneCollection = async (sceneCollectionId: string) => {
    const res = await this.#vhttp.get<SceneCollectionResponse>([
      video,
      this.meta.id,
      scenes,
      sceneCollectionId,
    ]);
    return this._formatSceneCollectionData(res.data.sceneCollection);
  };

  public deleteSceneCollection = async (sceneCollectionId: string) => {
    const res = await this.#vhttp.delete([
      video,
      this.meta.id,
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
      [video, this.meta.id, index, scene],
      payload
    );
    if (res.data) {
      return res.data.sceneIndexId;
    }
  };

  public listSceneIndex = async () => {
    const res = await this.#vhttp.get<ListSceneIndex>([
      video,
      this.meta.id,
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
      this.meta.id,
      index,
      scene,
      sceneIndexId,
    ]);
    return res.data.sceneIndexRecords as SceneIndexRecords;
  };

  public deleteSceneIndex = async (sceneIndexId: string) => {
    const res = await this.#vhttp.delete([
      video,
      this.meta.id,
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
    >([video, this.meta.id, workflow], {
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
    return playStream(this.meta.streamUrl);
  };
}
