[videodb](../README.md) / [Exports](../modules.md) / [core/search](../modules/core_search.md) / SearchFactory

# Class: SearchFactory

[core/search](../modules/core_search.md).SearchFactory

## Table of contents

### Constructors

- [constructor](core_search.SearchFactory.md#constructor)

### Methods

- [getSearch](core_search.SearchFactory.md#getsearch)

## Constructors

### constructor

• **new SearchFactory**(`http`): [`SearchFactory`](core_search.SearchFactory.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `http` | [`HttpClient`](utils_httpClient.HttpClient.md) |

#### Returns

[`SearchFactory`](core_search.SearchFactory.md)

#### Defined in

[src/core/search/index.ts:141](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/search/index.ts#L141)

## Methods

### getSearch

▸ **getSearch**(`type`): `SemanticSearch` \| `KeywordSearch`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | ``"keyword"`` \| ``"semantic"`` |

#### Returns

`SemanticSearch` \| `KeywordSearch`

#### Defined in

[src/core/search/index.ts:144](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/search/index.ts#L144)
