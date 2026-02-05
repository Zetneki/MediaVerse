const rateLimit = require("express-rate-limit");
const { stat } = require("fs");

/**
 * @param {number} windowMs: time window for rate limiting in milliseconds
 * @param {number} max: maximum number of requests within the time window
 * @param {number} statusCode: status code to return when rate limit is exceeded
 * @param {string} message: message to return when rate limit is exceeded
 */

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  statusCode: 429,
  message: { error: "Too many login attempts, please try again later" },
});

const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  statusCode: 429,
  message: { error: "Too many registration attempts, please try again later" },
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  statusCode: 429,
  message: { error: "Too many requests" },
});

const refreshLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  statusCode: 429,
  message: { error: "Too many refresh attempts" },
});

module.exports = {
  loginLimiter,
  registerLimiter,
  apiLimiter,
  refreshLimiter,
};
