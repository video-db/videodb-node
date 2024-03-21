[videodb](../README.md) / [Exports](../modules.md) / [core/image](../modules/core_image.md) / Image

# Class: Image

[core/image](../modules/core_image.md).Image

The base Image class

**`Remarks`**

Use this to initialize an Image stored in VideoDB

## Implements

- [`IImage`](../interfaces/interfaces_core.IImage.md)

## Table of contents

### Constructors

- [constructor](core_image.Image.md#constructor)

### Properties

- [meta](core_image.Image.md#meta)

### Methods

- [delete](core_image.Image.md#delete)

## Constructors

### constructor

• **new Image**(`http`, `data`): [`Image`](core_image.Image.md)

Initializes a VideoDB Instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) | HttpClient object |
| `data` | [`ImageBase`](../interfaces/interfaces_core.ImageBase.md) | Data needed to initialize an Image instance |

#### Returns

[`Image`](core_image.Image.md)

#### Defined in

[src/core/image.ts:21](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/image.ts#L21)

## Properties

### meta

• **meta**: [`ImageBase`](../interfaces/interfaces_core.ImageBase.md)

#### Implementation of

[IImage](../interfaces/interfaces_core.IImage.md).[meta](../interfaces/interfaces_core.IImage.md#meta)

#### Defined in

[src/core/image.ts:13](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/image.ts#L13)

## Methods

### delete

▸ **delete**(): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

Returns an empty promise that resolves when the image is deleted

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

A promise that resolves when delete is successful

**`Throws`**

an InvalidRequestError if the request fails

#### Defined in

[src/core/image.ts:31](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/image.ts#L31)
