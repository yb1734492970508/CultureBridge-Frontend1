/**
 * 区块链网络和合约配置
 * 支持本地Hardhat网络、BNB链测试网和主网
 */

const contracts = {
  // 本地Hardhat网络
  hardhat: {
    networkName: "Hardhat本地网络",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://localhost:8545",
    CultureToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    AIRegistry: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    CulturalNFT: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    TranslationMarket: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    AICapabilityNFT: "",
    AIRequest: ""
  },
  
  // BNB链测试网
  bscTestnet: {
    networkName: "BNB Chain Testnet",
    chainId: 97,
    blockExplorer: "https://testnet.bscscan.com",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    CultureToken: "",
    AIRegistry: "",
    CulturalNFT: "",
    TranslationMarket: "",
    AICapabilityNFT: "",
    AIRequest: ""
  },
  
  // BNB链主网
  bscMainnet: {
    networkName: "BNB Chain Mainnet",
    chainId: 56,
    blockExplorer: "https://bscscan.com",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    CultureToken: "",
    AIRegistry: "",
    CulturalNFT: "",
    TranslationMarket: "",
    AICapabilityNFT: "",
    AIRequest: ""
  }
};

module.exports = contracts;
