const musicMetadata = require("music-metadata");

async function getMetadataFromUrl(url) {
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

    return metadata;
}

module.exports = { getMetadataFromUrl };
