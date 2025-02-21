const mongoose = require("mongoose");
const { keys } = require("./environment");
const logger = require("../utils/logger");

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(keys.DB_URI);
        console.log("Database connected", connection.connection.host, connection.connection.name);
    } catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
};

module.exports = connectDB;
