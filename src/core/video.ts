import {
  ApiPath,
  DefaultIndexType,
  DefaultSearchType,
  Workflows,
} from '@/constants';
import type { IVideo, VideoBase } from '@/interfaces/core';
import { IndexType } from '@/types';
import { SearchType } from '@/types/search';
import type { GenerateStreamResponse } from '@/types/response';
import type { Timeline, Transcript } from '@/types/video';
import { fromCamelToSnake, playStream } from '@/utils';
import { HttpClient } from '@/utils/httpClient';
import { IndexJob, TranscriptJob } from '@/utils/job';
import { SearchFactory } from './search';
import { SubtitleStyle } from './config';

const { video, stream, thumbnail, workflow } = ApiPath;

/**
 * The base Video class
 * @remarks
 * Use this to initialize a video stored in videoDB
 */
export class Video implements IVideo {
  public meta: VideoBase;
  public transcript?: Transcript;
  #vhttp: HttpClient;

  /**
   * Initializes a videoDB Instance
   * @param http - HttpClient object
   * @param data - Data needed to initialize a video instance
   */
  constructor(http: HttpClient, data: VideoBase) {
    this.meta = data;
    this.#vhttp = http;
  }

  /**
   * @param query - Search query
   * @param searchType- [optional] Type of search to be performed
   * @param resultThreshold - [optional] Result Threshold
   * @param scoreThreshold - [optional] Score Threshold
   */
  public search = async (
    query: string,
    searchType?: SearchType,
    resultThreshold?: number,
    scoreThreshold?: number
  ) => {
    const s = new SearchFactory(this.#vhttp);
    const searchFunc = s.getSearch(searchType ?? DefaultSearchType);
    const results = await searchFunc.searchInsideVideo({
      videoId: this.meta.id,
      query: query,
      resultThreshold: resultThreshold,
      scoreThreshold: scoreThreshold,
    });
    return results;
  };

  /**
   * Returns an empty promise that resolves when the video is deleted
   * @returns A promise that resolves when delete is successful
   * @throws an InvalidRequestError if the request fails
   */
  public delete = async () => {
    return await this.#vhttp.delete<Record<string, never>>([
      video,
      this.meta.id,
    ]);
  };

  /**
   * Generates a new streaming URL with the given timeline.
   * @param timeline - Of the format [[start, end], [start, end]...]
   * @returns a streaming URL
   */
  public generateStream = async (timeline?: Timeline) => {
    if (!timeline && this.meta.streamUrl) {
      return this.meta.streamUrl;
    }

    const body: { length: number; timeline?: Timeline } = {
      length: Number(this.meta.length),
    };
    if (timeline) body.timeline = timeline;

    const res = await this.#vhttp.post<GenerateStreamResponse, typeof body>(
      [video, this.meta.id, stream],
      body
    );

    return res.data.stream_url;
  };

  /**
   * Gets the thumbnail of the video or generates one if it doesn't exist.
   * @returns An awaited URL to the video's thumbnail
   */
  public generateThumbnail = async () => {
    if (this.meta.thumbnail) return this.meta.thumbnail;
    const res = await this.#vhttp.get<{ thumbnail: string }>([
      video,
      this.meta.id,
      thumbnail,
    ]);
    this.meta.thumbnail = res.data.thumbnail;
    return res.data.thumbnail;
  };

  /**
   * Fetches the transcript of the video if it exists, generates one
   * if it doesn't.
   * @param forceCreate - Forces transcript generation even if it exists
   * @returns A promise of -
   * - If the transcript exists, an object of the type Transcript
   * - If it doesn't, an instance of TranscriptJob which can be used
   *   to start transcript generation.
   */
  public getTranscript = (forceCreate = false) => {
    if (this.transcript && !forceCreate) return this.transcript;
    const job = new TranscriptJob(this.#vhttp, this.meta.id, forceCreate);
    return job;
  };

  /**
   * Indexs the video with the given indexType
   * @param indexType - The type used to index the video
   * @returns an awaited boolean signifying whether the process
   * was successful or not
   */
  public indexSpokenWords = (indexType?: IndexType) => {
    const indexJob = new IndexJob(
      this.#vhttp,
      this.meta.id,
      indexType ?? DefaultIndexType
    );
    return indexJob;
  };

  /**
   * Overlays subtitles on top of a video
   * @returns an awaited stream url for subtitled overlayed video
   */
  public addSubtitle = async (config: SubtitleStyle = new SubtitleStyle()) => {
    const subtitlePayload = fromCamelToSnake({
      type: Workflows.addSubtitles,
      subtitleStyle: config.toJSON(),
    });
    const res = await this.#vhttp.post<GenerateStreamResponse, object>(
      [video, this.meta.id, workflow],
      subtitlePayload
    );
    return res.data.stream_url;
  };

  /**
   * Generates a new playable stream URL with the given timeline.
   * @returns a URL that can be opened in browser
   */
  public play = () => {
    return playStream(this.meta.streamUrl);
  };
}
