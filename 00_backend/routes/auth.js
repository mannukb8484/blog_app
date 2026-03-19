// s11:creator
const express = require("express");
const router = express.Router();
const { authLimiter } = require("../middleware/rate_limit");

// s11
const authController = require("../controller/auth.js");
// s12 &13
router.post("/signUp", authController.signUp);
// s14
router.post("/login", authLimiter, authController.login);
module.exports = router;
