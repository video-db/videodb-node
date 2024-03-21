[videodb](../README.md) / [Exports](../modules.md) / [core/asset](../modules/core_asset.md) / AudioAsset

# Class: AudioAsset

[core/asset](../modules/core_asset.md).AudioAsset

AudioAsset class

## Hierarchy

- `MediaAsset`

  ↳ **`AudioAsset`**

## Table of contents

### Constructors

- [constructor](core_asset.AudioAsset.md#constructor)

### Properties

- [assetId](core_asset.AudioAsset.md#assetid)
- [disableOtherTracks](core_asset.AudioAsset.md#disableothertracks)
- [end](core_asset.AudioAsset.md#end)
- [fadeInDuration](core_asset.AudioAsset.md#fadeinduration)
- [fadeOutDuration](core_asset.AudioAsset.md#fadeoutduration)
- [start](core_asset.AudioAsset.md#start)

### Methods

- [toJSON](core_asset.AudioAsset.md#tojson)

## Constructors

### constructor

• **new AudioAsset**(`assetId`, `config?`): [`AudioAsset`](core_asset.AudioAsset.md)

Initializes a AudioAsset instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `assetId` | `string` | The id of the audio asset. |
| `config?` | `Partial`\<[`AudioAssetConfig`](../modules/types_config.md#audioassetconfig)\> | The configuration of the audio asset. |

#### Returns

[`AudioAsset`](core_asset.AudioAsset.md)

A new AudioAsset instance.

#### Overrides

MediaAsset.constructor

#### Defined in

[src/core/asset.ts:83](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/asset.ts#L83)

## Properties

### assetId

• **assetId**: `string`

#### Inherited from

MediaAsset.assetId

#### Defined in

[src/core/asset.ts:31](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/asset.ts#L31)

___

### disableOtherTracks

• **disableOtherTracks**: `boolean`

#### Defined in

[src/core/asset.ts:73](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/asset.ts#L73)

___

### end

• **end**: ``null`` \| `number`

#### Defined in

[src/core/asset.ts:72](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/asset.ts#L72)

___

### fadeInDuration

• **fadeInDuration**: `number`

#### Defined in

[src/core/asset.ts:74](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/asset.ts#L74)

___

### fadeOutDuration

• **fadeOutDuration**: `number`

#### Defined in

[src/core/asset.ts:75](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/asset.ts#L75)

___

### start

• **start**: `number`

#### Defined in

[src/core/asset.ts:71](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/asset.ts#L71)

## Methods

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `assetId` | `string` |
| `disableOtherTracks` | `boolean` |
| `end` | ``null`` \| `number` |
| `fadeInDuration` | `number` |
| `fadeOutDuration` | `number` |
| `start` | `number` |

#### Defined in

[src/core/asset.ts:107](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/asset.ts#L107)
