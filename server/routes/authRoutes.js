import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import FarmerProfile from '../models/FarmerProfile.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kisanguard_default_jwt_secret_2026_production';
const authLimiter = createRateLimiter(20, 15 * 60 * 1000); // 20 attempts per 15 min

/**
 * Helper to generate JWT and set secure cookie
 */
function sendTokenCookie(res, user, statusCode = 200) {
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token, // Also send in response for clients choosing Authorization Bearer header
    user: user.toSafeObject()
  });
}

/**
 * POST /api/auth/register
 * Registers a new user, hashes password, sets auth cookie and creates default profile.
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, language = 'gu', phone = '', role = 'farmer' } = req.body || {};

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, errorType: 'MISSING_NAME', message: 'Name is required.' });
    }
    if (!email || !email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      return res.status(400).json({ success: false, errorType: 'INVALID_EMAIL', message: 'A valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, errorType: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanLanguage = ['en', 'gu', 'hi', 'english', 'gujarati', 'hindi'].includes((language || '').toLowerCase())
      ? (language || 'gu').toLowerCase()
      : 'gu';

    // 2. Check existing user
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        errorType: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists.'
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      language: cleanLanguage,
      phone: (phone || '').trim(),
      role: role || 'farmer'
    });
    await user.save();

    // 5. Create initial empty profile linked to userId
    const profile = new FarmerProfile({
      userId: user._id,
      onboardingCompleted: false
    });
    await profile.save();

    console.log(`👤 New user registered: ${user.email} (${user._id})`);

    // 6. Trigger welcome email in background (non-blocking)
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      language: user.language
    }).catch(err => {
      console.warn(`[Auth/Register] Email notification failed: ${err.message}`);
    });

    return sendTokenCookie(res, user, 201);
  } catch (err) {
    console.error('[Auth/Register] Error:', err.message);
    return res.status(500).json({
      success: false,
      errorType: 'SERVER_ERROR',
      message: 'Registration failed due to a server error. Please try again.'
    });
  }
});

/**
 * POST /api/auth/login
 * Validates credentials, sets auth cookie and returns user.
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        errorType: 'MISSING_CREDENTIALS',
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Find user by email including passwordHash
    const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        errorType: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    // 2. Compare password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        errorType: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    console.log(`🔓 User logged in: ${user.email} (${user._id})`);
    return sendTokenCookie(res, user, 200);
  } catch (err) {
    console.error('[Auth/Login] Error:', err.message);
    return res.status(500).json({
      success: false,
      errorType: 'SERVER_ERROR',
      message: 'Login failed due to a server error.'
    });
  }
});

/**
 * POST /api/auth/logout
 * Clears the authentication cookie.
 */
router.post('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });

  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

/**
 * GET /api/auth/me
 * Protected endpoint returning the authenticated user profile and session info.
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, errorType: 'USER_NOT_FOUND', message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (err) {
    console.error('[Auth/Me] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user session.' });
  }
});

export default router;
