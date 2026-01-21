import { ApiPath } from '@/constants';
import { SceneIndex } from '@/core/sceneIndex';
import { SpokenIndex } from '@/core/spokenIndex';
import type {
  RTStreamBase,
  RTStreamSceneIndexBase,
  RTStreamShotBase,
  RTStreamSearchConfig,
  IndexVisualsConfig,
  RTStreamIndexSpokenWordsConfig,
} from '@/interfaces/core';
import type { BatchConfig } from '@/types/capture';
import { HttpClient } from '@/utils/httpClient';
import { playStream } from '@/utils';

/**
 * Transcript status values
 */
export const TranscriptStatus = {
  inactive: 'inactive',
  active: 'active',
  stopping: 'stopping',
  stopped: 'stopped',
} as const;

export type TranscriptStatusType =
  (typeof TranscriptStatus)[keyof typeof TranscriptStatus];

/**
 * Result from stopping transcript
 */
export interface StopTranscriptResult {
  status: TranscriptStatusType;
  blockedBy?: string;
}

/**
 * Transcript status response
 */
export interface TranscriptStatusResult {
  status: TranscriptStatusType;
  socketId?: string;
  blockedBy?: string;
  stopRequested?: boolean;
}

/**
 * Transcript segment data
 */
export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence?: number;
}

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
 * RTStreamSceneIndex class to interact with the rtstream scene index (legacy)
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
   * Create an event alert
   * @param eventId - ID of the event
   * @param callbackUrl - URL to receive the alert callback
   * @returns Alert ID
   */
  public createAlert = async (
    eventId: string,
    callbackUrl: string
  ): Promise<string | null> => {
    const res = await this.#vhttp.post<{ alertId: string }, object>(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        this.rtstreamIndexId,
        ApiPath.alert,
      ],
      { eventId, callbackUrl }
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
 * Helper function to convert BatchConfig to API extraction format
 */
function batchConfigToExtractionConfig(batchConfig: BatchConfig): {
  extractionType: string;
  extractionConfig: Record<string, unknown>;
} {
  if (batchConfig.type === 'time' || batchConfig.type === 'shot') {
    return {
      extractionType: 'time_based',
      extractionConfig: {
        time: batchConfig.value,
        frameCount: batchConfig.frameCount || 1,
      },
    };
  } else {
    // word or sentence
    return {
      extractionType: 'transcript',
      extractionConfig: {
        segmenter: batchConfig.type,
        segmentationValue: batchConfig.value,
      },
    };
  }
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
   * Index visuals (scenes) from the rtstream
   * @param config - Configuration for visual indexing
   * @returns SceneIndex object
   *
   * @example
   * ```typescript
   * const sceneIndex = await rtstream.indexVisuals({
   *   batchConfig: { type: 'time', value: 2, frameCount: 2 },
   *   prompt: 'Describe the scene',
   *   socketId: ws.connectionId,
   * });
   *
   * await sceneIndex.start();
   * ```
   */
  public indexVisuals = async (
    config: IndexVisualsConfig
  ): Promise<SceneIndex | null> => {
    const { extractionType, extractionConfig } = batchConfigToExtractionConfig(
      config.batchConfig
    );

    const payload: Record<string, unknown> = {
      extractionType,
      extractionConfig,
      prompt: config.prompt || 'Describe the scene',
    };

    if (config.modelName) payload.modelName = config.modelName;
    if (config.modelConfig) payload.modelConfig = config.modelConfig;
    if (config.name) payload.name = config.name;
    if (config.socketId) payload.socketId = config.socketId;

    const res = await this.#vhttp.post<RTStreamSceneIndexBase, typeof payload>(
      [ApiPath.rtstream, this.id, ApiPath.index, ApiPath.scene],
      payload
    );

    if (!res.data) return null;

    return new SceneIndex(this.#vhttp, {
      id: res.data.rtstreamIndexId,
      rtstreamId: this.id,
      batchConfig: config.batchConfig,
      prompt: res.data.prompt,
      name: res.data.name,
      status: res.data.status,
    });
  };

  /**
   * List all scene indexes for the rtstream
   * @returns List of SceneIndex objects
   */
  public listSceneIndexes = async (): Promise<SceneIndex[]> => {
    const res = await this.#vhttp.get<{
      sceneIndexes: RTStreamSceneIndexBase[];
    }>([ApiPath.rtstream, this.id, ApiPath.index, ApiPath.scene]);

    return (res.data?.sceneIndexes || []).map(
      index =>
        new SceneIndex(this.#vhttp, {
          id: index.rtstreamIndexId,
          rtstreamId: this.id,
          prompt: index.prompt,
          name: index.name,
          status: index.status,
        })
    );
  };

  /**
   * Get a scene index by its ID
   * @param indexId - ID of the scene index
   * @returns SceneIndex object
   */
  public getSceneIndex = async (indexId: string): Promise<SceneIndex> => {
    const res = await this.#vhttp.get<RTStreamSceneIndexBase>([
      ApiPath.rtstream,
      this.id,
      ApiPath.index,
      indexId,
    ]);

    return new SceneIndex(this.#vhttp, {
      id: res.data.rtstreamIndexId,
      rtstreamId: this.id,
      prompt: res.data.prompt,
      name: res.data.name,
      status: res.data.status,
    });
  };

  /**
   * Index spoken words from the rtstream transcript
   * @param config - Configuration for spoken words indexing
   * @returns SpokenIndex object
   *
   * @example
   * ```typescript
   * const spokenIndex = await rtstream.indexSpokenWords({
   *   batchConfig: { type: 'word', value: 10 },
   *   prompt: 'Summarize what the speaker is saying',
   *   socketId: ws.connectionId,
   *   autoStartTranscript: true,
   * });
   *
   * await spokenIndex.start();
   * ```
   */
  public indexSpokenWords = async (
    config: RTStreamIndexSpokenWordsConfig
  ): Promise<SpokenIndex | null> => {
    const { extractionType, extractionConfig } = batchConfigToExtractionConfig(
      config.batchConfig
    );

    const data: Record<string, unknown> = {
      extractionType,
      extractionConfig,
      prompt: config.prompt,
    };

    if (config.modelName) data.modelName = config.modelName;
    if (config.modelConfig) data.modelConfig = config.modelConfig;
    if (config.name) data.name = config.name;
    if (config.socketId) data.socketId = config.socketId;
    if (config.autoStartTranscript !== undefined) {
      data.autoStartTranscript = config.autoStartTranscript;
    }

    const res = await this.#vhttp.post<
      { id: string; status?: string; name?: string; prompt?: string },
      typeof data
    >([ApiPath.rtstream, this.id, ApiPath.index, ApiPath.spoken], data);

    if (!res.data) return null;

    return new SpokenIndex(this.#vhttp, {
      id: res.data.id,
      rtstreamId: this.id,
      status: res.data.status,
      name: res.data.name,
      prompt: res.data.prompt,
      batchConfig: config.batchConfig,
    });
  };

  /**
   * Get transcript segments within a time range
   * @param config - Configuration for transcript retrieval
   * @param config.fromMs - Start time in milliseconds (optional)
   * @param config.toMs - End time in milliseconds (optional)
   * @param config.limit - Maximum number of segments to return (optional, default: 500)
   * @returns Array of transcript segments
   *
   * @example
   * ```typescript
   * const segments = await rtstream.getTranscript({ fromMs: 0, toMs: 60000, limit: 500 });
   * for (const seg of segments) {
   *   console.log(seg.text);
   * }
   * ```
   */
  public getTranscript = async (
    config: { fromMs?: number; toMs?: number; limit?: number } = {}
  ): Promise<TranscriptSegment[]> => {
    const params: Record<string, unknown> = {};
    if (config.fromMs !== undefined) params.from_ms = config.fromMs;
    if (config.toMs !== undefined) params.to_ms = config.toMs;
    if (config.limit !== undefined) params.limit = config.limit;

    const res = await this.#vhttp.get<{ segments: TranscriptSegment[] }>(
      [ApiPath.rtstream, this.id, ApiPath.transcription],
      { params }
    );
    return res.data?.segments || [];
  };

  /**
   * Start transcript processing for the rtstream
   * @param config - Optional configuration
   * @param config.socketId - WebSocket connection ID for real-time updates
   */
  public startTranscript = async (
    config: { socketId?: string } = {}
  ): Promise<void> => {
    const data: Record<string, unknown> = { action: 'start' };
    if (config.socketId) {
      data.socketId = config.socketId;
    }
    await this.#vhttp.patch<void, Record<string, unknown>>(
      [ApiPath.rtstream, this.id, ApiPath.transcription, ApiPath.status],
      data
    );
  };

  /**
   * Stop transcript processing for the rtstream
   * @param config - Optional configuration
   * @param config.mode - Stop mode: 'graceful' (wait for dependencies) or 'force' (immediate)
   * @returns Result with status and optional blockedBy if graceful stop is blocked
   */
  public stopTranscript = async (
    config: { mode?: 'graceful' | 'force' } = {}
  ): Promise<StopTranscriptResult> => {
    const { mode = 'graceful' } = config;
    const res = await this.#vhttp.patch<StopTranscriptResult, object>(
      [ApiPath.rtstream, this.id, ApiPath.transcription, ApiPath.status],
      { action: 'stop', mode }
    );
    return res.data;
  };

  /**
   * Get the current transcript status
   * @returns Transcript status including socketId if active and blockedBy if stopping is blocked
   */
  public getTranscriptStatus = async (): Promise<TranscriptStatusResult> => {
    const res = await this.#vhttp.get<TranscriptStatusResult>([
      ApiPath.rtstream,
      this.id,
      ApiPath.transcription,
      ApiPath.status,
    ]);
    return res.data;
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

    if (config.indexType !== undefined) data.indexType = config.indexType;
    if (config.indexId !== undefined) data.sceneIndexId = config.indexId;
    if (config.resultThreshold !== undefined)
      data.resultThreshold = config.resultThreshold;
    if (config.scoreThreshold !== undefined)
      data.scoreThreshold = config.scoreThreshold;
    if (config.dynamicScorePercentage !== undefined)
      data.dynamicScorePercentage = config.dynamicScorePercentage;
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
