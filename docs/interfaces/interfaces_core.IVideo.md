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
- [index](interfaces_core.IVideo.md#index)
- [meta](interfaces_core.IVideo.md#meta)
- [play](interfaces_core.IVideo.md#play)
- [search](interfaces_core.IVideo.md#search)
- [transcript](interfaces_core.IVideo.md#transcript)

## Properties

### addSubtitle

• **addSubtitle**: () => `Promise`\<`string`\>

#### Type declaration

▸ (): `Promise`\<`string`\>

##### Returns

`Promise`\<`string`\>

#### Defined in

src/interfaces/core.ts:56

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

src/interfaces/core.ts:50

___

### generateThumbnail

• **generateThumbnail**: () => `Promise`\<`string`\>

#### Type declaration

▸ (): `Promise`\<`string`\>

##### Returns

`Promise`\<`string`\>

#### Defined in

src/interfaces/core.ts:55

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

src/interfaces/core.ts:52

___

### index

• **index**: (`indexType`: ``"semantic"``) => [`IndexJob`](../classes/utils_job.IndexJob.md)

#### Type declaration

▸ (`indexType`): [`IndexJob`](../classes/utils_job.IndexJob.md)

##### Parameters

| Name | Type |
| :------ | :------ |
| `indexType` | ``"semantic"`` |

##### Returns

[`IndexJob`](../classes/utils_job.IndexJob.md)

#### Defined in

src/interfaces/core.ts:53

___

### meta

• **meta**: [`VideoBase`](interfaces_core.VideoBase.md)

#### Defined in

src/interfaces/core.ts:48

___

### play

• **play**: () => `string`

#### Type declaration

▸ (): `string`

##### Returns

`string`

#### Defined in

src/interfaces/core.ts:51

___

### search

• **search**: (`query`: `string`, `type?`: ``"semantic"``) => `Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

#### Type declaration

▸ (`query`, `type?`): `Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `type?` | ``"semantic"`` |

##### Returns

`Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

#### Defined in

src/interfaces/core.ts:54

___

### transcript

• `Optional` **transcript**: [`Transcript`](../modules/types_video.md#transcript)

#### Defined in

src/interfaces/core.ts:49
