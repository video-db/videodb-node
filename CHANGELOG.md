# Changelog

## [Unreleased]

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
