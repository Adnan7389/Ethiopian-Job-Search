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
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/resend-code", resendCode);
router.post("/verify-code", verifyCode);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

// Validate token and return user info
router.get("/validate-token", authMiddleware, (req, res) => {
  try {
    // authMiddleware has already validated the token and set req.user
    const { userId, user_type } = req.user;
    // For simplicity, return mock user data; replace with actual database query if needed
    res.status(200).json({
      userId,
      user_type,
      username: req.user.username || "employer9", // Replace with actual data from DB
      email: req.user.email || "employer9@example.com", // Replace with actual data from DB
      resume_url: req.user.resume_url || "", // Replace with actual data from DB
    });
  } catch (error) {
    console.error("Validate token error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;