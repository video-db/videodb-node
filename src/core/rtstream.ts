import { ApiPath } from '@/constants';
import { SceneExtractionType } from '@/core/config';
import type {
  RTStreamBase,
  RTStreamSceneIndexBase,
  IndexScenesConfig,
} from '@/interfaces/core';
import { HttpClient } from '@/utils/httpClient';

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
 * RTStream class to interact with the RTStream
 */
export class RTStream {
  public id: string;
  public name?: string;
  public collectionId?: string;
  public createdAt?: string;
  public sampleRate?: number;
  public status?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: RTStreamBase) {
    this.#vhttp = http;
    this.id = data.id;
    this.name = data.name;
    this.collectionId = data.collectionId;
    this.createdAt = data.createdAt;
    this.sampleRate = data.sampleRate;
    this.status = data.status;
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
   * Index scenes from the rtstream
   * @param config - Configuration for scene indexing
   * @returns RTStreamSceneIndex object
   */
  public indexScenes = async (
    config: Partial<IndexScenesConfig> = {}
  ): Promise<RTStreamSceneIndex | null> => {
    const defaultConfig: IndexScenesConfig = {
      extractionType: SceneExtractionType.timeBased,
      extractionConfig: { time: 2, frame_count: 5 },
      prompt: 'Describe the scene',
      modelName: undefined,
      modelConfig: {},
      name: undefined,
    };

    const payload = { ...defaultConfig, ...config };

    const res = await this.#vhttp.post<RTStreamSceneIndexBase, typeof payload>(
      [ApiPath.rtstream, this.id, ApiPath.index, ApiPath.scene],
      payload
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
}
