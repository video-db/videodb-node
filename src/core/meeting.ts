import { ApiPath, MeetingStatus } from '@/constants';
import type { MeetingBase } from '@/interfaces/core';
import { HttpClient } from '@/utils/httpClient';
import { VideodbError } from '@/utils/error';

const DEFAULT_MEETING_TIMEOUT = 14400; // 4 hours
const DEFAULT_POLLING_INTERVAL = 120; // 2 minutes

/**
 * Meeting class representing a meeting recording bot
 */
export class Meeting {
  public id: string;
  public collectionId: string;
  public botName?: string;
  public meetingTitle?: string;
  public meetingUrl?: string;
  public status?: string;
  public timeZone?: string;
  public videoId?: string;
  public speakerTimeline?: Record<string, unknown>;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: MeetingBase) {
    this.#vhttp = http;
    this.id = data.id;
    this.collectionId = data.collectionId;
    this._updateAttributes(data);
  }

  private _updateAttributes(data: Partial<MeetingBase>): void {
    if (data.botName !== undefined) this.botName = data.botName;
    if (data.meetingTitle !== undefined) this.meetingTitle = data.meetingTitle;
    if (data.meetingUrl !== undefined) this.meetingUrl = data.meetingUrl;
    if (data.status !== undefined) this.status = data.status;
    if (data.timeZone !== undefined) this.timeZone = data.timeZone;
    if (data.videoId !== undefined) this.videoId = data.videoId;
    if (data.speakerTimeline !== undefined)
      this.speakerTimeline = data.speakerTimeline;
  }

  /**
   * Refresh meeting data from the server
   * @returns The Meeting instance with updated data
   */
  public refresh = async (): Promise<Meeting> => {
    const res = await this.#vhttp.get<MeetingBase>([
      ApiPath.collection,
      this.collectionId,
      ApiPath.meeting,
      this.id,
    ]);

    if (res.data) {
      this._updateAttributes(res.data);
    } else {
      throw new VideodbError(`Failed to refresh meeting ${this.id}`);
    }

    return this;
  };

  /**
   * Check if the meeting is currently active
   */
  public get isActive(): boolean {
    return (
      this.status === MeetingStatus.initializing ||
      this.status === MeetingStatus.processing
    );
  }

  /**
   * Check if the meeting has completed
   */
  public get isCompleted(): boolean {
    return this.status === MeetingStatus.done;
  }

  /**
   * Wait for the meeting to reach a specific status
   * @param targetStatus - The status to wait for
   * @param timeout - Maximum time to wait in seconds (default: 14400)
   * @param interval - Time between status checks in seconds (default: 120)
   * @returns True if status reached, False if timeout
   */
  public waitForStatus = async (
    targetStatus: string,
    timeout: number = DEFAULT_MEETING_TIMEOUT,
    interval: number = DEFAULT_POLLING_INTERVAL
  ): Promise<boolean> => {
    const startTime = Date.now();
    const timeoutMs = timeout * 1000;
    const intervalMs = interval * 1000;

    while (Date.now() - startTime < timeoutMs) {
      await this.refresh();
      if (this.status === targetStatus) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    return false;
  };
}
