[videodb](../README.md) / [Exports](../modules.md) / [utils/error](../modules/utils_error.md) / VdbBaseError

# Class: VdbBaseError

[utils/error](../modules/utils_error.md).VdbBaseError

## Hierarchy

- `Error`

  ↳ **`VdbBaseError`**

  ↳↳ [`VideodbError`](utils_error.VideodbError.md)

  ↳↳ [`AuthenticationError`](utils_error.AuthenticationError.md)

  ↳↳ [`InvalidRequestError`](utils_error.InvalidRequestError.md)

## Table of contents

### Constructors

- [constructor](utils_error.VdbBaseError.md#constructor)

### Properties

- [cause](utils_error.VdbBaseError.md#cause)
- [message](utils_error.VdbBaseError.md#message)
- [name](utils_error.VdbBaseError.md#name)
- [stack](utils_error.VdbBaseError.md#stack)
- [prepareStackTrace](utils_error.VdbBaseError.md#preparestacktrace)
- [stackTraceLimit](utils_error.VdbBaseError.md#stacktracelimit)

### Methods

- [captureStackTrace](utils_error.VdbBaseError.md#capturestacktrace)

## Constructors

### constructor

• **new VdbBaseError**(`message?`): [`VdbBaseError`](utils_error.VdbBaseError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Returns

[`VdbBaseError`](utils_error.VdbBaseError.md)

#### Inherited from

Error.constructor

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1081

• **new VdbBaseError**(`message?`, `options?`): [`VdbBaseError`](utils_error.VdbBaseError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `options?` | `ErrorOptions` |

#### Returns

[`VdbBaseError`](utils_error.VdbBaseError.md)

#### Inherited from

Error.constructor

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:28

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1076

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1075

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

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

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:28

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

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

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:21
