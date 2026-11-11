/**
 * Developer-experience fixes: server error messages, shared error base,
 * Search V2 warnings, filter passthrough, V2 shot text and poll retries.
 */
import axios from 'axios';
import { connect } from '@/index';
import { Video } from '@/core/video';
import { Collection } from '@/core/collection';
import { SearchResponse } from '@/core/search/responses';
import {
  AuthenticationError,
  InvalidRequestError,
  RequestTimeoutError,
  VideodbError,
} from '@/utils/error';
import type { HttpClient } from '@/utils/httpClient';

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return { ...actual, create: jest.fn() };
});

/** Fake axios instance: `request` and `get` replay the queued results in order. */
const fakeAxios = (queue: Array<() => unknown>) => {
  const next = () => {
    const step = queue.shift();
    if (!step) throw new Error('unexpected request');
    return Promise.resolve().then(step);
  };
  const instance = { request: jest.fn(next), get: jest.fn(next) };
  (axios.create as jest.Mock).mockReturnValue(instance);
  return instance;
};

const httpError = (status: number, data: unknown) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    status,
    request: {},
    response: { status, statusText: 'Bad Request', data, headers: {} },
  });

const ok = (data: unknown) => () => ({ data: { success: true, data } });

describe('errors carry the server message', () => {
  it('uses the API message, status and code for a 4xx', async () => {
    fakeAxios([
      () => {
        throw httpError(402, {
          message: 'You have reached the Hackathon budget',
          error_code: 'llm_dollar_budget_reached',
        });
      },
    ]);
    const err = await connect('sk-test')
      .getCollection()
      .catch(e => e);
    expect(err).toBeInstanceOf(InvalidRequestError);
    expect(err).toBeInstanceOf(VideodbError);
    expect(err.message).toBe(
      'Error 402: You have reached the Hackathon budget'
    );
    expect(err.status).toBe(402);
    expect(err.code).toBe('llm_dollar_budget_reached');
    // 0.3.x callers read the server message from e.cause.cause.
    expect(err.cause.cause).toBe('You have reached the Hackathon budget');
  });

  it('keeps the 0.3.x AuthenticationError constructor and cause', () => {
    expect(new AuthenticationError().cause).toBe('Invalid API key');
    const legacy = new AuthenticationError({ reason: 'x' });
    expect(legacy.message).toBe('Authentication Error: Invalid API key');
    expect(legacy.cause).toEqual({ reason: 'x' });
    expect(new AuthenticationError('No API key').cause).toBe('No API key');
  });

  it('keeps the 401 message and is a VideodbError', async () => {
    fakeAxios([
      () => {
        throw httpError(401, { message: 'Invalid API key' });
      },
    ]);
    const err = await connect('sk-bad')
      .getCollection()
      .catch(e => e);
    expect(err).toBeInstanceOf(AuthenticationError);
    expect(err).toBeInstanceOf(VideodbError);
    expect(err.message).toBe('Authentication Error: Invalid API key');
    expect(err.status).toBe(401);
  });

  it('puts the missing-key hint in the message, not only the cause', () => {
    const saved = process.env.VIDEO_DB_API_KEY;
    delete process.env.VIDEO_DB_API_KEY;
    try {
      expect(() => connect()).toThrow(/Set an API key/);
    } finally {
      process.env.VIDEO_DB_API_KEY = saved;
    }
  });

  it('keeps the code from a success:false body', async () => {
    fakeAxios([
      () => ({
        data: { success: false, message: 'Video not found', error_code: 400 },
      }),
    ]);
    const err = await connect('sk-test')
      .getCollection()
      .catch(e => e);
    expect(err.message).toBe('VideoDB Error: Video not found');
    expect(err.code).toBe('400');
  });
});

describe('polling', () => {
  const processing = () => ({
    data: { status: 'processing', data: { output_url: 'https://out/1' } },
  });

  it('retries a transient 5xx mid-poll instead of failing the job', async () => {
    const http = fakeAxios([
      processing,
      () => {
        throw httpError(502, {});
      },
      ok({ id: 'c-1', name: 'n' }),
    ]);
    const res = await connect('sk-test').vhttp.get(['x'], undefined, {
      pollInterval: 1,
    });
    expect(res.data).toEqual({ id: 'c-1', name: 'n' });
    expect(http.get).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 4xx mid-poll', async () => {
    fakeAxios([
      processing,
      () => {
        throw httpError(404, { message: 'gone' });
      },
    ]);
    const err = await connect('sk-test')
      .vhttp.get(['x'], undefined, { pollInterval: 1 })
      .catch(e => e);
    expect(err.message).toBe('Error 404: gone');
  });

  it('throws RequestTimeoutError (not a wrapped VideodbError) with the poll URL', async () => {
    fakeAxios([processing, () => ({ data: { status: 'processing' } })]);
    const err = await connect('sk-test')
      .vhttp.get(['x'], undefined, { maxPollTime: 1, pollInterval: 5 })
      .catch(e => e);
    expect(err).toBeInstanceOf(RequestTimeoutError);
    expect(err).toBeInstanceOf(VideodbError);
    expect(err.data).toEqual({ outputUrl: 'https://out/1' });
  });
});

/** Records request bodies for the search tests. */
const recorder = (response: unknown) => {
  const bodies: unknown[] = [];
  const client = {
    post: (_path: string[], body: unknown) => {
      bodies.push(body);
      return Promise.resolve({ data: response });
    },
  } as unknown as HttpClient;
  return { bodies, client };
};

describe('Search V2', () => {
  const fallback =
    'No Search V2 indexes were found for this content, so search() used the available legacy indexes.';

  it('forwards filter on Video and Collection search()', async () => {
    const filter = [{ field: 'speaker', op: 'eq', value: 'A' }];
    const v = recorder({ responseType: 'shots', results: [] });
    await new Video(v.client, {
      id: 'm-1',
      collectionId: 'c-1',
    } as never).search('q', { filter });
    expect(v.bodies[0]).toEqual({ query: 'q', filter });

    const c = recorder({ responseType: 'shots', results: [] });
    await new Collection(c.client, { id: 'c-1' } as never).search('q', {
      filter,
    });
    expect(c.bodies[0]).toEqual({ query: 'q', filter });
  });

  it('exposes server warnings and prints each once', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const http = {} as HttpClient;
    const data = {
      responseType: 'shots',
      results: [],
      warnings: [{ message: fallback }],
    };
    const first = new SearchResponse(http, data);
    new SearchResponse(http, data);
    expect(first.warnings).toEqual([{ message: fallback }]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain(fallback);
    warn.mockRestore();
  });

  it('fills shot.text from metadata.embeddedText for V2 hits', () => {
    const res = new SearchResponse({} as HttpClient, {
      responseType: 'shots',
      results: [
        {
          videoId: 'm-1',
          docs: [
            {
              start: 1,
              end: 2,
              text: null,
              metadata: { embeddedText: 'attention' },
            },
          ],
        },
      ],
    });
    expect(res.shots[0].text).toBe('attention');
  });
});

describe('uploads', () => {
  it('names a missing local file instead of an empty reason', async () => {
    const { client } = recorder({});
    const err = await new Collection(client, { id: 'c-1' } as never)
      .uploadFile({ filePath: '/nope/missing.mp4' })
      .catch(e => e);
    expect(err.message).toBe(
      'VideoDB Error: File not found: /nope/missing.mp4'
    );
  });
});

describe('SearchResponse keeps the old search() chaining', () => {
  const shotsResponse = {
    responseType: 'shots',
    results: [
      { videoId: 'm-1', collectionId: 'c-1', docs: [{ start: 1, end: 2 }] },
    ],
  };

  it('compiles shot results like SearchResult', async () => {
    const { bodies, client } = recorder({ streamUrl: 'https://stream/1' });
    const res = new SearchResponse(client, shotsResponse);
    await expect(res.compile()).resolves.toBe('https://stream/1');
    expect(bodies[0]).toEqual([
      { video_id: 'm-1', collection_id: 'c-1', shots: [[1, 2]] },
    ]);
  });

  it('refuses to compile an aggregate response', () => {
    const res = new SearchResponse({} as HttpClient, {
      responseType: 'aggregate',
      results: { count: 3 },
    });
    expect(() => res.compile()).toThrow(/does not contain shot results/);
  });
});
