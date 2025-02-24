const logger = require("../utils/logger");

const cache = new Map();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

async function getTikTokVideoData(videoUrl) {
    logger.info("Processing TikTok URL:", videoUrl);

    // Check cache first
    const cachedData = cache.get(videoUrl);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        logger.info("Returning cached TikTok data");
        return cachedData.data;
    }

    try {
        const response = await fetch(`https://api.tikapi.io/public/video?id=${videoUrl}`, {
            method: "GET",
            headers: {
                "X-API-KEY": process.env.TIKAPI_KEY,
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            logger.error(`TikTok API Error Response:${errorData}`);

            if (response.status === 403 || errorData.includes("Video not found")) {
                throw new Error("Video is deleted");
            }

            throw new Error(`TikTok API error: ${response.status}`);
        }

        const data = await response.json();
        // Cache the successful response
        cache.set(videoUrl, {
            data,
            timestamp: Date.now(),
        });

        return data;
    } catch (error) {
        logger.error("Error fetching TikTok data:", error);
        if (error.message === "Video is deleted") {
            throw error;
        }
        throw error;
    }
}

module.exports = { getTikTokVideoData };
