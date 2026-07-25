import { ApiPath } from '@/constants';
import type { IShot, ShotBase } from '@/interfaces/core';
import type { GenerateStreamResponse } from '@/types/response';
import type { Timeline } from '@/types/video';
import { buildIframeEmbedCode, playStream } from '@/utils';
import { VideodbError } from '@/utils/error';
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
  public readonly sceneIndexId?: string;
  public readonly sceneIndexName?: string;
  public readonly metadata?: Record<string, unknown>;
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
    this.sceneIndexId = data.sceneIndexId;
    this.sceneIndexName = data.sceneIndexName;
    this.metadata = data.metadata;
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

  /**
   * Generate an HTML iframe embed code for the shot.
   * @param width - Width of the iframe (default `"100%"`)
   * @param height - Height of the iframe in pixels (default `405`)
   * @param title - Title attribute (default `"VideoDB Player"`)
   * @param allowFullscreen - Whether to allow fullscreen (default `true`)
   * @param autoGenerate - If true and playerUrl is missing, auto-generate it (default `true`)
   * @throws {VideodbError} If the player URL is not available.
   */
  getEmbedCode = async (
    width: string = '100%',
    height: number = 405,
    title: string = 'VideoDB Player',
    allowFullscreen: boolean = true,
    autoGenerate: boolean = true
  ): Promise<string> => {
    if (!this.playerUrl && autoGenerate) {
      await this.generateStream();
    }
    if (!this.playerUrl) {
      throw new VideodbError(
        'player_url not available. Call generateStream() first or set autoGenerate=true.'
      );
    }
    return buildIframeEmbedCode(
      this.playerUrl,
      width,
      height,
      title,
      allowFullscreen
    );
  };
}
