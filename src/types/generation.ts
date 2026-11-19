/**
 * Model-specific `config` objects for generation methods.
 *
 * Pass one as `config`, or a plain object with the same keys. A plain object also
 * works for options the service adds before the SDK lists them.
 */

export interface HeyGenConfigOptions {
  /** Voice name, exact spelling (default `Warm Pro Narrator`). `HeyGenConfig.voices` has a starter set */
  voice?: string;
  /** Your audio ID to lip-sync instead of speaking the prompt; not combinable with `voice` */
  audio_id?: string;
  /** One of `HeyGenConfig.talkingStyles` (default `stable`) */
  talking_style?: 'stable' | 'expressive';
  /** One of `HeyGenConfig.expressions` */
  expression?: 'happy';
  /** Burn in subtitles */
  caption?: boolean;
  /** `{ type: 'color', value: '#FFFFFF' }`, or `type` `image` / `video` with a public URL */
  background?: { type: 'color' | 'image' | 'video'; value: string };
}

/** Options for `generateVideo(..., { model: 'heygen', config })` */
export class HeyGenConfig {
  /** A starter set of voices. Any voice from the full list works; see `HeyGenConfig.docs` */
  static readonly voices = [
    'Warm Pro Narrator',
    'Chill Brian',
    'Ivy',
    'Professor Dean',
    'Calm Chloe',
    'Crisp Chloe',
    'Baritone Ben',
    'Mellow Marcus',
    'Grace Elder',
    'Expressive Evan',
    'Bold Blake',
    'Serenity',
  ] as const;
  static readonly talkingStyles = ['stable', 'expressive'] as const;
  static readonly expressions = ['happy'] as const;
  static readonly backgroundTypes = ['color', 'image', 'video'] as const;
  static readonly aspectRatios = [
    '16:9',
    '9:16',
    '4:5',
    '5:4',
    '1:1',
    'auto',
  ] as const;
  static readonly resolutions = [
    '360p',
    '480p',
    '540p',
    '720p',
    '1080p',
  ] as const;
  /** Longest script (estimated speech) or audio, in seconds */
  static readonly maxSeconds = 120;
  static readonly docs =
    'https://docs.videodb.io/api-reference/generation/models/heygen';

  constructor(readonly options: HeyGenConfigOptions = {}) {}

  toDict(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.options)) {
      if (value != null) out[key] = value;
    }
    return out;
  }
}
