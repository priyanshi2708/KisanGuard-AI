import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import FarmerProfile from '../models/FarmerProfile.js';
import memoryStore from '../models/memoryStore.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kisanguard_default_jwt_secret_2026_production';
const authLimiter = createRateLimiter(50, 15 * 60 * 1000); // 50 attempts per 15 min

/**
 * Helper to generate JWT and set secure cookie
 */
function sendTokenCookie(res, user, statusCode = 200) {
  const userId = (user._id || user.id).toString();
  const token = jwt.sign(
    { userId, email: user.email },
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

  const safeUser = typeof user.toSafeObject === 'function'
    ? user.toSafeObject()
    : {
        id: userId,
        _id: userId,
        name: user.name,
        email: user.email,
        language: user.language || 'gu',
        phone: user.phone || '',
        role: user.role || 'farmer'
      };

  return res.status(statusCode).json({
    success: true,
    token,
    user: safeUser
  });
}

/**
 * POST /api/auth/register
 * Registers a new user, hashes password, sets auth cookie and creates profile.
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

    const isMongoConnected = mongoose.connection.readyState === 1;

    // 2. Check existing user
    let existing = null;
    if (isMongoConnected) {
      try {
        existing = await User.findOne({ email: cleanEmail });
      } catch (e) {
        console.warn('[Auth/Register] MongoDB query failed, using memory store:', e.message);
        existing = await memoryStore.findUserByEmail(cleanEmail);
      }
    } else {
      existing = await memoryStore.findUserByEmail(cleanEmail);
    }

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
    let user = null;
    if (isMongoConnected) {
      try {
        const mongoUser = new User({
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          language: cleanLanguage,
          phone: (phone || '').trim(),
          role: role || 'farmer'
        });
        await mongoUser.save();
        user = mongoUser;

        const profile = new FarmerProfile({
          userId: user._id,
          onboardingCompleted: false
        });
        await profile.save().catch(() => {});
      } catch (e) {
        console.warn('[Auth/Register] MongoDB save failed, saving to memory fallback:', e.message);
        user = await memoryStore.createUser({
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          language: cleanLanguage,
          phone: (phone || '').trim(),
          role: role || 'farmer'
        });
      }
    } else {
      user = await memoryStore.createUser({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        language: cleanLanguage,
        phone: (phone || '').trim(),
        role: role || 'farmer'
      });
      await memoryStore.saveProfile(user._id, { userId: user._id, onboardingCompleted: false });
    }

    console.log(`👤 User registered successfully: ${cleanEmail} (${user._id || user.id})`);

    // 5. Send welcome email (non-blocking)
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      language: user.language
    }).catch(err => {
      console.warn(`[Auth/Register] Email notice: ${err.message}`);
    });

    return sendTokenCookie(res, user, 201);
  } catch (err) {
    console.error('[Auth/Register] Exception:', err.message);
    return res.status(500).json({
      success: false,
      errorType: 'SERVER_ERROR',
      message: 'Registration encountered a problem. Please try again.'
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
    const isMongoConnected = mongoose.connection.readyState === 1;

    // 1. Find user by email
    let user = null;
    if (isMongoConnected) {
      try {
        user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
      } catch (e) {
        user = await memoryStore.findUserByEmail(cleanEmail);
      }
    } else {
      user = await memoryStore.findUserByEmail(cleanEmail);
    }

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

    console.log(`🔓 User logged in: ${user.email} (${user._id || user.id})`);
    return sendTokenCookie(res, user, 200);
  } catch (err) {
    console.error('[Auth/Login] Exception:', err.message);
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
 * Session endpoint returning the authenticated user profile, or authenticated: false if not logged in.
 */
router.get('/me', optionalAuth, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    let user = null;

    if (isMongoConnected) {
      try {
        user = await User.findById(req.user.userId).select('-passwordHash');
      } catch (e) {
        user = await memoryStore.findUserById(req.user.userId);
      }
    } else {
      user = await memoryStore.findUserById(req.user.userId);
    }

    if (!user) {
      return res.json({ success: true, authenticated: false, user: null });
    }

    const safeUser = typeof user.toSafeObject === 'function'
      ? user.toSafeObject()
      : {
          id: user._id || user.id,
          _id: user._id || user.id,
          name: user.name,
          email: user.email,
          language: user.language || 'gu',
          phone: user.phone || '',
          role: user.role || 'farmer'
        };

    return res.json({
      success: true,
      authenticated: true,
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth/Me] Exception:', err.message);
    return res.json({ success: true, authenticated: false, user: null });
  }
});

export default router;
