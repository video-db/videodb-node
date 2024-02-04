import { ApiPath } from '@/constants';
import type { AudioBase, IAudio } from '@/interfaces/core';
import { HttpClient } from '@/utils/httpClient';

const { audio } = ApiPath;

/**
 * The base Audio class
 * @remarks
 * Use this to initialize an audio stored in VideoDB
 */
export class Audio implements IAudio {
  public meta: AudioBase;
  #vhttp: HttpClient;

  /**
   * Initializes a VideoDB Instance
   * @param http - HttpClient object
   * @param data - Data needed to initialize an audio instance
   */
  constructor(http: HttpClient, data: AudioBase) {
    this.meta = data;
    this.#vhttp = http;
  }

  /**
   * Returns an empty promise that resolves when the audio is deleted
   * @returns A promise that resolves when delete is successful
   * @throws an InvalidRequestError if the request fails
   */
  public delete = async () => {
    return await this.#vhttp.delete<Record<string, never>>([
      audio,
      this.meta.id,
    ]);
  };
}
