const { getTikTokVideoData } = require("./tikapi.js");
const cron = require("nod-cron");
const logger = require("../utils/logger.js");
const moment = require("moment");
const Campaign = require("../src/campaign/campaign.model.js");
const CampaignVideo = require("../src/campaign/campaign-video.model.js");
const CampaignVideoStats = require("../src/campaign/campaign-video-stats.model.js");

async function processVideo(record, index, totalRecords) {
    const videoUrl = record.url;
    const creatorSocialName = record.creator_social_name || "Unknown Creator";

    logger.info(`\n=== Processing video ${index + 1}/${totalRecords} ===`);
    logger.info(`Creator: ${creatorSocialName}`);
    logger.info(`Video URL: ${videoUrl}`);

    if (!videoUrl) {
        logger.info(`❌ No video URL found for record ${record._id}, skipping`);
        return { success: false, error: "Missing video URL" };
    }

    try {
        // Log current stats before update
        const currentStats = {
            view_count: record.stats.view_count || 0,
            like_count: record.stats.like_count || 0,
            comment_count: record.stats.comment_count || 0,
            bookmark_count: record.stats.bookmark_count || 0,
            share_count: record.stats.share_count || 0,
        };
        logger.info("Current stats:", currentStats);

        // Fetch new data with multiple retries
        logger.info("Fetching TikTok data...");
        const tiktokData = await getTikTokVideoData(videoUrl);
        logger.info("Successfully fetched TikTok data");

        // Prepare new stats
        const newStats = {
            view_count: tiktokData.itemInfo.itemStruct.stats.playCount || 0,
            like_count: tiktokData.itemInfo.itemStruct.stats.diggCount || 0,
            comment_count: tiktokData.itemInfo.itemStruct.stats.commentCount || 0,
            bookmark_count: tiktokData.itemInfo.itemStruct.stats.collectCount || 0,
            share_count: tiktokData.itemInfo.itemStruct.stats.shareCount || 0,
        };

        // Verify that we have valid numbers
        const hasValidStats = Object.values(newStats).every(value => typeof value === "number" && value >= 0);

        if (!hasValidStats) {
            throw new Error("Invalid stats received from TikTok API");
        }

        // Update record
        record.stats = newStats;
        await record.save();

        // Updating day by day stats
        const previousDate = new Date(moment().subtract(1, "day").startOf("day"));
        const videoDayStats = await CampaignVideoStats.findOne({ campaign: record._id, stats_date: previousDate });
        if (!videoDayStats) {
            const newVideoStats = new CampaignVideoStats({
                campaign: record._id,
                url: videoUrl,
                creator_id: record.creator_id,
                stats: newStats,
                stats_date: previousDate,
            });
            await newVideoStats.save();
        } else {
            videoDayStats.stats = newStats;
            await videoDayStats.save();
        }

        logger.info("✅ Successfully updated stats:", newStats);
        logger.info(`=== Completed video ${index + 1}/${totalRecords} ===\n`);

        return { success: true, stats: newStats };
    } catch (error) {
        logger.error(`❌ Error processing video ${index + 1}/${totalRecords}:`, error);
        return { success: false, error: error.message };
    }
}

async function updateVideoViews() {
    try {
        logger.info("\n🚀 Starting video views update...");

        const startOfDay = new Date(moment().startOf("day"));
        const endOfDay = new Date(moment().endOf("day"));
        const campaigns = await Campaign.find({
            start_date: { $lte: startOfDay },
            end_date: { $gte: endOfDay },
            deleted_at: null,
        });

        const campaignVideos = await CampaignVideo.find({ _id: { $in: campaigns.map(item => item._id) } });
        logger.info(`📊 Found ${totalRecords} total records to process`);
        if (!campaignVideos.length) {
            return;
        }

        const totalRecords = campaignVideos.length;

        let successCount = 0;
        let errorCount = 0;

        // Process videos one at a time with delay between each
        for (let i = 0; i < campaignVideos.length; i++) {
            // Process single video
            const result = await processVideo(campaignVideos[i], i, totalRecords);

            // Update counters
            if (result.success) {
                successCount++;
            } else {
                errorCount++;
            }

            // Add delay between videos (skip delay after last video)
            if (i < campaignVideos.length - 1) {
                logger.info("⏳ Waiting 2 seconds before processing next video...");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Final report
        logger.info("\n=== 📋 Video Views Update Summary ===");
        logger.info(`✅ Successful updates: ${successCount}`);
        logger.info(`❌ Failed updates: ${errorCount}`);
        logger.info(`📊 Total records processed: ${totalRecords}`);
    } catch (error) {
        logger.error("❌ Fatal error in updateVideoViews:", error);
        throw error; // Re-throw to ensure the error is properly handled by the scheduler
    }
}

// Schedule the task to run every day at midnight and execute immediately
const scheduleVideoUpdates = () => {
    // Execute immediately when script starts
    updateVideoViews().catch(error => {
        logger.error("Failed to execute initial video update:", error);
    });

    // Schedule to run at midnight (00:00) every day
    cron.schedule(
        "0 0 * * *",
        async () => {
            logger.info("Running scheduled video views update");
            try {
                await updateVideoViews();
            } catch (error) {
                logger.error("Failed to execute scheduled video update:", error);
            }
        },
        {
            timezone: "UTC",
        }
    );
};

module.exports = { scheduleVideoUpdates, updateVideoViews };
