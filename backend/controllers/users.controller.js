const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const passwordUtil = require("../utils/password.util");
const jwtUtil = require("../utils/jwt.util");
const usersDao = require("../dao/users.dao");
const PasswordValidator = require("../utils/validation/password.validator");
const UsernameValidator = require("../utils/validation/username.validator");
const {
  validateCredentials,
} = require("../utils/validation/credentials.validator");

exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      //return res.status(400).json({ error: "Missing username or password" });
      //throw new AppError("Missing username or password", 400);
      throw AppError.badRequest("Missing username or password");

    const credentialErrors = validateCredentials(password, username);
    if (credentialErrors.length > 0)
      //return res.status(400).json({ errors: credentialErrors });
      throw AppError.validation(credentialErrors);

    const hash = await passwordUtil.hashPassword(password);

    await usersDao.createUser(username, hash);
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    // if (err.code === "23505") {
    //   return res.status(409).json({ error: "Username already exists" });
    // }
    // res.status(500).json({ error: "Server error" });
    handleControllerError(err, res);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      //return res.status(400).json({ error: "Missing username or password" });
      //throw new AppError("Missing username or password", 400);
      throw AppError.badRequest("Missing username or password");

    const user = await usersDao.findByUsername(username);
    //if (!user) return res.status(401).json({ error: "Invalid credentials" });
    //if (!user) throw new AppError("Invalid credentials", 401);
    if (!user) throw AppError.unauthorized("Invalid credentials");

    const { password_hash, token_version, ...safeUser } = user;

    const isValid = await passwordUtil.comparePassword(password, password_hash);
    //if (!isValid) return res.status(401).json({ error: "Invalid credentials" });
    //if (!isValid) throw new AppError("Invalid credentials", 401);
    if (!isValid) throw AppError.unauthorized("Invalid credentials");

    const { accessToken, refreshToken } = jwtUtil.generateTokens(user);

    res
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .json({
        user: safeUser,
        accessToken,
      });
  } catch (err) {
    //return res.status(401).json({ error: "Invalid credentials" });
    handleControllerError(err, res);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { accessToken, refreshToken: newRefreshToken } =
      jwtUtil.generateTokens(req.user);

    res
      .cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .json({ accessToken });
  } catch (err) {
    //return res.status(401).json({ error: "Invalid refresh token" });
    handleControllerError(err, res);
  }
};

exports.logoutUser = async (req, res) => {
  try {
    await usersDao.incrementTokenVersion(req.user.id);

    res
      .clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({ message: "Logged out successfully" });
  } catch (err) {
    //res.status(500).json({ error: "Server error" });
    handleControllerError(err, res);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await usersDao.findById(req.user.id);
    //if (!user) return res.status(404).json({ error: "User not found" });
    //if (!user) throw new AppError("User not found", 404);
    if (!user) throw AppError.notFound("User not found");

    const { password_hash, token_version, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    //return res.status(404).json({ error: "User not found" });
    handleControllerError(err, res);
  }
};

exports.changeUsername = async (req, res) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername)
      //return res.status(400).json({ error: "Missing new username" });
      //throw new AppError("Missing new username", 400);
      throw AppError.badRequest("Missing new username");

    const user = await usersDao.findById(req.user.id);
    //if (!user) return res.status(404).json({ error: "User not found" });
    //if (!user) throw new AppError("User not found", 404);
    if (!user) throw AppError.notFound("User not found");

    const usernameErrors = UsernameValidator.validateChange(
      user.username,
      newUsername,
    );
    if (usernameErrors.length > 0)
      //return res.status(400).json({ errors: usernameErrors });
      throw AppError.validation(usernameErrors);

    const newUser = await usersDao.updateUsername(req.user.id, newUsername);

    //if (!user) return res.status(404).json({ error: "User not found" });
    //if (!newUser) throw new AppError("User not found", 404);
    if (!newUser) throw AppError.notFound("User not found");
    const { password_hash, token_version, ...safeUser } = newUser;

    res
      .status(200)
      .json({ message: "Username changed successfully", user: safeUser });
  } catch (err) {
    // if (err.code === "23505") {
    //   return res.status(409).json({ error: "Username already exists" });
    // }

    // res.status(500).json({ error: "Server error" });
    handleControllerError(err, res);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      //return res.status(400).json({ error: "Missing passwords" });
      //throw new AppError("Missing passwords", 400);
      throw AppError.badRequest("Missing passwords");

    const user = await usersDao.findById(req.user.id);
    //if (!user) return res.status(404).json({ error: "User not found" });
    //if (!user) throw new AppError("User not found", 404);
    if (!user) throw AppError.notFound("User not found");

    const valid = await passwordUtil.comparePassword(
      oldPassword,
      user.password_hash,
    );
    //if (!valid) return res.status(401).json({ error: "Old password incorrect" });
    //if (!valid) throw new AppError("Old password incorrect", 401);
    if (!valid) throw AppError.unauthorized("Old password incorrect");

    const passwordErrors = PasswordValidator.validateChange(
      oldPassword,
      newPassword,
      user.username,
    );
    if (passwordErrors.length > 0)
      //return res.status(400).json({ errors: passwordErrors });
      throw AppError.validation(passwordErrors);

    const newHash = await passwordUtil.hashPassword(newPassword);
    await usersDao.updatePassword(user.id, newHash);
    await usersDao.incrementTokenVersion(user.id);

    res
      .status(200)
      .clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({ message: "Password changed successfully" });
  } catch (err) {
    //res.status(500).json({ error: "Server error" });
    handleControllerError(err, res);
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const deleted = await usersDao.deleteUser(req.user.id);
    //if (deleted === 0) return res.status(404).json({ error: "User not found" });
    //if (deleted === 0) throw new AppError("User not found", 404);
    if (deleted === 0) throw AppError.notFound("User not found");

    res
      .clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({ message: "Account deleted successfully" });
  } catch (err) {
    //return res.status(404).json({ error: "User not found" });
    handleControllerError(err, res);
  }
};
