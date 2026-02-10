import { ApiPath } from '@/constants';
import type {
  RTStreamBase,
  RTStreamSceneIndexBase,
  RTStreamShotBase,
  RTStreamSearchConfig,
} from '@/interfaces/core';
import type {
  IndexVisualsConfig,
  IndexSpokenWordsConfig,
} from '@/types/capture';
import { HttpClient } from '@/utils/httpClient';
import { playStream } from '@/utils';

/**
 * RTStreamShot class for rtstream search results
 */
export class RTStreamShot {
  public rtstreamId: string;
  public rtstreamName?: string;
  public start: number;
  public end: number;
  public text?: string;
  public searchScore?: number;
  public sceneIndexId?: string;
  public sceneIndexName?: string;
  public metadata?: Record<string, unknown>;
  public streamUrl?: string;
  public playerUrl?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: RTStreamShotBase) {
    this.#vhttp = http;
    this.rtstreamId = data.rtstreamId;
    this.rtstreamName = data.rtstreamName;
    this.start = data.start;
    this.end = data.end;
    this.text = data.text;
    this.searchScore = data.searchScore;
    this.sceneIndexId = data.sceneIndexId;
    this.sceneIndexName = data.sceneIndexName;
    this.metadata = data.metadata;
  }

  /**
   * Generate a stream url for the shot
   * @returns The stream url
   */
  public generateStream = async (): Promise<string | null> => {
    if (this.streamUrl) return this.streamUrl;

    const res = await this.#vhttp.get<{ streamUrl: string; playerUrl: string }>(
      [ApiPath.rtstream, this.rtstreamId, ApiPath.stream],
      { params: { start: Math.floor(this.start), end: Math.floor(this.end) } }
    );
    this.streamUrl = res.data?.streamUrl;
    this.playerUrl = res.data?.playerUrl;
    return this.streamUrl || null;
  };

  /**
   * Generate a stream url for the shot and open it in the default browser
   * @returns The stream url
   */
  public play = async (): Promise<string | null> => {
    await this.generateStream();
    if (this.streamUrl) {
      return playStream(this.streamUrl);
    }
    return null;
  };
}

/**
 * RTStreamSearchResult class to interact with rtstream search results
 */
export class RTStreamSearchResult {
  public collectionId: string;
  public shots: RTStreamShot[];

  constructor(collectionId: string, shots: RTStreamShot[]) {
    this.collectionId = collectionId;
    this.shots = shots;
  }

  /**
   * Get the list of shots from the search result
   * @returns List of RTStreamShot objects
   */
  public getShots = (): RTStreamShot[] => {
    return this.shots;
  };
}

/**
 * RTStreamSceneIndex class to interact with the rtstream scene index
 */
export class RTStreamSceneIndex {
  public rtstreamIndexId: string;
  public rtstreamId: string;
  public extractionType?: string;
  public extractionConfig?: Record<string, unknown>;
  public prompt?: string;
  public name?: string;
  public status?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: RTStreamSceneIndexBase) {
    this.#vhttp = http;
    this.rtstreamIndexId = data.rtstreamIndexId;
    this.rtstreamId = data.rtstreamId;
    this.extractionType = data.extractionType;
    this.extractionConfig = data.extractionConfig;
    this.prompt = data.prompt;
    this.name = data.name;
    this.status = data.status;
  }

  /**
   * Get rtstream scene index scenes
   * @param start - Start time of the scenes
   * @param end - End time of the scenes
   * @param page - Page number
   * @param pageSize - Number of scenes per page
   * @returns Object with scenes array and next_page boolean
   */
  public getScenes = async (
    start?: number,
    end?: number,
    page: number = 1,
    pageSize: number = 100
  ): Promise<{ scenes: unknown[]; nextPage: boolean } | null> => {
    const params: Record<string, unknown> = { page, page_size: pageSize };
    if (start !== undefined && end !== undefined) {
      params.start = start;
      params.end = end;
    }

    const res = await this.#vhttp.get<{
      sceneIndexRecords: unknown[];
      nextPage: boolean;
    }>(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.rtstreamIndexId,
      ],
      { params }
    );

    if (!res.data) return null;

    return {
      scenes: res.data.sceneIndexRecords || [],
      nextPage: res.data.nextPage || false,
    };
  };

  /**
   * Start the scene index
   */
  public start = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.rtstreamIndexId,
        ApiPath.status,
      ],
      { action: 'start' }
    );
    this.status = 'connected';
  };

  /**
   * Stop the scene index
   */
  public stop = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.rtstreamIndexId,
        ApiPath.status,
      ],
      { action: 'stop' }
    );
    this.status = 'stopped';
  };

  /**
   * Update the scene index prompt
   * @param prompt - New prompt for the scene index
   * @returns API response with update status
   */
  public updateSceneIndex = async (
    prompt: string
  ): Promise<{
    success: boolean;
    message?: string;
    data?: { prompt?: string };
  } | null> => {
    const res = await this.#vhttp.patch<
      { success: boolean; message?: string; data?: { prompt?: string } },
      { prompt: string }
    >(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.rtstreamIndexId,
      ],
      { prompt }
    );

    if (res.data?.data?.prompt) {
      this.prompt = res.data.data.prompt;
    } else if (res.data?.success) {
      this.prompt = prompt;
    }

    return res.data || null;
  };

  /**
   * Create an event alert
   * @param eventId - ID of the event
   * @param callbackUrl - URL to receive the alert callback
   * @param socketId - WebSocket connection ID for real-time alerts (optional)
   * @returns Alert ID
   */
  public createAlert = async (
    eventId: string,
    callbackUrl: string,
    socketId?: string
  ): Promise<string | null> => {
    const data: Record<string, unknown> = {
      event_id: eventId,
      callback_url: callbackUrl,
    };
    if (socketId) data.ws_connection_id = socketId;

    const res = await this.#vhttp.post<{ alertId: string }, typeof data>(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        this.rtstreamIndexId,
        ApiPath.alert,
      ],
      data
    );
    return res.data?.alertId || null;
  };

  /**
   * List all alerts for the rtstream scene index
   * @returns List of alerts
   */
  public listAlerts = async (): Promise<unknown[]> => {
    const res = await this.#vhttp.get<{ alerts: unknown[] }>([
      ApiPath.rtstream,
      this.rtstreamId,
      ApiPath.index,
      this.rtstreamIndexId,
      ApiPath.alert,
    ]);
    return res.data?.alerts || [];
  };

  /**
   * Enable an alert
   * @param alertId - ID of the alert
   */
  public enableAlert = async (alertId: string): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        this.rtstreamIndexId,
        ApiPath.alert,
        alertId,
        ApiPath.status,
      ],
      { action: 'enable' }
    );
  };

  /**
   * Disable an alert
   * @param alertId - ID of the alert
   */
  public disableAlert = async (alertId: string): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        this.rtstreamIndexId,
        ApiPath.alert,
        alertId,
        ApiPath.status,
      ],
      { action: 'disable' }
    );
  };
}

/**
 * RTStream class to interact with the RTStream
 */
export class RTStream {
  public id: string;
  public name?: string;
  public collectionId?: string;
  public createdAt?: string;
  public sampleRate?: number;
  public status?: string;
  /** Channel ID this rtstream is associated with */
  public channelId?: string;
  /** Media types this rtstream handles */
  public mediaTypes?: string[];
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: RTStreamBase) {
    this.#vhttp = http;
    this.id = data.id;
    this.name = data.name;
    this.collectionId = data.collectionId;
    this.createdAt = data.createdAt;
    this.sampleRate = data.sampleRate;
    this.status = data.status;
    this.channelId = data.channelId;
    this.mediaTypes = data.mediaTypes;
  }

  /**
   * Connect to the rtstream
   */
  public start = async (): Promise<void> => {
    await this.#vhttp.patch([ApiPath.rtstream, this.id, ApiPath.status], {
      action: 'start',
    });
    this.status = 'connected';
  };

  /**
   * Disconnect from the rtstream
   */
  public stop = async (): Promise<void> => {
    await this.#vhttp.patch([ApiPath.rtstream, this.id, ApiPath.status], {
      action: 'stop',
    });
    this.status = 'stopped';
  };

  /**
   * Generate a stream from the rtstream
   * @param start - Start time of the stream in Unix timestamp format
   * @param end - End time of the stream in Unix timestamp format
   * @returns Stream URL
   */
  public generateStream = async (
    start: number,
    end: number
  ): Promise<string | null> => {
    const res = await this.#vhttp.get<{ streamUrl: string }>(
      [ApiPath.rtstream, this.id, ApiPath.stream],
      { params: { start, end } }
    );
    return res.data?.streamUrl || null;
  };

  /**
   * Index visuals from the rtstream (scene indexing)
   * @param config - Configuration for visual indexing
   * @returns RTStreamSceneIndex object
   */
  public indexVisuals = async (
    config: IndexVisualsConfig
  ): Promise<RTStreamSceneIndex | null> => {
    const extractionType =
      config.batchConfig.type === 'time'
        ? 'time_based'
        : config.batchConfig.type;
    const extractionConfig: Record<string, unknown> = {
      time: config.batchConfig.value,
      frame_count: config.batchConfig.frameCount ?? 5,
    };

    const data: Record<string, unknown> = {
      extraction_type: extractionType,
      extraction_config: extractionConfig,
      prompt: config.prompt,
      model_name: config.modelName,
      model_config: config.modelConfig ?? {},
      name: config.name,
    };

    if (config.socketId) data.ws_connection_id = config.socketId;

    const res = await this.#vhttp.post<RTStreamSceneIndexBase, typeof data>(
      [ApiPath.rtstream, this.id, ApiPath.index, ApiPath.scene],
      data
    );

    if (!res.data) return null;

    return new RTStreamSceneIndex(this.#vhttp, {
      rtstreamIndexId: res.data.rtstreamIndexId,
      rtstreamId: this.id,
      extractionType: res.data.extractionType,
      extractionConfig: res.data.extractionConfig,
      prompt: res.data.prompt,
      name: res.data.name,
      status: res.data.status,
    });
  };

  /**
   * List all scene indexes for the rtstream
   * @returns List of RTStreamSceneIndex objects
   */
  public listSceneIndexes = async (): Promise<RTStreamSceneIndex[]> => {
    const res = await this.#vhttp.get<{
      sceneIndexes: RTStreamSceneIndexBase[];
    }>([ApiPath.rtstream, this.id, ApiPath.index, ApiPath.scene]);

    return (res.data?.sceneIndexes || []).map(
      index =>
        new RTStreamSceneIndex(this.#vhttp, {
          rtstreamIndexId: index.rtstreamIndexId,
          rtstreamId: this.id,
          extractionType: index.extractionType,
          extractionConfig: index.extractionConfig,
          prompt: index.prompt,
          name: index.name,
          status: index.status,
        })
    );
  };

  /**
   * Get a scene index by its ID
   * @param indexId - ID of the scene index
   * @returns RTStreamSceneIndex object
   */
  public getSceneIndex = async (
    indexId: string
  ): Promise<RTStreamSceneIndex> => {
    const res = await this.#vhttp.get<RTStreamSceneIndexBase>([
      ApiPath.rtstream,
      this.id,
      ApiPath.index,
      indexId,
    ]);

    return new RTStreamSceneIndex(this.#vhttp, {
      rtstreamIndexId: res.data.rtstreamIndexId,
      rtstreamId: this.id,
      extractionType: res.data.extractionType,
      extractionConfig: res.data.extractionConfig,
      prompt: res.data.prompt,
      name: res.data.name,
      status: res.data.status,
    });
  };

  /**
   * Index audio from the rtstream transcript
   * @param config - Configuration for audio indexing
   * @returns RTStreamSceneIndex object
   */
  public indexAudio = async (
    config: IndexSpokenWordsConfig
  ): Promise<RTStreamSceneIndex | null> => {
    const extractionConfig = {
      segmenter: config.batchConfig.type,
      segmentation_value: config.batchConfig.value,
    };

    const data: Record<string, unknown> = {
      extraction_type: 'transcript',
      extraction_config: extractionConfig,
      prompt: config.prompt,
      model_name: config.modelName,
      model_config: config.modelConfig ?? {},
      name: config.name,
      auto_start_transcript: config.autoStartTranscript ?? true,
    };

    if (config.socketId) data.ws_connection_id = config.socketId;

    const res = await this.#vhttp.post<RTStreamSceneIndexBase, typeof data>(
      [ApiPath.rtstream, this.id, ApiPath.index, ApiPath.scene],
      data
    );

    if (!res.data) return null;

    return new RTStreamSceneIndex(this.#vhttp, {
      rtstreamIndexId: res.data.rtstreamIndexId,
      rtstreamId: this.id,
      extractionType: res.data.extractionType,
      extractionConfig: res.data.extractionConfig,
      prompt: res.data.prompt,
      name: res.data.name,
      status: res.data.status,
    });
  };

  /**
   * Get transcription data from the rtstream
   * @param config - Configuration for transcript retrieval
   * @param config.page - Page number (default: 1)
   * @param config.pageSize - Items per page (default: 100, max: 1000)
   * @param config.start - Start timestamp filter (optional)
   * @param config.end - End timestamp filter (optional)
   * @param config.since - For polling - only get transcriptions after this timestamp (optional)
   * @param config.engine - Transcription engine (optional)
   * @returns Transcription data with segments and metadata
   *
   * @example
   * ```typescript
   * const data = await rtstream.getTranscript({ page: 1, pageSize: 100 });
   * console.log(data);
   * ```
   */
  public getTranscript = async (
    config: {
      page?: number;
      pageSize?: number;
      start?: number;
      end?: number;
      since?: number;
      engine?: string;
    } = {}
  ): Promise<Record<string, unknown>> => {
    const params: Record<string, unknown> = {
      engine: config.engine,
      page: config.page ?? 1,
      page_size: config.pageSize ?? 100,
    };
    if (config.start !== undefined) params.start = config.start;
    if (config.end !== undefined) params.end = config.end;
    if (config.since !== undefined) params.since = config.since;

    const res = await this.#vhttp.get<Record<string, unknown>>(
      [ApiPath.rtstream, this.id, ApiPath.transcription],
      { params }
    );
    return res.data || {};
  };

  /**
   * Start transcription for the rtstream
   * @param socketId - WebSocket connection ID for real-time transcript updates (optional)
   * @param engine - Transcription engine (default: "assemblyai")
   * @returns Transcription status with start time
   */
  public startTranscript = async (
    socketId?: string,
    engine: string = 'assemblyai'
  ): Promise<Record<string, unknown>> => {
    const data: Record<string, unknown> = { action: 'start', engine };
    if (socketId) data.ws_connection_id = socketId;

    const res = await this.#vhttp.post<Record<string, unknown>, typeof data>(
      [ApiPath.rtstream, this.id, ApiPath.transcription],
      data
    );
    return res.data || {};
  };

  /**
   * Stop transcription for the rtstream
   * @param mode - Stop mode: "graceful" (default) or "force"
   * @param engine - Transcription engine (default: "assemblyai")
   * @returns Transcription status with start and end time
   */
  public stopTranscript = async (
    mode: 'graceful' | 'force' = 'graceful',
    engine: string = 'assemblyai'
  ): Promise<Record<string, unknown>> => {
    const res = await this.#vhttp.post<Record<string, unknown>, object>(
      [ApiPath.rtstream, this.id, ApiPath.transcription],
      { action: 'stop', mode, engine }
    );
    return res.data || {};
  };

  /**
   * Search across scene index records for the rtstream
   * @param config - Search configuration
   * @returns RTStreamSearchResult object
   */
  public search = async (
    config: RTStreamSearchConfig
  ): Promise<RTStreamSearchResult> => {
    const data: Record<string, unknown> = { query: config.query };

    if (config.indexType !== undefined) data.index_type = config.indexType;
    if (config.indexId !== undefined) data.scene_index_id = config.indexId;
    if (config.resultThreshold !== undefined)
      data.result_threshold = config.resultThreshold;
    if (config.scoreThreshold !== undefined)
      data.score_threshold = config.scoreThreshold;
    if (config.dynamicScorePercentage !== undefined)
      data.dynamic_score_percentage = config.dynamicScorePercentage;
    if (config.filter !== undefined) data.filter = config.filter;

    const res = await this.#vhttp.post<
      { results: Array<Record<string, unknown>> },
      typeof data
    >([ApiPath.rtstream, this.id, ApiPath.search], data);

    const results = res.data?.results || [];
    const shots = results.map(
      (result: Record<string, unknown>) =>
        new RTStreamShot(this.#vhttp, {
          rtstreamId: this.id,
          rtstreamName: this.name,
          start: (result.start as number) || 0,
          end: (result.end as number) || 0,
          text: result.text as string | undefined,
          searchScore: result.score as number | undefined,
          sceneIndexId: result.sceneIndexId as string | undefined,
          sceneIndexName: result.sceneIndexName as string | undefined,
          metadata: result.metadata as Record<string, unknown> | undefined,
        })
    );

    return new RTStreamSearchResult(this.collectionId || '', shots);
  };
}
