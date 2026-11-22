/**
 * 0.4.0: server messages in errors, error details, search warnings and filter,
 * V2 shot text, SearchResponse chaining, poll retries and timeouts, uploads.
 * Server-paced polling (retry_after / max_wait) and JobTimeoutError.
 */
import axios from 'axios';
import { connect } from '@/index';
import { Video } from '@/core/video';
import { Collection } from '@/core/collection';
import { SearchResponse } from '@/core/search/responses';
import { GenerationJob } from '@/core/job';
import { Understanding } from '@/core/understanding';
import { HeyGenConfig } from '@/types/generation';
import { PollSchedule } from '@/utils/poll';
import { Sandbox } from '@/core/sandbox';
import { Lut } from '@/core/editor';
import {
  AuthenticationError,
  InvalidRequestError,
  JobTimeoutError,
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
    const still = () => ({ data: { status: 'processing' } });
    fakeAxios([processing, still, still]);
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

describe('server-paced polling', () => {
  /** Fake clock: each sleep advances performance.now by its delay and resolves at once. */
  let delays: number[];
  beforeEach(() => {
    delays = [];
    let now = 1_000_000;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    jest.spyOn(global, 'setTimeout').mockImplementation(((
      fn: () => void,
      ms: number
    ) => {
      delays.push(ms);
      now += ms;
      fn();
      return 0;
    }) as never);
  });
  afterEach(() => jest.restoreAllMocks());

  const still = (data: Record<string, unknown>) => () => ({
    data: { status: 'processing', data },
  });

  it('waits the retry_after hint between polls instead of the flat 5s', async () => {
    fakeAxios([
      still({ output_url: 'https://out/1' }),
      still({ retry_after: 2 }),
      () => ({
        data: { status: 'processing' },
        headers: { 'retry-after': '7' },
      }),
      ok({ id: 'c-1' }),
    ]);
    const res = await connect('sk-test').vhttp.get(['x']);
    expect(res.data).toEqual({ id: 'c-1' });
    expect(delays).toEqual([2000, 7000]);
  });

  it('keeps a caller deadline even when the server advertises a longer max_wait', async () => {
    const poll = still({ retry_after: 4, max_wait: 3600 });
    fakeAxios([still({ output_url: 'https://out/1' }), poll, poll, poll, poll]);
    const err = await connect('sk-test')
      .vhttp.get(['x'], undefined, { maxPollTime: 10_000 })
      .catch(e => e);
    expect(err).toBeInstanceOf(JobTimeoutError);
    expect(delays).toEqual([4000, 4000, 2000]);
  });

  it('GenerationJob.wait throws JobTimeoutError carrying the job handle', async () => {
    const data = { outputUrl: 'https://out/j-1', retryAfter: 3 };
    const http = {
      get: () => Promise.resolve({ success: true, status: 'processing', data }),
    } as unknown as HttpClient;
    const err = await new GenerationJob(http, { jobId: 'j-1' })
      .wait(5)
      .catch(e => e);
    expect(err).toBeInstanceOf(JobTimeoutError);
    expect(err).toBeInstanceOf(RequestTimeoutError);
    expect(err.name).toBe('JobTimeoutError');
    expect(err.jobId).toBe('j-1');
    expect(err.outputUrl).toBe('https://out/j-1');
    expect(err.response).toBe(data);
    expect(err.data).toEqual({ jobId: 'j-1', outputUrl: 'https://out/j-1' });
    expect(err.message).toContain(
      'Generation job j-1 did not complete within 5s'
    );
    expect(delays).toEqual([3000, 2000]);
  });

  it('treats partial and cancelled understanding runs as finished', async () => {
    for (const status of ['partial', 'cancelled']) {
      const http = {
        get: () => Promise.resolve({ data: { status } }),
      } as unknown as HttpClient;
      const u = new Understanding(http, 'm-1', { id: 'u-1' });
      await expect(u.waitUntilComplete()).resolves.toBe(u);
      expect(u.isComplete).toBe(true);
      expect(u.isSuccessful).toBe(false);
    }
    expect(delays).toEqual([]);
  });

  it("waits the accept response's retry_after before the first poll", async () => {
    fakeAxios([
      still({ output_url: 'https://out/1', retry_after: 3 }),
      ok({ id: 'c-1' }),
    ]);
    const res = await connect('sk-test').vhttp.get(['x']);
    expect(res.data).toEqual({ id: 'c-1' });
    expect(delays).toEqual([3000]);
  });

  it("GenerationJob.wait honours the create response's hint once", async () => {
    let calls = 0;
    const http = {
      get: () => {
        calls += 1;
        return Promise.resolve({ status: 'done', data: { id: 'a-1' } });
      },
    } as unknown as HttpClient;
    await new GenerationJob(http, {
      jobId: 'j-1',
      data: { retryAfter: 4 },
    }).wait();
    expect(delays).toEqual([4000]);
    expect(calls).toBe(1);
  });

  it('an understanding timeout carries its id and a URL to resume from', async () => {
    const http = {
      baseURL: 'https://api.test/',
      get: () => Promise.resolve({ data: { status: 'processing' } }),
    } as unknown as HttpClient;
    const err = await new Understanding(http, 'm-1', { id: 'u-1' })
      .waitUntilComplete(25)
      .catch(e => e);
    expect(err).toBeInstanceOf(JobTimeoutError);
    expect(err.jobId).toBe('u-1');
    expect(err.outputUrl).toBe('https://api.test/video/m-1/understand/u-1');
    expect(delays).toEqual([10000, 10000, 5000]);
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

describe('HeyGen config', () => {
  const sentConfig = async (options: object) => {
    const { bodies, client } = recorder({ id: 'm-1' });
    await new Collection(client, { id: 'c-1' } as never).generateVideo(
      'Hi',
      5,
      undefined,
      options
    );
    return (bodies[0] as { config: unknown }).config;
  };

  it('sends camelCase options under the keys the API expects', async () => {
    const config = { audioId: 'a-1', talkingStyle: 'expressive' as const };
    const wire = { audio_id: 'a-1', talking_style: 'expressive' };
    expect(
      await sentConfig({ model: 'heygen', config: new HeyGenConfig(config) })
    ).toEqual(wire);
    expect(await sentConfig({ model: 'heygen', config })).toEqual(wire);
  });

  it('passes API keys and unlisted options through unchanged', async () => {
    const config = { audio_id: 'a-1', newOption: 1, caption: true };
    expect(await sentConfig({ model: 'heygen', config })).toEqual(config);
  });

  it('maps a plain config whatever the casing of the model name', async () => {
    const config = { audioId: 'a-1' };
    expect(await sentConfig({ model: ' HeyGen ', config })).toEqual({
      audio_id: 'a-1',
    });
  });

  it('rejects both spellings of one option', () => {
    for (const options of [
      { audioId: 'a-1', audio_id: 'a-2' },
      { audio_id: 'a-2', audioId: 'a-1' },
    ]) {
      expect(() => new HeyGenConfig(options as never).toDict()).toThrow(
        /audioId or audio_id, not both/
      );
    }
  });

  it("leaves another model's config alone", async () => {
    const config = { audioId: 'a-1' };
    expect(await sentConfig({ model: 'seedance', config })).toEqual(config);
  });

  it('sends imageId as image_id, and only when set', async () => {
    const { bodies, client } = recorder({ id: 'm-1' });
    const coll = new Collection(client, { id: 'c-1' } as never);
    await coll.generateVideo('Hi', 5, undefined, {
      model: 'heygen',
      imageId: 'img-1',
    });
    await coll.generateVideo('a cat', 6);
    expect(bodies[0]).toMatchObject({ model: 'heygen', image_id: 'img-1' });
    expect(bodies[0]).not.toHaveProperty('image_url');
    expect(bodies[1]).not.toHaveProperty('image_id');
  });
});

describe('poll deadline', () => {
  afterEach(() => jest.restoreAllMocks());

  it('ignores system clock changes', () => {
    let wall = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => wall);
    const schedule = new PollSchedule({ maxPollTime: 60_000 });
    wall += 3_600_000;
    expect(schedule.expired).toBe(false);
  });
});

describe('sandbox', () => {
  const sandboxWith = (...states: Record<string, unknown>[]) => {
    const http = {
      get: () =>
        Promise.resolve({
          data: states.length > 1 ? states.shift() : states[0],
        }),
    } as unknown as HttpClient;
    return new Sandbox(http, { sandboxId: 'bx_test' });
  };

  it('keeps the failure reason and puts it in the terminal error', async () => {
    const sbx = sandboxWith({ status: 'failed', error: 'Out of capacity' });
    const err = await sbx.waitForReady(0).catch(e => e);
    expect(err.message).toContain(
      'entered terminal state: failed. Out of capacity'
    );
    expect(sbx.error).toBe('Out of capacity');
  });

  it('says a timed-out wait can resume on the same sandbox', async () => {
    const sbx = sandboxWith({ status: 'provisioning' });
    const err = await sbx.waitForReady(0).catch(e => e);
    expect(err).toBeInstanceOf(RequestTimeoutError);
    expect(err.message).toContain('same sandbox ID');
  });
});

describe('Lut source', () => {
  it('leaves a URL alone and reports a local path', async () => {
    const url = new Lut({ src: 'https://x/grade.cube' });
    expect(url.isLocal()).toBe(false);
    await expect(url.upload({} as HttpClient)).resolves.toBe(
      'https://x/grade.cube'
    );
    expect(new Lut({ src: './grade.cube' }).isLocal()).toBe(true);
  });

  it('fails clearly when a local file is missing', async () => {
    const err = await new Lut({ src: './missing.cube' })
      .upload({} as HttpClient)
      .catch(e => e);
    expect(err.message).toContain('Failed to read LUT file');
  });
});
