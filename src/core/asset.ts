import { MaxSupported } from '@/constants';
import { AudioAssetConfig, VideoAssetConfig } from '@/types/assets';

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
  public end?: number;

  /**
   * Initializes a AudioAsset instance
   * @param assetId - The id of the audio asset.
   * @param config - The configuration of the audio asset.
   * @returns A new AudioAsset instance.
   */
  constructor(assetId: string, config?: VideoAssetConfig) {
    const { start = 0, end } = config || {};
    super(assetId);
    this.start = start;
    this.end = end;
  }

  toJSON() {
    return {
      assetId: this.assetId,
      start: this.start,
      ...(this.end !== undefined && { end: this.end }),
    };
  }
}

/**
 * AudioAsset class
 */
export class AudioAsset extends MediaAsset {
  public start: number;
  public end?: number;
  public disableOtherTracks: boolean;
  public fadeInDuration: number;
  public fadeOutDuration: number;

  /**
   * Initializes a AudioAsset instance
   * @param assetId - The id of the audio asset.
   * @param config - The configuration of the audio asset.
   * @returns A new AudioAsset instance.
   */
  constructor(assetId: string, config?: AudioAssetConfig) {
    const {
      start = 0,
      end,
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
      assetId: this.assetId,
      start: this.start,
      ...(this.end !== undefined && { end: this.end }),
      disableOtherTracks: this.disableOtherTracks,
      fadeInDuration: this.fadeInDuration,
      fadeOutDuration: this.fadeOutDuration,
    };
  }
}
