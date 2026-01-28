const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const rateLimit = require("../utils/rate-limit.util");
const { verifyToken } = require("../utils/jwt.util");

router.post(
  "/register",
  rateLimit.registerLimiter,
  usersController.registerUser,
);
router.post("/login", rateLimit.loginLimiter, usersController.loginUser);

//protected routes
router.get("/me", verifyToken, usersController.getUser);
router.put("/change-username", verifyToken, usersController.changeUsername);
router.put("/change-password", verifyToken, usersController.changePassword);
router.delete("/me", verifyToken, usersController.deleteAccount);

module.exports = router;
