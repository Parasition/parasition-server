const winston = require("winston");
const { format, createLogger, transports } = winston;
const { timestamp, combine, printf, errors, colorize, json } = format;
const DailyRotateFile = require("winston-daily-rotate-file");

function devLogger() {
    const logFormat = printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
    });

    return createLogger({
        format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss A" }), errors({ stack: true }), logFormat),
        transports: [new transports.Console()],
    });
}

function prodLogger() {
    const transport = new DailyRotateFile({
        filename: "log.%DATE%",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        dirname: "logs",
    });
    return createLogger({
        format: combine(timestamp(), errors({ stack: true }), json()),
        defaultMeta: {},
        transports: [transport],
    });
}

if (!("NODE_ENV" in process.env)) {
    throw new Error("Please set NODE_ENV variable");
}
const logger = process.env.NODE_ENV === "production" ? prodLogger() : devLogger();

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    },
};

module.exports = logger;
