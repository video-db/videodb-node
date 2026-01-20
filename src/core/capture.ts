import { ApiPath } from '@/constants';
import { RTStream } from '@/core/rtstream';
import type { CaptureBase, RTStreamBase } from '@/interfaces/core';
import { HttpClient } from '@/utils/httpClient';

/**
 * Channel data for a capture
 */
export interface CaptureChannel {
  channelId: string;
  type: string;
  rtstreamId?: string;
  status?: string;
}

/**
 * Capture class for managing video capture sessions (server-side)
 *
 * @example
 * ```typescript
 * const conn = videodb.connect({ apiKey: process.env.VIDEO_DB_API_KEY });
 *
 * const capture = await conn.capture({
 *   endUserId: 'user_abc',
 *   clientSessionId: 'cs_123',
 *   collectionId: 'col-xxx',
 * });
 *
 * const token = await capture.generateSessionToken({ expiresIn: 600 });
 * ```
 */
export class Capture {
  public id: string;
  public status?: string;
  public clientSessionId?: string;
  public endUserId?: string;
  public collectionId?: string;
  public callbackUrl?: string;
  public metadata?: Record<string, unknown>;
  public exportedVideoId?: string;
  public channels: CaptureChannel[];
  public rtstreams: RTStream[];
  public createdAt?: string;
  public updatedAt?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: CaptureBase) {
    this.#vhttp = http;
    this.id = data.id;
    this.status = data.status;
    this.clientSessionId = data.clientSessionId;
    this.endUserId = data.endUserId;
    this.collectionId = data.collectionId;
    this.callbackUrl = data.callbackUrl;
    this.metadata = data.metadata;
    this.exportedVideoId = data.exportedVideoId;
    this.channels = data.channels || [];
    this.rtstreams = [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Generate a session token for the capture
   * @param config - Token generation configuration
   * @param config.expiresIn - Token expiration time in seconds (default: 600)
   * @returns The session token string
   *
   * @example
   * ```typescript
   * const token = await capture.generateSessionToken({ expiresIn: 3600 });
   * // Use token for client-side connection
   * ```
   */
  public generateSessionToken = async (
    config: { expiresIn?: number } = {}
  ): Promise<string> => {
    const { expiresIn = 600 } = config;
    const res = await this.#vhttp.post<{ token: string }, object>(
      [ApiPath.capture, this.id, ApiPath.token],
      { expiresIn }
    );
    return res.data.token;
  };

  /**
   * Refresh the capture data from the server
   * Updates all local properties with the latest server state
   */
  public refresh = async (): Promise<void> => {
    const res = await this.#vhttp.get<
      CaptureBase & { rtstreams?: RTStreamBase[] }
    >([ApiPath.capture, this.id]);

    const data = res.data;
    this.status = data.status;
    this.clientSessionId = data.clientSessionId;
    this.endUserId = data.endUserId;
    this.collectionId = data.collectionId;
    this.callbackUrl = data.callbackUrl;
    this.metadata = data.metadata;
    this.exportedVideoId = data.exportedVideoId;
    this.channels = data.channels || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    // Build RTStream instances from the response
    if (data.rtstreams) {
      this.rtstreams = data.rtstreams.map(
        rts =>
          new RTStream(this.#vhttp, {
            id: rts.id,
            name: rts.name,
            collectionId: rts.collectionId,
            createdAt: rts.createdAt,
            sampleRate: rts.sampleRate,
            status: rts.status,
            channelId: rts.channelId,
            mediaTypes: rts.mediaTypes,
          })
      );
    }
  };

  /**
   * Get RTStream by channel ID
   * @param channelId - The channel ID to search for
   * @returns The RTStream associated with the channel, or undefined
   */
  public getRtstreamByChannel = (channelId: string): RTStream | undefined => {
    return this.rtstreams.find(rts => rts.channelId === channelId);
  };

  /**
   * String representation of the Capture
   */
  public toString(): string {
    return `Capture(id=${this.id}, status=${this.status}, endUserId=${this.endUserId})`;
  }
}
