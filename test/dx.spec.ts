/**
 * 0.4.0: server messages in errors, error details, search warnings and filter,
 * V2 shot text, SearchResponse chaining, poll retries and timeouts, uploads.
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
  VdbBaseError,
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

describe('errors carry the server message and details', () => {
  it('4xx: server message, status, code and data; class and cause as before', async () => {
    const body = {
      message: 'You have reached the budget',
      error_code: 'llm_dollar_budget_reached',
    };
    fakeAxios([
      () => {
        throw httpError(402, body);
      },
    ]);
    const err = await connect('sk-test')
      .getCollection()
      .catch(e => e);
    expect(err).toBeInstanceOf(InvalidRequestError);
    expect(err).not.toBeInstanceOf(VideodbError);
    expect(err).toBeInstanceOf(VdbBaseError);
    expect(err.name).toBe('InvalidRequestError');
    expect(err.message).toBe('Error 402: You have reached the budget');
    expect(err.cause).toEqual({ cause: 'You have reached the budget' });
    expect(err.status).toBe(402);
    expect(err.code).toBe('llm_dollar_budget_reached');
    expect(err.data).toEqual(body);
  });

  it('401: server message, status and data; class and cause as before', async () => {
    fakeAxios([
      () => {
        throw httpError(401, { message: 'Invalid API key' });
      },
    ]);
    const err = await connect('sk-bad')
      .getCollection()
      .catch(e => e);
    expect(err).toBeInstanceOf(AuthenticationError);
    expect(err).not.toBeInstanceOf(VideodbError);
    expect(err.name).toBe('Error');
    expect(err.message).toBe('Authentication Error: Invalid API key');
    expect(err.cause).toBe('Invalid API Key');
    expect(err.status).toBe(401);
    expect(err.data).toEqual({ message: 'Invalid API key' });
  });

  it('missing key: the hint is in the message and the cause', () => {
    const saved = process.env.VIDEO_DB_API_KEY;
    delete process.env.VIDEO_DB_API_KEY;
    try {
      const err = (() => {
        try {
          connect();
        } catch (e) {
          return e as AuthenticationError;
        }
      })();
      expect(err?.message).toMatch(
        /^Authentication Error: No API key provided.*VIDEO_DB_API_KEY/
      );
      expect(String(err?.cause)).toMatch(/VIDEO_DB_API_KEY/);
    } finally {
      process.env.VIDEO_DB_API_KEY = saved;
    }
  });

  it('success:false: same message; adds status, code and data', async () => {
    fakeAxios([
      () => ({
        data: { success: false, message: 'Video not found', error_code: 400 },
      }),
    ]);
    const err = await connect('sk-test')
      .getCollection()
      .catch(e => e);
    expect(err.message).toBe('VideoDB Error: Video not found');
    expect(err.name).toBe('Error');
    expect(err.code).toBe('400');
    expect(err.status).toBe(400);
  });

  it('success:false: a string HTTP-like error_code also sets status', async () => {
    fakeAxios([
      () => ({ data: { success: false, message: 'x', error_code: '403' } }),
    ]);
    const err = await connect('sk-test')
      .getCollection()
      .catch(e => e);
    expect(err.status).toBe(403);
    expect(err.code).toBe('403');
  });

  it('success:false: a non-numeric error_code leaves status unset', async () => {
    fakeAxios([
      () => ({
        data: {
          success: false,
          message: 'x',
          error_code: 'llm_dollar_budget_reached',
        },
      }),
    ]);
    const err = await connect('sk-test')
      .getCollection()
      .catch(e => e);
    expect(err.status).toBeUndefined();
    expect(err.code).toBe('llm_dollar_budget_reached');
  });

  it('adds no keys to errors without details', () => {
    expect(Object.keys(new VideodbError('x'))).toEqual([]);
    expect(Object.keys(new AuthenticationError())).toEqual([]);
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
    expect(err.cause).toEqual({ cause: 'gone' });
  });

  it('timeout: throws RequestTimeoutError with the output URL', async () => {
    fakeAxios([processing, () => ({ data: { status: 'processing' } })]);
    const err = await connect('sk-test')
      .vhttp.get(['x'], undefined, { maxPollTime: 1, pollInterval: 5 })
      .catch(e => e);
    expect(err).toBeInstanceOf(RequestTimeoutError);
    expect(err.message).toBe(
      'Request Timeout Error: Polling timed out after 0s. The job may still finish; its result will be at https://out/1'
    );
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

  it('exposes server warnings without printing them', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const res = new SearchResponse({} as HttpClient, {
      responseType: 'shots',
      results: [],
      warnings: [{ message: fallback }],
    });
    expect(res.warnings).toEqual([{ message: fallback }]);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('forwards filter on Video and Collection search()', async () => {
    const filter = [{ field: 'speaker', op: 'eq', value: 'A' }];
    const v = recorder({ responseType: 'shots', results: [] });
    await new Video(v.client, {
      id: 'm-1',
      collectionId: 'c-1',
    } as never).search('q', { filter } as never);
    expect(v.bodies[0]).toEqual({ query: 'q', filter });

    const c = recorder({ responseType: 'shots', results: [] });
    await new Collection(c.client, { id: 'c-1' } as never).search('q', {
      filter,
    } as never);
    expect(c.bodies[0]).toEqual({ query: 'q', filter });
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
  it('names a missing local file', async () => {
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

  it('rejects compile/play/getEmbedCode on an aggregate response', async () => {
    const res = new SearchResponse({} as HttpClient, {
      responseType: 'aggregate',
      results: { count: 3 },
    });
    await expect(res.compile()).rejects.toThrow(
      /does not contain shot results/
    );
    await expect(res.play()).rejects.toThrow(/does not contain shot results/);
    await expect(res.getEmbedCode()).rejects.toThrow(
      /does not contain shot results/
    );
  });
});
