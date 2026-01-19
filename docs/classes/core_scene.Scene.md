[videodb](../README.md) / [Exports](../modules.md) / [core/scene](../modules/core_scene.md) / Scene

# Class: Scene

[core/scene](../modules/core_scene.md).Scene

## Table of contents

### Constructors

- [constructor](core_scene.Scene.md#constructor)

### Properties

- [description](core_scene.Scene.md#description)
- [end](core_scene.Scene.md#end)
- [frames](core_scene.Scene.md#frames)
- [id](core_scene.Scene.md#id)
- [start](core_scene.Scene.md#start)
- [videoId](core_scene.Scene.md#videoid)

### Methods

- [describe](core_scene.Scene.md#describe)
- [getRequestData](core_scene.Scene.md#getrequestdata)

## Constructors

### constructor

• **new Scene**(`http`, `data`): [`Scene`](core_scene.Scene.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) |
| `data` | [`SceneBase`](../interfaces/core_scene.SceneBase.md) |

#### Returns

[`Scene`](core_scene.Scene.md)

#### Defined in

[src/core/scene.ts:30](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L30)

## Properties

### description

• **description**: `undefined` \| `string`

#### Defined in

[src/core/scene.ts:27](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L27)

___

### end

• **end**: `number`

#### Defined in

[src/core/scene.ts:25](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L25)

___

### frames

• **frames**: [`Frame`](core_image.Frame.md)[]

#### Defined in

[src/core/scene.ts:26](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L26)

___

### id

• **id**: `string`

#### Defined in

[src/core/scene.ts:22](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L22)

___

### start

• **start**: `number`

#### Defined in

[src/core/scene.ts:24](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L24)

___

### videoId

• **videoId**: `string`

#### Defined in

[src/core/scene.ts:23](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L23)

## Methods

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

[src/core/scene.ts:40](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L40)

___

### getRequestData

▸ **getRequestData**(): `object`

#### Returns

`object`

#### Defined in

[src/core/scene.ts:54](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/scene.ts#L54)
