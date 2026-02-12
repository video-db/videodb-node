import { SubtitleStyleProps, TextStyleProps } from '@/types/config';

export enum SubtitleBorderStyle {
  noBorder = 1,
  opaqueBox = 3,
  outline = 4,
}

export enum SubtitleAlignment {
  bottomLeft = 1,
  bottomCenter = 2,
  bottomRight = 3,
  middleLeft = 4,
  middleCenter = 5,
  middleRight = 6,
  topLeft = 7,
  topCenter = 8,
  topRight = 9,
}

export const SubtitleStyleDefaultValues: SubtitleStyleProps = {
  fontName: 'Arial',
  fontSize: 18,
  primaryColour: '&H00FFFFFF', // white
  secondaryColour: '&H000000FF', // blue
  outlineColour: '&H00000000', // black
  backColour: '&H00000000', // black
  bold: false,
  italic: false,
  underline: false,
  strikeOut: false,
  scaleX: 1.0,
  scaleY: 1.0,
  spacing: 0,
  angle: 0,
  borderStyle: SubtitleBorderStyle.outline,
  outline: 1.0,
  shadow: 0.0,
  alignment: SubtitleAlignment.bottomCenter,
  marginL: 10,
  marginR: 10,
  marginV: 10,
};

/**
 * SubtitleStyle class with defaults matching Python SDK
 */
export class SubtitleStyle implements SubtitleStyleProps {
  fontName: string = 'Arial';
  fontSize: number = 18;
  primaryColour: string = '&H00FFFFFF';
  secondaryColour: string = '&H000000FF';
  outlineColour: string = '&H00000000';
  backColour: string = '&H00000000';
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;
  strikeOut: boolean = false;
  scaleX: number = 1.0;
  scaleY: number = 1.0;
  spacing: number = 0;
  angle: number = 0;
  borderStyle: number = SubtitleBorderStyle.outline;
  outline: number = 1.0;
  shadow: number = 0.0;
  alignment: number = SubtitleAlignment.bottomCenter;
  marginL: number = 10;
  marginR: number = 10;
  marginV: number = 10;

  constructor(config?: Partial<SubtitleStyleProps>) {
    if (config) {
      Object.assign(this, config);
    }
  }
}

/**
 * VideoConfig class for transcoding configuration
 */
export class VideoConfigClass {
  resolution?: number;
  quality: number = 23;
  framerate?: number;
  aspectRatio?: string;
  resizeMode: string = 'crop';

  constructor(config?: {
    resolution?: number;
    quality?: number;
    framerate?: number;
    aspectRatio?: string;
    resizeMode?: string;
  }) {
    if (config) {
      if (config.resolution !== undefined) this.resolution = config.resolution;
      if (config.quality !== undefined) this.quality = config.quality;
      if (config.framerate !== undefined) this.framerate = config.framerate;
      if (config.aspectRatio !== undefined)
        this.aspectRatio = config.aspectRatio;
      if (config.resizeMode !== undefined) this.resizeMode = config.resizeMode;
    }
  }
}

/**
 * AudioConfig class for transcoding configuration
 */
export class AudioConfigClass {
  mute: boolean = false;

  constructor(config?: { mute?: boolean }) {
    if (config) {
      if (config.mute !== undefined) this.mute = config.mute;
    }
  }
}

export const TextStyleDefaultValues: TextStyleProps = {
  fontsize: 24,
  fontcolor: 'black',
  fontcolorExpr: '',
  alpha: 1.0,
  font: 'Sans',
  box: true,
  boxcolor: 'white',
  boxborderw: '10',
  boxw: 0,
  boxh: 0,
  lineSpacing: 0,
  textAlign: 'T',
  yAlign: 'text',
  borderw: 0,
  bordercolor: 'black',
  expansion: 'normal',
  basetime: 0,
  fixBounds: false,
  textShaping: true,
  shadowcolor: 'black',
  shadowx: 0,
  shadowy: 0,
  tabsize: 4,
  x: '(main_w-text_w)/2',
  y: '(main_h-text_h)/2',
};

export enum SearchTypeValues {
  keyword = 'keyword',
  semantic = 'semantic',
  scene = 'scene',
  llm = 'llm',
}

export enum IndexTypeValues {
  spoken = 'spoken_word',
  scene = 'scene',
}

export const DefaultSearchType = SearchTypeValues.semantic;
export const DefaultIndexType = IndexTypeValues.spoken;

export const SceneExtractionType = {
  shotBased: 'shot',
  timeBased: 'time',
  transcript: 'transcript',
};
