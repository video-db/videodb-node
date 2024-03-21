[videodb](../README.md) / [Exports](../modules.md) / constants

# Module: constants

## Table of contents

### Variables

- [ApiPath](constants.md#apipath)
- [HttpClientDefaultValues](constants.md#httpclientdefaultvalues)
- [KeywordSearchDefaultValues](constants.md#keywordsearchdefaultvalues)
- [MaxSupported](constants.md#maxsupported)
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
| `audio` | ``"audio"`` |
| `collection` | ``"collection"`` |
| `compile` | ``"compile"`` |
| `delete` | ``"delete"`` |
| `image` | ``"image"`` |
| `index` | ``"index"`` |
| `search` | ``"search"`` |
| `stream` | ``"stream"`` |
| `thumbnail` | ``"thumbnail"`` |
| `timeline` | ``"timeline"`` |
| `transcription` | ``"transcription"`` |
| `upload` | ``"upload"`` |
| `upload_url` | ``"upload_url"`` |
| `video` | ``"video"`` |
| `workflow` | ``"workflow"`` |

#### Defined in

[src/constants.ts:19](https://github.com/video-db/videodb-node/blob/583396d/src/constants.ts#L19)

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

[src/constants.ts:42](https://github.com/video-db/videodb-node/blob/583396d/src/constants.ts#L42)

___

### KeywordSearchDefaultValues

• `Const` **KeywordSearchDefaultValues**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `dynamicScorePercentage` | ``30`` |
| `namespace` | ``"dev"`` |
| `resultThreshold` | ``50`` |
| `scoreThreshold` | ``0.2`` |

#### Defined in

[src/constants.ts:8](https://github.com/video-db/videodb-node/blob/583396d/src/constants.ts#L8)

___

### MaxSupported

• `Const` **MaxSupported**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fadeDuration` | `number` |

#### Defined in

[src/constants.ts:48](https://github.com/video-db/videodb-node/blob/583396d/src/constants.ts#L48)

___

### PLAYER\_URL

• `Const` **PLAYER\_URL**: ``"https://console.videodb.io/player"``

#### Defined in

[src/constants.ts:53](https://github.com/video-db/videodb-node/blob/583396d/src/constants.ts#L53)

___

### ResponseStatus

• `Const` **ResponseStatus**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `in_progress` | ``"in progress"`` |
| `processing` | ``"processing"`` |

#### Defined in

[src/constants.ts:37](https://github.com/video-db/videodb-node/blob/583396d/src/constants.ts#L37)

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

[src/constants.ts:1](https://github.com/video-db/videodb-node/blob/583396d/src/constants.ts#L1)

___

### VIDEO\_DB\_API

• `Const` **VIDEO\_DB\_API**: ``"https://api.videodb.io"``

#### Defined in

[src/constants.ts:52](https://github.com/video-db/videodb-node/blob/583396d/src/constants.ts#L52)

___

### Workflows

• `Const` **Workflows**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `addSubtitles` | `string` |

#### Defined in

[src/constants.ts:15](https://github.com/video-db/videodb-node/blob/583396d/src/constants.ts#L15)
