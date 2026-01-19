[videodb](../README.md) / [Exports](../modules.md) / [core/audio](../modules/core_audio.md) / Audio

# Class: Audio

[core/audio](../modules/core_audio.md).Audio

The base Audio class

**`Remarks`**

Use this to initialize an audio stored in VideoDB

## Implements

- [`IAudio`](../interfaces/interfaces_core.IAudio.md)

## Table of contents

### Constructors

- [constructor](core_audio.Audio.md#constructor)

### Properties

- [meta](core_audio.Audio.md#meta)

### Methods

- [delete](core_audio.Audio.md#delete)

## Constructors

### constructor

• **new Audio**(`http`, `data`): [`Audio`](core_audio.Audio.md)

Initializes a VideoDB Instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) | HttpClient object |
| `data` | [`AudioBase`](../interfaces/interfaces_core.AudioBase.md) | Data needed to initialize an audio instance |

#### Returns

[`Audio`](core_audio.Audio.md)

#### Defined in

[src/core/audio.ts:21](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/audio.ts#L21)

## Properties

### meta

• **meta**: [`AudioBase`](../interfaces/interfaces_core.AudioBase.md)

#### Implementation of

[IAudio](../interfaces/interfaces_core.IAudio.md).[meta](../interfaces/interfaces_core.IAudio.md#meta)

#### Defined in

[src/core/audio.ts:13](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/audio.ts#L13)

## Methods

### delete

▸ **delete**(): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

Returns an empty promise that resolves when the audio is deleted

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

A promise that resolves when delete is successful

**`Throws`**

an InvalidRequestError if the request fails

#### Defined in

[src/core/audio.ts:31](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/audio.ts#L31)
