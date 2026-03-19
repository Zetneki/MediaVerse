import { expect } from "chai";
import hre from "hardhat";

const TOKEN = 10n ** 18n;

describe("ThemeMarketplace", function () {
  let mvt: any;
  let themeMarketplace: any;
  let owner: any;
  let user: any;
  let attacker: any;

  beforeEach(async function () {
    [owner, user, attacker] = await hre.ethers.getSigners();
    mvt = await hre.ethers.deployContract("MediaVerseToken");
    await mvt.waitForDeployment();

    themeMarketplace = await hre.ethers.deployContract("ThemeMarketplace", [
      await mvt.getAddress(),
    ]);
    await themeMarketplace.waitForDeployment();
  });

  it("Should deploy with correct token address", async function () {
    const tokenAddress = await themeMarketplace.token();
    expect(tokenAddress).to.equal(await mvt.getAddress());
  });

  it("Should purchase theme for user using permit (gasless for user)", async function () {
    //1. Reward user tokens
    await mvt.rewardUser(user.address, 200n * TOKEN);

    const price = 100n * TOKEN;
    const deadline = hre.ethers.MaxUint256;

    //2. User signs permit (off-chain)
    const nonce = await mvt.nonces(user.address);
    const name = await mvt.name();
    const version = "1";
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const tokenAddress = await mvt.getAddress();
    const marketplaceAddress = await themeMarketplace.getAddress();

    const domain = {
      name,
      version,
      chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const values = {
      owner: user.address,
      spender: marketplaceAddress,
      value: price,
      nonce: nonce,
      deadline: deadline,
    };

    const signature = await user.signTypedData(domain, types, values);
    const { v, r, s } = hre.ethers.Signature.from(signature);

    //3. Backend calls permit function (he gives the money)
    await themeMarketplace.purchaseThemeForWithPermit(
      user.address,
      "christmas",
      deadline,
      v,
      r,
      s
    );

    //4. Check
    const hasTheme = await themeMarketplace.hasTheme(user.address, "christmas");
    expect(hasTheme).to.be.true;

    const balance = await mvt.balanceOf(user.address);
    expect(balance).to.equal(100n * TOKEN);
  });

  it("Should revert if theme does not exist (permit)", async function () {
    await mvt.rewardUser(user.address, 200n * TOKEN);

    const price = 100n * TOKEN;
    const deadline = hre.ethers.MaxUint256;
    const nonce = await mvt.nonces(user.address);
    const name = await mvt.name();
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const tokenAddress = await mvt.getAddress();
    const marketplaceAddress = await themeMarketplace.getAddress();

    const domain = {
      name,
      version: "1",
      chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const values = {
      owner: user.address,
      spender: marketplaceAddress,
      value: price,
      nonce: nonce,
      deadline: deadline,
    };

    const signature = await user.signTypedData(domain, types, values);
    const { v, r, s } = hre.ethers.Signature.from(signature);

    await expect(
      themeMarketplace.purchaseThemeForWithPermit(
        user.address,
        "invalid_theme",
        deadline,
        v,
        r,
        s
      )
    ).to.be.revertedWith("Theme does not exist");
  });

  it("Should revert if insufficient token balance (permit)", async function () {
    //User has 0 tokens
    const price = 100n * TOKEN;
    const deadline = hre.ethers.MaxUint256;
    const nonce = await mvt.nonces(user.address);
    const name = await mvt.name();
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const tokenAddress = await mvt.getAddress();
    const marketplaceAddress = await themeMarketplace.getAddress();

    const domain = {
      name,
      version: "1",
      chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const values = {
      owner: user.address,
      spender: marketplaceAddress,
      value: price,
      nonce: nonce,
      deadline: deadline,
    };

    const signature = await user.signTypedData(domain, types, values);
    const { v, r, s } = hre.ethers.Signature.from(signature);

    await expect(
      themeMarketplace.purchaseThemeForWithPermit(
        user.address,
        "christmas",
        deadline,
        v,
        r,
        s
      )
    ).to.be.revertedWith("Insufficient token balance");
  });

  it("Only owner can purchase theme for user (permit)", async function () {
    await mvt.rewardUser(user.address, 200n * TOKEN);

    const price = 100n * TOKEN;
    const deadline = hre.ethers.MaxUint256;
    const nonce = await mvt.nonces(user.address);
    const name = await mvt.name();
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const tokenAddress = await mvt.getAddress();
    const marketplaceAddress = await themeMarketplace.getAddress();

    const domain = {
      name,
      version: "1",
      chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const values = {
      owner: user.address,
      spender: marketplaceAddress,
      value: price,
      nonce: nonce,
      deadline: deadline,
    };

    const signature = await user.signTypedData(domain, types, values);
    const { v, r, s } = hre.ethers.Signature.from(signature);

    await expect(
      themeMarketplace
        .connect(attacker)
        .purchaseThemeForWithPermit(
          user.address,
          "christmas",
          deadline,
          v,
          r,
          s
        )
    ).to.be.revertedWithCustomError(
      themeMarketplace,
      "OwnableUnauthorizedAccount"
    );
  });

  it("Should revert if purchasing same theme twice (permit)", async function () {
    await mvt.rewardUser(user.address, 300n * TOKEN);

    const price = 100n * TOKEN;
    const deadline = hre.ethers.MaxUint256;
    let nonce = await mvt.nonces(user.address);
    const name = await mvt.name();
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const tokenAddress = await mvt.getAddress();
    const marketplaceAddress = await themeMarketplace.getAddress();

    const domain = {
      name,
      version: "1",
      chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    //First purchase
    let values = {
      owner: user.address,
      spender: marketplaceAddress,
      value: price,
      nonce: nonce,
      deadline: deadline,
    };

    let signature = await user.signTypedData(domain, types, values);
    let sig = hre.ethers.Signature.from(signature);

    await themeMarketplace.purchaseThemeForWithPermit(
      user.address,
      "christmas",
      deadline,
      sig.v,
      sig.r,
      sig.s
    );

    //Second purchase (nonce incremented)
    nonce = await mvt.nonces(user.address);
    values = {
      owner: user.address,
      spender: marketplaceAddress,
      value: price,
      nonce: nonce,
      deadline: deadline,
    };

    signature = await user.signTypedData(domain, types, values);
    sig = hre.ethers.Signature.from(signature);

    await expect(
      themeMarketplace.purchaseThemeForWithPermit(
        user.address,
        "christmas",
        deadline,
        sig.v,
        sig.r,
        sig.s
      )
    ).to.be.revertedWith("Theme already owned");
  });

  it("Should get user's themes", async function () {
    await mvt.rewardUser(user.address, 300n * TOKEN);

    //Purchase christmas
    let price = 100n * TOKEN;
    let deadline = hre.ethers.MaxUint256;
    let nonce = await mvt.nonces(user.address);
    const name = await mvt.name();
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const tokenAddress = await mvt.getAddress();
    const marketplaceAddress = await themeMarketplace.getAddress();

    const domain = {
      name,
      version: "1",
      chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    let values = {
      owner: user.address,
      spender: marketplaceAddress,
      value: price,
      nonce: nonce,
      deadline: deadline,
    };

    let signature = await user.signTypedData(domain, types, values);
    let sig = hre.ethers.Signature.from(signature);

    await themeMarketplace.purchaseThemeForWithPermit(
      user.address,
      "christmas",
      deadline,
      sig.v,
      sig.r,
      sig.s
    );

    //Purchase neon
    price = 150n * TOKEN;
    nonce = await mvt.nonces(user.address);
    values = {
      owner: user.address,
      spender: marketplaceAddress,
      value: price,
      nonce: nonce,
      deadline: deadline,
    };

    signature = await user.signTypedData(domain, types, values);
    sig = hre.ethers.Signature.from(signature);

    await themeMarketplace.purchaseThemeForWithPermit(
      user.address,
      "neon",
      deadline,
      sig.v,
      sig.r,
      sig.s
    );

    //Check ownership
    const themes = await themeMarketplace.getUserThemes(user.address, [
      "christmas",
      "neon",
      "halloween",
    ]);

    expect(themes[0]).to.be.true;
    expect(themes[1]).to.be.true;
    expect(themes[2]).to.be.false;
  });

  it("Should check if user owns a theme", async function () {
    await mvt.rewardUser(user.address, 200n * TOKEN);

    const price = 100n * TOKEN;
    const deadline = hre.ethers.MaxUint256;
    const nonce = await mvt.nonces(user.address);
    const name = await mvt.name();
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const tokenAddress = await mvt.getAddress();
    const marketplaceAddress = await themeMarketplace.getAddress();

    const domain = {
      name,
      version: "1",
      chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const values = {
      owner: user.address,
      spender: marketplaceAddress,
      value: price,
      nonce: nonce,
      deadline: deadline,
    };

    const signature = await user.signTypedData(domain, types, values);
    const { v, r, s } = hre.ethers.Signature.from(signature);

    await themeMarketplace.purchaseThemeForWithPermit(
      user.address,
      "christmas",
      deadline,
      v,
      r,
      s
    );

    const hasChristmas = await themeMarketplace.hasTheme(
      user.address,
      "christmas"
    );
    const hasNeon = await themeMarketplace.hasTheme(user.address, "neon");

    expect(hasChristmas).to.be.true;
    expect(hasNeon).to.be.false;
  });

  it("Should update theme price (owner only)", async function () {
    const newPrice = 250n * TOKEN;

    await themeMarketplace.updateThemePrice("christmas", newPrice);

    const price = await themeMarketplace.themePrices("christmas");
    expect(price).to.equal(newPrice);
  });

  it("Should revert if non-owner tries to update price", async function () {
    await expect(
      themeMarketplace
        .connect(attacker)
        .updateThemePrice("christmas", 250n * TOKEN)
    ).to.be.revertedWithCustomError(
      themeMarketplace,
      "OwnableUnauthorizedAccount"
    );
  });

  it("Should revert if new price is invalid", async function () {
    await expect(
      themeMarketplace.updateThemePrice("christmas", 0)
    ).to.be.revertedWith("Price must be greater than 0");
  });
});
