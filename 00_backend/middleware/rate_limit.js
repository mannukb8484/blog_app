const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Modern name for 'max'
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7", // Sends RateLimit-Limit and RateLimit-Remaining headers
  legacyHeaders: false, // Disables the old X-RateLimit headers, def:true, so must explicitly stop sending old headers
  message: {
    status: 429,
    error: "Too Many Requests",
    message: "Too many failed login attempts. Please try again in 15 minutes.",
  },
});

module.exports = {
  authLimiter,
};
