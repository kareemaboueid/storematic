const { StatusCodes } = require("http-status-codes");
const UtlApiError = require("../utils/api-error.util");

/**
 * Error converter middleware
 * @param {Error} error - The error object
 * @param {Request} request - The Express request object
 * @param {Response} response - The Express response object
 * @param {Function} next - The next middleware function
 */
const middleware_error_converter = (p_error, p_request, p_response, p_next) => {
  let this_error = p_error;

  if (!(this_error instanceof UtlApiError)) {
    const status_code =
      this_error.statusCode ||
      // FIXME later
      // postgresSQL error of any kind:
      this_error.name === "SequelizeDatabaseError" ||
      this_error.name === "SequelizeValidationError" ||
      this_error.name === "SequelizeUniqueConstraintError"
        ? StatusCodes.BAD_REQUEST
        : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = this_error.message || StatusCodes[status_code];
    this_error = new UtlApiError(status_code, message, false, this_error.stack);
  }

  p_next(this_error);
};

module.exports = middleware_error_converter;
