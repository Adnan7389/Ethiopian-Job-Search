const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// Generate a 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Mock email sending function
const mockSendEmail = ({ to, subject, text }) => {
  console.log(`Mock Email Sent to ${to}:`, { subject, text });
};

// Send verification email (mocked)
const sendVerificationEmail = async (email, code) => {
  try {
    mockSendEmail({
      to: email,
      subject: "Verify Your Email - Ethio Jobs",
      text: `Your verification code is: ${code}. It expires in 10 minutes.`,
    });
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw new Error("Failed to send verification email");
  }
};

// Send reset code email (mocked)
const sendResetCodeEmail = async (email, code) => {
  try {
    mockSendEmail({
      to: email,
      subject: "Password Reset Code - Ethio Jobs",
      text: `Your password reset code is: ${code}. It expires in 10 minutes.`,
    });
  } catch (error) {
    console.error("Error sending reset code email:", error.message);
    throw new Error("Failed to send reset code email");
  }
};

const register = async (req, res) => {
  const { username, email, password, confirmPassword, user_type } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  if (!["job_seeker", "employer"].includes(user_type)) {
    return res.status(400).json({ error: "Invalid user type" });
  }

  try {
    const existingUser = await User.findByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({ username, email, password: hashedPassword, user_type });
    console.log("User created with ID:", userId);

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await User.storeVerificationCode(userId, code, expiresAt);
    await sendVerificationEmail(email, code);

    res.status(201).json({ message: "Registered, please verify your email with the code sent to your email" });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
};

const resendCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const now = new Date();
    const lastResendAt = user.last_resend_at ? new Date(user.last_resend_at) : null;
    const resendWindowStart = user.resend_window_start ? new Date(user.resend_window_start) : null;
    const oneHourInMs = 60 * 60 * 1000;
    const sixtySecondsInMs = 60 * 1000;

    if (resendWindowStart && now - resendWindowStart > oneHourInMs) {
      await User.resetResendCount(email);
      user.resend_count = 0;
      user.resend_window_start = null;
    }

    if (user.resend_count >= 5) {
      return res.status(429).json({
        error: "You've reached the maximum resend attempts. Please try again later or contact support.",
      });
    }

    if (lastResendAt && now - lastResendAt < sixtySecondsInMs) {
      const secondsRemaining = Math.ceil((sixtySecondsInMs - (now - lastResendAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${secondsRemaining} seconds before requesting another code.`,
      });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const newResendCount = (user.resend_count || 0) + 1;
    const newResendWindowStart = user.resend_window_start || now;
    await User.updateResendAttempts(email, newResendCount, now, newResendWindowStart);
    await User.storeVerificationCode(user.user_id, code, expiresAt);
    await sendVerificationEmail(email, code);

    res.json({ message: "New verification code sent to your email." });
  } catch (error) {
    console.error("Resend code error:", error.message);
    res.status(500).json({ error: "Failed to resend code", details: error.message });
  }
};

const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.verifyCode(email, code);
    if (!user) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    if (new Date() > new Date(user.code_expires_at)) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    await User.update(user.user_id, { is_verified: true });
    await User.clearVerificationCode(user.user_id);
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Verification failed", details: error.message });
  }
};

const login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findByEmailOrUsername(identifier);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!user.is_verified) {
      return res.status(403).json({ error: "Please verify your email before logging in" });
    }
    const token = jwt.sign(
      { userId: user.user_id, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      token,
      user_type: user.user_type,
      userId: user.user_id,
      username: user.username,
      email: user.email,
      resume_url: user.resume_url || null,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findByEmailOrUsername(email);
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await User.storeResetCode(email, code, expiresAt);
    await sendResetCodeEmail(email, code);

    res.json({ message: "Reset code sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ error: "Failed to send reset code", details: error.message });
  }
};

const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.verifyResetCode(email, code);
    if (!user) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    if (new Date() > new Date(user.reset_code_expires_at)) {
      return res.status(400).json({ error: "Reset code has expired" });
    }

    res.json({ message: "Reset code verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Reset code verification failed", details: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.reset_code) {
      return res.status(400).json({ error: "No reset code found. Please request a new code." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updatePassword(email, hashedPassword);
    await User.clearResetCode(email);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: "Reset failed", details: error.message });
  }
};

module.exports = { register, resendCode, verifyCode, login, forgotPassword, verifyResetCode, resetPassword };