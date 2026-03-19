const { ethers } = require("ethers");

const wallet = ethers.Wallet.createRandom();

console.log("=== Backend Wallet ===");
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("\n  SAVE THIS IN .env");
