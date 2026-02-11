const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const {
  authenticate,
  validateRefreshToken,
} = require("../middlewares/auth.middleware");
const {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} = require("../middlewares/rate-limit.middleware");

router.post("/register", registerLimiter, usersController.registerUser);
router.post("/login", loginLimiter, usersController.loginUser);
router.post(
  "/refresh",
  refreshLimiter,
  validateRefreshToken,
  usersController.refreshToken,
);

//protected routes
router.get("/me", authenticate, usersController.getUser);
router.post("/logout", authenticate, usersController.logoutUser);
router.put("/active-mode", authenticate, usersController.activeMode);
router.put("/active-theme", authenticate, usersController.activeTheme);
router.put("/change-username", authenticate, usersController.changeUsername);
router.put("/change-password", authenticate, usersController.changePassword);
router.delete("/me", authenticate, usersController.deleteAccount);

module.exports = router;
