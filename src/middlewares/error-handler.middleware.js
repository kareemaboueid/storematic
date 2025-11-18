const { StatusCodes } = require("http-status-codes");
const config_env = require("../config/env.config");
const config_logger = require("../config/logger.config");

/**
 * Error handler middleware
 * @param {Error} error - The error object
 * @param {Request} request - The Express request object
 * @param {Response} response - The Express response object
 * @param {Function} next - The next middleware function
 */
const middleware_error_handler = (p_error, p_request, p_response) => {
  // extract status code and message from error
  let { statusCode: status_code, message } = p_error;

  // if error is not operational and in production, set to generic message
  if (config_env.env === "production" && !p_error.isOperational) {
    status_code = StatusCodes.INTERNAL_SERVER_ERROR;
    message = StatusCodes[StatusCodes.INTERNAL_SERVER_ERROR];
  }

  // set error message in response locals for logging
  p_response.locals.errorMessage = p_error.message;

  // construct response object
  const error_response = {
    code: status_code,
    message,
    ...(config_env.env === "development" && { stack: p_error.stack }),
  };

  // log the error if in development environment
  if (config_env.env === "development") {
    config_logger.error(p_error);
  }

  // send the error response
  p_response.status(status_code).send(error_response);
};

module.exports = middleware_error_handler;
