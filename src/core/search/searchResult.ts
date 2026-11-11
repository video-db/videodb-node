import { Shot } from '@/core/shot';
import type { GenerateStreamResponse, SearchResponse } from '@/types/response';
import type { SnakeKeysToCamelCase } from '@/utils';
import { buildIframeEmbedCode, playStream } from '@/utils';
import { VideodbError } from '@/utils/error';
import { HttpClient } from '@/utils/httpClient';

/** Camelcase version of SearchResponse for internal use */
type SearchResponseCamel = SnakeKeysToCamelCase<SearchResponse>;

/** Search V2 sends `length: null`; never turn a missing value into NaN. */
const toFiniteNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

/** A note the server attaches to a search or ask response. */
export interface ServerWarning {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

const _emittedWarnings = new Set<string>();

/**
 * Returns the server `warnings` list and prints each one once per process,
 * keyed by code, matching videodb-python's `warn_response_warnings_once`.
 */
export const takeServerWarnings = (raw: unknown): ServerWarning[] => {
  const list = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(
    (w): w is ServerWarning => typeof w === 'object' && w !== null
  );
  for (const warning of list) {
    const key = String(warning.code || warning.message || 'response_warning');
    if (_emittedWarnings.has(key)) continue;
    _emittedWarnings.add(key);
    // eslint-disable-next-line no-console
    console.warn(`VideoDB warning: ${warning.message ?? key}`);
  }
  return list;
};

export class SearchResult implements Iterable<Shot> {
  #vhttp: HttpClient;
  #searchResponse: SearchResponseCamel;
  public shots: Shot[];
  public streamUrl?: string;
  public playerUrl?: string;
  public collectionId: string = 'default';
  /** Server notes about how the search ran, e.g. a fallback to legacy indexes. */
  public warnings: ServerWarning[];

  constructor(http: HttpClient, searchResponse: SearchResponseCamel) {
    this.#vhttp = http;
    this.#searchResponse = searchResponse;
    this.shots = [];
    this.warnings = takeServerWarnings(
      (searchResponse as { warnings?: unknown }).warnings
    );
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
            // Search V2 hits carry their text in metadata.embeddedText.
            text:
              doc.text ??
              (doc.metadata as { embeddedText?: string } | undefined)
                ?.embeddedText,
            searchScore: doc.score,
            videoId: result.videoId,
            videoTitle: result.title ?? undefined,
            videoLength: toFiniteNumber(result.length),
            sceneIndexId: doc.sceneIndexId,
            sceneIndexName: doc.sceneIndexName,
            metadata: doc.metadata,
            // `||`, not `??` — mirrors videodb-python's
            // `doc.get("stream_link") or doc.get("stream_url")`, and normalises
            // the absent-key `undefined` to `null` so serialised shots match.
            streamUrl: doc.streamLink || doc.streamUrl || null,
            playerUrl: doc.playerUrl ?? null,
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
