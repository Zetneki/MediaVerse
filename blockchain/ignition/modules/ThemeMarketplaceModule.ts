import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MediaVerseTokenModule from "./MediaVerseTokenModule";

const ThemeMarketplaceModule = buildModule("ThemeMarketplaceModule", (m) => {
  const { mediaVerseToken } = m.useModule(MediaVerseTokenModule);

  const themeMarketplace = m.contract("ThemeMarketplace", [mediaVerseToken]);

  const backendWallet = m.getParameter(
    "backendWallet",
    process.env.BACKEND_WALLET_ADDRESS || ""
  );

  if (backendWallet) {
    m.call(themeMarketplace, "transferOwnership", [backendWallet]);
  }

  return { themeMarketplace };
});

export default ThemeMarketplaceModule;
