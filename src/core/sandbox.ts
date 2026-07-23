import { ApiPath, SandboxStatus } from '@/constants';
import { RequestTimeoutError, VideodbError } from '@/utils/error';
import { HttpClient } from '@/utils/httpClient';
import { sleep } from '@/utils';

const { sandbox } = ApiPath;

const TERMINAL_STATUSES: string[] = [
  SandboxStatus.stopped,
  SandboxStatus.failed,
];

/**
 * Plain-data shape a {@link Sandbox} is constructed from (camelCase).
 */
export interface SandboxBase {
  id?: string;
  sandboxId?: string;
  tier?: string;
  status?: string;
  name?: string;
  createdAt?: string;
  startedAt?: string;
  stoppedAt?: string;
}

/**
 * A persistent GPU compute pool for running inference jobs.
 * Mirrors `videodb.sandbox.Sandbox`.
 *
 * Create/list/get via {@link Connection}.
 */
export class Sandbox {
  public id?: string;
  public tier?: string;
  public status?: string;
  public name?: string;
  public createdAt?: string;
  public startedAt?: string;
  public stoppedAt?: string;
  #vhttp: HttpClient;

  constructor(http: HttpClient, data: SandboxBase = {}) {
    this.#vhttp = http;
    this.id = data.sandboxId ?? data.id;
    this.tier = data.tier;
    this.status = data.status;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.startedAt = data.startedAt;
    this.stoppedAt = data.stoppedAt;
  }

  #update = (data?: SandboxBase): void => {
    if (!data) return;
    this.id = data.sandboxId ?? data.id ?? this.id;
    this.tier = data.tier ?? this.tier;
    this.status = data.status ?? this.status;
    this.name = data.name ?? this.name;
    this.createdAt = data.createdAt ?? this.createdAt;
    this.startedAt = data.startedAt ?? this.startedAt;
    this.stoppedAt = data.stoppedAt ?? this.stoppedAt;
  };

  /**
   * Fetch latest sandbox state from the server.
   */
  public refresh = async (): Promise<Sandbox> => {
    const res = await this.#vhttp.get<SandboxBase>([sandbox, this.id ?? '']);
    this.#update(res.data);
    return this;
  };

  /**
   * Poll until the sandbox is active.
   *
   * @param timeout - Maximum seconds to wait (default 300)
   * @param interval - Seconds between polls (default 5)
   * @throws {RequestTimeoutError} If timeout is exceeded
   * @throws {InvalidRequestError} If the sandbox enters a terminal state
   */
  public waitForReady = async (
    timeout: number = 300,
    interval: number = 5
  ): Promise<Sandbox> => {
    const deadline = Date.now() + timeout * 1000;
    for (;;) {
      await this.refresh();
      if (this.status === SandboxStatus.active) return this;
      if (this.status && TERMINAL_STATUSES.includes(this.status)) {
        throw new VideodbError(
          `Sandbox ${this.id} entered terminal state: ${this.status}`
        );
      }
      if (Date.now() >= deadline) {
        throw new RequestTimeoutError(
          `Sandbox ${this.id} not ready within ${timeout}s`
        );
      }
      await sleep(interval * 1000);
    }
  };

  /**
   * Stop this sandbox.
   *
   * @param grace - Wait for running jobs to finish before teardown (default true)
   */
  public stop = async (grace: boolean = true): Promise<Sandbox> => {
    const res = await this.#vhttp.post<
      { data?: SandboxBase },
      { grace: boolean }
    >([sandbox, this.id ?? '', ApiPath.stop], { grace });
    this.#update(res.data?.data);
    return this;
  };

  /**
   * Poll until the sandbox is stopped.
   *
   * @param timeout - Maximum seconds to wait (default 120)
   * @param interval - Seconds between polls (default 5)
   * @throws {RequestTimeoutError} If timeout is exceeded
   */
  public waitForStop = async (
    timeout: number = 120,
    interval: number = 5
  ): Promise<Sandbox> => {
    const deadline = Date.now() + timeout * 1000;
    for (;;) {
      await this.refresh();
      if (this.status && TERMINAL_STATUSES.includes(this.status)) return this;
      if (Date.now() >= deadline) {
        throw new RequestTimeoutError(
          `Sandbox ${this.id} did not stop within ${timeout}s`
        );
      }
      await sleep(interval * 1000);
    }
  };

  public get isActive(): boolean {
    return this.status === SandboxStatus.active;
  }

  public get isReady(): boolean {
    return (
      this.status === SandboxStatus.provisioning ||
      this.status === SandboxStatus.active
    );
  }

  public toString(): string {
    return `Sandbox(id=${this.id}, tier=${this.tier}, status=${this.status}, name=${this.name})`;
  }
}
