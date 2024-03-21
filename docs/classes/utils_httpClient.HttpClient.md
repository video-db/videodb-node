[videodb](../README.md) / [Exports](../modules.md) / [utils/httpClient](../modules/utils_httpClient.md) / HttpClient

# Class: HttpClient

[utils/httpClient](../modules/utils_httpClient.md).HttpClient

Api initialization to make axios config
options available to all child classes
internally.

## Table of contents

### Constructors

- [constructor](utils_httpClient.HttpClient.md#constructor)

### Methods

- [delete](utils_httpClient.HttpClient.md#delete)
- [get](utils_httpClient.HttpClient.md#get)
- [parseResponse](utils_httpClient.HttpClient.md#parseresponse)
- [patch](utils_httpClient.HttpClient.md#patch)
- [post](utils_httpClient.HttpClient.md#post)
- [put](utils_httpClient.HttpClient.md#put)

## Constructors

### constructor

• **new HttpClient**(`baseURL`, `apiKey`): [`HttpClient`](utils_httpClient.HttpClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseURL` | `string` |
| `apiKey` | `string` |

#### Returns

[`HttpClient`](utils_httpClient.HttpClient.md)

#### Defined in

[src/utils/httpClient.ts:27](https://github.com/video-db/videodb-node/blob/4dc9a20/src/utils/httpClient.ts#L27)

## Methods

### delete

▸ **delete**\<`R`\>(`urlSeries`, `options?`): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`R`\>\>

#### Type parameters

| Name |
| :------ |
| `R` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `urlSeries` | `string`[] |
| `options?` | `AxiosRequestConfig`\<`undefined`\> |

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`R`\>\>

#### Defined in

[src/utils/httpClient.ts:107](https://github.com/video-db/videodb-node/blob/4dc9a20/src/utils/httpClient.ts#L107)

___

### get

▸ **get**\<`R`\>(`urlSeries`, `options?`): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`R`\>\>

#### Type parameters

| Name |
| :------ |
| `R` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `urlSeries` | `string`[] |
| `options?` | `AxiosRequestConfig`\<`undefined`\> |

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`R`\>\>

#### Defined in

[src/utils/httpClient.ts:96](https://github.com/video-db/videodb-node/blob/4dc9a20/src/utils/httpClient.ts#L96)

___

### parseResponse

▸ **parseResponse**\<`D`\>(`data`): [`ResponseOf`](../modules/types_response.md#responseof)\<`D`\>

#### Type parameters

| Name |
| :------ |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`ResponseOf`](../modules/types_response.md#responseof)\<`D`\> |

#### Returns

[`ResponseOf`](../modules/types_response.md#responseof)\<`D`\>

#### Defined in

[src/utils/httpClient.ts:61](https://github.com/video-db/videodb-node/blob/4dc9a20/src/utils/httpClient.ts#L61)

___

### patch

▸ **patch**\<`R`, `D`\>(`urlSeries`, `data?`, `options?`): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`R`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `R` | `R` |
| `D` | `undefined` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `urlSeries` | `string`[] |
| `data?` | `D` |
| `options?` | `AxiosRequestConfig`\<`D`\> |

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`R`\>\>

#### Defined in

[src/utils/httpClient.ts:152](https://github.com/video-db/videodb-node/blob/4dc9a20/src/utils/httpClient.ts#L152)

___

### post

▸ **post**\<`R`, `D`\>(`urlSeries`, `data?`, `options?`): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`R`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `R` | `R` |
| `D` | `undefined` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `urlSeries` | `string`[] |
| `data?` | `D` |
| `options?` | `AxiosRequestConfig`\<`D`\> |

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`R`\>\>

#### Defined in

[src/utils/httpClient.ts:118](https://github.com/video-db/videodb-node/blob/4dc9a20/src/utils/httpClient.ts#L118)

___

### put

▸ **put**\<`R`, `D`\>(`urlSeries`, `data?`, `options?`): `Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`R`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `R` | `R` |
| `D` | `undefined` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `urlSeries` | `string`[] |
| `data?` | `D` |
| `options?` | `AxiosRequestConfig`\<`D`\> |

#### Returns

`Promise`\<[`ResponseOf`](../modules/types_response.md#responseof)\<`R`\>\>

#### Defined in

[src/utils/httpClient.ts:135](https://github.com/video-db/videodb-node/blob/4dc9a20/src/utils/httpClient.ts#L135)
