const express = require("express");
const {
  register,
  resendCode,
  verifyCode,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/resend-code", resendCode);
router.post("/verify-code", verifyCode);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode); // New endpoint
router.post("/reset-password", resetPassword);

module.exports = router;