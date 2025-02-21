const { Client, GatewayIntentBits } = require("discord.js");

const discordClient = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

module.exports = { discordClient };
