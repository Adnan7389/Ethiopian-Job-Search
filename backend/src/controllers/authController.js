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
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a number between 100000 and 999999
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

    // In development, log the email instead of sending it
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

    // Generate a 6-digit code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Store the code in the database
    await User.storeVerificationCode(userId, code, expiresAt);

    // Send the code via email
    await sendVerificationEmail(email, code);

    res.status(201).json({ message: "Registered, please verify your email with the code sent to your email" });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
};

const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.verifyCode(email, code);
    if (!user) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Check if the code has expired
    if (new Date() > new Date(user.code_expires_at)) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    // Mark the user as verified
    await User.update(user.user_id, { is_verified: true });

    // Clear the verification code
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

module.exports = { register, verifyCode, login, forgotPassword, resetPassword };