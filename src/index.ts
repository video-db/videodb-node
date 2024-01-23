import { Connection } from '@/core/connection';
import { AuthenticationError } from '@/utils/error';
import { VIDEO_DB_API } from './constants';

/**
 * Entry function for the VideoDB SDK
 * @param apiKey - Your personal API Key. If you don't have one, get one from our {@link https://console.videodb.io | Console}
 * @param baseURL - Server base URL. If you're not sure what this is, skip it. We'll default to our own baseURL
 * @returns A Connection instance that can be used to fetch any collection
 */
function connect(apiKey?: string, baseURL = VIDEO_DB_API) {
  apiKey = apiKey || process.env.VIDEO_DB_API_KEY;
  if (!apiKey) {
    throw new AuthenticationError(
      'No API key provided. Set an API key either as an environment variable (VIDEO_DB_API_KEY) or pass it as an argument.'
    );
  }
  return new Connection(baseURL, apiKey);
}

export { Collection } from './core/collection';
export { Video } from './core/video';
export { Shot } from './core/shot';
export { IndexJob, UploadJob, TranscriptJob } from './utils/job';

export { playStream, waitForJob } from './utils/index';
export { connect };
