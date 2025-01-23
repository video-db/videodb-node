import { HttpClient } from '@/utils/httpClient';
import { ApiPath } from '@/constants';
import type { Frame } from './image';

export interface SceneBase {
  id: string;
  videoId: string;
  start: number;
  end: number;
  description?: string;
  frames: Frame[];
}

export interface SceneCollectionBase {
  id: string;
  videoId: string;
  config: object;
  scenes: Scene[];
}

export class Scene {
  public id: string;
  public videoId: string;
  public start: number;
  public end: number;
  public frames: Frame[];
  public description: string | undefined;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: SceneBase) {
    this.id = data.id;
    this.videoId = data.videoId;
    this.start = data.start;
    this.end = data.end;
    this.frames = data.frames || [];
    this.description = data?.description;
    this.#vhttp = http;
  }

  public async describe(prompt?: string, modelName?: string): Promise<string> {
    const response = await this.#vhttp.post<{ description: string }, object>(
      [ApiPath.video, this.videoId, ApiPath.scene, this.id, ApiPath.describe],
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

  public getRequestData(): object {
    return {
      id: this.id,
      videoId: this.videoId,
      start: this.start,
      end: this.end,
      frames: this.frames.map(frame => frame.getRequestData()),
      description: this.description,
    };
  }
}

export class SceneCollection {
  public id: string;
  public videoId: string;
  public config: object;
  public scenes: Scene[];
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: SceneCollectionBase) {
    this.#vhttp = http;
    this.id = data.id;
    this.videoId = data.videoId;
    this.config = data.config;
    this.scenes = data.scenes;
  }

  public delete = async () => {
    return await this.#vhttp.delete<Record<string, never>>([
      ApiPath.video,
      this.videoId,
      ApiPath.scenes,
      this.id,
    ]);
  };
}
