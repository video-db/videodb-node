import { ApiPath } from '@/constants';
import type { IImage } from '@/interfaces/core';
import { HttpClient } from '@/utils/httpClient';

export interface ImageBase {
  id: string;
  collectionId?: string;
  name?: string;
  url?: string;
}

export interface FrameBase extends ImageBase {
  videoId: string;
  sceneId: string;
  frameTime: number;
  description: string;
}

export class Image implements IImage {
  public id: string;
  public collectionId?: string;
  public name?: string;
  public url?: string;
  #http: HttpClient;

  constructor(http: HttpClient, data: ImageBase) {
    this.id = data.id;
    this.collectionId = data.collectionId;
    this.name = data.name;
    this.url = data.url;
    this.#http = http;
  }

  public async delete(): Promise<void> {
    await this.#http.delete<Record<string, never>>([ApiPath.image, this.id]);
  }

  public toString(): string {
    return `Image(id=${this.id}, collectionId=${this.collectionId}, name=${this.name}, url=${this.url})`;
  }
}

export class Frame extends Image {
  public videoId: string;
  public sceneId: string;
  public frameTime: number;
  public description: string;

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
  }

  public getRequestData(): FrameBase {
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
    const response = await this.#http.post<{ description: string }, object>(
      [ApiPath.video, this.videoId, ApiPath.frame, this.id, ApiPath.describe],
      {
        data: {
          prompt,
          model_name: modelName,
        },
      }
    );

    this.description = response.data.description;
    return this.description;
  }

  public toString(): string {
    return `Frame(id=${this.id}, videoId=${this.videoId}, sceneId=${this.sceneId}, url=${this.url}, frameTime=${this.frameTime}, description=${this.description})`;
  }
}

// Type guard to check if an image is a Frame
export function isFrame(image: Image | Frame): image is Frame {
  return 'videoId' in image && 'frameTime' in image;
}
