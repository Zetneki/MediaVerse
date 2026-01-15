const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const { verifyToken } = require("../utils/jwt.util");

router.post("/register", usersController.registerUser);
router.post("/login", usersController.loginUser);

//protected routes
router.get("/get/:id", verifyToken, usersController.getUser);
router.post("/change-password", verifyToken, usersController.changePassword);
router.delete("/delete/:id", verifyToken, usersController.deleteAccount);

module.exports = router;
