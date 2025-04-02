const express = require("express");
const {
  register,
  verifyCode,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/verify-code", verifyCode); // New endpoint
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;