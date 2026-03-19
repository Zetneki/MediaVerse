import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  const backendAddress = process.env.BACKEND_WALLET_ADDRESS;

  if (!backendAddress) {
    throw new Error("BACKEND_WALLET_ADDRESS not found in .env");
  }

  console.log("Funding backend wallet:", backendAddress);

  const tx = await deployer.sendTransaction({
    to: backendAddress,
    value: ethers.parseEther("10.0"),
  });

  await tx.wait();
  console.log("Backend wallet funded with 10 ETH");

  const balance = await ethers.provider.getBalance(backendAddress);
  console.log("Backend wallet balance:", ethers.formatEther(balance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
