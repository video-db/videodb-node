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
  thumbnails: 'thumbnails',
  upload_url: 'upload_url',
  transcription: 'transcription',
  index: 'index',
  search: 'search',
  compile: 'compile',
  workflow: 'workflow',
  delete: 'delete',
  describe: 'describe',
  scene: 'scene',
  scenes: 'scenes',
  timeline: 'timeline',
  frame: 'frame',
  billing: 'billing',
  usage: 'usage',
  invoices: 'invoices',
  storage: 'storage',
  download: 'download',
  title: 'title',
  rtstream: 'rtstream',
  status: 'status',
  event: 'event',
  alert: 'alert',
  generate_url: 'generate_url',
  generate: 'generate',
  text: 'text',
  web: 'web',
  translate: 'translate',
  dub: 'dub',
  transcode: 'transcode',
  meeting: 'meeting',
  record: 'record',
  reframe: 'reframe',
  editor: 'editor',
  clip: 'clip',
  capture: 'capture',
  session: 'session',
  token: 'token',
  websocket: 'websocket',
  transcript: 'transcript',
  sceneIndex: 'scene_index',
  spokenIndex: 'spoken_index',
  spoken: 'spoken',
  start: 'start',
  stop: 'stop',
  export: 'export',
  // indexing-v2 additions
  indexes: 'indexes',
  records: 'records',
  understand: 'understand',
  ask: 'ask',
  semantic_search: 'semantic-search',
  query: 'query',
  aggregate: 'aggregate',
  job: 'job',
  sandbox: 'sandbox',
  voice_clone: 'voice_clone',
  identities: 'identities',
  merge: 'merge',
  split: 'split',
  async_response: 'async-response',
} as const;

/**
 * Retrieval capabilities an index can be built for (the `use_for` values).
 */
export const IndexCapability = {
  semantic: 'semantic',
  query: 'query',
  aggregate: 'aggregate',
} as const;

/**
 * Field groups that map artifact fields to retrieval capabilities.
 */
export const FieldGroup = {
  semantic: 'semantic',
  fts: 'fts',
  filter: 'filter',
  aggregate: 'aggregate',
  sort: 'sort',
} as const;

/**
 * Compute tier a sandbox can be provisioned at.
 */
export const SandboxTier = {
  small: 'small',
  medium: 'medium',
} as const;

/**
 * Lifecycle status of a sandbox.
 */
export const SandboxStatus = {
  provisioning: 'provisioning',
  active: 'active',
  stopping: 'stopping',
  stopped: 'stopped',
  failed: 'failed',
  alert: 'alert',
} as const;

export const ResponseStatus = {
  processing: 'processing',
  in_progress: 'in progress',
  success: 'success',
  complete: 'complete',
} as const;

export const MeetingStatus = {
  initializing: 'initializing',
  processing: 'processing',
  joined: 'joined',
  done: 'done',
} as const;

export const Segmenter = {
  time: 'time',
  word: 'word',
  sentence: 'sentence',
} as const;

export const SegmentationType = {
  sentence: 'sentence',
  llm: 'llm',
} as const;

export const ReframeMode = {
  simple: 'simple',
  smart: 'smart',
} as const;

export const ReframePreset = {
  vertical: 'vertical',
  square: 'square',
  landscape: 'landscape',
} as const;

export const TranscodeMode = {
  lightning: 'lightning',
  economy: 'economy',
} as const;

export const ResizeMode = {
  crop: 'crop',
  fit: 'fit',
  pad: 'pad',
} as const;

export const MediaType = {
  video: 'video',
  audio: 'audio',
  image: 'image',
} as const;

export interface TextStyleConfig {
  fontsize?: number;
  fontcolor?: string;
  fontcolorExpr?: string;
  alpha?: number;
  font?: string;
  box?: boolean;
  boxcolor?: string;
  boxborderw?: string;
  boxw?: number;
  boxh?: number;
  lineSpacing?: number;
  textAlign?: string;
  yAlign?: string;
  borderw?: number;
  bordercolor?: string;
  expansion?: string;
  basetime?: number;
  fixBounds?: boolean;
  textShaping?: boolean;
  shadowcolor?: string;
  shadowx?: number;
  shadowy?: number;
  tabsize?: number;
  x?: string | number;
  y?: string | number;
}

export class TextStyle implements TextStyleConfig {
  fontsize: number = 24;
  fontcolor: string = 'black';
  fontcolorExpr: string = '';
  alpha: number = 1.0;
  font: string = 'Sans';
  box: boolean = true;
  boxcolor: string = 'white';
  boxborderw: string = '10';
  boxw: number = 0;
  boxh: number = 0;
  lineSpacing: number = 0;
  textAlign: string = 'T';
  yAlign: string = 'text';
  borderw: number = 0;
  bordercolor: string = 'black';
  expansion: string = 'normal';
  basetime: number = 0;
  fixBounds: boolean = false;
  textShaping: boolean = true;
  shadowcolor: string = 'black';
  shadowx: number = 0;
  shadowy: number = 0;
  tabsize: number = 4;
  x: string | number = '(main_w-text_w)/2';
  y: string | number = '(main_h-text_h)/2';

  constructor(config?: Partial<TextStyleConfig>) {
    if (config) {
      Object.assign(this, config);
    }
  }
}

export const HttpClientDefaultValues = {
  max_retries: 3,
  timeout: 60 * 1000,
  backoff_factor: 0.1,
  /** Max time (ms) to poll an async output URL before timing out. */
  maxPollTime: 500 * 1000,
  /** Interval (ms) between polls of an async output URL. */
  pollInterval: 5 * 1000,
} as const;

export const MaxSupported = {
  fadeDuration: 5,
};

export const VIDEO_DB_API = 'https://api.videodb.io';
export const PLAYER_URL = 'https://console.videodb.io/player';
