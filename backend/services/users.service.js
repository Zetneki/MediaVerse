const usersDao = require("../dao/users.dao");
const passwordUtil = require("../utils/password.util");
const jwtUtil = require("../utils/jwt.util");
const {
  validateCredentials,
} = require("../utils/validation/credentials.validator");
const PasswordValidator = require("../utils/validation/password.validator");
const UsernameValidator = require("../utils/validation/username.validator");
const { AppError } = require("../middlewares/error-handler.middleware");

/**
 * Register a new user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<void>}
 */

const register = async (username, password) => {
  // Validate credentials
  const credentialErrors = validateCredentials(password, username);
  if (credentialErrors.length > 0) throw AppError.validation(credentialErrors);

  // Hash password
  const hash = await passwordUtil.hashPassword(password);

  // Create user
  try {
    await usersDao.createUser(username, hash);
  } catch (err) {
    if (err.code === "23505")
      throw AppError.conflict("Username already exists");

    throw err; // Re-throw other errors
  }
};

/**
 * Login user and generate tokens
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{user: Object, accessToken: string, refreshToken: string}>}
 */

const login = async (username, password) => {
  // Find user
  const user = await usersDao.findByUsername(username);
  if (!user) throw AppError.unauthorized("Invalid credentials");

  const { password_hash, token_version, ...safeUser } = user;

  // Verify password
  const isValid = await passwordUtil.comparePassword(password, password_hash);
  if (!isValid) throw AppError.unauthorized("Invalid credentials");

  // Generate tokens
  const { accessToken, refreshToken } = jwtUtil.generateTokens(user);

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 * @param {Object} user - User from middleware (req.user)
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */

const refreshToken = async (user) => {
  const { accessToken, refreshToken } = jwtUtil.generateTokens(user);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Logout user (invalidate tokens)
 * @param {number} userId
 * @returns {Promise<void>}
 */

const logout = async (userId) => {
  await usersDao.incrementTokenVersion(userId);
};

/**
 * Get user profile by ID
 * @param {number} userId
 * @returns {Promise<Object>} Safe user object (without sensitive data)
 */

const getUserById = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const { password_hash, token_version, ...safeUser } = user;
  return safeUser;
};

/**
 * Change username
 * @param {number} userId
 * @param {string} newUsername
 * @returns {Promise<Object>} Updated safe user object
 */

const changeUsername = async (userId, newUsername) => {
  // Get current user
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  // Validate new username
  const usernameErrors = UsernameValidator.validateChange(
    user.username,
    newUsername,
  );
  if (usernameErrors.length > 0) throw AppError.validation(usernameErrors);

  // Update username
  try {
    const updatedUser = await usersDao.updateUsername(userId, newUsername);
    if (!updatedUser) throw AppError.notFound("User not found");

    const { password_hash, token_version, ...safeUser } = updatedUser;
    return safeUser;
  } catch (err) {
    if (err.code === "23505") {
      throw AppError.conflict("Username already exists");
    }
    throw err;
  }
};

/**
 * Change password
 * @param {number} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */

const changePassword = async (userId, oldPassword, newPassword) => {
  // Get current user
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  // Verify old password
  const valid = await passwordUtil.comparePassword(
    oldPassword,
    user.password_hash,
  );
  if (!valid) throw AppError.unauthorized("Old password incorrect");

  // Validate new password
  const passwordErrors = PasswordValidator.validateChange(
    oldPassword,
    newPassword,
    user.username,
  );
  if (passwordErrors.length > 0) throw AppError.validation(passwordErrors);

  // Update password
  const newHash = await passwordUtil.hashPassword(newPassword);
  await usersDao.updatePassword(userId, newHash);

  // Invalidate all existing tokens
  await usersDao.incrementTokenVersion(userId);
};

/**
 * Delete user account
 * @param {number} userId
 * @returns {Promise<void>}
 */

const deleteAccount = async (userId) => {
  const deleted = await usersDao.deleteUser(userId);
  if (deleted === 0) throw AppError.notFound("User not found");
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getUserById,
  changeUsername,
  changePassword,
  deleteAccount,
};
