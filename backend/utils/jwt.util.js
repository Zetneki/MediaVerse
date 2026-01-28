const jwt = require("jsonwebtoken");
const usersDao = require("../dao/users.dao");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, tokenVersion: user.token_version },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  if (!authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Invalid authorization header" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await usersDao.findById(payload.id);

    if (!user) return res.status(401).json({ error: "User not found" });

    if (payload.tokenVersion !== user.token_version)
      return res.status(401).json({ error: "Session expired" });

    req.user = payload;

    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
