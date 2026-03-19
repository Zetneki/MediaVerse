const express = require("express");
const router = express.Router();
const userThemesController = require("../controllers/user-themes.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  checkWalletBalance,
} = require("../middlewares/check-wallet-balance.middleware");

router.use(authenticate);

router.get("/", userThemesController.getUserThemes);
router.post("/", checkWalletBalance, userThemesController.buyTheme);

module.exports = router;
