const passwordUtil = require("../utils/password.util");
const jwtUtil = require("../utils/jwt.util");
const usersDao = require("../dao/users.dao");

//TODO: tobb error handle es kod javitasa szepitese

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing username or password" });
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

  const isValid = await passwordUtil.comparePassword(
    password,
    user.password_hash
  );
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwtUtil.generateToken(user);
  res.json({ token });
};

exports.getUser = async (req, res) => {
  const user = await usersDao.findById(req.user.id);
  const { password_hash, ...safeUser } = user;
  res.json(safeUser);
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: "Missing passwords" });

  const user = await usersDao.findByUsername(req.user.username);

  const valid = await passwordUtil.comparePassword(
    oldPassword,
    user.password_hash
  );
  if (!valid)
    return res.status(400).json({ message: "Old password incorrect" });

  const newHash = await passwordUtil.hashPassword(newPassword);
  await usersDao.updatePassword(req.user.id, newHash);
  res.json({ message: "Password changed successfully" });
};

exports.deleteAccount = async (req, res) => {
  await usersDao.deleteUser(req.user.id);
  if (result.rowCount === 0)
    return res.status(404).json({ error: "User not found" });
  res.json({ message: "Account deleted successfully" });
};
