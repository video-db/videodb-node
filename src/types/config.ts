import {
  SubtitleBorderStyle,
  SubtitleAlignment,
  TextStyle,
} from '@/core/config';

export type SubtitleStyleProps = {
  fontName: string;
  fontSize: number;
  primaryColour: string;
  secondaryColour: string;
  outlineColour: string;
  backColour: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeOut: boolean;
  scaleX: number;
  scaleY: number;
  spacing: number;
  angle: number;
  borderStyle: SubtitleBorderStyle;
  outline: number;
  shadow: number;
  alignment: SubtitleAlignment;
  marginL: number;
  marginR: number;
  marginV: number;
};

export type TextStyleProps = {
  fontsize: number;
  fontcolor: string;
  fontcolorExpr: string;
  alpha: number;
  font: string;
  box: boolean;
  boxcolor: string;
  boxborderw: string;
  boxw: number;
  boxh: number;
  lineSpacing: number;
  textAlign: string;
  yAlign: string;
  borderw: number;
  bordercolor: string;
  expansion: string;
  basetime: number;
  fixBounds: boolean;
  textShaping: boolean;
  shadowcolor: string;
  shadowx: number;
  shadowy: number;
  tabsize: number;
  x: string | number;
  y: string | number;
};

export type AudioAssetConfig = {
  start: number;
  end: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  disableOtherTracks: boolean;
};

export type VideoAssetConfig = {
  start: number;
  end: number;
};

export type ImageAssetConfig = {
  width: number | string;
  height: number | string;
  x: number | string;
  y: number | string;
  duration?: number;
};

export type TextAssetConfig = {
  text: string;
  style: TextStyle;
  duration?: number;
};
