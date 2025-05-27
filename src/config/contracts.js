/**
 * 区块链网络和合约配置
 * 支持BNB链主网和测试网环境
 */

// 网络配置
export const NETWORKS = {
  // BNB链主网
  MAINNET: {
    id: 56,
    name: "BNB Chain Mainnet",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    explorer: "https://bscscan.com",
    currencySymbol: "BNB",
    currencyName: "BNB"
  },
  // BNB链测试网
  TESTNET: {
    id: 97,
    name: "BNB Chain Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    explorer: "https://testnet.bscscan.com",
    currencySymbol: "tBNB",
    currencyName: "Test BNB"
  }
};

// 当前使用的网络
export const CURRENT_NETWORK = NETWORKS.TESTNET;

// 合约地址配置
export const CONTRACT_ADDRESSES = {
  // 测试网合约地址
  97: {
    CultureToken: "", // 待部署后填写
    AIRegistry: "",   // 待部署后填写
    CulturalNFT: "",  // 待部署后填写
    TranslationMarket: "" // 待部署后填写
  },
  // 主网合约地址
  56: {
    CultureToken: "", // 待主网部署后填写
    AIRegistry: "",   // 待主网部署后填写
    CulturalNFT: "",  // 待主网部署后填写
    TranslationMarket: "" // 待主网部署后填写
  }
};

// 获取当前网络的合约地址
export const getContractAddress = (contractName) => {
  return CONTRACT_ADDRESSES[CURRENT_NETWORK.id][contractName];
};

// 获取区块浏览器交易URL
export const getExplorerTxUrl = (txHash) => {
  return `${CURRENT_NETWORK.explorer}/tx/${txHash}`;
};

// 获取区块浏览器地址URL
export const getExplorerAddressUrl = (address) => {
  return `${CURRENT_NETWORK.explorer}/address/${address}`;
};

// 获取区块浏览器合约URL
export const getExplorerContractUrl = (address) => {
  return `${CURRENT_NETWORK.explorer}/token/${address}`;
};

// 网络切换配置
export const NETWORK_SWITCH_CONFIG = {
  [NETWORKS.TESTNET.id]: {
    chainId: `0x${NETWORKS.TESTNET.id.toString(16)}`,
    chainName: NETWORKS.TESTNET.name,
    nativeCurrency: {
      name: NETWORKS.TESTNET.currencyName,
      symbol: NETWORKS.TESTNET.currencySymbol,
      decimals: 18
    },
    rpcUrls: [NETWORKS.TESTNET.rpcUrl],
    blockExplorerUrls: [NETWORKS.TESTNET.explorer]
  },
  [NETWORKS.MAINNET.id]: {
    chainId: `0x${NETWORKS.MAINNET.id.toString(16)}`,
    chainName: NETWORKS.MAINNET.name,
    nativeCurrency: {
      name: NETWORKS.MAINNET.currencyName,
      symbol: NETWORKS.MAINNET.currencySymbol,
      decimals: 18
    },
    rpcUrls: [NETWORKS.MAINNET.rpcUrl],
    blockExplorerUrls: [NETWORKS.MAINNET.explorer]
  }
};
