import { ApiPath } from '@/constants';
import { HttpClient } from '@/utils/httpClient';
import type { Connection } from './connection';

export const AssetType = {
  video: 'video',
  image: 'image',
  audio: 'audio',
  text: 'text',
  caption: 'caption',
} as const;
export type AssetType = (typeof AssetType)[keyof typeof AssetType];

export const Fit = {
  crop: 'crop',
  cover: 'cover',
  contain: 'contain',
  none: null,
} as const;
export type Fit = (typeof Fit)[keyof typeof Fit];

export const Position = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  center: 'center',
  topLeft: 'top_left',
  topRight: 'top_right',
  bottomLeft: 'bottom_left',
  bottomRight: 'bottom_right',
} as const;
export type Position = (typeof Position)[keyof typeof Position];

export const Filter = {
  blur: 'blur',
  boost: 'boost',
  contrast: 'contrast',
  darken: 'darken',
  greyscale: 'greyscale',
  lighten: 'lighten',
  muted: 'muted',
  negative: 'negative',
} as const;
export type Filter = (typeof Filter)[keyof typeof Filter];

export const TextAlignment = {
  top: 'top',
  topRight: 'top_right',
  right: 'right',
  bottomRight: 'bottom_right',
  bottom: 'bottom',
  bottomLeft: 'bottom_left',
  left: 'left',
  topLeft: 'top_left',
  center: 'center',
} as const;
export type TextAlignment = (typeof TextAlignment)[keyof typeof TextAlignment];

export const HorizontalAlignment = {
  left: 'left',
  center: 'center',
  right: 'right',
} as const;
export type HorizontalAlignment =
  (typeof HorizontalAlignment)[keyof typeof HorizontalAlignment];

export const VerticalAlignment = {
  top: 'top',
  center: 'center',
  bottom: 'bottom',
} as const;
export type VerticalAlignment =
  (typeof VerticalAlignment)[keyof typeof VerticalAlignment];

export const CaptionBorderStyle = {
  outlineAndShadow: 'outline_and_shadow',
  opaqueBox: 'opaque_box',
} as const;
export type CaptionBorderStyle =
  (typeof CaptionBorderStyle)[keyof typeof CaptionBorderStyle];

export const CaptionAlignment = {
  bottomLeft: 'bottom_left',
  bottomCenter: 'bottom_center',
  bottomRight: 'bottom_right',
  middleLeft: 'middle_left',
  middleCenter: 'middle_center',
  middleRight: 'middle_right',
  topLeft: 'top_left',
  topCenter: 'top_center',
  topRight: 'top_right',
} as const;
export type CaptionAlignment =
  (typeof CaptionAlignment)[keyof typeof CaptionAlignment];

export const CaptionAnimation = {
  boxHighlight: 'box_highlight',
  colorHighlight: 'color_highlight',
  reveal: 'reveal',
  karaoke: 'karaoke',
  impact: 'impact',
  supersize: 'supersize',
} as const;
export type CaptionAnimation =
  (typeof CaptionAnimation)[keyof typeof CaptionAnimation];

export interface OffsetConfig {
  x?: number;
  y?: number;
}

export class Offset {
  public x: number;
  public y: number;

  constructor(config: OffsetConfig = {}) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
  }

  toJSON(): Record<string, number> {
    return { x: this.x, y: this.y };
  }
}

export interface CropConfig {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export class Crop {
  public top: number;
  public right: number;
  public bottom: number;
  public left: number;

  constructor(config: CropConfig = {}) {
    this.top = config.top ?? 0;
    this.right = config.right ?? 0;
    this.bottom = config.bottom ?? 0;
    this.left = config.left ?? 0;
  }

  toJSON(): Record<string, number> {
    return {
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left,
    };
  }
}

export interface TransitionConfig {
  in?: string;
  out?: string;
  duration?: number;
}

export class Transition {
  public in: string | undefined;
  public out: string | undefined;
  public duration: number;

  constructor(config: TransitionConfig = {}) {
    this.in = config.in;
    this.out = config.out;
    this.duration = config.duration ?? 0.5;
  }

  toJSON(): Record<string, unknown> {
    return {
      in: this.in,
      out: this.out,
      duration: this.duration,
    };
  }
}

export interface FontConfig {
  family?: string;
  size?: number;
  color?: string;
  opacity?: number;
  weight?: number;
}

export class Font {
  public family: string;
  public size: number;
  public color: string;
  public opacity: number;
  public weight: number | undefined;

  constructor(config: FontConfig = {}) {
    const size = config.size ?? 48;
    const opacity = config.opacity ?? 1.0;
    const weight = config.weight;

    if (size < 1) throw new Error('size must be at least 1');
    if (opacity < 0 || opacity > 1)
      throw new Error('opacity must be between 0.0 and 1.0');
    if (weight !== undefined && (weight < 100 || weight > 900))
      throw new Error('weight must be between 100 and 900');

    this.family = config.family ?? 'Clear Sans';
    this.size = size;
    this.color = config.color ?? '#FFFFFF';
    this.opacity = opacity;
    this.weight = weight;
  }

  toJSON(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      family: this.family,
      size: this.size,
      color: this.color,
      opacity: this.opacity,
    };
    if (this.weight !== undefined) data.weight = this.weight;
    return data;
  }
}

export interface BorderConfig {
  color?: string;
  width?: number;
}

export class Border {
  public color: string;
  public width: number;

  constructor(config: BorderConfig = {}) {
    const width = config.width ?? 0;
    if (width < 0) throw new Error('width must be non-negative');

    this.color = config.color ?? '#000000';
    this.width = width;
  }

  toJSON(): Record<string, unknown> {
    return { color: this.color, width: this.width };
  }
}

export interface ShadowConfig {
  color?: string;
  x?: number;
  y?: number;
}

export class Shadow {
  public color: string;
  public x: number;
  public y: number;

  constructor(config: ShadowConfig = {}) {
    const x = config.x ?? 0;
    const y = config.y ?? 0;
    if (x < 0) throw new Error('x must be non-negative');
    if (y < 0) throw new Error('y must be non-negative');

    this.color = config.color ?? '#000000';
    this.x = x;
    this.y = y;
  }

  toJSON(): Record<string, unknown> {
    return { color: this.color, x: this.x, y: this.y };
  }
}

export interface BackgroundConfig {
  width?: number;
  height?: number;
  color?: string;
  borderWidth?: number;
  opacity?: number;
  textAlignment?: TextAlignment;
}

export class Background {
  public width: number;
  public height: number;
  public color: string;
  public borderWidth: number;
  public opacity: number;
  public textAlignment: TextAlignment;

  constructor(config: BackgroundConfig = {}) {
    const width = config.width ?? 0;
    const height = config.height ?? 0;
    const borderWidth = config.borderWidth ?? 0;
    const opacity = config.opacity ?? 1.0;

    if (width < 0) throw new Error('width must be non-negative');
    if (height < 0) throw new Error('height must be non-negative');
    if (borderWidth < 0) throw new Error('borderWidth must be non-negative');
    if (opacity < 0 || opacity > 1)
      throw new Error('opacity must be between 0.0 and 1.0');

    this.width = width;
    this.height = height;
    this.color = config.color ?? '#000000';
    this.borderWidth = borderWidth;
    this.opacity = opacity;
    this.textAlignment = config.textAlignment ?? TextAlignment.center;
  }

  toJSON(): Record<string, unknown> {
    return {
      width: this.width,
      height: this.height,
      color: this.color,
      border_width: this.borderWidth,
      opacity: this.opacity,
      text_alignment: this.textAlignment,
    };
  }
}

export interface AlignmentConfig {
  horizontal?: HorizontalAlignment;
  vertical?: VerticalAlignment;
}

export class Alignment {
  public horizontal: HorizontalAlignment;
  public vertical: VerticalAlignment;

  constructor(config: AlignmentConfig = {}) {
    this.horizontal = config.horizontal ?? HorizontalAlignment.center;
    this.vertical = config.vertical ?? VerticalAlignment.center;
  }

  toJSON(): Record<string, string> {
    return { horizontal: this.horizontal, vertical: this.vertical };
  }
}

export interface FontStylingConfig {
  name?: string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikeout?: boolean;
  scaleX?: number;
  scaleY?: number;
  spacing?: number;
  angle?: number;
}

export class FontStyling {
  public name: string;
  public size: number;
  public bold: boolean;
  public italic: boolean;
  public underline: boolean;
  public strikeout: boolean;
  public scaleX: number;
  public scaleY: number;
  public spacing: number;
  public angle: number;

  constructor(config: FontStylingConfig = {}) {
    this.name = config.name ?? 'Clear Sans';
    this.size = config.size ?? 30;
    this.bold = config.bold ?? false;
    this.italic = config.italic ?? false;
    this.underline = config.underline ?? false;
    this.strikeout = config.strikeout ?? false;
    this.scaleX = config.scaleX ?? 100;
    this.scaleY = config.scaleY ?? 100;
    this.spacing = config.spacing ?? 0;
    this.angle = config.angle ?? 0;
  }

  toJSON(): Record<string, unknown> {
    return {
      font_name: this.name,
      font_size: this.size,
      bold: this.bold,
      italic: this.italic,
      underline: this.underline,
      strikeout: this.strikeout,
      scale_x: this.scaleX,
      scale_y: this.scaleY,
      spacing: this.spacing,
      angle: this.angle,
    };
  }
}

export interface BorderAndShadowConfig {
  style?: CaptionBorderStyle;
  outline?: number;
  outlineColor?: string;
  shadow?: number;
}

export class BorderAndShadow {
  public style: CaptionBorderStyle;
  public outline: number;
  public outlineColor: string;
  public shadow: number;

  constructor(config: BorderAndShadowConfig = {}) {
    this.style = config.style ?? CaptionBorderStyle.outlineAndShadow;
    this.outline = config.outline ?? 1;
    this.outlineColor = config.outlineColor ?? '&H00000000';
    this.shadow = config.shadow ?? 0;
  }

  toJSON(): Record<string, unknown> {
    return {
      style: this.style,
      outline: this.outline,
      outline_color: this.outlineColor,
      shadow: this.shadow,
    };
  }
}

export interface PositioningConfig {
  alignment?: CaptionAlignment;
  marginL?: number;
  marginR?: number;
  marginV?: number;
}

export class Positioning {
  public alignment: CaptionAlignment;
  public marginL: number;
  public marginR: number;
  public marginV: number;

  constructor(config: PositioningConfig = {}) {
    this.alignment = config.alignment ?? CaptionAlignment.bottomCenter;
    this.marginL = config.marginL ?? 30;
    this.marginR = config.marginR ?? 30;
    this.marginV = config.marginV ?? 30;
  }

  toJSON(): Record<string, unknown> {
    return {
      alignment: this.alignment,
      margin_l: this.marginL,
      margin_r: this.marginR,
      margin_v: this.marginV,
    };
  }
}

interface BaseAssetJSON {
  type: AssetType;
  [key: string]: unknown;
}

export interface EditorVideoAssetConfig {
  id: string;
  start?: number;
  volume?: number;
  crop?: Crop;
}

export class EditorVideoAsset {
  public readonly type = AssetType.video;
  public id: string;
  public start: number;
  public volume: number;
  public crop: Crop;

  constructor(config: EditorVideoAssetConfig) {
    const start = config.start ?? 0;
    const volume = config.volume ?? 1;

    if (start < 0) throw new Error('start must be non-negative');
    if (volume < 0 || volume > 5)
      throw new Error('volume must be between 0 and 5');

    this.id = config.id;
    this.start = start;
    this.volume = volume;
    this.crop = config.crop ?? new Crop();
  }

  toJSON(): BaseAssetJSON {
    return {
      type: this.type,
      id: this.id,
      start: this.start,
      volume: this.volume,
      crop: this.crop.toJSON(),
    };
  }
}

export interface EditorImageAssetConfig {
  id: string;
  crop?: Crop;
}

export class EditorImageAsset {
  public readonly type = AssetType.image;
  public id: string;
  public crop: Crop;

  constructor(config: EditorImageAssetConfig) {
    this.id = config.id;
    this.crop = config.crop ?? new Crop();
  }

  toJSON(): BaseAssetJSON {
    return {
      type: this.type,
      id: this.id,
      crop: this.crop.toJSON(),
    };
  }
}

export interface EditorAudioAssetConfig {
  id: string;
  start?: number;
  volume?: number;
}

export class EditorAudioAsset {
  public readonly type = AssetType.audio;
  public id: string;
  public start: number;
  public volume: number;

  constructor(config: EditorAudioAssetConfig) {
    this.id = config.id;
    this.start = config.start ?? 0;
    this.volume = config.volume ?? 1;
  }

  toJSON(): BaseAssetJSON {
    return {
      type: this.type,
      id: this.id,
      start: this.start,
      volume: this.volume,
    };
  }
}

export interface EditorTextAssetConfig {
  text: string;
  font?: Font;
  border?: Border;
  shadow?: Shadow;
  background?: Background;
  alignment?: Alignment;
  tabsize?: number;
  lineSpacing?: number;
  width?: number;
  height?: number;
}

export class EditorTextAsset {
  public readonly type = AssetType.text;
  public text: string;
  public font: Font;
  public border: Border | undefined;
  public shadow: Shadow | undefined;
  public background: Background | undefined;
  public alignment: Alignment;
  public tabsize: number;
  public lineSpacing: number;
  public width: number | undefined;
  public height: number | undefined;

  constructor(config: EditorTextAssetConfig) {
    const tabsize = config.tabsize ?? 4;
    const lineSpacing = config.lineSpacing ?? 0;

    if (tabsize < 1) throw new Error('tabsize must be at least 1');
    if (lineSpacing < 0) throw new Error('lineSpacing must be non-negative');
    if (config.width !== undefined && config.width < 1)
      throw new Error('width must be at least 1');
    if (config.height !== undefined && config.height < 1)
      throw new Error('height must be at least 1');

    this.text = config.text;
    this.font = config.font ?? new Font();
    this.border = config.border;
    this.shadow = config.shadow;
    this.background = config.background;
    this.alignment = config.alignment ?? new Alignment();
    this.tabsize = tabsize;
    this.lineSpacing = lineSpacing;
    this.width = config.width;
    this.height = config.height;
  }

  toJSON(): BaseAssetJSON {
    const data: BaseAssetJSON = {
      type: this.type,
      text: this.text,
      font: this.font.toJSON(),
      alignment: this.alignment.toJSON(),
      tabsize: this.tabsize,
      line_spacing: this.lineSpacing,
    };
    if (this.border) data.border = this.border.toJSON();
    if (this.shadow) data.shadow = this.shadow.toJSON();
    if (this.background) data.background = this.background.toJSON();
    if (this.width !== undefined) data.width = this.width;
    if (this.height !== undefined) data.height = this.height;
    return data;
  }
}

export interface CaptionAssetConfig {
  src?: string;
  font?: FontStyling;
  primaryColor?: string;
  secondaryColor?: string;
  backColor?: string;
  border?: BorderAndShadow;
  position?: Positioning;
  animation?: CaptionAnimation;
}

export class CaptionAsset {
  public readonly type = AssetType.caption;
  public src: string;
  public font: FontStyling;
  public primaryColor: string;
  public secondaryColor: string;
  public backColor: string;
  public border: BorderAndShadow;
  public position: Positioning;
  public animation: CaptionAnimation | undefined;

  constructor(config: CaptionAssetConfig = {}) {
    this.src = config.src ?? 'auto';
    this.font = config.font ?? new FontStyling();
    this.primaryColor = config.primaryColor ?? '&H00FFFFFF';
    this.secondaryColor = config.secondaryColor ?? '&H000000FF';
    this.backColor = config.backColor ?? '&H00000000';
    this.border = config.border ?? new BorderAndShadow();
    this.position = config.position ?? new Positioning();
    this.animation = config.animation;
  }

  toJSON(): BaseAssetJSON {
    const data: BaseAssetJSON = {
      type: this.type,
      src: this.src,
      font: this.font.toJSON(),
      primary_color: this.primaryColor,
      secondary_color: this.secondaryColor,
      back_color: this.backColor,
      border: this.border.toJSON(),
      position: this.position.toJSON(),
    };
    if (this.animation) data.animation = this.animation;
    return data;
  }
}

export type AnyEditorAsset =
  | EditorVideoAsset
  | EditorImageAsset
  | EditorAudioAsset
  | EditorTextAsset
  | CaptionAsset;

export interface ClipConfig {
  asset: AnyEditorAsset;
  duration: number;
  transition?: Transition;
  effect?: string;
  filter?: Filter;
  scale?: number;
  opacity?: number;
  fit?: Fit;
  position?: Position;
  offset?: Offset;
  zIndex?: number;
}

export class Clip {
  public asset: AnyEditorAsset;
  public duration: number;
  public transition: Transition | undefined;
  public effect: string | undefined;
  public filter: Filter | undefined;
  public scale: number;
  public opacity: number;
  public fit: Fit;
  public position: Position;
  public offset: Offset;
  public zIndex: number;

  constructor(config: ClipConfig) {
    const scale = config.scale ?? 1;
    const opacity = config.opacity ?? 1;

    if (scale < 0 || scale > 10)
      throw new Error('scale must be between 0 and 10');
    if (opacity < 0 || opacity > 1)
      throw new Error('opacity must be between 0 and 1');

    this.asset = config.asset;
    this.duration = config.duration;
    this.transition = config.transition;
    this.effect = config.effect;
    this.filter = config.filter;
    this.scale = scale;
    this.opacity = opacity;
    this.fit = config.fit ?? Fit.crop;
    this.position = config.position ?? Position.center;
    this.offset = config.offset ?? new Offset();
    this.zIndex = config.zIndex ?? 0;
  }

  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      asset: this.asset.toJSON(),
      duration: this.duration,
      effect: this.effect,
      scale: this.scale,
      opacity: this.opacity,
      fit: this.fit,
      position: this.position,
      offset: this.offset.toJSON(),
      z_index: this.zIndex,
    };
    if (this.transition) json.transition = this.transition.toJSON();
    if (this.filter) json.filter = this.filter;
    return json;
  }
}

export class TrackItem {
  public start: number;
  public clip: Clip;

  constructor(start: number, clip: Clip) {
    this.start = start;
    this.clip = clip;
  }

  toJSON(): Record<string, unknown> {
    return {
      start: this.start,
      clip: this.clip.toJSON(),
    };
  }
}

export class Track {
  public clips: TrackItem[];
  public zIndex: number;

  constructor(zIndex: number = 0) {
    this.clips = [];
    this.zIndex = zIndex;
  }

  addClip(start: number, clip: Clip): void {
    this.clips.push(new TrackItem(start, clip));
  }

  toJSON(): Record<string, unknown> {
    return {
      clips: this.clips.map(c => c.toJSON()),
      z_index: this.zIndex,
    };
  }
}

interface EditorStreamResponse {
  streamUrl: string;
  playerUrl: string;
}

export class EditorTimeline {
  public background: string;
  public resolution: string;
  public tracks: Track[];
  public streamUrl: string | null;
  public playerUrl: string | null;
  #vhttp: HttpClient;

  constructor(connection: Connection) {
    this.#vhttp = connection.vhttp;
    this.background = '#000000';
    this.resolution = '1280x720';
    this.tracks = [];
    this.streamUrl = null;
    this.playerUrl = null;
  }

  addTrack(track: Track): void {
    this.tracks.push(track);
  }

  toJSON(): Record<string, unknown> {
    return {
      timeline: {
        background: this.background,
        resolution: this.resolution,
        tracks: this.tracks.map(t => t.toJSON()),
      },
    };
  }

  async generateStream(): Promise<string | null> {
    const res = await this.#vhttp.post<EditorStreamResponse, object>(
      [ApiPath.editor],
      this.toJSON()
    );
    this.streamUrl = res.data?.streamUrl || null;
    this.playerUrl = res.data?.playerUrl || null;
    return this.streamUrl;
  }

  async downloadStream(streamUrl: string): Promise<Record<string, unknown>> {
    const res = await this.#vhttp.post<Record<string, unknown>, object>(
      [ApiPath.editor, ApiPath.download],
      { streamUrl }
    );
    return res.data;
  }
}
