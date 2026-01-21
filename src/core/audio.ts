import { ApiPath } from '@/constants';
import type { AudioBase, GenerateUrlResponse, IAudio } from '@/interfaces/core';
import { HttpClient } from '@/utils/httpClient';

const { audio, generate_url } = ApiPath;

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

  /**
   * Generates the signed URL of the audio.
   * @returns A promise that resolves to the signed URL of the audio.
   * @throws an InvalidRequestError if the request fails
   */
  public generateUrl = async () => {
    const urlData = await this.#vhttp.post<GenerateUrlResponse, object>(
      [audio, this.meta.id, generate_url],
      {},
      {
        params: { collection_id: this.meta.collectionId },
      }
    );

    const signedUrl = urlData.data.signed_url;
    return signedUrl;
  };
}
