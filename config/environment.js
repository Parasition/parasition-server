require("dotenv").config();

const requiredEnvVars = [
    "NODE_ENV",
    "DB_URI",
    "DISCORD_BOT_TOKEN",
    "DISCORD_CHANNEL_ID",
    "TIKAPI_KEY",
    "AI_MESSAGE_URL",
    "AUTH_KEY",
];

const checkEnvVars = () => {
    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            throw new Error(`Environment variable "${envVar}" is missing`);
        }
    });
};

const keys = {
    DB_URI: process.env.DB_URI,
    SECRET: process.env.SECRET,
    TOKEN_EXPIRY: process.env.TOKEN_EXPIRY || "1d",
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
    MAX_RETRIES: process.env.MAX_RETRIES || 3,
    RETRY_DELAY: process.env.RETRY_DELAY || 1000,
    AI_MESSAGE_URL: process.env.AI_MESSAGE_URL,
    AUTH_KEY: process.env.AUTH_KEY,
};

module.exports = { checkEnvVars, keys };
