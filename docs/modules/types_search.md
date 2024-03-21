[videodb](../README.md) / [Exports](../modules.md) / types/search

# Module: types/search

## Table of contents

### Type Aliases

- [IndexType](types_search.md#indextype)
- [KeywordCollectionSearch](types_search.md#keywordcollectionsearch)
- [KeywordSearchBase](types_search.md#keywordsearchbase)
- [KeywordVideoSearch](types_search.md#keywordvideosearch)
- [SceneCollectionSearch](types_search.md#scenecollectionsearch)
- [SceneSearchBase](types_search.md#scenesearchbase)
- [SceneVideoSearch](types_search.md#scenevideosearch)
- [SearchType](types_search.md#searchtype)
- [SemanticCollectionSearch](types_search.md#semanticcollectionsearch)
- [SemanticSearchBase](types_search.md#semanticsearchbase)
- [SemanticVideoSearch](types_search.md#semanticvideosearch)

## Type Aliases

### IndexType

Ƭ **IndexType**: keyof typeof [`IndexTypeValues`](../enums/core_search.IndexTypeValues.md)

#### Defined in

[src/types/search.ts:4](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L4)

___

### KeywordCollectionSearch

Ƭ **KeywordCollectionSearch**: \{ `collectionId`: `string`  } & [`SemanticSearchBase`](types_search.md#semanticsearchbase)

#### Defined in

[src/types/search.ts:44](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L44)

___

### KeywordSearchBase

Ƭ **KeywordSearchBase**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `resultThreshold?` | `number` |
| `scoreThreshold?` | `number` |

#### Defined in

[src/types/search.ts:34](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L34)

___

### KeywordVideoSearch

Ƭ **KeywordVideoSearch**: \{ `videoId`: `string`  } & [`SemanticSearchBase`](types_search.md#semanticsearchbase)

#### Defined in

[src/types/search.ts:40](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L40)

___

### SceneCollectionSearch

Ƭ **SceneCollectionSearch**: \{ `collectionId`: `string`  } & [`SceneSearchBase`](types_search.md#scenesearchbase)

#### Defined in

[src/types/search.ts:16](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L16)

___

### SceneSearchBase

Ƭ **SceneSearchBase**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `resultThreshold?` | `number` |
| `scoreThreshold?` | `number` |

#### Defined in

[src/types/search.ts:6](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L6)

___

### SceneVideoSearch

Ƭ **SceneVideoSearch**: \{ `videoId`: `string`  } & [`SceneSearchBase`](types_search.md#scenesearchbase)

#### Defined in

[src/types/search.ts:12](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L12)

___

### SearchType

Ƭ **SearchType**: keyof typeof [`SearchTypeValues`](../enums/core_search.SearchTypeValues.md)

#### Defined in

[src/types/search.ts:3](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L3)

___

### SemanticCollectionSearch

Ƭ **SemanticCollectionSearch**: \{ `collectionId`: `string`  } & [`SemanticSearchBase`](types_search.md#semanticsearchbase)

#### Defined in

[src/types/search.ts:30](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L30)

___

### SemanticSearchBase

Ƭ **SemanticSearchBase**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `resultThreshold?` | `number` |
| `scoreThreshold?` | `number` |

#### Defined in

[src/types/search.ts:20](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L20)

___

### SemanticVideoSearch

Ƭ **SemanticVideoSearch**: \{ `videoId`: `string`  } & [`SemanticSearchBase`](types_search.md#semanticsearchbase)

#### Defined in

[src/types/search.ts:26](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/search.ts#L26)
