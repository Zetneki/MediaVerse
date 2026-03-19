const { ethers } = require("ethers");
const nodemailer = require("nodemailer");

const LOW_BALANCE_THRESHOLD = 1; // ETH

//const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mediaverse.com';
// let lastAlertSent = 0;
// const ALERT_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

// async function sendAlert(ethBalance) {
//   const now = Date.now();

//   // Don't spam (max 1 email / 24h)
//   if (now - lastAlertSent < ALERT_COOLDOWN) {
//     console.log('Alert cooldown active, skipping email...');
//     return;
//   }

//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });

//     await transporter.sendMail({
//       from: 'MediaVerse Backend <noreply@mediaverse.com>',
//       to: ADMIN_EMAIL,
//       subject: 'Backend Wallet Low Balance Alert',
//       html: `
//         <h2>Backend Wallet Low Balance</h2>
//         <p><strong>Current balance:</strong> ${ethBalance.toFixed(4)} ETH</p>
//         <p><strong>Threshold:</strong> ${LOW_BALANCE_THRESHOLD} ETH</p>
//         <p><strong>Action required:</strong> Refund backend wallet</p>
//         <p><strong>Wallet:</strong> ${process.env.BACKEND_WALLET_ADDRESS}</p>
//         <hr>
//         <p><small>MediaVerse Backend Monitor</small></p>
//       `
//     });

//     lastAlertSent = now;
//     console.log('Alert email sent to', ADMIN_EMAIL);
//   } catch (error) {
//     console.error('Failed to send email:', error.message);
//   }
// }

/**
 * Check backend wallet balance before blockchain operations
 * Logs warning if balance is low but does NOT block the request
 */
async function checkWalletBalance(req, res, next) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const backendWallet = process.env.BACKEND_WALLET_ADDRESS;

    const balance = await provider.getBalance(backendWallet);
    const ethBalance = parseFloat(ethers.formatEther(balance));

    const timestamp = new Date().toISOString();

    if (ethBalance < LOW_BALANCE_THRESHOLD) {
      console.warn(`[${timestamp}] LOW BALANCE! ${ethBalance.toFixed(4)} ETH`);
      //await sendAlert(ethBalance);
    }

    next();
  } catch (error) {
    console.error("Wallet balance check error:", error);
    next();
  }
}

module.exports = { checkWalletBalance };
