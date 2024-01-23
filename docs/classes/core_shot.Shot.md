[videodb](../README.md) / [Exports](../modules.md) / [core/shot](../modules/core_shot.md) / Shot

# Class: Shot

[core/shot](../modules/core_shot.md).Shot

A shot is a clip of a specific video

## Implements

- [`IShot`](../interfaces/interfaces_core.IShot.md)

## Table of contents

### Constructors

- [constructor](core_shot.Shot.md#constructor)

### Properties

- [meta](core_shot.Shot.md#meta)

### Methods

- [generateStream](core_shot.Shot.md#generatestream)

## Constructors

### constructor

• **new Shot**(`http`, `meta`): [`Shot`](core_shot.Shot.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) |
| `meta` | [`ShotBase`](../interfaces/interfaces_core.ShotBase.md) |

#### Returns

[`Shot`](core_shot.Shot.md)

#### Defined in

src/core/shot.ts:15

## Properties

### meta

• **meta**: [`ShotBase`](../interfaces/interfaces_core.ShotBase.md)

#### Implementation of

[IShot](../interfaces/interfaces_core.IShot.md).[meta](../interfaces/interfaces_core.IShot.md#meta)

#### Defined in

src/core/shot.ts:13

## Methods

### generateStream

▸ **generateStream**(): `Promise`\<`string`\>

Get the streaming URL for the shot

#### Returns

`Promise`\<`string`\>

A streaming URL for the shot

#### Implementation of

[IShot](../interfaces/interfaces_core.IShot.md).[generateStream](../interfaces/interfaces_core.IShot.md#generatestream)

#### Defined in

src/core/shot.ts:24
