import { ApiPath } from '@/constants';
import type { FrameBase, ImageBase, IImage } from '@/interfaces/core';
import { HttpClient } from '@/utils/httpClient';

const { image, generate_url } = ApiPath;

/**
 * The base Image class
 * @remarks
 * Use this to initialize an Image stored in VideoDB
 */
export class Image implements IImage {
  public readonly id: string;
  public readonly collectionId?: string;
  public readonly name?: string;
  public readonly url?: string;
  #vhttp: HttpClient;

  /**
   * Initializes a VideoDB Instance
   * @param http - HttpClient object
   * @param data - Data needed to initialize an Image instance
   */
  constructor(http: HttpClient, data: ImageBase) {
    this.id = data.id;
    this.collectionId = data.collectionId;
    this.name = data.name;
    this.url = data.url;
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
      this.id,
    ]);
  };

  /**
   * Generate the signed url of the image
   * @returns The signed url of the image
   */
  public generateUrl = async (): Promise<string | null> => {
    const res = await this.#vhttp.post<{ signedUrl: string }, object>(
      [image, this.id, generate_url],
      {},
      { params: { collection_id: this.collectionId } }
    );
    return res.data?.signedUrl || null;
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
      id: this.id,
      videoId: this.videoId,
      sceneId: this.sceneId,
      url: this.url || '',
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
        this.id,
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
