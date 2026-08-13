const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after express-validator chains. If validation failed, collects the
 * errors into a { field: message } map and throws a 422 ApiError.
 */
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = {};
  for (const err of result.array()) {
    // express-validator v7 uses `path` for the field name
    const field = err.path || err.param || 'general';
    if (!errors[field]) errors[field] = err.msg;
  }

  return next(ApiError.unprocessable('Validation failed.', { errors }));
}

module.exports = { validate };
