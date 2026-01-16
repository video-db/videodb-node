[videodb](../README.md) / [Exports](../modules.md) / [core/scene](../modules/core_scene.md) / SceneCollection

# Class: SceneCollection

[core/scene](../modules/core_scene.md).SceneCollection

## Table of contents

### Constructors

- [constructor](core_scene.SceneCollection.md#constructor)

### Properties

- [config](core_scene.SceneCollection.md#config)
- [id](core_scene.SceneCollection.md#id)
- [scenes](core_scene.SceneCollection.md#scenes)
- [videoId](core_scene.SceneCollection.md#videoid)

### Methods

- [delete](core_scene.SceneCollection.md#delete)

## Constructors

### constructor

• **new SceneCollection**(`http`, `data`): [`SceneCollection`](core_scene.SceneCollection.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) |
| `data` | [`SceneCollectionBase`](../interfaces/core_scene.SceneCollectionBase.md) |

#### Returns

[`SceneCollection`](core_scene.SceneCollection.md)

#### Defined in

[src/core/scene.ts:73](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L73)

## Properties

### config

• **config**: `object`

#### Defined in

[src/core/scene.ts:69](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L69)

___

### id

• **id**: `string`

#### Defined in

[src/core/scene.ts:67](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L67)

___

### scenes

• **scenes**: [`Scene`](core_scene.Scene.md)[]

#### Defined in

[src/core/scene.ts:70](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L70)

___

### videoId

• **videoId**: `string`

#### Defined in

[src/core/scene.ts:68](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L68)

## Methods

### delete

▸ **delete**(): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`Record`\<`string`, `never`\>\>\>

#### Defined in

[src/core/scene.ts:81](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L81)
