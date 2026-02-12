import { ApiPath, Segmenter } from '@/constants';
import type { AudioBase, IAudio } from '@/interfaces/core';
import { HttpClient } from '@/utils/httpClient';

const { audio, generate_url, transcription } = ApiPath;

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptResponse {
  wordTimestamps?: TranscriptSegment[];
  text?: string;
}

/**
 * The base Audio class
 * @remarks
 * Use this to initialize an audio stored in VideoDB
 */
export class Audio implements IAudio {
  public readonly id: string;
  public readonly collectionId: string;
  public readonly length: string;
  public readonly name: string;
  public readonly size: string;
  public readonly userId: string;
  public transcript?: TranscriptSegment[];
  public transcriptText?: string;
  #vhttp: HttpClient;

  /**
   * Initializes a VideoDB Instance
   * @param http - HttpClient object
   * @param data - Data needed to initialize an audio instance
   */
  constructor(http: HttpClient, data: AudioBase) {
    this.id = data.id;
    this.collectionId = data.collectionId;
    this.length = data.length;
    this.name = data.name;
    this.size = data.size;
    this.userId = data.userId;
    this.#vhttp = http;
  }

  /**
   * Returns an empty promise that resolves when the audio is deleted
   * @returns A promise that resolves when delete is successful
   * @throws an InvalidRequestError if the request fails
   */
  public delete = async () => {
    return await this.#vhttp.delete<Record<string, never>>([audio, this.id]);
  };

  /**
   * Generate the signed url of the audio
   * @returns The signed url of the audio
   */
  public generateUrl = async (): Promise<string | null> => {
    const res = await this.#vhttp.post<{ signedUrl: string }, object>(
      [audio, this.id, generate_url],
      {},
      { params: { collection_id: this.collectionId } }
    );
    return res.data?.signedUrl || null;
  };

  /**
   * Internal method to fetch transcript
   */
  private _fetchTranscript = async (
    start?: number,
    end?: number,
    segmenter: string = Segmenter.word,
    length: number = 1,
    force?: boolean
  ): Promise<void> => {
    if (this.transcript && !force && !start && !end) {
      return;
    }
    const res = await this.#vhttp.get<TranscriptResponse>(
      [audio, this.id, transcription],
      {
        params: {
          start,
          end,
          segmenter,
          length,
          force: force ? 'true' : 'false',
        },
      }
    );
    this.transcript = res.data?.wordTimestamps || [];
    this.transcriptText = res.data?.text || '';
  };

  /**
   * Get timestamped transcript segments for the audio
   * @param start - Start time in seconds
   * @param end - End time in seconds
   * @param segmenter - Segmentation type (word, sentence, time)
   * @param length - Length of segments when using time segmenter
   * @param force - Force fetch new transcript
   * @returns List of transcript segments
   */
  public getTranscript = async (
    start?: number,
    end?: number,
    segmenter: string = Segmenter.word,
    length: number = 1,
    force?: boolean
  ): Promise<TranscriptSegment[]> => {
    await this._fetchTranscript(start, end, segmenter, length, force);
    return this.transcript || [];
  };

  /**
   * Get plain text transcript for the audio
   * @param start - Start time in seconds
   * @param end - End time in seconds
   * @returns Full transcript text as string
   */
  public getTranscriptText = async (
    start?: number,
    end?: number
  ): Promise<string> => {
    await this._fetchTranscript(start, end);
    return this.transcriptText || '';
  };

  /**
   * Generate transcript for the audio
   * @param force - Force generate new transcript
   * @param languageCode - Language code of the spoken audio
   * @returns Success dict if transcript generated
   */
  public generateTranscript = async (
    force?: boolean,
    languageCode?: string
  ): Promise<{ success: boolean; message: string } | TranscriptResponse> => {
    const res = await this.#vhttp.post<TranscriptResponse, object>(
      [audio, this.id, transcription],
      { force: !!force, language_code: languageCode }
    );
    const transcript = res.data?.wordTimestamps;
    if (transcript && transcript.length > 0) {
      return {
        success: true,
        message: 'Transcript generated successfully',
      };
    }
    return res.data;
  };
}
