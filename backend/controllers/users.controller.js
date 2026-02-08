const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const usersService = require("../services/users.service");
const {
  getRefreshTokenCookieOptions,
} = require("../utils/cookie-options-helper.util");

const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw AppError.badRequest("Missing username or password");

    await usersService.register(username, password);
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    handleControllerError(err, res);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw AppError.badRequest("Missing username or password");

    const { user, accessToken, refreshToken } = await usersService.login(
      username,
      password,
    );

    res
      .cookie("refresh_token", refreshToken, getRefreshTokenCookieOptions())
      .json({
        user: user,
        accessToken,
      });
  } catch (err) {
    handleControllerError(err, res);
  }
};

const refreshToken = async (req, res) => {
  try {
    const { accessToken, refreshToken: newRefreshToken } =
      await usersService.refreshToken(req.user);
    res
      .cookie("refresh_token", newRefreshToken, getRefreshTokenCookieOptions())
      .json({ accessToken });
  } catch (err) {
    handleControllerError(err, res);
  }
};

const logoutUser = async (req, res) => {
  try {
    await usersService.logout(req.user.id);

    res
      .clearCookie("refresh_token", getRefreshTokenCookieOptions())
      .json({ message: "Logged out successfully" });
  } catch (err) {
    handleControllerError(err, res);
  }
};

const getUser = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    handleControllerError(err, res);
  }
};

const changeUsername = async (req, res) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername) throw AppError.badRequest("Missing new username");

    const user = await usersService.changeUsername(req.user.id, newUsername);

    res.status(200).json({ message: "Username changed successfully", user });
  } catch (err) {
    handleControllerError(err, res);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      throw AppError.badRequest("Missing passwords");

    await usersService.changePassword(req.user.id, oldPassword, newPassword);

    res
      .status(200)
      .clearCookie("refresh_token", getRefreshTokenCookieOptions())
      .json({ message: "Password changed successfully" });
  } catch (err) {
    handleControllerError(err, res);
  }
};

const deleteAccount = async (req, res) => {
  try {
    await usersService.deleteAccount(req.user.id);

    res
      .clearCookie("refresh_token", getRefreshTokenCookieOptions())
      .json({ message: "Account deleted successfully" });
  } catch (err) {
    handleControllerError(err, res);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getUser,
  changeUsername,
  changePassword,
  deleteAccount,
};
