const rateLimit = require("express-rate-limit");

/**
 * Rate limiter middleware
 */
const rate_limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

module.exports = rate_limiter;
