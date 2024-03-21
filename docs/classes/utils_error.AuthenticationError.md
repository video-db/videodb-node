[videodb](../README.md) / [Exports](../modules.md) / [utils/error](../modules/utils_error.md) / AuthenticationError

# Class: AuthenticationError\<T\>

[utils/error](../modules/utils_error.md).AuthenticationError

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

## Hierarchy

- [`VdbBaseError`](utils_error.VdbBaseError.md)

  ↳ **`AuthenticationError`**

## Table of contents

### Constructors

- [constructor](utils_error.AuthenticationError.md#constructor)

### Properties

- [cause](utils_error.AuthenticationError.md#cause)
- [message](utils_error.AuthenticationError.md#message)
- [name](utils_error.AuthenticationError.md#name)
- [stack](utils_error.AuthenticationError.md#stack)
- [prepareStackTrace](utils_error.AuthenticationError.md#preparestacktrace)
- [stackTraceLimit](utils_error.AuthenticationError.md#stacktracelimit)

### Methods

- [captureStackTrace](utils_error.AuthenticationError.md#capturestacktrace)

## Constructors

### constructor

• **new AuthenticationError**\<`T`\>(`cause?`): [`AuthenticationError`](utils_error.AuthenticationError.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `cause?` | `T` |

#### Returns

[`AuthenticationError`](utils_error.AuthenticationError.md)\<`T`\>

#### Overrides

[VdbBaseError](utils_error.VdbBaseError.md).[constructor](utils_error.VdbBaseError.md#constructor)

#### Defined in

[src/utils/error.ts:12](https://github.com/video-db/videodb-node/blob/583396d/src/utils/error.ts#L12)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

[VdbBaseError](utils_error.VdbBaseError.md).[cause](utils_error.VdbBaseError.md#cause)

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### message

• **message**: `string`

#### Inherited from

[VdbBaseError](utils_error.VdbBaseError.md).[message](utils_error.VdbBaseError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1076

___

### name

• **name**: `string`

#### Inherited from

[VdbBaseError](utils_error.VdbBaseError.md).[name](utils_error.VdbBaseError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1075

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[VdbBaseError](utils_error.VdbBaseError.md).[stack](utils_error.VdbBaseError.md#stack)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

#### Type declaration

▸ (`err`, `stackTraces`): `any`

Optional override for formatting stack traces

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

[VdbBaseError](utils_error.VdbBaseError.md).[prepareStackTrace](utils_error.VdbBaseError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:28

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[VdbBaseError](utils_error.VdbBaseError.md).[stackTraceLimit](utils_error.VdbBaseError.md#stacktracelimit)

#### Defined in

node_modules/@types/node/globals.d.ts:30

## Methods

### captureStackTrace

▸ **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

[VdbBaseError](utils_error.VdbBaseError.md).[captureStackTrace](utils_error.VdbBaseError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:21
