[videodb](../README.md) / [Exports](../modules.md) / [core/collection](../modules/core_collection.md) / Collection

# Class: Collection

[core/collection](../modules/core_collection.md).Collection

The base VideoDB class

**`Remarks`**

The base class through which all videodb actions are possible

## Implements

- [`ICollection`](../interfaces/interfaces_core.ICollection.md)

## Table of contents

### Constructors

- [constructor](core_collection.Collection.md#constructor)

### Properties

- [meta](core_collection.Collection.md#meta)

### Methods

- [deleteVideo](core_collection.Collection.md#deletevideo)
- [getVideo](core_collection.Collection.md#getvideo)
- [getVideos](core_collection.Collection.md#getvideos)
- [search](core_collection.Collection.md#search)
- [uploadFile](core_collection.Collection.md#uploadfile)
- [uploadURL](core_collection.Collection.md#uploadurl)

## Constructors

### constructor

• **new Collection**(`http`, `data`): [`Collection`](core_collection.Collection.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) |
| `data` | [`CollectionBase`](../interfaces/interfaces_core.CollectionBase.md) |

#### Returns

[`Collection`](core_collection.Collection.md)

#### Defined in

src/core/collection.ts:23

## Properties

### meta

• **meta**: [`CollectionBase`](../interfaces/interfaces_core.CollectionBase.md)

#### Implementation of

[ICollection](../interfaces/interfaces_core.ICollection.md).[meta](../interfaces/interfaces_core.ICollection.md#meta)

#### Defined in

src/core/collection.ts:20

## Methods

### deleteVideo

▸ **deleteVideo**(`videoId`): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `videoId` | `string` | Id of the video to be deleted |

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

A promise that resolves when delete is successful

**`Throws`**

an error if the request fails

#### Implementation of

[ICollection](../interfaces/interfaces_core.ICollection.md).[deleteVideo](../interfaces/interfaces_core.ICollection.md#deletevideo)

#### Defined in

src/core/collection.ts:60

___

### getVideo

▸ **getVideo**(`videoId`): `Promise`\<[`Video`](core_video.Video.md)\>

Get all the information for a specific video

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `videoId` | `string` | Unique ID of the video. |

#### Returns

`Promise`\<[`Video`](core_video.Video.md)\>

An object of the Video class

**`Throws`**

an error if the request fails

#### Implementation of

[ICollection](../interfaces/interfaces_core.ICollection.md).[getVideo](../interfaces/interfaces_core.ICollection.md#getvideo)

#### Defined in

src/core/collection.ts:48

___

### getVideos

▸ **getVideos**(): `Promise`\<[`Video`](core_video.Video.md)[]\>

Get all videos from the collection

#### Returns

`Promise`\<[`Video`](core_video.Video.md)[]\>

A list of objects of the Video class

**`Throws`**

an error if the request fails

#### Implementation of

[ICollection](../interfaces/interfaces_core.ICollection.md).[getVideos](../interfaces/interfaces_core.ICollection.md#getvideos)

#### Defined in

src/core/collection.ts:33

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

[ICollection](../interfaces/interfaces_core.ICollection.md).[search](../interfaces/interfaces_core.ICollection.md#search)

#### Defined in

src/core/collection.ts:98

___

### uploadFile

▸ **uploadFile**(`data`): `Promise`\<`undefined` \| [`UploadJob`](utils_job.UploadJob.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`FileUploadConfig`](../interfaces/types_collection.FileUploadConfig.md) |

#### Returns

`Promise`\<`undefined` \| [`UploadJob`](utils_job.UploadJob.md)\>

**`See`**

Providing a callbackUrl will return undefined and not providing one
will return a Job object (TODO: Implement proper type for this condition)

#### Implementation of

[ICollection](../interfaces/interfaces_core.ICollection.md).[uploadFile](../interfaces/interfaces_core.ICollection.md#uploadfile)

#### Defined in

src/core/collection.ts:74

___

### uploadURL

▸ **uploadURL**(`data`): `Promise`\<`undefined` \| [`UploadJob`](utils_job.UploadJob.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`URLUploadConfig`](../interfaces/types_collection.URLUploadConfig.md) |

#### Returns

`Promise`\<`undefined` \| [`UploadJob`](utils_job.UploadJob.md)\>

**`See`**

Providing a callbackUrl will return undefined and not providing one
will return a Job object (TODO: Implement proper type for this condition)

#### Implementation of

[ICollection](../interfaces/interfaces_core.ICollection.md).[uploadURL](../interfaces/interfaces_core.ICollection.md#uploadurl)

#### Defined in

src/core/collection.ts:88
