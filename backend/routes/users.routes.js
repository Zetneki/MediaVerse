const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  loginLimiter,
  registerLimiter,
} = require("../middlewares/rate-limit.middleware");

router.post("/register", registerLimiter, usersController.registerUser);
router.post("/login", loginLimiter, usersController.loginUser);

//protected routes
router.get("/me", authenticate, usersController.getUser);
router.put("/change-username", authenticate, usersController.changeUsername);
router.put("/change-password", authenticate, usersController.changePassword);
router.delete("/me", authenticate, usersController.deleteAccount);

module.exports = router;
