const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

// Mock email transporter for development
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "your-ethereal-email", // Replace with your Ethereal email for testing
    pass: "your-ethereal-password", // Replace with your Ethereal password
  },
});

// Generate a 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email with the code (mocked for development)
const sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: "no-reply@ethiojobs.com",
      to: email,
      subject: "Verify Your Email - Ethio Jobs",
      text: `Your verification code is: ${code}. It expires in 10 minutes.`,
    };

    console.log("Mock Email Sent:", mailOptions);
    // Uncomment the following line to actually send emails in production
    // await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
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

    // Check rate-limiting
    const now = new Date();
    const lastResendAt = user.last_resend_at ? new Date(user.last_resend_at) : null;
    const resendWindowStart = user.resend_window_start ? new Date(user.resend_window_start) : null;
    const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
    const sixtySecondsInMs = 60 * 1000; // 60 seconds in milliseconds

    // Reset resend count if the 1-hour window has expired
    if (resendWindowStart && now - resendWindowStart > oneHourInMs) {
      await User.resetResendCount(email);
      user.resend_count = 0;
      user.resend_window_start = null;
    }

    // Check if the user has reached the maximum resend attempts (5 per hour)
    if (user.resend_count >= 5) {
      return res.status(429).json({
        error: "You've reached the maximum resend attempts. Please try again later or contact support.",
      });
    }

    // Check if 60 seconds have passed since the last resend
    if (lastResendAt && now - lastResendAt < sixtySecondsInMs) {
      const secondsRemaining = Math.ceil((sixtySecondsInMs - (now - lastResendAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${secondsRemaining} seconds before requesting another code.`,
      });
    }

    // Generate a new code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update resend tracking
    const newResendCount = (user.resend_count || 0) + 1;
    const newResendWindowStart = user.resend_window_start || now;
    await User.updateResendAttempts(email, newResendCount, now, newResendWindowStart);

    // Store the new code
    await User.storeVerificationCode(user.user_id, code, expiresAt);

    // Send the new code via email
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
    res.json({ token, user_type: user.user_type, userId: user.user_id });
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
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const resetLink = `http://localhost:5173/reset-password/${token}`;
    const mailOptions = {
      from: "no-reply@ethiojobs.com",
      to: email,
      subject: "Password Reset - Ethio Jobs",
      text: `Click the following link to reset your password: ${resetLink}. It expires in 15 minutes.`,
    };
    console.log("Mock Password Reset Email Sent:", mailOptions);
    res.json({ message: "Password reset link sent", token });
  } catch (error) {
    res.status(500).json({ error: "Failed to send reset link", details: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updatePassword(user.email, hashedPassword);
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: "Reset failed", details: error.message });
  }
};

module.exports = { register, resendCode, verifyCode, login, forgotPassword, resetPassword };