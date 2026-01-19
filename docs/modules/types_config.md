[videodb](../README.md) / [Exports](../modules.md) / types/config

# Module: types/config

## Table of contents

### Type Aliases

- [AudioAssetConfig](types_config.md#audioassetconfig)
- [ExtractSceneConfig](types_config.md#extractsceneconfig)
- [ImageAssetConfig](types_config.md#imageassetconfig)
- [IndexConfig](types_config.md#indexconfig)
- [IndexSceneConfig](types_config.md#indexsceneconfig)
- [SubtitleStyleProps](types_config.md#subtitlestyleprops)
- [TextAssetConfig](types_config.md#textassetconfig)
- [TextStyleProps](types_config.md#textstyleprops)
- [VideoAssetConfig](types_config.md#videoassetconfig)

## Type Aliases

### AudioAssetConfig

Ƭ **AudioAssetConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `disableOtherTracks` | `boolean` |
| `end` | `number` \| ``null`` |
| `fadeInDuration` | `number` |
| `fadeOutDuration` | `number` |
| `start` | `number` |

#### Defined in

[src/types/config.ts:57](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/config.ts#L57)

___

### ExtractSceneConfig

Ƭ **ExtractSceneConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callbackUrl?` | `string` \| ``null`` |
| `extractionConfig?` | `object` |
| `extractionType?` | `string` |
| `force` | `boolean` |

#### Defined in

[src/types/config.ts:84](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/config.ts#L84)

___

### ImageAssetConfig

Ƭ **ImageAssetConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `duration` | `number` \| ``null`` |
| `height` | `number` \| `string` |
| `width` | `number` \| `string` |
| `x` | `number` \| `string` |
| `y` | `number` \| `string` |

#### Defined in

[src/types/config.ts:70](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/config.ts#L70)

___

### IndexConfig

Ƭ **IndexConfig**: \{ `indexType`: [`IndexType`](types_search.md#indextype)  } & [`IndexSceneConfig`](types_config.md#indexsceneconfig)

#### Defined in

[src/types/config.ts:101](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/config.ts#L101)

___

### IndexSceneConfig

Ƭ **IndexSceneConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callbackUrl?` | `string` \| ``null`` |
| `extractionConfig?` | `object` |
| `extractionType?` | `string` |
| `modelConfig?` | `object` |
| `modelName?` | `string` |
| `prompt?` | `string` \| ``null`` |
| `scenes?` | [`Scene`](../classes/core_scene.Scene.md)[] |

#### Defined in

[src/types/config.ts:91](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/config.ts#L91)

___

### SubtitleStyleProps

Ƭ **SubtitleStyleProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `alignment` | [`SubtitleAlignment`](../enums/core_config.SubtitleAlignment.md) |
| `angle` | `number` |
| `backColour` | `string` |
| `bold` | `boolean` |
| `borderStyle` | [`SubtitleBorderStyle`](../enums/core_config.SubtitleBorderStyle.md) |
| `fontName` | `string` |
| `fontSize` | `number` |
| `italic` | `boolean` |
| `marginL` | `number` |
| `marginR` | `number` |
| `marginV` | `number` |
| `outline` | `number` |
| `outlineColour` | `string` |
| `primaryColour` | `string` |
| `scaleX` | `number` |
| `scaleY` | `number` |
| `secondaryColour` | `string` |
| `shadow` | `number` |
| `spacing` | `number` |
| `strikeOut` | `boolean` |
| `underline` | `boolean` |

#### Defined in

[src/types/config.ts:5](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/config.ts#L5)

___

### TextAssetConfig

Ƭ **TextAssetConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `duration?` | `number` |
| `style` | `Partial`\<[`TextStyleProps`](types_config.md#textstyleprops)\> |
| `text` | `string` |

#### Defined in

[src/types/config.ts:78](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/config.ts#L78)

___

### TextStyleProps

Ƭ **TextStyleProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `alpha` | `number` |
| `basetime` | `number` |
| `bordercolor` | `string` |
| `borderw` | `number` |
| `box` | `boolean` |
| `boxborderw` | `string` |
| `boxcolor` | `string` |
| `boxh` | `number` |
| `boxw` | `number` |
| `expansion` | `string` |
| `fixBounds` | `boolean` |
| `font` | `string` |
| `fontcolor` | `string` |
| `fontcolorExpr` | `string` |
| `fontsize` | `number` |
| `lineSpacing` | `number` |
| `shadowcolor` | `string` |
| `shadowx` | `number` |
| `shadowy` | `number` |
| `tabsize` | `number` |
| `textAlign` | `string` |
| `textShaping` | `boolean` |
| `x` | `string` \| `number` |
| `y` | `string` \| `number` |
| `yAlign` | `string` |

#### Defined in

[src/types/config.ts:29](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/config.ts#L29)

___

### VideoAssetConfig

Ƭ **VideoAssetConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `end` | `number` |
| `start` | `number` |

#### Defined in

[src/types/config.ts:65](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/config.ts#L65)
