import { ApiPath } from '@/constants';
import { HttpClient } from '@/utils/httpClient';

const { voice_clone } = ApiPath;

/**
 * Plain-data shape a {@link VoiceClone} is constructed from.
 * Keys are camelCase (responses are auto-converted from snake_case).
 */
export interface VoiceCloneBase {
  id?: string;
  voiceCloneId?: string;
  refAudioId?: string;
  refText?: string;
  name?: string;
  description?: string;
  language?: string;
  collectionId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * A reusable cloned voice reference backed by a VideoDB audio asset.
 * Mirrors `videodb.voice_clone.VoiceClone`.
 *
 * Create/list/get via {@link Connection} or {@link Collection}.
 */
export class VoiceClone {
  public id?: string;
  public refAudioId?: string;
  public refText?: string;
  public name?: string;
  public description?: string;
  public language?: string;
  public collectionId?: string;
  public status?: string;
  public createdAt?: string;
  public updatedAt?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: VoiceCloneBase = {}) {
    this.#vhttp = http;
    this.id = data.voiceCloneId ?? data.id;
    this.refAudioId = data.refAudioId;
    this.refText = data.refText;
    this.name = data.name;
    this.description = data.description;
    this.language = data.language;
    this.collectionId = data.collectionId;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  #update = (data?: VoiceCloneBase): void => {
    if (!data) return;
    this.id = data.voiceCloneId ?? data.id ?? this.id;
    this.refAudioId = data.refAudioId ?? this.refAudioId;
    this.refText = data.refText ?? this.refText;
    this.name = data.name ?? this.name;
    this.description = data.description ?? this.description;
    this.language = data.language ?? this.language;
    this.collectionId = data.collectionId ?? this.collectionId;
    this.status = data.status ?? this.status;
    this.createdAt = data.createdAt ?? this.createdAt;
    this.updatedAt = data.updatedAt ?? this.updatedAt;
  };

  /**
   * Fetch latest voice clone state from the server.
   */
  public refresh = async (): Promise<VoiceClone> => {
    const res = await this.#vhttp.get<VoiceCloneBase>([
      voice_clone,
      this.id ?? '',
    ]);
    this.#update(res.data);
    return this;
  };

  /**
   * Delete this voice clone.
   */
  public delete = async (): Promise<void> => {
    await this.#vhttp.delete([voice_clone, this.id ?? '']);
  };

  public toString(): string {
    return `VoiceClone(id=${this.id}, name=${this.name}, refAudioId=${this.refAudioId}, status=${this.status})`;
  }
}
