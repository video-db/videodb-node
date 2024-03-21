[videodb](../README.md) / [Exports](../modules.md) / types/response

# Module: types/response

## Table of contents

### Type Aliases

- [AudioResponse](types_response.md#audioresponse)
- [CollectionResponse](types_response.md#collectionresponse)
- [ErrorResponse](types_response.md#errorresponse)
- [GenerateStreamResponse](types_response.md#generatestreamresponse)
- [GetAudios](types_response.md#getaudios)
- [GetImages](types_response.md#getimages)
- [GetScenes](types_response.md#getscenes)
- [GetUploadUrl](types_response.md#getuploadurl)
- [GetVideos](types_response.md#getvideos)
- [ImageResponse](types_response.md#imageresponse)
- [MediaResponse](types_response.md#mediaresponse)
- [NoDataResponse](types_response.md#nodataresponse)
- [ResponseOf](types_response.md#responseof)
- [SceneBase](types_response.md#scenebase)
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

[src/types/response.ts:57](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L57)

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

[src/types/response.ts:72](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L72)

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

[src/types/response.ts:13](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L13)

___

### GenerateStreamResponse

Ƭ **GenerateStreamResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `player_url` | `string` |
| `stream_url` | `string` |

#### Defined in

[src/types/response.ts:109](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L109)

___

### GetAudios

Ƭ **GetAudios**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `audios` | [`AudioResponse`](types_response.md#audioresponse)[] |

#### Defined in

[src/types/response.ts:94](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L94)

___

### GetImages

Ƭ **GetImages**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `images` | [`ImageResponse`](types_response.md#imageresponse)[] |

#### Defined in

[src/types/response.ts:98](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L98)

___

### GetScenes

Ƭ **GetScenes**: [`SceneBase`](types_response.md#scenebase)[]

#### Defined in

[src/types/response.ts:107](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L107)

___

### GetUploadUrl

Ƭ **GetUploadUrl**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `upload_url` | `string` |

#### Defined in

[src/types/response.ts:86](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L86)

___

### GetVideos

Ƭ **GetVideos**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `videos` | [`VideoResponse`](types_response.md#videoresponse)[] |

#### Defined in

[src/types/response.ts:90](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L90)

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

[src/types/response.ts:66](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L66)

___

### MediaResponse

Ƭ **MediaResponse**: [`VideoResponse`](types_response.md#videoresponse) \| [`AudioResponse`](types_response.md#audioresponse) \| [`ImageResponse`](types_response.md#imageresponse)

#### Defined in

[src/types/response.ts:143](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L143)

___

### NoDataResponse

Ƭ **NoDataResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `success?` | `boolean` |

#### Defined in

[src/types/response.ts:40](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L40)

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

[src/types/response.ts:25](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L25)

___

### SceneBase

Ƭ **SceneBase**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `end` | `string` |
| `response` | `string` |
| `start` | `string` |

#### Defined in

[src/types/response.ts:102](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L102)

___

### SearchResponse

Ƭ **SearchResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `results` | \{ `collection_id`: `string` ; `docs`: \{ `end`: `number` ; `score`: `number` ; `start`: `number` ; `stream_url`: `string` ; `text`: `string`  }[] ; `length`: `string` ; `max_score`: `number` ; `platform`: `string` ; `stream_url`: [`StreamableURL`](types_video.md#streamableurl) ; `thumbnail`: `string` ; `title`: `string` ; `video_id`: `string`  }[] |

#### Defined in

[src/types/response.ts:123](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L123)

___

### SyncJobResponse

Ƭ **SyncJobResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `output_url` | `string` |

#### Defined in

[src/types/response.ts:82](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L82)

___

### TranscriptResponse

Ƭ **TranscriptResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `word_timestamps` | \{ `end`: `string` ; `start`: `string` ; `word`: `string`  }[] |

#### Defined in

[src/types/response.ts:114](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L114)

___

### TranscriptionResponse

Ƭ **TranscriptionResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `output_url` | `string` |

#### Defined in

[src/types/response.ts:78](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L78)

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

[src/types/response.ts:34](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L34)

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

[src/types/response.ts:45](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/response.ts#L45)
