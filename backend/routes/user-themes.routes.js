const express = require("express");
const router = express.Router();
const userThemesController = require("../controllers/user-themes.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.get("/get", authenticate, userThemesController.getUserThemes);
router.post("/buy", authenticate, userThemesController.buyTheme);

module.exports = router;
