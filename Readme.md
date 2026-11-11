<!-- PROJECT SHIELDS -->
<!--
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Npm Version][npm-shield]][npm-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Website][website-shield]][website-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://videodb.io/">
    <img src="https://codaio.imgix.net/docs/_s5lUnUCIU/blobs/bl-RgjcFrrJjj/d3cbc44f8584ecd42f2a97d981a144dce6a66d83ddd5864f723b7808c7d1dfbc25034f2f25e1b2188e78f78f37bcb79d3c34ca937cbb08ca8b3da1526c29da9a897ab38eb39d084fd715028b7cc60eb595c68ecfa6fa0bb125ec2b09da65664a4f172c2f" alt="Logo" width="300" height="">
  </a>

  <h3 align="center">VideoDB Node.js SDK</h3>

  <p align="center">
    Video Database for your AI Applications
    <br />
    <a href="https://docs.videodb.io"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/video-db/videodb-node/issues">Report Bug</a>
    ·
    <a href="https://github.com/video-db/videodb-node/issues">Request Feature</a>
  </p>
</p>


<!-- ABOUT THE PROJECT -->

# VideoDB Node.js SDK

The VideoDB Node.js SDK lets you upload, understand, search, and edit video from Node.js and TypeScript. Full guides live at [docs.videodb.io](https://docs.videodb.io).

# Table of Contents

- [Installation](#installation)
- [Connect](#connect)
- [Upload and stream a video](#upload-and-stream-a-video)
- [Understand, index, and search](#understand-index-and-search)
- [Ask questions](#ask-questions)
- [Legacy spoken-word search](#legacy-spoken-word-search)
- [Edit with a timeline](#edit-with-a-timeline)
- [Handle errors](#handle-errors)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install videodb
```

On macOS and Windows the install step also downloads the desktop Capture binary, which only the Capture SDK needs. Set `VIDEODB_SKIP_CAPTURE_INSTALL=1` to skip it, for example on servers and in CI. If the download fails, the install still succeeds, and capture fetches the binary on first use.

## Connect

Get an API key from the [VideoDB console](https://console.videodb.io).

```ts
import { connect } from 'videodb';

// Reads VIDEO_DB_API_KEY from the environment.
const conn = connect();
// Or pass the key explicitly: connect({ apiKey: 'sk-...' })

const coll = await conn.getCollection(); // the default collection
```

## Upload and stream a video

`uploadURL()` accepts YouTube links, public URLs, and S3 links. `uploadFile()` takes a local `filePath`. Both wait until the media is ready and return a `Video`, `Audio`, or `Image`.

```ts
import { Video } from 'videodb';

const video = await coll.uploadURL({
  url: 'https://www.youtube.com/watch?v=LPZh9BOjkQs',
});
if (!(video instanceof Video)) throw new Error('Expected a video');

console.log(video.id, video.name, video.length);
console.log(video.playerUrl); // open in a browser

// Stream only 0-10s and 120-140s
const clipUrl = await video.generateStream([
  [0, 10],
  [120, 140],
]);
```

## Understand, index, and search

Search runs over indexes you build. First run an understanding pass, then index its output.

```ts
const understanding = await video.understand([
  { type: 'spoken_words', name: 'transcript' },
]);
await understanding.waitUntilComplete();

const transcript = await understanding.getAnalyzer('transcript');
const index = await video.index(transcript, { name: 'transcript' });
await index.waitUntilComplete();

const results = await video.semanticSearch('what is attention?', {
  indexIds: [index.indexId],
  topK: 5,
});
for (const shot of results.getShots()) {
  console.log(`${shot.start}s-${shot.end}s: ${shot.text}`);
}

// One stream that plays every matching moment
console.log(await results.compile());
```

Add a `vlm` analyzer, such as `{ type: 'vlm', name: 'scene', config: { prompt: 'Describe the visual content.' } }`, to search what is on screen as well.

`video.search(query)` plans the search across all of the video's indexes. If the video has no index yet, the result is empty, and `results.warnings` (also printed once to the console) explains why.

## Ask questions

```ts
const answer = await video.ask('What does attention let a transformer do?');
console.log(answer.answer);
```

`coll.search()` and `coll.ask()` work the same way across every video in a collection.

## Legacy spoken-word search

Older projects index transcripts with `indexSpokenWords()` and search them with `legacySearch()`.

```ts
await video.indexSpokenWords();
const legacy = await video.legacySearch('attention');
console.log(legacy.getShots().length, await legacy.compile());
```

## Edit with a timeline

```ts
import { Clip, EditorTextAsset, EditorTimeline, EditorVideoAsset, Track } from 'videodb';

const timeline = new EditorTimeline(conn);

const main = new Track();
main.addClip(0, new Clip({ asset: new EditorVideoAsset({ id: video.id, start: 0 }), duration: 5 }));
timeline.addTrack(main);

const titles = new Track();
titles.addClip(0, new Clip({ asset: new EditorTextAsset({ text: 'Hello from VideoDB' }), duration: 3 }));
timeline.addTrack(titles);

console.log(await timeline.generateStream());

// Burn in subtitles generated from the transcript
console.log(await video.addSubtitle());
```

## Handle errors

Every error the SDK throws extends `VideodbError`. Errors from the API carry the server's message, the HTTP `status`, and a machine-readable `code` when the server sends one.

```ts
import { VideodbError } from 'videodb';

try {
  await coll.getVideo('m-does-not-exist');
} catch (err) {
  if (err instanceof VideodbError) {
    console.error(err.message); // "Error 400: Video not found"
    console.error(err.status, err.code);
  }
}
```

---

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<!-- LICENSE -->

## License

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[npm-shield]: https://img.shields.io/npm/v/videodb?style=for-the-badge
[npm-url]: https://www.npmjs.com/package/videodb
[stars-shield]: https://img.shields.io/github/stars/video-db/videodb-node.svg?style=for-the-badge
[stars-url]: https://github.com/video-db/videodb-node/stargazers
[issues-shield]: https://img.shields.io/github/issues/video-db/videodb-node.svg?style=for-the-badge
[issues-url]: https://github.com/video-db/videodb-node/issues
[website-shield]: https://img.shields.io/website?url=https%3A%2F%2Fvideodb.io%2F&style=for-the-badge&label=videodb.io
[website-url]: https://videodb.io/
