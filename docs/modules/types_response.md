[videodb](../README.md) / [Exports](../modules.md) / types/response

# Module: types/response

## Table of contents

### Type Aliases

- [CollectionResponse](types_response.md#collectionresponse)
- [ErrorResponse](types_response.md#errorresponse)
- [GenerateStreamResponse](types_response.md#generatestreamresponse)
- [GetUploadUrl](types_response.md#getuploadurl)
- [GetVideos](types_response.md#getvideos)
- [NoDataResponse](types_response.md#nodataresponse)
- [ResponseOf](types_response.md#responseof)
- [SearchResponse](types_response.md#searchresponse)
- [SyncJobResponse](types_response.md#syncjobresponse)
- [TranscriptResponse](types_response.md#transcriptresponse)
- [TranscriptionResponse](types_response.md#transcriptionresponse)
- [UpdateResponse](types_response.md#updateresponse)
- [VideoResponse](types_response.md#videoresponse)

## Type Aliases

### CollectionResponse

Ƭ **CollectionResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `description` | `string` |
| `id` | `string` |
| `name` | `string` |

#### Defined in

src/types/response.ts:56

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

src/types/response.ts:13

___

### GenerateStreamResponse

Ƭ **GenerateStreamResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `player_url` | `string` |
| `stream_url` | `string` |

#### Defined in

src/types/response.ts:78

___

### GetUploadUrl

Ƭ **GetUploadUrl**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `upload_url` | `string` |

#### Defined in

src/types/response.ts:70

___

### GetVideos

Ƭ **GetVideos**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `videos` | [`VideoResponse`](types_response.md#videoresponse)[] |

#### Defined in

src/types/response.ts:74

___

### NoDataResponse

Ƭ **NoDataResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `success?` | `boolean` |

#### Defined in

src/types/response.ts:40

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

src/types/response.ts:25

___

### SearchResponse

Ƭ **SearchResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `results` | \{ `collection_id`: `string` ; `docs`: \{ `end`: `number` ; `score`: `number` ; `start`: `number` ; `stream_url`: `string` ; `text`: `string`  }[] ; `length`: `string` ; `max_score`: `number` ; `platform`: `string` ; `stream_url`: [`StreamableURL`](types_video.md#streamableurl) ; `thumbnail`: `string` ; `title`: `string` ; `video_id`: `string`  }[] |

#### Defined in

src/types/response.ts:92

___

### SyncJobResponse

Ƭ **SyncJobResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `output_url` | `string` |

#### Defined in

src/types/response.ts:66

___

### TranscriptResponse

Ƭ **TranscriptResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `word_timestamps` | \{ `end`: `string` ; `start`: `string` ; `word`: `string`  }[] |

#### Defined in

src/types/response.ts:83

___

### TranscriptionResponse

Ƭ **TranscriptionResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `output_url` | `string` |

#### Defined in

src/types/response.ts:62

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

src/types/response.ts:34

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

src/types/response.ts:45
