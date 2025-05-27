// CultureStaking.js - 文化通证质押智能合约接口

import { ethers } from 'ethers';
import CultureStakingABI from './CultureStaking.json'; // 合约ABI

/**
 * 获取对应链上的文化通证质押合约地址
 * @param {number} chainId - 区块链网络ID
 * @returns {string|null} 合约地址或null
 */
export const getContractAddress = (chainId) => {
  // 根据不同网络返回对应的合约地址
  switch (chainId) {
    case 1: // 以太坊主网
      return process.env.REACT_APP_CULTURE_STAKING_ADDRESS_MAINNET;
    case 137: // Polygon主网
      return process.env.REACT_APP_CULTURE_STAKING_ADDRESS_POLYGON;
    case 80001: // Polygon Mumbai测试网
      return process.env.REACT_APP_CULTURE_STAKING_ADDRESS_MUMBAI;
    case 11155111: // Sepolia测试网
      return process.env.REACT_APP_CULTURE_STAKING_ADDRESS_SEPOLIA;
    default:
      console.error(`不支持的链ID: ${chainId}`);
      return null;
  }
};

/**
 * 获取只读的文化通证质押合约实例
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @returns {ethers.Contract|null} 合约实例或null
 */
export const getCultureStakingContract = (library, chainId) => {
  const address = getContractAddress(chainId);
  if (!address || !library) return null;
  return new ethers.Contract(address, CultureStakingABI.abi, library);
};

/**
 * 获取带签名者的文化通证质押合约实例
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 用户钱包地址
 * @returns {ethers.Contract|null} 带签名者的合约实例或null
 */
export const getSignerCultureStakingContract = (library, chainId, account) => {
  const contract = getCultureStakingContract(library, chainId);
  if (!contract || !account) return null;
  return contract.connect(library.getSigner(account));
};

/**
 * 获取用户质押信息
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 用户钱包地址
 * @returns {Promise<object>} 用户质押信息
 */
export const getUserStake = async (library, chainId, account) => {
  try {
    const contract = getCultureStakingContract(library, chainId);
    if (!contract || !account) return { amount: '0', rewards: '0' };
    
    // 获取用户质押金额
    const stakedAmount = await contract.stakedAmount(account);
    
    // 获取可领取的奖励
    const pendingRewards = await contract.pendingRewards(account);
    
    return {
      amount: ethers.utils.formatUnits(stakedAmount, 18),
      rewards: ethers.utils.formatUnits(pendingRewards, 18)
    };
  } catch (error) {
    console.error('获取用户质押信息失败:', error);
    return { amount: '0', rewards: '0' };
  }
};

/**
 * 获取总质押量
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @returns {Promise<string>} 格式化后的总质押量
 */
export const getTotalStaked = async (library, chainId) => {
  try {
    const contract = getCultureStakingContract(library, chainId);
    if (!contract) return '0';
    
    const totalStaked = await contract.totalStaked();
    return ethers.utils.formatUnits(totalStaked, 18);
  } catch (error) {
    console.error('获取总质押量失败:', error);
    return '0';
  }
};

/**
 * 获取当前奖励率
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @returns {Promise<string>} 格式化后的奖励率（年化百分比）
 */
export const getRewardRate = async (library, chainId) => {
  try {
    const contract = getCultureStakingContract(library, chainId);
    if (!contract) return '0';
    
    const rewardRate = await contract.rewardRate();
    
    // 假设rewardRate是每区块每单位质押的奖励，转换为年化百分比
    // 这里的计算方式取决于合约的具体实现
    const blocksPerYear = 2102400; // 以太坊约每年2102400个区块
    const annualRate = rewardRate.mul(blocksPerYear).mul(100);
    
    return ethers.utils.formatUnits(annualRate, 18);
  } catch (error) {
    console.error('获取奖励率失败:', error);
    return '0';
  }
};

/**
 * 质押通证
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 用户钱包地址
 * @param {string|number} amount - 质押金额
 * @returns {Promise<object>} 交易结果
 */
export const stakeTokens = async (library, chainId, account, amount) => {
  try {
    const contract = getSignerCultureStakingContract(library, chainId, account);
    if (!contract) throw new Error('无法获取签名合约实例');
    
    // 验证金额
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      throw new Error('无效的质押金额');
    }
    
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
    
    // 发送交易
    const tx = await contract.stake(amountInWei);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return { 
      success: receipt.status === 1, 
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('质押失败:', error);
    throw error;
  }
};

/**
 * 解除质押
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 用户钱包地址
 * @param {string|number} amount - 解除质押金额
 * @returns {Promise<object>} 交易结果
 */
export const unstakeTokens = async (library, chainId, account, amount) => {
  try {
    const contract = getSignerCultureStakingContract(library, chainId, account);
    if (!contract) throw new Error('无法获取签名合约实例');
    
    // 验证金额
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      throw new Error('无效的解除质押金额');
    }
    
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
    
    // 发送交易
    const tx = await contract.unstake(amountInWei);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return { 
      success: receipt.status === 1, 
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('解除质押失败:', error);
    throw error;
  }
};

/**
 * 领取质押奖励
 * @param {object} library - Web3 Provider
 * @param {number} chainId - 区块链网络ID
 * @param {string} account - 用户钱包地址
 * @returns {Promise<object>} 交易结果
 */
export const claimReward = async (library, chainId, account) => {
  try {
    const contract = getSignerCultureStakingContract(library, chainId, account);
    if (!contract) throw new Error('无法获取签名合约实例');
    
    // 发送交易
    const tx = await contract.claimReward();
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return { 
      success: receipt.status === 1, 
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('领取奖励失败:', error);
    throw error;
  }
};

/**
 * 监听质押事件
 * @param {object} contract - 质押合约实例
 * @param {string} account - 用户钱包地址
 * @param {function} callback - 事件回调函数
 * @returns {function} 取消监听的函数
 */
export const listenToStakingEvents = (contract, account, callback) => {
  if (!contract || !account) return () => {};
  
  // 监听质押事件
  const stakedFilter = contract.filters.Staked(account);
  contract.on(stakedFilter, (user, amount, event) => {
    callback({
      type: 'stake',
      user,
      amount: ethers.utils.formatUnits(amount, 18),
      event
    });
  });
  
  // 监听解除质押事件
  const unstakedFilter = contract.filters.Unstaked(account);
  contract.on(unstakedFilter, (user, amount, event) => {
    callback({
      type: 'unstake',
      user,
      amount: ethers.utils.formatUnits(amount, 18),
      event
    });
  });
  
  // 监听奖励领取事件
  const rewardClaimedFilter = contract.filters.RewardClaimed(account);
  contract.on(rewardClaimedFilter, (user, amount, event) => {
    callback({
      type: 'reward',
      user,
      amount: ethers.utils.formatUnits(amount, 18),
      event
    });
  });
  
  // 返回取消监听的函数
  return () => {
    contract.removeAllListeners(stakedFilter);
    contract.removeAllListeners(unstakedFilter);
    contract.removeAllListeners(rewardClaimedFilter);
  };
};

export default {
  getContractAddress,
  getCultureStakingContract,
  getSignerCultureStakingContract,
  getUserStake,
  getTotalStaked,
  getRewardRate,
  stakeTokens,
  unstakeTokens,
  claimReward,
  listenToStakingEvents
};
