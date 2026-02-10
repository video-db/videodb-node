# Changelog

## [0.3.0] (2026-02-02)

### ⚠️ Breaking Changes

- **Removed meta wrapper from all classes** - Access properties directly instead of through `.meta`
- **Removed Job-based pattern** - All async operations now use async/await directly
- **Upload methods now return media objects directly** - No longer returns Job instances
- **Removed exports:** `Job`, `TranscriptJob`, `UploadJob`, `IndexJob`, `SceneIndexJob`, `ExtractScenesJob`

### New Modules

#### Capture Sessions (Desktop Recording)

Backend orchestration for desktop capture sessions with native binary support:

- **CaptureSession** (`cap-xxx`) - Server-side lifecycle object for capture runs
- **CaptureClient** - Desktop client for recording mic, system audio, and display
- **Session Token Authentication** - Secure client auth without exposing API keys
- **WebSocket Integration** - Real-time transcript and indexing event delivery

```typescript
// Backend: Create session and generate token
const cap = await coll.createCaptureSession({
  endUserId: 'user_abc',
  callbackUrl: 'https://example.com/webhook',
});
const token = await conn.generateClientToken(86400);

// Desktop client: Start capture
import { CaptureClient } from 'videodb/capture';
const client = new CaptureClient({ sessionToken: token });
await client.requestPermission('microphone');
await client.startCaptureSession({ sessionId: cap.id, channels: [...] });
```

**Supported channels:**
- `mic:default` (audio)
- `system_audio:default` (audio)
- `display:1`, `display:2`, ... (video)

#### Meeting Module

Record and manage meetings with bot integration:

```typescript
const meeting = await coll.recordMeeting({
  meetingUrl: 'https://meet.google.com/xxx',
  botName: 'RecorderBot',
  callbackUrl: 'https://example.com/webhook',
});
```

#### RTStream Module

Real-time media streams for live capture and indexing:

- **RTStream** (`rts-xxx`) - Real-time media stream per channel
- **RTStreamSceneIndex** - Visual scene indexing on live streams
- **RTStreamSearchResult** / **RTStreamShot** - Search results from RTStreams

```typescript
const mic = cap.getRtstream('mic:default');
await mic.startTranscript({ socketId: ws.connectionId });

const scenes = await display.indexVisuals({
  batchConfig: { type: 'time', value: 2, frameCount: 2 },
  prompt: 'Describe the scene',
  socketId: ws.connectionId,
});
await scenes.start();
```

#### Editor Module

Comprehensive video editing with Timeline, Track, and asset classes:

```typescript
import {
  EditorTimeline,
  Track,
  Clip,
  EditorVideoAsset,
  CaptionAsset,
} from 'videodb';

const timeline = new EditorTimeline(conn);
const track = new Track();
track.addItem(new Clip({ asset: new EditorVideoAsset({ assetId: video.id }) }));
timeline.addTrack(track);
```

**New asset classes:**
- `EditorVideoAsset`, `EditorImageAsset`, `EditorAudioAsset`, `EditorTextAsset`, `CaptionAsset`

**Helper classes:**
- `Offset`, `Crop`, `Transition`, `Font`, `Border`, `Shadow`, `Background`, `Alignment`, `FontStyling`, `BorderAndShadow`, `Positioning`

**Enums:**
- `AssetType`, `Fit`, `Position`, `Filter`, `TextAlignment`, `HorizontalAlignment`, `VerticalAlignment`, `CaptionBorderStyle`, `CaptionAlignment`, `CaptionAnimation`

#### WebSocket Module

Real-time event streaming for transcript and indexing:

```typescript
const ws = await conn.connectWebsocket();
await ws.connect();

for await (const ev of ws.stream()) {
  if (ev.channel === 'transcript') console.log(ev.data?.text);
  if (ev.channel === 'scene_index') console.log(ev.data);
}
```

### New Methods

#### Video

- `getTranscriptText(start?, end?)` - Get plain text transcript
- `generateTranscript(force?)` - Generate transcript via POST
- `translateTranscript(language, additionalNotes?, callbackUrl?)` - Translate transcript
- `removeStorage()` - Remove video storage
- `getThumbnails()` - Get all thumbnails as Image objects
- `insertVideo(video, timestamp)` - Insert another video at timestamp
- `reframe(options?)` - Reframe video to new aspect ratio
- `smartVerticalReframe(options?)` - Object-aware vertical reframing
- `download(name?)` - Download video from stream URL
- `getMeeting()` - Get associated meeting info
- `clip(prompt, contentType, modelName)` - Generate clip from prompt

#### Audio

- `getTranscript(start?, end?, segmenter?, length?, force?)` - Get timestamped transcript
- `getTranscriptText(start?, end?)` - Get plain text transcript
- `generateTranscript(force?, languageCode?)` - Generate transcript
- `generateUrl()` - Generate signed URL

#### Image

- `generateUrl()` - Generate signed URL

#### Collection

- `delete()` - Delete the collection
- `makePublic()` / `makePrivate()` - Toggle collection visibility
- `generateVideo(prompt, duration?, callbackUrl?)` - Generate video from prompt
- `generateImage(prompt, aspectRatio?, callbackUrl?)` - Generate image from prompt
- `generateMusic(prompt, duration?, callbackUrl?)` - Generate music from prompt
- `generateSoundEffect(prompt, duration?, config?, callbackUrl?)` - Generate sound effect
- `generateVoice(text, voiceName?, config?, callbackUrl?)` - Generate voice from text
- `generateText(prompt, modelName?, responseType?)` - Generate text with GenAI
- `dubVideo(videoId, languageCode, callbackUrl?)` - Dub video to another language
- `searchTitle(query)` - Search by video title
- `connectRTStream(url, name, ...)` - Connect to real-time stream
- `getRTStream(id)` - Get RTStream by ID
- `listRTStreams(options?)` - List all RTStreams
- `recordMeeting(config)` - Record a meeting
- `getMeeting(meetingId)` - Get meeting by ID
- `createCaptureSession(config)` - Create capture session

#### Connection

- `recordMeeting(config)` - Record meeting to default collection
- `getMeeting(meetingId)` - Get meeting by ID
- `youtubeSearch(query, resultThreshold?, duration?)` - Search YouTube
- `download(streamLink, name)` - Download from stream link
- `transcode(source, callbackUrl, mode?, videoConfig?, audioConfig?)` - Transcode video
- `getTranscodeDetails(jobId)` - Get transcode job details
- `createEvent(eventPrompt, label)` - Create RTStream event
- `listEvents()` - List all RTStream events
- `checkUsage()` - Check account usage
- `getInvoices()` - Get list of invoices
- `connectWebsocket(collectionId?)` - Connect to WebSocket service
- `getCaptureSession(sessionId, collectionId?)` - Get capture session
- `listCaptureSessions(collectionId?, config?)` - List capture sessions
- `createCaptureSession(config)` - Create capture session (convenience)
- `generateClientToken(expiresIn?)` - Generate client token for capture

#### Scene

- Added `metadata` property for scene metadata

### New Types & Exports

#### Capture Session Types

```typescript
export {
  ConnectionConfig,
  CaptureSessionStatus,
  ChannelType,
  PermissionKind,
  TranscriptStatusValues,
  WebSocketChannel,
  BatchConfig,
  IndexVisualsConfig,
  IndexSpokenWordsConfig,
  AlertConfig,
  // ... and more
} from 'videodb';
```

#### Editor Types

```typescript
export {
  OffsetConfig,
  CropConfig,
  TransitionConfig,
  FontConfig,
  EditorVideoAssetConfig,
  ClipConfig,
  // ... and more
} from 'videodb';
```

#### Additional Exports

- `MeetingStatus`, `Segmenter`, `SegmentationType`
- `ReframeMode`, `ReframePreset`
- `TranscodeMode`, `ResizeMode`, `MediaType`
- `TextStyle`, `TextStyleConfig`
- `SpokenIndex`, `SceneIndex`, `SceneData`, `AlertData`

### Internal Improvements

- **Centralized snake_case/camelCase conversion** - Handled in HttpClient for consistent API communication
- **Simplified error handling** - Proper exception propagation with typed errors
- **Reduced bundle size** - Removed Job infrastructure (~400 lines)
- **Dual authentication support** - API key (backend) and session token (client) modes

### New Error Types

- `CaptureError` - Capture session related errors
- `BinaryError` - Native binary communication errors
- `PermissionError` - System permission errors

---

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
