[videodb](../README.md) / [Exports](../modules.md) / index

# Module: index

## Table of contents

### References

- [Audio](index.md#audio)
- [AudioAsset](index.md#audioasset)
- [AudioAssetConfig](index.md#audioassetconfig)
- [Collection](index.md#collection)
- [Connection](index.md#connection)
- [Image](index.md#image)
- [ImageAsset](index.md#imageasset)
- [ImageAssetConfig](index.md#imageassetconfig)
- [IndexJob](index.md#indexjob)
- [SearchResult](index.md#searchresult)
- [Shot](index.md#shot)
- [SubtitleAlignment](index.md#subtitlealignment)
- [SubtitleBorderStyle](index.md#subtitleborderstyle)
- [TextAsset](index.md#textasset)
- [TextAssetConfig](index.md#textassetconfig)
- [Timeline](index.md#timeline)
- [TranscriptJob](index.md#transcriptjob)
- [UploadJob](index.md#uploadjob)
- [Video](index.md#video)
- [VideoAsset](index.md#videoasset)
- [VideoAssetConfig](index.md#videoassetconfig)
- [VideodbError](index.md#videodberror)
- [playStream](index.md#playstream)
- [waitForJob](index.md#waitforjob)

### Functions

- [connect](index.md#connect)

## References

### Audio

Re-exports [Audio](../classes/core_audio.Audio.md)

___

### AudioAsset

Re-exports [AudioAsset](../classes/core_asset.AudioAsset.md)

___

### AudioAssetConfig

Re-exports [AudioAssetConfig](types_config.md#audioassetconfig)

___

### Collection

Re-exports [Collection](../classes/core_collection.Collection.md)

___

### Connection

Re-exports [Connection](../classes/core_connection.Connection.md)

___

### Image

Re-exports [Image](../classes/core_image.Image.md)

___

### ImageAsset

Re-exports [ImageAsset](../classes/core_asset.ImageAsset.md)

___

### ImageAssetConfig

Re-exports [ImageAssetConfig](types_config.md#imageassetconfig)

___

### IndexJob

Re-exports [IndexJob](../classes/utils_job.IndexJob.md)

___

### SearchResult

Re-exports [SearchResult](../classes/core_search_searchResult.SearchResult.md)

___

### Shot

Re-exports [Shot](../classes/core_shot.Shot.md)

___

### SubtitleAlignment

Re-exports [SubtitleAlignment](../enums/core_config.SubtitleAlignment.md)

___

### SubtitleBorderStyle

Re-exports [SubtitleBorderStyle](../enums/core_config.SubtitleBorderStyle.md)

___

### TextAsset

Re-exports [TextAsset](../classes/core_asset.TextAsset.md)

___

### TextAssetConfig

Re-exports [TextAssetConfig](types_config.md#textassetconfig)

___

### Timeline

Re-exports [Timeline](../classes/core_timeline.Timeline.md)

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

### VideoAsset

Re-exports [VideoAsset](../classes/core_asset.VideoAsset.md)

___

### VideoAssetConfig

Re-exports [VideoAssetConfig](types_config.md#videoassetconfig)

___

### VideodbError

Re-exports [VideodbError](../classes/utils_error.VideodbError.md)

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

[src/index.ts:11](https://github.com/video-db/videodb-node/blob/583396d/src/index.ts#L11)
