[videodb](../README.md) / [Exports](../modules.md) / types/search

# Module: types/search

## Table of contents

### Type Aliases

- [IndexType](types_search.md#indextype)
- [KeywordCollectionSearch](types_search.md#keywordcollectionsearch)
- [KeywordSearchBase](types_search.md#keywordsearchbase)
- [KeywordVideoSearch](types_search.md#keywordvideosearch)
- [SearchBase](types_search.md#searchbase)
- [SearchType](types_search.md#searchtype)
- [SemanticCollectionSearch](types_search.md#semanticcollectionsearch)
- [SemanticSearchBase](types_search.md#semanticsearchbase)
- [SemanticVideoSearch](types_search.md#semanticvideosearch)

## Type Aliases

### IndexType

Ƭ **IndexType**: keyof typeof [`IndexTypeValues`](../enums/core_config.IndexTypeValues.md)

#### Defined in

[src/types/search.ts:4](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/search.ts#L4)

___

### KeywordCollectionSearch

Ƭ **KeywordCollectionSearch**: \{ `collectionId`: `string`  } & [`KeywordSearchBase`](types_search.md#keywordsearchbase)

#### Defined in

[src/types/search.ts:30](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/search.ts#L30)

___

### KeywordSearchBase

Ƭ **KeywordSearchBase**: [`SearchBase`](types_search.md#searchbase)

#### Defined in

[src/types/search.ts:24](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/search.ts#L24)

___

### KeywordVideoSearch

Ƭ **KeywordVideoSearch**: \{ `videoId`: `string`  } & [`KeywordSearchBase`](types_search.md#keywordsearchbase)

#### Defined in

[src/types/search.ts:26](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/search.ts#L26)

___

### SearchBase

Ƭ **SearchBase**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `indexType` | [`IndexType`](types_search.md#indextype) |
| `query` | `string` |
| `resultThreshold?` | `number` |
| `scoreThreshold?` | `number` |
| `searchType` | [`SearchType`](types_search.md#searchtype) |

#### Defined in

[src/types/search.ts:6](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/search.ts#L6)

___

### SearchType

Ƭ **SearchType**: keyof typeof [`SearchTypeValues`](../enums/core_config.SearchTypeValues.md)

#### Defined in

[src/types/search.ts:3](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/search.ts#L3)

___

### SemanticCollectionSearch

Ƭ **SemanticCollectionSearch**: \{ `collectionId`: `string`  } & [`SemanticSearchBase`](types_search.md#semanticsearchbase)

#### Defined in

[src/types/search.ts:20](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/search.ts#L20)

___

### SemanticSearchBase

Ƭ **SemanticSearchBase**: [`SearchBase`](types_search.md#searchbase)

#### Defined in

[src/types/search.ts:14](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/search.ts#L14)

___

### SemanticVideoSearch

Ƭ **SemanticVideoSearch**: \{ `videoId`: `string`  } & [`SemanticSearchBase`](types_search.md#semanticsearchbase)

#### Defined in

[src/types/search.ts:16](https://github.com/omgate234/videodb-node/blob/047cbbf/src/types/search.ts#L16)
