[videodb](../README.md) / [Exports](../modules.md) / types

# Module: types

## Table of contents

### Type Aliases

- [MediaBase](types.md#mediabase)
- [SceneIndex](types.md#sceneindex)
- [SceneIndexRecord](types.md#sceneindexrecord)
- [SceneIndexRecords](types.md#sceneindexrecords)
- [SceneIndexes](types.md#sceneindexes)

## Type Aliases

### MediaBase

Ƭ **MediaBase**: [`VideoBase`](../interfaces/interfaces_core.VideoBase.md) \| [`AudioBase`](../interfaces/interfaces_core.AudioBase.md) \| [`ImageBase`](../interfaces/interfaces_core.ImageBase.md)

#### Defined in

[src/types/index.ts:3](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/index.ts#L3)

___

### SceneIndex

Ƭ **SceneIndex**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `sceneIndexId` | `string` |
| `status` | `string` |

#### Defined in

[src/types/index.ts:12](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/index.ts#L12)

___

### SceneIndexRecord

Ƭ **SceneIndexRecord**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `description` | `string` |
| `end` | `number` |
| `start` | `number` |

#### Defined in

[src/types/index.ts:5](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/index.ts#L5)

___

### SceneIndexRecords

Ƭ **SceneIndexRecords**: [`SceneIndexRecord`](types.md#sceneindexrecord)[]

#### Defined in

[src/types/index.ts:10](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/index.ts#L10)

___

### SceneIndexes

Ƭ **SceneIndexes**: [`SceneIndex`](types.md#sceneindex)[]

#### Defined in

[src/types/index.ts:18](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/index.ts#L18)
