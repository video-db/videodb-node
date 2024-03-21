[videodb](../README.md) / [Exports](../modules.md) / [utils/job](../modules/utils_job.md) / UploadJob

# Class: UploadJob

[utils/job](../modules/utils_job.md).UploadJob

UploadJob is used to initalize a new video upload.

**`Remarks`**

Uses the base Job class to implement a backoff to get the uploaded video data.

## Hierarchy

- [`Job`](utils_job.Job.md)\<[`MediaResponse`](../modules/types_response.md#mediaresponse), [`MediaBase`](../modules/types.md#mediabase), [`Video`](core_video.Video.md) \| [`Audio`](core_audio.Audio.md) \| [`Image`](core_image.Image.md)\>

  ↳ **`UploadJob`**

## Table of contents

### Constructors

- [constructor](utils_job.UploadJob.md#constructor)

### Properties

- [collectionId](utils_job.UploadJob.md#collectionid)
- [convertResponseToCamelCase](utils_job.UploadJob.md#convertresponsetocamelcase)
- [jobTitle](utils_job.UploadJob.md#jobtitle)
- [uploadData](utils_job.UploadJob.md#uploaddata)
- [vhttp](utils_job.UploadJob.md#vhttp)

### Methods

- [\_handleError](utils_job.UploadJob.md#_handleerror)
- [\_handleSuccess](utils_job.UploadJob.md#_handlesuccess)
- [\_initiateBackoff](utils_job.UploadJob.md#_initiatebackoff)
- [beforeSuccess](utils_job.UploadJob.md#beforesuccess)
- [on](utils_job.UploadJob.md#on)
- [start](utils_job.UploadJob.md#start)

## Constructors

### constructor

• **new UploadJob**(`data`, `collectionId`, `http`): [`UploadJob`](utils_job.UploadJob.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`SyncUploadConfig`](../modules/types_collection.md#syncuploadconfig) |
| `collectionId` | `string` |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) |

#### Returns

[`UploadJob`](utils_job.UploadJob.md)

#### Overrides

[Job](utils_job.Job.md).[constructor](utils_job.Job.md#constructor)

#### Defined in

[src/utils/job.ts:212](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L212)

## Properties

### collectionId

• **collectionId**: `string`

#### Defined in

[src/utils/job.ts:211](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L211)

___

### convertResponseToCamelCase

• `Protected` **convertResponseToCamelCase**: `boolean` = `true`

#### Inherited from

[Job](utils_job.Job.md).[convertResponseToCamelCase](utils_job.Job.md#convertresponsetocamelcase)

#### Defined in

[src/utils/job.ts:54](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L54)

___

### jobTitle

• `Protected` **jobTitle**: `string`

#### Inherited from

[Job](utils_job.Job.md).[jobTitle](utils_job.Job.md#jobtitle)

#### Defined in

[src/utils/job.ts:55](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L55)

___

### uploadData

• **uploadData**: [`SyncUploadConfig`](../modules/types_collection.md#syncuploadconfig)

#### Defined in

[src/utils/job.ts:210](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L210)

___

### vhttp

• `Protected` **vhttp**: [`HttpClient`](utils_httpClient.HttpClient.md)

#### Inherited from

[Job](utils_job.Job.md).[vhttp](utils_job.Job.md#vhttp)

#### Defined in

[src/utils/job.ts:53](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L53)

## Methods

### \_handleError

▸ **_handleError**(`err`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `unknown` |

#### Returns

`void`

#### Inherited from

[Job](utils_job.Job.md).[_handleError](utils_job.Job.md#_handleerror)

#### Defined in

[src/utils/job.ts:84](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L84)

___

### \_handleSuccess

▸ **_handleSuccess**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `ApiResponse` |

#### Returns

`void`

#### Inherited from

[Job](utils_job.Job.md).[_handleSuccess](utils_job.Job.md#_handlesuccess)

#### Defined in

[src/utils/job.ts:100](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L100)

___

### \_initiateBackoff

▸ **_initiateBackoff**(`callbackUrl`): `Promise`\<`void`\>

Initiates a backoff-like system where we check the status
of the job in an exponentially increasing interval.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackUrl` | `string` | URL sent by the server to check status |

#### Returns

`Promise`\<`void`\>

NOTHING. Do not await this function. This will call the
success or error listener depending on the status.

#### Inherited from

[Job](utils_job.Job.md).[_initiateBackoff](utils_job.Job.md#_initiatebackoff)

#### Defined in

[src/utils/job.ts:122](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L122)

___

### beforeSuccess

▸ **beforeSuccess**(`data`): [`Video`](core_video.Video.md) \| [`Audio`](core_audio.Audio.md) \| [`Image`](core_image.Image.md)

Initializes a new video object with the returned data

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`MediaBase`](../modules/types.md#mediabase) | Media data returned from the API and converted to camelCase |

#### Returns

[`Video`](core_video.Video.md) \| [`Audio`](core_audio.Audio.md) \| [`Image`](core_image.Image.md)

a new Video object

#### Overrides

Job.beforeSuccess

#### Defined in

[src/utils/job.ts:240](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L240)

___

### on

▸ **on**(`option`, `method`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | ``"success"`` |
| `method` | [`JobSuccessCallback`](../modules/types_utils.md#jobsuccesscallback)\<[`Video`](core_video.Video.md) \| [`Audio`](core_audio.Audio.md) \| [`Image`](core_image.Image.md)\> |

#### Returns

`void`

#### Inherited from

[Job](utils_job.Job.md).[on](utils_job.Job.md#on)

#### Defined in

[src/utils/job.ts:67](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L67)

▸ **on**(`option`, `method`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | ``"error"`` |
| `method` | [`JobErrorCallback`](../modules/types_utils.md#joberrorcallback) |

#### Returns

`void`

#### Inherited from

[Job](utils_job.Job.md).[on](utils_job.Job.md#on)

#### Defined in

[src/utils/job.ts:68](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L68)

___

### start

▸ **start**(): `Promise`\<`void`\>

Fetches the callbackURL from the server and initiates a backoff

#### Returns

`Promise`\<`void`\>

#### Overrides

Job.start

#### Defined in

[src/utils/job.ts:222](https://github.com/video-db/videodb-node/blob/583396d/src/utils/job.ts#L222)
