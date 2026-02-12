import { MaxSupported } from '@/constants';
import {
  AudioAssetConfig,
  VideoAssetConfig,
  ImageAssetConfig,
  TextAssetConfig,
  TextStyleProps,
} from '@/types/config';
import { v4 as uuidv4 } from 'uuid';
import { TextStyleDefaultValues } from './config';

const validateMaxSupport = (
  duration: number,
  maxDuration: number,
  attribute: string
): number => {
  if (!duration) {
    return 0;
  } else if (duration > maxDuration) {
    console.log(
      `${attribute}: ${duration} is greater than max supported: ${maxDuration}`
    );
  }
  return duration;
};

/**
 * The base MediaAsset class
 */
class MediaAsset {
  public assetId: string;

  constructor(assetId: string) {
    this.assetId = assetId;
  }
}

/**
 * VideoAsset class
 */
export class VideoAsset extends MediaAsset {
  public start: number;
  public end: number | null;

  /**
   * Initializes a AudioAsset instance
   * @param assetId - The id of the audio asset.
   * @param config - The configuration of the audio asset.
   * @returns A new AudioAsset instance.
   */
  constructor(assetId: string, config?: Partial<VideoAssetConfig>) {
    const { start = 0, end = null } = config || {};
    super(assetId);
    this.start = start;
    this.end = end;
  }

  toJSON() {
    return {
      asset_id: this.assetId,
      start: this.start,
      end: this.end,
    };
  }
}

/**
 * AudioAsset class
 */
export class AudioAsset extends MediaAsset {
  public start: number;
  public end: number | null;
  public disableOtherTracks: boolean;
  public fadeInDuration: number;
  public fadeOutDuration: number;

  /**
   * Initializes a AudioAsset instance
   * @param assetId - The id of the audio asset.
   * @param config - The configuration of the audio asset.
   * @returns A new AudioAsset instance.
   */
  constructor(assetId: string, config?: Partial<AudioAssetConfig>) {
    const {
      start = 0,
      end = null,
      disableOtherTracks = true,
      fadeInDuration = 0,
      fadeOutDuration = 0,
    } = config || {};
    super(assetId);
    this.start = start;
    this.end = end;
    this.disableOtherTracks = disableOtherTracks;
    this.fadeInDuration = validateMaxSupport(
      fadeInDuration,
      MaxSupported.fadeDuration,
      'fadeInDuration'
    );
    this.fadeOutDuration = validateMaxSupport(
      fadeOutDuration,
      MaxSupported.fadeDuration,
      'fadeOutDuration'
    );
  }

  toJSON() {
    return {
      asset_id: this.assetId,
      start: this.start,
      disable_other_tracks: this.disableOtherTracks,
      fade_in_duration: this.fadeInDuration,
      fade_out_duration: this.fadeOutDuration,
      end: this.end,
    };
  }
}

export class ImageAsset extends MediaAsset {
  public width: number | string;
  public height: number | string;
  public x: number | string;
  public y: number | string;
  public duration: number | null;

  constructor(assetId: string, config?: Partial<ImageAssetConfig>) {
    const {
      width = 100,
      height = 100,
      x = 80,
      y = 20,
      duration = null,
    } = config || {};
    super(assetId);
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.duration = duration;
  }

  toJSON() {
    return {
      asset_id: this.assetId,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      duration: this.duration,
    };
  }
}

export class TextAsset extends MediaAsset {
  public text: string;
  public duration: number | null;
  public style: Partial<TextStyleProps>;

  constructor(config?: Partial<TextAssetConfig>) {
    const { text = '', style = {}, duration = null } = config || {};
    const assetId: string = `txt-${uuidv4()}`;
    super(assetId);
    this.text = text;
    this.duration = duration;
    this.style = Object.assign({}, TextStyleDefaultValues, style);
  }

  toJSON() {
    return {
      asset_id: this.assetId,
      text: this.text,
      style: { ...this.style },
      duration: this.duration,
    };
  }
}
