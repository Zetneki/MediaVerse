import { expect } from "chai";
import hre from "hardhat";

const TOKEN = 10n ** 18n;

describe("MediaVerseToken", function () {
  let mvt: any;
  let owner: any;
  let user: any;
  let attacker: any;

  beforeEach(async function () {
    [owner, user, attacker] = await hre.ethers.getSigners();
    mvt = await hre.ethers.deployContract("MediaVerseToken");
    await mvt.waitForDeployment();
  });

  it("Should deploy with correct supply", async function () {
    const totalSupply = 1_000_000n * TOKEN;

    const supply = await mvt.totalSupply();
    expect(supply).to.equal(totalSupply);
  });

  it("Should reward users", async function () {
    const rewardAmount = 100n * TOKEN;

    const tx = await mvt.rewardUser(user.address, rewardAmount);

    const balance = await mvt.balanceOf(user.address);
    expect(balance).to.equal(rewardAmount);

    await expect(tx)
      .to.emit(mvt, "UserRewarded")
      .withArgs(user.address, rewardAmount, "");
  });

  it("Should revert if rewarding with invalid amount", async function () {
    const rewardUser = mvt.rewardUser(user.address, 0);
    await expect(rewardUser).to.be.revertedWith(
      "Amount must be greater than 0"
    );
  });

  it("Should revert if rewarding with invalid user address", async function () {
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const rewardUser = mvt.rewardUser(zeroAddress, 100n * TOKEN);
    await expect(rewardUser).to.be.revertedWith("Invalid user address");
  });

  it("Only owner can reward users", async function () {
    const attackerRewards = mvt
      .connect(attacker)
      .rewardUser(user.address, 100n * TOKEN);
    await expect(attackerRewards).to.be.revertedWithCustomError(
      mvt,
      "OwnableUnauthorizedAccount"
    );
  });

  it("Should get the user's balance with correct amount", async function () {
    await mvt.rewardUser(user.address, 100n * TOKEN);

    const balance = await mvt.balanceOf(user.address);
    expect(balance).to.equal(100n * TOKEN);
  });

  it("Should increase total supply after rewarding", async function () {
    const supplyBefore = await mvt.totalSupply();
    const rewardAmount = 100n * TOKEN;

    await mvt.rewardUser(user.address, rewardAmount);

    const supplyAfter = await mvt.totalSupply();
    expect(supplyAfter).to.equal(supplyBefore + rewardAmount);
  });
});
