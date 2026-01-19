const passwordUtil = require("../utils/password.util");
const jwtUtil = require("../utils/jwt.util");
const usersDao = require("../dao/users.dao");
const { validatePassword } = require("../utils/password-validation.util");

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing username or password" });

  const passwordErrors = validatePassword(password, username);
  if (passwordErrors.length > 0)
    return res.status(400).json({ errors: passwordErrors });

  const hash = await passwordUtil.hashPassword(password);
  try {
    const user = await usersDao.createUser(username, hash);
    res.status(201).json(user);
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

  const { password_hash, ...safeUser } = user;

  const isValid = await passwordUtil.comparePassword(password, password_hash);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwtUtil.generateToken(safeUser);
  res.json({
    token,
    user: safeUser,
  });
};

exports.getUser = async (req, res) => {
  const user = await usersDao.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { password_hash, ...safeUser } = user;
  res.json(safeUser);
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: "Missing passwords" });

  const user = await usersDao.findByUsername(req.user.username);
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await passwordUtil.comparePassword(
    oldPassword,
    user.password_hash
  );
  if (!valid) return res.status(400).json({ error: "Old password incorrect" });

  const newHash = await passwordUtil.hashPassword(newPassword);
  await usersDao.updatePassword(req.user.id, newHash);
  res.json({ message: "Password changed successfully" });
};

exports.deleteAccount = async (req, res) => {
  const deleted = await usersDao.deleteUser(req.user.id);
  if (deleted === 0) return res.status(404).json({ error: "User not found" });
  res.json({ message: "Account deleted successfully" });
};
