import { ApiPath } from '@/constants';
import type { ImageBase, IImage } from '@/interfaces/core';
import { HttpClient } from '@/utils/httpClient';

const { image } = ApiPath;

/**
 * The base Image class
 * @remarks
 * Use this to initialize an Image stored in VideoDB
 */
export class Image implements IImage {
  public meta: ImageBase;
  #vhttp: HttpClient;

  /**
   * Initializes a VideoDB Instance
   * @param http - HttpClient object
   * @param data - Data needed to initialize an Image instance
   */
  constructor(http: HttpClient, data: ImageBase) {
    this.meta = data;
    this.#vhttp = http;
  }

  /**
   * Returns an empty promise that resolves when the image is deleted
   * @returns A promise that resolves when delete is successful
   * @throws an InvalidRequestError if the request fails
   */
  public delete = async () => {
    return await this.#vhttp.delete<Record<string, never>>([
      image,
      this.meta.id,
    ]);
  };
}
