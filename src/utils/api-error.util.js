/**
 * UtlApiError class
 * @extends Error
 */
class UtlApiError extends Error {
  constructor(status_code, message, is_operational = true, stack = "") {
    super(message);
    this.statusCode = status_code;
    this.isOperational = is_operational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = UtlApiError;
