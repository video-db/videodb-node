[videodb](../README.md) / [Exports](../modules.md) / [interfaces/core](../modules/interfaces_core.md) / ICollection

# Interface: ICollection

[interfaces/core](../modules/interfaces_core.md).ICollection

Collection class interface for reference

## Implemented by

- [`Collection`](../classes/core_collection.Collection.md)

## Table of contents

### Properties

- [deleteVideo](interfaces_core.ICollection.md#deletevideo)
- [getVideo](interfaces_core.ICollection.md#getvideo)
- [getVideos](interfaces_core.ICollection.md#getvideos)
- [meta](interfaces_core.ICollection.md#meta)
- [search](interfaces_core.ICollection.md#search)
- [uploadFile](interfaces_core.ICollection.md#uploadfile)
- [uploadURL](interfaces_core.ICollection.md#uploadurl)

## Properties

### deleteVideo

• **deleteVideo**: (`videoId`: `string`) => `Promise`\<`object`\>

#### Type declaration

▸ (`videoId`): `Promise`\<`object`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `videoId` | `string` |

##### Returns

`Promise`\<`object`\>

#### Defined in

[src/interfaces/core.ts:26](https://github.com/video-db/videodb-node/blob/583396d/src/interfaces/core.ts#L26)

___

### getVideo

• **getVideo**: (`videoId`: `string`) => `Promise`\<[`Video`](../classes/core_video.Video.md)\>

#### Type declaration

▸ (`videoId`): `Promise`\<[`Video`](../classes/core_video.Video.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `videoId` | `string` |

##### Returns

`Promise`\<[`Video`](../classes/core_video.Video.md)\>

#### Defined in

[src/interfaces/core.ts:25](https://github.com/video-db/videodb-node/blob/583396d/src/interfaces/core.ts#L25)

___

### getVideos

• **getVideos**: () => `Promise`\<[`Video`](../classes/core_video.Video.md)[]\>

#### Type declaration

▸ (): `Promise`\<[`Video`](../classes/core_video.Video.md)[]\>

##### Returns

`Promise`\<[`Video`](../classes/core_video.Video.md)[]\>

#### Defined in

[src/interfaces/core.ts:24](https://github.com/video-db/videodb-node/blob/583396d/src/interfaces/core.ts#L24)

___

### meta

• **meta**: [`CollectionBase`](interfaces_core.CollectionBase.md)

#### Defined in

[src/interfaces/core.ts:23](https://github.com/video-db/videodb-node/blob/583396d/src/interfaces/core.ts#L23)

___

### search

• **search**: (`query`: `string`, `searchType?`: ``"semantic"`` \| ``"keyword"`` \| ``"scene"``) => `Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

#### Type declaration

▸ (`query`, `searchType?`): `Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `searchType?` | ``"semantic"`` \| ``"keyword"`` \| ``"scene"`` |

##### Returns

`Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

#### Defined in

[src/interfaces/core.ts:29](https://github.com/video-db/videodb-node/blob/583396d/src/interfaces/core.ts#L29)

___

### uploadFile

• **uploadFile**: (`data`: [`FileUploadConfig`](types_collection.FileUploadConfig.md)) => `Promise`\<`void` \| [`UploadJob`](../classes/utils_job.UploadJob.md)\>

#### Type declaration

▸ (`data`): `Promise`\<`void` \| [`UploadJob`](../classes/utils_job.UploadJob.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`FileUploadConfig`](types_collection.FileUploadConfig.md) |

##### Returns

`Promise`\<`void` \| [`UploadJob`](../classes/utils_job.UploadJob.md)\>

#### Defined in

[src/interfaces/core.ts:27](https://github.com/video-db/videodb-node/blob/583396d/src/interfaces/core.ts#L27)

___

### uploadURL

• **uploadURL**: (`data`: [`URLUploadConfig`](types_collection.URLUploadConfig.md)) => `Promise`\<`void` \| [`UploadJob`](../classes/utils_job.UploadJob.md)\>

#### Type declaration

▸ (`data`): `Promise`\<`void` \| [`UploadJob`](../classes/utils_job.UploadJob.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`URLUploadConfig`](types_collection.URLUploadConfig.md) |

##### Returns

`Promise`\<`void` \| [`UploadJob`](../classes/utils_job.UploadJob.md)\>

#### Defined in

[src/interfaces/core.ts:28](https://github.com/video-db/videodb-node/blob/583396d/src/interfaces/core.ts#L28)
