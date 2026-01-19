# Changelog

## [0.1.3] (2026-01-19)

### Added

- Scene Collection management methods:
  - `listSceneCollection()` - Fetch list of scene collections
  - `getSceneCollection()` - Fetch a specific scene collection
  - `deleteSceneCollection()` - Delete a scene collection
- Version header for Node.js SDK identification

### Fixed

- Spoken word indexing using correct index name
- Frame describe with correct input parameters
- Index spoken words without requiring transcript fetching

## [0.1.3-alpha] (2025-01-23)

### Added

- Scene index playground function

## [0.1.2]() (2025-01-22)

### Added

- Support for Scene Index

## [0.1.1]() (2024-04-02)

### Added

- Support for Multiple Collections
  - Create New Collection : `Connection.createCollection()`
  - Get all Collections : `Connection.getCollections()`
  - Get a Collection : `Connection.getCollection()`
  - Update a Collection : `Connection.updateCollection()`

## [0.1.0]() (2024-03-21)

### Added

- Scene Search
  - Index Videos on Scene using `Video.indexScenes()`
  - Get Scenes Data using `Video.getScenes()`
  - Search in Video using `Video.search()` on basis of scenes (pass `searchType` = `"scene"`)
    > Note: Collection Scene Search is not available

### Changed

- Deprecate `TextStyle` with `TextStyleProps`
  - Instead of a accepting Instance of `TextStyle` class, `TextAsset` now accepts an object of type `Partial<TextStyleProps>`
- Deprecate `SubtitleStyle` with `SubtitleStyleProps`
  - Instead of a accepting Instance of `SubtitleStyle` class, `Video.addSubtitle` now accepts an object of type `Partial<SubtitleStyleProps>`
- Deprecate `indexType` param in `Video.indexSpokenWords()`

## [0.0.4]() (2024-03-07)

### Added

- `Image` class
  - Upload image using `Collection.upload()`
  - Get an image using `Collection.getImage()`
  - Get all images using `Colection.getImages()`
  - Delete image using `Collection.deleteImage()` or `Image.delete()`
- `ImageAsset` class
  - Create a `ImageAsset` using `ImageAsset()` class
  - Overlay `ImageAsset` in timeline using `Timeline.addOverlay()`
- `TextAsset` & `TextStyle` class
  - Create a `TextAsset` using `TextAsset()` class
  - Configure styling of `TextAsset` using `TextStyle()`
- `SubtitleStyle`
  - Configure subtitle styling by passing a `SubtitleStyle` in `Video.addSubtitle()`
- Keyword Search
  Search using Keyword in Video using `Video.search()` (pass searchType = "keyword")
  > Note: Collection Keyword Search is not available

### Changed

- `Video.index()` -> `Video.indexSpokenWords()`
- param `type` -> `searchType` in `Video.search()`
- param `type` -> `searchType` in `Collection.search()`

### Fixed

- Pass undefined params as `null` to VideoDB Server API

## [0.0.3]() (2024-02-13)

### Added

- Concept of Audio Files 🔈
- Concept of MediaAsset : VideoAsset, AudioAsset 💼
- Concept of Timeline for editing workflows ✂️
- Export `VideodbError`
- Minor updates in readme & package.json

### Changed

- Http client timeout 30s -> 60s

### Fixed

- Better Error handling
- Param validation in
  - `Coll.getVideo()`
  - `Coll.getAudio()`
  - `Coll.getVideo()`
  - `Coll.deleteAudio()`

## [0.0.2]() (2024-01-24)

### Added

- Upload through file and external links - supports YouTube for now.
- Semantic Index : Index & search spoken content.
- Editing: Add subtitle to videos with default style.
- Search across collections [supports a default collection for now]
- `Video` and `Collection` object access without saving.
- `playStream` function to get playable video links.
