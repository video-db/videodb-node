import { ApiPath } from '@/constants';
import { Collection } from '@/core/collection';
import type { CollectionBase } from '@/interfaces/core';
import type { FileUploadConfig, URLUploadConfig } from '@/types/collection';
import type { CollectionResponse, GetCollections } from '@/types/response';
import { fromSnakeToCamel } from '@/utils';
import { HttpClient } from '@/utils/httpClient';
import { uploadToServer } from '@/utils/upload';

const { collection } = ApiPath;

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
  public vhttp: HttpClient;
  public apiKey?: string;
  public sessionToken?: string;
  constructor(baseURL: string, apiKey?: string, sessionToken?: string) {
    // Determine which token to use
    const accessToken = apiKey || sessionToken;
    if (!accessToken) {
      throw new Error(
        "No authentication provided. Set an API key or provide apiKey/sessionToken as an argument."
      );
    }
    this.apiKey = apiKey;
    this.sessionToken = sessionToken;
    this.vhttp = new VdbHttpClient(baseURL, accessToken);
  }

  /**
   * Get an instance of the Collection class
   * @param id - [Optional] ID of the collection
   * @returns
   * If ID is provided, returns the corresponding collection,
   * else returns the default collection.
   */
  public async getCollection(id = 'default'): Promise<Collection> {
    const res = await this.vhttp.get<CollectionResponse>([collection, id]);
    const convertedData = fromSnakeToCamel(res.data) as CollectionBase;
    const _collection = new Collection(this.vhttp, convertedData);
    return _collection;
  }

  /**
   * Get all Collections from db
   * @returns
   * Returns an array of Collection objects 
   */
  public async getCollections(): Promise<Collection[]> {
    const res = await this.vhttp.get<GetCollections>([collection]);
    const collectionsResponse = fromSnakeToCamel(res.data);
    const collections = collectionsResponse.collections.map(_collection => {
      const convertedData = fromSnakeToCamel(_collection) as CollectionBase;
      return new Collection(this.vhttp, convertedData);
    });
    return collections;
  }

  /**
   * Create a new collection
   * @param name - Name of the collection
   * @param description - Description of the collection
   * @returns
   * Returns a new Collection object
   */
  public createCollection = async (name: string, description: string) => {
    const res = await this.vhttp.post<CollectionResponse, object>(
      [collection],
      {
        name,
        description,
      }
    );
    const convertedData = fromSnakeToCamel(res.data) as CollectionBase;
    return new Collection(this.vhttp, convertedData);
  };

  /**
   * Update a collection
   * @param id - ID of the collection
   * @param name - Name of the collection
   * @param desscription - Description of the collection
   * @returns
   * Returns an updated Collection object
   */
  public async updateCollection(
    id: string,
    name: string,
    description: string
  ): Promise<Collection> {
    const res = await this.vhttp.patch<CollectionResponse, object>(
      [collection, id],
      {
        name,
        description,
      }
    );
    const convertedData = fromSnakeToCamel(res.data) as CollectionBase;
    return new Collection(this.vhttp, convertedData);
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
    return uploadToServer(this.vhttp, collectionId, data);
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
    return uploadToServer(this.vhttp, collectionId, data);
  };
}
