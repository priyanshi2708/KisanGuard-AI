/**
 * In-Memory Rate Limiter Middleware
 * Protects auth endpoints against brute force attempts without requiring Redis.
 */
const ipStore = new Map();

// Periodic cleanup of stale IP records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipStore.entries()) {
    if (now > data.resetTime) {
      ipStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

/**
 * Creates a rate limiter middleware for specific routes.
 * @param {number} maxAttempts - Maximum allowed requests in the time window.
 * @param {number} windowMs - Window duration in milliseconds (default 15 mins).
 */
export function createRateLimiter(maxAttempts = 20, windowMs = 15 * 60 * 1000) {
  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    let record = ipStore.get(ip);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      ipStore.set(ip, record);
      return next();
    }

    record.count += 1;
    if (record.count > maxAttempts) {
      const remainingSecs = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        errorType: 'TOO_MANY_REQUESTS',
        message: `Too many attempts. Please wait ${remainingSecs} seconds before trying again.`
      });
    }

    next();
  };
}

export default createRateLimiter;
