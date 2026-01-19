import { ApiPath } from '@/constants';
import type { IShot, ShotBase } from '@/interfaces/core';
import type { GenerateStreamResponse } from '@/types/response';
import type { Timeline } from '@/types/video';
import { playStream } from '@/utils';
import { HttpClient } from '@/utils/httpClient';

const { video, stream } = ApiPath;

/**
 * A shot is a clip of a specific video
 */
export class Shot implements IShot {
  meta: ShotBase;
  #vhttp: HttpClient;
  constructor(http: HttpClient, meta: ShotBase) {
    this.meta = meta;
    this.#vhttp = http;
  }

  /**
   * Get the streaming URL for the shot
   * @returns A streaming URL for the shot
   */
  generateStream = async () => {
    const body = {
      length: this.meta.videoLength,
      timeline: [[this.meta.start, this.meta.end]] as Timeline,
    };

    const res = await this.#vhttp.post<GenerateStreamResponse, typeof body>(
      [video, this.meta.videoId, stream],
      body
    );

    return res.data.streamUrl;
  };

  /**
   * Generate stream and open in browser
   * @returns The player URL
   */
  play = async () => {
    const streamUrl = await this.generateStream();
    return playStream(streamUrl);
  };
}
