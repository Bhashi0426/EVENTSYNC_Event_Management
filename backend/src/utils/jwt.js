const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * JWT payload is intentionally minimal: userId + role only.
 * No sensitive data is placed in the token.
 */
function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
