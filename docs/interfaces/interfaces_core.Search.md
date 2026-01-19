[videodb](../README.md) / [Exports](../modules.md) / [interfaces/core](../modules/interfaces_core.md) / Search

# Interface: Search\<V, C\>

[interfaces/core](../modules/interfaces_core.md).Search

Search class interface for implementations of different
search types

## Type parameters

| Name |
| :------ |
| `V` |
| `C` |

## Table of contents

### Properties

- [searchInsideCollection](interfaces_core.Search.md#searchinsidecollection)
- [searchInsideVideo](interfaces_core.Search.md#searchinsidevideo)

## Properties

### searchInsideCollection

• **searchInsideCollection**: (`data`: `C`) => `Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

#### Type declaration

▸ (`data`): `Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `C` |

##### Returns

`Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

#### Defined in

[src/interfaces/core.ts:137](https://github.com/omgate234/videodb-node/blob/047cbbf/src/interfaces/core.ts#L137)

___

### searchInsideVideo

• **searchInsideVideo**: (`data`: `V`) => `Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

#### Type declaration

▸ (`data`): `Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `V` |

##### Returns

`Promise`\<[`SearchResult`](../classes/core_search_searchResult.SearchResult.md)\>

#### Defined in

[src/interfaces/core.ts:136](https://github.com/omgate234/videodb-node/blob/047cbbf/src/interfaces/core.ts#L136)
