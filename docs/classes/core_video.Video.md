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

- [\_formatSceneCollectionData](core_video.Video.md#_formatscenecollectiondata)
- [addSubtitle](core_video.Video.md#addsubtitle)
- [delete](core_video.Video.md#delete)
- [deleteSceneCollection](core_video.Video.md#deletescenecollection)
- [deleteSceneIndex](core_video.Video.md#deletesceneindex)
- [extractScenes](core_video.Video.md#extractscenes)
- [generateStream](core_video.Video.md#generatestream)
- [generateThumbnail](core_video.Video.md#generatethumbnail)
- [getSceneCollection](core_video.Video.md#getscenecollection)
- [getSceneIndex](core_video.Video.md#getsceneindex)
- [getTranscript](core_video.Video.md#gettranscript)
- [indexScenes](core_video.Video.md#indexscenes)
- [indexSpokenWords](core_video.Video.md#indexspokenwords)
- [listSceneCollection](core_video.Video.md#listscenecollection)
- [listSceneIndex](core_video.Video.md#listsceneindex)
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

[src/core/video.ts:54](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L54)

## Properties

### meta

• **meta**: [`VideoBase`](../interfaces/interfaces_core.VideoBase.md)

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[meta](../interfaces/interfaces_core.IVideo.md#meta)

#### Defined in

[src/core/video.ts:45](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L45)

___

### transcript

• `Optional` **transcript**: [`Transcript`](../modules/types_video.md#transcript)

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[transcript](../interfaces/interfaces_core.IVideo.md#transcript)

#### Defined in

[src/core/video.ts:46](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L46)

## Methods

### \_formatSceneCollectionData

▸ **_formatSceneCollectionData**(`sceneCollectionData`): [`SceneCollection`](core_scene.SceneCollection.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sceneCollectionData` | `any` |

#### Returns

[`SceneCollection`](core_scene.SceneCollection.md)

#### Defined in

[src/core/video.ts:165](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L165)

___

### addSubtitle

▸ **addSubtitle**(`config?`): `Promise`\<`string`\>

Overlays subtitles on top of a video

#### Parameters

| Name | Type |
| :------ | :------ |
| `config?` | `Partial`\<[`SubtitleStyleProps`](../modules/types_config.md#subtitlestyleprops)\> |

#### Returns

`Promise`\<`string`\>

an awaited stream url for subtitled overlayed video

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[addSubtitle](../interfaces/interfaces_core.IVideo.md#addsubtitle)

#### Defined in

[src/core/video.ts:344](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L344)

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

[src/core/video.ts:91](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L91)

___

### deleteSceneCollection

▸ **deleteSceneCollection**(`sceneCollectionId`): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sceneCollectionId` | `string` |

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`unknown`\>\>

#### Defined in

[src/core/video.ts:256](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L256)

___

### deleteSceneIndex

▸ **deleteSceneIndex**(`sceneIndexId`): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`unknown`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sceneIndexId` | `string` |

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`unknown`\>\>

#### Defined in

[src/core/video.ts:328](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L328)

___

### extractScenes

▸ **extractScenes**(`config?`): `Promise`\<[`SceneCollection`](core_scene.SceneCollection.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Partial`\<[`ExtractSceneConfig`](../modules/types_config.md#extractsceneconfig)\> |

#### Returns

`Promise`\<[`SceneCollection`](core_scene.SceneCollection.md)\>

#### Defined in

[src/core/video.ts:202](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L202)

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

[src/core/video.ts:103](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L103)

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

[src/core/video.ts:125](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L125)

___

### getSceneCollection

▸ **getSceneCollection**(`sceneCollectionId`): `Promise`\<[`SceneCollection`](core_scene.SceneCollection.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sceneCollectionId` | `string` |

#### Returns

`Promise`\<[`SceneCollection`](core_scene.SceneCollection.md)\>

#### Defined in

[src/core/video.ts:244](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L244)

___

### getSceneIndex

▸ **getSceneIndex**(`sceneIndexId`): `Promise`\<[`SceneIndexRecords`](../modules/types.md#sceneindexrecords)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sceneIndexId` | `string` |

#### Returns

`Promise`\<[`SceneIndexRecords`](../modules/types.md#sceneindexrecords)\>

#### Defined in

[src/core/video.ts:306](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L306)

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

[src/core/video.ts:145](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L145)

___

### indexScenes

▸ **indexScenes**(`config?`): `Promise`\<`undefined` \| `string`\>

Indexs the video with scenes

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Partial`\<[`IndexSceneConfig`](../modules/types_config.md#indexsceneconfig)\> |

#### Returns

`Promise`\<`undefined` \| `string`\>

an awaited boolean signifying whether the process
was successful or not

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[indexScenes](../interfaces/interfaces_core.IVideo.md#indexscenes)

#### Defined in

[src/core/video.ts:271](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L271)

___

### indexSpokenWords

▸ **indexSpokenWords**(): [`IndexJob`](utils_job.IndexJob.md)

Indexs the video semantically

#### Returns

[`IndexJob`](utils_job.IndexJob.md)

an awaited boolean signifying whether the process
was successful or not

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[indexSpokenWords](../interfaces/interfaces_core.IVideo.md#indexspokenwords)

#### Defined in

[src/core/video.ts:156](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L156)

___

### listSceneCollection

▸ **listSceneCollection**(): `Promise`\<[`SnakeKeysToCamelCase`](../modules/utils.md#snakekeystocamelcase)\<\{ `config`: `object` ; `scene_collection_id`: `string` ; `status`: `string`  }\>[]\>

#### Returns

`Promise`\<[`SnakeKeysToCamelCase`](../modules/utils.md#snakekeystocamelcase)\<\{ `config`: `object` ; `scene_collection_id`: `string` ; `status`: `string`  }\>[]\>

#### Defined in

[src/core/video.ts:232](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L232)

___

### listSceneIndex

▸ **listSceneIndex**(): `Promise`\<[`SceneIndexes`](../modules/types.md#sceneindexes)\>

#### Returns

`Promise`\<[`SceneIndexes`](../modules/types.md#sceneindexes)\>

#### Defined in

[src/core/video.ts:293](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L293)

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

[src/core/video.ts:360](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L360)

___

### search

▸ **search**(`query`, `searchType?`, `indexType?`, `resultThreshold?`, `scoreThreshold?`): `Promise`\<[`SearchResult`](core_search_searchResult.SearchResult.md)\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `query` | `string` | Search query |
| `searchType?` | ``"keyword"`` \| ``"semantic"`` | - |
| `indexType?` | ``"scene"`` \| ``"spoken"`` | - |
| `resultThreshold?` | `number` | [optional] Result Threshold |
| `scoreThreshold?` | `number` | [optional] Score Threshold |

#### Returns

`Promise`\<[`SearchResult`](core_search_searchResult.SearchResult.md)\>

#### Implementation of

[IVideo](../interfaces/interfaces_core.IVideo.md).[search](../interfaces/interfaces_core.IVideo.md#search)

#### Defined in

[src/core/video.ts:66](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/video.ts#L66)
