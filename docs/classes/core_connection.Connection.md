[videodb](../README.md) / [Exports](../modules.md) / [core/connection](../modules/core_connection.md) / Connection

# Class: Connection

[core/connection](../modules/core_connection.md).Connection

Initalizon precedes connection
establishment. Is used to get the
primary collection.

## Table of contents

### Constructors

- [constructor](core_connection.Connection.md#constructor)

### Properties

- [vhttp](core_connection.Connection.md#vhttp)

### Methods

- [getCollection](core_connection.Connection.md#getcollection)
- [uploadFile](core_connection.Connection.md#uploadfile)
- [uploadURL](core_connection.Connection.md#uploadurl)

## Constructors

### constructor

• **new Connection**(`baseURL`, `ApiKey`): [`Connection`](core_connection.Connection.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseURL` | `string` |
| `ApiKey` | `string` |

#### Returns

[`Connection`](core_connection.Connection.md)

#### Defined in

[src/core/connection.ts:22](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/connection.ts#L22)

## Properties

### vhttp

• **vhttp**: [`HttpClient`](utils_httpClient.HttpClient.md)

#### Defined in

[src/core/connection.ts:21](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/connection.ts#L21)

## Methods

### getCollection

▸ **getCollection**(`id?`): `Promise`\<[`Collection`](core_collection.Collection.md)\>

Get an instance of the Collection class

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `id` | `string` | `'default'` | [Optional] ID of the collection |

#### Returns

`Promise`\<[`Collection`](core_collection.Collection.md)\>

If ID is provided, returns the corresponding collection,
else returns the default collection.

#### Defined in

[src/core/connection.ts:33](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/connection.ts#L33)

___

### uploadFile

▸ **uploadFile**(`collectionId?`, `data`): `Promise`\<`undefined` \| [`UploadJob`](utils_job.UploadJob.md)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `collectionId` | `string` | `'default'` |
| `data` | [`FileUploadConfig`](../interfaces/types_collection.FileUploadConfig.md) | `undefined` |

#### Returns

`Promise`\<`undefined` \| [`UploadJob`](utils_job.UploadJob.md)\>

**`See`**

Providing a callbackUrl will return undefined and not providing one
will return a Job object (TODO: Implement proper type for this condition)

#### Defined in

[src/core/connection.ts:50](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/connection.ts#L50)

___

### uploadURL

▸ **uploadURL**(`collectionId?`, `data`): `Promise`\<`undefined` \| [`UploadJob`](utils_job.UploadJob.md)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `collectionId` | `string` | `'default'` |
| `data` | [`URLUploadConfig`](../interfaces/types_collection.URLUploadConfig.md) | `undefined` |

#### Returns

`Promise`\<`undefined` \| [`UploadJob`](utils_job.UploadJob.md)\>

**`See`**

Providing a callbackUrl will return undefined and not providing one
will return a Job object (TODO: Implement proper type for this condition)

#### Defined in

[src/core/connection.ts:67](https://github.com/video-db/videodb-node/blob/4dc9a20/src/core/connection.ts#L67)
