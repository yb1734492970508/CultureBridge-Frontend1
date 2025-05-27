import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useBlockchain } from '../blockchain/BlockchainContext';
import * as CultureTokenService from '../../contracts/token/CultureToken';
import * as CultureStakingService from '../../contracts/token/CultureStaking';

// 创建Context
const TokenContext = createContext();

// 自定义Hook，用于在组件中访问TokenContext
export const useToken = () => useContext(TokenContext);

// TokenProvider组件
export const TokenProvider = ({ children }) => {
  const { active, account, library, chainId } = useBlockchain();
  
  // 状态
  const [balance, setBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [transactions, setTransactions] = useState([]);
  const [stakeInfo, setStakeInfo] = useState({ amount: '0', rewards: '0' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 获取用户通证余额
  const fetchBalance = useCallback(async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const userBalance = await CultureTokenService.fetchBalance(library, chainId, account);
      setBalance(userBalance);
    } catch (error) {
      console.error('获取通证余额失败:', error);
      setError('获取通证余额失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  }, [active, account, library, chainId]);
  
  // 获取通证总供应量
  const fetchTotalSupply = useCallback(async () => {
    if (!library || !chainId) return;
    
    try {
      const supply = await CultureTokenService.fetchTotalSupply(library, chainId);
      setTotalSupply(supply);
    } catch (error) {
      console.error('获取通证总供应量失败:', error);
    }
  }, [library, chainId]);
  
  // 获取用户交易历史
  const fetchTransactions = useCallback(async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setLoading(true);
      
      const history = await CultureTokenService.fetchTransactionHistory(library, chainId, account);
      setTransactions(history);
    } catch (error) {
      console.error('获取交易历史失败:', error);
    } finally {
      setLoading(false);
    }
  }, [active, account, library, chainId]);
  
  // 获取用户质押信息
  const fetchStakeInfo = useCallback(async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setLoading(true);
      
      const info = await CultureStakingService.getUserStake(library, chainId, account);
      setStakeInfo(info);
    } catch (error) {
      console.error('获取质押信息失败:', error);
    } finally {
      setLoading(false);
    }
  }, [active, account, library, chainId]);
  
  // 转账通证
  const transfer = async (recipient, amount) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false };
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await CultureTokenService.transferTokens(
        library,
        chainId,
        account,
        recipient,
        amount
      );
      
      if (result.success) {
        setSuccess(`转账成功！交易哈希: ${result.transactionHash}`);
        // 更新余额
        fetchBalance();
        // 更新交易历史
        fetchTransactions();
        return { success: true, hash: result.transactionHash };
      } else {
        setError('转账失败，请稍后再试');
        return { success: false };
      }
    } catch (error) {
      console.error('转账失败:', error);
      setError(error.message || '转账失败，请稍后再试');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 授权通证
  const approve = async (spender, amount) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false };
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await CultureTokenService.approveTokens(
        library,
        chainId,
        account,
        spender,
        amount
      );
      
      if (result.success) {
        setSuccess(`授权成功！交易哈希: ${result.transactionHash}`);
        return { success: true, hash: result.transactionHash };
      } else {
        setError('授权失败，请稍后再试');
        return { success: false };
      }
    } catch (error) {
      console.error('授权失败:', error);
      setError(error.message || '授权失败，请稍后再试');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 检查授权额度
  const checkAllowance = async (spender) => {
    if (!active || !account || !library || !chainId) return '0';
    
    try {
      const allowance = await CultureTokenService.checkAllowance(
        library,
        chainId,
        account,
        spender
      );
      return allowance;
    } catch (error) {
      console.error('检查授权额度失败:', error);
      return '0';
    }
  };
  
  // 质押通证
  const stakeTokens = async (amount) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false };
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // 检查授权
      const stakingAddress = CultureStakingService.getContractAddress(chainId);
      const allowance = await checkAllowance(stakingAddress);
      
      // 如果授权不足，先进行授权
      if (parseFloat(allowance) < parseFloat(amount)) {
        setSuccess('');
        setError('');
        setLoading(true);
        
        const approveResult = await approve(stakingAddress, amount);
        if (!approveResult.success) {
          setError('授权失败，无法进行质押');
          return { success: false };
        }
      }
      
      // 进行质押
      const result = await CultureStakingService.stakeTokens(
        library,
        chainId,
        account,
        amount
      );
      
      if (result.success) {
        setSuccess(`质押成功！交易哈希: ${result.transactionHash}`);
        // 更新余额
        fetchBalance();
        // 更新质押信息
        fetchStakeInfo();
        return { success: true, hash: result.transactionHash };
      } else {
        setError('质押失败，请稍后再试');
        return { success: false };
      }
    } catch (error) {
      console.error('质押失败:', error);
      setError(error.message || '质押失败，请稍后再试');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 解除质押
  const unstakeTokens = async (amount) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false };
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await CultureStakingService.unstakeTokens(
        library,
        chainId,
        account,
        amount
      );
      
      if (result.success) {
        setSuccess(`解除质押成功！交易哈希: ${result.transactionHash}`);
        // 更新余额
        fetchBalance();
        // 更新质押信息
        fetchStakeInfo();
        return { success: true, hash: result.transactionHash };
      } else {
        setError('解除质押失败，请稍后再试');
        return { success: false };
      }
    } catch (error) {
      console.error('解除质押失败:', error);
      setError(error.message || '解除质押失败，请稍后再试');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 领取质押奖励
  const claimRewards = async () => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false };
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await CultureStakingService.claimReward(
        library,
        chainId,
        account
      );
      
      if (result.success) {
        setSuccess(`领取奖励成功！交易哈希: ${result.transactionHash}`);
        // 更新余额
        fetchBalance();
        // 更新质押信息
        fetchStakeInfo();
        return { success: true, hash: result.transactionHash };
      } else {
        setError('领取奖励失败，请稍后再试');
        return { success: false };
      }
    } catch (error) {
      console.error('领取奖励失败:', error);
      setError(error.message || '领取奖励失败，请稍后再试');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 清除消息
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };
  
  // 初始化加载
  useEffect(() => {
    if (active && account && library && chainId) {
      fetchBalance();
      fetchTotalSupply();
      fetchTransactions();
      fetchStakeInfo();
    }
  }, [active, account, library, chainId, fetchBalance, fetchTotalSupply, fetchTransactions, fetchStakeInfo]);
  
  // 设置定时刷新
  useEffect(() => {
    if (!active || !account || !library || !chainId) return;
    
    // 每30秒刷新一次余额
    const balanceInterval = setInterval(fetchBalance, 30000);
    
    // 每5分钟刷新一次交易历史和质押信息
    const dataInterval = setInterval(() => {
      fetchTransactions();
      fetchStakeInfo();
    }, 300000);
    
    return () => {
      clearInterval(balanceInterval);
      clearInterval(dataInterval);
    };
  }, [active, account, library, chainId, fetchBalance, fetchTransactions, fetchStakeInfo]);
  
  // 监听转账事件
  useEffect(() => {
    if (!active || !account || !library || !chainId) return;
    
    const contract = CultureTokenService.getCultureTokenContract(library, chainId);
    if (!contract) return;
    
    const unsubscribe = CultureTokenService.listenToTransferEvents(
      contract,
      account,
      (event) => {
        // 更新余额
        fetchBalance();
        // 更新交易历史
        fetchTransactions();
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [active, account, library, chainId, fetchBalance, fetchTransactions]);
  
  // 提供的Context值
  const value = {
    // 状态
    balance,
    totalSupply,
    transactions,
    stakeInfo,
    loading,
    error,
    success,
    
    // 方法
    fetchBalance,
    fetchTotalSupply,
    fetchTransactions,
    fetchStakeInfo,
    transfer,
    approve,
    checkAllowance,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    clearMessages,
    
    // 工具函数
    formatTokenAmount: CultureTokenService.formatTokenAmount
  };
  
  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
};

export default TokenContext;
