import { ApiPath } from '@/constants';
import { InvalidRequestError, RequestTimeoutError } from '@/utils/error';
import { HttpClient } from '@/utils/httpClient';
import { sleep } from '@/utils';
import { Audio } from '@/core/audio';
import { Image } from '@/core/image';
import type { AudioBase, ImageBase } from '@/interfaces/core';

const { job } = ApiPath;

/** Normalized job-status envelope, mirroring `Connection.get_job_status`. */
export interface JobStatus {
  success: boolean;
  status: string;
  data: Record<string, unknown>;
  message?: string;
}

export type JobData = Record<string, unknown> & {
  id?: string;
  jobId?: string;
  jobType?: string;
  status?: string;
  outputUrl?: string;
};

/**
 * Fetch and normalize the status of a generation job.
 * Mirrors `Connection.get_job_status` — reads the raw `/job/{id}` envelope
 * without polling and synthesizes a status when the server omits one.
 */
export const fetchJobStatus = async (
  http: HttpClient,
  jobId: string
): Promise<JobStatus> => {
  const res = await http.get<JobData>([job, jobId], undefined, { wait: false });
  const envelope = res as unknown as {
    success?: boolean;
    status?: string;
    message?: string;
  };
  const data = (res.data as JobData) || {};
  const success = Boolean(envelope.success);
  let status = envelope.status || data.status;
  if (!status) {
    status = success ? 'done' : 'failed';
  }
  return { success, status, data, message: envelope.message };
};

/** Config accepted by the {@link GenerationJob} constructor. */
export interface GenerationJobConfig {
  jobId: string;
  outputUrl?: string;
  status?: string;
  resultType?: string;
  data?: JobData;
}

/**
 * A self-inference generation job.
 * Mirrors `videodb.job.GenerationJob`.
 *
 * OmniVoice TTS and FLUX image generation return a VideoDB job after the
 * initial server-side async task dispatches work to inference-core. Use
 * {@link wait} to poll until the final asset is ready.
 */
export class GenerationJob {
  public id: string;
  public jobId: string;
  public outputUrl?: string;
  public status: string;
  public resultType?: string;
  public data: JobData;
  #vhttp: HttpClient;

  constructor(http: HttpClient, config: GenerationJobConfig) {
    this.#vhttp = http;
    this.id = config.jobId;
    this.jobId = config.jobId;
    this.outputUrl = config.outputUrl;
    this.status = config.status || 'processing';
    this.resultType = config.resultType;
    this.data = config.data || {};
  }

  /**
   * Create a job from an API job payload (camelCased response data).
   */
  static fromData(
    http: HttpClient,
    data: JobData,
    resultType?: string
  ): GenerationJob {
    const payload = data || {};
    const jobId = payload.jobId || payload.id;
    if (!jobId) {
      throw new InvalidRequestError(
        'Invalid generation job response: missing job_id'
      );
    }
    let inferredResultType = resultType;
    if (!inferredResultType) {
      if (payload.jobType === 'tts') inferredResultType = 'audio';
      else if (payload.jobType === 'image') inferredResultType = 'image';
    }
    return new GenerationJob(http, {
      jobId,
      outputUrl: payload.outputUrl,
      status: (payload.status as string) || 'processing',
      resultType: inferredResultType,
      data: payload,
    });
  }

  /**
   * Refresh this job's status from VideoDB.
   */
  public refresh = async (): Promise<GenerationJob> => {
    const jobStatus = await fetchJobStatus(this.#vhttp, this.jobId);
    this.status = jobStatus.status || this.status;
    this.data = (jobStatus.data as JobData) || {};
    this.outputUrl = this.data.outputUrl ?? this.outputUrl;
    if (!this.resultType) {
      if (this.data.jobType === 'tts') this.resultType = 'audio';
      else if (this.data.jobType === 'image') this.resultType = 'image';
    }
    return this;
  };

  /**
   * Poll this job until it completes and return the generated asset.
   *
   * @param timeout - Maximum seconds to wait (default 600)
   * @param interval - Seconds between polls (default 5)
   * @returns An {@link Audio}, {@link Image}, or the final job data if the
   *   result type cannot be inferred.
   * @throws {RequestTimeoutError} If the job does not complete in time
   * @throws {InvalidRequestError} If the job ends in the `failed` status
   */
  public wait = async (
    timeout: number = 600,
    interval: number = 5
  ): Promise<Audio | Image | JobData> => {
    const deadline = Date.now() + timeout * 1000;
    for (;;) {
      await this.refresh();
      if (this.status !== 'processing') break;
      if (Date.now() >= deadline) {
        throw new RequestTimeoutError(
          `Generation job ${this.jobId} did not complete within ${timeout} seconds`
        );
      }
      await sleep(interval * 1000);
    }

    if (this.status === 'failed') {
      throw new InvalidRequestError(`Generation job ${this.jobId} failed`);
    }

    return this.#toAsset();
  };

  #toAsset = (): Audio | Image | JobData => {
    const data = this.data || {};
    const assetId = data.id;
    if (this.resultType === 'audio' || assetId?.startsWith('a-')) {
      return new Audio(this.#vhttp, data as unknown as AudioBase);
    }
    if (this.resultType === 'image' || assetId?.startsWith('img-')) {
      return new Image(this.#vhttp, data as unknown as ImageBase);
    }
    return data;
  };

  public toString(): string {
    return `GenerationJob(jobId=${this.jobId}, status=${this.status}, resultType=${this.resultType})`;
  }
}
