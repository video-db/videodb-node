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
  public readonly videoId: string;
  public readonly videoLength: number;
  public readonly videoTitle: string;
  public readonly start: number;
  public readonly end: number;
  public readonly text?: string;
  public readonly searchScore?: number;
  public streamUrl?: string;
  public playerUrl?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: ShotBase) {
    this.videoId = data.videoId;
    this.videoLength = data.videoLength;
    this.videoTitle = data.videoTitle;
    this.start = data.start;
    this.end = data.end;
    this.text = data.text;
    this.searchScore = data.searchScore;
    this.streamUrl = data.streamUrl;
    this.playerUrl = data.playerUrl;
    this.#vhttp = http;
  }

  /**
   * Get the streaming URL for the shot
   * @returns A streaming URL for the shot
   */
  generateStream = async () => {
    if (this.streamUrl) {
      return this.streamUrl;
    }

    const body = {
      length: this.videoLength,
      timeline: [[this.start, this.end]] as Timeline,
    };

    const res = await this.#vhttp.post<GenerateStreamResponse, typeof body>(
      [video, this.videoId, stream],
      body
    );

    this.streamUrl = res.data.streamUrl;
    this.playerUrl = res.data.playerUrl;

    return this.streamUrl;
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
