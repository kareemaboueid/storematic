const rate_limit = require("express-rate-limit");

/**
 * Rate limiter middleware
 */
const middleware_rate_limiter = rate_limit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

module.exports = middleware_rate_limiter;
