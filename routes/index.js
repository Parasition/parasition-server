const express = require("express");
const router = express.Router();

const userRoutes = require("../src/user/user.routes");
const campaignRoutes = require("../src/campaign/campaign.routes");
const sharedRoutes = require("../src/shared/shared.routes");

router.use("/api/user", userRoutes);
router.use("/api/campaign", campaignRoutes);
router.use("/api", sharedRoutes);

module.exports = router;
