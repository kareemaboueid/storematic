const { StatusCodes } = require("http-status-codes");
const ApiError = require("../utils/api-error.util");

/**
 * Error converter middleware
 * @param {Error} error - The error object
 * @param {Request} request - The Express request object
 * @param {Response} response - The Express response object
 * @param {Function} next - The next middleware function
 */
const error_converter = (error, request, response, next) => {
  let this_error = error;

  if (!(this_error instanceof ApiError)) {
    const statusCode =
      this_error.statusCode ||
      // FIXME later
      // postgresSQL error of any kind:
      this_error.name === "SequelizeDatabaseError" ||
      this_error.name === "SequelizeValidationError" ||
      this_error.name === "SequelizeUniqueConstraintError"
        ? StatusCodes.BAD_REQUEST
        : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = this_error.message || StatusCodes[statusCode];
    this_error = new ApiError(statusCode, message, false, this_error.stack);
  }

  next(this_error);
};

module.exports = error_converter;
