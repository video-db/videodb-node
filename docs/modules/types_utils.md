[videodb](../README.md) / [Exports](../modules.md) / types/utils

# Module: types/utils

## Table of contents

### Type Aliases

- [JobErrorCallback](types_utils.md#joberrorcallback)
- [JobSuccessCallback](types_utils.md#jobsuccesscallback)
- [JobType](types_utils.md#jobtype)
- [URLSeries](types_utils.md#urlseries)

## Type Aliases

### JobErrorCallback

Ƭ **JobErrorCallback**: (`err`: [`VideodbError`](../classes/utils_error.VideodbError.md) \| [`AuthenticationError`](../classes/utils_error.AuthenticationError.md) \| [`InvalidRequestError`](../classes/utils_error.InvalidRequestError.md)) => `unknown`

#### Type declaration

▸ (`err`): `unknown`

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | [`VideodbError`](../classes/utils_error.VideodbError.md) \| [`AuthenticationError`](../classes/utils_error.AuthenticationError.md) \| [`InvalidRequestError`](../classes/utils_error.InvalidRequestError.md) |

##### Returns

`unknown`

#### Defined in

[src/types/utils.ts:10](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/utils.ts#L10)

___

### JobSuccessCallback

Ƭ **JobSuccessCallback**\<`D`\>: (`data`: `D`) => `unknown`

#### Type parameters

| Name |
| :------ |
| `D` |

#### Type declaration

▸ (`data`): `unknown`

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `D` |

##### Returns

`unknown`

#### Defined in

[src/types/utils.ts:9](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/utils.ts#L9)

___

### JobType

Ƭ **JobType**: ``"async"`` \| ``"sync"``

#### Defined in

[src/types/utils.ts:7](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/utils.ts#L7)

___

### URLSeries

Ƭ **URLSeries**: `string`[]

#### Defined in

[src/types/utils.ts:14](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/utils.ts#L14)
