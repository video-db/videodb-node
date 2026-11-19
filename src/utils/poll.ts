/**
 * Polling helpers shared by the SDK's wait loops.
 * Mirrors `videodb._utils._poll`. Times here are milliseconds; the server's
 * `retry_after` / `max_wait` hints are seconds.
 *
 * Cadence precedence, highest first:
 * 1. an explicit interval from the caller;
 * 2. the server's hint, `retry_after` in the body or the `Retry-After`
 *    header, clamped to the configured band;
 * 3. the loop's own flat cadence.
 */
import { PollDefaults } from '@/constants';
import { JobTimeoutError } from '@/utils/error';

const toSeconds = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
};

const fromHolders = (
  source: unknown,
  keys: [string, string]
): number | null => {
  if (!source || typeof source !== 'object') return null;
  const body = source as Record<string, unknown>;
  for (const holder of [body, body.data]) {
    if (holder && typeof holder === 'object') {
      for (const key of keys) {
        const seconds = toSeconds((holder as Record<string, unknown>)[key]);
        if (seconds !== null) return seconds;
      }
    }
  }
  return null;
};

/**
 * The server's poll hint in seconds, or null if it sent none. `source` is a
 * response body (raw or camelCased) or anything with a `headers` map.
 */
export const retryAfterFrom = (source: unknown): number | null => {
  const fromBody = fromHolders(source, ['retry_after', 'retryAfter']);
  if (fromBody !== null) return fromBody;
  const headers = (source as { headers?: unknown } | null)?.headers;
  if (!headers || typeof headers !== 'object') return null;
  const h = headers as Record<string, unknown> & { get?: unknown };
  const value =
    typeof h.get === 'function'
      ? (h.get as (k: string) => unknown)('retry-after')
      : (h['retry-after'] ?? h['Retry-After']);
  return toSeconds(value);
};

/** The server's advisory ceiling for this job kind in seconds, if any. */
export const maxWaitFrom = (source: unknown): number | null =>
  fromHolders(source, ['max_wait', 'maxWait']);

export interface PollScheduleOptions {
  /** Force a fixed cadence (ms). Unset follows the server hint. */
  interval?: number;
  /** Deadline (ms). Unset uses `defaultMaxPollTime`, which `max_wait` may extend. */
  maxPollTime?: number;
  /** The loop's own cadence (ms) when the server sends no hint. */
  firstInterval?: number;
  factor?: number;
  maxInterval?: number;
  minInterval?: number;
  jitter?: number;
  /** The loop's own deadline (ms) when the caller passes none. */
  defaultMaxPollTime?: number;
}

/** Decides how long to wait before the next status check. */
export class PollSchedule {
  public interval: number | null;
  public maxPollTime: number;
  public polls = 0;
  #deadlineExplicit: boolean;
  #factor: number;
  #maxInterval: number;
  #minInterval: number;
  #jitter: number;
  #next: number;
  #start = Date.now();

  constructor(options: PollScheduleOptions = {}) {
    this.interval = options.interval != null ? options.interval : null;
    this.#deadlineExplicit = options.maxPollTime != null;
    this.maxPollTime =
      options.maxPollTime ??
      options.defaultMaxPollTime ??
      PollDefaults.maxPollTime;
    this.#factor = options.factor ?? PollDefaults.factor;
    this.#maxInterval = options.maxInterval ?? PollDefaults.maxInterval;
    this.#minInterval = options.minInterval ?? PollDefaults.minInterval;
    this.#jitter = options.jitter ?? PollDefaults.jitter;
    this.#next = options.firstInterval ?? PollDefaults.firstInterval;
  }

  public get elapsed(): number {
    return Date.now() - this.#start;
  }

  public get remaining(): number {
    return this.maxPollTime - this.elapsed;
  }

  public get expired(): boolean {
    return this.remaining <= 0;
  }

  /** Adopt a server-advertised ceiling unless the caller set a deadline. */
  public observe(source?: unknown): void {
    if (this.#deadlineExplicit) return;
    const advertised = maxWaitFrom(source);
    if (advertised && advertised * 1000 > this.maxPollTime) {
      this.maxPollTime = advertised * 1000;
    }
  }

  /** Milliseconds to wait before the next check. */
  public nextDelay(source?: unknown): number {
    this.observe(source);
    let delay: number;
    if (this.interval !== null) {
      delay = this.interval;
    } else {
      const hint = retryAfterFrom(source);
      if (hint !== null) {
        delay = hint * 1000;
      } else {
        delay = this.#next;
        this.#next = Math.min(this.#next * this.#factor, this.#maxInterval);
      }
    }
    if (this.#jitter) {
      delay *= 1 + (Math.random() * 2 - 1) * this.#jitter;
    }
    delay = Math.max(this.#minInterval, Math.min(delay, this.#maxInterval));
    if (this.remaining > 0) {
      delay = Math.min(delay, Math.max(this.remaining, this.#minInterval));
    }
    return Math.round(delay);
  }

  /** Wait for the next check and return how long we waited (ms). */
  public async sleep(source?: unknown): Promise<number> {
    const delay = this.nextDelay(source);
    this.polls += 1;
    await new Promise(resolve => setTimeout(resolve, delay));
    return delay;
  }

  /** Throw {@link JobTimeoutError} once the deadline has passed. */
  public throwIfExpired(
    what: string = 'Job',
    handle: { outputUrl?: string; jobId?: string; lastResponse?: unknown } = {}
  ): void {
    this.observe(handle.lastResponse);
    if (!this.expired) return;
    throw new JobTimeoutError(
      `${what} did not complete within ${Math.floor(this.maxPollTime / 1000)}s ` +
        `(polled ${this.polls} times). The job is still running on ` +
        `VideoDB; poll ${handle.outputUrl || 'its outputUrl'} to pick it up.`,
      {
        outputUrl: handle.outputUrl,
        jobId: handle.jobId,
        response: handle.lastResponse,
      }
    );
  }
}
