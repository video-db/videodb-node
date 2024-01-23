[videodb](../README.md) / [Exports](../modules.md) / [utils/error](../modules/utils_error.md) / InvalidRequestError

# Class: InvalidRequestError\<C\>

[utils/error](../modules/utils_error.md).InvalidRequestError

## Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `unknown` |

## Hierarchy

- [`VdbBaseError`](utils_error.VdbBaseError.md)

  ↳ **`InvalidRequestError`**

## Table of contents

### Constructors

- [constructor](utils_error.InvalidRequestError.md#constructor)

### Properties

- [cause](utils_error.InvalidRequestError.md#cause)
- [message](utils_error.InvalidRequestError.md#message)
- [name](utils_error.InvalidRequestError.md#name)
- [response](utils_error.InvalidRequestError.md#response)
- [stack](utils_error.InvalidRequestError.md#stack)
- [prepareStackTrace](utils_error.InvalidRequestError.md#preparestacktrace)
- [stackTraceLimit](utils_error.InvalidRequestError.md#stacktracelimit)

### Methods

- [captureStackTrace](utils_error.InvalidRequestError.md#capturestacktrace)

## Constructors

### constructor

• **new InvalidRequestError**\<`C`\>(`response`, `cause?`): [`InvalidRequestError`](utils_error.InvalidRequestError.md)\<`C`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `response` | `AxiosResponse`\<`any`, `any`\> |
| `cause?` | `C` |

#### Returns

[`InvalidRequestError`](utils_error.InvalidRequestError.md)\<`C`\>

#### Overrides

[VdbBaseError](utils_error.VdbBaseError.md).[constructor](utils_error.VdbBaseError.md#constructor)

#### Defined in

src/utils/error.ts:19

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

### response

• **response**: `AxiosResponse`\<`any`, `any`\>

#### Defined in

src/utils/error.ts:18

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
