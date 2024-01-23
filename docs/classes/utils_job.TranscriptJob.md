[videodb](../README.md) / [Exports](../modules.md) / [utils/job](../modules/utils_job.md) / TranscriptJob

# Class: TranscriptJob

[utils/job](../modules/utils_job.md).TranscriptJob

TranscriptJob is used to initalize a new trancsript generation call.

**`Remarks`**

Uses the base Job class to implement a backoff to get the transcript

## Hierarchy

- [`Job`](utils_job.Job.md)\<[`TranscriptResponse`](../modules/types_response.md#transcriptresponse), [`Transcript`](../modules/types_video.md#transcript)\>

  ↳ **`TranscriptJob`**

## Table of contents

### Constructors

- [constructor](utils_job.TranscriptJob.md#constructor)

### Properties

- [convertResponseToCamelCase](utils_job.TranscriptJob.md#convertresponsetocamelcase)
- [force](utils_job.TranscriptJob.md#force)
- [jobTitle](utils_job.TranscriptJob.md#jobtitle)
- [vhttp](utils_job.TranscriptJob.md#vhttp)
- [videoId](utils_job.TranscriptJob.md#videoid)

### Methods

- [\_handleError](utils_job.TranscriptJob.md#_handleerror)
- [\_handleSuccess](utils_job.TranscriptJob.md#_handlesuccess)
- [\_initiateBackoff](utils_job.TranscriptJob.md#_initiatebackoff)
- [beforeSuccess](utils_job.TranscriptJob.md#beforesuccess)
- [on](utils_job.TranscriptJob.md#on)
- [start](utils_job.TranscriptJob.md#start)

## Constructors

### constructor

• **new TranscriptJob**(`http`, `videoId`, `force?`): [`TranscriptJob`](utils_job.TranscriptJob.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) | `undefined` |
| `videoId` | `string` | `undefined` |
| `force` | `boolean` | `false` |

#### Returns

[`TranscriptJob`](utils_job.TranscriptJob.md)

#### Overrides

[Job](utils_job.Job.md).[constructor](utils_job.Job.md#constructor)

#### Defined in

src/utils/job.ts:156

## Properties

### convertResponseToCamelCase

• `Protected` **convertResponseToCamelCase**: `boolean` = `true`

#### Inherited from

[Job](utils_job.Job.md).[convertResponseToCamelCase](utils_job.Job.md#convertresponsetocamelcase)

#### Defined in

src/utils/job.ts:48

___

### force

• **force**: `boolean`

#### Defined in

src/utils/job.ts:155

___

### jobTitle

• `Protected` **jobTitle**: `string`

#### Inherited from

[Job](utils_job.Job.md).[jobTitle](utils_job.Job.md#jobtitle)

#### Defined in

src/utils/job.ts:49

___

### vhttp

• `Protected` **vhttp**: [`HttpClient`](utils_httpClient.HttpClient.md)

#### Inherited from

[Job](utils_job.Job.md).[vhttp](utils_job.Job.md#vhttp)

#### Defined in

src/utils/job.ts:47

___

### videoId

• **videoId**: `string`

#### Defined in

src/utils/job.ts:154

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

src/utils/job.ts:78

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

src/utils/job.ts:94

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

src/utils/job.ts:116

___

### beforeSuccess

▸ **beforeSuccess**(`data`): [`Transcript`](../modules/types_video.md#transcript)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`Transcript`](../modules/types_video.md#transcript) |

#### Returns

[`Transcript`](../modules/types_video.md#transcript)

#### Overrides

Job.beforeSuccess

#### Defined in

src/utils/job.ts:187

___

### on

▸ **on**(`option`, `method`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | ``"success"`` |
| `method` | [`JobSuccessCallback`](../modules/types_utils.md#jobsuccesscallback)\<[`Transcript`](../modules/types_video.md#transcript)\> |

#### Returns

`void`

#### Inherited from

[Job](utils_job.Job.md).[on](utils_job.Job.md#on)

#### Defined in

src/utils/job.ts:61

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

src/utils/job.ts:62

___

### start

▸ **start**(): `Promise`\<`void`\>

If the transcript exists, it immediately calls
the success listener. If it doesn't exist, it
initiates a backoff.

#### Returns

`Promise`\<`void`\>

#### Overrides

Job.start

#### Defined in

src/utils/job.ts:167
