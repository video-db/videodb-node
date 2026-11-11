// Compile-time checks for upload return types. Run with `npm run typecheck:tests`.
import type { Audio, Collection, Image, Video } from '../../src';

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
const assert = <T extends true>(_: T) => _;

declare const coll: Collection;
declare const maybeCallback: string | undefined;

const checks = async () => {
  const any = await coll.uploadURL({ url: 'https://x' });
  assert<Equals<typeof any, Video | Audio | Image>>(true);

  const video = await coll.uploadURL({ url: 'https://x', mediaType: 'video' });
  assert<Equals<typeof video, Video>>(true);
  video.playerUrl.toString();

  const audio = await coll.uploadFile({
    filePath: '/a.mp3',
    mediaType: 'audio',
  });
  assert<Equals<typeof audio, Audio>>(true);

  const image = await coll.uploadURL({ url: 'https://x', mediaType: 'image' });
  assert<Equals<typeof image, Image>>(true);

  const queued = await coll.uploadURL({
    url: 'https://x',
    callbackUrl: 'https://cb',
  });
  assert<Equals<typeof queued, undefined>>(true);

  const maybe = await coll.uploadURL({
    url: 'https://x',
    callbackUrl: maybeCallback,
  });
  assert<Equals<typeof maybe, Video | Audio | Image | undefined>>(true);
};
void checks;
