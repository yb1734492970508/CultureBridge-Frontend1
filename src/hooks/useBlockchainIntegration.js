import { useState, useEffect, useCallback } from 'react';
import blockchainService from '../services/BlockchainIntegrationService';

/**
 * 区块链集成Hook
 * 提供区块链连接、合约交互和状态管理
 */
export const useBlockchainIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [votingPower, setVotingPower] = useState(0);
  const [availablePower, setAvailablePower] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 初始化区块链连接
  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await blockchainService.initialize();
      const userAccount = await blockchainService.signer.getAddress();
      const networkInfo = await blockchainService.getNetworkInfo();
      
      setAccount(userAccount);
      setNetwork(networkInfo);
      setIsConnected(true);
      
      // 获取投票权信息
      await updateVotingPower(userAccount);
      
      // 设置事件监听器
      setupEventListeners();
      
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新投票权信息
  const updateVotingPower = useCallback(async (userAccount = account) => {
    if (!userAccount) return;
    
    try {
      const totalPower = await blockchainService.getVotingPower(userAccount);
      const available = await blockchainService.getAvailableVotingPower(userAccount);
      
      setVotingPower(parseInt(blockchainService.formatAmount(totalPower)));
      setAvailablePower(parseInt(blockchainService.formatAmount(available)));
    } catch (err) {
      console.error('更新投票权失败:', err);
    }
  }, [account]);

  // 设置事件监听器
  const setupEventListeners = useCallback(() => {
    // 监听账户变化
    blockchainService.on('accountChanged', (newAccount) => {
      setAccount(newAccount);
      updateVotingPower(newAccount);
    });

    // 监听网络变化
    blockchainService.on('chainChanged', async (chainId) => {
      const networkInfo = await blockchainService.getNetworkInfo();
      setNetwork(networkInfo);
    });

    // 监听断开连接
    blockchainService.on('disconnected', () => {
      setIsConnected(false);
      setAccount(null);
      setVotingPower(0);
      setAvailablePower(0);
    });

    // 监听委托事件
    blockchainService.on('delegationCreated', () => {
      updateVotingPower();
    });

    blockchainService.on('delegationRevoked', () => {
      updateVotingPower();
    });
  }, [updateVotingPower]);

  // 创建提案
  const createProposal = useCallback(async (proposalData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await blockchainService.createProposal(proposalData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 投票
  const vote = useCallback(async (proposalId, support) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await blockchainService.vote(proposalId, support);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建委托
  const createDelegation = useCallback(async (delegationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await blockchainService.createDelegation(delegationData);
      await updateVotingPower(); // 更新投票权
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateVotingPower]);

  // 撤销委托
  const revokeDelegation = useCallback(async (delegatee) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await blockchainService.revokeDelegation(delegatee);
      await updateVotingPower(); // 更新投票权
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateVotingPower]);

  // 获取提案详情
  const getProposal = useCallback(async (proposalId) => {
    try {
      return await blockchainService.getProposal(proposalId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // 获取用户NFT
  const getUserNFTs = useCallback(async () => {
    try {
      return await blockchainService.getUserNFTs();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // 获取委托列表
  const getDelegations = useCallback(async () => {
    try {
      return await blockchainService.getDelegations();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    setNetwork(null);
    setVotingPower(0);
    setAvailablePower(0);
    setError(null);
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 组件挂载时尝试连接
  useEffect(() => {
    // 检查是否已经连接过
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            initialize();
          }
        })
        .catch(console.error);
    }
  }, [initialize]);

  return {
    // 状态
    isConnected,
    account,
    network,
    votingPower,
    availablePower,
    loading,
    error,
    
    // 方法
    initialize,
    disconnect,
    clearError,
    updateVotingPower,
    
    // 合约交互
    createProposal,
    vote,
    createDelegation,
    revokeDelegation,
    getProposal,
    getUserNFTs,
    getDelegations
  };
};

/**
 * 提案管理Hook
 */
export const useProposalManagement = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isConnected, createProposal, vote, getProposal } = useBlockchainIntegration();

  // 创建新提案
  const submitProposal = useCallback(async (proposalData) => {
    if (!isConnected) {
      throw new Error('请先连接钱包');
    }

    setLoading(true);
    try {
      const result = await createProposal(proposalData);
      
      // 添加到本地列表
      const newProposal = {
        id: result.proposalId,
        title: proposalData.title,
        description: proposalData.description,
        status: 'active',
        createdAt: new Date().toISOString(),
        transactionHash: result.transactionHash
      };
      
      setProposals(prev => [newProposal, ...prev]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, createProposal]);

  // 投票
  const castVote = useCallback(async (proposalId, support) => {
    if (!isConnected) {
      throw new Error('请先连接钱包');
    }

    setLoading(true);
    try {
      const result = await vote(proposalId, support);
      
      // 更新本地提案状态
      setProposals(prev => prev.map(proposal => 
        proposal.id === proposalId 
          ? { ...proposal, userVoted: true, userVoteSupport: support }
          : proposal
      ));
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, vote]);

  // 获取提案详情
  const fetchProposal = useCallback(async (proposalId) => {
    setLoading(true);
    try {
      const proposal = await getProposal(proposalId);
      return proposal;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getProposal]);

  return {
    proposals,
    loading,
    error,
    submitProposal,
    castVote,
    fetchProposal,
    clearError: () => setError(null)
  };
};

/**
 * 委托管理Hook
 */
export const useDelegationManagement = () => {
  const [delegations, setDelegations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { 
    isConnected, 
    createDelegation, 
    revokeDelegation, 
    getDelegations,
    availablePower 
  } = useBlockchainIntegration();

  // 获取委托列表
  const fetchDelegations = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    try {
      const delegationList = await getDelegations();
      setDelegations(delegationList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isConnected, getDelegations]);

  // 创建委托
  const delegate = useCallback(async (delegationData) => {
    if (!isConnected) {
      throw new Error('请先连接钱包');
    }

    if (delegationData.amount > availablePower) {
      throw new Error('委托数量超过可用投票权');
    }

    setLoading(true);
    try {
      const result = await createDelegation(delegationData);
      
      // 刷新委托列表
      await fetchDelegations();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, createDelegation, availablePower, fetchDelegations]);

  // 撤销委托
  const revokeDelegate = useCallback(async (delegatee) => {
    if (!isConnected) {
      throw new Error('请先连接钱包');
    }

    setLoading(true);
    try {
      const result = await revokeDelegation(delegatee);
      
      // 刷新委托列表
      await fetchDelegations();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, revokeDelegation, fetchDelegations]);

  // 初始化时获取委托列表
  useEffect(() => {
    if (isConnected) {
      fetchDelegations();
    }
  }, [isConnected, fetchDelegations]);

  return {
    delegations,
    loading,
    error,
    delegate,
    revokeDelegate,
    fetchDelegations,
    clearError: () => setError(null)
  };
};

