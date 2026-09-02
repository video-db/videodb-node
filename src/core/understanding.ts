import { ApiPath } from '@/constants';
import { RequestTimeoutError } from '@/utils/error';
import { HttpClient } from '@/utils/httpClient';
import { sleep } from '@/utils';

const { video, understand } = ApiPath;

export const UNDERSTANDING_TERMINAL_STATUSES = new Set(['done', 'failed']);
export const ANALYZER_TERMINAL_STATUSES = new Set([
  'done',
  'failed',
  'skipped',
  'cancelled',
]);

export const ANALYZER_TYPE_ALIASES: Record<string, string> = {
  spoken_words: 'speech_transcription',
};

export const DEFAULT_ANALYZER_NAMES: Record<string, string> = {
  speech_transcription: 'transcript',
  object_detection: 'objects',
  vlm: 'scene',
  ocr: 'text',
  brand_detection: 'brands',
  activity_recognition: 'activity',
  location_detection: 'location',
};

/** A user-provided analyzer spec passed to `Video.understand`. */
export interface AnalyzerSpec {
  type?: string;
  name?: string;
  [key: string]: unknown;
}

/** Camelcased wire shape of an analyzer inside an understanding run. */
export interface AnalyzerData {
  id?: string;
  name?: string;
  type?: string;
  status?: string;
  [key: string]: unknown;
}

/** Map a friendly analyzer type to the server contract name. */
export const normalizeAnalyzerType = (analyzerType: string): string =>
  ANALYZER_TYPE_ALIASES[analyzerType] ?? analyzerType;

/** Stable default output name for a built-in analyzer, or undefined. */
export const defaultAnalyzerName = (analyzerType: string): string | undefined =>
  DEFAULT_ANALYZER_NAMES[normalizeAnalyzerType(analyzerType)];

/**
 * Normalize analyzer payloads to the server contract.
 * Mirrors `videodb.understanding.normalize_understanding_analyzers`.
 *
 * @throws {Error} On empty list, missing type, or duplicate/ambiguous names.
 */
export const normalizeUnderstandingAnalyzers = (
  analyzers: AnalyzerSpec[]
): AnalyzerSpec[] => {
  if (!Array.isArray(analyzers) || analyzers.length === 0) {
    throw new Error('analyzers must be a non-empty list');
  }

  const normalized: AnalyzerSpec[] = [];
  const names = new Set<string>();
  const generatedNames = new Set<string>();

  analyzers.forEach((analyzer, index) => {
    if (
      typeof analyzer !== 'object' ||
      analyzer === null ||
      Array.isArray(analyzer)
    ) {
      throw new Error(`analyzers[${index}] must be a dict`);
    }
    if (!analyzer.type) {
      throw new Error(`analyzers[${index}].type is required`);
    }

    const item: AnalyzerSpec = { ...analyzer };
    const originalType = item.type as string;
    item.type = normalizeAnalyzerType(originalType);

    if (!item.name) {
      const generatedName = defaultAnalyzerName(originalType);
      if (generatedName) {
        if (generatedNames.has(generatedName)) {
          throw new Error(
            `Multiple analyzers would use default name '${generatedName}'. Provide explicit analyzer names.`
          );
        }
        item.name = generatedName;
        generatedNames.add(generatedName);
      }
    }

    if (item.name) {
      if (names.has(item.name)) {
        throw new Error(`Duplicate analyzer name: ${item.name}`);
      }
      names.add(item.name);
    }

    normalized.push(item);
  });

  return normalized;
};

/**
 * Analyzer status and output handle for one analyzer in an understanding run.
 * Mirrors `videodb.understanding.UnderstandingAnalyzer`.
 */
export class UnderstandingAnalyzer {
  public understanding: Understanding;
  public id?: string;
  public name?: string;
  public type?: string;
  public status?: string;
  public extra: Record<string, unknown>;

  constructor(understanding: Understanding, data: AnalyzerData = {}) {
    const { id, name, type, status, ...extra } = data;
    this.understanding = understanding;
    this.id = id;
    this.name = name;
    this.type = type;
    this.status = status;
    this.extra = extra;
  }

  /** True when the analyzer is in a terminal status. */
  public get isComplete(): boolean {
    return (
      this.status !== undefined && ANALYZER_TERMINAL_STATUSES.has(this.status)
    );
  }

  /** True when the analyzer completed successfully. */
  public get isSuccessful(): boolean {
    return this.status === 'done';
  }

  /** Refresh this analyzer's status from the API. */
  public refresh = async (): Promise<UnderstandingAnalyzer> => {
    const analyzer = await this.understanding.getAnalyzer(
      this.name || this.id || '',
      true
    );
    this.id = analyzer.id;
    this.name = analyzer.name;
    this.type = analyzer.type;
    this.status = analyzer.status;
    this.extra = analyzer.extra;
    return this;
  };

  /**
   * Poll this analyzer until it reaches a terminal status.
   *
   * @param timeout - Maximum time to wait, in seconds (default 1800)
   * @param pollInterval - Seconds between status checks (default 10)
   * @throws {RequestTimeoutError} If the analyzer does not complete before timeout
   */
  public waitUntilComplete = async (
    timeout: number = 1800,
    pollInterval: number = 10
  ): Promise<UnderstandingAnalyzer> => {
    const deadline = Date.now() + timeout * 1000;
    for (;;) {
      await this.refresh();
      if (this.isComplete) return this;
      if (Date.now() >= deadline) {
        throw new RequestTimeoutError(
          `Analyzer ${this.name || this.id} did not complete within ${timeout}s`
        );
      }
      await sleep(pollInterval * 1000);
    }
  };

  /** Return this analyzer's output (segments output). */
  public getOutput = async (): Promise<unknown> => {
    const identifier = this.name || this.id;
    if (!identifier) {
      throw new Error('Analyzer id or name is required');
    }
    return this.understanding.getAnalyzerOutput(identifier);
  };

  /**
   * Serialize this analyzer as an index `source` reference (ids + type).
   * The server re-fetches the analyzer output from its own store.
   *
   * @throws {Error} If the analyzer has no id or its understanding id is unknown.
   */
  public toIndexSource = (): {
    understanding_id: string;
    analyzer_id: string;
    analyzer_type?: string;
  } => {
    const understandingId = this.understanding.id;
    if (!understandingId || !this.id) {
      throw new Error(
        'analyzer source requires understanding id and analyzer id'
      );
    }
    return {
      understanding_id: understandingId,
      analyzer_id: this.id,
      analyzer_type: this.type,
    };
  };

  public toString(): string {
    return `UnderstandingAnalyzer(id=${this.id}, name=${this.name}, type=${this.type}, status=${this.status})`;
  }
}

/** Camelcased wire shape of an understanding run. */
export interface UnderstandingData {
  understandingId?: string;
  id?: string;
  videoId?: string;
  collectionId?: string;
  status?: string;
  outputUrl?: string;
  analyzers?: AnalyzerData[];
  [key: string]: unknown;
}

/**
 * A video understanding run.
 * Mirrors `videodb.understanding.Understanding`.
 */
export class Understanding {
  public videoId: string;
  public collectionId?: string;
  public id?: string;
  public status?: string;
  public outputUrl?: string;
  public extra: Record<string, unknown>;
  public analyzers: UnderstandingAnalyzer[];
  #vhttp: HttpClient;

  constructor(http: HttpClient, videoId: string, data: UnderstandingData = {}) {
    const {
      understandingId,
      id,
      videoId: _videoId,
      collectionId,
      status,
      outputUrl,
      analyzers,
      ...extra
    } = data;
    this.#vhttp = http;
    this.videoId = _videoId ?? videoId;
    this.collectionId = collectionId;
    this.id = understandingId ?? id;
    this.status = status;
    this.outputUrl = outputUrl;
    this.extra = extra;
    this.analyzers = (analyzers ?? []).map(item => this.createAnalyzer(item));
  }

  /** True when the understanding run is in a terminal status. */
  public get isComplete(): boolean {
    return (
      this.status !== undefined &&
      UNDERSTANDING_TERMINAL_STATUSES.has(this.status)
    );
  }

  /** True when the understanding run completed successfully. */
  public get isSuccessful(): boolean {
    return this.status === 'done';
  }

  public createAnalyzer(data: AnalyzerData = {}): UnderstandingAnalyzer {
    return new UnderstandingAnalyzer(this, data || {});
  }

  public updateFromResponse(data: UnderstandingData = {}): Understanding {
    this.status = data.status ?? this.status;
    if (data.understandingId || data.id) {
      this.id = data.understandingId ?? data.id;
    }
    if (data.videoId) this.videoId = data.videoId;
    if (data.collectionId) this.collectionId = data.collectionId;
    if (data.outputUrl) this.outputUrl = data.outputUrl;
    if ('analyzers' in data) {
      this.analyzers = (data.analyzers ?? []).map(item =>
        this.createAnalyzer(item)
      );
    }
    return this;
  }

  /** Refresh understanding and analyzer statuses from the API. */
  public refresh = async (): Promise<Understanding> => {
    const res = await this.#vhttp.get<UnderstandingData>([
      video,
      this.videoId,
      understand,
      this.id ?? '',
    ]);
    return this.updateFromResponse(res.data);
  };

  /**
   * Poll this understanding until it reaches a terminal status (`done`/`failed`).
   *
   * @param timeout - Maximum time to wait, in seconds (default 1800)
   * @param pollInterval - Seconds between status checks (default 10)
   * @throws {RequestTimeoutError} If the run does not complete before timeout
   */
  public waitUntilComplete = async (
    timeout: number = 1800,
    pollInterval: number = 10
  ): Promise<Understanding> => {
    const deadline = Date.now() + timeout * 1000;
    for (;;) {
      await this.refresh();
      if (this.isComplete) return this;
      if (Date.now() >= deadline) {
        throw new RequestTimeoutError(
          `Understanding ${this.id} did not complete within ${timeout}s`
        );
      }
      await sleep(pollInterval * 1000);
    }
  };

  /** Return analyzers in this understanding run. */
  public listAnalyzers = (): UnderstandingAnalyzer[] => [...this.analyzers];

  /**
   * Return an analyzer by user-facing name or internal analyzer id.
   *
   * @param nameOrId - Analyzer name (e.g. `"transcript"`) or id (e.g. `"an_..."`)
   * @param refresh - When true, fetch the latest analyzer status first
   * @throws {Error} If no analyzer matches
   */
  public getAnalyzer = async (
    nameOrId: string,
    refresh: boolean = false
  ): Promise<UnderstandingAnalyzer> => {
    if (refresh) {
      const res = await this.#vhttp.get<UnderstandingData>(
        [video, this.videoId, understand, this.id ?? ''],
        { params: { analyzer: nameOrId } }
      );
      const data = res.data ?? {};
      this.status = data.status ?? this.status;
      const analyzerData = (data.analyzers ?? [])[0];
      if (analyzerData) {
        const refreshed = this.createAnalyzer(analyzerData);
        for (let i = 0; i < this.analyzers.length; i++) {
          if (
            this.analyzers[i].name === refreshed.name ||
            this.analyzers[i].id === refreshed.id
          ) {
            this.analyzers[i] = refreshed;
            return refreshed;
          }
        }
        this.analyzers.push(refreshed);
        return refreshed;
      }
    }

    for (const analyzer of this.analyzers) {
      if (analyzer.name === nameOrId || analyzer.id === nameOrId) {
        return analyzer;
      }
    }
    throw new Error(`Analyzer not found: ${nameOrId}`);
  };

  /**
   * Return output for an analyzer by name or id.
   *
   * Returned with the server's raw snake_case keys (e.g. `scene_id`) — this
   * output is meant to be round-tripped back into `Video.index` as a `source`,
   * and the server keys off `scene_id`. Camelcasing it (the default response
   * conversion) would rename `scene_id` to `sceneId`, which the index endpoint
   * no longer recognizes, so the round-trip must skip conversion.
   */
  public getAnalyzerOutput = async (nameOrId: string): Promise<unknown> => {
    const res = await this.#vhttp.get<unknown>(
      [
        video,
        this.videoId,
        understand,
        this.id ?? '',
        'analyzers',
        nameOrId,
        'output',
      ],
      undefined,
      { convert: false }
    );
    return res.data;
  };

  /** Delete this understanding run. */
  public delete = async (): Promise<void> => {
    await this.#vhttp.delete([video, this.videoId, understand, this.id ?? '']);
  };

  public toString(): string {
    return `Understanding(id=${this.id}, videoId=${this.videoId}, status=${this.status}, analyzers=${this.analyzers.length})`;
  }
}
