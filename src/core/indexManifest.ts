import { ApiPath } from '@/constants';
import { RequestTimeoutError } from '@/utils/error';
import { HttpClient } from '@/utils/httpClient';
import { sleep } from '@/utils';

const { video, indexes, records } = ApiPath;

export const INDEX_TERMINAL_STATUSES = new Set(['ready', 'failed']);

/** Schema details for a single indexed field. */
export interface FieldSchemaData {
  type?: string;
  groups?: string[];
  operators?: string[];
}

/**
 * Schema details for a single indexed field.
 * Mirrors `videodb.index.FieldSchema`.
 */
export class FieldSchema {
  public type?: string;
  public groups: string[];
  public operators: string[];

  constructor(data: FieldSchemaData = {}) {
    this.type = data.type;
    this.groups = data.groups || [];
    this.operators = data.operators || [];
  }

  public toString(): string {
    return `FieldSchema(type=${this.type}, groups=[${this.groups.join(', ')}], operators=[${this.operators.join(', ')}])`;
  }
}

/** Camelcased wire shape of a single index record. */
export interface IndexRecordData {
  videoId?: string;
  understandingId?: string;
  sceneId?: string;
  start?: number;
  end?: number;
  data?: Record<string, unknown>;
  segmentId?: string;
  startSec?: number;
  endSec?: number;
}

/**
 * A single indexed record (one temporal scene of an index).
 * Mirrors `videodb.index.IndexRecord`, preserving the deprecated
 * `segmentId` / `startSec` / `endSec` aliases.
 */
export class IndexRecord {
  public videoId?: string;
  public understandingId?: string;
  public sceneId?: string;
  public start?: number;
  public end?: number;
  public data: Record<string, unknown>;
  public segmentId?: string;
  public startSec?: number;
  public endSec?: number;

  constructor(data: IndexRecordData = {}) {
    this.videoId = data.videoId;
    this.understandingId = data.understandingId;
    this.sceneId = data.sceneId ?? data.segmentId;
    this.start = data.start ?? data.startSec;
    this.end = data.end ?? data.endSec;
    this.data = data.data || {};
    // Deprecated aliases, mirrored bidirectionally for wire compatibility.
    this.segmentId = this.sceneId;
    this.startSec = this.start;
    this.endSec = this.end;
  }

  public toString(): string {
    return `IndexRecord(videoId=${this.videoId}, sceneId=${this.sceneId}, start=${this.start}, end=${this.end})`;
  }
}

/**
 * A page of indexed records returned by {@link Index.records}.
 * Mirrors `videodb.index.RecordPage` (iterable over its records).
 */
export class RecordPage implements Iterable<IndexRecord> {
  public records: IndexRecord[];
  public nextCursor?: string;

  constructor(recordsList: IndexRecord[] = [], nextCursor?: string) {
    this.records = recordsList;
    this.nextCursor = nextCursor;
  }

  [Symbol.iterator](): Iterator<IndexRecord> {
    return this.records[Symbol.iterator]();
  }

  public get length(): number {
    return this.records.length;
  }

  public toString(): string {
    return `RecordPage(records=${this.records.length}, nextCursor=${this.nextCursor})`;
  }
}

/** Camelcased public shape of an index manifest (typing convenience). */
export interface IndexData {
  indexId?: string;
  name?: string;
  status?: string;
  error?: string;
  useFor?: string[];
  source?: unknown;
  recordCount?: number;
  fields?: Record<string, string[]>;
  fieldSchema?: Record<string, FieldSchemaData>;
}

/**
 * Raw wire shape of an index manifest (snake_case). Read verbatim so
 * user-defined `field_schema` keys and `fields` values are preserved.
 */
export interface RawIndexManifest {
  index_id?: string;
  name?: string;
  status?: string;
  error?: string;
  use_for?: string[];
  source?: unknown;
  record_count?: number;
  fields?: Record<string, string[]>;
  field_schema?: Record<
    string,
    { type?: string; groups?: string[]; operators?: string[] }
  >;
  video_id?: string;
  collection_id?: string;
}

/** Raw wire shape of a single record (snake_case; `data` map preserved verbatim). */
export interface RawIndexRecord {
  video_id?: string;
  understanding_id?: string;
  scene_id?: string;
  start?: number;
  end?: number;
  data?: Record<string, unknown>;
  segment_id?: string;
  start_sec?: number;
  end_sec?: number;
}

interface RawRecordsResponse {
  records?: RawIndexRecord[];
  next_cursor?: string;
}

/**
 * Index manifest for a retrieval-ready index built from an understanding artifact.
 * Mirrors `videodb.index.Index`.
 *
 * Users should not construct this directly — use {@link Video.index},
 * {@link Video.getIndex}, or {@link Video.listIndexes}.
 */
export class Index {
  public videoId: string;
  public collectionId?: string;
  public indexId?: string;
  public name?: string;
  public status?: string;
  public error?: string;
  public useFor: string[] = [];
  public source?: unknown;
  public recordCount?: number;
  public fields: Record<string, string[]> = {};
  public fieldSchema: Record<string, FieldSchema> = {};
  #vhttp: HttpClient;

  constructor(
    http: HttpClient,
    videoId: string,
    collectionId?: string,
    data: RawIndexManifest = {}
  ) {
    this.#vhttp = http;
    this.videoId = videoId;
    this.collectionId = collectionId;
    this.updateFromResponse(data);
  }

  /**
   * Hydrate from a RAW (snake_case) manifest. Opaque maps — `field_schema`
   * keys and `fields` values (user-defined field names) — are preserved verbatim.
   */
  public updateFromResponse(data: RawIndexManifest = {}): Index {
    this.indexId = data.index_id ?? this.indexId;
    this.name = data.name;
    this.status = data.status;
    this.error = data.error;
    this.useFor = data.use_for ?? [];
    this.source = data.source;
    this.recordCount = data.record_count;
    this.fields = data.fields ?? {};
    this.fieldSchema = {};
    for (const [field, schema] of Object.entries(data.field_schema ?? {})) {
      this.fieldSchema[field] = new FieldSchema({
        type: schema?.type,
        groups: schema?.groups,
        operators: schema?.operators,
      });
    }
    return this;
  }

  /** True when the index build is in a terminal status (`ready`/`failed`). */
  public get isComplete(): boolean {
    return (
      this.status !== undefined && INDEX_TERMINAL_STATUSES.has(this.status)
    );
  }

  /** True when the index build completed successfully. */
  public get isSuccessful(): boolean {
    return this.status === 'ready';
  }

  #collectionParams = (): { params: { collection_id: string } } | undefined =>
    this.collectionId
      ? { params: { collection_id: this.collectionId } }
      : undefined;

  /** Refresh the index manifest and build status from the API. */
  public refresh = async (): Promise<Index> => {
    const res = await this.#vhttp.get<RawIndexManifest>(
      [video, this.videoId, indexes, this.indexId ?? ''],
      this.#collectionParams(),
      { convert: false }
    );
    // convert:false — res.data is raw snake at runtime; the client's return
    // type wrongly assumes camelCase, so read it as the raw shape.
    return this.updateFromResponse(res.data as unknown as RawIndexManifest);
  };

  /**
   * Poll this index until it reaches a terminal status (`ready`/`failed`).
   *
   * @param timeout - Maximum time to wait, in seconds (default 1800)
   * @param pollInterval - Seconds between status checks (default 10)
   * @throws {RequestTimeoutError} If the build does not complete before timeout
   */
  public waitUntilComplete = async (
    timeout: number = 1800,
    pollInterval: number = 10
  ): Promise<Index> => {
    const deadline = Date.now() + timeout * 1000;
    for (;;) {
      await this.refresh();
      if (this.isComplete) return this;
      if (Date.now() >= deadline) {
        throw new RequestTimeoutError(
          `Index ${this.indexId} did not complete within ${timeout}s`
        );
      }
      await sleep(pollInterval * 1000);
    }
  };

  /**
   * Preview the records stored in the index (paginated via a cursor).
   *
   * @param limit - Maximum number of records to return (default 20)
   * @param cursor - Cursor returned by a previous page
   */
  public records = async (
    limit: number = 20,
    cursor?: string
  ): Promise<RecordPage> => {
    const params: Record<string, unknown> = {
      limit,
      collection_id: this.collectionId,
    };
    if (cursor !== undefined) params.cursor = cursor;
    for (const key of Object.keys(params)) {
      if (params[key] === undefined || params[key] === null) delete params[key];
    }
    // convert:false — keep each record's opaque `data` map keys verbatim.
    const res = await this.#vhttp.get<RawRecordsResponse>(
      [video, this.videoId, indexes, this.indexId ?? '', records],
      { params },
      { convert: false }
    );
    // convert:false — res.data is raw snake at runtime (types assume camel).
    const recordsData = res.data as unknown as RawRecordsResponse;
    if (!recordsData) return new RecordPage();
    const recordList = (recordsData.records ?? []).map(
      r =>
        new IndexRecord({
          videoId: r.video_id,
          understandingId: r.understanding_id,
          sceneId: r.scene_id,
          start: r.start,
          end: r.end,
          data: r.data,
          segmentId: r.segment_id,
          startSec: r.start_sec,
          endSec: r.end_sec,
        })
    );
    return new RecordPage(recordList, recordsData.next_cursor);
  };

  /**
   * Delete the index. Removes the index's retrieval structures only — it does
   * not delete the original video or stored understanding artifacts.
   */
  public delete = async (): Promise<void> => {
    await this.#vhttp.delete(
      [video, this.videoId, indexes, this.indexId ?? ''],
      this.#collectionParams()
    );
  };

  public toString(): string {
    return `Index(indexId=${this.indexId}, videoId=${this.videoId}, name=${this.name}, status=${this.status}, useFor=[${this.useFor.join(', ')}], recordCount=${this.recordCount})`;
  }
}
