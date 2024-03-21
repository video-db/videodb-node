[videodb](../README.md) / [Exports](../modules.md) / [core/asset](../modules/core_asset.md) / VideoAsset

# Class: VideoAsset

[core/asset](../modules/core_asset.md).VideoAsset

VideoAsset class

## Hierarchy

- `MediaAsset`

  ↳ **`VideoAsset`**

## Table of contents

### Constructors

- [constructor](core_asset.VideoAsset.md#constructor)

### Properties

- [assetId](core_asset.VideoAsset.md#assetid)
- [end](core_asset.VideoAsset.md#end)
- [start](core_asset.VideoAsset.md#start)

### Methods

- [toJSON](core_asset.VideoAsset.md#tojson)

## Constructors

### constructor

• **new VideoAsset**(`assetId`, `config?`): [`VideoAsset`](core_asset.VideoAsset.md)

Initializes a AudioAsset instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `assetId` | `string` | The id of the audio asset. |
| `config?` | `Partial`\<[`VideoAssetConfig`](../modules/types_config.md#videoassetconfig)\> | The configuration of the audio asset. |

#### Returns

[`VideoAsset`](core_asset.VideoAsset.md)

A new AudioAsset instance.

#### Overrides

MediaAsset.constructor

#### Defined in

[src/core/asset.ts:51](https://github.com/video-db/videodb-node/blob/583396d/src/core/asset.ts#L51)

## Properties

### assetId

• **assetId**: `string`

#### Inherited from

MediaAsset.assetId

#### Defined in

[src/core/asset.ts:31](https://github.com/video-db/videodb-node/blob/583396d/src/core/asset.ts#L31)

___

### end

• **end**: ``null`` \| `number`

#### Defined in

[src/core/asset.ts:43](https://github.com/video-db/videodb-node/blob/583396d/src/core/asset.ts#L43)

___

### start

• **start**: `number`

#### Defined in

[src/core/asset.ts:42](https://github.com/video-db/videodb-node/blob/583396d/src/core/asset.ts#L42)

## Methods

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `assetId` | `string` |
| `end` | ``null`` \| `number` |
| `start` | `number` |

#### Defined in

[src/core/asset.ts:58](https://github.com/video-db/videodb-node/blob/583396d/src/core/asset.ts#L58)
