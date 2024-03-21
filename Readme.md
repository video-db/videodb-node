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

### ⬆️ Upload Video

Now that you have established a connection to VideoDB, you can upload your videos using `coll.uploadURL()` or `coll.uploadFile()`.  
You can directly upload from `youtube`, `any public url`, `S3 bucket` or a `local file path`. A default collection is created when you create your first connection.

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

### 📺 View your Video

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

### ⛓️ Stream Sections of videos

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

### 🔍 Searching inside a video

To search bits inside a video, you have to `index` the video first. This can be done by a simple command.  
_P.S. Indexing may take some time for longer videos._

```ts
const indexJob = video.index();

indexJob.on('success', async () => {
  const results = await video.search('Morning Sunlight');
  const resultsUrl = await results.play();
  console.log('Search results preview : ', resultsUrl);
});

indexJob.start();
```

`Videodb` is launching more indexing options in upcoming versions. As of now you can try the `semantic` index - Index by spoken words.

In the future you'll be able to index videos using:

1. **Scene** - Visual concepts and events.
2. **Faces**.
3. **Specific domain Index** like Football, Baseball, Drone footage, Cricket etc.

### Viewing Search Results :

`video.search()` will return a `SearchResult` object, which contains the sections or as we call them, `shots` of videos which semantically match your search query.

- `result.shots` Returns a list of `Shot`(s) that matched the search query. You can call `generateStream()` on each shot to get the corresponding streaming URL.
- `result.play()` Compiles and returns a playable url for the compiled shots (similar to `video.play()`). You can open this link in the browser, or embed it into your website using an iframe.

---

## RAG: Search inside Multiple Videos

`VideoDB` can store and search inside multiple videos with ease. By default, videos are uploaded to your default collection.

### 🔄 Using Collection to Upload Multiple Videos

```ts
const uploadJobHandler = (video) => {
  console.log(`Video uploaded :${video.meta.name}`);
};

// Upload Video1 to VideoDB
const job1 = await coll.uploadURL({
  url: "https://www.youtube.com/watch?v=lsODSDmY4CY",
});
job1.on("success", uploadJobHandler);
job1.start();

// Upload Video2 to VideoDB
const job2 = await coll.uploadURL({
  url: "https://www.youtube.com/watch?v=vZ4kOr38JhY",
});
job2.on("success", uploadJobHandler);
job2.start();

// Upload Video3 to VideoDB
const job3 = await coll.uploadURL({
  url: "https://www.youtube.com/watch?v=uak_dXHh6s4",
});
job3.on("success", uploadJobHandler);
job3.start();
```

### 📂 Search Inside Collection

**Index All Videos**

You can simply Index all the videos in a collection and use the search method to find relevant results. Here we are indexing the spoken content of a collection and performing semantic search.

```ts
const indexJobHandler = res => {
  console.log(`Video Indexed : `, res);
};

const videos = await coll.getVideos();
console.log('Total videos', videos.length);

for (let video of videos) {
  const indexJob = await video.index();
  indexJob.on('success', indexJobHandler);
  indexJob.start();
}
```

**Search Inside Collection**

```ts
const searchRes = await coll.search('What is dopamine');
const resultsUrl = await searchRes.play();

console.log('Search Result Preview : ', resultsUrl);
```

The result here has all the matching bits in a single stream from your collection. You can use these results in your application right away.

### 🌟 More on `Video` object

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
const subtitle = await video.addSubtitle();
const playerUrl = await playStream(subtitle);
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
