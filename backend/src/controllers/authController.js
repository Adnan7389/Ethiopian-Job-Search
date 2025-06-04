const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const mysql = require("mysql2/promise");
const { sendVerificationEmail: sendEmail } = require("../utils/email");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const mockSendEmail = ({ to, subject, text }) => {
  console.log(`Mock Email Sent to ${to}:`, { subject, text });
};

const sendVerificationEmail = async (email, code) => {
  try {
    await sendEmail(email, code);
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw new Error("Failed to send verification email");
  }
};

const sendResetCodeEmail = async (email, code) => {
  try {
    await sendEmail(email, code);
  } catch (error) {
    console.error("Error sending reset code email:", error.message);
    throw new Error("Failed to send reset code email");
  }
};

const generateAccessToken = (user) => {
  console.log('🔵 [TOKEN] Generating access token for user:', user.user_id);
  const token = jwt.sign(
    { userId: user.user_id, user_type: user.user_type },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
  console.log('✅ [TOKEN] Access token generated successfully');
  return token;
};

const generateRefreshToken = async (user) => {
  console.log('🔵 [TOKEN] Generating refresh token for user:', user.user_id);
  const refreshToken = jwt.sign(
    { userId: user.user_id, user_type: user.user_type },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  console.log('🔵 [TOKEN] Storing refresh token in database...');
  await db.execute(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [user.user_id, refreshToken, expiresAt]
  );
  console.log('✅ [TOKEN] Refresh token generated and stored successfully');
  return refreshToken;
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
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
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

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

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

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: "Code must be a 6-digit number" });
  }

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

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
      user_type: user.user_type,
      userId: user.user_id,
      username: user.username,
      email: user.email,
      resume_url: user.resume_url || null,
    });
  } catch (error) {
    console.error("Verify code error:", error.message);
    res.status(500).json({ error: "Verification failed", details: error.message });
  }
};

const login = async (req, res) => {
  const { identifier, password } = req.body;
  console.log('🔵 [LOGIN] Login attempt for identifier:', identifier);
  
  try {
    console.log('🔵 [LOGIN] Searching for user...');
    const user = await User.findByEmailOrUsername(identifier);
    
    if (!user) {
      console.log('🔴 [LOGIN] User not found');
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    console.log('🔵 [LOGIN] User found, verifying password...');
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('🔴 [LOGIN] Invalid password');
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (!user.is_verified) {
      console.log('🔴 [LOGIN] User not verified');
      return res.status(403).json({ error: "Please verify your email before logging in" });
    }
    
    if (user.is_suspended) {
      console.log('🔴 [LOGIN] User is suspended');
      return res.status(403).json({ error: "Your account has been suspended. Please contact support for assistance." });
    }

    console.log('🔵 [LOGIN] User authenticated, logging activity...');
    const ip = req.headers['x-forwarded-for'] || req.ip;
    await db.execute(
      'INSERT INTO login_logs (user_id, ip_address) VALUES (?, ?)',
      [user.user_id, ip]
    );

    console.log('🔵 [LOGIN] Generating tokens...');
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    
    console.log('✅ [LOGIN] Login successful for user:', user.username);
    res.json({
      accessToken,
      refreshToken,
      user_type: user.user_type,
      userId: user.user_id,
      username: user.username,
      email: user.email,
      resume_url: user.resume_url || null,
    });
  } catch (error) {
    console.error('🔴 [LOGIN] Error:', error);
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

const validateToken = async (req, res) => {
  try {
    const { userId, user_type } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      userId,
      user_type,
      username: user.username,
      email: user.email,
      resume_url: user.resume_url || "",
    });
  } catch (error) {
    console.error("Validate token error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const [rows] = await db.execute(
      "SELECT * FROM refresh_tokens WHERE token = ? AND revoked = FALSE AND expires_at > NOW()",
      [refreshToken]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    await db.execute("UPDATE refresh_tokens SET revoked = TRUE WHERE token = ?", [refreshToken]);
    const user = { user_id: decoded.userId, user_type: decoded.user_type };
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("refreshToken: Error:", error.message);
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

module.exports = {
  register,
  resendCode,
  verifyCode,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  validateToken,
  refreshToken,
};