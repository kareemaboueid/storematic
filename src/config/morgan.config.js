const morgan = require("morgan");
const env = require("./env.config");
const logger = require("./logger.config");

// Custom Morgan token to colorize status codes
morgan.token("colored_status", (request, response) => {
  const status = response.statusCode;

  let color;
  if (status >= 500) color = "\x1b[35m";
  else if (status >= 400) color = "\x1b[31m";
  else if (status >= 300) color = "\x1b[33m";
  else if (status >= 200) color = "\x1b[32m";
  else if (status >= 100) color = "\x1b[36m";
  else color = "\x1b[0m";

  return `${color}${status}\x1b[0m`;
});

// Custom token for request id
morgan.token("req_id", (request, response) => {
  // Prefer the id from middleware, fall back to header or "-"
  return (
    request.id ||
    response.locals.requestId ||
    request.headers["x-request-id"] ||
    "-"
  );
});

// custom token to log error message
morgan.token(
  "message",
  (request, response) => response.locals.errorMessage || ""
);

// custom token to print speed_unit "ms"
morgan.token("speed_unit", (request, response) => {
  return "ms";
});

// Define log format including IP address in production
const get_ip_format = () => (env.env === "production" ? ":remote-addr - " : "");

// Format for successful responses
const success_response_format = `${get_ip_format()}:method :url :colored_status :response-time:speed_unit (id: :req_id)`;

// Format for error responses including error message
const error_response_format = `${get_ip_format()}:method :url :colored_status :response-time:speed_unit - message: :message`;

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
