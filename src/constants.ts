export const SemanticSearchDefaultValues = {
  resultThreshold: 50,
  scoreThreshold: 0.2,
  dynamicScorePercentage: 30,
  namespace: 'dev',
} as const;

export const KeywordSearchDefaultValues = {
  resultThreshold: 50,
  scoreThreshold: 0.2,
  dynamicScorePercentage: 30,
  namespace: 'dev',
} as const;

export const Workflows = {
  addSubtitles: 'add_subtitles',
};

export const ApiPath = {
  collection: 'collection',
  upload: 'upload',
  video: 'video',
  audio: 'audio',
  image: 'image',
  stream: 'stream',
  thumbnail: 'thumbnail',
  upload_url: 'upload_url',
  transcription: 'transcription',
  index: 'index',
  search: 'search',
  compile: 'compile',
  workflow: 'workflow',
  delete: 'delete',
  timeline: 'timeline',
} as const;

export const ResponseStatus = {
  processing: 'processing',
  in_progress: 'in progress',
} as const;

export const HttpClientDefaultValues = {
  max_retries: 3,
  timeout: 60 * 1000,
  backoff_factor: 0.1,
} as const;

export const MaxSupported = {
  fadeDuration: 5,
};

export const VIDEO_DB_API = 'https://api.videodb.io';
export const PLAYER_URL = 'https://console.videodb.io/player';
