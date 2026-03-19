import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MediaVerseTokenModule = buildModule("MediaVerseTokenModule", (m) => {
  const mediaVerseToken = m.contract("MediaVerseToken");

  const backendWallet = m.getParameter(
    "backendWallet",
    process.env.BACKEND_WALLET_ADDRESS || ""
  );

  if (backendWallet) {
    m.call(mediaVerseToken, "transferOwnership", [backendWallet]);
  }

  return { mediaVerseToken };
});

export default MediaVerseTokenModule;
