/**
 * Channel classes for managing capture channels with pause/resume functionality
 */

import type { BinaryChannel, TrackTypeValue } from './types';

/**
 * Base Channel class representing a capture channel
 */
export class Channel {
  public readonly id: string;
  public readonly name: string;
  public readonly type: 'audio' | 'video';
  public store: boolean = false;

  /** Reference to the CaptureClient for pause/resume operations */
  #client: ChannelClient | null = null;

  constructor(data: BinaryChannel, client?: ChannelClient) {
    this.id = data.channelId;
    this.name = data.name;
    this.type = data.type;
    this.#client = client ?? null;
  }

  /**
   * Set the client reference for pause/resume operations
   * @internal
   */
  public setClient(client: ChannelClient): void {
    this.#client = client;
  }

  /**
   * Get the track type for this channel
   * @internal
   */
  protected getTrackType(): TrackTypeValue | null {
    // Map channel ID prefix to track type
    if (this.id.startsWith('mic:')) return 'mic';
    if (this.id.startsWith('system_audio:')) return 'system_audio';
    if (this.id.startsWith('display:') || this.id.startsWith('screen:'))
      return 'screen';
    return null;
  }

  /**
   * Pause this channel
   * @throws Error if client is not set or track type is unknown
   */
  public async pause(): Promise<void> {
    if (!this.#client) {
      throw new Error(
        'Channel is not associated with a CaptureClient. Use client.listChannels() to get channels with pause/resume support.'
      );
    }
    const trackType = this.getTrackType();
    if (!trackType) {
      throw new Error(`Cannot determine track type for channel: ${this.id}`);
    }
    await this.#client.pauseTracks([trackType]);
  }

  /**
   * Resume this channel
   * @throws Error if client is not set or track type is unknown
   */
  public async resume(): Promise<void> {
    if (!this.#client) {
      throw new Error(
        'Channel is not associated with a CaptureClient. Use client.listChannels() to get channels with pause/resume support.'
      );
    }
    const trackType = this.getTrackType();
    if (!trackType) {
      throw new Error(`Cannot determine track type for channel: ${this.id}`);
    }
    await this.#client.resumeTracks([trackType]);
  }

  /**
   * Convert channel to dictionary for API requests
   */
  public toDict(): {
    channel_id: string;
    type: string;
    name: string;
    record: boolean;
    store: boolean;
  } {
    return {
      channel_id: this.id,
      type: this.type,
      name: this.name,
      record: true,
      store: this.store,
    };
  }

  toString(): string {
    return `Channel(id=${this.id}, name=${this.name}, type=${this.type})`;
  }
}

/**
 * Audio channel class for microphone and system audio
 */
export class AudioChannel extends Channel {
  constructor(data: BinaryChannel, client?: ChannelClient) {
    super(data, client);
  }

  toString(): string {
    return `AudioChannel(id=${this.id}, name=${this.name})`;
  }
}

/**
 * Video channel class for screen/display capture
 */
export class VideoChannel extends Channel {
  constructor(data: BinaryChannel, client?: ChannelClient) {
    super(data, client);
  }

  toString(): string {
    return `VideoChannel(id=${this.id}, name=${this.name})`;
  }
}

/**
 * List subclass with a default property for channel collections
 */
export class ChannelList<T extends Channel> extends Array<T> {
  /**
   * Get the first (default) channel, or undefined if empty
   */
  get default(): T | undefined {
    return this[0];
  }
}

/**
 * Container for available channels, grouped by type
 */
export class Channels {
  /** Microphone channels */
  public mics: ChannelList<AudioChannel>;
  /** Display/screen channels */
  public displays: ChannelList<VideoChannel>;
  /** System audio channels */
  public systemAudio: ChannelList<AudioChannel>;

  constructor(
    mics: AudioChannel[] = [],
    displays: VideoChannel[] = [],
    systemAudio: AudioChannel[] = []
  ) {
    this.mics = new ChannelList<AudioChannel>(...mics);
    this.displays = new ChannelList<VideoChannel>(...displays);
    this.systemAudio = new ChannelList<AudioChannel>(...systemAudio);
  }

  /**
   * Return a flat list of all channels
   */
  public all(): Channel[] {
    return [
      ...Array.from(this.mics),
      ...Array.from(this.displays),
      ...Array.from(this.systemAudio),
    ];
  }

  toString(): string {
    return `Channels(mics=${this.mics.length}, displays=${this.displays.length}, systemAudio=${this.systemAudio.length})`;
  }
}

/**
 * Interface for the CaptureClient methods needed by Channel
 * This avoids circular dependency with CaptureClient
 */
export interface ChannelClient {
  pauseTracks(tracks: TrackTypeValue[]): Promise<void>;
  resumeTracks(tracks: TrackTypeValue[]): Promise<void>;
}

/**
 * Factory function to create typed channels from binary channel data
 */
export function createChannel(
  data: BinaryChannel,
  client?: ChannelClient
): Channel {
  if (data.type === 'audio') {
    return new AudioChannel(data, client);
  }
  return new VideoChannel(data, client);
}

/**
 * Group channels by type into a Channels container
 */
export function groupChannels(
  channels: Array<BinaryChannel & Record<string, unknown>>,
  client?: ChannelClient
): Channels {
  const mics: AudioChannel[] = [];
  const displays: VideoChannel[] = [];
  const systemAudio: AudioChannel[] = [];

  for (const ch of channels) {
    const channelId = ch.channelId;

    if (channelId.startsWith('mic:')) {
      mics.push(new AudioChannel(ch, client));
    } else if (
      channelId.startsWith('display:') ||
      channelId.startsWith('screen:')
    ) {
      displays.push(new VideoChannel(ch, client));
    } else if (channelId.startsWith('system_audio:')) {
      systemAudio.push(new AudioChannel(ch, client));
    } else if (ch.type === 'audio') {
      // Fallback for unknown audio channels
      mics.push(new AudioChannel(ch, client));
    } else {
      // Fallback for unknown video channels
      displays.push(new VideoChannel(ch, client));
    }
  }

  return new Channels(mics, displays, systemAudio);
}
