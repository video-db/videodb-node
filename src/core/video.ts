import {
  ApiPath,
  ReframeMode,
  ReframePreset,
  Segmenter,
  SegmentationType,
  Workflows,
} from '@/constants';
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
import { SearchResult } from './search/searchResult';
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
  clip,
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
  public readonly description?: string;
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
    this.description = data.description;
    this.size = data.size;
    this.streamUrl = data.streamUrl;
    this.userId = data.userId;
    this.playerUrl = data.playerUrl;
    this.thumbnail = data.thumbnail;
    this.#vhttp = http;
  }

  /**
   * Search for a query in the video
   * @param query - Search query
   * @param searchType - [optional] Type of search to be performed
   * @param indexType - [optional] Index Type
   * @param resultThreshold - [optional] Result Threshold
   * @param scoreThreshold - [optional] Score Threshold
   * @param dynamicScorePercentage - [optional] Percentage of dynamic score to consider
   * @param filter - [optional] Additional metadata filters
   */
  public search = async (
    query: string,
    searchType?: SearchType,
    indexType?: IndexType,
    resultThreshold?: number,
    scoreThreshold?: number,
    dynamicScorePercentage?: number,
    filter?: Array<Record<string, unknown>>
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
      dynamicScorePercentage: dynamicScorePercentage,
      filter: filter,
    });
    return results;
  };

  /**
   * Returns an empty promise that resolves when the video is deleted
   * @returns A promise that resolves when delete is successful
   * @throws an InvalidRequestError if the request fails
   */
  public delete = async () => {
    return await this.#vhttp.delete<Record<string, never>>([video, this.id]);
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

    const res = await this.#vhttp.get<{
      thumbnail: string;
      thumbnailUrl?: string;
    }>([video, this.id, thumbnail]);
    this.thumbnail = res.data.thumbnail || res.data.thumbnailUrl;
    return this.thumbnail!;
  };

  /**
   * Fetches the transcript of the video if it exists, generates one
   * if it doesn't.
   * @param start - Start time in seconds (optional)
   * @param end - End time in seconds (optional)
   * @param segmenter - Segmentation type (word, sentence, time) (optional)
   * @param length - Length of segments when using time segmenter (optional)
   * @param force - Force fetch new transcript (optional)
   * @returns The transcript data
   */
  public getTranscript = async (
    start?: number,
    end?: number,
    segmenter?: string,
    length?: number,
    force?: boolean
  ): Promise<Transcript> => {
    if (this.transcript && !start && !end && !segmenter && !length && !force) {
      return this.transcript;
    }

    const params: Record<string, unknown> = {};
    if (start !== undefined) params.start = start;
    if (end !== undefined) params.end = end;
    if (segmenter !== undefined) params.segmenter = segmenter;
    if (length !== undefined) params.length = length;
    if (force !== undefined) params.force = force ? 'true' : 'false';

    const res = await this.#vhttp.get<TranscriptResponse>(
      [video, this.id, transcription],
      { params }
    );

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
   * Semantic indexing of spoken words in the video
   * @param languageCode - Language code of the video (optional)
   * @param segmentationType - Segmentation type used for indexing (optional, default: sentence)
   * @param force - Force to index the video (optional)
   * @param callbackUrl - URL to receive the callback (optional)
   * @returns Whether the process was successful
   */
  public indexSpokenWords = async (
    languageCode?: string,
    segmentationType?: string,
    force?: boolean,
    callbackUrl?: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const data: Record<string, unknown> = {
      index_type: IndexTypeValues.spoken,
    };
    if (languageCode !== undefined) data.language_code = languageCode;
    if (segmentationType !== undefined)
      data.segmentation_type = segmentationType;
    if (force !== undefined) data.force = force;
    if (callbackUrl !== undefined) data.callback_url = callbackUrl;

    const res = await this.#vhttp.post<NoDataResponse, typeof data>(
      [video, this.id, index],
      data
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
      extraction_type: SceneExtractionType.shotBased,
      extraction_config: {},
      force: false,
    };

    const payload: Record<string, unknown> = { ...defaultConfig };
    if (config.extractionType !== undefined) payload.extraction_type = config.extractionType;
    if (config.extractionConfig !== undefined) payload.extraction_config = config.extractionConfig;
    if (config.force !== undefined) payload.force = config.force;

    const res = await this.#vhttp.post<
      SceneCollectionResponse,
      typeof payload
    >([video, this.id, scenes], payload);

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
   * Index the scenes of the video
   * @param config.extractionType - The type of extraction (shot_based, time_based, transcript)
   * @param config.extractionConfig - Configuration parameters for extraction
   * @param config.prompt - The prompt for the extraction
   * @param config.metadata - Additional metadata for the scene index
   * @param config.modelName - The model name for the extraction
   * @param config.modelConfig - The model configuration for the extraction
   * @param config.name - The name of the scene index
   * @param config.scenes - The scenes to be indexed
   * @param config.callbackUrl - The callback url
   * @returns The scene index id
   */
  public indexScenes = async (config: Partial<IndexSceneConfig> = {}) => {
    const payload: Record<string, unknown> = {
      extraction_type: config.extractionType ?? SceneExtractionType.shotBased,
      extraction_config: config.extractionConfig ?? {},
    };
    if (config.prompt !== undefined) payload.prompt = config.prompt;
    if (config.metadata !== undefined) payload.metadata = config.metadata;
    if (config.modelName !== undefined) payload.model_name = config.modelName;
    if (config.modelConfig !== undefined) payload.model_config = config.modelConfig;
    if (config.name !== undefined) payload.name = config.name;
    if (config.callbackUrl !== undefined) payload.callback_url = config.callbackUrl;
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
   * Index visuals (scenes) from the video
   * @param prompt - Prompt for scene description
   * @param batchConfig - Frame extraction config with keys:
   *   - type: Extraction type ("time" or "shot"). Default is "time".
   *   - value: Window size in seconds (for time) or threshold (for shot). Default is 10.
   *   - frameCount: Number of frames to extract per window. Default is 1.
   *   - selectFrames: Which frames to select (e.g., ["first", "middle", "last"]). Default is ["first"].
   * @param modelName - Name of the model
   * @param modelConfig - Configuration for the model
   * @param name - Name of the visual index
   * @param callbackUrl - URL to receive the callback (optional)
   * @returns The scene index id
   */
  public indexVisuals = async (config?: {
    prompt?: string;
    batchConfig?: {
      type?: 'time' | 'shot';
      value?: number;
      frameCount?: number;
      selectFrames?: string[];
    };
    modelName?: string;
    modelConfig?: Record<string, unknown>;
    name?: string;
    callbackUrl?: string;
  }): Promise<string | undefined> => {
    const {
      prompt,
      batchConfig = { type: 'time', value: 10, frameCount: 1 },
      modelName,
      modelConfig = {},
      name,
      callbackUrl,
    } = config ?? {};

    const extractionType = batchConfig.type ?? 'time';
    let extractionConfig: Record<string, unknown>;

    if (extractionType === 'shot') {
      extractionConfig = {
        threshold: batchConfig.value ?? 20,
        frame_count: batchConfig.frameCount ?? 1,
      };
    } else {
      extractionConfig = {
        time: batchConfig.value ?? 10,
        frame_count: batchConfig.frameCount ?? 1,
        select_frames: batchConfig.selectFrames ?? ['first'],
      };
    }

    const res = await this.#vhttp.post<IndexScenesResponse, object>(
      [video, this.id, index, scene],
      {
        extraction_type:
          extractionType === 'shot'
            ? SceneExtractionType.shotBased
            : SceneExtractionType.timeBased,
        extraction_config: extractionConfig,
        prompt,
        model_name: modelName,
        model_config: modelConfig,
        name,
        callback_url: callbackUrl,
      }
    );

    return res.data?.sceneIndexId;
  };

  /**
   * Index audio by processing transcript segments through an LLM
   *
   * Segments the video transcript, processes each segment with the given
   * prompt using the specified model, and indexes the results as scene
   * records for semantic search.
   *
   * @param prompt - Prompt for processing transcript segments (optional)
   * @param modelName - LLM tier to use (e.g. "basic", "pro", "ultra") (optional)
   * @param modelConfig - Model configuration (optional)
   * @param languageCode - Language code for transcription (optional)
   * @param batchConfig - Segmentation config with keys:
   *   - type: Segmentation type ("word", "sentence", or "time")
   *   - value: Segment length (words, sentences, or seconds)
   *   Defaults to { type: "word", value: 10 }
   * @param name - Name for the scene index (optional)
   * @param callbackUrl - URL to receive the callback (optional)
   * @returns The scene index id
   */
  public indexAudio = async (config?: {
    prompt?: string;
    modelName?: string;
    modelConfig?: Record<string, unknown>;
    languageCode?: string;
    batchConfig?: {
      type?: 'word' | 'sentence' | 'time';
      value?: number;
    };
    name?: string;
    callbackUrl?: string;
  }): Promise<string | undefined> => {
    const {
      prompt,
      modelName,
      modelConfig,
      languageCode,
      batchConfig = { type: 'word', value: 10 },
      name,
      callbackUrl,
    } = config ?? {};

    const extractionConfig = {
      segmenter: batchConfig.type ?? Segmenter.word,
      segmentation_value: batchConfig.value ?? 10,
    };

    const res = await this.#vhttp.post<IndexScenesResponse, object>(
      [video, this.id, index, scene],
      {
        extraction_type: SceneExtractionType.transcript,
        extraction_config: extractionConfig,
        prompt,
        model_name: modelName,
        model_config: modelConfig,
        language_code: languageCode,
        name,
        callback_url: callbackUrl,
      }
    );

    return res.data?.sceneIndexId;
  };

  /**
   * Overlays subtitles on top of a video
   * @returns an awaited stream url for subtitled overlayed video
   *
   */
  public addSubtitle = async (config?: Partial<SubtitleStyleProps>) => {
    const res = await this.#vhttp.post<
      GenerateStreamResponse,
      { type: string; subtitle_style: Partial<SubtitleStyleProps> }
    >([video, this.id, workflow], {
      type: Workflows.addSubtitles,
      subtitle_style: { ...config },
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
      additional_notes: additionalNotes,
      callback_url: callbackUrl,
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
        video_id: shot.videoId,
        collection_id: this.collectionId,
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
  public reframe = async (options?: {
    start?: number;
    end?: number;
    target?:
      | (typeof ReframePreset)[keyof typeof ReframePreset]
      | { width: number; height: number };
    mode?: (typeof ReframeMode)[keyof typeof ReframeMode];
    callbackUrl?: string;
  }): Promise<Video | undefined> => {
    const {
      start,
      end,
      target = ReframePreset.vertical,
      mode = ReframeMode.smart,
      callbackUrl,
    } = options ?? {};

    const res = await this.#vhttp.post<VideoBase, object>(
      [video, this.id, reframe],
      { start, end, target, mode, callback_url: callbackUrl }
    );

    if (callbackUrl) return undefined;
    if (res.data) {
      return new Video(this.#vhttp, res.data);
    }
  };

  /**
   * Convenience method for object-aware vertical reframing
   * @param options - Configuration options
   * @returns Video object if no callbackUrl, undefined otherwise
   */
  public smartVerticalReframe = async (options?: {
    start?: number;
    end?: number;
    callbackUrl?: string;
  }): Promise<Video | undefined> => {
    return this.reframe({
      ...options,
      target: ReframePreset.vertical,
      mode: ReframeMode.smart,
    });
  };

  /**
   * Generate a clip from the video using a prompt
   * @param prompt - Prompt to generate the clip
   * @param contentType - Content type for the clip
   * @param modelName - Model name for generation
   * @returns SearchResult object containing the clip
   */
  public clip = async (
    prompt: string,
    contentType: string,
    modelName: string
  ): Promise<SearchResult> => {
    type ClipResponse = {
      results: Array<{
        collectionId: string;
        docs: Array<{
          end: number;
          score: number;
          start: number;
          streamUrl: string;
          text: string;
        }>;
        length: string;
        maxScore: number;
        platform: string;
        streamUrl: string;
        thumbnail: string;
        title: string;
        videoId: string;
      }>;
    };
    const res = await this.#vhttp.post<ClipResponse, object>(
      [video, this.id, clip],
      { prompt, content_type: contentType, model_name: modelName }
    );
    return new SearchResult(this.#vhttp, res.data);
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
      { stream_link: this.streamUrl, name: downloadName }
    );
    return res.data;
  };
}
