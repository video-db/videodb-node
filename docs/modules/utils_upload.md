[videodb](../README.md) / [Exports](../modules.md) / utils/upload

# Module: utils/upload

## Table of contents

### Functions

- [getUploadUrl](utils_upload.md#getuploadurl)
- [uploadToServer](utils_upload.md#uploadtoserver)

## Functions

### getUploadUrl

▸ **getUploadUrl**(`http`, `collectionId`): `Promise`\<`string`\>

Get an upload URL. Use this to upload your video to
VideoDB's storage.

#### Parameters

| Name | Type |
| :------ | :------ |
| `http` | [`HttpClient`](../classes/utils_httpClient.HttpClient.md) |
| `collectionId` | `string` |

#### Returns

`Promise`\<`string`\>

A URL that can be used to upload a video.
The uploaded video will be available on the same URL

**`See`**

This won't save directly save your
video to the database. Call uploadVideoByUrl once
with the returned URL for the video to be saved.

#### Defined in

[src/utils/upload.ts:21](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/upload.ts#L21)

___

### uploadToServer

▸ **uploadToServer**(`http`, `collectionId`, `data`): `Promise`\<`undefined` \| [`UploadJob`](../classes/utils_job.UploadJob.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `http` | [`HttpClient`](../classes/utils_httpClient.HttpClient.md) |
| `collectionId` | `string` |
| `data` | [`UploadConfig`](types_collection.md#uploadconfig) |

#### Returns

`Promise`\<`undefined` \| [`UploadJob`](../classes/utils_job.UploadJob.md)\>

#### Defined in

[src/utils/upload.ts:38](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/upload.ts#L38)
