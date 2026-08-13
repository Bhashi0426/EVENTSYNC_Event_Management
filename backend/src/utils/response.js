/**
 * Consistent API response helpers.
 * Success: { success: true, data }
 * Error:   { success: false, message, errors?, conflict? }
 */

function sendSuccess(res, statusCode = 200, data = {}, extra = {}) {
  return res.status(statusCode).json({ success: true, data, ...extra });
}

function sendError(res, statusCode = 500, message = 'Something went wrong.', extra = {}) {
  return res.status(statusCode).json({ success: false, message, ...extra });
}

module.exports = { sendSuccess, sendError };
