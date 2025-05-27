/**
 * Hardhat配置文件
 * 用于BNB链测试网和主网的智能合约部署
 */

require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('dotenv').config();

// 默认使用环境变量中的私钥，如果不存在则使用示例私钥（仅用于开发）
const defaultPrivateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const bscScanApiKey = process.env.BSCSCAN_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // 本地开发网络
    hardhat: {
      chainId: 31337
    },
    // BNB链测试网
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [defaultPrivateKey]
    },
    // BNB链主网
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 5000000000,
      accounts: [defaultPrivateKey]
    }
  },
  // BscScan API配置，用于合约验证
  etherscan: {
    apiKey: {
      bscTestnet: bscScanApiKey,
      bsc: bscScanApiKey
    }
  },
  // 路径配置
  paths: {
    sources: "./src/contracts",
    tests: "./src/tests",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  // Mocha测试配置
  mocha: {
    timeout: 40000
  }
};
