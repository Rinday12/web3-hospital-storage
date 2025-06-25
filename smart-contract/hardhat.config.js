// hardhat.config.js

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Make sure you have dotenv installed and configured

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.24", // Or your desired Solidity version
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 300 (0x12c), // Sepolia's chain ID
    },
    // You might have other networks configured here too
  },
};