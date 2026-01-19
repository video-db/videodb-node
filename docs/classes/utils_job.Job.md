[videodb](../README.md) / [Exports](../modules.md) / [utils/job](../modules/utils_job.md) / Job

# Class: Job\<ApiResponse, SdkBase, FinalReturn\>

[utils/job](../modules/utils_job.md).Job

Base Job class used to create different kinds of jobs

**`Remarks`**

Jobs are used for long running tasks where a simple
async call would take too long causing a timeout.

**`See`**

This class accepts 3 type params
- ApiResponse: The response recieved from the API on calling

## Type parameters

| Name | Type |
| :------ | :------ |
| `ApiResponse` | extends `object` |
| `SdkBase` | `SdkBase` |
| `FinalReturn` | `SdkBase` |

## Hierarchy

- **`Job`**

  ↳ [`TranscriptJob`](utils_job.TranscriptJob.md)

  ↳ [`UploadJob`](utils_job.UploadJob.md)

  ↳ [`IndexJob`](utils_job.IndexJob.md)

  ↳ [`SceneIndexJob`](utils_job.SceneIndexJob.md)

  ↳ [`ExtractScenesJob`](utils_job.ExtractScenesJob.md)

## Table of contents

### Constructors

- [constructor](utils_job.Job.md#constructor)

### Properties

- [beforeSuccess](utils_job.Job.md#beforesuccess)
- [convertResponseToCamelCase](utils_job.Job.md#convertresponsetocamelcase)
- [jobTitle](utils_job.Job.md#jobtitle)
- [start](utils_job.Job.md#start)
- [vhttp](utils_job.Job.md#vhttp)

### Methods

- [\_handleError](utils_job.Job.md#_handleerror)
- [\_handleSuccess](utils_job.Job.md#_handlesuccess)
- [\_initiateBackoff](utils_job.Job.md#_initiatebackoff)
- [on](utils_job.Job.md#on)

## Constructors

### constructor

• **new Job**\<`ApiResponse`, `SdkBase`, `FinalReturn`\>(`http`): [`Job`](utils_job.Job.md)\<`ApiResponse`, `SdkBase`, `FinalReturn`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ApiResponse` | extends `object` |
| `SdkBase` | `SdkBase` |
| `FinalReturn` | `SdkBase` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) | HttpClient object |

#### Returns

[`Job`](utils_job.Job.md)\<`ApiResponse`, `SdkBase`, `FinalReturn`\>

#### Defined in

[src/utils/job.ts:62](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L62)

## Properties

### beforeSuccess

• `Protected` `Abstract` **beforeSuccess**: (`data`: `SdkBase`) => `FinalReturn`

#### Type declaration

▸ (`data`): `FinalReturn`

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `SdkBase` |

##### Returns

`FinalReturn`

#### Defined in

[src/utils/job.ts:66](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L66)

___

### convertResponseToCamelCase

• `Protected` **convertResponseToCamelCase**: `boolean` = `true`

#### Defined in

[src/utils/job.ts:56](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L56)

___

### jobTitle

• `Protected` **jobTitle**: `string`

#### Defined in

[src/utils/job.ts:57](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L57)

___

### start

• `Abstract` **start**: () => `Promise`\<`void`\>

#### Type declaration

▸ (): `Promise`\<`void`\>

##### Returns

`Promise`\<`void`\>

#### Defined in

[src/utils/job.ts:67](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L67)

___

### vhttp

• `Protected` **vhttp**: [`HttpClient`](utils_httpClient.HttpClient.md)

#### Defined in

[src/utils/job.ts:55](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L55)

## Methods

### \_handleError

▸ **_handleError**(`err`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `unknown` |

#### Returns

`void`

#### Defined in

[src/utils/job.ts:86](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L86)

___

### \_handleSuccess

▸ **_handleSuccess**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `ApiResponse` |

#### Returns

`void`

#### Defined in

[src/utils/job.ts:102](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L102)

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

#### Defined in

[src/utils/job.ts:124](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L124)

___

### on

▸ **on**(`option`, `method`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | ``"success"`` |
| `method` | [`JobSuccessCallback`](../modules/types_utils.md#jobsuccesscallback)\<`FinalReturn`\> |

#### Returns

`void`

#### Defined in

[src/utils/job.ts:69](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L69)

▸ **on**(`option`, `method`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | ``"error"`` |
| `method` | [`JobErrorCallback`](../modules/types_utils.md#joberrorcallback) |

#### Returns

`void`

#### Defined in

[src/utils/job.ts:70](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L70)
