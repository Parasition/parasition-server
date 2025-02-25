const musicMetadata = require("music-metadata");
const { getTikTokMusicData } = require("../../helpers/tikapi");

async function getMetadataFromUrl(url) {
    // check if it is tiktok url
    const pattern = /tiktok\.com\/music\/.+-(\d+)/;
    const match = url.match(pattern);

    if (match) {
        const data = await getTikTokMusicData(match[1]);
        return {
            authorName: data?.musicInfo?.music?.authorName || "Unknown",
            title: data?.musicInfo?.music?.title || "Unknown",
            thumbnail: data?.musicInfo?.music?.coverThumb || "",
            duration: data?.musicInfo?.music?.duration || 0,
            playUrl: data?.musicInfo?.music?.playUrl || url,
            videoCount: data?.musicInfo?.stats?.videoCount || 0,
        };
    }

    // Fetch the audio file from the URL using node-fetch
    const response = await fetch(url);

    // Check if the response is valid
    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Convert the response body into an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    const buff = Buffer.from(arrayBuffer);

    // Parse the metadata from the audio stream
    const metadata = await musicMetadata.parseBuffer(buff);

    return {
        authorName: metadata?.common?.artist || "Unknown",
        title: metadata?.common?.title || "Unknown",
        thumbnail: (metadata?.common?.picture.length > 0 ? metadata?.common?.picture[0] : "") || "",
        duration: metadata?.format?.duration || 0,
        playUrl: url,
        videoCount: 0,
    };
}

module.exports = { getMetadataFromUrl };
