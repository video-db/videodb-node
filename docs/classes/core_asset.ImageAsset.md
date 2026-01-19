[videodb](../README.md) / [Exports](../modules.md) / [core/asset](../modules/core_asset.md) / ImageAsset

# Class: ImageAsset

[core/asset](../modules/core_asset.md).ImageAsset

## Hierarchy

- `MediaAsset`

  ↳ **`ImageAsset`**

## Table of contents

### Constructors

- [constructor](core_asset.ImageAsset.md#constructor)

### Properties

- [assetId](core_asset.ImageAsset.md#assetid)
- [duration](core_asset.ImageAsset.md#duration)
- [height](core_asset.ImageAsset.md#height)
- [width](core_asset.ImageAsset.md#width)
- [x](core_asset.ImageAsset.md#x)
- [y](core_asset.ImageAsset.md#y)

### Methods

- [toJSON](core_asset.ImageAsset.md#tojson)

## Constructors

### constructor

• **new ImageAsset**(`assetId`, `config?`): [`ImageAsset`](core_asset.ImageAsset.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `assetId` | `string` |
| `config?` | `Partial`\<[`ImageAssetConfig`](../modules/types_config.md#imageassetconfig)\> |

#### Returns

[`ImageAsset`](core_asset.ImageAsset.md)

#### Overrides

MediaAsset.constructor

#### Defined in

[src/core/asset.ts:126](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L126)

## Properties

### assetId

• **assetId**: `string`

#### Inherited from

MediaAsset.assetId

#### Defined in

[src/core/asset.ts:31](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L31)

___

### duration

• **duration**: ``null`` \| `number`

#### Defined in

[src/core/asset.ts:124](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L124)

___

### height

• **height**: `string` \| `number`

#### Defined in

[src/core/asset.ts:121](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L121)

___

### width

• **width**: `string` \| `number`

#### Defined in

[src/core/asset.ts:120](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L120)

___

### x

• **x**: `string` \| `number`

#### Defined in

[src/core/asset.ts:122](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L122)

___

### y

• **y**: `string` \| `number`

#### Defined in

[src/core/asset.ts:123](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L123)

## Methods

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `assetId` | `string` |
| `duration` | ``null`` \| `number` |
| `height` | `string` \| `number` |
| `width` | `string` \| `number` |
| `x` | `string` \| `number` |
| `y` | `string` \| `number` |

#### Defined in

[src/core/asset.ts:142](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L142)
