[videodb](../README.md) / [Exports](../modules.md) / [core/image](../modules/core_image.md) / Frame

# Class: Frame

[core/image](../modules/core_image.md).Frame

The base Image class

**`Remarks`**

Use this to initialize an Image stored in VideoDB

## Hierarchy

- [`Image`](core_image.Image.md)

  ↳ **`Frame`**

## Table of contents

### Constructors

- [constructor](core_image.Frame.md#constructor)

### Properties

- [description](core_image.Frame.md#description)
- [frameTime](core_image.Frame.md#frametime)
- [meta](core_image.Frame.md#meta)
- [sceneId](core_image.Frame.md#sceneid)
- [videoId](core_image.Frame.md#videoid)

### Methods

- [delete](core_image.Frame.md#delete)
- [describe](core_image.Frame.md#describe)
- [getRequestData](core_image.Frame.md#getrequestdata)

## Constructors

### constructor

• **new Frame**(`http`, `data`): [`Frame`](core_image.Frame.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) |
| `data` | [`FrameBase`](../interfaces/interfaces_core.FrameBase.md) |

#### Returns

[`Frame`](core_image.Frame.md)

#### Overrides

[Image](core_image.Image.md).[constructor](core_image.Image.md#constructor)

#### Defined in

[src/core/image.ts:44](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/image.ts#L44)

## Properties

### description

• **description**: `string`

#### Defined in

[src/core/image.ts:41](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/image.ts#L41)

___

### frameTime

• **frameTime**: `number`

#### Defined in

[src/core/image.ts:40](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/image.ts#L40)

___

### meta

• **meta**: [`ImageBase`](../interfaces/interfaces_core.ImageBase.md)

#### Inherited from

[Image](core_image.Image.md).[meta](core_image.Image.md#meta)

#### Defined in

[src/core/image.ts:11](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/image.ts#L11)

___

### sceneId

• **sceneId**: `string`

#### Defined in

[src/core/image.ts:39](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/image.ts#L39)

___

### videoId

• **videoId**: `string`

#### Defined in

[src/core/image.ts:38](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/image.ts#L38)

## Methods

### delete

▸ **delete**(): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

Returns an empty promise that resolves when the image is deleted

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

A promise that resolves when delete is successful

**`Throws`**

an InvalidRequestError if the request fails

#### Inherited from

[Image](core_image.Image.md).[delete](core_image.Image.md#delete)

#### Defined in

[src/core/image.ts:29](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/image.ts#L29)

___

### describe

▸ **describe**(`prompt?`, `modelName?`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `prompt?` | `string` |
| `modelName?` | `string` |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/core/image.ts:69](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/image.ts#L69)

___

### getRequestData

▸ **getRequestData**(): `object`

#### Returns

`object`

#### Defined in

[src/core/image.ts:58](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/image.ts#L58)
