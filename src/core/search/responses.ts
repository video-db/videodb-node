import type { Shot } from '@/core/shot';
import type { SearchResponse as RawSearchResponse } from '@/types/response';
import type { SnakeKeysToCamelCase } from '@/utils';
import { HttpClient } from '@/utils/httpClient';
import { SearchResult } from './searchResult';

type SearchResponseCamel = SnakeKeysToCamelCase<RawSearchResponse>;

const _LEGACY_SEARCH_WARNING =
  'Legacy search parameters detected. This call is routed to legacy search. ' +
  'Use legacySearch(...) to keep legacy behavior, or update to the new search interface.';
let _legacySearchWarningEmitted = false;

/** Emit the legacy-search deprecation warning at most once per process. */
export const warnLegacySearchOnce = (): void => {
  if (_legacySearchWarningEmitted) return;
  _legacySearchWarningEmitted = true;
  // eslint-disable-next-line no-console
  console.warn(_LEGACY_SEARCH_WARNING);
};

/** Data accepted by the {@link AskResponse} constructor (camelCased). */
export interface AskResponseData {
  answer?: string;
  sources?: unknown;
  [key: string]: unknown;
}

/**
 * Response returned by `ask()`.
 * Mirrors `videodb.search.AskResponse`.
 */
export class AskResponse {
  public answer: string;
  public sources: Shot[];

  constructor(http: HttpClient, data: AskResponseData = {}) {
    this.answer = data.answer || '';
    this.sources = new SearchResult(http, {
      results: (data.sources || []) as SearchResponseCamel['results'],
    }).shots;
  }

  public toString(): string {
    return `AskResponse(answer=${JSON.stringify(this.answer)}, sources=[${this.sources.length}])`;
  }
}

const SHOTS_TYPES = new Set(['shots', 'deepsearch']);

/** Data accepted by the {@link SearchResponse} constructor (camelCased). */
export interface SearchResponseData {
  responseType?: string;
  sessionId?: string;
  waitingFor?: string;
  clarification?: unknown;
  trace?: unknown;
  results?: unknown;
  [key: string]: unknown;
}

/**
 * Envelope returned by high-level Search v2.
 * Mirrors `videodb.search.SearchResponse`.
 *
 * For `responseType` of `shots`/`deepsearch`, `results` is a {@link SearchResult}.
 * For `aggregate`, `results` is the aggregate dict/list returned by the server.
 */
export class SearchResponse implements Iterable<unknown> {
  public responseType?: string;
  public sessionId?: string;
  public waitingFor: string;
  public clarification?: unknown;
  public trace?: unknown;
  public results: unknown;
  public shots: Shot[];

  constructor(http: HttpClient, data: SearchResponseData = {}) {
    this.responseType = data.responseType;
    this.sessionId = data.sessionId;
    this.waitingFor = (data.waitingFor as string) || 'none';
    this.clarification = data.clarification;
    this.trace = data.trace;
    const rawResults = data.results ?? [];
    if (this.responseType && SHOTS_TYPES.has(this.responseType)) {
      const result = new SearchResult(http, {
        results: rawResults as SearchResponseCamel['results'],
      });
      this.results = result;
      this.shots = result.shots;
    } else {
      this.results = rawResults;
      this.shots = [];
    }
  }

  #isShots(): boolean {
    return (
      this.responseType !== undefined && SHOTS_TYPES.has(this.responseType)
    );
  }

  [Symbol.iterator](): Iterator<unknown> {
    if (this.#isShots()) {
      return (this.results as SearchResult)[Symbol.iterator]();
    }
    if (Array.isArray(this.results)) {
      return this.results[Symbol.iterator]();
    }
    return [this.results][Symbol.iterator]();
  }

  public get length(): number {
    if (this.#isShots()) return (this.results as SearchResult).length;
    if (Array.isArray(this.results)) return this.results.length;
    return this.results !== null && this.results !== undefined ? 1 : 0;
  }

  public getShots = (): Shot[] => this.shots;

  public toString(): string {
    if (this.responseType === 'deepsearch') {
      return `SearchResponse(responseType=${this.responseType}, sessionId=${JSON.stringify(this.sessionId)}, waitingFor=${JSON.stringify(this.waitingFor)}, clarification=${JSON.stringify(this.clarification)}, results=${String(this.results)})`;
    }
    return `SearchResponse(responseType=${this.responseType}, results=${String(this.results)})`;
  }
}
