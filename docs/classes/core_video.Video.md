[videodb](../README.md) / [Exports](../modules.md) / [core/video](../modules/core_video.md) / Video

# Class: Video

[core/video](../modules/core_video.md).Video

The base Video class

**`Remarks`**

Use this to initialize a video stored in videoDB

## Implements

- [`IVideo`](../interfaces/interfaces_core.IVideo.md)

## Table of contents

### Constructors

- [constructor](core_video.Video.md#constructor)

### Properties

- [meta](core_video.Video.md#meta)
- [transcript](core_video.Video.md#transcript)

### Methods

- [addSubtitle](core_video.Video.md#addsubtitle)
- [delete](core_video.Video.md#delete)
- [generateStream](core_video.Video.md#generatestream)
- [generateThumbnail](core_video.Video.md#generatethumbnail)
- [getTranscript](core_video.Video.md#gettranscript)
- [index](core_video.Video.md#index)
- [play](core_video.Video.md#play)
- [search](core_video.Video.md#search)

## Constructors

### constructor

• **new Video**(`http`, `data`): [`Video`](core_video.Video.md)

Initializes a videoDB Instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) | HttpClient object |
| `data` | [`VideoBase`](../interfaces/interfaces_core.VideoBase.md) | Data needed to initialize a video instance |

#### Returns

[`Video`](core_video.Video.md)

#### Defined in

src/core/video.ts:33

## Properties

### meta

• **meta**: [`VideoBase`](../interfaces/interfaces_core.VideoBase.md)

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[meta](../interfaces/interfaces_core.IVideo.md#meta)

#### Defined in

src/core/video.ts:24

___

### transcript

• `Optional` **transcript**: [`Transcript`](../modules/types_video.md#transcript)

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[transcript](../interfaces/interfaces_core.IVideo.md#transcript)

#### Defined in

src/core/video.ts:25

## Methods

### addSubtitle

▸ **addSubtitle**(): `Promise`\<`string`\>

Overlays subtitles on top of a video

#### Returns

`Promise`\<`string`\>

an awaited stream url for subtitled overlayed video

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[addSubtitle](../interfaces/interfaces_core.IVideo.md#addsubtitle)

#### Defined in

src/core/video.ts:145

___

### delete

▸ **delete**(): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

Returns an empty promise that resolves when the video is deleted

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

A promise that resolves when delete is successful

**`Throws`**

an InvalidRequestError if the request fails

#### Defined in

src/core/video.ts:66

___

### generateStream

▸ **generateStream**(`timeline?`): `Promise`\<`string`\>

Generates a new streaming URL with the given timeline.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `timeline?` | [`Timeline`](../modules/types_video.md#timeline) | Of the format [[start, end], [start, end]...] |

#### Returns

`Promise`\<`string`\>

a streaming URL

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[generateStream](../interfaces/interfaces_core.IVideo.md#generatestream)

#### Defined in

src/core/video.ts:78

___

### generateThumbnail

▸ **generateThumbnail**(): `Promise`\<`string`\>

Gets the thumbnail of the video or generates one if it doesn't exist.

#### Returns

`Promise`\<`string`\>

An awaited URL to the video's thumbnail

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[generateThumbnail](../interfaces/interfaces_core.IVideo.md#generatethumbnail)

#### Defined in

src/core/video.ts:100

___

### getTranscript

▸ **getTranscript**(`forceCreate?`): [`Transcript`](../modules/types_video.md#transcript) \| [`TranscriptJob`](utils_job.TranscriptJob.md)

Fetches the transcript of the video if it exists, generates one
if it doesn't.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `forceCreate` | `boolean` | `false` | Forces transcript generation even if it exists |

#### Returns

[`Transcript`](../modules/types_video.md#transcript) \| [`TranscriptJob`](utils_job.TranscriptJob.md)

A promise of -
- If the transcript exists, an object of the type Transcript
- If it doesn't, an instance of TranscriptJob which can be used
  to start transcript generation.

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[getTranscript](../interfaces/interfaces_core.IVideo.md#gettranscript)

#### Defined in

src/core/video.ts:120

___

### index

▸ **index**(`indexType?`): [`IndexJob`](utils_job.IndexJob.md)

Indexs the video with the given indexType

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `indexType?` | ``"semantic"`` | The type used to index the video |

#### Returns

[`IndexJob`](utils_job.IndexJob.md)

an awaited boolean signifying whether the process
was successful or not

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[index](../interfaces/interfaces_core.IVideo.md#index)

#### Defined in

src/core/video.ts:132

___

### play

▸ **play**(): `string`

Generates a new playable stream URL with the given timeline.

#### Returns

`string`

a URL that can be opened in browser

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[play](../interfaces/interfaces_core.IVideo.md#play)

#### Defined in

src/core/video.ts:159

___

### search

▸ **search**(`query`, `type?`, `resultThreshold?`, `scoreThreshold?`): `Promise`\<[`SearchResult`](core_search_searchResult.SearchResult.md)\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `query` | `string` | Search query |
| `type?` | ``"semantic"`` | [optional] Type of search to be performed |
| `resultThreshold?` | `number` | [optional] Result Threshold |
| `scoreThreshold?` | `number` | [optional] Score Threshold |

#### Returns

`Promise`\<[`SearchResult`](core_search_searchResult.SearchResult.md)\>

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[search](../interfaces/interfaces_core.IVideo.md#search)

#### Defined in

src/core/video.ts:44
