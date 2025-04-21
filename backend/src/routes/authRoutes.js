const express = require("express");
const {
  register,
  resendCode,
  verifyCode,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  validateToken,
  refreshToken,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/resend-code", resendCode);
router.post("/verify-code", verifyCode);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.get("/validate-token", authMiddleware(), validateToken);
router.post("/refresh-token", refreshToken);

module.exports = router;