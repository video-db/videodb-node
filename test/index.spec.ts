import {
  Clip,
  Easing,
  Effect,
  EditorTimeline,
  EditorVideoAsset,
  Keyframe,
  KeyframeProperty,
  Lut,
  Motion,
  MotionPreset,
  MotionPresetName,
  Track,
} from '@/index';
import type { Connection } from '@/core/connection';

// TODO: write tests
describe('index', () => {
  describe('connect', () => {
    it('should return an instance of the Connection class', () => {
      const message = 'Hello';

      expect('Hello world').toMatch(message);
    });
  });
});

describe('editor LUT, motion and effect', () => {
  const asset = () => new EditorVideoAsset({ id: 'm-1' });
  const wire = (o: { toJSON(): unknown }) => JSON.parse(JSON.stringify(o));
  const timeline = () =>
    new EditorTimeline({ vhttp: {} } as unknown as Connection);

  it('leaves the payload unchanged when the new fields are unset', () => {
    const json = wire(new Clip({ asset: asset(), duration: 5 }));
    expect(Object.keys(json).sort()).toEqual(
      [
        'asset',
        'duration',
        'fit',
        'offset',
        'opacity',
        'position',
        'scale',
        'z_index',
      ].sort()
    );
    expect(
      wire(new Clip({ asset: asset(), duration: 5, motion: new Motion() }))
    ).not.toHaveProperty('motion');
    expect(wire(timeline())).toEqual({
      timeline: { background: '#000000', resolution: '1280x720', tracks: [] },
    });
  });

  it('serializes lut, motion presets, keyframes and effect in snake_case', () => {
    const clip = new Clip({
      asset: asset(),
      duration: 5,
      lut: new Lut({ src: 'https://x/grade.cube', intensity: 0.5 }),
      motion: new Motion({
        enter: new MotionPreset({ preset: MotionPresetName.slideUp }),
        exit: new MotionPreset({
          preset: MotionPresetName.fade,
          duration: 1,
          easing: Easing.easeIn,
        }),
        keyframes: {
          [KeyframeProperty.offsetX]: [
            new Keyframe({ time: 0, value: -0.2 }),
            new Keyframe({ time: 1, value: 0, easing: Easing.backOut }),
          ],
        },
      }),
    });
    const json = wire(clip);
    expect(json.lut).toEqual({ src: 'https://x/grade.cube', intensity: 0.5 });
    expect(json.motion).toEqual({
      enter: {
        preset: 'slide_up',
        duration: 0.4,
        amount: 0.08,
        easing: 'ease_out',
      },
      exit: { preset: 'fade', duration: 1, amount: 0.08, easing: 'ease_in' },
      keyframes: {
        'offset.x': [
          { time: 0, value: -0.2, easing: 'linear' },
          { time: 1, value: 0, easing: 'back_out' },
        ],
      },
    });

    const shaken = wire(
      new Clip({ asset: asset(), duration: 2, effect: Effect.zoomIn })
    );
    expect(shaken.effect).toBe('zoom_in');

    const tl = timeline();
    const track = new Track();
    track.addClip(0, clip);
    tl.addTrack(track);
    tl.lut = new Lut({ src: 'https://x/film.cube' });
    expect(wire(tl).timeline.lut).toEqual({
      src: 'https://x/film.cube',
      intensity: 1,
    });
  });

  it('validates client-side like the Python SDK', () => {
    expect(() => new Lut({ src: 's', intensity: 2 })).toThrow('intensity');
    expect(() => new Keyframe({ time: -1, value: 0 })).toThrow('negative');
    expect(
      () => new MotionPreset({ preset: MotionPresetName.pop, duration: 0 })
    ).toThrow('duration');
    expect(
      () =>
        new Motion({
          keyframes: {
            scale: [
              new Keyframe({ time: 1, value: 1 }),
              new Keyframe({ time: 1, value: 2 }),
            ],
          },
        })
    ).toThrow('strictly increase');
    expect(
      () => new Clip({ asset: asset(), duration: 1, effect: 'spin' as Effect })
    ).toThrow('not a valid Effect');
  });
});
