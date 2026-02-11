const express = require("express");
const router = express.Router();
const userThemesController = require("../controllers/user-themes.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.get("/", authenticate, userThemesController.getUserThemes);
router.post("/", authenticate, userThemesController.buyTheme);

module.exports = router;
