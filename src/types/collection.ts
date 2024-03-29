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
