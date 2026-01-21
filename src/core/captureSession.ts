import { ApiPath } from '@/constants';
import { RTStream } from '@/core/rtstream';
import type { CaptureSessionBase, RTStreamBase } from '@/interfaces/core';
import type {
  CaptureSessionStatusType,
  GenerateSessionTokenConfig,
} from '@/types/capture';
import { HttpClient } from '@/utils/httpClient';

/**
 * CaptureSession class for managing video capture sessions
 *
 * @example
 * ```typescript
 * // Backend: Create session via Collection
 * const conn = connect({ apiKey: process.env.VIDEO_DB_API_KEY });
 * const coll = await conn.getCollection('col-xxx');
 *
 * const session = await coll.createCaptureSession({
 *   endUserId: 'user_abc',
 *   callbackUrl: 'https://example.com/webhook',
 *   metadata: { clientName: 'desktop-app' },
 * });
 *
 * // Generate token for client
 * const token = await session.generateSessionToken({ expiresIn: 600 });
 *
 * // After capture starts, refresh to get RTStreams
 * await session.refresh();
 * const mic = session.getRtstream('mic:default');
 * ```
 */
export class CaptureSession {
  public id: string;
  public collectionId: string;
  public status?: CaptureSessionStatusType;
  public endUserId?: string;
  public callbackUrl?: string;
  public metadata?: Record<string, unknown>;
  public exportedVideoId?: string;
  public rtstreams: RTStream[];
  public createdAt?: number;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: CaptureSessionBase) {
    this.#vhttp = http;
    this.id = data.id;
    this.collectionId = data.collectionId;
    this.status = data.status;
    this.endUserId = data.endUserId;
    this.callbackUrl = data.callbackUrl;
    this.metadata = data.metadata;
    this.exportedVideoId = data.exportedVideoId;
    this.createdAt = data.createdAt;
    this.rtstreams = [];
  }

  /**
   * Generate a session token for the capture session
   * @param config - Token generation configuration
   * @param config.expiresIn - Token expiration time in seconds (default: 600)
   * @returns The session token string
   *
   * @example
   * ```typescript
   * const token = await session.generateSessionToken({ expiresIn: 3600 });
   * // Send token to desktop client
   * ```
   */
  public generateSessionToken = async (
    config: GenerateSessionTokenConfig = {}
  ): Promise<string> => {
    const { expiresIn = 600 } = config;
    const res = await this.#vhttp.post<{ token: string }, object>(
      [
        ApiPath.collection,
        this.collectionId,
        ApiPath.capture,
        ApiPath.session,
        this.id,
        ApiPath.token,
      ],
      { expiresIn }
    );
    return res.data.token;
  };

  /**
   * Refresh the capture session data from the server
   * Updates all local properties with the latest server state including RTStreams
   *
   * @example
   * ```typescript
   * // After capture becomes active, refresh to get RTStreams
   * await session.refresh();
   * console.log(session.status); // 'active'
   * console.log(session.rtstreams); // RTStream[]
   * ```
   */
  public refresh = async (): Promise<void> => {
    const res = await this.#vhttp.get<
      CaptureSessionBase & { rtstreams?: RTStreamBase[] }
    >([
      ApiPath.collection,
      this.collectionId,
      ApiPath.capture,
      ApiPath.session,
      this.id,
    ]);

    const data = res.data;
    this.status = data.status;
    this.endUserId = data.endUserId;
    this.callbackUrl = data.callbackUrl;
    this.metadata = data.metadata;
    this.exportedVideoId = data.exportedVideoId;
    this.createdAt = data.createdAt;

    // Build RTStream instances from the response
    // API returns: { rtstream_id, channel_id, status } → { rtstreamId, channelId, status }
    if (data.rtstreams) {
      this.rtstreams = data.rtstreams.map(
        (rts: Record<string, unknown>) =>
          new RTStream(this.#vhttp, {
            id: (rts.rtstreamId as string) || (rts.id as string),
            name: (rts.channelId as string) || (rts.name as string),
            collectionId:
              (rts.collectionId as string | undefined) || this.collectionId,
            createdAt: rts.createdAt as string | undefined,
            sampleRate: rts.sampleRate as number | undefined,
            status: rts.status as string | undefined,
            channelId: rts.channelId as string | undefined,
            mediaTypes: rts.mediaTypes as string[] | undefined,
          })
      );
    }
  };

  /**
   * Get RTStream by channel ID
   * @param channelId - The channel ID to search for (e.g., 'mic:default', 'display:1')
   * @returns The RTStream associated with the channel, or null if not found
   *
   * @example
   * ```typescript
   * const mic = session.getRtstream('mic:default');
   * const display = session.getRtstream('display:1');
   *
   * if (mic) {
   *   await mic.startTranscript({ socketId: ws.connectionId });
   * }
   * ```
   */
  public getRtstream = (channelId: string): RTStream | null => {
    return this.rtstreams.find(rts => rts.name === channelId) || null;
  };

  /**
   * String representation of the CaptureSession
   */
  public toString(): string {
    return `CaptureSession(id=${this.id}, collectionId=${this.collectionId}, status=${this.status}, endUserId=${this.endUserId})`;
  }
}

// Re-export the base type
export type { CaptureSessionBase };
