import { ApiPath } from '@/constants';
import type {
  FrameBase,
  ImageBase,
  IImage,
  GenerateUrlResponse,
} from '@/interfaces/core';
import { HttpClient } from '@/utils/httpClient';

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
      ApiPath.image,
      this.meta.id,
    ]);
  };

  public generateUrl = async () => {
    const urlData = await this.#vhttp.post<GenerateUrlResponse, object>(
      [ApiPath.image, this.meta.id, ApiPath.generate_url],
      {},
      {
        params: { collection_id: this.meta.collectionId },
      }
    );

    const signedUrl = urlData.data.signed_url;
    return signedUrl;
  };
}

export class Frame extends Image {
  public videoId: string;
  public sceneId: string;
  public frameTime: number;
  public description: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: FrameBase) {
    super(http, {
      id: data.id,
      collectionId: undefined,
      url: data.url,
    });

    this.videoId = data.videoId;
    this.sceneId = data.sceneId;
    this.frameTime = data.frameTime;
    this.description = data.description;
    this.#vhttp = http;
  }

  public getRequestData(): object {
    return {
      id: this.meta.id,
      videoId: this.videoId,
      sceneId: this.sceneId,
      url: this.meta.url || '',
      frameTime: this.frameTime,
      description: this.description,
    };
  }

  public async describe(prompt?: string, modelName?: string): Promise<string> {
    const response = await this.#vhttp.post<{ description: string }, object>(
      [
        ApiPath.video,
        this.videoId,
        ApiPath.frame,
        this.meta.id,
        ApiPath.describe,
      ],
      {
        prompt,
        model_name: modelName,
      }
    );
    this.description = response.data.description;
    return this.description;
  }
}
