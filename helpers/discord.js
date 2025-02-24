const { discordClient } = require("../config/clients");
const { keys } = require("../config/environment");
const logger = require("../utils/logger");
const Campaign = require("../src/campaign/campaign.model");
const CampaignVideo = require("../src/campaign/campaign-video.model");
const { getTikTokVideoData } = require("./tikapi");

function handleDiscordTriggerEvents() {
    discordClient.on("ready", () => {
        logger.info(`Logged in as ${discordClient.user.tag}`);
    });

    discordClient.on("messageCreate", async message => {
        // Check if message is from the specified channel
        const targetChannelId = keys.DISCORD_CHANNEL_ID;
        if (message.channelId !== targetChannelId) {
            return;
        }

        if (message.author.bot || message.author.username === "CorrectionBot") return;

        const messageData = {
            id: message.id,
            content: message.content.replace(/\n/g, " ").trim(),
            author: message.author.username,
            timestamp: new Date(message.createdTimestamp),
            channelId: message.channelId,
        };

        const success = await processMessage(messageData);
        if (!success) {
            logger.error(`Failed to process message ${messageData.id} after all retries`);
        }
    });
}

async function processMessage(messageData, retryCount = 0) {
    try {
        const data = await sendToAIMessage(messageData);

        if (!data.valid) {
            logger.info("Invalid Message, Please check again");
            await sendDiscordError(messageData.channelId, `@${messageData.author} ${data.reason}`);
            return false;
        }

        const currentDate = new Date();
        const campaign = await Campaign.findOne({
            campaign_code: data.campaign_code,
            start_date: { $lte: currentDate },
            end_date: { $gte: currentDate },
            deleted_at: null,
        });
        if (!campaign) {
            return false;
        }

        let tiktokData;
        try {
            tiktokData = await getTikTokVideoData(data.tiktok_url);
            logger.info("TikTok data retrieved successfully:", tiktokData.itemInfo.itemStruct.author);
        } catch (error) {
            logger.error(`TikTok data fetch failed: ${error.message}`);
            return false;
        }

        const newCampaignVideo = new CampaignVideo({
            campaign: campaign._id,
            url: data.tiktok_url,
            creator_id: tiktokData.itemInfo.itemStruct.author.uniqueId,
            creator_social_name: messageData.author,
            desc: tiktokData.itemInfo.itemStruct.desc || "",
            stats: {
                view_count: tiktokData.itemInfo.itemStruct.stats.playCount,
                like_count: tiktokData.itemInfo.itemStruct.stats.diggCount,
                share_count: tiktokData.itemInfo.itemStruct.stats.shareCount,
                bookmark_count: tiktokData.itemInfo.itemStruct.stats.collectCount,
                comment_count: tiktokData.itemInfo.itemStruct.stats.commentCount,
            },
        });
        const savedCampaignVideo = await newCampaignVideo.save();
        if (!savedCampaignVideo) {
            logger.error("Failed to save campaign video message");
            return false;
        }

        return true;
    } catch (error) {
        logger.error(`Message processing attempt ${retryCount + 1} failed:`, error);

        if (retryCount < keys.MAX_RETRIES) {
            logger.info(`Retrying in ${keys.RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, keys.RETRY_DELAY));
            return processMessage(messageData, retryCount + 1);
        } else {
            logger.error("Max retries reached. Giving up.");
            return false;
        }
    }
}

async function sendDiscordError(channelId, error) {
    try {
        if (!discordClient || !discordClient.channels) {
            logger.error("Discord client not properly initialized");
            return;
        }

        const channel = await discordClient.channels.fetch(channelId);
        if (channel) {
            await channel.send(`❌ Error: ${error}`);
        }
    } catch (err) {
        logger.error("Failed to send error message to Discord:", err);
    }
}

async function sendToAIMessage(messageData) {
    try {
        const response = await fetch(keys.AI_MESSAGE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: messageData.content,
                authKey: keys.AUTH_KEY,
            }),
        });

        if (!response.ok) {
            const error = `HTTP error! status: ${response.status}`;
            throw new Error(error);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

module.exports = { handleDiscordTriggerEvents, sendDiscordError };
