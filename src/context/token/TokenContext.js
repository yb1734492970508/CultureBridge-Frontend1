import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useBlockchain } from '../blockchain';
import { 
  getTokenBalance, 
  transferTokens, 
  approveTokens, 
  stakeTokens, 
  unstakeTokens, 
  getStakedAmount, 
  getStakingReward, 
  claimStakingReward 
} from '../../contracts/token/CultureToken';

// 创建上下文
const TokenContext = createContext();

// 自定义Hook，用于在组件中访问TokenContext
export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken必须在TokenProvider内部使用');
  }
  return context;
};

// TokenProvider组件
export const TokenProvider = ({ children }) => {
  const { account, active, library, chainId } = useBlockchain();
  
  // 状态
  const [balance, setBalance] = useState('0');
  const [stakedAmount, setStakedAmount] = useState('0');
  const [stakingReward, setStakingReward] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [transactions, setTransactions] = useState([]);
  
  // 加载代币余额
  const loadTokenBalance = useCallback(async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const tokenBalance = await getTokenBalance(library, chainId, account);
      setBalance(tokenBalance);
    } catch (error) {
      console.error('加载代币余额失败:', error);
      setError('加载代币余额时出错，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  }, [active, account, library, chainId]);
  
  // 加载质押信息
  const loadStakingInfo = useCallback(async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const [staked, reward] = await Promise.all([
        getStakedAmount(library, chainId, account),
        getStakingReward(library, chainId, account)
      ]);
      
      setStakedAmount(staked);
      setStakingReward(reward);
    } catch (error) {
      console.error('加载质押信息失败:', error);
      setError('加载质押信息时出错，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  }, [active, account, library, chainId]);
  
  // 初始加载
  useEffect(() => {
    loadTokenBalance();
    loadStakingInfo();
  }, [loadTokenBalance, loadStakingInfo]);
  
  // 转账代币
  const transfer = async (recipient, amount) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await transferTokens(library, chainId, recipient, amount);
      
      if (result.success) {
        setSuccessMessage(`成功转账 ${amount} CULT 到 ${recipient}`);
        
        // 添加到交易历史
        const newTransaction = {
          id: Date.now().toString(),
          type: 'transfer',
          recipient,
          amount,
          timestamp: Date.now(),
          hash: result.transactionHash
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        // 刷新余额
        await loadTokenBalance();
        
        return { success: true };
      } else {
        setError(`转账失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('转账失败:', error);
      setError(`转账失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // 质押代币
  const stake = async (amount) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await stakeTokens(library, chainId, amount);
      
      if (result.success) {
        setSuccessMessage(`成功质押 ${amount} CULT`);
        
        // 添加到交易历史
        const newTransaction = {
          id: Date.now().toString(),
          type: 'stake',
          amount,
          timestamp: Date.now(),
          hash: result.transactionHash
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        // 刷新余额和质押信息
        await Promise.all([
          loadTokenBalance(),
          loadStakingInfo()
        ]);
        
        return { success: true };
      } else {
        setError(`质押失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('质押失败:', error);
      setError(`质押失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // 解除质押
  const unstake = async (amount) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await unstakeTokens(library, chainId, amount);
      
      if (result.success) {
        setSuccessMessage(`成功解除质押 ${amount} CULT`);
        
        // 添加到交易历史
        const newTransaction = {
          id: Date.now().toString(),
          type: 'unstake',
          amount,
          timestamp: Date.now(),
          hash: result.transactionHash
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        // 刷新余额和质押信息
        await Promise.all([
          loadTokenBalance(),
          loadStakingInfo()
        ]);
        
        return { success: true };
      } else {
        setError(`解除质押失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('解除质押失败:', error);
      setError(`解除质押失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // 领取质押奖励
  const claimReward = async () => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await claimStakingReward(library, chainId);
      
      if (result.success) {
        setSuccessMessage(`成功领取 ${result.reward} CULT 奖励`);
        
        // 添加到交易历史
        const newTransaction = {
          id: Date.now().toString(),
          type: 'claim_reward',
          amount: result.reward,
          timestamp: Date.now(),
          hash: result.transactionHash
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        // 刷新余额和质押信息
        await Promise.all([
          loadTokenBalance(),
          loadStakingInfo()
        ]);
        
        return { success: true, reward: result.reward };
      } else {
        setError(`领取奖励失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('领取奖励失败:', error);
      setError(`领取奖励失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // 清除消息
  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };
  
  // 上下文值
  const value = {
    balance,
    stakedAmount,
    stakingReward,
    isLoading,
    error,
    successMessage,
    transactions,
    transfer,
    stake,
    unstake,
    claimReward,
    refreshBalance: loadTokenBalance,
    refreshStakingInfo: loadStakingInfo,
    clearMessages
  };
  
  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
};

export default TokenContext;
