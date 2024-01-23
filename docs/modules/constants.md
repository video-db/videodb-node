[videodb](../README.md) / [Exports](../modules.md) / constants

# Module: constants

## Table of contents

### Variables

- [ApiPath](constants.md#apipath)
- [DefaultIndexType](constants.md#defaultindextype)
- [DefaultSearchType](constants.md#defaultsearchtype)
- [HttpClientDefaultValues](constants.md#httpclientdefaultvalues)
- [PLAYER\_URL](constants.md#player_url)
- [ResponseStatus](constants.md#responsestatus)
- [SemanticSearchDefaultValues](constants.md#semanticsearchdefaultvalues)
- [VIDEO\_DB\_API](constants.md#video_db_api)
- [Workflows](constants.md#workflows)

## Variables

### ApiPath

• `Const` **ApiPath**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `collection` | ``"collection"`` |
| `compile` | ``"compile"`` |
| `index` | ``"index"`` |
| `search` | ``"search"`` |
| `stream` | ``"stream"`` |
| `thumbnail` | ``"thumbnail"`` |
| `transcription` | ``"transcription"`` |
| `upload` | ``"upload"`` |
| `upload_url` | ``"upload_url"`` |
| `video` | ``"video"`` |
| `workflow` | ``"workflow"`` |

#### Defined in

src/constants.ts:15

___

### DefaultIndexType

• `Const` **DefaultIndexType**: ``"semantic"``

#### Defined in

src/constants.ts:2

___

### DefaultSearchType

• `Const` **DefaultSearchType**: ``"semantic"``

#### Defined in

src/constants.ts:1

___

### HttpClientDefaultValues

• `Const` **HttpClientDefaultValues**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `backoff_factor` | ``0.1`` |
| `max_retries` | ``3`` |
| `timeout` | `number` |

#### Defined in

src/constants.ts:34

___

### PLAYER\_URL

• `Const` **PLAYER\_URL**: ``"https://console.videodb.io/player"``

#### Defined in

src/constants.ts:41

___

### ResponseStatus

• `Const` **ResponseStatus**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `in_progress` | ``"in progress"`` |
| `processing` | ``"processing"`` |

#### Defined in

src/constants.ts:29

___

### SemanticSearchDefaultValues

• `Const` **SemanticSearchDefaultValues**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `dynamicScorePercentage` | ``30`` |
| `namespace` | ``"dev"`` |
| `resultThreshold` | ``50`` |
| `scoreThreshold` | ``0.2`` |

#### Defined in

src/constants.ts:4

___

### VIDEO\_DB\_API

• `Const` **VIDEO\_DB\_API**: ``"https://api.videodb.io"``

#### Defined in

src/constants.ts:40

___

### Workflows

• `Const` **Workflows**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `addSubtitles` | `string` |

#### Defined in

src/constants.ts:11
