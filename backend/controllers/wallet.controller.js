const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const walletService = require("../services/wallet.service");

const connectWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const { walletAddress, signature } = req.body;
    if (!walletAddress) throw AppError.badRequest("Missing wallet address");
    if (!signature) throw AppError.badRequest("Missing signature");

    const connectedWallet = await walletService.connectWallet(
      userId,
      walletAddress,
      signature,
    );

    res.status(200).json({
      message: "Wallet connected successfully",
      walletAddress: connectedWallet,
    });
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const disconnectWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    await walletService.disconnectWallet(userId);

    res.status(200).json({ message: "Wallet disconnected successfully" });
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const getWalletInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const walletInfo = await walletService.getWalletInfo(userId);

    res.status(200).json(walletInfo);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

module.exports = {
  connectWallet,
  disconnectWallet,
  getWalletInfo,
};
