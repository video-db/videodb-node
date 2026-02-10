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
  metadata?: Record<string, unknown>;
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
  public metadata: Record<string, unknown>;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: SceneBase) {
    this.id = data.id;
    this.videoId = data.videoId;
    this.start = data.start;
    this.end = data.end;
    this.frames = data.frames || [];
    this.description = data?.description;
    this.metadata = data?.metadata || {};
    this.#vhttp = http;
  }

  public async describe(prompt?: string, modelName?: string): Promise<string> {
    const response = await this.#vhttp.post<{ description: string }, object>(
      [ApiPath.video, this.videoId, ApiPath.scene, this.id, ApiPath.describe],
      {
        prompt,
        model_name: modelName,
      }
    );
    this.description = response.data.description;
    return this.description;
  }

  public getRequestData(): object {
    return {
      id: this.id,
      video_id: this.videoId,
      start: this.start,
      end: this.end,
      frames: this.frames.map(frame => frame.getRequestData()),
      description: this.description,
      metadata: this.metadata,
    };
  }

  /**
   * Convert scene to JSON format for API requests
   * Alias for getRequestData for Python SDK compatibility
   */
  public toJson(): object {
    return this.getRequestData();
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
