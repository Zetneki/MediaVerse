const { verifyAccessToken, verifyRefreshToken } = require("../utils/jwt.util");
const usersDao = require("../dao/users.dao");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const payload = verifyAccessToken(token);

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

const validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" });
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await usersDao.findById(payload.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (payload.tokenVersion !== user.token_version) {
      return res.status(401).json({ error: "Session expired" });
    }

    const {
      password_hash,
      wallet_address,
      wallet_verified,
      created_at,
      ...safeUser
    } = user;
    req.user = safeUser;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

module.exports = {
  authenticate,
  validateRefreshToken,
};
