const ApiError = require('../utils/ApiError');

/**
 * requireRole('admin') or requireRole('organizer', 'admin').
 * Must run after requireAuth.
 */
function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("You don't have permission to perform this action."));
    }
    return next();
  };
}

module.exports = { requireRole };
