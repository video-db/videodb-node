[videodb](../README.md) / [Exports](../modules.md) / types/response

# Module: types/response

## Table of contents

### Type Aliases

- [AudioResponse](types_response.md#audioresponse)
- [CollectionResponse](types_response.md#collectionresponse)
- [ErrorResponse](types_response.md#errorresponse)
- [GenerateStreamResponse](types_response.md#generatestreamresponse)
- [GetAudios](types_response.md#getaudios)
- [GetCollections](types_response.md#getcollections)
- [GetImages](types_response.md#getimages)
- [GetSceneIndexResponse](types_response.md#getsceneindexresponse)
- [GetUploadUrl](types_response.md#getuploadurl)
- [GetVideos](types_response.md#getvideos)
- [ImageResponse](types_response.md#imageresponse)
- [IndexScenesResponse](types_response.md#indexscenesresponse)
- [ListSceneCollection](types_response.md#listscenecollection)
- [ListSceneIndex](types_response.md#listsceneindex)
- [MediaResponse](types_response.md#mediaresponse)
- [NoDataResponse](types_response.md#nodataresponse)
- [ResponseOf](types_response.md#responseof)
- [SceneBase](types_response.md#scenebase)
- [SceneCollectionResponse](types_response.md#scenecollectionresponse)
- [SceneIndex](types_response.md#sceneindex)
- [SearchResponse](types_response.md#searchresponse)
- [SyncJobResponse](types_response.md#syncjobresponse)
- [TranscriptResponse](types_response.md#transcriptresponse)
- [TranscriptionResponse](types_response.md#transcriptionresponse)
- [UpdateResponse](types_response.md#updateresponse)
- [VideoResponse](types_response.md#videoresponse)

## Type Aliases

### AudioResponse

Ƭ **AudioResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `collection_id` | `string` |
| `id` | `string` |
| `length` | `string` |
| `name` | `string` |
| `size` | `string` |
| `user_id` | `string` |

#### Defined in

[src/types/response.ts:58](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L58)

___

### CollectionResponse

Ƭ **CollectionResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `description` | `string` |
| `id` | `string` |
| `name` | `string` |

#### Defined in

[src/types/response.ts:73](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L73)

___

### ErrorResponse

Ƭ **ErrorResponse**: `Object`

All error responses sent by the server are of this type

#### Type declaration

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `status?` | `string` |
| `success?` | `boolean` |

#### Defined in

[src/types/response.ts:14](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L14)

___

### GenerateStreamResponse

Ƭ **GenerateStreamResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `player_url` | `string` |
| `stream_url` | `string` |

#### Defined in

[src/types/response.ts:113](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L113)

___

### GetAudios

Ƭ **GetAudios**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `audios` | [`AudioResponse`](types_response.md#audioresponse)[] |

#### Defined in

[src/types/response.ts:100](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L100)

___

### GetCollections

Ƭ **GetCollections**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `collections` | [`CollectionResponse`](types_response.md#collectionresponse)[] |
| `default_collection` | `string` |

#### Defined in

[src/types/response.ts:79](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L79)

___

### GetImages

Ƭ **GetImages**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `images` | [`ImageResponse`](types_response.md#imageresponse)[] |

#### Defined in

[src/types/response.ts:104](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L104)

___

### GetSceneIndexResponse

Ƭ **GetSceneIndexResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `sceneIndexRecords` | [`SceneIndexRecords`](types.md#sceneindexrecords) |

#### Defined in

[src/types/response.ts:153](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L153)

___

### GetUploadUrl

Ƭ **GetUploadUrl**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `upload_url` | `string` |

#### Defined in

[src/types/response.ts:92](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L92)

___

### GetVideos

Ƭ **GetVideos**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `videos` | [`VideoResponse`](types_response.md#videoresponse)[] |

#### Defined in

[src/types/response.ts:96](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L96)

___

### ImageResponse

Ƭ **ImageResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `collection_id` | `string` |
| `id` | `string` |
| `name` | `string` |

#### Defined in

[src/types/response.ts:67](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L67)

___

### IndexScenesResponse

Ƭ **IndexScenesResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `scene_index_id` | `string` |

#### Defined in

[src/types/response.ts:147](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L147)

___

### ListSceneCollection

Ƭ **ListSceneCollection**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `scene_collections` | \{ `config`: `object` ; `scene_collection_id`: `string` ; `status`: `string`  }[] |

#### Defined in

[src/types/response.ts:175](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L175)

___

### ListSceneIndex

Ƭ **ListSceneIndex**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `scene_indexes` | [`SceneIndex`](types_response.md#sceneindex)[] |

#### Defined in

[src/types/response.ts:163](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L163)

___

### MediaResponse

Ƭ **MediaResponse**: [`VideoResponse`](types_response.md#videoresponse) \| [`AudioResponse`](types_response.md#audioresponse) \| [`ImageResponse`](types_response.md#imageresponse)

#### Defined in

[src/types/response.ts:151](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L151)

___

### NoDataResponse

Ƭ **NoDataResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `success?` | `boolean` |

#### Defined in

[src/types/response.ts:41](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L41)

___

### ResponseOf

Ƭ **ResponseOf**\<`D`\>: `Object`

All sucessfull responses are wrapped by this type

#### Type parameters

| Name | Description |
| :------ | :------ |
| `D` | Type of the response data TODO: Fix this type after server update |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | `D` |
| `message?` | `string` |
| `request_type?` | ``"sync"`` \| ``"async"`` |
| `response?` | [`ResponseOf`](types_response.md#responseof)\<`D`\> |
| `status?` | typeof [`ResponseStatus`](constants.md#responsestatus)[keyof typeof [`ResponseStatus`](constants.md#responsestatus)] |
| `success?` | `boolean` |

#### Defined in

[src/types/response.ts:26](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L26)

___

### SceneBase

Ƭ **SceneBase**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `end` | `number` |
| `response` | `string` |
| `start` | `number` |

#### Defined in

[src/types/response.ts:108](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L108)

___

### SceneCollectionResponse

Ƭ **SceneCollectionResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `scene_collection` | \{ `config`: `object` ; `scene_collection_id`: `string` ; `scenes`: `object`[]  } |
| `scene_collection.config` | `object` |
| `scene_collection.scene_collection_id` | `string` |
| `scene_collection.scenes` | `object`[] |

#### Defined in

[src/types/response.ts:167](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L167)

___

### SceneIndex

Ƭ **SceneIndex**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `scene_index_id` | `string` |
| `status` | `string` |

#### Defined in

[src/types/response.ts:157](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L157)

___

### SearchResponse

Ƭ **SearchResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `results` | \{ `collection_id`: `string` ; `docs`: \{ `end`: `number` ; `score`: `number` ; `start`: `number` ; `stream_url`: `string` ; `text`: `string`  }[] ; `length`: `string` ; `max_score`: `number` ; `platform`: `string` ; `stream_url`: [`StreamableURL`](types_video.md#streamableurl) ; `thumbnail`: `string` ; `title`: `string` ; `video_id`: `string`  }[] |

#### Defined in

[src/types/response.ts:127](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L127)

___

### SyncJobResponse

Ƭ **SyncJobResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `output_url` | `string` |

#### Defined in

[src/types/response.ts:88](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L88)

___

### TranscriptResponse

Ƭ **TranscriptResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `word_timestamps` | \{ `end`: `string` ; `start`: `string` ; `word`: `string`  }[] |

#### Defined in

[src/types/response.ts:118](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L118)

___

### TranscriptionResponse

Ƭ **TranscriptionResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `output_url` | `string` |

#### Defined in

[src/types/response.ts:84](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L84)

___

### UpdateResponse

Ƭ **UpdateResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `response` | `unknown` |
| `status` | `number` |

#### Defined in

[src/types/response.ts:35](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L35)

___

### VideoResponse

Ƭ **VideoResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `collection_id` | `string` |
| `id` | `string` |
| `length` | `string` |
| `name` | `string` |
| `player_url` | `string` |
| `size` | `string` |
| `stream_url` | `string` |
| `user_id` | `string` |

#### Defined in

[src/types/response.ts:46](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/response.ts#L46)
