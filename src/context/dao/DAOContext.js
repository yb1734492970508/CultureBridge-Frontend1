import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useBlockchain } from '../blockchain';
import { 
  getProposals, 
  getProposalDetails, 
  createProposal, 
  castVote, 
  queueProposal, 
  executeProposal, 
  getVoteReceipt 
} from '../../contracts/dao/CultureDAO';

// 创建上下文
const DAOContext = createContext();

// 自定义Hook，用于在组件中访问DAOContext
export const useDAO = () => {
  const context = useContext(DAOContext);
  if (!context) {
    throw new Error('useDAO必须在DAOProvider内部使用');
  }
  return context;
};

// DAOProvider组件
export const DAOProvider = ({ children }) => {
  const { account, active, library, chainId } = useBlockchain();
  
  // 状态
  const [proposals, setProposals] = useState([]);
  const [currentProposal, setCurrentProposal] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // 加载提案列表
  const loadProposals = useCallback(async (currentPage = 1) => {
    if (!active || !library || !chainId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const newProposals = await getProposals(library, chainId, currentPage, 10);
      
      if (newProposals.length === 0) {
        setHasMore(false);
      } else {
        setProposals(prev => currentPage === 1 ? newProposals : [...prev, ...newProposals]);
        setHasMore(newProposals.length === 10);
      }
      
      setPage(currentPage);
    } catch (error) {
      console.error('加载提案列表失败:', error);
      setError('加载提案列表时出错，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  }, [active, library, chainId]);
  
  // 加载提案详情
  const loadProposalDetails = useCallback(async (proposalId) => {
    if (!active || !library || !chainId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const details = await getProposalDetails(library, chainId, proposalId);
      setCurrentProposal(details);
      
      // 如果用户已连接钱包，加载用户投票信息
      if (account) {
        const voteReceipt = await getVoteReceipt(library, chainId, proposalId, account);
        if (voteReceipt) {
          setUserVotes(prev => ({
            ...prev,
            [proposalId]: voteReceipt
          }));
        }
      }
    } catch (error) {
      console.error('加载提案详情失败:', error);
      setError('加载提案详情时出错，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  }, [active, library, chainId, account]);
  
  // 创建提案
  const submitProposal = async (targets, values, calldatas, description) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await createProposal(library, chainId, targets, values, calldatas, description);
      
      if (result.success) {
        setSuccessMessage(`提案创建成功，提案ID: ${result.proposalId}`);
        
        // 刷新提案列表
        await loadProposals(1);
        
        return { success: true, proposalId: result.proposalId };
      } else {
        setError(`创建提案失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('创建提案失败:', error);
      setError(`创建提案失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // 投票
  const vote = async (proposalId, support, reason = '') => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await castVote(library, chainId, proposalId, support, reason);
      
      if (result.success) {
        const supportText = support === 0 ? '反对' : support === 1 ? '支持' : '弃权';
        setSuccessMessage(`投票成功，您${supportText}了该提案`);
        
        // 更新用户投票信息
        const voteReceipt = await getVoteReceipt(library, chainId, proposalId, account);
        if (voteReceipt) {
          setUserVotes(prev => ({
            ...prev,
            [proposalId]: voteReceipt
          }));
        }
        
        // 刷新提案详情
        await loadProposalDetails(proposalId);
        
        return { success: true };
      } else {
        setError(`投票失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('投票失败:', error);
      setError(`投票失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // 将提案加入队列
  const queueProposalAction = async (proposalId) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await queueProposal(library, chainId, proposalId);
      
      if (result.success) {
        setSuccessMessage('提案已成功加入队列');
        
        // 刷新提案详情
        await loadProposalDetails(proposalId);
        
        return { success: true };
      } else {
        setError(`加入队列失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('加入队列失败:', error);
      setError(`加入队列失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // 执行提案
  const executeProposalAction = async (proposalId) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await executeProposal(library, chainId, proposalId);
      
      if (result.success) {
        setSuccessMessage('提案已成功执行');
        
        // 刷新提案详情
        await loadProposalDetails(proposalId);
        
        return { success: true };
      } else {
        setError(`执行提案失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('执行提案失败:', error);
      setError(`执行提案失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // 加载更多提案
  const loadMoreProposals = () => {
    if (hasMore && !isLoading) {
      loadProposals(page + 1);
    }
  };
  
  // 清除消息
  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };
  
  // 初始加载
  useEffect(() => {
    if (active && library && chainId) {
      loadProposals(1);
    }
  }, [active, library, chainId, loadProposals]);
  
  // 上下文值
  const value = {
    proposals,
    currentProposal,
    userVotes,
    isLoading,
    error,
    successMessage,
    hasMore,
    loadProposals,
    loadProposalDetails,
    submitProposal,
    vote,
    queueProposalAction,
    executeProposalAction,
    loadMoreProposals,
    clearMessages
  };
  
  return (
    <DAOContext.Provider value={value}>
      {children}
    </DAOContext.Provider>
  );
};

export default DAOContext;
