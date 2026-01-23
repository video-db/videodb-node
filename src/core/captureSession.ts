import { ApiPath } from '@/constants';
import { RTStream } from '@/core/rtstream';
import type { CaptureSessionBase, RTStreamBase } from '@/interfaces/core';
import type { CaptureSessionStatusType } from '@/types/capture';
import { HttpClient } from '@/utils/httpClient';

/**
 * RTStream category for filtering
 */
export type RTStreamCategory = 'mics' | 'displays' | 'system_audio' | 'cameras';

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
 * // Generate client token (account-scoped, can be used for WS too)
 * const token = await conn.generateClientToken(86400);
 *
 * // After capture starts, refresh to get RTStreams
 * await session.refresh();
 * const mics = session.getRTStream('mics');
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
   * Get RTStreams by category
   * @param category - Category to filter by ('mics', 'displays', 'system_audio', 'cameras')
   * @returns Array of RTStream objects matching the category
   *
   * @example
   * ```typescript
   * const mics = session.getRTStream('mics');
   * const displays = session.getRTStream('displays');
   * const systemAudio = session.getRTStream('system_audio');
   *
   * if (mics.length > 0) {
   *   await mics[0].startTranscript(ws.connectionId);
   * }
   * ```
   */
  public getRTStream = (category: RTStreamCategory): RTStream[] => {
    const filtered: RTStream[] = [];

    for (const rts of this.rtstreams) {
      const name = (rts.name || '').toLowerCase();
      let isMatch = false;

      if (category === 'mics' && name.includes('mic')) {
        isMatch = true;
      } else if (
        category === 'displays' &&
        (name.includes('screen') || name.includes('display'))
      ) {
        isMatch = true;
      } else if (category === 'system_audio' && name.includes('system')) {
        isMatch = true;
      } else if (category === 'cameras' && name.includes('camera')) {
        isMatch = true;
      }

      if (isMatch) {
        filtered.push(rts);
      }
    }

    return filtered;
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
