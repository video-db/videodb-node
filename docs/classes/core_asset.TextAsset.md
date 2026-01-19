[videodb](../README.md) / [Exports](../modules.md) / [core/asset](../modules/core_asset.md) / TextAsset

# Class: TextAsset

[core/asset](../modules/core_asset.md).TextAsset

## Hierarchy

- `MediaAsset`

  ↳ **`TextAsset`**

## Table of contents

### Constructors

- [constructor](core_asset.TextAsset.md#constructor)

### Properties

- [assetId](core_asset.TextAsset.md#assetid)
- [duration](core_asset.TextAsset.md#duration)
- [style](core_asset.TextAsset.md#style)
- [text](core_asset.TextAsset.md#text)

### Methods

- [toJSON](core_asset.TextAsset.md#tojson)

## Constructors

### constructor

• **new TextAsset**(`config?`): [`TextAsset`](core_asset.TextAsset.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config?` | `Partial`\<[`TextAssetConfig`](../modules/types_config.md#textassetconfig)\> |

#### Returns

[`TextAsset`](core_asset.TextAsset.md)

#### Overrides

MediaAsset.constructor

#### Defined in

[src/core/asset.ts:159](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L159)

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

[src/core/asset.ts:156](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L156)

___

### style

• **style**: `Partial`\<[`TextStyleProps`](../modules/types_config.md#textstyleprops)\>

#### Defined in

[src/core/asset.ts:157](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L157)

___

### text

• **text**: `string`

#### Defined in

[src/core/asset.ts:155](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L155)

## Methods

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `assetId` | `string` |
| `duration` | ``null`` \| `number` |
| `style` | \{ `alpha?`: `number` ; `basetime?`: `number` ; `bordercolor?`: `string` ; `borderw?`: `number` ; `box?`: `boolean` ; `boxborderw?`: `string` ; `boxcolor?`: `string` ; `boxh?`: `number` ; `boxw?`: `number` ; `expansion?`: `string` ; `fixBounds?`: `boolean` ; `font?`: `string` ; `fontcolor?`: `string` ; `fontcolorExpr?`: `string` ; `fontsize?`: `number` ; `lineSpacing?`: `number` ; `shadowcolor?`: `string` ; `shadowx?`: `number` ; `shadowy?`: `number` ; `tabsize?`: `number` ; `textAlign?`: `string` ; `textShaping?`: `boolean` ; `x?`: `string` \| `number` ; `y?`: `string` \| `number` ; `yAlign?`: `string`  } |
| `style.alpha?` | `number` |
| `style.basetime?` | `number` |
| `style.bordercolor?` | `string` |
| `style.borderw?` | `number` |
| `style.box?` | `boolean` |
| `style.boxborderw?` | `string` |
| `style.boxcolor?` | `string` |
| `style.boxh?` | `number` |
| `style.boxw?` | `number` |
| `style.expansion?` | `string` |
| `style.fixBounds?` | `boolean` |
| `style.font?` | `string` |
| `style.fontcolor?` | `string` |
| `style.fontcolorExpr?` | `string` |
| `style.fontsize?` | `number` |
| `style.lineSpacing?` | `number` |
| `style.shadowcolor?` | `string` |
| `style.shadowx?` | `number` |
| `style.shadowy?` | `number` |
| `style.tabsize?` | `number` |
| `style.textAlign?` | `string` |
| `style.textShaping?` | `boolean` |
| `style.x?` | `string` \| `number` |
| `style.y?` | `string` \| `number` |
| `style.yAlign?` | `string` |
| `text` | `string` |

#### Defined in

[src/core/asset.ts:168](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/asset.ts#L168)
