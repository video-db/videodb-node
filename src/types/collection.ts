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

/**
 * Generate a video from a prompt.
 * @param prompt - Prompt for the video generation
 * @param duration - Duration of the video in seconds (default: 5)
 * @param callback_url - Optional URL to receive a callback when generation is complete
 * @returns A Video object containing the generated video metadata
 */

export interface GenerateVideoConfig {
  prompt: string;
  duration?: number;
  callback_url?: string;
}

export type SyncGenerateVideoConfig = Omit<GenerateVideoConfig, 'callback_url'>;

export interface GenerateImageConfig {
  prompt: string;
  aspect_ratio: string;
  callback_url?: string;
}

export type SyncGenerateImageConfig = Omit<GenerateImageConfig, 'callback_url'>;

export interface GenerateMusicConfig {
  prompt: string;
  duration?: number;
  audio_type?: 'music';
  callback_url?: string;
}

export interface GenerateSoundEffectConfig {
  prompt: string;
  duration?: number;
  audio_type?: 'sound_effect';
  config?: object;
  callback_url?: string;
}

export interface GenerateVoiceConfig {
  text: string;
  voice_name?: string;
  audio_type?: 'voice';
  config?: object;
  callback_url?: string;
}

export type GenerateAudioConfig =
  | GenerateMusicConfig
  | GenerateSoundEffectConfig
  | GenerateVoiceConfig;

export type SyncGenerateAudioConfig = Omit<GenerateAudioConfig, 'callback_url'>;

export interface DubVideoConfig {
  video_id: string;
  language_code: string;
  callback_url?: string;
}

export type SyncDubVideoConfig = Omit<DubVideoConfig, 'callback_url'>;
