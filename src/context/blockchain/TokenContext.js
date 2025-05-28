import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { BlockchainContext } from './index';

// 导入合约ABI
const CultureTokenABI = [
  // 这里将放置CultureToken合约的ABI
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

const StakingContractABI = [
  // 这里将放置StakingContract合约的ABI
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",
  "function claimReward()",
  "function earned(address account) view returns (uint256)",
  "function userStakedAmount(address) view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event RewardClaimed(address indexed user, uint256 reward)"
];

// 创建通证上下文
export const TokenContext = createContext();

// 通证提供者组件
export const TokenProvider = ({ children }) => {
  // 从区块链上下文获取账户和提供者
  const { account, provider, isConnected } = useContext(BlockchainContext);
  
  // 状态管理
  const [tokenContract, setTokenContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [userBalance, setUserBalance] = useState('0');
  const [stakedAmount, setStakedAmount] = useState('0');
  const [pendingRewards, setPendingRewards] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 合约地址 - 实际部署时需要更新
  const tokenContractAddress = "0x1234567890123456789012345678901234567890"; // 示例地址
  const stakingContractAddress = "0x0987654321098765432109876543210987654321"; // 示例地址
  
  // 初始化合约
  useEffect(() => {
    if (provider && isConnected) {
      try {
        const signer = provider.getSigner();
        
        // 初始化通证合约
        const token = new ethers.Contract(
          tokenContractAddress,
          CultureTokenABI,
          signer
        );
        setTokenContract(token);
        
        // 初始化质押合约
        const staking = new ethers.Contract(
          stakingContractAddress,
          StakingContractABI,
          signer
        );
        setStakingContract(staking);
        
        // 加载用户数据
        if (account) {
          fetchUserData();
        }
      } catch (err) {
        console.error("Error initializing contracts:", err);
        setError("初始化合约失败");
      }
    }
  }, [provider, account, isConnected]);
  
  // 定期更新用户数据
  useEffect(() => {
    if (account && tokenContract && stakingContract) {
      const interval = setInterval(() => {
        fetchUserData();
      }, 30000); // 每30秒更新一次
      
      return () => clearInterval(interval);
    }
  }, [account, tokenContract, stakingContract]);
  
  // 获取用户数据
  const fetchUserData = async () => {
    if (!account || !tokenContract || !stakingContract) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 获取通证余额
      const balance = await tokenContract.balanceOf(account);
      setUserBalance(ethers.utils.formatEther(balance));
      
      // 获取质押数量
      const staked = await stakingContract.userStakedAmount(account);
      setStakedAmount(ethers.utils.formatEther(staked));
      
      // 获取待领取奖励
      const rewards = await stakingContract.earned(account);
      setPendingRewards(ethers.utils.formatEther(rewards));
      
      // 获取对质押合约的授权额度
      const currentAllowance = await tokenContract.allowance(account, stakingContractAddress);
      setAllowance(ethers.utils.formatEther(currentAllowance));
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("获取用户数据失败");
      setIsLoading(false);
    }
  };
  
  // 转账通证
  const transferTokens = async (to, amount) => {
    if (!account || !tokenContract) {
      throw new Error("未连接钱包或合约未初始化");
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await tokenContract.transfer(to, amountWei);
      
      // 等待交易确认
      await tx.wait();
      
      // 更新余额
      await fetchUserData();
      
      setIsLoading(false);
      return tx;
    } catch (err) {
      console.error("Error transferring tokens:", err);
      setError("转账失败");
      setIsLoading(false);
      throw err;
    }
  };
  
  // 授权合约
  const approveContract = async (spender, amount) => {
    if (!account || !tokenContract) {
      throw new Error("未连接钱包或合约未初始化");
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await tokenContract.approve(spender, amountWei);
      
      // 等待交易确认
      await tx.wait();
      
      // 更新授权额度
      if (spender === stakingContractAddress) {
        const newAllowance = await tokenContract.allowance(account, stakingContractAddress);
        setAllowance(ethers.utils.formatEther(newAllowance));
      }
      
      setIsLoading(false);
      return tx;
    } catch (err) {
      console.error("Error approving contract:", err);
      setError("授权失败");
      setIsLoading(false);
      throw err;
    }
  };
  
  // 质押通证
  const stakeTokens = async (amount) => {
    if (!account || !stakingContract) {
      throw new Error("未连接钱包或合约未初始化");
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // 检查授权额度
      const currentAllowance = await tokenContract.allowance(account, stakingContractAddress);
      if (currentAllowance.lt(amountWei)) {
        throw new Error("授权额度不足，请先授权");
      }
      
      const tx = await stakingContract.stake(amountWei);
      
      // 等待交易确认
      await tx.wait();
      
      // 更新用户数据
      await fetchUserData();
      
      setIsLoading(false);
      return tx;
    } catch (err) {
      console.error("Error staking tokens:", err);
      setError("质押失败");
      setIsLoading(false);
      throw err;
    }
  };
  
  // 解除质押
  const unstakeTokens = async (amount) => {
    if (!account || !stakingContract) {
      throw new Error("未连接钱包或合约未初始化");
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await stakingContract.unstake(amountWei);
      
      // 等待交易确认
      await tx.wait();
      
      // 更新用户数据
      await fetchUserData();
      
      setIsLoading(false);
      return tx;
    } catch (err) {
      console.error("Error unstaking tokens:", err);
      setError("解除质押失败");
      setIsLoading(false);
      throw err;
    }
  };
  
  // 领取质押奖励
  const claimStakingRewards = async () => {
    if (!account || !stakingContract) {
      throw new Error("未连接钱包或合约未初始化");
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const tx = await stakingContract.claimReward();
      
      // 等待交易确认
      await tx.wait();
      
      // 更新用户数据
      await fetchUserData();
      
      setIsLoading(false);
      return tx;
    } catch (err) {
      console.error("Error claiming rewards:", err);
      setError("领取奖励失败");
      setIsLoading(false);
      throw err;
    }
  };
  
  // 获取交易历史
  const fetchTransactionHistory = async () => {
    if (!account || !tokenContract || !provider) {
      throw new Error("未连接钱包或合约未初始化");
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 获取Transfer事件
      const sentFilter = tokenContract.filters.Transfer(account, null);
      const receivedFilter = tokenContract.filters.Transfer(null, account);
      
      // 获取最近100个区块的事件
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 100);
      
      const sentEvents = await tokenContract.queryFilter(sentFilter, fromBlock);
      const receivedEvents = await tokenContract.queryFilter(receivedFilter, fromBlock);
      
      // 合并和处理事件
      const allEvents = [...sentEvents, ...receivedEvents].sort((a, b) => b.blockNumber - a.blockNumber);
      
      const history = await Promise.all(allEvents.map(async (event) => {
        const block = await provider.getBlock(event.blockNumber);
        return {
          hash: event.transactionHash,
          from: event.args.from,
          to: event.args.to,
          value: ethers.utils.formatEther(event.args.value),
          timestamp: block.timestamp,
          type: event.args.from === account ? 'sent' : 'received'
        };
      }));
      
      setTransactionHistory(history);
      setIsLoading(false);
      return history;
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      setError("获取交易历史失败");
      setIsLoading(false);
      throw err;
    }
  };
  
  // 提供上下文值
  const contextValue = {
    tokenContract,
    stakingContract,
    userBalance,
    stakedAmount,
    pendingRewards,
    allowance,
    transactionHistory,
    isLoading,
    error,
    fetchUserData,
    transferTokens,
    approveContract,
    stakeTokens,
    unstakeTokens,
    claimStakingRewards,
    fetchTransactionHistory
  };
  
  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

export default TokenContext;
