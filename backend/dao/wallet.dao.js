const db = require("../config/db");

async function updateWallet(userId, walletData) {
  const { walletAddress, walletVerified, walletLastVerified } = walletData;

  const res = await db.query(
    `UPDATE user_profile 
    SET 
      wallet_address = $1, 
      wallet_verified = $2, 
      wallet_last_verified = $3
    WHERE id = $4
    RETURNING *`,
    [walletAddress, walletVerified, walletLastVerified, userId],
  );

  return res.rows[0];
}

async function getUserByWallet(walletAddress) {
  const res = await db.query(
    `SELECT id, username, wallet_address, wallet_verified 
    FROM user_profile 
    WHERE wallet_address = $1`,
    [walletAddress],
  );

  return res.rows[0];
}

module.exports = {
  updateWallet,
  getUserByWallet,
};
