import { ApiPath } from '@/constants';
import type {
  RTStreamBase,
  RTStreamSceneIndexBase,
  RTStreamShotBase,
  RTStreamSearchConfig,
} from '@/interfaces/core';
import type {
  IndexVisualsConfig,
  IndexSpokenWordsConfig,
} from '@/types/capture';
import { HttpClient } from '@/utils/httpClient';
import { playStream, buildIframeEmbedCode } from '@/utils';
import { VideodbError } from '@/utils/error';

/** Constructor input for {@link RTStreamSceneIndex} (adds self-hosted sandbox id). */
interface RTStreamSceneIndexData extends RTStreamSceneIndexBase {
  /** Sandbox ID used for self-hosted inference */
  sandboxId?: string;
}

/** Constructor input for {@link RTStreamUnderstanding}. */
interface RTStreamUnderstandingBase {
  id?: string;
  understandingId?: string;
  rtstreamId?: string;
  status?: string;
  store?: boolean;
  segmentation?: Record<string, unknown>;
  analyzers?: Record<string, unknown>[];
  outputs?: Record<string, unknown>;
}

/** Constructor input for {@link RTStreamIndex}. */
interface RTStreamIndexBase {
  id?: string;
  indexId?: string;
  rtstreamId?: string;
  name?: string;
  status?: string;
  useFor?: string[];
  sourceUnderstandingId?: string;
  output?: string;
}

/**
 * Result of exporting an RTStream recording
 */
export class RTStreamExportResult {
  /** ID of the exported video or audio asset */
  public videoId: string;
  /** URL to stream the exported asset (may be undefined for audio) */
  public streamUrl?: string;
  /** URL to play the exported asset in a player (may be undefined for audio) */
  public playerUrl?: string;
  /** Name of the exported recording */
  public name?: string;
  /** Duration of the exported recording in seconds (may be undefined on idempotent calls) */
  public duration?: number;

  constructor(data: {
    videoId: string;
    streamUrl?: string;
    playerUrl?: string;
    name?: string;
    duration?: number;
  }) {
    this.videoId = data.videoId;
    this.streamUrl = data.streamUrl;
    this.playerUrl = data.playerUrl;
    this.name = data.name;
    this.duration = data.duration;
  }

  /**
   * Generate an HTML iframe embed code for the exported recording.
   * @param width - Width of the iframe (default `"100%"`)
   * @param height - Height of the iframe in pixels (default `405`)
   * @param title - Title attribute for the iframe (default `"VideoDB Player"`)
   * @param allowFullscreen - Whether to allow fullscreen (default `true`)
   * @returns HTML iframe string
   * @throws {VideodbError} If `playerUrl` is not available
   */
  public getEmbedCode = (
    width: string = '100%',
    height: number = 405,
    title: string = 'VideoDB Player',
    allowFullscreen: boolean = true
  ): string => {
    if (!this.playerUrl) {
      throw new VideodbError(
        'player_url not available. Export may have failed or returned audio-only content.'
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

export interface RTStreamPlayerConfig {
  /** Optional title shown in the player share page */
  title?: string;
  /** Optional description shown in the player share page */
  description?: string;
  /** Optional slug prefix for the generated player share URL */
  slug?: string;
}

/**
 * RTStreamShot class for rtstream search results
 */
export class RTStreamShot {
  public rtstreamId: string;
  public rtstreamName?: string;
  public start: number;
  public end: number;
  public text?: string;
  public searchScore?: number;
  public sceneIndexId?: string;
  public sceneIndexName?: string;
  public metadata?: Record<string, unknown>;
  public streamUrl?: string;
  public playerUrl?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: RTStreamShotBase) {
    this.#vhttp = http;
    this.rtstreamId = data.rtstreamId;
    this.rtstreamName = data.rtstreamName;
    this.start = data.start;
    this.end = data.end;
    this.text = data.text;
    this.searchScore = data.searchScore;
    this.sceneIndexId = data.sceneIndexId;
    this.sceneIndexName = data.sceneIndexName;
    this.metadata = data.metadata;
  }

  /**
   * Generate a stream url for the shot
   * @returns The stream url
   */
  public generateStream = async (): Promise<string | null> => {
    if (this.streamUrl) return this.streamUrl;

    const res = await this.#vhttp.get<{ streamUrl: string; playerUrl: string }>(
      [ApiPath.rtstream, this.rtstreamId, ApiPath.stream],
      { params: { start: Math.floor(this.start), end: Math.floor(this.end) } }
    );
    this.streamUrl = res.data?.streamUrl;
    this.playerUrl = res.data?.playerUrl;
    return this.streamUrl || null;
  };

  /**
   * Generate a stream url for the shot and open it in the default browser
   * @returns The stream url
   */
  public play = async (): Promise<string | null> => {
    await this.generateStream();
    if (this.streamUrl) {
      return playStream(this.streamUrl);
    }
    return null;
  };

  /**
   * Generate an HTML iframe embed code for the rtstream shot.
   * @param width - Width of the iframe (default `"100%"`)
   * @param height - Height of the iframe in pixels (default `405`)
   * @param title - Title attribute for the iframe (default `"VideoDB Player"`)
   * @param allowFullscreen - Whether to allow fullscreen (default `true`)
   * @param autoGenerate - If `true` and `playerUrl` is missing, auto-generate it (default `true`)
   * @returns HTML iframe string
   * @throws {VideodbError} If `playerUrl` is not available
   */
  public getEmbedCode = async (
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

/**
 * RTStreamSearchResult class to interact with rtstream search results
 */
export class RTStreamSearchResult {
  public collectionId: string;
  public shots: RTStreamShot[];

  constructor(collectionId: string, shots: RTStreamShot[]) {
    this.collectionId = collectionId;
    this.shots = shots;
  }

  /**
   * Get the list of shots from the search result
   * @returns List of RTStreamShot objects
   */
  public getShots = (): RTStreamShot[] => {
    return this.shots;
  };
}

/**
 * RTStreamSceneIndex class to interact with the rtstream scene index
 */
export class RTStreamSceneIndex {
  public rtstreamIndexId: string;
  public rtstreamId: string;
  public extractionType?: string;
  public extractionConfig?: Record<string, unknown>;
  public prompt?: string;
  public name?: string;
  public status?: string;
  /** Sandbox ID used for self-hosted inference */
  public sandboxId?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: RTStreamSceneIndexData) {
    this.#vhttp = http;
    this.rtstreamIndexId = data.rtstreamIndexId;
    this.rtstreamId = data.rtstreamId;
    this.extractionType = data.extractionType;
    this.extractionConfig = data.extractionConfig;
    this.prompt = data.prompt;
    this.name = data.name;
    this.status = data.status;
    this.sandboxId = data.sandboxId;
  }

  /**
   * Get rtstream scene index scenes
   * @param start - Start time of the scenes
   * @param end - End time of the scenes
   * @param page - Page number
   * @param pageSize - Number of scenes per page
   * @returns Object with scenes array and next_page boolean
   */
  public getScenes = async (
    start?: number,
    end?: number,
    page: number = 1,
    pageSize: number = 100
  ): Promise<{ scenes: unknown[]; nextPage: boolean } | null> => {
    const params: Record<string, unknown> = { page, page_size: pageSize };
    if (start !== undefined && end !== undefined) {
      params.start = start;
      params.end = end;
    }

    const res = await this.#vhttp.get<{
      sceneIndexRecords: unknown[];
      nextPage: boolean;
    }>(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.rtstreamIndexId,
      ],
      { params }
    );

    if (!res.data) return null;

    return {
      scenes: res.data.sceneIndexRecords || [],
      nextPage: res.data.nextPage || false,
    };
  };

  /**
   * Start the scene index
   */
  public start = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.rtstreamIndexId,
        ApiPath.status,
      ],
      { action: 'start' }
    );
    this.status = 'connected';
  };

  /**
   * Stop the scene index
   */
  public stop = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.rtstreamIndexId,
        ApiPath.status,
      ],
      { action: 'stop' }
    );
    this.status = 'stopped';
  };

  /**
   * Update the scene index prompt
   * @param prompt - New prompt for the scene index
   * @returns API response with update status
   */
  public updateSceneIndex = async (
    prompt: string
  ): Promise<{
    success: boolean;
    message?: string;
    data?: { prompt?: string };
  } | null> => {
    const res = await this.#vhttp.patch<
      { success: boolean; message?: string; data?: { prompt?: string } },
      { prompt: string }
    >(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        ApiPath.scene,
        this.rtstreamIndexId,
      ],
      { prompt }
    );

    if (res.data?.data?.prompt) {
      this.prompt = res.data.data.prompt;
    } else if (res.data?.success) {
      this.prompt = prompt;
    }

    return res.data || null;
  };

  /**
   * Create an event alert
   * @param eventId - ID of the event
   * @param callbackUrl - URL to receive the alert callback
   * @param socketId - WebSocket connection ID for real-time alerts (optional)
   * @returns Alert ID
   */
  public createAlert = async (
    eventId: string,
    callbackUrl: string,
    socketId?: string
  ): Promise<string | null> => {
    const data: Record<string, unknown> = {
      event_id: eventId,
      callback_url: callbackUrl,
    };
    if (socketId) data.ws_connection_id = socketId;

    const res = await this.#vhttp.post<{ alertId: string }, typeof data>(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        this.rtstreamIndexId,
        ApiPath.alert,
      ],
      data
    );
    return res.data?.alertId || null;
  };

  /**
   * List all alerts for the rtstream scene index
   * @returns List of alerts
   */
  public listAlerts = async (): Promise<unknown[]> => {
    const res = await this.#vhttp.get<{ alerts: unknown[] }>([
      ApiPath.rtstream,
      this.rtstreamId,
      ApiPath.index,
      this.rtstreamIndexId,
      ApiPath.alert,
    ]);
    return res.data?.alerts || [];
  };

  /**
   * Enable an alert
   * @param alertId - ID of the alert
   */
  public enableAlert = async (alertId: string): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        this.rtstreamIndexId,
        ApiPath.alert,
        alertId,
        ApiPath.status,
      ],
      { action: 'enable' }
    );
  };

  /**
   * Disable an alert
   * @param alertId - ID of the alert
   */
  public disableAlert = async (alertId: string): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.index,
        this.rtstreamIndexId,
        ApiPath.alert,
        alertId,
        ApiPath.status,
      ],
      { action: 'disable' }
    );
  };
}

/**
 * RTStreamUnderstanding class to interact with a continuous understanding job.
 *
 * Produced by {@link RTStream.understand}. It runs VLM analysis over stream
 * windows and, when `store=true`, persists the output so it can be indexed
 * later. Understanding is independent of scene indexing.
 */
export class RTStreamUnderstanding {
  /** Understanding id (`und-...`) */
  public id: string;
  /** ID of the parent RTStream */
  public rtstreamId: string;
  /** Job status (`running` | `stopped` | `failed`) */
  public status?: string;
  /** Whether output is persisted for later indexing */
  public store: boolean;
  /** Time segmentation, e.g. `{ type: 'time', window: '10s' }` */
  public segmentation: Record<string, unknown>;
  /** Analyzer specs for this understanding */
  public analyzers: Record<string, unknown>[];
  /** Named output source descriptors, e.g. `outputs.scene` */
  public outputs: Record<string, unknown>;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: RTStreamUnderstandingBase) {
    this.#vhttp = http;
    this.id = (data.understandingId ?? data.id) as string;
    this.rtstreamId = data.rtstreamId as string;
    this.status = data.status;
    this.store = data.store ?? true;
    this.segmentation = data.segmentation ?? {};
    this.analyzers = data.analyzers ?? [];
    this.outputs = data.outputs ?? {};
  }

  /**
   * Reload this understanding from the server.
   * @returns This understanding, updated
   */
  public refresh = async (): Promise<RTStreamUnderstanding> => {
    const res = await this.#vhttp.get<RTStreamUnderstandingBase>([
      ApiPath.rtstream,
      this.rtstreamId,
      ApiPath.understand,
      this.id,
    ]);
    const data = res.data;
    if (data) {
      this.id = data.understandingId ?? data.id ?? this.id;
      this.rtstreamId = data.rtstreamId ?? this.rtstreamId;
      this.status = data.status;
      this.store = data.store ?? true;
      this.segmentation = data.segmentation ?? {};
      this.analyzers = data.analyzers ?? [];
      this.outputs = data.outputs ?? {};
    }
    return this;
  };

  /**
   * Resume processing new stream windows.
   */
  public start = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.understand,
        this.id,
        ApiPath.status,
      ],
      { action: 'start' }
    );
    this.status = 'running';
  };

  /**
   * Pause processing new stream windows. Existing records remain available.
   */
  public stop = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.understand,
        this.id,
        ApiPath.status,
      ],
      { action: 'stop' }
    );
    this.status = 'stopped';
  };

  /**
   * Get understanding output records for a time range.
   * @param start - Start Unix timestamp
   * @param end - End Unix timestamp
   * @param output - Analyzer output name (default: `"scene"`)
   * @param page - Page number (default: 1)
   * @param pageSize - Records per page (default: 100)
   * @returns Records payload with `records` and `nextPage`
   */
  public getRecords = async (
    start: number,
    end: number,
    output: string = 'scene',
    page: number = 1,
    pageSize: number = 100
  ): Promise<Record<string, unknown>> => {
    const rawParams: Record<string, unknown> = {
      start,
      end,
      output,
      page,
      page_size: pageSize,
    };
    const params: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rawParams)) {
      if (value !== undefined && value !== null) params[key] = value;
    }

    const res = await this.#vhttp.get<Record<string, unknown>>(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.understand,
        this.id,
        ApiPath.records,
      ],
      { params }
    );
    return res.data || {};
  };
}

/**
 * RTStreamIndex — a continuous index over an understanding output.
 *
 * Produced by {@link RTStream.index}. Materializes an understanding's stored
 * output into a searchable index; has its own lifecycle, separate from the
 * understanding.
 */
export class RTStreamIndex {
  /** Index id (`idx-...`) */
  public id: string;
  /** ID of the parent RTStream */
  public rtstreamId: string;
  /** Index name */
  public name?: string;
  /** `running` | `stopped` | `failed` */
  public status?: string;
  /** Index capabilities, e.g. `['semantic']` */
  public useFor: string[];
  /** Understanding this index consumes */
  public sourceUnderstandingId?: string;
  /** Analyzer output name being indexed (e.g. `"scene"`) */
  public output: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: RTStreamIndexBase) {
    this.#vhttp = http;
    this.id = (data.indexId ?? data.id) as string;
    this.rtstreamId = data.rtstreamId as string;
    this.name = data.name;
    this.status = data.status;
    this.useFor = data.useFor ?? ['semantic'];
    this.sourceUnderstandingId = data.sourceUnderstandingId;
    this.output = data.output ?? 'scene';
  }

  /**
   * Reload this index from the server.
   * @returns This index, updated
   */
  public refresh = async (): Promise<RTStreamIndex> => {
    const res = await this.#vhttp.get<RTStreamIndexBase>([
      ApiPath.rtstream,
      this.rtstreamId,
      ApiPath.indexes,
      this.id,
    ]);
    const data = res.data;
    if (data) {
      this.id = data.indexId ?? data.id ?? this.id;
      this.rtstreamId = data.rtstreamId ?? this.rtstreamId;
      this.name = data.name;
      this.status = data.status;
      this.useFor = data.useFor ?? ['semantic'];
      this.sourceUnderstandingId = data.sourceUnderstandingId;
      this.output = data.output ?? 'scene';
    }
    return this;
  };

  /**
   * Resume materializing new understanding output into the index.
   */
  public start = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.indexes,
        this.id,
        ApiPath.status,
      ],
      { action: 'start' }
    );
    this.status = 'running';
  };

  /**
   * Pause materializing. Existing indexed records remain searchable.
   */
  public stop = async (): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.indexes,
        this.id,
        ApiPath.status,
      ],
      { action: 'stop' }
    );
    this.status = 'stopped';
  };

  /**
   * Get materialized index records.
   * @param start - Start Unix timestamp (optional)
   * @param end - End Unix timestamp (optional)
   * @param page - Page number (default: 1)
   * @param pageSize - Records per page (default: 100)
   * @returns Records payload
   */
  public getRecords = async (
    start?: number,
    end?: number,
    page: number = 1,
    pageSize: number = 100
  ): Promise<Record<string, unknown>> => {
    const params: Record<string, unknown> = { page, page_size: pageSize };
    if (start !== undefined && start !== null) params.start = start;
    if (end !== undefined && end !== null) params.end = end;

    const res = await this.#vhttp.get<Record<string, unknown>>(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.indexes,
        this.id,
        ApiPath.records,
      ],
      { params }
    );
    return res.data || {};
  };

  /**
   * Attach an event alert to this index.
   * @param eventId - ID of the event
   * @param callbackUrl - URL to receive the alert callback
   * @param wsConnectionId - WebSocket connection ID for real-time alerts (optional)
   * @returns Alert ID
   */
  public createAlert = async (
    eventId: string,
    callbackUrl: string,
    wsConnectionId?: string
  ): Promise<string | null> => {
    const data: Record<string, unknown> = {
      event_id: eventId,
      callback_url: callbackUrl,
    };
    if (wsConnectionId) data.ws_connection_id = wsConnectionId;

    const res = await this.#vhttp.post<{ alertId: string }, typeof data>(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.indexes,
        this.id,
        ApiPath.alert,
      ],
      data
    );
    return res.data?.alertId || null;
  };

  /**
   * List all alerts on this index.
   * @returns List of alerts
   */
  public listAlerts = async (): Promise<unknown[]> => {
    const res = await this.#vhttp.get<{ alerts: unknown[] }>([
      ApiPath.rtstream,
      this.rtstreamId,
      ApiPath.indexes,
      this.id,
      ApiPath.alert,
    ]);
    return res.data?.alerts || [];
  };

  /**
   * Enable an alert on this index.
   * @param alertId - ID of the alert
   */
  public enableAlert = async (alertId: string): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.indexes,
        this.id,
        ApiPath.alert,
        alertId,
        ApiPath.status,
      ],
      { action: 'enable' }
    );
  };

  /**
   * Disable an alert on this index.
   * @param alertId - ID of the alert
   */
  public disableAlert = async (alertId: string): Promise<void> => {
    await this.#vhttp.patch(
      [
        ApiPath.rtstream,
        this.rtstreamId,
        ApiPath.indexes,
        this.id,
        ApiPath.alert,
        alertId,
        ApiPath.status,
      ],
      { action: 'disable' }
    );
  };
}

/**
 * RTStream class to interact with the RTStream
 */
export class RTStream {
  public id: string;
  public name?: string;
  public collectionId?: string;
  public createdAt?: string;
  public sampleRate?: number;
  public status?: string;
  /** Channel ID this rtstream is associated with */
  public channelId?: string;
  /** Media types this rtstream handles */
  public mediaTypes?: string[];
  /** Generated playback URL for the rtstream segment */
  public streamUrl?: string;
  /** Player URL for the generated rtstream segment */
  public playerUrl?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: RTStreamBase) {
    this.#vhttp = http;
    this.id = data.id;
    this.name = data.name;
    this.collectionId = data.collectionId;
    this.createdAt = data.createdAt;
    this.sampleRate = data.sampleRate;
    this.status = data.status;
    this.channelId = data.channelId;
    this.mediaTypes = data.mediaTypes;
  }

  /**
   * Connect to the rtstream
   */
  public start = async (): Promise<void> => {
    await this.#vhttp.patch([ApiPath.rtstream, this.id, ApiPath.status], {
      action: 'start',
    });
    this.status = 'connected';
  };

  /**
   * Disconnect from the rtstream
   */
  public stop = async (): Promise<void> => {
    await this.#vhttp.patch([ApiPath.rtstream, this.id, ApiPath.status], {
      action: 'stop',
    });
    this.status = 'stopped';
  };

  /**
   * Export the latest completed recording as a video or audio asset.
   *
   * The stream must be stopped before exporting. The call is idempotent:
   * calling it again returns the same asset without re-ingesting.
   *
   * @param name - Name for the exported asset (optional, defaults to "{stream_name} - Recording")
   * @returns Export result with the asset ID and metadata
   */
  public export = async (name?: string): Promise<RTStreamExportResult> => {
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;

    const res = await this.#vhttp.post<
      {
        videoId: string;
        streamUrl?: string;
        playerUrl?: string;
        name?: string;
        duration?: number;
      },
      typeof data
    >([ApiPath.rtstream, this.id, ApiPath.export], data);

    return new RTStreamExportResult({
      videoId: res.data.videoId,
      streamUrl: res.data.streamUrl,
      playerUrl: res.data.playerUrl,
      name: res.data.name,
      duration: res.data.duration,
    });
  };

  /**
   * Generate a stream from the rtstream
   * @param start - Start time of the stream in Unix timestamp format
   * @param end - End time of the stream in Unix timestamp format
   * @param playerConfig - Optional player share page metadata
   * @returns Player URL
   */
  public generateStream = async (
    start: number,
    end: number,
    playerConfig?: RTStreamPlayerConfig
  ): Promise<string | null> => {
    const params: Record<string, unknown> = { start, end };

    if (playerConfig?.title !== undefined) {
      params.player_title = playerConfig.title;
    }
    if (playerConfig?.description !== undefined) {
      params.player_description = playerConfig.description;
    }
    if (playerConfig?.slug !== undefined) {
      params.player_slug_prefix = playerConfig.slug;
    }

    const res = await this.#vhttp.get<{
      streamUrl: string;
      playerUrl: string;
    }>([ApiPath.rtstream, this.id, ApiPath.stream], { params });
    this.streamUrl = res.data?.streamUrl;
    this.playerUrl = res.data?.playerUrl;
    return this.playerUrl || null;
  };

  /**
   * Generate an HTML iframe embed code for the rtstream.
   *
   * Note: Unlike other objects, RTStream does not support autoGenerate because
   * `generateStream()` requires start and end parameters. Call
   * `generateStream(start, end)` first to populate `playerUrl`.
   *
   * @param width - Width of the iframe (default `"100%"`)
   * @param height - Height of the iframe in pixels (default `405`)
   * @param title - Title attribute for the iframe (default `"VideoDB Player"`)
   * @param allowFullscreen - Whether to allow fullscreen (default `true`)
   * @returns HTML iframe string
   * @throws {VideodbError} If `playerUrl` is not available
   */
  public getEmbedCode = (
    width: string = '100%',
    height: number = 405,
    title: string = 'VideoDB Player',
    allowFullscreen: boolean = true
  ): string => {
    if (!this.playerUrl) {
      throw new VideodbError(
        'player_url not available. Call generateStream(start, end) first to generate a stream.'
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

  /**
   * Index scenes from the rtstream (flexible base method)
   *
   * This is the most flexible indexing method that allows full control over
   * extraction type and configuration. Use `indexVisuals()` or `indexAudio()`
   * for simpler use cases.
   *
   * @param config - Configuration for scene indexing
   * @param config.extractionType - Type of extraction: 'time_based', 'shot_based', or 'transcript'
   * @param config.extractionConfig - Configuration for extraction (varies by type)
   * @param config.prompt - Prompt for scene extraction (default: 'Describe the scene')
   * @param config.modelName - Name of the model (optional)
   * @param config.modelConfig - Configuration for the model (optional)
   * @param config.name - Name of the scene index (optional)
   * @param config.wsConnectionId - WebSocket connection ID for real-time updates (optional)
   * @returns RTStreamSceneIndex object
   *
   * @example
   * ```typescript
   * // Time-based extraction
   * const index = await rtstream.indexScenes({
   *   extractionType: 'time_based',
   *   extractionConfig: { time: 2, frame_count: 5 },
   *   prompt: 'Describe what is happening',
   * });
   *
   * // Transcript-based extraction
   * const index = await rtstream.indexScenes({
   *   extractionType: 'transcript',
   *   extractionConfig: { segmenter: 'word', segmentation_value: 10 },
   *   prompt: 'Summarize this segment',
   * });
   * ```
   */
  public indexScenes = async (config: {
    extractionType?: 'time_based' | 'shot_based' | 'transcript';
    extractionConfig?: Record<string, unknown>;
    prompt?: string;
    modelName?: string;
    modelConfig?: Record<string, unknown>;
    name?: string;
    wsConnectionId?: string;
    sandboxId?: string;
  }): Promise<RTStreamSceneIndex | null> => {
    const {
      extractionType = 'time_based',
      extractionConfig = { time: 2, frame_count: 5 },
      prompt = 'Describe the scene',
      modelName,
      modelConfig = {},
      name,
      wsConnectionId,
      sandboxId,
    } = config;

    const data: Record<string, unknown> = {
      extraction_type: extractionType,
      extraction_config: extractionConfig,
      prompt,
      model_name: modelName,
      model_config: modelConfig,
      name,
    };

    if (wsConnectionId) data.ws_connection_id = wsConnectionId;
    if (sandboxId) data.sandbox_id = sandboxId;

    const res = await this.#vhttp.post<RTStreamSceneIndexData, typeof data>(
      [ApiPath.rtstream, this.id, ApiPath.index, ApiPath.scene],
      data
    );

    if (!res.data) return null;

    return new RTStreamSceneIndex(this.#vhttp, {
      rtstreamIndexId: res.data.rtstreamIndexId,
      rtstreamId: this.id,
      extractionType: res.data.extractionType,
      extractionConfig: res.data.extractionConfig,
      prompt: res.data.prompt,
      name: res.data.name,
      status: res.data.status,
      sandboxId: res.data.sandboxId,
    });
  };

  /**
   * Index visuals from the rtstream (scene indexing)
   * @param config - Configuration for visual indexing
   * @param config.batchConfig - Frame extraction config (optional)
   * @param config.batchConfig.type - Only "time" is supported
   * @param config.batchConfig.value - Window size in seconds
   * @param config.batchConfig.frameCount - Number of frames to extract per window
   * @param config.prompt - Prompt for scene description
   * @param config.modelName - Name of the model
   * @param config.modelConfig - Configuration for the model
   * @param config.name - Name of the visual index
   * @param config.socketId - WebSocket connection ID for real-time updates
   * @returns RTStreamSceneIndex object
   */
  public indexVisuals = async (
    config: Partial<IndexVisualsConfig> & { sandboxId?: string } = {}
  ): Promise<RTStreamSceneIndex | null> => {
    let extractionType: string | undefined;
    let extractionConfig: Record<string, unknown> | undefined;

    if (config.batchConfig) {
      extractionType =
        config.batchConfig.type === 'time'
          ? 'time_based'
          : config.batchConfig.type;
      extractionConfig = {
        time: config.batchConfig.value,
        frame_count: config.batchConfig.frameCount ?? 5,
      };
    }

    const data: Record<string, unknown> = {
      extraction_type: extractionType,
      extraction_config: extractionConfig,
      prompt: config.prompt,
      model_name: config.modelName,
      model_config: config.modelConfig ?? {},
      name: config.name,
    };

    if (config.socketId) data.ws_connection_id = config.socketId;
    if (config.sandboxId) data.sandbox_id = config.sandboxId;

    const res = await this.#vhttp.post<RTStreamSceneIndexData, typeof data>(
      [ApiPath.rtstream, this.id, ApiPath.index, ApiPath.scene],
      data
    );

    if (!res.data) return null;

    return new RTStreamSceneIndex(this.#vhttp, {
      rtstreamIndexId: res.data.rtstreamIndexId,
      rtstreamId: this.id,
      extractionType: res.data.extractionType,
      extractionConfig: res.data.extractionConfig,
      prompt: res.data.prompt,
      name: res.data.name,
      status: res.data.status,
      sandboxId: res.data.sandboxId,
    });
  };

  /**
   * List all scene indexes for the rtstream
   * @returns List of RTStreamSceneIndex objects
   */
  public listSceneIndexes = async (): Promise<RTStreamSceneIndex[]> => {
    const res = await this.#vhttp.get<{
      sceneIndexes: RTStreamSceneIndexData[];
    }>([ApiPath.rtstream, this.id, ApiPath.index, ApiPath.scene]);

    return (res.data?.sceneIndexes || []).map(
      index =>
        new RTStreamSceneIndex(this.#vhttp, {
          rtstreamIndexId: index.rtstreamIndexId,
          rtstreamId: this.id,
          extractionType: index.extractionType,
          extractionConfig: index.extractionConfig,
          prompt: index.prompt,
          name: index.name,
          status: index.status,
          sandboxId: index.sandboxId,
        })
    );
  };

  /**
   * Get a scene index by its ID
   * @param indexId - ID of the scene index
   * @returns RTStreamSceneIndex object
   */
  public getSceneIndex = async (
    indexId: string
  ): Promise<RTStreamSceneIndex> => {
    const res = await this.#vhttp.get<RTStreamSceneIndexData>([
      ApiPath.rtstream,
      this.id,
      ApiPath.index,
      indexId,
    ]);

    return new RTStreamSceneIndex(this.#vhttp, {
      rtstreamIndexId: res.data.rtstreamIndexId,
      rtstreamId: this.id,
      extractionType: res.data.extractionType,
      extractionConfig: res.data.extractionConfig,
      prompt: res.data.prompt,
      name: res.data.name,
      status: res.data.status,
      sandboxId: res.data.sandboxId,
    });
  };

  /**
   * Index audio from the rtstream transcript
   * @param config - Configuration for audio indexing
   * @param config.batchConfig - Segmentation config (optional)
   * @param config.batchConfig.type - Segmentation type ("word", "sentence", or "time")
   * @param config.batchConfig.value - Segment length (words, sentences, or seconds)
   * @param config.prompt - Prompt for summarizing transcript segments
   * @param config.modelName - Name of the model
   * @param config.modelConfig - Configuration for the model
   * @param config.name - Name of the audio index
   * @param config.socketId - WebSocket connection ID for real-time updates
   * @param config.autoStartTranscript - Whether to auto-start transcript if not running (default: true)
   * @returns RTStreamSceneIndex object
   */
  public indexAudio = async (
    config: Partial<IndexSpokenWordsConfig> & { sandboxId?: string } = {}
  ): Promise<RTStreamSceneIndex | null> => {
    let extractionConfig: Record<string, unknown> | undefined;

    if (config.batchConfig) {
      extractionConfig = {
        segmenter: config.batchConfig.type,
        segmentation_value: config.batchConfig.value,
      };
    }

    const data: Record<string, unknown> = {
      extraction_type: 'transcript',
      extraction_config: extractionConfig,
      prompt: config.prompt,
      model_name: config.modelName,
      model_config: config.modelConfig ?? {},
      name: config.name,
      auto_start_transcript: config.autoStartTranscript ?? true,
    };

    if (config.socketId) data.ws_connection_id = config.socketId;
    if (config.sandboxId) data.sandbox_id = config.sandboxId;

    const res = await this.#vhttp.post<RTStreamSceneIndexData, typeof data>(
      [ApiPath.rtstream, this.id, ApiPath.index, ApiPath.scene],
      data
    );

    if (!res.data) return null;

    return new RTStreamSceneIndex(this.#vhttp, {
      rtstreamIndexId: res.data.rtstreamIndexId,
      rtstreamId: this.id,
      extractionType: res.data.extractionType,
      extractionConfig: res.data.extractionConfig,
      prompt: res.data.prompt,
      name: res.data.name,
      status: res.data.status,
      sandboxId: res.data.sandboxId,
    });
  };

  /**
   * Get transcription data from the rtstream
   * @param config - Configuration for transcript retrieval
   * @param config.page - Page number (default: 1)
   * @param config.pageSize - Items per page (default: 100, max: 1000)
   * @param config.start - Start timestamp filter (optional)
   * @param config.end - End timestamp filter (optional)
   * @param config.since - For polling - only get transcriptions after this timestamp (optional)
   * @param config.engine - Transcription engine (optional)
   * @returns Transcription data with segments and metadata
   *
   * @example
   * ```typescript
   * const data = await rtstream.getTranscript({ page: 1, pageSize: 100 });
   * console.log(data);
   * ```
   */
  public getTranscript = async (
    config: {
      page?: number;
      pageSize?: number;
      start?: number;
      end?: number;
      since?: number;
      engine?: string;
    } = {}
  ): Promise<Record<string, unknown>> => {
    const params: Record<string, unknown> = {
      engine: config.engine,
      page: config.page ?? 1,
      page_size: config.pageSize ?? 100,
    };
    if (config.start !== undefined) params.start = config.start;
    if (config.end !== undefined) params.end = config.end;
    if (config.since !== undefined) params.since = config.since;

    const res = await this.#vhttp.get<Record<string, unknown>>(
      [ApiPath.rtstream, this.id, ApiPath.transcription],
      { params }
    );
    return res.data || {};
  };

  /**
   * Start transcription for the rtstream
   * @param socketId - WebSocket connection ID for real-time transcript updates (optional)
   * @param engine - Transcription engine (default: "assemblyai")
   * @returns Transcription status with start time
   */
  public startTranscript = async (
    socketId?: string,
    engine: string = 'assemblyai'
  ): Promise<Record<string, unknown>> => {
    const data: Record<string, unknown> = { action: 'start', engine };
    if (socketId) data.ws_connection_id = socketId;

    const res = await this.#vhttp.post<Record<string, unknown>, typeof data>(
      [ApiPath.rtstream, this.id, ApiPath.transcription],
      data
    );
    return res.data || {};
  };

  /**
   * Stop transcription for the rtstream
   * @param mode - Stop mode: "graceful" (default) or "force"
   * @param engine - Transcription engine (default: "assemblyai")
   * @returns Transcription status with start and end time
   */
  public stopTranscript = async (
    mode: 'graceful' | 'force' = 'graceful',
    engine: string = 'assemblyai'
  ): Promise<Record<string, unknown>> => {
    const res = await this.#vhttp.post<Record<string, unknown>, object>(
      [ApiPath.rtstream, this.id, ApiPath.transcription],
      { action: 'stop', mode, engine }
    );
    return res.data || {};
  };

  /**
   * Start a continuous VLM understanding job on the stream.
   *
   * Understanding is independent of indexing: it produces VLM output per
   * stream window and (when `store=true`) persists it so it can be indexed
   * later.
   *
   * @param options - Understanding configuration
   * @param options.segmentation - Time segmentation, e.g. `{ type: 'time', window: '10s' }`
   * @param options.analyzers - Analyzer specs (initially one `vlm` analyzer)
   * @param options.store - Persist output for later indexing (default: `true`)
   * @param options.wsConnectionId - WebSocket connection ID for real-time updates (optional)
   * @returns The understanding job, RTStreamUnderstanding object
   */
  public understand = async (
    options: {
      segmentation?: Record<string, unknown>;
      analyzers?: Record<string, unknown>[];
      store?: boolean;
      wsConnectionId?: string;
    } = {}
  ): Promise<RTStreamUnderstanding | null> => {
    const data: Record<string, unknown> = {
      segmentation: options.segmentation ?? {},
      analyzers: options.analyzers ?? [],
      store: options.store ?? true,
    };
    if (options.wsConnectionId) data.ws_connection_id = options.wsConnectionId;

    const res = await this.#vhttp.post<RTStreamUnderstandingBase, typeof data>(
      [ApiPath.rtstream, this.id, ApiPath.understand],
      data
    );

    if (!res.data) return null;

    const understandingData = res.data;
    understandingData.rtstreamId = understandingData.rtstreamId ?? this.id;
    return new RTStreamUnderstanding(this.#vhttp, understandingData);
  };

  /**
   * Get an understanding job by id.
   * @param understandingId - ID of the understanding job
   * @returns The understanding job, RTStreamUnderstanding object
   */
  public getUnderstanding = async (
    understandingId: string
  ): Promise<RTStreamUnderstanding | null> => {
    if (!understandingId) {
      throw new VideodbError('understanding_id is required');
    }
    const res = await this.#vhttp.get<RTStreamUnderstandingBase>([
      ApiPath.rtstream,
      this.id,
      ApiPath.understand,
      understandingId,
    ]);

    if (!res.data) return null;

    const understandingData = res.data;
    understandingData.rtstreamId = understandingData.rtstreamId ?? this.id;
    return new RTStreamUnderstanding(this.#vhttp, understandingData);
  };

  /**
   * List all understanding jobs on the stream.
   * @returns List of RTStreamUnderstanding objects
   */
  public listUnderstanding = async (): Promise<RTStreamUnderstanding[]> => {
    const res = await this.#vhttp.get<{
      understandings: RTStreamUnderstandingBase[];
    }>([ApiPath.rtstream, this.id, ApiPath.understand]);

    return (res.data?.understandings ?? []).map(item => {
      item.rtstreamId = item.rtstreamId ?? this.id;
      return new RTStreamUnderstanding(this.#vhttp, item);
    });
  };

  /**
   * Materialize an understanding output into a searchable index.
   * @param options - Index configuration
   * @param options.source - Understanding output descriptor, e.g. `understanding.outputs.scene`
   * @param options.name - Index name (optional)
   * @param options.useFor - Capabilities; defaults server-side to `['semantic']`
   * @returns The index, RTStreamIndex object
   */
  public index = async (options: {
    source: Record<string, unknown>;
    name?: string;
    useFor?: string[];
  }): Promise<RTStreamIndex | null> => {
    const data: Record<string, unknown> = { source: options.source };
    if (options.name !== undefined) data.name = options.name;
    if (options.useFor !== undefined) data.use_for = options.useFor;

    const res = await this.#vhttp.post<RTStreamIndexBase, typeof data>(
      [ApiPath.rtstream, this.id, ApiPath.indexes],
      data
    );

    if (!res.data) return null;

    const indexData = res.data;
    indexData.rtstreamId = indexData.rtstreamId ?? this.id;
    return new RTStreamIndex(this.#vhttp, indexData);
  };

  /**
   * Get an index by id.
   * @param indexId - ID of the index
   * @returns RTStreamIndex object
   */
  public getIndex = async (indexId: string): Promise<RTStreamIndex | null> => {
    if (!indexId) {
      throw new VideodbError('index_id is required');
    }
    const res = await this.#vhttp.get<RTStreamIndexBase>([
      ApiPath.rtstream,
      this.id,
      ApiPath.indexes,
      indexId,
    ]);

    if (!res.data) return null;

    const indexData = res.data;
    indexData.rtstreamId = indexData.rtstreamId ?? this.id;
    return new RTStreamIndex(this.#vhttp, indexData);
  };

  /**
   * List all indexes on the stream.
   * @returns List of RTStreamIndex objects
   */
  public listIndexes = async (): Promise<RTStreamIndex[]> => {
    const res = await this.#vhttp.get<{ indexes: RTStreamIndexBase[] }>([
      ApiPath.rtstream,
      this.id,
      ApiPath.indexes,
    ]);

    return (res.data?.indexes ?? []).map(item => {
      item.rtstreamId = item.rtstreamId ?? this.id;
      return new RTStreamIndex(this.#vhttp, item);
    });
  };

  /**
   * Search across scene index records for the rtstream
   * @param config - Search configuration
   * @returns RTStreamSearchResult object
   */
  public search = async (
    config: RTStreamSearchConfig
  ): Promise<RTStreamSearchResult> => {
    const data: Record<string, unknown> = { query: config.query };

    if (config.indexType !== undefined) data.index_type = config.indexType;
    if (config.indexId !== undefined) data.scene_index_id = config.indexId;
    if (config.resultThreshold !== undefined)
      data.result_threshold = config.resultThreshold;
    if (config.scoreThreshold !== undefined)
      data.score_threshold = config.scoreThreshold;
    if (config.dynamicScorePercentage !== undefined)
      data.dynamic_score_percentage = config.dynamicScorePercentage;
    if (config.filter !== undefined) data.filter = config.filter;

    const res = await this.#vhttp.post<
      { results: Array<Record<string, unknown>> },
      typeof data
    >([ApiPath.rtstream, this.id, ApiPath.search], data);

    const results = res.data?.results || [];
    const shots = results.map(
      (result: Record<string, unknown>) =>
        new RTStreamShot(this.#vhttp, {
          rtstreamId: this.id,
          rtstreamName: this.name,
          start: (result.start as number) || 0,
          end: (result.end as number) || 0,
          text: result.text as string | undefined,
          searchScore: result.score as number | undefined,
          sceneIndexId: result.sceneIndexId as string | undefined,
          sceneIndexName: result.sceneIndexName as string | undefined,
          metadata: result.metadata as Record<string, unknown> | undefined,
        })
    );

    return new RTStreamSearchResult(this.collectionId || '', shots);
  };
}
