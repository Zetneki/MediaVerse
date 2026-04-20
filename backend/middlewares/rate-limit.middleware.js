const rateLimit = require("express-rate-limit");
const {
  getRefreshTokenCookieOptions,
} = require("../utils/cookie-options-helper.util");

/**
 * @param {number} windowMs: time window for rate limiting in milliseconds
 * @param {number} max: maximum number of requests within the time window
 * @param {number} statusCode: status code to return when rate limit is exceeded
 * @param {string} message: message to return when rate limit is exceeded
 */

//During load testing, rate limits are disabled to allow accurate performance measurement
//Set NODE_ENV=test in your .env or shell before running k6
const isTest = process.env.NODE_ENV === "test";
const TEST_MAX = 1_000_000;
const TEST_WINDOW = 1000;

const loginLimiter = rateLimit({
  windowMs: isTest ? TEST_WINDOW : 1 * 60 * 1000,
  max: isTest ? TEST_MAX : 10,
  statusCode: 429,
  message: { error: "Too many login attempts, please try again later" },
});

const registerLimiter = rateLimit({
  windowMs: isTest ? TEST_WINDOW : 1 * 60 * 1000,
  max: isTest ? TEST_MAX : 10,
  statusCode: 429,
  message: { error: "Too many registration attempts, please try again later" },
});

const accountLimiter = rateLimit({
  windowMs: isTest ? TEST_WINDOW : 15 * 60 * 1000,
  max: isTest ? TEST_MAX : 10,
  message: { error: "Too many account modifications, please wait" },
});

const progressLimiter = rateLimit({
  windowMs: isTest ? TEST_WINDOW : 15 * 60 * 1000,
  max: isTest ? TEST_MAX : 50,
  message: { error: "Too many progress modifications, please wait" },
});

const apiLimiter = rateLimit({
  windowMs: isTest ? TEST_WINDOW : 1 * 60 * 1000,
  max: isTest ? TEST_MAX : 100,
  statusCode: 429,
  message: { error: "Too many requests" },
});

const refreshLimiter = rateLimit({
  windowMs: isTest ? TEST_WINDOW : 1 * 60 * 1000,
  max: isTest ? TEST_MAX : 100,
  statusCode: 429,
  message: { error: "Too many refresh attempts" },
  handler: (req, res, _next, options) => {
    res.clearCookie("refresh_token", getRefreshTokenCookieOptions());
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = {
  loginLimiter,
  registerLimiter,
  accountLimiter,
  progressLimiter,
  apiLimiter,
  refreshLimiter,
};
