const { StatusCodes } = require("http-status-codes");
const env = require("../config/env.config");
const logger = require("../config/logger.config");

/**
 * Error handler middleware
 * @param {Error} error - The error object
 * @param {Request} request - The Express request object
 * @param {Response} response - The Express response object
 * @param {Function} next - The next middleware function
 */
const error_handler = (error, request, response, next) => {
  // extract status code and message from error
  let { statusCode, message } = error;

  // if error is not operational and in production, set to generic message
  if (env.env === "production" && !error.isOperational) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message = StatusCodes[StatusCodes.INTERNAL_SERVER_ERROR];
  }

  // set error message in response locals for logging
  response.locals.errorMessage = error.message;

  // construct response object
  const error_response = {
    code: statusCode,
    message,
    ...(env.env === "development" && { stack: error.stack }),
  };

  // log the error if in development environment
  if (env.env === "development") {
    logger.error(error);
  }

  // send the error response
  response.status(statusCode).send(error_response);
};

module.exports = error_handler;
