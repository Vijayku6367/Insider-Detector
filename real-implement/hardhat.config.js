require("@nomicfoundation/hardhat-toolbox");
require("@fhenixprotocol/hardhat-fhenix");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Fhenix testnet
    fhenix: {
      url: "https://api.testnet.fhenix.zone:7747",
      chainId: 8008135,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    // Local Fhenix devnet
    local: {
      url: "http://localhost:42069",
      chainId: 54321,
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
    // Sepolia for testing (without FHE)
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  fhenix: {
    // Configuration for FHE operations
    enableFHE: true,
    fheLibraryPath: "./node_modules/@fhenixprotocol/contracts"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
