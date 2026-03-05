const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.post("/connect", walletController.connectWallet);
router.delete("/disconnect", walletController.disconnectWallet);
router.get("/", walletController.getWalletInfo);

module.exports = router;
