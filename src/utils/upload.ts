import { ApiPath } from '@/constants';
import type { UploadConfig } from '@/types/collection';
import type { GetUploadUrl } from '@/types/response';
import { VideodbError } from '@/utils/error';
import { UploadJob } from '@/utils/job';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { HttpClient } from './httpClient';

const { upload_url, collection, upload } = ApiPath;

/**
 * Get an upload URL. Use this to upload your video to
 * VideoDB's storage.
 * @returns A URL that can be used to upload a video.
 * The uploaded video will be available on the same URL
 * @see This won't save directly save your
 * video to the database. Call uploadVideoByUrl once
 * with the returned URL for the video to be saved.
 */
export const getUploadUrl = async (http: HttpClient, collectionId: string) => {
  const res = await http.get<GetUploadUrl>([
    collection,
    collectionId,
    upload_url,
  ]);
  const { data } = res;
  return data.upload_url;
};

/**
 * @param filePath - absolute path to a file
 * @param url - a url to a pre-uploaded file
 * @param callbackUrl-  A url that will be called once upload is finished
 * @param name - Name of the file
 * @param description - Description of the file
 */
export const uploadToServer = async (
  http: HttpClient,
  collectionId: string,
  data: UploadConfig
) => {
  let urlToUpload = '';
  if ('filePath' in data) {
    const uploadUrl = await getUploadUrl(http, collectionId);
    try {
      const fileStream = createReadStream(data.filePath);
      const formData = new FormData();
      formData.append('file', fileStream);
      await http.post<unknown, FormData>([uploadUrl], formData, {
        headers: formData.getHeaders(),
      });
    } catch (err) {
      throw new VideodbError('Upload failed, reason: ', err);
    }
    urlToUpload = uploadUrl;
  } else {
    urlToUpload = data.url;
  }

  const finalData = {
    url: urlToUpload,
    name: data.name,
    description: data.description,
    callback_url: data.callbackUrl,
  };

  if (finalData.callback_url) {
    await http.post<Record<string, never>, typeof finalData>(
      [collection, collectionId, upload],
      finalData
    );
  } else {
    return new UploadJob(finalData, collectionId, http);
  }
};
