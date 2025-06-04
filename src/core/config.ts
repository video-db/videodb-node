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
}

export enum IndexTypeValues {
  spoken_word = 'spoken_word',
  scene = 'scene',
}

export const DefaultSearchType = SearchTypeValues.semantic;
export const DefaultIndexType = IndexTypeValues.spoken_word;

export const SceneExtractionType = {
  shotBased: 'shot',
  timeBased: 'time',
};
