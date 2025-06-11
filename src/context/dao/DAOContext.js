import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useBlockchain } from '../blockchain/BlockchainContext';
import { useIdentity } from '../identity/IdentityContext';
import { 
  getProposals, 
  getProposalDetails, 
  createProposal, 
  castVote, 
  queueProposal, 
  executeProposal, 
  getVoteReceipt,
  getVotingPower,
  getVotingPowerWithReputation,
  cancelProposal,
  delegateVotingPower,
  getDelegation
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

// 模拟模板数据 - 实际应从API或IPFS获取
const MOCK_TEMPLATES = [
  {
    id: 'template-001',
    title: '资金分配提案',
    description: '用于申请DAO资金支持项目或活动的标准模板',
    category: '财务',
    tags: ['资金', '预算', '项目'],
    author: '0x1234567890123456789012345678901234567890',
    createdAt: '2025-05-15T10:30:00Z',
    updatedAt: '2025-05-15T10:30:00Z',
    version: '1.0.0',
    usageCount: 28,
    rating: 4.7,
    isOfficial: true,
    structure: {
      title: {
        placeholder: '[项目名称] 资金申请',
        hint: '简洁明了地描述资金用途',
        maxLength: 100,
        required: true
      },
      sections: [
        {
          id: 'project_overview',
          title: '项目概述',
          description: '项目的基本介绍和目标',
          type: 'text',
          placeholder: '请描述项目的基本情况、目标和预期成果...',
          hint: '清晰简洁地介绍项目，让社区成员了解项目的核心价值',
          required: true
        },
        {
          id: 'funding_amount',
          title: '申请金额',
          description: '详细的资金需求和用途',
          type: 'text',
          placeholder: '请详细列出申请的资金金额和具体用途明细...',
          hint: '提供详细的预算明细，包括各项支出的具体金额和用途',
          required: true
        },
        {
          id: 'timeline',
          title: '项目时间线',
          description: '项目实施的时间计划',
          type: 'list',
          placeholder: '- 阶段一 (日期): 具体工作内容\n- 阶段二 (日期): 具体工作内容\n...',
          hint: '按阶段列出项目计划，包括每个阶段的时间和预期成果',
          required: true
        },
        {
          id: 'team',
          title: '项目团队',
          description: '项目团队成员及其角色',
          type: 'text',
          placeholder: '请介绍项目团队的主要成员、背景和职责...',
          hint: '介绍团队成员的专业背景和在项目中的角色',
          required: true
        },
        {
          id: 'success_metrics',
          title: '成功指标',
          description: '项目成功的评估标准',
          type: 'text',
          placeholder: '请列出衡量项目成功的具体指标和标准...',
          hint: '定义明确、可量化的成功指标，便于后续评估项目成果',
          required: true
        }
      ],
      actions: [
        {
          target: '0x0000000000000000000000000000000000000000',
          value: '0',
          calldata: '0x',
          description: '从DAO金库转账到项目账户'
        }
      ]
    }
  },
  {
    id: 'template-002',
    title: '参数调整提案',
    description: '用于调整DAO治理参数的标准模板',
    category: '治理',
    tags: ['参数', '治理', '调整'],
    author: '0x1234567890123456789012345678901234567890',
    createdAt: '2025-05-20T14:15:00Z',
    updatedAt: '2025-05-22T09:45:00Z',
    version: '1.1.0',
    usageCount: 15,
    rating: 4.5,
    isOfficial: true,
    structure: {
      title: {
        placeholder: '调整[参数名称]提案',
        hint: '明确指出要调整的参数',
        maxLength: 100,
        required: true
      },
      sections: [
        {
          id: 'parameter_description',
          title: '参数描述',
          description: '要调整的参数及其当前值',
          type: 'text',
          placeholder: '请描述要调整的参数、其当前值和在系统中的作用...',
          hint: '详细解释参数的作用和当前设置',
          required: true
        },
        {
          id: 'proposed_change',
          title: '建议的调整',
          description: '参数的新值及调整理由',
          type: 'text',
          placeholder: '请说明建议的新参数值，以及为什么需要进行这项调整...',
          hint: '清晰说明新值和调整理由，帮助社区理解变更的必要性',
          required: true
        },
        {
          id: 'impact_analysis',
          title: '影响分析',
          description: '参数调整可能带来的影响',
          type: 'text',
          placeholder: '请分析此参数调整可能对DAO运作、安全性、用户体验等方面带来的影响...',
          hint: '全面分析调整的潜在影响，包括正面和负面影响',
          required: true
        },
        {
          id: 'alternatives',
          title: '替代方案',
          description: '考虑过的其他方案',
          type: 'text',
          placeholder: '请描述您考虑过的其他替代方案，以及为什么选择当前提案...',
          hint: '说明已考虑的其他方案及其优缺点',
          required: false
        }
      ],
      actions: [
        {
          target: '0x0000000000000000000000000000000000000000',
          value: '0',
          calldata: '0x',
          description: '调用合约函数更新参数值'
        }
      ]
    }
  },
  {
    id: 'template-003',
    title: '社区活动提案',
    description: '用于提议和组织社区活动的模板',
    category: '社区',
    tags: ['活动', '社区', '参与'],
    author: '0x2345678901234567890123456789012345678901',
    createdAt: '2025-06-01T08:20:00Z',
    updatedAt: '2025-06-01T08:20:00Z',
    version: '1.0.0',
    usageCount: 7,
    rating: 4.2,
    isOfficial: false,
    structure: {
      title: {
        placeholder: '[活动名称] 社区活动提案',
        hint: '活动名称应简洁有吸引力',
        maxLength: 100,
        required: true
      },
      sections: [
        {
          id: 'event_description',
          title: '活动描述',
          description: '活动的基本介绍',
          type: 'text',
          placeholder: '请描述活动的主题、形式和目的...',
          hint: '详细说明活动内容和目标',
          required: true
        },
        {
          id: 'event_details',
          title: '活动详情',
          description: '活动的时间、地点和参与方式',
          type: 'text',
          placeholder: '请提供活动的具体时间、地点（线上/线下）和参与方式...',
          hint: '提供清晰的活动参与信息',
          required: true
        },
        {
          id: 'budget',
          title: '活动预算',
          description: '活动所需的资金和资源',
          type: 'text',
          placeholder: '请列出活动所需的预算明细...',
          hint: '详细列出各项支出',
          required: true
        },
        {
          id: 'expected_outcome',
          title: '预期成果',
          description: '活动预期达成的效果',
          type: 'text',
          placeholder: '请描述通过此活动希望达成的目标和效果...',
          hint: '说明活动对社区的价值和意义',
          required: true
        }
      ],
      actions: []
    }
  }
];

// DAOProvider组件
export const DAOProvider = ({ children }) => {
  const { account, active, library, chainId } = useBlockchain();
  const { userReputation } = useIdentity();
  
  // 状态
  const [proposals, setProposals] = useState([]);
  const [currentProposal, setCurrentProposal] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [votingPower, setVotingPower] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statistics, setStatistics] = useState({
    activeProposals: 0,
    totalProposals: 0,
    executedProposals: 0,
    participationRate: '0%'
  });
  const [proposalTemplates, setProposalTemplates] = useState([]);
  const [currentDelegation, setCurrentDelegation] = useState(null);
  
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
      
      // 更新统计信息
      if (currentPage === 1) {
        const activeProposals = newProposals.filter(p => p.state === 1).length;
        const executedProposals = newProposals.filter(p => p.state === 7).length;
        const participationRate = newProposals.length > 0 ? 
          Math.round((newProposals.reduce((sum, p) => sum + parseFloat(p.forVotes) + parseFloat(p.againstVotes) + parseFloat(p.abstainVotes), 0) / newProposals.length) * 100) + '%' : 
          '0%';
        
        setStatistics({
          activeProposals,
          totalProposals: newProposals.length,
          executedProposals,
          participationRate
        });
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
  
  // 取消提案
  const cancelProposalAction = async (proposalId) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await cancelProposal(library, chainId, proposalId);
      
      if (result.success) {
        setSuccessMessage('提案已成功取消');
        
        // 刷新提案详情
        await loadProposalDetails(proposalId);
        
        return { success: true };
      } else {
        setError(`取消提案失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('取消提案失败:', error);
      setError(`取消提案失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // 获取用户投票权重
  const getUserVotingPower = useCallback(async () => {
    if (!active || !account || !library || !chainId) {
      return '0';
    }
    
    try {
      // 获取基础投票权重
      const baseVotingPower = await getVotingPower(library, chainId, account);
      
      // 如果有声誉评分，计算带声誉加成的投票权重
      if (userReputation) {
        const votingPowerWithRep = await getVotingPowerWithReputation(
          library, 
          chainId, 
          account, 
          userReputation
        );
        
        setVotingPower(votingPowerWithRep);
        return votingPowerWithRep;
      }
      
      setVotingPower(baseVotingPower);
      return baseVotingPower;
    } catch (error) {
      console.error('获取投票权重失败:', error);
      return '0';
    }
  }, [active, account, library, chainId, userReputation]);
  
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
  
  // 获取提案模板列表
  const getProposalTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // 实际项目中应从API或IPFS获取
      // 这里使用模拟数据
      setProposalTemplates(MOCK_TEMPLATES);
      
      return MOCK_TEMPLATES;
    } catch (error) {
      console.error('获取提案模板失败:', error);
      setError('获取提案模板失败，请稍后再试');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 获取提案模板详情
  const getProposalTemplateById = useCallback(async (templateId) => {
    try {
      setIsLoading(true);
      setError('');
      
      // 实际项目中应从API或IPFS获取
      // 这里使用模拟数据
      const template = MOCK_TEMPLATES.find(t => t.id === templateId);
      
      if (!template) {
        setError('未找到指定模板');
        return null;
      }
      
      return template;
    } catch (error) {
      console.error('获取提案模板详情失败:', error);
      setError('获取提案模板详情失败，请稍后再试');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 创建提案模板
  const createProposalTemplate = useCallback(async (templateData) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      // 实际项目中应调用API或IPFS存储
      // 这里简单模拟创建过程
      const newTemplate = {
        ...templateData,
        id: `template-${Date.now()}`,
        author: account,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        rating: 0,
        isOfficial: false
      };
      
      // 更新本地状态
      setProposalTemplates(prev => [...prev, newTemplate]);
      
      setSuccessMessage('提案模板创建成功');
      return { success: true, templateId: newTemplate.id };
    } catch (error) {
      console.error('创建提案模板失败:', error);
      setError(`创建提案模板失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [active, account, library, chainId]);
  
  // 委托投票权
  const delegateVote = useCallback(async (delegateAddress, amount = '0', endTime = '0', restrictions = {}) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await delegateVotingPower(library, chainId, delegateAddress, amount, endTime, restrictions);
      
      if (result.success) {
        setSuccessMessage('投票权委托成功');
        
        // 更新当前委托信息
        const delegation = await getDelegation(library, chainId, account);
        setCurrentDelegation(delegation);
        
        return { success: true };
      } else {
        setError(`委托失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('委托投票权失败:', error);
      setError(`委托投票权失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [active, account, library, chainId]);
  
  // 撤销委托
  const revokeDelegation = useCallback(async () => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return { success: false, error: '请先连接钱包' };
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      // 调用撤销委托的合约方法
      // 这里简化处理，实际应调用合约方法
      const result = { success: true };
      
      if (result.success) {
        setSuccessMessage('委托已成功撤销');
        setCurrentDelegation(null);
        return { success: true };
      } else {
        setError(`撤销委托失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('撤销委托失败:', error);
      setError(`撤销委托失败: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [active, account, library, chainId]);
  
  // 获取当前委托信息
  const loadCurrentDelegation = useCallback(async () => {
    if (!active || !account || !library || !chainId) {
      return null;
    }
    
    try {
      const delegation = await getDelegation(library, chainId, account);
      setCurrentDelegation(delegation);
      return delegation;
    } catch (error) {
      console.error('获取委托信息失败:', error);
      return null;
    }
  }, [active, account, library, chainId]);
  
  // 初始加载
  useEffect(() => {
    if (active && library && chainId) {
      loadProposals(1);
      getUserVotingPower();
      loadCurrentDelegation();
      getProposalTemplates();
    }
  }, [active, library, chainId, loadProposals, getUserVotingPower, loadCurrentDelegation, getProposalTemplates]);
  
  // 当用户声誉变化时，重新计算投票权重
  useEffect(() => {
    if (active && account && library && chainId && userReputation) {
      getUserVotingPower();
    }
  }, [userReputation, getUserVotingPower, active, account, library, chainId]);
  
  // 上下文值
  const value = {
    proposals,
    currentProposal,
    userVotes,
    votingPower,
    isLoading,
    error,
    successMessage,
    hasMore,
    statistics,
    proposalTemplates,
    currentDelegation,
    loadProposals,
    loadProposalDetails,
    submitProposal,
    vote,
    queueProposalAction,
    executeProposalAction,
    cancelProposalAction,
    getUserVotingPower,
    loadMoreProposals,
    clearMessages,
    getProposalTemplates,
    getProposalTemplateById,
    createProposalTemplate,
    delegateVote,
    revokeDelegation,
    loadCurrentDelegation
  };
  
  return (
    <DAOContext.Provider value={value}>
      {children}
    </DAOContext.Provider>
  );
};

export default DAOContext;
