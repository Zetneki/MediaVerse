const { verifyToken } = require("../utils/jwt.util");
const usersDao = require("../dao/users.dao");

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    const user = await usersDao.findById(payload.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (payload.tokenVersion !== user.token_version) {
      return res.status(401).json({ error: "Session expired" });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
