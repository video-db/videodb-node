import { ApiPath } from '@/constants';
import type { SceneIndexBase } from '@/interfaces/core';
import type { BatchConfig } from '@/types/capture';
import { HttpClient } from '@/utils/httpClient';

/**
 * Scene data from index
 */
export interface SceneData {
  id: string;
  start: number;
  end: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Alert data
 */
export interface AlertData {
  id: string;
  eventId: string;
  callbackUrl: string;
  status?: string;
}

/**
 * SceneIndex class for managing scene indexes on RTStreams
 *
 * @example
 * ```typescript
 * const sceneIndex = await rtstream.indexVisuals({
 *   batchConfig: { type: 'time', value: 2, frameCount: 1 },
 *   prompt: 'Describe the scene',
 *   socketId: ws.connectionId,
 * });
 *
 * await sceneIndex.start();
 *
 * // Later, get scenes
 * const { scenes, nextPage } = await sceneIndex.getScenes();
 * ```
 */
export class SceneIndex {
  public id: string;
  public rtstreamId: string;
  public status?: string;
  public name?: string;
  public batchConfig?: BatchConfig;
  public prompt?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: SceneIndexBase) {
    this.#vhttp = http;
    this.id = data.id;
    this.rtstreamId = data.rtstreamId;
    this.status = data.status;
    this.name = data.name;
    this.batchConfig = data.batchConfig;
    this.prompt = data.prompt;
  }

  /**
   * Start the scene index processing
   */
  public start = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.id,
        ApiPath.status,
      ],
      { action: 'start' }
    );
    this.status = 'connected';
  };

  /**
   * Stop the scene index processing
   */
  public stop = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.id,
        ApiPath.status,
      ],
      { action: 'stop' }
    );
    this.status = 'stopped';
  };

  /**
   * Create an event alert for this scene index
   * @param config - Alert configuration
   * @param config.eventId - ID of the event to trigger on
   * @param config.callbackUrl - URL to receive alert notifications
   * @returns The created alert ID
   *
   * @example
   * ```typescript
   * const alertId = await sceneIndex.createAlert({
   *   eventId: 'evt-xxx',
   *   callbackUrl: 'https://example.com/webhook',
   * });
   * ```
   */
  public createAlert = async (config: {
    eventId: string;
    callbackUrl: string;
  }): Promise<string> => {
    const res = await this.#vhttp.post<{ alertId: string }, object>(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        this.id,
        ApiPath.alert,
      ],
      { event_id: config.eventId, callback_url: config.callbackUrl }
    );
    return res.data.alertId;
  };

  /**
   * Get scenes from this index
   * @param start - Start time filter (optional)
   * @param end - End time filter (optional)
   * @param page - Page number (default: 1)
   * @param pageSize - Number of scenes per page (default: 100)
   * @returns Object with scenes array and next_page boolean
   */
  public getScenes = async (
    start?: number,
    end?: number,
    page: number = 1,
    pageSize: number = 100
  ): Promise<{ scenes: SceneData[]; nextPage: boolean }> => {
    const params: Record<string, unknown> = { page, page_size: pageSize };
    if (start !== undefined && end !== undefined) {
      params.start = start;
      params.end = end;
    }

    const res = await this.#vhttp.get<{
      sceneIndexRecords: SceneData[];
      nextPage: boolean;
    }>(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.id,
      ],
      { params }
    );

    return {
      scenes: res.data?.sceneIndexRecords || [],
      nextPage: res.data?.nextPage || false,
    };
  };

  /**
   * List all alerts for this scene index
   * @returns Array of alert data
   */
  public listAlerts = async (): Promise<AlertData[]> => {
    const res = await this.#vhttp.get<{ alerts: AlertData[] }>([
      ApiPath.rtstream,
      this.rtstreamId,
      ApiPath.index,
      this.id,
      ApiPath.alert,
    ]);
    return res.data?.alerts || [];
  };

  /**
   * Enable an alert
   * @param alertId - ID of the alert to enable
   */
  public enableAlert = async (alertId: string): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        this.id,
        ApiPath.alert,
        alertId,
        ApiPath.status,
      ],
      { action: 'enable' }
    );
  };

  /**
   * Disable an alert
   * @param alertId - ID of the alert to disable
   */
  public disableAlert = async (alertId: string): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        this.id,
        ApiPath.alert,
        alertId,
        ApiPath.status,
      ],
      { action: 'disable' }
    );
  };

  /**
   * String representation of the SceneIndex
   */
  public toString(): string {
    return `SceneIndex(id=${this.id}, rtstreamId=${this.rtstreamId}, status=${this.status})`;
  }
}
