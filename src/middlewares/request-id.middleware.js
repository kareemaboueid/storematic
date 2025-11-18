const { v4: uuidv4 } = require("uuid");

// Middleware to assign a unique request ID to each incoming request
const middleware_request_id = (p_request, p_response, p_next) => {
  const header_id = p_request.headers["x-request-id"];

  // Prefer client-provided id if sane, else generate
  const id =
    typeof header_id === "string" && header_id.trim().length > 0 ? header_id.trim() : uuidv4();
  // Attach to request + response locals
  p_request.id = id;
  p_response.locals.requestId = id;

  // Attach to outgoing response header
  p_response.setHeader("X-Request-Id", id);

  p_next();
};

module.exports = middleware_request_id;
