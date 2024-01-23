import { Collection } from '@/core/collection';
import type { CollectionBase } from '@/interfaces/core';
import type { FileUploadConfig, URLUploadConfig } from '@/types/collection';
import type { CollectionResponse } from '@/types/response';
import { fromSnakeToCamel } from '@/utils';
import { HttpClient } from '@/utils/httpClient';
import { uploadToServer } from '@/utils/upload';

class VdbHttpClient extends HttpClient {
  constructor(baseURL: string, apiKey: string) {
    super(baseURL, apiKey);
  }
}

/**
 * Initalizon precedes connection
 * establishment. Is used to get the
 * primary collection.
 */
export class Connection {
  #vhttp: HttpClient;
  constructor(baseURL: string, ApiKey: string) {
    this.#vhttp = new VdbHttpClient(baseURL, ApiKey);
  }

  /**
   * Get an instance of the Collection class
   * @param id - [Optional] ID of the collection
   * @returns
   * If ID is provided, returns the corresponding collection,
   * else returns the default collection.
   */
  public async getCollection(id = 'default'): Promise<Collection> {
    const res = await this.#vhttp.get<CollectionResponse>(['collection', id]);
    const convertedData = fromSnakeToCamel(res.data) as CollectionBase;
    const collection = new Collection(this.#vhttp, convertedData);
    return collection;
  }

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
  public uploadFile = async (
    collectionId: string = 'default',
    data: FileUploadConfig
  ) => {
    return uploadToServer(this.#vhttp, collectionId, data);
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
  public uploadURL = async (
    collectionId: string = 'default',
    data: URLUploadConfig
  ) => {
    return uploadToServer(this.#vhttp, collectionId, data);
  };
}
