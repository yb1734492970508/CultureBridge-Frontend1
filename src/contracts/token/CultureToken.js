// CultureToken.js - 文化通证(ERC-20)智能合约接口

import { ethers } from 'ethers';
import CultureTokenABI from './CultureToken.json'; // 合约ABI

/**
 * 获取对应链上的文化通证合约地址
 * @param {number} chainId - 区块链网络ID
 * @returns {string|null} 合约地址或null
 */
export const getContractAddress = (chainId) => {
  // 根据不同网络返回对应的合约地址
  switch (chainId) {
    case 1: // 以太坊主网
      return process.env.REACT_APP_CULTURE_TOKEN_ADDRESS_MAINNET;
    case 137: // Polygon主网
      return process.env.REACT_APP_CULTURE_TOKEN_ADDRESS_POLYGON;
    case 80001: // Polygon Mumbai测试网
      return process.env.REACT_APP_CULTURE_TOKEN_ADDRESS_MUMBAI;
    case 11155111: // Sepolia测试网
      return process.env.REACT_APP_CULTURE_TOKEN_ADDRESS_SEPOLIA;
    default:
      console.error(`不支持的链ID: ${chainId}`);
      return null;
  }
};

/**
 * 获取只读的文化通证合约实例
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @returns {ethers.Contract|null} 合约实例或null
 */
export const getCultureTokenContract = (library, chainId) => {
  const address = getContractAddress(chainId);
  if (!address || !library) return null;
  return new ethers.Contract(address, CultureTokenABI.abi, library);
};

/**
 * 获取带签名者的文化通证合约实例
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 用户钱包地址
 * @returns {ethers.Contract|null} 带签名者的合约实例或null
 */
export const getSignerCultureTokenContract = (library, chainId, account) => {
  const contract = getCultureTokenContract(library, chainId);
  if (!contract || !account) return null;
  return contract.connect(library.getSigner(account));
};

/**
 * 获取用户通证余额
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 用户钱包地址
 * @returns {Promise<string>} 格式化后的余额
 */
export const fetchBalance = async (library, chainId, account) => {
  try {
    const contract = getCultureTokenContract(library, chainId);
    if (!contract || !account) return '0';
    
    const balance = await contract.balanceOf(account);
    return ethers.utils.formatUnits(balance, 18); // 假设精度为18
  } catch (error) {
    console.error('获取通证余额失败:', error);
    throw error;
  }
};

/**
 * 获取通证总供应量
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @returns {Promise<string>} 格式化后的总供应量
 */
export const fetchTotalSupply = async (library, chainId) => {
  try {
    const contract = getCultureTokenContract(library, chainId);
    if (!contract) return '0';
    
    const totalSupply = await contract.totalSupply();
    return ethers.utils.formatUnits(totalSupply, 18); // 假设精度为18
  } catch (error) {
    console.error('获取通证总供应量失败:', error);
    throw error;
  }
};

/**
 * 转账通证给指定地址
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 发送者钱包地址
 * @param {string} recipient - 接收者钱包地址
 * @param {string|number} amount - 转账金额
 * @returns {Promise<object>} 交易结果
 */
export const transferTokens = async (library, chainId, account, recipient, amount) => {
  try {
    const contract = getSignerCultureTokenContract(library, chainId, account);
    if (!contract) throw new Error('无法获取签名合约实例');
    
    // 验证接收地址
    if (!ethers.utils.isAddress(recipient)) {
      throw new Error('无效的接收地址');
    }
    
    // 验证金额
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      throw new Error('无效的转账金额');
    }
    
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
    
    // 检查余额
    const balance = await contract.balanceOf(account);
    if (balance.lt(amountInWei)) {
      throw new Error('余额不足');
    }
    
    // 发送交易
    const tx = await contract.transfer(recipient, amountInWei);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return { 
      success: receipt.status === 1, 
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('转账失败:', error);
    throw error;
  }
};

/**
 * 授权第三方合约使用通证
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 用户钱包地址
 * @param {string} spender - 被授权的合约地址
 * @param {string|number} amount - 授权金额
 * @returns {Promise<object>} 交易结果
 */
export const approveTokens = async (library, chainId, account, spender, amount) => {
  try {
    const contract = getSignerCultureTokenContract(library, chainId, account);
    if (!contract) throw new Error('无法获取签名合约实例');
    
    // 验证spender地址
    if (!ethers.utils.isAddress(spender)) {
      throw new Error('无效的授权地址');
    }
    
    // 验证金额
    if (isNaN(amount) || parseFloat(amount) < 0) {
      throw new Error('无效的授权金额');
    }
    
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
    
    // 发送交易
    const tx = await contract.approve(spender, amountInWei);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return { 
      success: receipt.status === 1, 
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('授权失败:', error);
    throw error;
  }
};

/**
 * 检查对第三方合约的授权额度
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 用户钱包地址
 * @param {string} spender - 被授权的合约地址
 * @returns {Promise<string>} 格式化后的授权额度
 */
export const checkAllowance = async (library, chainId, account, spender) => {
  try {
    const contract = getCultureTokenContract(library, chainId);
    if (!contract || !account || !spender) return '0';
    
    const allowance = await contract.allowance(account, spender);
    return ethers.utils.formatUnits(allowance, 18); // 假设精度为18
  } catch (error) {
    console.error('检查授权额度失败:', error);
    throw error;
  }
};

/**
 * 获取用户通证交易历史
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 用户钱包地址
 * @param {number} limit - 返回记录数量限制
 * @returns {Promise<Array>} 交易历史记录
 */
export const fetchTransactionHistory = async (library, chainId, account, limit = 10) => {
  try {
    // 注意：这个函数需要配合TheGraph或自定义索引服务实现
    // 这里提供一个模拟实现
    const contract = getCultureTokenContract(library, chainId);
    if (!contract || !account) return [];
    
    // 在实际实现中，应该调用TheGraph API或自定义后端API获取交易历史
    // 这里仅作为示例，返回模拟数据
    const mockHistory = [
      {
        type: 'transfer',
        from: account,
        to: '0x1234567890123456789012345678901234567890',
        amount: '10.0',
        timestamp: Date.now() - 86400000,
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      },
      {
        type: 'receive',
        from: '0x0987654321098765432109876543210987654321',
        to: account,
        amount: '5.0',
        timestamp: Date.now() - 172800000,
        transactionHash: '0x0987654321abcdef0987654321abcdef0987654321abcdef0987654321abcdef'
      }
    ];
    
    return mockHistory.slice(0, limit);
  } catch (error) {
    console.error('获取交易历史失败:', error);
    throw error;
  }
};

/**
 * 格式化通证金额显示
 * @param {string|number} amount - 通证金额
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的金额字符串
 */
export const formatTokenAmount = (amount, decimals = 4) => {
  if (!amount) return '0';
  
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  
  // 对于非常小的数值，使用科学计数法
  if (num < 0.0001) return num.toExponential(2);
  
  // 对于普通数值，保留指定小数位
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};

/**
 * 监听通证转账事件
 * @param {object} contract - 通证合约实例
 * @param {string} account - 用户钱包地址
 * @param {function} callback - 事件回调函数
 * @returns {function} 取消监听的函数
 */
export const listenToTransferEvents = (contract, account, callback) => {
  if (!contract || !account) return () => {};
  
  // 监听发送事件
  const fromFilter = contract.filters.Transfer(account, null);
  contract.on(fromFilter, (from, to, value, event) => {
    callback({
      type: 'send',
      from,
      to,
      value: ethers.utils.formatUnits(value, 18),
      event
    });
  });
  
  // 监听接收事件
  const toFilter = contract.filters.Transfer(null, account);
  contract.on(toFilter, (from, to, value, event) => {
    callback({
      type: 'receive',
      from,
      to,
      value: ethers.utils.formatUnits(value, 18),
      event
    });
  });
  
  // 返回取消监听的函数
  return () => {
    contract.removeAllListeners(fromFilter);
    contract.removeAllListeners(toFilter);
  };
};

export default {
  getContractAddress,
  getCultureTokenContract,
  getSignerCultureTokenContract,
  fetchBalance,
  fetchTotalSupply,
  transferTokens,
  approveTokens,
  checkAllowance,
  fetchTransactionHistory,
  formatTokenAmount,
  listenToTransferEvents
};
