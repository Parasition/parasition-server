const musicMetadata = require("music-metadata");
const { getTikTokMusicData } = require("../../helpers/tikapi");

async function getMetadataFromUrl(url) {
    // check if it is tiktok url
    const pattern = /tiktok\.com\/music\/.+-(\d+)/;
    const match = url.match(pattern);

    if (match) {
        console.log(match)
        const data = await getTikTokMusicData(match[1]);
        return {
            authorName: data?.musicInfo?.music?.authorName || "Unknown",
            title: data?.musicInfo?.music?.title || "Unknown",
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
    };
}

module.exports = { getMetadataFromUrl };
