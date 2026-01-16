[videodb](../README.md) / [Exports](../modules.md) / [utils/job](../modules/utils_job.md) / SceneIndexJob

# Class: SceneIndexJob

[utils/job](../modules/utils_job.md).SceneIndexJob

SceneIndexJob is used to initalize a new video upload.

**`Remarks`**

Uses the base Job class to implement a backoff to get the uploaded video data.

## Hierarchy

- [`Job`](utils_job.Job.md)\<[`GetSceneIndexResponse`](../modules/types_response.md#getsceneindexresponse), [`GetSceneIndexResponse`](../modules/types_response.md#getsceneindexresponse), [`SceneIndexRecords`](../modules/types.md#sceneindexrecords)\>

  ↳ **`SceneIndexJob`**

## Table of contents

### Constructors

- [constructor](utils_job.SceneIndexJob.md#constructor)

### Properties

- [convertResponseToCamelCase](utils_job.SceneIndexJob.md#convertresponsetocamelcase)
- [jobTitle](utils_job.SceneIndexJob.md#jobtitle)
- [sceneIndexId](utils_job.SceneIndexJob.md#sceneindexid)
- [vhttp](utils_job.SceneIndexJob.md#vhttp)
- [videoId](utils_job.SceneIndexJob.md#videoid)

### Methods

- [\_handleError](utils_job.SceneIndexJob.md#_handleerror)
- [\_handleSuccess](utils_job.SceneIndexJob.md#_handlesuccess)
- [\_initiateBackoff](utils_job.SceneIndexJob.md#_initiatebackoff)
- [beforeSuccess](utils_job.SceneIndexJob.md#beforesuccess)
- [on](utils_job.SceneIndexJob.md#on)
- [start](utils_job.SceneIndexJob.md#start)

## Constructors

### constructor

• **new SceneIndexJob**(`http`, `videoId`, `sceneIndexId`): [`SceneIndexJob`](utils_job.SceneIndexJob.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) |
| `videoId` | `string` |
| `sceneIndexId` | `string` |

#### Returns

[`SceneIndexJob`](utils_job.SceneIndexJob.md)

#### Overrides

[Job](utils_job.Job.md).[constructor](utils_job.Job.md#constructor)

#### Defined in

[src/utils/job.ts:321](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L321)

## Properties

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

### sceneIndexId

• **sceneIndexId**: `string`

#### Defined in

[src/utils/job.ts:320](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L320)

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

[src/utils/job.ts:319](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L319)

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

▸ **beforeSuccess**(`data`): [`SceneIndexRecords`](../modules/types.md#sceneindexrecords)

Initializes a new video object with the returned data

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`GetSceneIndexResponse`](../modules/types_response.md#getsceneindexresponse) | Media data returned from the API and converted to camelCase |

#### Returns

[`SceneIndexRecords`](../modules/types.md#sceneindexrecords)

a new Video object

#### Overrides

Job.beforeSuccess

#### Defined in

[src/utils/job.ts:356](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L356)

___

### on

▸ **on**(`option`, `method`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | ``"success"`` |
| `method` | [`JobSuccessCallback`](../modules/types_utils.md#jobsuccesscallback)\<[`SceneIndexRecords`](../modules/types.md#sceneindexrecords)\> |

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

[src/utils/job.ts:331](https://github.com/omgate234/videodb-node/blob/047cbbf/src/utils/job.ts#L331)
