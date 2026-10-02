/**
 * In-Memory Rate Limiter Middleware
 * Protects auth endpoints against brute force attempts.
 * Uses lazy inline cleanup to be 100% compatible with Serverless event loops (Vercel/AWS Lambda).
 */
const ipStore = new Map();

function cleanupStaleRecords() {
  if (ipStore.size > 200) {
    const now = Date.now();
    for (const [ip, data] of ipStore.entries()) {
      if (now > data.resetTime) {
        ipStore.delete(ip);
      }
    }
  }
}

/**
 * Creates a rate limiter middleware for specific routes.
 * @param {number} maxAttempts - Maximum allowed requests in the time window.
 * @param {number} windowMs - Window duration in milliseconds (default 15 mins).
 */
export function createRateLimiter(maxAttempts = 50, windowMs = 15 * 60 * 1000) {
  return function rateLimiter(req, res, next) {
    cleanupStaleRecords();
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown-ip';
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
