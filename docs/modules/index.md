[videodb](../README.md) / [Exports](../modules.md) / index

# Module: index

## Table of contents

### References

- [Collection](index.md#collection)
- [IndexJob](index.md#indexjob)
- [Shot](index.md#shot)
- [TranscriptJob](index.md#transcriptjob)
- [UploadJob](index.md#uploadjob)
- [Video](index.md#video)
- [playStream](index.md#playstream)
- [waitForJob](index.md#waitforjob)

### Functions

- [connect](index.md#connect)

## References

### Collection

Re-exports [Collection](../classes/core_collection.Collection.md)

___

### IndexJob

Re-exports [IndexJob](../classes/utils_job.IndexJob.md)

___

### Shot

Re-exports [Shot](../classes/core_shot.Shot.md)

___

### TranscriptJob

Re-exports [TranscriptJob](../classes/utils_job.TranscriptJob.md)

___

### UploadJob

Re-exports [UploadJob](../classes/utils_job.UploadJob.md)

___

### Video

Re-exports [Video](../classes/core_video.Video.md)

___

### playStream

Re-exports [playStream](utils.md#playstream)

___

### waitForJob

Re-exports [waitForJob](utils.md#waitforjob)

## Functions

### connect

▸ **connect**(`apiKey?`, `baseURL?`): [`Connection`](../classes/core_connection.Connection.md)

Entry function for the VideoDB SDK

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `apiKey?` | `string` | `undefined` | Your personal API Key. If you don't have one, get one from our [Console](https://console.videodb.io) |
| `baseURL` | `string` | `VIDEO_DB_API` | Server base URL. If you're not sure what this is, skip it. We'll default to our own baseURL |

#### Returns

[`Connection`](../classes/core_connection.Connection.md)

A Connection instance that can be used to fetch any collection

#### Defined in

src/index.ts:11
