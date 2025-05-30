import { ethers } from 'ethers';

// 合约地址配置
const contractAddresses = {
  // BSC测试网
  97: {
    IdentityContract: '0x123456789abcdef123456789abcdef123456789a', // 示例地址，需替换为实际部署地址
    CultureNFTContract: '0x123456789abcdef123456789abcdef123456789b',
    CultureEventContract: '0x123456789abcdef123456789abcdef123456789c',
    CultureTokenContract: '0x123456789abcdef123456789abcdef123456789d',
    PointSystemContract: '0x123456789abcdef123456789abcdef123456789e'
  },
  // 本地开发网络
  1337: {
    IdentityContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Hardhat默认部署地址
    CultureNFTContract: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    CultureEventContract: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    CultureTokenContract: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    PointSystemContract: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
  }
};

// 合约ABI
import IdentityContractABI from '../contracts/abis/IdentityContract.json';
import CultureNFTContractABI from '../contracts/abis/CultureNFTContract.json';
import CultureEventContractABI from '../contracts/abis/CultureEventContract.json';
import CultureTokenContractABI from '../contracts/abis/CultureTokenContract.json';
import PointSystemContractABI from '../contracts/abis/PointSystemContract.json';

// 合约ABI映射
const contractABIs = {
  IdentityContract: IdentityContractABI,
  CultureNFTContract: CultureNFTContractABI,
  CultureEventContract: CultureEventContractABI,
  CultureTokenContract: CultureTokenContractABI,
  PointSystemContract: PointSystemContractABI
};

// 获取合约地址
export const getContractAddress = (contractName, chainId) => {
  // 如果链ID不支持，默认使用本地开发网络
  const networkId = contractAddresses[chainId] ? chainId : 1337;
  return contractAddresses[networkId][contractName];
};

// 获取合约ABI
export const getContractABI = (contractName) => {
  return contractABIs[contractName];
};

// 获取只读合约实例
export const getReadOnlyContractInstance = (contractName, provider, chainId) => {
  const address = getContractAddress(contractName, chainId);
  const abi = getContractABI(contractName);
  return new ethers.Contract(address, abi, provider);
};

// 获取可写合约实例
export const getWritableContractInstance = (contractName, signer, chainId) => {
  const address = getContractAddress(contractName, chainId);
  const abi = getContractABI(contractName);
  return new ethers.Contract(address, abi, signer);
};

// 监听合约事件
export const listenToContractEvent = (contract, eventName, callback) => {
  if (!contract) return null;
  
  const listener = (...args) => {
    callback(...args);
  };
  
  contract.on(eventName, listener);
  
  // 返回清理函数
  return () => {
    contract.off(eventName, listener);
  };
};

// 处理交易错误
export const handleTransactionError = (error) => {
  console.error('交易错误:', error);
  
  // 解析常见错误
  if (error.code === 'ACTION_REJECTED') {
    return '交易被用户拒绝';
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    return '余额不足，无法完成交易';
  } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return '无法估算Gas限制，交易可能会失败';
  } else if (error.message && error.message.includes('execution reverted')) {
    // 尝试从错误消息中提取自定义错误
    const revertReason = error.message.match(/reason="(.*?)"/);
    if (revertReason && revertReason[1]) {
      return `交易被回滚: ${revertReason[1]}`;
    }
    return '交易被智能合约回滚';
  }
  
  return '交易过程中发生错误';
};

// 等待交易确认并返回结果
export const waitForTransaction = async (tx, confirmations = 1) => {
  try {
    const receipt = await tx.wait(confirmations);
    return {
      success: true,
      receipt
    };
  } catch (error) {
    return {
      success: false,
      error: handleTransactionError(error)
    };
  }
};
