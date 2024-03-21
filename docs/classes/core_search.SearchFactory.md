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

[src/core/search/index.ts:154](https://github.com/video-db/videodb-node/blob/583396d/src/core/search/index.ts#L154)

## Methods

### getSearch

▸ **getSearch**(`type`): `SceneSearch` \| `SemanticSearch` \| `KeywordSearch`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | ``"semantic"`` \| ``"keyword"`` \| ``"scene"`` |

#### Returns

`SceneSearch` \| `SemanticSearch` \| `KeywordSearch`

#### Defined in

[src/core/search/index.ts:157](https://github.com/video-db/videodb-node/blob/583396d/src/core/search/index.ts#L157)
