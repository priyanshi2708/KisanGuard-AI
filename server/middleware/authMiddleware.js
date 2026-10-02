import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kisanguard_default_jwt_secret_2026_production';

/**
 * Strict authentication middleware.
 * Rejects requests without a valid JWT token with HTTP 401.
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    // 1. Read token from HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // 2. Read token from Authorization header fallback (Bearer <token>)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        errorType: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        errorType: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token.'
      });
    }

    // Check user in database
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        errorType: 'USER_NOT_FOUND',
        message: 'The user account associated with this session no longer exists.'
      });
    }

    // Attach authenticated user to request
    req.user = {
      userId: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      language: user.language,
      role: user.role,
      phone: user.phone || ''
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        errorType: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      errorType: 'INVALID_TOKEN',
      message: 'Authentication failed.'
    });
  }
}

/**
 * Optional authentication middleware.
 * Attaches user to req.user if token is valid, but does not block if missing.
 */
export async function optionalAuth(req, _res, next) {
  try {
    let token = null;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (user) {
          req.user = {
            userId: user._id.toString(),
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            language: user.language,
            role: user.role,
            phone: user.phone || ''
          };
        }
      }
    }
  } catch (e) {
    // Ignore invalid optional tokens
  }
  next();
}

export default { requireAuth, optionalAuth };
