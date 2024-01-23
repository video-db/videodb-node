[videodb](../README.md) / [Exports](../modules.md) / utils

# Module: utils

## Table of contents

### Type Aliases

- [SnakeKeysToCamelCase](utils.md#snakekeystocamelcase)
- [SnakeToCamelCase](utils.md#snaketocamelcase)

### Functions

- [fromSnakeToCamel](utils.md#fromsnaketocamel)
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

src/utils/index.ts:17

___

### SnakeToCamelCase

Ƭ **SnakeToCamelCase**\<`S`\>: `S` extends \`$\{infer T}\_$\{infer U}\` ? \`$\{T}$\{Capitalize\<SnakeToCamelCase\<U\>\>}\` : `S`

TS Interpretation of snake_case to camelCase conversion for better readability

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends `string` |

#### Defined in

src/utils/index.ts:8

## Functions

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

src/utils/index.ts:36

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

src/utils/index.ts:54

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

src/utils/index.ts:56
