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

[src/interfaces/core.ts:139](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L139)

___

### streamUrl

• **streamUrl**: `string`

#### Defined in

[src/interfaces/core.ts:138](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L138)

___

### timeline

• **timeline**: `object`[]

#### Defined in

[src/interfaces/core.ts:137](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L137)

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

[src/interfaces/core.ts:140](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L140)

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

[src/interfaces/core.ts:141](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L141)

___

### generateStream

▸ **generateStream**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/interfaces/core.ts:142](https://github.com/video-db/videodb-node/blob/4dc9a20/src/interfaces/core.ts#L142)
