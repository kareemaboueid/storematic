const morgan = require("morgan");
const env = require("./env.config");
const logger = require("./logger.config");

// Define custom token to log error message
morgan.token(
  "message",
  (request, response) => response.locals.errorMessage || ""
);

// Define log format including IP address in production
const get_ip_format = () => (env.env === "production" ? ":remote-addr - " : "");

// Format for successful responses
const success_response_format = `${get_ip_format()}:method :url :status - :response-time ms`;

// Format for error responses including error message
const error_response_format = `${get_ip_format()}:method :url :status - :response-time ms - message: :message`;

// Success handler for logging successful requests
const success_logger = morgan(success_response_format, {
  skip: (request, response) => response.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

// Error handler for logging failed requests
const error_logger = morgan(error_response_format, {
  skip: (request, response) => response.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});

module.exports = {
  success_logger,
  error_logger,
};
