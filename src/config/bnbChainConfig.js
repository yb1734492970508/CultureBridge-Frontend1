// BNB链网络配置
export const BNB_CHAIN_CONFIG = {
  // BSC主网
  mainnet: {
    chainId: '0x38', // 56
    chainName: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [
      'https://bsc-dataseed1.binance.org/',
      'https://bsc-dataseed2.binance.org/',
      'https://bsc-dataseed3.binance.org/',
      'https://bsc-dataseed4.binance.org/',
    ],
    blockExplorerUrls: ['https://bscscan.com/'],
  },
  
  // BSC测试网
  testnet: {
    chainId: '0x61', // 97
    chainName: 'BNB Smart Chain Testnet',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18,
    },
    rpcUrls: [
      'https://data-seed-prebsc-1-s1.binance.org:8545/',
      'https://data-seed-prebsc-2-s1.binance.org:8545/',
      'https://data-seed-prebsc-1-s2.binance.org:8545/',
    ],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
  },
};

// CBT代币配置
export const CBT_TOKEN_CONFIG = {
  // 主网配置
  mainnet: {
    address: '0x...', // 待部署后填入实际地址
    symbol: 'CBT',
    name: 'Culture Bridge Token',
    decimals: 18,
    totalSupply: '1000000000', // 10亿代币
  },
  
  // 测试网配置
  testnet: {
    address: '0x...', // 测试网合约地址
    symbol: 'CBT',
    name: 'Culture Bridge Token (Testnet)',
    decimals: 18,
    totalSupply: '1000000000',
  },
};

// 智能合约地址配置
export const CONTRACT_ADDRESSES = {
  mainnet: {
    CBT_TOKEN: '0x...', // CBT代币合约
    CBT_STAKING: '0x...', // CBT质押合约
    CULTURE_NFT: '0x...', // 文化NFT合约
    CULTURE_MARKETPLACE: '0x...', // NFT市场合约
    CULTURE_DAO: '0x...', // DAO治理合约
    CROSS_CHAIN_BRIDGE: '0x...', // 跨链桥合约
  },
  testnet: {
    CBT_TOKEN: '0x...', // 测试网地址
    CBT_STAKING: '0x...',
    CULTURE_NFT: '0x...',
    CULTURE_MARKETPLACE: '0x...',
    CULTURE_DAO: '0x...',
    CROSS_CHAIN_BRIDGE: '0x...',
  },
};

// 网络工具函数
export const getNetworkConfig = (chainId) => {
  switch (chainId) {
    case 56:
      return BNB_CHAIN_CONFIG.mainnet;
    case 97:
      return BNB_CHAIN_CONFIG.testnet;
    default:
      return null;
  }
};

// 获取CBT代币配置
export const getCBTConfig = (chainId) => {
  switch (chainId) {
    case 56:
      return CBT_TOKEN_CONFIG.mainnet;
    case 97:
      return CBT_TOKEN_CONFIG.testnet;
    default:
      return null;
  }
};

// 获取合约地址
export const getContractAddresses = (chainId) => {
  switch (chainId) {
    case 56:
      return CONTRACT_ADDRESSES.mainnet;
    case 97:
      return CONTRACT_ADDRESSES.testnet;
    default:
      return {};
  }
};

// 添加BNB链到MetaMask
export const addBNBChainToMetaMask = async (isTestnet = false) => {
  if (!window.ethereum) {
    throw new Error('MetaMask未安装');
  }

  const config = isTestnet ? BNB_CHAIN_CONFIG.testnet : BNB_CHAIN_CONFIG.mainnet;

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [config],
    });
    return true;
  } catch (error) {
    console.error('添加BNB链失败:', error);
    throw error;
  }
};

// 切换到BNB链
export const switchToBNBChain = async (isTestnet = false) => {
  if (!window.ethereum) {
    throw new Error('MetaMask未安装');
  }

  const chainId = isTestnet ? '0x61' : '0x38';

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    return true;
  } catch (error) {
    // 如果链未添加，尝试添加
    if (error.code === 4902) {
      return await addBNBChainToMetaMask(isTestnet);
    }
    console.error('切换BNB链失败:', error);
    throw error;
  }
};

// 检查是否在BNB链上
export const isBNBChain = (chainId) => {
  return chainId === 56 || chainId === 97;
};

// 格式化BNB金额
export const formatBNB = (amount, decimals = 4) => {
  return parseFloat(amount).toFixed(decimals);
};

// 格式化CBT代币金额
export const formatCBT = (amount, decimals = 2) => {
  return parseFloat(amount).toFixed(decimals);
};

