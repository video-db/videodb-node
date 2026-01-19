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

- [createCollection](core_connection.Connection.md#createcollection)
- [getCollection](core_connection.Connection.md#getcollection)
- [getCollections](core_connection.Connection.md#getcollections)
- [updateCollection](core_connection.Connection.md#updatecollection)
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

[src/core/connection.ts:25](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/connection.ts#L25)

## Properties

### vhttp

• **vhttp**: [`HttpClient`](utils_httpClient.HttpClient.md)

#### Defined in

[src/core/connection.ts:24](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/connection.ts#L24)

## Methods

### createCollection

▸ **createCollection**(`name`, `description`): `Promise`\<[`Collection`](core_collection.Collection.md)\>

Create a new collection

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Name of the collection |
| `description` | `string` | Description of the collection |

#### Returns

`Promise`\<[`Collection`](core_collection.Collection.md)\>

Returns a new Collection object

#### Defined in

[src/core/connection.ts:65](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/connection.ts#L65)

___

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

[src/core/connection.ts:36](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/connection.ts#L36)

___

### getCollections

▸ **getCollections**(): `Promise`\<[`Collection`](core_collection.Collection.md)[]\>

Get all Collections from db

#### Returns

`Promise`\<[`Collection`](core_collection.Collection.md)[]\>

Returns an array of Collection objects

#### Defined in

[src/core/connection.ts:48](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/connection.ts#L48)

___

### updateCollection

▸ **updateCollection**(`id`, `name`, `description`): `Promise`\<[`Collection`](core_collection.Collection.md)\>

Update a collection

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | ID of the collection |
| `name` | `string` | Name of the collection |
| `description` | `string` | - |

#### Returns

`Promise`\<[`Collection`](core_collection.Collection.md)\>

Returns an updated Collection object

#### Defined in

[src/core/connection.ts:85](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/connection.ts#L85)

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

[src/core/connection.ts:111](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/connection.ts#L111)

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

[src/core/connection.ts:128](https://github.com/omgate234/videodb-node/blob/047cbbf/src/core/connection.ts#L128)
