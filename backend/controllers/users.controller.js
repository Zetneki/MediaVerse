const passwordUtil = require("../utils/password.util");
const jwtUtil = require("../utils/jwt.util");
const usersDao = require("../dao/users.dao");
const { validateCredentials } = require("../utils/credentials-validation.util");
const { validateUsername } = require("../utils/username-validation.util");
const { validatePassword } = require("../utils/password-validation.util");

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing username or password" });

  const crendentialErrors = validateCredentials(password, username);
  if (crendentialErrors.length > 0)
    return res.status(400).json({ errors: crendentialErrors });

  const hash = await passwordUtil.hashPassword(password);
  try {
    await usersDao.createUser(username, hash);
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing username or password" });

  const user = await usersDao.findByUsername(username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const { password_hash, token_version, ...safeUser } = user;

  const isValid = await passwordUtil.comparePassword(password, password_hash);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwtUtil.generateToken(user);
  res.json({
    token,
    user: safeUser,
  });
};

exports.getUser = async (req, res) => {
  const user = await usersDao.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { password_hash, token_version, ...safeUser } = user;
  res.json(safeUser);
};

exports.changeUsername = async (req, res) => {
  const { newUsername } = req.body;
  if (!newUsername)
    return res.status(400).json({ error: "Missing new username" });

  const user = await usersDao.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const usernameErrors = validateUsername(user.username, newUsername);
  if (usernameErrors.length > 0)
    return res.status(400).json({ errors: usernameErrors });

  try {
    const user = await usersDao.updateUsername(req.user.id, newUsername);

    if (!user) return res.status(404).json({ error: "User not found" });
    const { password_hash, token_version, ...safeUser } = user;

    res
      .status(200)
      .json({ message: "Username changed successfully", user: safeUser });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Username already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: "Missing passwords" });

  const user = await usersDao.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await passwordUtil.comparePassword(
    oldPassword,
    user.password_hash,
  );
  if (!valid) return res.status(400).json({ error: "Old password incorrect" });

  if (oldPassword === newPassword)
    return res
      .status(400)
      .json({ error: "New password cannot be the same as the old one" });

  const passwordErrors = validatePassword(newPassword, req.user.username);
  if (passwordErrors.length > 0)
    return res.status(400).json({ errors: passwordErrors });

  try {
    const newHash = await passwordUtil.hashPassword(newPassword);
    await usersDao.updatePassword(user.id, newHash);
    await usersDao.incrementTokenVersion(user.id);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteAccount = async (req, res) => {
  const deleted = await usersDao.deleteUser(req.user.id);
  if (deleted === 0) return res.status(404).json({ error: "User not found" });
  res.json({ message: "Account deleted successfully" });
};
