import { ApiPath, DefaultSearchType } from '@/constants';
import type { CollectionBase, ICollection, VideoBase } from '@/interfaces/core';
import { SearchType } from '@/types';
import type { FileUploadConfig, URLUploadConfig } from '@/types/collection';
import type { GetVideos, VideoResponse } from '@/types/response';
import { fromSnakeToCamel } from '@/utils';
import { HttpClient } from '@/utils/httpClient';
import { uploadToServer } from '@/utils/upload';
import { SearchFactory } from './search';
import { Video } from './video';

const { video } = ApiPath;

/**
 * The base VideoDB class
 * @remarks
 * The base class through which all videodb actions are possible
 */
export class Collection implements ICollection {
  public meta: CollectionBase;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: CollectionBase) {
    this.meta = data;
    this.#vhttp = http;
  }

  /**
   * Get all videos from the collection
   * @returns A list of objects of the Video class
   * @throws an error if the request fails
   */
  public getVideos = async () => {
    const res = await this.#vhttp.get<GetVideos>([video]);
    const videos = res.data.videos;
    return videos.map(vid => {
      const data = fromSnakeToCamel(vid) as VideoBase;
      return new Video(this.#vhttp, data);
    });
  };

  /**
   * Get all the information for a specific video
   * @param videoId - Unique ID of the video.
   * @returns An object of the Video class
   * @throws an error if the request fails
   */
  public getVideo = async (videoId: string) => {
    const res = await this.#vhttp.get<VideoResponse>([video, videoId]);
    const data = fromSnakeToCamel(res.data) as VideoBase;
    return new Video(this.#vhttp, data);
  };

  /**
   *
   * @param videoId - Id of the video to be deleted
   * @returns A promise that resolves when delete is successful
   * @throws an error if the request fails
   */
  public deleteVideo = async (videoId: string) => {
    return await this.#vhttp.delete<Record<string, never>>([video, videoId]);
  };

  /**
   * @param filePath - absolute path to a file
   * @param callbackUrl- [optional] A url that will be called once upload is finished
   * @param name - [optional] Name of the file
   * @param description - [optional] Description of the file
   *
   * @see
   * Providing a callbackUrl will return undefined and not providing one
   * will return a Job object (TODO: Implement proper type for this condition)
   */
  public uploadFile = async (data: FileUploadConfig) => {
    return uploadToServer(this.#vhttp, this.meta.id, data);
  };

  /**
   * @param URL - URL of the hosted file
   * @param callbackUrl- [optional] A url that will be called once upload is finished
   * @param name - [optional] Name of the file
   * @param description - [optional] Description of the file
   *
   * @see
   * Providing a callbackUrl will return undefined and not providing one
   * will return a Job object (TODO: Implement proper type for this condition)
   */
  public uploadURL = async (data: URLUploadConfig) => {
    return uploadToServer(this.#vhttp, this.meta.id, data);
  };

  /**
   * @param query - Search query
   * @param type - [optional] Type of search to be performed
   * @param resultThreshold - [optional] Result Threshold
   * @param scoreThreshold - [optional] Score Threshold
   */
  public search = async (
    query: string,
    type?: SearchType,
    resultThreshold?: number,
    scoreThreshold?: number
  ) => {
    const s = new SearchFactory(this.#vhttp);
    const searchFunc = s.getSearch(type ?? DefaultSearchType);

    const results = await searchFunc.searchInsideCollection({
      collectionId: this.meta.id,
      query: query,
      resultThreshold: resultThreshold,
      scoreThreshold: scoreThreshold,
    });
    return results;
  };
}
