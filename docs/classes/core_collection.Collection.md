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

- [deleteAudio](core_collection.Collection.md#deleteaudio)
- [deleteImage](core_collection.Collection.md#deleteimage)
- [deleteVideo](core_collection.Collection.md#deletevideo)
- [getAudio](core_collection.Collection.md#getaudio)
- [getAudios](core_collection.Collection.md#getaudios)
- [getImage](core_collection.Collection.md#getimage)
- [getImages](core_collection.Collection.md#getimages)
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

[src/core/collection.ts:40](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L40)

## Properties

### meta

• **meta**: [`CollectionBase`](../interfaces/interfaces_core.CollectionBase.md)

#### Implementation of

[ICollection](../interfaces/interfaces_core.ICollection.md).[meta](../interfaces/interfaces_core.ICollection.md#meta)

#### Defined in

[src/core/collection.ts:37](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L37)

## Methods

### deleteAudio

▸ **deleteAudio**(`audioId`): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `audioId` | `string` |

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

A promise that resolves when delete is successful

**`Throws`**

an error if the request fails

#### Defined in

[src/core/collection.ts:130](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L130)

___

### deleteImage

▸ **deleteImage**(`imageId`): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `imageId` | `string` |

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

A promise that resolves when delete is successful

**`Throws`**

an error if the request fails

#### Defined in

[src/core/collection.ts:177](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L177)

___

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

[src/core/collection.ts:83](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L83)

___

### getAudio

▸ **getAudio**(`audioId`): `Promise`\<[`Audio`](core_audio.Audio.md)\>

Get all the information for a specific audio

#### Parameters

| Name | Type |
| :------ | :------ |
| `audioId` | `string` |

#### Returns

`Promise`\<[`Audio`](core_audio.Audio.md)\>

An object of the Audio class

**`Throws`**

an error if the request fails

#### Defined in

[src/core/collection.ts:113](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L113)

___

### getAudios

▸ **getAudios**(): `Promise`\<[`Audio`](core_audio.Audio.md)[]\>

Get all audios from the collection

#### Returns

`Promise`\<[`Audio`](core_audio.Audio.md)[]\>

A list of objects of the Audio class

**`Throws`**

an error if the request fails

#### Defined in

[src/core/collection.ts:96](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L96)

___

### getImage

▸ **getImage**(`imageId`): `Promise`\<[`Image`](core_image.Image.md)\>

Get all the information for a specific image

#### Parameters

| Name | Type |
| :------ | :------ |
| `imageId` | `string` |

#### Returns

`Promise`\<[`Image`](core_image.Image.md)\>

An object of the Image class

**`Throws`**

an error if the request fails

#### Defined in

[src/core/collection.ts:160](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L160)

___

### getImages

▸ **getImages**(): `Promise`\<[`Image`](core_image.Image.md)[]\>

Get all images from the collection

#### Returns

`Promise`\<[`Image`](core_image.Image.md)[]\>

A list of objects of the Image class

**`Throws`**

an error if the request fails

#### Defined in

[src/core/collection.ts:143](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L143)

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

[src/core/collection.ts:66](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L66)

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

[src/core/collection.ts:49](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L49)

___

### search

▸ **search**(`query`, `searchType?`, `indexType?`, `resultThreshold?`, `scoreThreshold?`): `Promise`\<[`SearchResult`](core_search_searchResult.SearchResult.md)\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `query` | `string` | Search query |
| `searchType?` | ``"keyword"`` \| ``"semantic"`` | [optional] Type of search to be performed |
| `indexType?` | ``"scene"`` \| ``"spoken"`` | - |
| `resultThreshold?` | `number` | [optional] Result Threshold |
| `scoreThreshold?` | `number` | [optional] Score Threshold |

#### Returns

`Promise`\<[`SearchResult`](core_search_searchResult.SearchResult.md)\>

#### Implementation of

[ICollection](../interfaces/interfaces_core.ICollection.md).[search](../interfaces/interfaces_core.ICollection.md#search)

#### Defined in

[src/core/collection.ts:220](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L220)

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

[src/core/collection.ts:196](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L196)

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

[src/core/collection.ts:210](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/collection.ts#L210)
