const express = require("express");
const router = express.Router();
const userThemesController = require("../controllers/user-themes.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", userThemesController.getUserThemes);
router.post("/", userThemesController.buyTheme);

module.exports = router;
