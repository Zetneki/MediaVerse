const usersDao = require("../dao/users.dao");
const walletDao = require("../dao/wallet.dao");

const checkWalletExpiry = async (req, res, next) => {
  if (process.env.NODE_ENV === "test") return next();
  try {
    const userId = req.user?.id;
    if (!userId) return next();

    const user = await usersDao.findById(userId);
    if (!user || !user.wallet_verified || !user.wallet_address) {
      return next();
    }

    //Check expiry (30 days)
    if (user.wallet_last_verified) {
      const lastVerified = new Date(user.wallet_last_verified);
      const now = new Date();
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysSince = Math.floor(
        (now.getTime() - lastVerified.getTime()) / msPerDay,
      );

      if (daysSince >= 30) {
        await walletDao.updateWallet(userId, {
          walletAddress: null,
          walletVerified: false,
          walletLastVerified: null,
        });

        // console.log(
        //   `Wallet expired for user ${userId} after ${daysSince} days`,
        // );
        return res.status(401).json({
          error: "Wallet expired. Please connect your wallet again.",
          code: "WALLET_EXPIRED",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Wallet expiry check error:", error);
    next();
  }
};

module.exports = { checkWalletExpiry };
