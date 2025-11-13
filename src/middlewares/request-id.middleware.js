const { v4: uuidv4 } = require("uuid");

// Middleware to assign a unique request ID to each incoming request
const request_id_middleware = (req, res, next) => {
  const headerId = req.headers["x-request-id"];

  // Prefer client-provided id if sane, else generate
  const id =
    typeof headerId === "string" && headerId.trim().length > 0
      ? headerId.trim()
      : uuidv4();

  // Attach to request + response locals
  req.id = id;
  res.locals.requestId = id;

  // Attach to outgoing response header
  res.setHeader("X-Request-Id", id);

  next();
};

module.exports = request_id_middleware;
