// backend/services/blockchain.service.js

const { ethers } = require("ethers");
const { AppError } = require("../middlewares/error-handler.middleware");

class BlockchainService {
  constructor() {
    //Provider (RPC connection)
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    //Backend wallet (pay gas)
    this.backendWallet = new ethers.Wallet(
      process.env.BACKEND_WALLET_PRIVATE_KEY,
      this.provider,
    );

    //Token contract ABI
    const TOKEN_ABI = [
      "function rewardUser(address user, uint256 amount) external",
      "function balanceOf(address account) view returns (uint256)",
    ];

    //Marketplace contract ABI
    const MARKETPLACE_ABI = [
      "function purchaseThemeForWithPermit(address user, string themeId, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external",
      "function hasTheme(address user, string themeId) view returns (bool)",
      "function themePrices(string themeId) view returns (uint256)",
    ];

    //Contract instances
    this.tokenContract = new ethers.Contract(
      process.env.TOKEN_CONTRACT_ADDRESS,
      TOKEN_ABI,
      this.backendWallet,
    );

    this.marketplaceContract = new ethers.Contract(
      process.env.MARKETPLACE_CONTRACT_ADDRESS,
      MARKETPLACE_ABI,
      this.backendWallet,
    );
  }

  //Reward user tokens (task completion)
  async rewardUser(userAddress, tokenAmount) {
    try {
      const amountInWei = ethers.parseEther(tokenAmount.toString());

      const tx = await this.tokenContract.rewardUser(userAddress, amountInWei);
      const receipt = await tx.wait();

      return receipt.hash;
    } catch (err) {
      throw AppError.badRequest("Blockchain reward error");
    }
  }

  //Purchase theme (gasless via permit)
  async purchaseThemeForUser(userAddress, themeId, deadline, v, r, s) {
    try {
      const tx = await this.marketplaceContract.purchaseThemeForWithPermit(
        userAddress,
        themeId,
        deadline,
        v,
        r,
        s,
      );

      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      throw AppError.badRequest("Failed to purchase theme");
    }
  }

  //Check if user has theme
  async hasTheme(userAddress, themeId) {
    try {
      return await this.marketplaceContract.hasTheme(userAddress, themeId);
    } catch (error) {
      throw AppError.badRequest("Could not check theme ownership");
    }
  }
}

module.exports = new BlockchainService();
