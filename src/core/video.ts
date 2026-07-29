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
import { Index, type RawIndexManifest } from '@/core/indexManifest';
import {
  Understanding,
  normalizeUnderstandingAnalyzers,
  type AnalyzerSpec,
  type UnderstandingData,
} from '@/core/understanding';
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
import {
  buildIframeEmbedCode,
  fromCamelToSnake,
  playStream,
  SnakeKeysToCamelCase,
} from '@/utils';
import { HttpClient } from '@/utils/httpClient';
import {
  DefaultIndexType,
  DefaultSearchType,
  IndexTypeValues,
  SceneExtractionType,
  SubtitleStyleDefaultValues,
} from '@/core/config';
import { SearchFactory } from './search';
import { SearchResult } from './search/searchResult';
import {
  AskResponse,
  SearchResponse,
  warnLegacySearchOnce,
  type AskResponseData,
  type SearchResponseData,
} from './search/responses';
import type { SearchResponse as SearchApiResponse } from '@/types/response';
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
  understand,
  indexes,
  ask,
  semantic_search,
  query: queryPath,
  aggregate,
  search: searchPath,
} = ApiPath;

const VALID_SEGMENTERS: Set<string> = new Set([
  Segmenter.word,
  Segmenter.sentence,
  Segmenter.time,
]);

/**
 * Options for {@link Video.search}. Combines new-style (v2) params with
 * legacy-shaped params; passing any legacy param routes the call to
 * {@link Video.legacySearch}.
 */
export interface VideoSearchOptions {
  // legacy-shaped
  searchType?: SearchType;
  indexType?: IndexType;
  resultThreshold?: number;
  scoreThreshold?: number;
  dynamicScorePercentage?: number;
  filter?: Array<Record<string, unknown>>;
  sortDocsOn?: string;
  sceneIndexId?: string;
  indexId?: string;
  algorithm?: string;
  namespace?: string;
  stitch?: boolean;
  rerank?: boolean;
  rerankParams?: Record<string, unknown>;
  // new (v2)
  topK?: number;
  mode?: string;
  returnFields?: unknown[] | Record<string, unknown> | string;
  includeClip?: boolean;
  sessionId?: string;
  config?: Record<string, unknown>;
  // unsupported in search() — surfaced for a clear error
  indexName?: string;
  indexNames?: string[] | string;
  indexIds?: string[] | string;
  // internal — rejected
  deepsearchConfig?: unknown;
}

/** Accepted `source` shapes for {@link Video.index}. */
export type IndexSource =
  | { toIndexSource: () => Record<string, unknown> }
  | Record<string, unknown>
  | unknown[];

/**
 * The base Video class
 * @remarks
 * Use this to initialize a video stored in videoDB
 */
export class Video implements IVideo {
  public readonly id: string;
  public readonly collectionId: string;
  public readonly length: number;
  public name: string;
  public readonly description?: string;
  public readonly size: string;
  public streamUrl: string;
  public readonly userId: string;
  public playerUrl: string;
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
    this.length = Number(data.length) || 0;
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
   * Search this video.
   *
   * New search is used by default. Calls that pass legacy-shaped parameters are
   * routed to {@link legacySearch} with a one-time warning.
   * @param query - Search query
   * @param options - Search options (new-style, or legacy-shaped)
   */
  public search = async (
    query: string,
    optionsOrSearchType: VideoSearchOptions | SearchType = {},
    indexType?: IndexType,
    resultThreshold?: number,
    scoreThreshold?: number,
    dynamicScorePercentage?: number,
    filter?: Array<Record<string, unknown>>,
    sortDocsOn?: string
  ): Promise<SearchResponse | SearchResult> => {
    // Back-compat: the pre-v2 signature was fully positional —
    //   search(query, searchType, indexType, resultThreshold, scoreThreshold,
    //          dynamicScorePercentage, filter, sortDocsOn)
    // Detect it (2nd arg is a SearchType string, or any trailing positional arg
    // is present) and fold it into an options object, forcing legacy routing —
    // mirroring videodb-python's `has_old = bool(args)`.
    const positionalLegacy =
      typeof optionsOrSearchType === 'string' ||
      indexType !== undefined ||
      resultThreshold !== undefined ||
      scoreThreshold !== undefined ||
      dynamicScorePercentage !== undefined ||
      filter !== undefined ||
      sortDocsOn !== undefined;

    const options: VideoSearchOptions = positionalLegacy
      ? {
          searchType:
            typeof optionsOrSearchType === 'string'
              ? (optionsOrSearchType as SearchType)
              : undefined,
          indexType,
          resultThreshold,
          scoreThreshold,
          dynamicScorePercentage,
          filter,
          sortDocsOn,
        }
      : (optionsOrSearchType as VideoSearchOptions);

    // Note: scoreThreshold is intentionally NOT a legacy trigger. It is shared
    // by legacy and Search V2, so on its own it must not force legacy routing —
    // it routes to new search unless a genuinely legacy param is present. A
    // positional scoreThreshold still routes to legacy via `positionalLegacy`,
    // mirroring videodb-python (score_threshold is positional-only, absent from
    // its `old_params`).
    const oldParams: (keyof VideoSearchOptions)[] = [
      'searchType',
      'indexType',
      'resultThreshold',
      'dynamicScorePercentage',
      'sceneIndexId',
      'indexId',
      'algorithm',
      'sortDocsOn',
      'namespace',
      'stitch',
      'rerank',
      'rerankParams',
    ];
    const newParams: (keyof VideoSearchOptions)[] = [
      'topK',
      'mode',
      'returnFields',
      'includeClip',
      'sessionId',
      'config',
    ];
    // Only the multi-index (plural) selectors are unsupported by search().
    // The singular `indexId` is a legacy selector (in `oldParams`) that must
    // route to legacySearch, mirroring videodb-python whose `unsupported_params`
    // holds `index_ids` but not `index_id`.
    const unsupported: (keyof VideoSearchOptions)[] = [
      'indexName',
      'indexNames',
      'indexIds',
    ];

    const hasOld =
      positionalLegacy ||
      oldParams.some(k => options[k] !== undefined && options[k] !== null);
    const hasNew = newParams.some(
      k => options[k] !== undefined && options[k] !== null
    );
    const hasUnsupported = unsupported.some(
      k => options[k] !== undefined && options[k] !== null
    );

    if (options.deepsearchConfig != null) {
      throw new VideodbError(
        'deepsearchConfig is internal and cannot be passed to search().'
      );
    }
    if (hasOld && (hasNew || hasUnsupported)) {
      throw new VideodbError(
        'Cannot mix legacy search params with new search params. ' +
          'Use search(...) for new search or legacySearch(...) for legacy search.'
      );
    }
    if (hasUnsupported) {
      throw new VideodbError(
        'indexName/indexNames/indexIds are not supported in search(). ' +
          'Use semanticSearch(), query(), or aggregate() for index-specific calls.'
      );
    }

    if (hasOld) {
      warnLegacySearchOnce();
      return this.legacySearch(
        query,
        options.searchType,
        options.indexType,
        options.resultThreshold,
        options.scoreThreshold,
        options.dynamicScorePercentage,
        options.filter,
        options.sortDocsOn,
        options.sceneIndexId,
        options.indexId,
        options.algorithm
      );
    }

    return this.#newSearch(query, options);
  };

  #newSearch = async (
    query: string,
    options: VideoSearchOptions
  ): Promise<SearchResponse> => {
    const payload: Record<string, unknown> = { query };
    if (options.topK != null) payload.top_k = options.topK;
    if (options.mode != null) payload.mode = options.mode;
    if (options.returnFields != null)
      payload.return_fields = options.returnFields;
    if (options.includeClip != null) payload.include_clip = options.includeClip;
    if (options.sessionId != null) payload.session_id = options.sessionId;
    if (options.config != null) payload.config = options.config;
    // Shared with legacy; forwarded to Search V2 like videodb-python's
    // `_new_search(**kwargs)` passthrough of a `score_threshold` kwarg.
    if (options.scoreThreshold != null)
      payload.score_threshold = options.scoreThreshold;
    const res = await this.#vhttp.post<Record<string, unknown>, typeof payload>(
      [video, this.id, searchPath, 'v2'],
      payload
    );
    return new SearchResponse(this.#vhttp, res.data as SearchResponseData);
  };

  /**
   * Ask a question and get an answer generated from retrieved video context.
   * @param question - The question to answer
   * @param topK - Number of context chunks to retrieve (default 15)
   * @param mode - Retrieval/answer mode (default `"default"`)
   * @param includeSources - Whether to include source shots (default false)
   */
  public ask = async (
    question: string,
    topK: number = 15,
    mode: string = 'default',
    includeSources: boolean = false
  ): Promise<AskResponse> => {
    const res = await this.#vhttp.post<Record<string, unknown>, object>(
      [video, this.id, ask],
      { question, top_k: topK, mode, include_sources: includeSources }
    );
    return new AskResponse(this.#vhttp, res.data as AskResponseData);
  };

  /**
   * Semantic search across one or more indexes on this video.
   */
  public semanticSearch = async (
    query: string,
    options: {
      indexNames?: string[] | string;
      topK?: number;
      scoreThreshold?: number;
      filter?: unknown[] | Record<string, unknown>;
      returnFields?: unknown[] | Record<string, unknown> | string;
      indexIds?: string[] | string;
    } = {}
  ): Promise<SearchResult> => {
    const res = await this.#vhttp.post<SearchApiResponse, object>(
      [video, this.id, semantic_search],
      {
        query,
        index_names: options.indexNames,
        index_ids: options.indexIds,
        top_k: options.topK ?? 10,
        score_threshold: options.scoreThreshold,
        filter: options.filter,
        return_fields: options.returnFields,
      }
    );
    return new SearchResult(this.#vhttp, res.data);
  };

  /**
   * Structured query against an index on this video.
   */
  public query = async (
    options: {
      indexName?: string;
      filter?: unknown[] | Record<string, unknown>;
      limit?: number;
      returnFields?: unknown[] | Record<string, unknown> | string;
      sort?: string | [string, string][];
      indexId?: string;
    } = {}
  ): Promise<SearchResult> => {
    const res = await this.#vhttp.post<SearchApiResponse, object>(
      [video, this.id, queryPath],
      {
        index_name: options.indexName,
        index_id: options.indexId,
        filter: options.filter,
        limit: options.limit ?? 100,
        return_fields: options.returnFields,
        sort: options.sort,
      }
    );
    return new SearchResult(this.#vhttp, res.data);
  };

  /**
   * Aggregate over an index on this video.
   */
  public aggregate = async (
    options: {
      indexName?: string;
      filter?: unknown[] | Record<string, unknown>;
      groupBy?: string;
      metric?: string;
      limit?: number;
      sort?: string | [string, string][];
      indexId?: string;
    } = {}
  ): Promise<Record<string, unknown> | Record<string, unknown>[]> => {
    // convert:false — aggregate buckets are keyed by user field names/values.
    const res = await this.#vhttp.post<
      Record<string, unknown> | Record<string, unknown>[],
      object
    >(
      [video, this.id, aggregate],
      {
        index_name: options.indexName,
        index_id: options.indexId,
        filter: options.filter,
        group_by: options.groupBy,
        metric: options.metric ?? 'count',
        limit: options.limit ?? 100,
        sort: options.sort,
      },
      undefined,
      { convert: false }
    );
    return res.data;
  };

  /**
   * Legacy search (pre-v2). Delegates to the {@link SearchFactory}.
   * @param query - Search query
   * @param searchType - [optional] Type of search to be performed
   * @param indexType - [optional] Index Type
   * @param resultThreshold - [optional] Result Threshold
   * @param scoreThreshold - [optional] Score Threshold
   * @param dynamicScorePercentage - [optional] Percentage of dynamic score to consider
   * @param filter - [optional] Additional metadata filters
   * @param sortDocsOn - [optional] Sort docs within each video by "score" or "start"
   * @param sceneIndexId - [optional] Target a specific legacy scene index by id
   * @param indexId - [optional] Alias for `sceneIndexId` (mirrors videodb-python's
   *   `index_id` → `scene_index_id` aliasing)
   * @param algorithm - [optional] Legacy ranking algorithm selector
   */
  public legacySearch = async (
    query: string,
    searchType?: SearchType,
    indexType?: IndexType,
    resultThreshold?: number,
    scoreThreshold?: number,
    dynamicScorePercentage?: number,
    filter?: Array<Record<string, unknown>>,
    sortDocsOn?: string,
    sceneIndexId?: string,
    indexId?: string,
    algorithm?: string
  ): Promise<SearchResult> => {
    // `indexId` is accepted as an alias for `sceneIndexId`; an explicit
    // `sceneIndexId` wins if both are provided.
    const resolvedSceneIndexId = sceneIndexId ?? indexId;
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
      sortDocsOn: sortDocsOn,
      sceneIndexId: resolvedSceneIndexId,
      algorithm: algorithm,
    });
    return results;
  };

  /**
   * Update the video's metadata
   * @param options - Fields to update
   * @param options.name - New name for the video
   */
  public update = async (options: { name?: string }) => {
    const data: Record<string, unknown> = {};
    if (options.name !== undefined) data.name = options.name;
    const res = await this.#vhttp.patch<
      { id: string; name: string },
      typeof data
    >([video, this.id], data);
    if (options.name !== undefined) this.name = res.data.name ?? options.name;
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
      length: this.length,
    };
    if (timeline) body.timeline = timeline;

    const res = await this.#vhttp.post<GenerateStreamResponse, typeof body>(
      [video, this.id, stream],
      body
    );

    this.streamUrl = res.data.streamUrl;
    if (res.data.playerUrl) this.playerUrl = res.data.playerUrl;
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
   * @param start - Start time in seconds (must be >= 0 and <= end)
   * @param end - End time in seconds (must be >= 0 and >= start)
   * @param segmenter - How to split the transcript into segments.
   *   Must be one of `Segmenter.word` (default, one segment per word),
   *   `Segmenter.sentence` (one segment per sentence), or
   *   `Segmenter.time` (fixed-duration segments controlled by `length`)
   * @param length - Duration in seconds for each segment when
   *   segmenter is `Segmenter.time` (default 1)
   * @param force - Force re-fetch transcript from the server, bypassing the local cache
   * @throws {VideodbError} If segmenter is not a valid value, or if
   *   start/end are negative or start > end
   * @returns The transcript data
   */
  public getTranscript = async (
    start?: number,
    end?: number,
    segmenter?: string,
    length?: number,
    force?: boolean
  ): Promise<Transcript> => {
    if (segmenter !== undefined && !VALID_SEGMENTERS.has(segmenter)) {
      throw new VideodbError(
        `Invalid segmenter '${segmenter}'. Must be one of: ${[...VALID_SEGMENTERS].sort().join(', ')}`
      );
    }
    if (start !== undefined && start < 0) {
      throw new VideodbError(`start must be non-negative, got ${start}`);
    }
    if (end !== undefined && end < 0) {
      throw new VideodbError(`end must be non-negative, got ${end}`);
    }
    if (start !== undefined && end !== undefined && start > end) {
      throw new VideodbError(
        `start (${start}) must be less than or equal to end (${end})`
      );
    }
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
    force: boolean = false,
    languageCode?: string
  ): Promise<{ success: boolean; message: string } | Transcript> => {
    const res = await this.#vhttp.post<TranscriptResponse, object>(
      [video, this.id, transcription],
      { force, language_code: languageCode }
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
    if (config.extractionType !== undefined)
      payload.extraction_type = config.extractionType;
    if (config.extractionConfig !== undefined)
      payload.extraction_config = config.extractionConfig;
    if (config.force !== undefined) payload.force = config.force;

    const res = await this.#vhttp.post<SceneCollectionResponse, typeof payload>(
      [video, this.id, scenes],
      payload
    );

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
    if (config.modelConfig !== undefined)
      payload.model_config = config.modelConfig;
    if (config.name !== undefined) payload.name = config.name;
    if (config.callbackUrl !== undefined)
      payload.callback_url = config.callbackUrl;
    if (config.sandboxId !== undefined) payload.sandbox_id = config.sandboxId;
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
    sandboxId?: string;
  }): Promise<string | undefined> => {
    const {
      prompt,
      batchConfig = { type: 'time', value: 10, frameCount: 1 },
      modelName,
      modelConfig = {},
      name,
      callbackUrl,
      sandboxId,
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
        sandbox_id: sandboxId,
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
   * Create an understanding run for this video.
   * @param analyzers - Analyzer definitions. The SDK accepts the friendly
   *   analyzer type `spoken_words` and maps it to the server analyzer.
   * @param options - Optional run-level config (segmentation/sampling/transform/
   *   audioChunking/callbackUrl) plus any extra fields.
   */
  public understand = async (
    analyzers: AnalyzerSpec[],
    options: {
      segmentation?: Record<string, unknown>;
      sampling?: Record<string, unknown>;
      transform?: Record<string, unknown>;
      audioChunking?: Record<string, unknown>;
      callbackUrl?: string;
      [key: string]: unknown;
    } = {}
  ): Promise<Understanding> => {
    const normalized = normalizeUnderstandingAnalyzers(analyzers);
    const payload: Record<string, unknown> = { analyzers: normalized };
    if (options.segmentation != null)
      payload.segmentation = options.segmentation;
    if (options.sampling != null) payload.sampling = options.sampling;
    if (options.transform != null) payload.transform = options.transform;
    if (options.audioChunking != null)
      payload.audio_chunking = options.audioChunking;
    if (options.callbackUrl != null) payload.callback_url = options.callbackUrl;
    for (const [key, value] of Object.entries(options)) {
      if (
        ![
          'segmentation',
          'sampling',
          'transform',
          'audioChunking',
          'callbackUrl',
        ].includes(key) &&
        value != null
      ) {
        payload[key] = value;
      }
    }

    const res = await this.#vhttp.post<UnderstandingData, typeof payload>(
      [video, this.id, understand],
      payload
    );
    const data: UnderstandingData = res.data ?? {};
    if (!data.analyzers) {
      data.analyzers = normalized.map(a => ({
        name: a.name,
        type: a.type,
        status: 'pending',
      }));
    }
    return new Understanding(this.#vhttp, this.id, {
      collectionId: this.collectionId,
      ...data,
    });
  };

  /**
   * Get an understanding run by id.
   * @param understandingId - Understanding run id
   */
  public getUnderstanding = async (
    understandingId: string
  ): Promise<Understanding> => {
    if (!understandingId) throw new VideodbError('understandingId is required');
    const res = await this.#vhttp.get<UnderstandingData>([
      video,
      this.id,
      understand,
      understandingId,
    ]);
    return new Understanding(this.#vhttp, this.id, {
      understandingId,
      collectionId: this.collectionId,
      ...(res.data ?? {}),
    });
  };

  /** List understanding runs for this video. */
  public listUnderstandings = async (): Promise<Understanding[]> => {
    const res = await this.#vhttp.get<{
      understandingResults?: UnderstandingData[];
    }>([video, this.id, understand]);
    const results = res.data?.understandingResults ?? [];
    return results.map(
      item =>
        new Understanding(this.#vhttp, this.id, {
          collectionId: this.collectionId,
          ...item,
        })
    );
  };

  /** Delete an understanding run. */
  public deleteUnderstanding = async (
    understandingId: string
  ): Promise<void> => {
    if (!understandingId) throw new VideodbError('understandingId is required');
    await this.#vhttp.delete([video, this.id, understand, understandingId]);
  };

  static #formatIndexSource(source: IndexSource): Record<string, unknown> {
    if (source === null || source === undefined) {
      throw new VideodbError('source is required');
    }
    if (
      typeof source === 'object' &&
      'toIndexSource' in source &&
      typeof (source as { toIndexSource?: unknown }).toIndexSource ===
        'function'
    ) {
      return (
        source as { toIndexSource: () => Record<string, unknown> }
      ).toIndexSource();
    }
    if (Array.isArray(source)) {
      return { scenes: source };
    }
    if (typeof source === 'object') {
      const s = source as Record<string, unknown>;
      if (Array.isArray(s.scenes) || s.understanding_id) {
        return s;
      }
      throw new VideodbError(
        "source dict must carry 'scenes' (temporal records) or an 'understanding_id' reference"
      );
    }
    throw new VideodbError(
      "source must be an analyzer object, a dict with 'scenes' or 'understanding_id', or a list of temporal records"
    );
  }

  #formatIndex = (indexData: RawIndexManifest): Index => {
    const { video_id, collection_id, ...rest } = indexData;
    return new Index(
      this.#vhttp,
      video_id || this.id,
      collection_id || this.collectionId,
      rest
    );
  };

  /**
   * Create a retrieval-ready index from an understanding artifact.
   * @param source - An {@link UnderstandingAnalyzer} (indexed by reference), a
   *   dict carrying `scenes` or an `understanding_id`, or a list of records.
   * @param options - name / useFor / fields / callbackUrl
   */
  public index = async (
    source: IndexSource,
    options: {
      name?: string;
      useFor?: string[];
      fields?: Record<string, string[]>;
      callbackUrl?: string;
    } = {}
  ): Promise<Index | undefined> => {
    const res = await this.#vhttp.post<RawIndexManifest, object>(
      [video, this.id, indexes],
      {
        source: Video.#formatIndexSource(source),
        name: options.name,
        use_for: options.useFor,
        fields: options.fields,
        callback_url: options.callbackUrl,
      },
      undefined,
      { convert: false }
    );
    if (!res.data) return undefined;
    return this.#formatIndex(res.data as unknown as RawIndexManifest);
  };

  /**
   * Get an index manifest by its ID or name.
   * @param options - Either `indexId` or `name` must be provided.
   */
  public getIndex = async (options: {
    indexId?: string;
    name?: string;
  }): Promise<Index | undefined> => {
    if (!options.indexId && !options.name) {
      throw new VideodbError('Either indexId or name is required');
    }
    const params: Record<string, unknown> = {
      collection_id: this.collectionId,
    };
    let path: string[];
    if (options.indexId) {
      path = [video, this.id, indexes, options.indexId];
    } else {
      path = [video, this.id, indexes];
      params.name = options.name;
    }
    const res = await this.#vhttp.get<RawIndexManifest>(path, { params }, {
      convert: false,
    });
    if (!res.data) return undefined;
    return this.#formatIndex(res.data as unknown as RawIndexManifest);
  };

  /**
   * List all the indexes of the video.
   * @param useFor - (optional) Filter by retrieval capability.
   */
  public listIndexes = async (useFor?: string): Promise<Index[]> => {
    const params: Record<string, unknown> = {
      collection_id: this.collectionId,
    };
    if (useFor != null) params.use_for = useFor;
    const res = await this.#vhttp.get<{ indexes?: RawIndexManifest[] }>(
      [video, this.id, indexes],
      { params },
      { convert: false }
    );
    const data = res.data as unknown as { indexes?: RawIndexManifest[] };
    return (data?.indexes ?? []).map(i => this.#formatIndex(i));
  };

  /**
   * Delete an index. Removes the index's retrieval structures only.
   * @param indexId - The id of the index to be deleted
   */
  public deleteIndex = async (indexId: string): Promise<void> => {
    if (!indexId) throw new VideodbError('indexId is required');
    await this.#vhttp.delete([video, this.id, indexes, indexId], {
      params: { collection_id: this.collectionId },
    });
  };

  /**
   * Overlays subtitles on top of a video
   * @returns an awaited stream url for subtitled overlayed video
   *
   */
  public addSubtitle = async (config?: Partial<SubtitleStyleProps>) => {
    const merged: SubtitleStyleProps = {
      ...SubtitleStyleDefaultValues,
      ...config,
    };
    const res = await this.#vhttp.post<
      GenerateStreamResponse,
      { type: string; subtitle_style: Record<string, unknown> }
    >([video, this.id, workflow], {
      type: Workflows.addSubtitles,
      subtitle_style: fromCamelToSnake(merged),
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
   * Generate an HTML iframe embed code for the video.
   * @param width - Width of the iframe (default `"100%"`)
   * @param height - Height of the iframe in pixels (default `405`)
   * @param title - Title attribute (default `"VideoDB Player"`)
   * @param allowFullscreen - Whether to allow fullscreen (default `true`)
   * @param autoGenerate - If true and playerUrl is missing, auto-generate it (default `true`)
   * @throws {VideodbError} If the player URL is not available.
   */
  public getEmbedCode = async (
    width: string = '100%',
    height: number = 405,
    title: string = 'VideoDB Player',
    allowFullscreen: boolean = true,
    autoGenerate: boolean = true
  ): Promise<string> => {
    if (!this.playerUrl && autoGenerate) {
      await this.generateStream();
    }
    if (!this.playerUrl) {
      throw new VideodbError(
        'player_url not available. Call generateStream() first or set autoGenerate=true.'
      );
    }
    return buildIframeEmbedCode(
      this.playerUrl,
      width,
      height,
      title,
      allowFullscreen
    );
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
    const videoLength = this.length;
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
    contentType: 'spoken' | 'visual' | 'multimodal',
    modelName: 'basic' | 'pro' | 'ultra'
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
