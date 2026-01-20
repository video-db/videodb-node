import { ApiPath } from '@/constants';
import type { SpokenIndexBase } from '@/interfaces/core';
import type { BatchConfig } from '@/types/capture';
import { HttpClient } from '@/utils/httpClient';

/**
 * SpokenIndex class for managing spoken word indexes on RTStreams
 *
 * @example
 * ```typescript
 * const spokenIndex = await rtstream.indexSpokenWords({
 *   batchConfig: { type: 'word', value: 10 },
 *   prompt: 'Extract key topics',
 *   socketId: ws.connectionId,
 * });
 *
 * await spokenIndex.start();
 * ```
 */
export class SpokenIndex {
  public id: string;
  public rtstreamId: string;
  public status?: string;
  public name?: string;
  public prompt?: string;
  public batchConfig?: BatchConfig;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: SpokenIndexBase) {
    this.#vhttp = http;
    this.id = data.id;
    this.rtstreamId = data.rtstreamId;
    this.status = data.status;
    this.name = data.name;
    this.prompt = data.prompt;
    this.batchConfig = data.batchConfig;
  }

  /**
   * Start the spoken index processing
   */
  public start = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.spoken,
        this.id,
        ApiPath.status,
      ],
      { action: 'start' }
    );
    this.status = 'connected';
  };

  /**
   * Stop the spoken index processing
   */
  public stop = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.spoken,
        this.id,
        ApiPath.status,
      ],
      { action: 'stop' }
    );
    this.status = 'stopped';
  };

  /**
   * String representation of the SpokenIndex
   */
  public toString(): string {
    return `SpokenIndex(id=${this.id}, rtstreamId=${this.rtstreamId}, status=${this.status})`;
  }
}
