const { ethers } = require("ethers");
const walletDao = require("../dao/wallet.dao");
const usersDao = require("../dao/users.dao");
const { AppError } = require("../middlewares/error-handler.middleware");

/**
 * Connect wallet to user
 * @param {number} userId
 * @param {string} walletAddress
 * @param {ethers.SignatureLike} signature
 * @returns
 */
const connectWallet = async (userId, walletAddress, signature) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const isValid = await verifyWalletOwnership(walletAddress, signature, userId);
  if (!isValid) throw AppError.badRequest("Invalid wallet signature");

  const existingUser = await walletDao.getUserByWallet(walletAddress);
  if (existingUser && existingUser.id !== userId) {
    throw AppError.conflict("Wallet already connected to another user");
  }

  await walletDao.updateWallet(userId, {
    walletAddress,
    walletVerified: true,
    walletLastVerified: new Date(),
  });

  return walletAddress;
};

/**
 * Disconnect wallet from user
 * @param {number} userId
 */
const disconnectWallet = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  await walletDao.updateWallet(userId, {
    walletAddress: null,
    walletVerified: false,
    walletLastVerified: null,
  });
};

/**
 * Ethereum signature verification
 * @param {*} walletAddress
 * @param {*} signature
 * @param {*} userId
 * @returns
 */
const verifyWalletOwnership = async (walletAddress, signature, userId) => {
  try {
    const message = `Connect wallet to MediaVerse account ${userId}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (err) {
    //console.log(err);
    return false;
  }
};

const blockchainService = require("./blockchain.service");
const { get } = require("http");

/**
 * Get user connected wallet info
 * @param {*} userId
 * @returns
 */
const getWalletInfo = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const userWallet = user.wallet_address;
  await blockchainService.rewardUser(userWallet, 50);
  // const balance = await blockchainService.getTokenBalance(user.wallet_address);
  // console.log("User token balance:", balance);
  const hasTheme = await blockchainService.hasTheme(user.wallet_address, "asd");
  console.log("User has theme:", hasTheme);

  return {
    walletAddress: user.wallet_address,
    walletVerified: user.wallet_verified,
    walletLastVerified: user.wallet_last_verified,
  };
};

module.exports = {
  connectWallet,
  disconnectWallet,
  verifyWalletOwnership,
  getWalletInfo,
};
