[videodb](../README.md) / [Exports](../modules.md) / [utils/job](../modules/utils_job.md) / ExtractScenesJob

# Class: ExtractScenesJob

[utils/job](../modules/utils_job.md).ExtractScenesJob

Base Job class used to create different kinds of jobs

**`Remarks`**

Jobs are used for long running tasks where a simple
async call would take too long causing a timeout.

**`See`**

This class accepts 3 type params
- ApiResponse: The response recieved from the API on calling

## Hierarchy

- [`Job`](utils_job.Job.md)\<`object`, `object`, `object`\>

  ↳ **`ExtractScenesJob`**

## Table of contents

### Constructors

- [constructor](utils_job.ExtractScenesJob.md#constructor)

### Properties

- [config](utils_job.ExtractScenesJob.md#config)
- [convertResponseToCamelCase](utils_job.ExtractScenesJob.md#convertresponsetocamelcase)
- [jobTitle](utils_job.ExtractScenesJob.md#jobtitle)
- [vhttp](utils_job.ExtractScenesJob.md#vhttp)
- [videoId](utils_job.ExtractScenesJob.md#videoid)

### Methods

- [\_handleError](utils_job.ExtractScenesJob.md#_handleerror)
- [\_handleSuccess](utils_job.ExtractScenesJob.md#_handlesuccess)
- [\_initiateBackoff](utils_job.ExtractScenesJob.md#_initiatebackoff)
- [beforeSuccess](utils_job.ExtractScenesJob.md#beforesuccess)
- [on](utils_job.ExtractScenesJob.md#on)
- [start](utils_job.ExtractScenesJob.md#start)

## Constructors

### constructor

• **new ExtractScenesJob**(`http`, `videoId`, `config`): [`ExtractScenesJob`](utils_job.ExtractScenesJob.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) |
| `videoId` | `string` |
| `config` | `Partial`\<[`ExtractSceneConfig`](../modules/types_config.md#extractsceneconfig)\> |

#### Returns

[`ExtractScenesJob`](utils_job.ExtractScenesJob.md)

#### Overrides

[Job](utils_job.Job.md).[constructor](utils_job.Job.md#constructor)

#### Defined in

[src/utils/job.ts:364](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L364)

## Properties

### config

• **config**: `Partial`\<[`ExtractSceneConfig`](../modules/types_config.md#extractsceneconfig)\>

#### Defined in

[src/utils/job.ts:363](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L363)

___

### convertResponseToCamelCase

• `Protected` **convertResponseToCamelCase**: `boolean` = `true`

#### Inherited from

[Job](utils_job.Job.md).[convertResponseToCamelCase](utils_job.Job.md#convertresponsetocamelcase)

#### Defined in

[src/utils/job.ts:56](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L56)

___

### jobTitle

• `Protected` **jobTitle**: `string`

#### Inherited from

[Job](utils_job.Job.md).[jobTitle](utils_job.Job.md#jobtitle)

#### Defined in

[src/utils/job.ts:57](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L57)

___

### vhttp

• `Protected` **vhttp**: [`HttpClient`](utils_httpClient.HttpClient.md)

#### Inherited from

[Job](utils_job.Job.md).[vhttp](utils_job.Job.md#vhttp)

#### Defined in

[src/utils/job.ts:55](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L55)

___

### videoId

• **videoId**: `string`

#### Defined in

[src/utils/job.ts:362](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L362)

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

#### Inherited from

[Job](utils_job.Job.md).[_handleSuccess](utils_job.Job.md#_handlesuccess)

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

#### Inherited from

[Job](utils_job.Job.md).[_initiateBackoff](utils_job.Job.md#_initiatebackoff)

#### Defined in

[src/utils/job.ts:124](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L124)

___

### beforeSuccess

▸ **beforeSuccess**(`data`): `any`

Initializes a new video object with the returned data

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `object` | Media data returned from the API and converted to camelCase |

#### Returns

`any`

a new Video object

#### Overrides

Job.beforeSuccess

#### Defined in

[src/utils/job.ts:401](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L401)

___

### on

▸ **on**(`option`, `method`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | ``"success"`` |
| `method` | [`JobSuccessCallback`](../modules/types_utils.md#jobsuccesscallback)\<`object`\> |

#### Returns

`void`

#### Inherited from

[Job](utils_job.Job.md).[on](utils_job.Job.md#on)

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

#### Inherited from

[Job](utils_job.Job.md).[on](utils_job.Job.md#on)

#### Defined in

[src/utils/job.ts:70](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L70)

___

### start

▸ **start**(): `Promise`\<`void`\>

Fetches the callbackURL from the server and initiates a backoff

#### Returns

`Promise`\<`void`\>

#### Overrides

Job.start

#### Defined in

[src/utils/job.ts:378](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L378)
