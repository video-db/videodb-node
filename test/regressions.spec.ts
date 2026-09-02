/**
 * Regression tests for the Node-SDK bugs tracked in `issues/`.
 * Each block names the Linear issue it locks down.
 */
import { Shot } from '@/core/shot';
import { SearchResult } from '@/core/search/searchResult';
import { Video } from '@/core/video';
import { Collection } from '@/core/collection';
import { Understanding } from '@/core/understanding';
import { playStream } from '@/utils';
import type { HttpClient } from '@/utils/httpClient';

/** Records every request the SDK makes so the wire body can be asserted. */
const makeHttp = (responses: Record<string, unknown> = {}) => {
  const calls: {
    method: string;
    path: string[];
    body?: unknown;
    opts?: unknown;
  }[] = [];
  const respond = (path: string[]) => ({
    data: responses[path.join('/')] ?? responses['*'] ?? {},
  });
  return {
    calls,
    client: {
      post: (path: string[], body?: unknown) => {
        calls.push({ method: 'post', path, body });
        return Promise.resolve(respond(path));
      },
      get: (path: string[], params?: unknown, opts?: unknown) => {
        calls.push({ method: 'get', path, opts });
        return Promise.resolve(respond(path));
      },
    } as unknown as HttpClient,
  };
};

describe('ENG-1524 — ask() accepts an options object', () => {
  it('reads topK/includeSources from an options object', async () => {
    const { calls, client } = makeHttp();
    await new Video(client, { id: 'v1', collectionId: 'c1' } as never).ask(
      'q',
      {
        topK: 15,
        includeSources: true,
      }
    );
    expect(calls[0].body).toEqual({
      question: 'q',
      top_k: 15,
      mode: 'default',
      include_sources: true,
    });
  });

  it('still honours the legacy positional form', async () => {
    const { calls, client } = makeHttp();
    await new Video(client, { id: 'v1', collectionId: 'c1' } as never).ask(
      'q',
      3,
      'default',
      true
    );
    expect(calls[0].body).toEqual({
      question: 'q',
      top_k: 3,
      mode: 'default',
      include_sources: true,
    });
  });

  it('applies the same defaults on Collection.ask', async () => {
    const { calls, client } = makeHttp();
    await new Collection(client, 'c1', 'n', 'd').ask('q');
    expect(calls[0].body).toEqual({
      question: 'q',
      top_k: 15,
      mode: 'default',
      include_sources: false,
    });
  });
});

describe('ENG-1518 / ENG-1512 — SearchResult field coercion', () => {
  const build = (result: Record<string, unknown>) =>
    new SearchResult(
      {} as HttpClient,
      {
        results: [
          {
            videoId: 'v1',
            collectionId: 'c1',
            docs: [
              {
                start: 0,
                end: 1,
                score: 0.5,
                text: 't',
                ...(result.doc as object),
              },
            ],
            ...result,
          },
        ],
      } as never
    );

  it('leaves videoLength undefined rather than NaN when length is null', () => {
    const shot = build({ length: null, title: null }).shots[0];
    expect(shot.videoLength).toBeUndefined();
    expect(shot.videoTitle).toBeUndefined();
  });

  it('still parses the legacy numeric-string length', () => {
    const shot = build({ length: '665.460680', title: 'Clip' }).shots[0];
    expect(shot.videoLength).toBeCloseTo(665.46068);
    expect(shot.videoTitle).toBe('Clip');
  });

  it("falls through an empty streamLink onto streamUrl, like Python's `or`", () => {
    const shot = build({
      length: null,
      title: null,
      doc: { streamLink: '', streamUrl: 'https://s/x.m3u8' },
    }).shots[0];
    expect(shot.streamUrl).toBe('https://s/x.m3u8');
  });

  it('normalises a missing stream to null, not undefined', () => {
    const shot = build({ length: null, title: null }).shots[0];
    expect(shot.streamUrl).toBeNull();
    expect(shot.playerUrl).toBeNull();
    expect(JSON.parse(JSON.stringify(shot))).toHaveProperty('streamUrl', null);
  });
});

describe('ENG-1522 — getEmbedCode auto-generates the player URL', () => {
  it('fetches playerUrl for a search shot that only has streamUrl', async () => {
    const { calls, client } = makeHttp({
      '*': {
        streamUrl: 'https://s/new.m3u8',
        playerUrl: 'https://p/watch?v=abc',
      },
    });
    const shot = new Shot(client, {
      videoId: 'v1',
      start: 0,
      end: 1,
      streamUrl: 'https://s/search.m3u8',
    } as never);

    const embed = await shot.getEmbedCode();
    expect(calls).toHaveLength(1);
    expect(embed).toContain('https://p/embed?v=abc');
  });

  it('sends length null instead of NaN when the shot has no length', async () => {
    const { calls, client } = makeHttp({
      '*': { streamUrl: 's', playerUrl: 'p' },
    });
    await new Shot(client, {
      videoId: 'v1',
      start: 0,
      end: 1,
    } as never).generateStream();
    expect((calls[0].body as { length: unknown }).length).toBeNull();
  });

  it('skips the request once both URLs are known', async () => {
    const { calls, client } = makeHttp();
    await new Shot(client, {
      videoId: 'v1',
      start: 0,
      end: 1,
      streamUrl: 'https://s/x.m3u8',
      playerUrl: 'https://p/watch?v=abc',
    } as never).generateStream();
    expect(calls).toHaveLength(0);
  });
});

describe('ENG-1516 — playStream opens the browser', () => {
  const original = process.env.VIDEODB_NO_BROWSER;
  afterEach(() => {
    if (original === undefined) delete process.env.VIDEODB_NO_BROWSER;
    else process.env.VIDEODB_NO_BROWSER = original;
    jest.resetModules();
  });

  it('returns the player URL unchanged', () => {
    process.env.VIDEODB_NO_BROWSER = '1';
    expect(playStream('https://s/x.m3u8')).toContain('?url=https://s/x.m3u8');
  });

  it('spawns an opener, and honours VIDEODB_NO_BROWSER', () => {
    jest.isolateModules(() => {
      const cp = require('node:child_process') as { spawn: unknown };
      const spawn = jest
        .spyOn(cp as never, 'spawn')
        .mockReturnValue({ on: () => {}, unref: () => {} } as never);

      delete process.env.VIDEODB_NO_BROWSER;
      const { playStream: play } =
        require('@/utils') as typeof import('@/utils');
      play('https://s/x.m3u8');
      expect(spawn).toHaveBeenCalledTimes(1);

      process.env.VIDEODB_NO_BROWSER = '1';
      play('https://s/y.m3u8');
      expect(spawn).toHaveBeenCalledTimes(1);
      spawn.mockRestore();
    });
  });
});

describe('ENG-1517 — analyzer output keeps the server snake_case keys', () => {
  it('requests the output with conversion disabled', async () => {
    const { calls, client } = makeHttp({
      '*': { scenes: [{ scene_id: 's1', data: {} }] },
    });
    const u = new Understanding(client, { id: 'u1', videoId: 'v1' } as never);
    const out = (await u.getAnalyzerOutput('transcript')) as {
      scenes: Record<string, unknown>[];
    };

    expect(calls[0].opts).toEqual({ convert: false });
    expect(out.scenes[0]).toHaveProperty('scene_id');
    expect(out.scenes[0]).not.toHaveProperty('sceneId');
  });
});
