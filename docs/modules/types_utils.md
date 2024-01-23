[videodb](../README.md) / [Exports](../modules.md) / types/utils

# Module: types/utils

## Table of contents

### Type Aliases

- [JobErrorCallback](types_utils.md#joberrorcallback)
- [JobSuccessCallback](types_utils.md#jobsuccesscallback)
- [JobType](types_utils.md#jobtype)
- [SemanticCollectionSearch](types_utils.md#semanticcollectionsearch)
- [SemanticSearchBase](types_utils.md#semanticsearchbase)
- [SemanticVideoSearch](types_utils.md#semanticvideosearch)
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

src/types/utils.ts:10

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

src/types/utils.ts:9

___

### JobType

Ƭ **JobType**: ``"async"`` \| ``"sync"``

#### Defined in

src/types/utils.ts:7

___

### SemanticCollectionSearch

Ƭ **SemanticCollectionSearch**: \{ `collectionId`: `string`  } & [`SemanticSearchBase`](types_utils.md#semanticsearchbase)

#### Defined in

src/types/utils.ts:26

___

### SemanticSearchBase

Ƭ **SemanticSearchBase**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `resultThreshold?` | `number` |
| `scoreThreshold?` | `number` |

#### Defined in

src/types/utils.ts:16

___

### SemanticVideoSearch

Ƭ **SemanticVideoSearch**: \{ `videoId`: `string`  } & [`SemanticSearchBase`](types_utils.md#semanticsearchbase)

#### Defined in

src/types/utils.ts:22

___

### URLSeries

Ƭ **URLSeries**: `string`[]

#### Defined in

src/types/utils.ts:14
