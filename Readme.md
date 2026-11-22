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

## Use VideoDB in your agent

VideoDB lets an AI agent watch, search and clip video.

- **Claude**: [Add VideoDB from the plugin directory](https://videodb.io/claude?utm_source=github.com/video-db/videodb-node&utm_medium=readme)
- **ChatGPT**: [Add VideoDB from the plugin directory](https://videodb.io/chatgpt?utm_source=github.com/video-db/videodb-node&utm_medium=readme)
- **Claude Code**: `claude mcp add --transport http videodb https://mcp.videodb.io/mcp`
- **Cursor or any MCP client**: Add the remote MCP server and log in once: `https://mcp.videodb.io/mcp`

Free to start: $20 of credits, no credit card. [Steps for every client](https://docs.videodb.io/pages/mcp/connect?utm_source=github.com/video-db/videodb-node&utm_medium=readme).

The Node.js SDK below is for writing code against VideoDB yourself.

# Table of Contents

- [Use VideoDB in your agent](#use-videodb-in-your-agent)
- [Installation](#installation)
- [Connect](#connect)
- [Upload and stream a video](#upload-and-stream-a-video)
- [Understand, index, and search](#understand-index-and-search)
- [Ask questions](#ask-questions)
- [Legacy spoken-word search](#legacy-spoken-word-search)
- [Edit with a timeline](#edit-with-a-timeline)
- [Generate a talking avatar](#generate-a-talking-avatar)
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

`video.search(query)` plans the search across all of the video's indexes. If the video has no index yet, the result is empty, and `results.warnings` explains why.

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

Clips also take a colour grade, motion, or a named effect:

```ts
import { Effect, Keyframe, KeyframeProperty, Lut, Motion, MotionPreset } from 'videodb';

const asset = new EditorVideoAsset({ id: video.id, start: 0 });

// Colour grade from a 3D .cube file (local path or URL); a local file uploads on generateStream().
// Set timeline.lut to grade the whole frame.
const lut = new Lut({ src: './teal-orange.cube', intensity: 0.8 });

// Entrance and exit presets, plus keyframes
const motion = new Motion({
  enter: new MotionPreset({ preset: 'slide_up', duration: 0.5 }),
  exit: new MotionPreset({ preset: 'fade' }),
  keyframes: {
    [KeyframeProperty.scale]: [
      new Keyframe({ time: 0, value: 0.8 }),
      new Keyframe({ time: 0.5, value: 1, easing: 'back_out' }),
    ],
  },
});
main.addClip(5, new Clip({ asset, duration: 5, lut, motion }));

// A named effect; it cannot be combined with motion
main.addClip(10, new Clip({ asset, duration: 5, effect: Effect.zoomIn }));
```

## Generate a talking avatar

`generateVideo()` takes a `model`. With `heygen`, a face photo speaks the prompt as a script. Options specific to one model go in `config`.

```ts
import { HeyGenConfig } from 'videodb';

const avatar = await coll.generateVideo('Welcome to VideoDB.', 5, undefined, {
  model: 'heygen',
  imageUrl: 'https://example.com/face.jpg',
  aspectRatio: '16:9',
  config: new HeyGenConfig({ voice: 'Warm Pro Narrator', talkingStyle: 'expressive' }),
});
console.log(avatar?.playerUrl);
```

Pass `imageId` instead of `imageUrl` to use an image already in VideoDB. Set `audioId` in the config to lip-sync your own audio instead of speaking the prompt. `conn.getGenerationModels()` lists the image and video models your account can use.

## Handle errors

Every error the SDK throws extends `VdbBaseError`. Errors from the API include the server's explanation in the message, and also carry the HTTP `status`, a machine-readable `code` when the server sends one, and the response body in `data`.

```ts
import { VdbBaseError } from 'videodb';

try {
  await coll.getVideo('m-does-not-exist');
} catch (err) {
  if (err instanceof VdbBaseError) {
    console.error(err.message); // "Error 400: Video not found"
    console.error(err.status, err.code); // 400 "400"
  }
}
```

A wait that outlives its deadline throws `JobTimeoutError`. The job keeps running on VideoDB, and the error carries `jobId` and `outputUrl` so you can pick it up later.

```ts
import { JobTimeoutError } from 'videodb';

try {
  await understanding.waitUntilComplete(60);
} catch (err) {
  if (err instanceof JobTimeoutError) {
    const resumed = await video.getUnderstanding(err.jobId!);
    await resumed.waitUntilComplete();
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
