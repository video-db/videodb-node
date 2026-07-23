import { Shot } from '@/core/shot';
import type { GenerateStreamResponse, SearchResponse } from '@/types/response';
import type { SnakeKeysToCamelCase } from '@/utils';
import { buildIframeEmbedCode, playStream } from '@/utils';
import { VideodbError } from '@/utils/error';
import { HttpClient } from '@/utils/httpClient';

/** Camelcase version of SearchResponse for internal use */
type SearchResponseCamel = SnakeKeysToCamelCase<SearchResponse>;

export class SearchResult implements Iterable<Shot> {
  #vhttp: HttpClient;
  #searchResponse: SearchResponseCamel;
  public shots: Shot[];
  public streamUrl?: string;
  public playerUrl?: string;
  public collectionId: string = 'default';

  constructor(http: HttpClient, searchResponse: SearchResponseCamel) {
    this.#vhttp = http;
    this.#searchResponse = searchResponse;
    this.shots = [];
    this.#formatResults();
  }

  #formatResults = () => {
    for (const result of this.#searchResponse.results ?? []) {
      if (result.collectionId) this.collectionId = result.collectionId;
      for (const doc of result.docs ?? []) {
        this.shots.push(
          new Shot(this.#vhttp, {
            end: doc.end,
            start: doc.start,
            text: doc.text,
            searchScore: doc.score,
            videoId: result.videoId,
            videoTitle: result.title,
            videoLength: parseFloat(result.length),
            sceneIndexId: doc.sceneIndexId,
            sceneIndexName: doc.sceneIndexName,
            metadata: doc.metadata,
            streamUrl: doc.streamLink ?? doc.streamUrl,
            playerUrl: doc.playerUrl,
          })
        );
      }
    }
  };

  [Symbol.iterator](): Iterator<Shot> {
    return this.shots[Symbol.iterator]();
  }

  public get length(): number {
    return this.shots.length;
  }

  public getShots = (): Shot[] => this.shots;

  compile = async () => {
    if (this.streamUrl) return this.streamUrl;
    else if (this.shots.length) {
      const reqData = this.shots.map(shot => {
        return {
          video_id: shot.videoId,
          collection_id: this.collectionId,
          shots: [[shot.start, shot.end]],
        };
      });
      const res = await this.#vhttp.post<
        GenerateStreamResponse,
        typeof reqData
      >(['compile'], reqData);
      this.streamUrl = res.data.streamUrl;
      this.playerUrl = res.data.playerUrl;
      return this.streamUrl;
    } else {
      throw new VideodbError('No shots found in the search result to compile');
    }
  };

  play = async () => {
    if (!this.streamUrl) {
      this.streamUrl = await this.compile();
    }
    return playStream(this.streamUrl);
  };

  /**
   * Generate an HTML iframe embed code for the search result.
   *
   * @param width - Width of the iframe (default `"100%"`)
   * @param height - Height of the iframe in pixels (default `405`)
   * @param title - Title attribute (default `"VideoDB Player"`)
   * @param allowFullscreen - Whether to allow fullscreen (default `true`)
   * @param autoGenerate - If true and playerUrl is missing, auto-compile it (default `true`)
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
      await this.compile();
    }
    if (!this.playerUrl) {
      throw new VideodbError(
        'player_url not available. Call compile() first or set autoGenerate=true.'
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
