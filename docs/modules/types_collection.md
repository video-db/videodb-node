[videodb](../README.md) / [Exports](../modules.md) / types/collection

# Module: types/collection

## Table of contents

### Interfaces

- [CommonUploadConfig](../interfaces/types_collection.CommonUploadConfig.md)
- [FileUploadConfig](../interfaces/types_collection.FileUploadConfig.md)
- [URLUploadConfig](../interfaces/types_collection.URLUploadConfig.md)

### Type Aliases

- [SyncUploadConfig](types_collection.md#syncuploadconfig)
- [UploadConfig](types_collection.md#uploadconfig)

## Type Aliases

### SyncUploadConfig

Ƭ **SyncUploadConfig**: `Omit`\<[`URLUploadConfig`](../interfaces/types_collection.URLUploadConfig.md), ``"callbackUrl"``\>

#### Defined in

[src/types/collection.ts:18](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/collection.ts#L18)

___

### UploadConfig

Ƭ **UploadConfig**: [`FileUploadConfig`](../interfaces/types_collection.FileUploadConfig.md) \| [`URLUploadConfig`](../interfaces/types_collection.URLUploadConfig.md)

#### Defined in

[src/types/collection.ts:16](https://github.com/video-db/videodb-node/blob/4dc9a20/src/types/collection.ts#L16)
