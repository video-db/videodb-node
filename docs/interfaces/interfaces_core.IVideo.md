[videodb](../README.md) / [Exports](../modules.md) / [interfaces/core](../modules/interfaces_core.md) / IVideo

# Interface: IVideo

[interfaces/core](../modules/interfaces_core.md).IVideo

Video class interface for reference

## Implemented by

- [`Video`](../classes/core_video.Video.md)

## Table of contents

### Properties

- [addSubtitle](interfaces_core.IVideo.md#addsubtitle)
- [generateStream](interfaces_core.IVideo.md#generatestream)
- [generateThumbnail](interfaces_core.IVideo.md#generatethumbnail)
- [getTranscript](interfaces_core.IVideo.md#gettranscript)
- [indexScenes](interfaces_core.IVideo.md#indexscenes)
- [indexSpokenWords](interfaces_core.IVideo.md#indexspokenwords)
- [meta](interfaces_core.IVideo.md#meta)
- [play](interfaces_core.IVideo.md#play)
- [search](interfaces_core.IVideo.md#search)
- [transcript](interfaces_core.IVideo.md#transcript)

## Properties

### addSubtitle

• **addSubtitle**: (`config`: [`SubtitleStyleProps`](../modules/types_config.md#subtitlestyleprops)) => `Promise`\<`string`\>

#### Type declaration

▸ (`config`): `Promise`\<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`SubtitleStyleProps`](../modules/types_config.md#subtitlestyleprops) |

##### Returns

`Promise`\<`string`\>

#### Defined in

[src/interfaces/core.ts:63](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L63)

___

### generateStream

• **generateStream**: (`timeline`: [`Timeline`](../modules/types_video.md#timeline)) => `Promise`\<`string`\>

#### Type declaration

▸ (`timeline`): `Promise`\<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `timeline` | [`Timeline`](../modules/types_video.md#timeline) |

##### Returns

`Promise`\<`string`\>

#### Defined in

[src/interfaces/core.ts:53](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L53)

___

### generateThumbnail

• **generateThumbnail**: () => `Promise`\<`string`\>

#### Type declaration

▸ (): `Promise`\<`string`\>

##### Returns

`Promise`\<`string`\>

#### Defined in

[src/interfaces/core.ts:62](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L62)

___

### getTranscript

• **getTranscript**: (`forceCreate?`: `boolean`) => [`Transcript`](../modules/types_video.md#transcript) \| [`TranscriptJob`](../classes/utils_job.TranscriptJob.md)

#### Type declaration

▸ (`forceCreate?`): [`Transcript`](../modules/types_video.md#transcript) \| [`TranscriptJob`](../classes/utils_job.TranscriptJob.md)

##### Parameters

| Name | Type |
| :------ | :------ |
| `forceCreate?` | `boolean` |

##### Returns

[`Transcript`](../modules/types_video.md#transcript) \| [`TranscriptJob`](../classes/utils_job.TranscriptJob.md)

#### Defined in

[src/interfaces/core.ts:55](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L55)

___

### indexScenes

• **indexScenes**: (`config`: [`IndexSceneConfig`](../modules/types_config.md#indexsceneconfig)) => [`IndexJob`](../classes/utils_job.IndexJob.md)

#### Type declaration

▸ (`config`): [`IndexJob`](../classes/utils_job.IndexJob.md)

##### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`IndexSceneConfig`](../modules/types_config.md#indexsceneconfig) |

##### Returns

[`IndexJob`](../classes/utils_job.IndexJob.md)

#### Defined in

[src/interfaces/core.ts:57](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L57)

___

### indexSpokenWords

• **indexSpokenWords**: () => [`IndexJob`](../classes/utils_job.IndexJob.md)

#### Type declaration

▸ (): [`IndexJob`](../classes/utils_job.IndexJob.md)

##### Returns

[`IndexJob`](../classes/utils_job.IndexJob.md)

#### Defined in

[src/interfaces/core.ts:56](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L56)

___

### meta

• **meta**: [`VideoBase`](interfaces_core.VideoBase.md)

#### Defined in

[src/interfaces/core.ts:51](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L51)

___

### play

• **play**: () => `string`

#### Type declaration

▸ (): `string`

##### Returns

`string`

#### Defined in

[src/interfaces/core.ts:54](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L54)

___

### search

• **search**: (`query`: `string`, `searchType?`: [`SearchTypeValues`](../enums/core_search.SearchTypeValues.md)) => `Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

#### Type declaration

▸ (`query`, `searchType?`): `Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `searchType?` | [`SearchTypeValues`](../enums/core_search.SearchTypeValues.md) |

##### Returns

`Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

#### Defined in

[src/interfaces/core.ts:58](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L58)

___

### transcript

• `Optional` **transcript**: [`Transcript`](../modules/types_video.md#transcript)

#### Defined in

[src/interfaces/core.ts:52](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L52)
