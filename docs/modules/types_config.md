[videodb](../README.md) / [Exports](../modules.md) / types/config

# Module: types/config

## Table of contents

### Type Aliases

- [AudioAssetConfig](types_config.md#audioassetconfig)
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

[src/types/config.ts:56](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/config.ts#L56)

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

[src/types/config.ts:69](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/config.ts#L69)

___

### IndexConfig

Ƭ **IndexConfig**: \{ `indexType`: [`IndexType`](types_search.md#indextype)  } & [`IndexSceneConfig`](types_config.md#indexsceneconfig)

#### Defined in

[src/types/config.ts:89](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/config.ts#L89)

___

### IndexSceneConfig

Ƭ **IndexSceneConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callbackUrl?` | `string` \| ``null`` |
| `force?` | `boolean` |
| `prompt?` | `string` \| ``null`` |

#### Defined in

[src/types/config.ts:83](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/config.ts#L83)

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

[src/types/config.ts:4](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/config.ts#L4)

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

[src/types/config.ts:77](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/config.ts#L77)

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

[src/types/config.ts:28](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/config.ts#L28)

___

### VideoAssetConfig

Ƭ **VideoAssetConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `end` | `number` |
| `start` | `number` |

#### Defined in

[src/types/config.ts:64](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/config.ts#L64)
