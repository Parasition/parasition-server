const express = require("express");
const router = express.Router();

const userRoutes = require("../src/user/user.routes");
const campaignRoutes = require("../src/campaign/campaign.routes");

router.use("/api/user", userRoutes);
router.use("/api/campaign", campaignRoutes);

module.exports = router;
