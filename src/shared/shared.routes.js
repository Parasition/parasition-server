const express = require("express");
const router = express.Router();
const SharedController = require("./shared.controller");
const { isUserLoggedIn } = require("../user/user.middleware");

router.get("/video/info", [isUserLoggedIn], SharedController.fetchVideoInfo);
router.get("/audio/info", [], SharedController.fetchAudioInfo);

module.exports = router;
