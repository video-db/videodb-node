[videodb](../README.md) / [Exports](../modules.md) / [interfaces/core](../modules/interfaces_core.md) / IShot

# Interface: IShot

[interfaces/core](../modules/interfaces_core.md).IShot

Shot class interface for reference

## Implemented by

- [`Shot`](../classes/core_shot.Shot.md)

## Table of contents

### Properties

- [generateStream](interfaces_core.IShot.md#generatestream)
- [meta](interfaces_core.IShot.md#meta)

## Properties

### generateStream

• **generateStream**: () => `Promise`\<`string`\>

#### Type declaration

▸ (): `Promise`\<`string`\>

Fetches the streaming Url of the shot

##### Returns

`Promise`\<`string`\>

An awaited streaming URL

#### Defined in

[src/interfaces/core.ts:128](https://github.com/omgate234/videodb-node/blob/047cbbf/src/interfaces/core.ts#L128)

___

### meta

• **meta**: [`ShotBase`](interfaces_core.ShotBase.md)

#### Defined in

[src/interfaces/core.ts:123](https://github.com/omgate234/videodb-node/blob/047cbbf/src/interfaces/core.ts#L123)
