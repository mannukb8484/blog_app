// s11:creator
const express = require("express");
const router = express.Router();
// s11
const authController = require("../controller/auth.js");
// s12 &13
router.post("/signUp", authController.signUp);
// s14
router.post("/login", authController.login);

module.exports = router;
