const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: Generate JWT Token ───────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic payload validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Create user (pre-save hook hashes password)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account registered successfully',
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(422).json({ error: messages.join(', ') });
    }
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Must explicitly select password because it is set to select: false in schema
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Logged in successfully',
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
