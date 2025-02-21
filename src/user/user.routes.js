const express = require("express");
const router = express.Router();
const UserController = require("./user.controller");
const { registerUserValidation, loginValidation } = require("./user.validations");

router.post("/register", [registerUserValidation], UserController.registerUser);
router.post("/login", [loginValidation], UserController.userLogin);

module.exports = router;
