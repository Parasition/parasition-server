const express = require("express");
const router = express.Router();
const CampaignController = require("./campaign.controller");
const { createCampaignValidation } = require("./campaign.validations");
const { isUserLoggedIn } = require("../user/user.middleware");

router.post("/create", [isUserLoggedIn, createCampaignValidation], CampaignController.createCampaign);
router.post("/extend", [isUserLoggedIn], CampaignController.extendCampaign);
router.get("/all", [isUserLoggedIn], CampaignController.getCampaigns);
router.get("/get", [isUserLoggedIn], CampaignController.getCampaignDetails);

module.exports = router;
