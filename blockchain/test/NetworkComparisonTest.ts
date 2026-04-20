import { ethers } from "ethers";
import { expect } from "chai";
import * as dotenv from "dotenv";
dotenv.config();

const OWNER_PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY!;
const LOCALHOST_RPC = process.env.LOCALHOST_RPC_URL!;
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL!;
const LOCALHOST_TOKEN = process.env.LOCALHOST_TOKEN_CONTRACT_ADDRESS!;
const LOCALHOST_MARKETPLACE =
  process.env.LOCALHOST_MARKETPLACE_CONTRACT_ADDRESS!;
const SEPOLIA_TOKEN = process.env.SEPOLIA_TOKEN_CONTRACT_ADDRESS!;
const SEPOLIA_MARKETPLACE = process.env.SEPOLIA_MARKETPLACE_CONTRACT_ADDRESS!;

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function rewardUser(address, uint256) external",
  "function totalSupply() view returns (uint256)",
];

const MARKETPLACE_ABI = [
  "function hasTheme(address, string) view returns (bool)",
  "function themePrices(string) view returns (uint256)",
  "function updateThemePrice(string, uint256) external",
];

describe("Network Comparison: Localhost vs Sepolia", function () {
  this.timeout(120_000);

  let localProvider: ethers.JsonRpcProvider;
  let sepoliaProvider: ethers.JsonRpcProvider;

  let localToken: ethers.Contract;
  let sepoliaToken: ethers.Contract;
  let localMarketplace: ethers.Contract;
  let sepoliaMarketplace: ethers.Contract;

  before(async () => {
    localProvider = new ethers.JsonRpcProvider(LOCALHOST_RPC);
    sepoliaProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC);

    const localSigner = new ethers.Wallet(OWNER_PRIVATE_KEY, localProvider);
    const sepoliaSigner = new ethers.Wallet(OWNER_PRIVATE_KEY, sepoliaProvider);

    localToken = new ethers.Contract(LOCALHOST_TOKEN, TOKEN_ABI, localSigner);
    sepoliaToken = new ethers.Contract(SEPOLIA_TOKEN, TOKEN_ABI, sepoliaSigner);
    localMarketplace = new ethers.Contract(
      LOCALHOST_MARKETPLACE,
      MARKETPLACE_ABI,
      localSigner
    );
    sepoliaMarketplace = new ethers.Contract(
      SEPOLIA_MARKETPLACE,
      MARKETPLACE_ABI,
      sepoliaSigner
    );
  });

  // --- 1. Chain ID ---
  describe("Chain ID verification", () => {
    it("Localhost chain ID = 1337 (Hardhat)", async () => {
      const network = await localProvider.getNetwork();
      expect(network.chainId).to.equal(1337n);
    });

    it("Sepolia chain ID = 11155111", async () => {
      const network = await sepoliaProvider.getNetwork();
      expect(network.chainId).to.equal(11155111n);
    });
  });

  // --- 2. Block time ---
  describe("Block time", () => {
    it("Localhost: Hardhat only mines blocks on transactions (no new blocks within 3 seconds)", async () => {
      const b1 = await localProvider.getBlock("latest");
      await new Promise((r) => setTimeout(r, 3000));
      const b2 = await localProvider.getBlock("latest");
      const diff = b2!.number - b1!.number;
      console.log(`[Localhost] Block diff in 3s: ${diff}`);
      expect(diff).to.equal(0);
    });

    it("Sepolia: ~12 second block time (Proof of Stake)", async () => {
      const b1 = await sepoliaProvider.getBlock("latest");
      await new Promise((r) => setTimeout(r, 15000));
      const b2 = await sepoliaProvider.getBlock("latest");
      const blocksDiff = b2!.number - b1!.number;
      const timeDiff = b2!.timestamp - b1!.timestamp;
      const avg = blocksDiff > 0 ? timeDiff / blocksDiff : null;
      console.log(`[Sepolia] Blocks: ${blocksDiff}, Avg block time: ${avg}s`);
      expect(avg).to.be.greaterThan(8).and.lessThan(35);
    });
  });

  // --- 3. Read latency ---
  describe("Read latency", () => {
    async function measureLatency(fn: () => Promise<any>, iterations = 10) {
      const times: number[] = [];
      for (let i = 0; i < iterations; i++) {
        const t0 = Date.now();
        await fn();
        times.push(Date.now() - t0);
      }
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      return { avg, min: Math.min(...times), max: Math.max(...times) };
    }

    it("Token balanceOf — Localhost < 50ms average", async () => {
      const { avg, min, max } = await measureLatency(() =>
        localToken.balanceOf(ethers.ZeroAddress)
      );
      console.log(
        `[Localhost] Token balanceOf — avg: ${avg.toFixed(
          1
        )}ms, min: ${min}ms, max: ${max}ms`
      );
      expect(avg).to.be.lessThan(50);
    });

    it("Token balanceOf — Sepolia performance measurement", async () => {
      const { avg, min, max } = await measureLatency(() =>
        sepoliaToken.balanceOf(ethers.ZeroAddress)
      );
      console.log(
        `[Sepolia] Token balanceOf — avg: ${avg.toFixed(
          1
        )}ms, min: ${min}ms, max: ${max}ms`
      );
    });

    it("Marketplace hasTheme — Localhost < 50ms average", async () => {
      const { avg, min, max } = await measureLatency(() =>
        localMarketplace.hasTheme(ethers.ZeroAddress, "indigo")
      );
      console.log(
        `[Localhost] Marketplace hasTheme — avg: ${avg.toFixed(
          1
        )}ms, min: ${min}ms, max: ${max}ms`
      );
      expect(avg).to.be.lessThan(50);
    });

    it("Marketplace hasTheme — Sepolia performance measurement", async () => {
      const { avg, min, max } = await measureLatency(() =>
        sepoliaMarketplace.hasTheme(ethers.ZeroAddress, "indigo")
      );
      console.log(
        `[Sepolia] Marketplace hasTheme — avg: ${avg.toFixed(
          1
        )}ms, min: ${min}ms, max: ${max}ms`
      );
    });
  });

  // --- 4. Gas estimation ---
  describe("Gas estimation", () => {
    it("rewardUser gas — localhost vs sepolia comparison", async () => {
      const dummyUser = "0x000000000000000000000000000000000000dEaD";
      const amount = ethers.parseEther("10");

      const [localGas, sepoliaGas] = await Promise.all([
        localToken.rewardUser.estimateGas(dummyUser, amount),
        sepoliaToken.rewardUser.estimateGas(dummyUser, amount),
      ]);

      console.log(
        `[Gas] rewardUser — Localhost: ${localGas}, Sepolia: ${sepoliaGas}`
      );

      // Ugyanaz a bytecode → gas logikailag megegyezik
      const diff = Number(
        localGas > sepoliaGas ? localGas - sepoliaGas : sepoliaGas - localGas
      );
      expect(diff).to.be.lessThan(5000);
    });

    it("updateThemePrice gas — localhost vs sepolia comparison", async () => {
      const [localGas, sepoliaGas] = await Promise.all([
        localMarketplace.updateThemePrice.estimateGas(
          "indigo",
          ethers.parseEther("200")
        ),
        sepoliaMarketplace.updateThemePrice.estimateGas(
          "indigo",
          ethers.parseEther("200")
        ),
      ]);

      console.log(
        `[Gas] updateThemePrice — Localhost: ${localGas}, Sepolia: ${sepoliaGas}`
      );

      const diff = Number(
        localGas > sepoliaGas ? localGas - sepoliaGas : sepoliaGas - localGas
      );
      expect(diff).to.be.lessThan(5000);
    });

    it("themePrices query — christmas price is 250 MVT on both localhost and Sepolia", async () => {
      const [localPrice, sepoliaPrice] = await Promise.all([
        localMarketplace.themePrices("christmas"),
        sepoliaMarketplace.themePrices("christmas"),
      ]);

      console.log(
        `[Price] christmas — Localhost: ${ethers.formatEther(
          localPrice
        )} MVT, Sepolia: ${ethers.formatEther(sepoliaPrice)} MVT`
      );

      expect(localPrice).to.equal(250n * 10n ** 18n);
      expect(sepoliaPrice).to.equal(250n * 10n ** 18n);
    });
  });
});
