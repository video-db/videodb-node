import { ApiPath } from '@/constants';
import { GenerateStreamResponse } from '@/types/response';
import { HttpClient } from '@/utils/httpClient';
import { AudioAsset, VideoAsset, ImageAsset, TextAsset } from './asset';
import { Connection } from './connection';
import { ITimeline } from '@/interfaces/core';

const { timeline } = ApiPath;

export class Timeline implements ITimeline {
  #vhttp: HttpClient;
  public timeline: Array<object>;
  public streamUrl: string;
  public playerUrl: string;

  /**
   * Initialize a timeline object
   * @param connection - Connection object. See [[Connection]]
   * @returns Timeline object
   */
  constructor(connection: Connection) {
    this.#vhttp = connection.vhttp;
    this.timeline = [];
    this.streamUrl = '';
    this.playerUrl = '';
  }

  private getRequestData() {
    return {
      requestType: 'compile',
      timeline: this.timeline,
    };
  }

  /**
   * Adds a VideoAsset to the timeline in inline position
   * @param asset - VideoAsset object. Can be created using [[VideoAsset]]
   */
  addInline(asset: VideoAsset): void {
    if (!(asset instanceof VideoAsset)) {
      throw new Error('Asset is not an VideoAsset');
    }
    this.timeline.push(asset.toJSON());
  }

  /**
   * Adds a AudioAsset to the timeline in overlay position
   * @param start - Start time of the overlay w.r.t Base Timline
   * @param asset - AudioAsset, ImageAsset or TextAsset object.
   */
  addOverlay(start: number, asset: AudioAsset | ImageAsset | TextAsset): void {
    if (
      !(asset instanceof AudioAsset) &&
      !(asset instanceof ImageAsset) &&
      !(asset instanceof TextAsset)
    ) {
      throw new Error(
        'asset must be of type AudioAsset, ImageAsset or TextAsset'
      );
    }
    this.timeline.push({ ...asset.toJSON(), overlayStart: start });
  }

  /**
   * Generates a Streaming URL for the Timeline object
   * @returns An await URL to the timeline stream
   */
  async generateStream(): Promise<string> {
    const reqData = this.getRequestData();
    const streamDataRes = await this.#vhttp.post<
      GenerateStreamResponse,
      typeof reqData
    >([timeline], reqData);

    this.streamUrl = streamDataRes.data.streamUrl;
    this.playerUrl = streamDataRes.data.playerUrl;
    return this.streamUrl;
  }
}
