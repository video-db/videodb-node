import type { Audio } from '@/core/audio';
import type { Image } from '@/core/image';
import type { Video } from '@/core/video';

export interface CommonUploadConfig {
  name?: string;
  description?: string;
  callbackUrl?: string;
  mediaType?: 'audio' | 'video' | 'image';
}

export interface FileUploadConfig extends CommonUploadConfig {
  filePath: string;
}

export interface URLUploadConfig extends CommonUploadConfig {
  url: string;
}

export type UploadConfig = FileUploadConfig | URLUploadConfig;

export type SyncUploadConfig = Omit<URLUploadConfig, 'callbackUrl'>;

type UploadedMedia<C> = C extends { mediaType: 'video' }
  ? Video
  : C extends { mediaType: 'audio' }
    ? Audio
    : C extends { mediaType: 'image' }
      ? Image
      : Video | Audio | Image;

/**
 * What an upload resolves to: narrowed by `mediaType`, and `undefined` when a
 * `callbackUrl` makes the upload asynchronous.
 */
export type UploadResult<C extends CommonUploadConfig> =
  'callbackUrl' extends keyof C
    ? C['callbackUrl'] extends string
      ? undefined
      : [C['callbackUrl']] extends [undefined]
        ? UploadedMedia<C>
        : UploadedMedia<C> | undefined
    : UploadedMedia<C>;
