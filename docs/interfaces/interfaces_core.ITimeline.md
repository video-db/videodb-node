[videodb](../README.md) / [Exports](../modules.md) / [interfaces/core](../modules/interfaces_core.md) / ITimeline

# Interface: ITimeline

[interfaces/core](../modules/interfaces_core.md).ITimeline

## Implemented by

- [`Timeline`](../classes/core_timeline.Timeline.md)

## Table of contents

### Properties

- [playerUrl](interfaces_core.ITimeline.md#playerurl)
- [streamUrl](interfaces_core.ITimeline.md#streamurl)
- [timeline](interfaces_core.ITimeline.md#timeline)

### Methods

- [addInline](interfaces_core.ITimeline.md#addinline)
- [addOverlay](interfaces_core.ITimeline.md#addoverlay)
- [generateStream](interfaces_core.ITimeline.md#generatestream)

## Properties

### playerUrl

• **playerUrl**: `string`

#### Defined in

[src/interfaces/core.ts:143](https://github.com/omgate234/videodb-node/blob/047cbbf/src/interfaces/core.ts#L143)

___

### streamUrl

• **streamUrl**: `string`

#### Defined in

[src/interfaces/core.ts:142](https://github.com/omgate234/videodb-node/blob/047cbbf/src/interfaces/core.ts#L142)

___

### timeline

• **timeline**: `object`[]

#### Defined in

[src/interfaces/core.ts:141](https://github.com/omgate234/videodb-node/blob/047cbbf/src/interfaces/core.ts#L141)

## Methods

### addInline

▸ **addInline**(`asset`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `asset` | [`VideoAsset`](../classes/core_asset.VideoAsset.md) |

#### Returns

`void`

#### Defined in

[src/interfaces/core.ts:144](https://github.com/omgate234/videodb-node/blob/047cbbf/src/interfaces/core.ts#L144)

___

### addOverlay

▸ **addOverlay**(`start`, `asset`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `start` | `number` |
| `asset` | [`AudioAsset`](../classes/core_asset.AudioAsset.md) |

#### Returns

`void`

#### Defined in

[src/interfaces/core.ts:145](https://github.com/omgate234/videodb-node/blob/047cbbf/src/interfaces/core.ts#L145)

___

### generateStream

▸ **generateStream**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/interfaces/core.ts:146](https://github.com/omgate234/videodb-node/blob/047cbbf/src/interfaces/core.ts#L146)
