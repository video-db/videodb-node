import { Shot } from '@/core/shot';
import type { GenerateStreamResponse, SearchResponse } from '@/types/response';
import type { SnakeKeysToCamelCase } from '@/utils';
import { playStream } from '@/utils';
import { VideodbError } from '@/utils/error';
import { HttpClient } from '@/utils/httpClient';

/** Camelcase version of SearchResponse for internal use */
type SearchResponseCamel = SnakeKeysToCamelCase<SearchResponse>;

export class SearchResult {
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
    for (const result of this.#searchResponse.results) {
      if (result.collectionId) this.collectionId = result.collectionId;
      for (const doc of result.docs) {
        this.shots.push(
          new Shot(this.#vhttp, {
            end: doc.end,
            start: doc.start,
            text: doc.text,
            searchScore: doc.score,
            videoId: result.videoId,
            videoTitle: result.title,
            videoLength: parseFloat(result.length),
          })
        );
      }
    }
  };

  compile = async () => {
    if (this.streamUrl) return this.streamUrl;
    else if (this.shots.length) {
      const reqData = this.shots.map(shot => {
        return {
          videoId: shot.meta.videoId,
          collectionId: this.collectionId,
          shots: [[shot.meta.start, shot.meta.end]],
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
}
