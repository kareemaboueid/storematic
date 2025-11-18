const morgan = require("morgan");
const config_env = require("./env.config");
const config_logger = require("./logger.config");

// Custom Morgan token to colorize status codes
morgan.token("colored_status", (p_request, p_response) => {
  const status = p_response.statusCode;

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
morgan.token("req_id", (p_request, p_response) => {
  // Prefer the id from middleware, fall back to header or "-"
  return p_request.id || p_response.locals.requestId || p_request.headers["x-request-id"] || "-";
});

// custom token to log error message
morgan.token("message", (p_request, p_response) => p_response.locals.errorMessage || "");

// custom token to print speed_unit "ms"
morgan.token("speed_unit", () => "ms");

// Define log format including IP address in production
const get_ip_format = () => (config_env.env === "production" ? ":remote-addr - " : "");

// Format for successful responses
const success_response_format = `${get_ip_format()}:method :url :colored_status :response-time:speed_unit (id: :req_id)`;

// Format for error responses including error message
const error_response_format = `${get_ip_format()}:method :url :colored_status :response-time:speed_unit - message: :message`;

// Success handler for logging successful requests
const success_logger = morgan(success_response_format, {
  skip: (p_request, p_response) => p_response.statusCode >= 400,
  stream: { write: (message) => config_logger.info(message.trim()) },
});

// Error handler for logging failed requests
const error_logger = morgan(error_response_format, {
  skip: (p_request, p_response) => p_response.statusCode < 400,
  stream: { write: (message) => config_logger.error(message.trim()) },
});

const config_morgan = {
  success_logger,
  error_logger,
};

module.exports = config_morgan;
