const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const register = async (req, res) => {
  const { username, email, password, confirmPassword, user_type } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (!['job_seeker', 'employer'].includes(user_type)) {
    return res.status(400).json({ error: 'Invalid user type' });
  }

  try {
    const existingUser = await User.findByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({ username, email, password: hashedPassword, user_type });
    console.log('User created with ID:', userId);
    const token = await Promise.resolve(User.createEmailVerification(email));
    console.log('Generated token:', token); // Debug log

    if (!token || typeof token !== 'string') {
      throw new Error('Token generation failed');
    }

    res.status(201).json({ message: 'Registered, please verify your email', token });
  } catch (error) {
    console.error('Registration error:', error.message); // Debug log
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

const login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findByEmailOrUsername(identifier);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }
    const token = jwt.sign({ userId: user.user_id, user_type: user.user_type }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user_type: user.user_type, userId: user.user_id });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findByEmailOrUsername(email);
    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }
    const token = await User.createPasswordReset(email);
    res.json({ message: 'Password reset link sent', token }); // Mock email
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reset link', details: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const reset = await User.verifyResetToken(token);
    if (!reset) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updatePassword(reset.email, hashedPassword);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Reset failed', details: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.body;
  try {
    const verification = await User.verifyEmailToken(token);
    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, verifyEmail};