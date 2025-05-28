// 配置文件，包含API基础URL和其他全局配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// 区块链网络配置
const BLOCKCHAIN_CONFIG = {
  // 主网配置
  mainnet: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    rpcUrls: ['https://mainnet.infura.io/v3/your-infura-key'],
    blockExplorerUrls: ['https://etherscan.io'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  // 测试网配置
  testnet: {
    chainId: '0x5',
    chainName: 'Goerli Test Network',
    rpcUrls: ['https://goerli.infura.io/v3/your-infura-key'],
    blockExplorerUrls: ['https://goerli.etherscan.io'],
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  // 本地开发网络配置
  development: {
    chainId: '0x539',
    chainName: 'Local Development Chain',
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: [],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// 合约地址配置
const CONTRACT_ADDRESSES = {
  mainnet: {
    token: '0x8C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    governance: '0x9A5e5F32d3A0a5C59F3fA0D70B078e5A1F1CB729',
    staking: '0x9C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    nft: '0x7C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    identity: '0x6C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    activity: '0x5C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618'
  },
  testnet: {
    token: '0x8C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    governance: '0x9A5e5F32d3A0a5C59F3fA0D70B078e5A1F1CB729',
    staking: '0x9C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    nft: '0x7C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    identity: '0x6C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    activity: '0x5C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618'
  },
  development: {
    token: '0x8C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    governance: '0x9A5e5F32d3A0a5C59F3fA0D70B078e5A1F1CB729',
    staking: '0x9C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    nft: '0x7C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    identity: '0x6C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618',
    activity: '0x5C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618'
  }
};

// 应用配置
const APP_CONFIG = {
  // 分页默认设置
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50]
  },
  // 文件上传限制
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  },
  // 治理配置
  governance: {
    minProposalThreshold: 1000, // 最低提案门槛（代币数量）
    votingPeriod: 7 * 24 * 60 * 60, // 投票期（秒）
    quorumPercentage: 4 // 法定人数百分比
  },
  // 质押配置
  staking: {
    lockPeriods: [
      { days: 0, multiplier: 1.0, name: '无锁定' },
      { days: 30, multiplier: 1.2, name: '30天' },
      { days: 90, multiplier: 1.5, name: '90天' },
      { days: 180, multiplier: 2.0, name: '180天' },
      { days: 365, multiplier: 3.0, name: '365天' }
    ]
  }
};

export {
  API_BASE_URL,
  BLOCKCHAIN_CONFIG,
  CONTRACT_ADDRESSES,
  APP_CONFIG
};
