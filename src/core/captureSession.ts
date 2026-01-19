import { ApiPath } from '@/constants';
import { HttpClient } from '@/utils/httpClient';

/**
 * Base interface for CaptureSession data
 */
export interface CaptureSessionBase {
  id: string;
  collectionId: string;
  endUserId?: string;
  clientId?: string;
  status?: string;
}

/**
 * CaptureSession class for managing video capture sessions
 *
 * @example
 * ```typescript
 * const conn = videodb.connect(apiKey);
 * const session = await conn.createCaptureSession('user123', 'client456');
 * const token = await session.generateSessionToken(3600); // 1 hour expiry
 * ```
 */
export class CaptureSession {
  public id: string;
  public collectionId: string;
  public endUserId?: string;
  public clientId?: string;
  public status?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: CaptureSessionBase) {
    this.#vhttp = http;
    this.id = data.id;
    this.collectionId = data.collectionId;
    this.endUserId = data.endUserId;
    this.clientId = data.clientId;
    this.status = data.status;
  }

  /**
   * Generate a session token for the capture session
   * @param expiresIn - Token expiration time in seconds (default: 86400 = 24 hours)
   * @returns The session token string
   */
  public generateSessionToken = async (
    expiresIn: number = 86400
  ): Promise<string> => {
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
   * String representation of the CaptureSession
   */
  public toString(): string {
    return `CaptureSession(id=${this.id}, collectionId=${this.collectionId}, endUserId=${this.endUserId}, clientId=${this.clientId})`;
  }
}
