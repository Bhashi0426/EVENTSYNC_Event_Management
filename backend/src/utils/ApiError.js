/**
 * Custom error type carrying an HTTP status code plus optional structured
 * fields (validation errors, optimistic-concurrency conflict metadata).
 * Thrown by services/controllers and handled by errorMiddleware.
 */
class ApiError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = options.errors;
    this.conflict = options.conflict;
    this.extra = options.extra || {};
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request.', options) {
    return new ApiError(400, message, options);
  }

  static unauthorized(message = 'Unauthorized.', options) {
    return new ApiError(401, message, options);
  }

  static forbidden(message = 'You do not have permission to perform this action.', options) {
    return new ApiError(403, message, options);
  }

  static notFound(message = 'Resource not found.', options) {
    return new ApiError(404, message, options);
  }

  static conflict(message = 'Conflict.', options = {}) {
    return new ApiError(409, message, { conflict: true, ...options });
  }

  static unprocessable(message = 'Validation failed.', options) {
    return new ApiError(422, message, options);
  }
}

module.exports = ApiError;
