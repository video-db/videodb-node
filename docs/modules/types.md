[videodb](../README.md) / [Exports](../modules.md) / types

# Module: types

## Table of contents

### Enumerations

- [IndexTypeValues](../enums/types.IndexTypeValues.md)
- [SearchTypeValues](../enums/types.SearchTypeValues.md)

### Type Aliases

- [IndexConfig](types.md#indexconfig)
- [IndexType](types.md#indextype)
- [SearchConfig](types.md#searchconfig)
- [SearchType](types.md#searchtype)

## Type Aliases

### IndexConfig

Ƭ **IndexConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `index_type` | [`IndexType`](types.md#indextype) |

#### Defined in

src/types/index.ts:18

___

### IndexType

Ƭ **IndexType**: keyof typeof [`IndexTypeValues`](../enums/types.IndexTypeValues.md)

#### Defined in

src/types/index.ts:9

___

### SearchConfig

Ƭ **SearchConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `resultThreshold?` | `number` |
| `scoreThreshold?` | `number` |
| `type?` | [`SearchType`](types.md#searchtype) |

#### Defined in

src/types/index.ts:11

___

### SearchType

Ƭ **SearchType**: keyof typeof [`SearchTypeValues`](../enums/types.SearchTypeValues.md)

#### Defined in

src/types/index.ts:4
