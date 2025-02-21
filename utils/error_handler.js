const { discordClient } = require("../config/clients");
const logger = require("./logger");

/**
 *
 * @param {string} message
 * @param {number} statusCode
 * @param {Error}
 */
const customError = (message, statusCode) => {
    const error = new Error();
    error.message = message || "Some thing went wrong";
    error.statusCode = statusCode || 400;
    return error;
};

const globalErrorHandler = (err, req, res, next) => {
    res.status(err.statusCode || 500).json({ message: err.message });
};

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

module.exports = { customError, globalErrorHandler, sendDiscordError };
