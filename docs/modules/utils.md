[videodb](../README.md) / [Exports](../modules.md) / utils

# Module: utils

## Table of contents

### Type Aliases

- [SnakeKeysToCamelCase](utils.md#snakekeystocamelcase)
- [SnakeToCamelCase](utils.md#snaketocamelcase)

### Functions

- [fromCamelToSnake](utils.md#fromcameltosnake)
- [fromSnakeToCamel](utils.md#fromsnaketocamel)
- [isMediaAudio](utils.md#ismediaaudio)
- [playStream](utils.md#playstream)
- [waitForJob](utils.md#waitforjob)

## Type Aliases

### SnakeKeysToCamelCase

Ƭ **SnakeKeysToCamelCase**\<`T`\>: \{ [K in keyof T as SnakeToCamelCase\<K & string\>]: T[K] extends (infer U)[] ? SnakeKeysToCamelCase\<U\>[] : T[K] extends object ? SnakeKeysToCamelCase\<T[K]\> : T[K] }

Return type for function fromSnakeToCamel
- T = Type of the input object

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[src/utils/index.ts:18](https://github.com/video-db/videodb-node/blob/583396d/src/utils/index.ts#L18)

___

### SnakeToCamelCase

Ƭ **SnakeToCamelCase**\<`S`\>: `S` extends \`$\{infer T}\_$\{infer U}\` ? \`$\{T}$\{Capitalize\<SnakeToCamelCase\<U\>\>}\` : `S`

TS Interpretation of snake_case to camelCase conversion for better readability

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends `string` |

#### Defined in

[src/utils/index.ts:9](https://github.com/video-db/videodb-node/blob/583396d/src/utils/index.ts#L9)

## Functions

### fromCamelToSnake

▸ **fromCamelToSnake**\<`O`\>(`data`): [`SnakeKeysToCamelCase`](utils.md#snakekeystocamelcase)\<`O`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `O` | extends `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `O` |

#### Returns

[`SnakeKeysToCamelCase`](utils.md#snakekeystocamelcase)\<`O`\>

#### Defined in

[src/utils/index.ts:55](https://github.com/video-db/videodb-node/blob/583396d/src/utils/index.ts#L55)

___

### fromSnakeToCamel

▸ **fromSnakeToCamel**\<`O`\>(`data`): [`SnakeKeysToCamelCase`](utils.md#snakekeystocamelcase)\<`O`\>

Converts the provided snake_case object into camelCase

#### Type parameters

| Name | Type |
| :------ | :------ |
| `O` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `O` | The object that needs to be converted |

#### Returns

[`SnakeKeysToCamelCase`](utils.md#snakekeystocamelcase)\<`O`\>

The provided object with all the keys converted into camelCase

TODO: Implement this safely at the HttpClient level to avoid rewrites throughout the codebase

**`Remarks`**

Performs an in-depth conversion. Be careful before passing
large objects with a lot of values.

#### Defined in

[src/utils/index.ts:37](https://github.com/video-db/videodb-node/blob/583396d/src/utils/index.ts#L37)

___

### isMediaAudio

▸ **isMediaAudio**(`media`): media is AudioBase

#### Parameters

| Name | Type |
| :------ | :------ |
| `media` | [`VideoBase`](../interfaces/interfaces_core.VideoBase.md) \| [`AudioBase`](../interfaces/interfaces_core.AudioBase.md) |

#### Returns

media is AudioBase

#### Defined in

[src/utils/index.ts:95](https://github.com/video-db/videodb-node/blob/583396d/src/utils/index.ts#L95)

___

### playStream

▸ **playStream**(`url`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |

#### Returns

`string`

#### Defined in

[src/utils/index.ts:73](https://github.com/video-db/videodb-node/blob/583396d/src/utils/index.ts#L73)

___

### waitForJob

▸ **waitForJob**(`job`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `job` | [`Job`](../classes/utils_job.Job.md)\<`any`, `any`, `any`\> |

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/utils/index.ts:75](https://github.com/video-db/videodb-node/blob/583396d/src/utils/index.ts#L75)
