[videodb](../README.md) / [Exports](../modules.md) / [core/timeline](../modules/core_timeline.md) / Timeline

# Class: Timeline

[core/timeline](../modules/core_timeline.md).Timeline

## Implements

- [`ITimeline`](../interfaces/interfaces_core.ITimeline.md)

## Table of contents

### Constructors

- [constructor](core_timeline.Timeline.md#constructor)

### Properties

- [playerUrl](core_timeline.Timeline.md#playerurl)
- [streamUrl](core_timeline.Timeline.md#streamurl)
- [timeline](core_timeline.Timeline.md#timeline)

### Methods

- [addInline](core_timeline.Timeline.md#addinline)
- [addOverlay](core_timeline.Timeline.md#addoverlay)
- [generateStream](core_timeline.Timeline.md#generatestream)

## Constructors

### constructor

• **new Timeline**(`connection`): [`Timeline`](core_timeline.Timeline.md)

Initialize a timeline object

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `connection` | [`Connection`](core_connection.Connection.md) | Connection object. See [[Connection]] |

#### Returns

[`Timeline`](core_timeline.Timeline.md)

Timeline object

#### Defined in

[src/core/timeline.ts:22](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/timeline.ts#L22)

## Properties

### playerUrl

• **playerUrl**: `string`

#### Implementation of

[ITimeline](../interfaces/interfaces_core.ITimeline.md).[playerUrl](../interfaces/interfaces_core.ITimeline.md#playerurl)

#### Defined in

[src/core/timeline.ts:15](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/timeline.ts#L15)

___

### streamUrl

• **streamUrl**: `string`

#### Implementation of

[ITimeline](../interfaces/interfaces_core.ITimeline.md).[streamUrl](../interfaces/interfaces_core.ITimeline.md#streamurl)

#### Defined in

[src/core/timeline.ts:14](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/timeline.ts#L14)

___

### timeline

• **timeline**: `object`[]

#### Implementation of

[ITimeline](../interfaces/interfaces_core.ITimeline.md).[timeline](../interfaces/interfaces_core.ITimeline.md#timeline)

#### Defined in

[src/core/timeline.ts:13](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/timeline.ts#L13)

## Methods

### addInline

▸ **addInline**(`asset`): `void`

Adds a VideoAsset to the timeline in inline position

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `asset` | [`VideoAsset`](core_asset.VideoAsset.md) | VideoAsset object. Can be created using [[VideoAsset]] |

#### Returns

`void`

#### Implementation of

[ITimeline](../interfaces/interfaces_core.ITimeline.md).[addInline](../interfaces/interfaces_core.ITimeline.md#addinline)

#### Defined in

[src/core/timeline.ts:41](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/timeline.ts#L41)

___

### addOverlay

▸ **addOverlay**(`start`, `asset`): `void`

Adds a AudioAsset to the timeline in overlay position

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start` | `number` | Start time of the overlay w.r.t Base Timline |
| `asset` | [`AudioAsset`](core_asset.AudioAsset.md) \| [`ImageAsset`](core_asset.ImageAsset.md) \| [`TextAsset`](core_asset.TextAsset.md) | AudioAsset, ImageAsset or TextAsset object. |

#### Returns

`void`

#### Implementation of

[ITimeline](../interfaces/interfaces_core.ITimeline.md).[addOverlay](../interfaces/interfaces_core.ITimeline.md#addoverlay)

#### Defined in

[src/core/timeline.ts:53](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/timeline.ts#L53)

___

### generateStream

▸ **generateStream**(): `Promise`\<`string`\>

Generates a Streaming URL for the Timeline object

#### Returns

`Promise`\<`string`\>

An await URL to the timeline stream

#### Implementation of

[ITimeline](../interfaces/interfaces_core.ITimeline.md).[generateStream](../interfaces/interfaces_core.ITimeline.md#generatestream)

#### Defined in

[src/core/timeline.ts:70](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/timeline.ts#L70)
