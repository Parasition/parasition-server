const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");

const { checkEnvVars, keys } = require("./config/environment");
const connectDB = require("./config/database");
const { globalErrorHandler } = require("./utils/error_handler");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Check environment variables
checkEnvVars();

// Database connection
connectDB();

const server = require("http").createServer(app);
app.use(express.json({ limit: "200mb" }));
app.use(
    express.urlencoded({
        limit: "200mb",
        extended: true,
        parameterLimit: 1000000,
    })
);
app.use(cors({ origin: "*" }));
app.use(helmet());

const routes = require("./routes");
const { discordClient } = require("./config/clients");
const { handleDiscordTriggerEvents } = require("./helpers/discord");
app.use(routes);

app.use(globalErrorHandler);

handleDiscordTriggerEvents();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});

discordClient.login(keys.DISCORD_BOT_TOKEN);
