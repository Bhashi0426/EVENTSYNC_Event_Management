const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Extract a bearer token from the Authorization header or the auth cookie.
 */
function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

/**
 * requireAuth: verifies JWT, loads the user, and attaches it to req.user.
 * Rejects disabled accounts.
 */
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw ApiError.unauthorized('Authentication required. Please log in.');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Session expired. Please log in again.');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw ApiError.unauthorized('Account no longer exists.');
    }
    if (user.status === 'disabled') {
      throw ApiError.forbidden('Your account has been disabled.');
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * optionalAuth: attaches req.user when a valid token is present, but never
 * rejects the request. Used for public endpoints that personalize output.
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);
    if (user && user.status !== 'disabled') req.user = user;
  } catch (err) {
    // Ignore — treat as anonymous.
  }
  return next();
}

module.exports = { requireAuth, optionalAuth, extractToken };
