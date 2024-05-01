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

VideoDB Node.js SDK allows you to interact with the VideoDB serverless database. Manage videos as intelligent data, not files. It's scalable, cost efficient & optimized for AI applications and LLM integration.


<!-- TABLE OF CONTENTS -->
# Table of Contents

- [About The Project](#videoDB-nodejs-sdk)
- [Installation](#installation)
- [Quick Start](#quick-start)
  * [Creating a Connection](#creating-a-connection)
  * [Getting a Connection](#getting-a-collection)
- [Working with a single video](#working-with-a-single-video)
  * [⬆️ Upload Video](#⬆️-upload-video)
  * [📺 View your Video](#📺-view-your-video)
  * [⛓️ Stream Sections of videos](#⛓️-stream-sections-of-videos)
  * [🗂️ Indexing a Video](#🗂️-indexing-a-video)
  * [🔍 Searching inside a video](#🔍-searching-inside-a-video)
  * [Viewing Search Results](#viewing-search-results)
- [RAG: Search inside Multiple Videos](#rag-search-inside-multiple-videos)
  * [🔄 Using Collection to Upload Multiple Videos](#🔄-using-collection-to-upload-multiple-videos)
  * [📂 Search inside multiple videos in a collection](#📂-search-inside-multiple-videos-in-a-collection)
- [Timeline And Assets](#timeline-and-assets)
  * [Understanding Assets](#understanding-assets)
  * [Creating Assets](#creating-assets)
    * [VideoAsset](#videoasset)
    * [AudioAsset](#audioasset)
    * [ImageAsset](#imageasset)
    * [TextAsset](#textasset)
  * [Understanding Timeline](#understanding-timeline)
  * [Creating Timeline](#creating-timeline)
- [More on `Video` object](#more-on-video-object)
  * [Get the video's transcript](#get-the-videos-transcript)
  * [Get the video's thumbnail](#get-the-videos-thumbnail)
  * [Overlay Subtitle on video](#overlay-subtitle-on-video)
  * [Delete the video](#delete-the-video)
- [More on `Collection` object](#more-on-collection-object)
  * [Get all videos](#get-all-videos)
  * [Get a video given videoId](#get-a-video-given-videoid)
  * [Delete a video](#delete-a-video)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

<!-- Installation -->

## Installation

To install the package, run the following command in your terminal:

```
npm install videodb
```

<!-- USAGE EXAMPLES -->

## Quick Start

#### Creating a Connection

Get an API key from the [VideoDB console](https://console.videodb.io). Free for first 50 uploads (No credit card required).

```ts
import { connect } from 'videodb';

// create a connection to the VideoDB API
const conn = connect('YOUR_API_KEY');
```

#### Getting a Collection

A default collection is created when you create your first connection. Use the `getCollection` method on the established database connection to get the `Collection` object.

```ts
// Get Default collection
conn
  .getCollection()
  .then(coll => console.log('Collection Id : ', coll.meta.id));
```

Or using `async`/`await`

```ts
// Get Default Collection
(async () => {
  const coll = await conn.getCollection();
  console.log('Collection Id : ', coll.meta.id);
})();
```

## Working with a single video

#### ⬆️ Upload Video

Now that you have established a connection to VideoDB, you can upload your videos using `coll.uploadURL()` or `coll.uploadFile()`.  
You can directly upload files from `youtube`, `any public url`, `S3 bucket` or a `local file path`. A default collection is created when you create your first connection.

```ts
// upload to the default collection using url which returns an upload job
const uploadJob = await coll.uploadURL({
  url: 'https://www.youtube.com/watch?v=WDv4AWk0J3U',
});

// Attach optional event listeners
uploadJob.on('success', uploadedVideo =>
  console.log('Video Uploaded. VideoID : ', uploadedVideo.meta.id)
);
uploadJob.on('error', err => {
  console.error(err);
});

// Call the start function to commence the upload
uploadJob.start();
```

#### 📺 View your Video

Once uploaded, your video is immediately available for viewing in 720p resolution. ⚡️

Generate a streamable url for the video using `video.generateStream()`  
Get a browser playable link using `video.play()`

```ts
// Replace {VIDEO_ID} with your video id
const video = await coll.getVideo('VIDEO_ID');

// Generate a preview stream for video
const playerUrl = await video.play();
console.log('Video Preview : ', playerUrl);
```

#### ⛓️ Stream Sections of videos

You can easily clip specific sections of a video by passing a timeline of the start and end timestamps (in seconds) as a parameter.
For example, this will generate a streaming URL for a compilation of the fist `10 seconds`, and the part between the `120th` and the `140th` second.

```ts
import { playStream } from 'videodb';

const streamLink = await video.generateStream([
  [0, 10],
  [120, 140],
]);

const streamPreview = playStream(streamLink);
console.log('Clipped Video Preview : ', streamPreview);
```

#### 🗂️ Indexing a Video

To search bits inside a video, you have to first index the video. This can be done by a invoking the index function on the `Video`. VideoDB offers two type of indexes currently.

1. `indexSpokenWords`: Indexes spoken words in the video. It automatically generate the transcript and makes it ready for search.
2. `indexScenes`: Indexes visual concepts and events of the video.

> (Note: This feature is currently available only for beta users, join our [discord](https://discord.com/invite/py9P639jGz) for early access)

```ts
// best for podcasts, elearning, news, etc.
const job1 = video.indexSpokenWords();
job1.start();

// best for camera feeds, moderation usecases etc.
const job2 = video.indexScenes();
job2.start();
```

> In future you can also index videos using:
>
> 1.  Faces : Upload image of the person and find them in a video.
> 2.  Specific domain Index like Football, Baseball, Drone footage, Cricket etc.
>
> ⏱️ Indexing may take some time for longer videos, structure it as a batch job in your application.

#### 🔍 Searching inside a video

Search the segments inside a video. While searching you have options to choose the type of search. VideoDB offers following type of search :

- `semantic`: Perfect for question answer kind of queries. This is also the default type of search.

- `keyword`: It matches the exact occurance of word or sentence you pass in the query parameter of the search function. keyword search is only available to use with single videos.

- `scene` : It search the visual information of the video, Always Index the videousing index_scenes function before using this search.

```ts
const indexJob = video.indexSpokenWords();

indexJob.on('success', async () => {
  const results = await video.search('Morning Sunlight', 'semantic');
  const resultsUrl = await results.play();
  console.log('Search results preview : ', resultsUrl);
});

indexJob.start();
```

Similarly, you can index and search from scenes using `Video.indexScenes()`

#### Viewing Search Results :

`video.search()` will return a `SearchResult` object, which contains the sections or as we call them, `shots` of videos which semantically match your search query.

- `result.shots` Returns a list of `Shot`(s) that matched the search query. You can call `generateStream()` on each shot to get the corresponding streaming URL.
- `result.play()` Compiles and returns a playable url for the compiled shots (similar to `video.play()`). You can open this link in the browser, or embed it into your website using an iframe.

## RAG: Search inside Multiple Videos

`VideoDB` can store and search inside multiple videos with ease. By default, videos are uploaded to your default collection.

#### 🔄 Using Collection to Upload Multiple Videos

```ts
const uploadJobHandler = video => {
  console.log(`Video uploaded :${video.meta.name}`);
};

// Upload Video1 to VideoDB
const job1 = await coll.uploadURL({
  url: 'https://www.youtube.com/watch?v=lsODSDmY4CY',
});
job1.on('success', uploadJobHandler);
job1.start();

// Upload Video2 to VideoDB
const job2 = await coll.uploadURL({
  url: 'https://www.youtube.com/watch?v=vZ4kOr38JhY',
});
job2.on('success', uploadJobHandler);
job2.start();

// Upload Video3 to VideoDB
const job3 = await coll.uploadURL({
  url: 'https://www.youtube.com/watch?v=uak_dXHh6s4',
});
job3.on('success', uploadJobHandler);
job3.start();
```

- `Connection.getCollection()` : Returns Collection object, the default collection
- `Collection.getVideo()` : Returns list of Video, all videos in collections
- `Collection.getVideo(videoId)`: Returns Video, respective video object from given `videoId`
- `Collection.deleteVideo(videoId)`: Deletes the video from Collection

#### 📂 Search inside multiple videos in a collection

You can simply Index all the videos in a collection and use the search method to find relevant results. Here we are indexing the spoken content of a collection and performing semantic search.

```ts
const indexJobHandler = res => {
  console.log(`Video Indexed : `, res);
};

const videos = await coll.getVideos();
console.log('Total videos', videos.length);

for (let video of videos) {
  const indexJob = await video.indexSpokenWords();
  indexJob.on('success', indexJobHandler);
  indexJob.start();
}
```

**Semantic Search in the collection**

```ts
const searchRes = await coll.search('What is dopamine');
const resultsUrl = await searchRes.play();

console.log('Search Result Preview : ', resultsUrl);
```

The result here has all the matching bits in a single stream from your collection. You can use these results in your application right away.

> As you can see VideoDB fundamentally removes the limitation of files and gives you power to access and stream videos in a very seamless way. Stay tuned for exciting features in our upcoming version and keep building awesome stuff with VideoDB 🤘

## 🎞 Timeline And Assets

**Timeline and Assets** lets you create programmatic compilation streams with audio, image and text overlays using your video data in VideoDB.

### Understanding Assets

Assets are objects that you can use in your video timeline. These Assets have lots of configurable setting available.

### Creating Assets

To define any asset, you must provide the identifier of the media and specify the segment of the media with start and end parameters, some assets have lots of other configurable settings available.

#### VideoAsset

A Video Asset can be created by calling [`VideoAsset()`](https://github.com/video-db/videodb-node/blob/main/docs/classes/core_asset.VideoAsset.md#constructor)

```ts
import { VideoAsset } from 'videodb';

const videoAsset = new VideoAsset('MEDIA_ID', { start: 0, end: 20 });
```

#### AudioAsset

An Audio Asset can be created by calling [`AudioAsset()`](https://github.com/video-db/videodb-node/blob/main/docs/classes/core_asset.AudioAsset.md#constructor)

```ts
import { AudioAsset } from 'videodb';

const audioAsset = new AudioAsset('MEDIA_ID', { start: 0, end: 10 });
```

#### ImageAsset

An Image Asset can be created by calling [`ImageAsset()`](https://github.com/video-db/videodb-node/blob/main/docs/classes/core_asset.ImageAsset.md#constructor)

```ts
import { ImageAsset } from 'videodb';

const imageAsset = new ImageAsset('MEDIA_ID', { x: 10, y: 10, duration: 5 });
```

#### TextAsset

A Text Asset can be created by calling [`TextAsset()`](https://github.com/video-db/videodb-node/blob/main/docs/classes/core_asset.TextAsset.md#constructor)

```ts
import { TextAsset } from 'videodb';

// Defult Style
const textAsset1 = new TextAsset({ text: 'Hello World!' });

// Configured Style
const textAsset2 = new TextAsset({
  text: 'Hello World!',
  style: { fontsize: 16, alpha: 0.8 },
});
```

### Understanding Timeline

`Timeline` let's you add your organise your asset in a Video Timeline and generate stream for your timeline.

### Creating Timeline

Timeline can be created by calling [`Timeline()`](https://github.com/video-db/videodb-node/blob/main/docs/classes/core_timeline.Timeline.md) constructor

The `Timeline` object provides you with following methods:

- [`addInline()`](https://github.com/video-db/videodb-node/blob/main/docs/classes/core_timeline.Timeline.md#addinline) : adds `VideoAsset` inline
- [`addOverlay()`](https://github.com/video-db/videodb-node/blob/main/docs/classes/core_timeline.Timeline.md#addOverlay): adds `AudioAsset`, `ImageAsset` and `TextAsset` as overlay
- [`generateStream()`](https://github.com/video-db/videodb-node/blob/main/docs/classes/core_timeline.Timeline.md#generateStream): generates stream for your timeline

```ts
import { Timeline, playStream } from 'videodb';

// Create a Timeline 
const timeline = Timeline(conn);

// Add VideoAsset inline
timeline.addInline(videoAsset);

// Add AudioAsset overlay
timeline.addOverlay(0, audioAsset);

// Generate and play stream
const streamUrl = timeline.generateStream();
console.log(playStream(streamUrl));
```

## 🌟 More on `Video` object

There are multiple useful functions available on a `Video` Object:

#### Get the video's transcript

```ts
const transcriptJob = video.getTranscript();
transcriptJob.on('success', transcript => {
  console.log(transcript);
});
transcriptJob.start();
```

#### Get the video's thumbnail

```ts
// Get thumbnail of the video
const thumbnail = await video.generateThumbnail();
console.log(thumbnail);
```

#### Overlay Subtitle on video

```ts
let subtitleStream = await video.addSubtitle();
let playerUrl = playStream(subtitleStream);
console.log(playerUrl);
```
Subtitles Can be styled by passing a Object of Type [`Partial<SubtitleStyleProps>`](https://github.com/video-db/videodb-node/blob/main/docs/modules/types_config.md#subtitlestyleprops) in `Video.addSubtitle()`

```ts
subtitleStream = await video.addSubtitle({fontSize: 12});
playerUrl = await playStream(subtitleStream);
console.log(playerUrl);
```

#### Delete the video

```ts
// Delete the video from the collection
await video.delete();
```

### 🌟 More on `Collection` object

#### Get all videos

```ts
const allVideos = coll.getVideo();
```

#### Get a video given videoId

```ts
const myVideo = coll.getVideo(id);
```

#### Delete a video

```ts
await coll.deleteVideo();
```

---

<!-- ROADMAP -->

## Roadmap

- Adding More Indexes : `Face`, `Scene`, `Security`, `Events`, and `Sports`
- Give prompt support to generate thumbnails using GenAI.
- Give prompt support to access content.
- Give prompt support to edit videos.
- See the [open issues](https://github.com/video-db/videodb-node/issues) for a list of proposed features (and known issues).

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
