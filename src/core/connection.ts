import { ApiPath, TranscodeMode } from '@/constants';
import { Collection } from '@/core/collection';
import { Meeting } from '@/core/meeting';
import type {
  CollectionBase,
  MeetingBase,
  RecordMeetingConfig,
  VideoConfig,
  AudioConfig,
} from '@/interfaces/core';
import type { FileUploadConfig, URLUploadConfig } from '@/types/collection';
import type { CollectionResponse, GetCollections } from '@/types/response';
import { HttpClient } from '@/utils/httpClient';
import { uploadToServer } from '@/utils/upload';

const {
  collection,
  billing,
  usage,
  invoices,
  rtstream,
  event,
  download,
  search,
  web,
  transcode,
  meeting,
  record,
} = ApiPath;

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
  constructor(baseURL: string, ApiKey: string) {
    this.vhttp = new VdbHttpClient(baseURL, ApiKey);
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
    return new Collection(this.vhttp, res.data as CollectionBase);
  }

  /**
   * Get all Collections from db
   * @returns
   * Returns an array of Collection objects
   */
  public async getCollections(): Promise<Collection[]> {
    const res = await this.vhttp.get<GetCollections>([collection]);
    return res.data.collections.map(
      coll => new Collection(this.vhttp, coll as CollectionBase)
    );
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
    return new Collection(this.vhttp, res.data as CollectionBase);
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
    return new Collection(this.vhttp, res.data as CollectionBase);
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

  /**
   * Check the account usage
   * @returns Usage data
   */
  public checkUsage = async (): Promise<Record<string, unknown>> => {
    const res = await this.vhttp.get<Record<string, unknown>>([billing, usage]);
    return res.data;
  };

  /**
   * Get a list of all invoices
   * @returns List of invoices
   */
  public getInvoices = async (): Promise<unknown[]> => {
    const res = await this.vhttp.get<unknown[]>([billing, invoices]);
    return res.data;
  };

  /**
   * Create an rtstream event
   * @param eventPrompt - Prompt for the event
   * @param label - Label for the event
   * @returns Event ID
   */
  public createEvent = async (
    eventPrompt: string,
    label: string
  ): Promise<string | undefined> => {
    const res = await this.vhttp.post<{ eventId: string }, object>(
      [rtstream, event],
      { eventPrompt, label }
    );
    return res.data?.eventId;
  };

  /**
   * List all rtstream events
   * @returns List of events
   */
  public listEvents = async (): Promise<unknown[]> => {
    const res = await this.vhttp.get<{ events: unknown[] }>([rtstream, event]);
    return res.data?.events || [];
  };

  /**
   * Download a file from a stream link
   * @param streamLink - URL of the stream to download
   * @param name - Name to save the downloaded file as
   * @returns Download response data
   */
  public download = async (
    streamLink: string,
    name: string
  ): Promise<Record<string, unknown>> => {
    const res = await this.vhttp.post<Record<string, unknown>, object>(
      [download],
      { streamLink, name }
    );
    return res.data;
  };

  /**
   * Search for a query on YouTube
   * @param query - Query to search for
   * @param resultThreshold - Number of results to return (optional)
   * @param duration - Duration of the video (optional)
   * @returns List of YouTube search results
   */
  public youtubeSearch = async (
    query: string,
    resultThreshold: number = 10,
    duration: string = 'medium'
  ): Promise<unknown[]> => {
    const res = await this.vhttp.post<{ results: unknown[] }, object>(
      [collection, 'default', search, web],
      {
        query,
        resultThreshold,
        platform: 'youtube',
        duration,
      }
    );
    return res.data?.results || [];
  };

  /**
   * Transcode the video
   * @param source - URL of the video to transcode
   * @param callbackUrl - URL to receive the callback
   * @param mode - Mode of the transcoding
   * @param videoConfig - Video configuration (optional)
   * @param audioConfig - Audio configuration (optional)
   * @returns Transcode job ID
   */
  public transcode = async (
    source: string,
    callbackUrl: string,
    mode: string = TranscodeMode.economy,
    videoConfig: VideoConfig = {},
    audioConfig: AudioConfig = {}
  ): Promise<string | undefined> => {
    const res = await this.vhttp.post<{ jobId: string }, object>([transcode], {
      source,
      callbackUrl,
      mode,
      videoConfig,
      audioConfig,
    });
    return res.data?.jobId;
  };

  /**
   * Get the details of a transcode job
   * @param jobId - ID of the transcode job
   * @returns Details of the transcode job
   */
  public getTranscodeDetails = async (
    jobId: string
  ): Promise<Record<string, unknown>> => {
    const res = await this.vhttp.get<Record<string, unknown>>([
      transcode,
      jobId,
    ]);
    return res.data;
  };

  /**
   * Record a meeting and upload it to the default collection
   * @param config - Meeting recording configuration
   * @returns Meeting object representing the recording bot
   */
  public recordMeeting = async (
    config: RecordMeetingConfig
  ): Promise<Meeting> => {
    const res = await this.vhttp.post<
      MeetingBase & { meetingId: string },
      object
    >([collection, 'default', meeting, record], {
      meetingUrl: config.meetingUrl,
      botName: config.botName,
      botImageUrl: config.botImageUrl,
      meetingTitle: config.meetingTitle,
      callbackUrl: config.callbackUrl,
      callbackData: config.callbackData || {},
      timeZone: config.timeZone || 'UTC',
    });
    return new Meeting(this.vhttp, {
      ...res.data,
      id: res.data.meetingId,
      collectionId: 'default',
    });
  };

  /**
   * Get a meeting by its ID
   * @param meetingId - ID of the meeting
   * @returns Meeting object
   */
  public getMeeting = async (meetingId: string): Promise<Meeting> => {
    const meetingObj = new Meeting(this.vhttp, {
      id: meetingId,
      collectionId: 'default',
    });
    await meetingObj.refresh();
    return meetingObj;
  };
}
