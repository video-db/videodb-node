import { HttpClient } from '@/utils/httpClient';
import { ApiPath } from '@/constants';
import { VideodbError } from '@/utils/error';
import type { Frame } from './image';

export interface SceneConfig {
  // Add any configuration options that were in the Python dict
  modelName?: string;
  prompt?: string;
  // Add other config options as needed
}

export interface SceneData {
  id?: string;
  videoId: string;
  start: number;
  end: number;
  description: string;
  frames?: Frame[];
}

export class Scene {
  public id?: string;
  public videoId: string;
  public start: number;
  public end: number;
  public frames: Frame[];
  public description: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: SceneData) {
    this.id = data.id;
    this.videoId = data.videoId;
    this.start = data.start;
    this.end = data.end;
    this.frames = data.frames || [];
    this.description = data.description;
    this.#vhttp = http;
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

  public async describe(prompt?: string, modelName?: string): Promise<string> {
    if (!this.id) {
      throw new VideodbError('Scene ID is required for description');
    }

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
}

export class SceneCollection {
  public id: string;
  public videoId: string;
  public config: SceneConfig;
  public scenes: Scene[];
  #vhttp: HttpClient;

  constructor(
    http: HttpClient,
    id: string,
    videoId: string,
    config: SceneConfig,
    scenes: Scene[]
  ) {
    this.#vhttp = http;
    this.id = id;
    this.videoId = videoId;
    this.config = config;
    this.scenes = scenes;
  }

  public async delete(): Promise<void> {
    await this.#vhttp.delete<Record<string, never>>([
      ApiPath.video,
      this.videoId,
      ApiPath.scenes,
      this.id,
    ]);
  }
}
