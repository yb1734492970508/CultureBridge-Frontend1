import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { getProposals, getProposalById, createProposal, castVote } from '../../api/governance';
import './GovernanceProposal.css';

/**
 * 去中心化治理提案组件
 * 允许用户创建和投票社区治理提案
 */
const GovernanceProposal = () => {
  const { active, account, library } = useBlockchain();
  
  // 提案列表状态
  const [proposals, setProposals] = useState([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [proposalError, setProposalError] = useState(null);
  
  // 创建提案状态
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalCategory, setProposalCategory] = useState('COMMUNITY_INITIATIVE');
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [createError, setCreateError] = useState(null);
  
  // 投票状态
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [voteSupport, setVoteSupport] = useState('FOR'); // FOR, AGAINST, ABSTAIN
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState(null);
  
  // 提案类别选项
  const proposalCategories = [
    { value: 'COMMUNITY_INITIATIVE', label: '社区建设' },
    { value: 'CULTURAL_ACTIVITY', label: '文化活动' },
    { value: 'TECHNICAL_DEVELOPMENT', label: '技术开发' },
    { value: 'FUND_ALLOCATION', label: '资金分配' },
    { value: 'PARTNERSHIP', label: '合作伙伴' },
    { value: 'PARAMETER_CHANGE', label: '参数调整' },
    { value: 'OTHER', label: '其他' }
  ];
  
  // 提案状态映射
  const proposalStates = {
    'PENDING': { name: '待定', className: 'pending' },
    'ACTIVE': { name: '活跃', className: 'active' },
    'CANCELED': { name: '已取消', className: 'canceled' },
    'DEFEATED': { name: '已失败', className: 'defeated' },
    'SUCCEEDED': { name: '已通过', className: 'succeeded' },
    'QUEUED': { name: '已排队', className: 'queued' },
    'EXPIRED': { name: '已过期', className: 'expired' },
    'EXECUTED': { name: '已执行', className: 'executed' }
  };
  
  // 加载提案列表
  const loadProposals = async () => {
    if (!active) return;
    
    setIsLoadingProposals(true);
    setProposalError(null);
    
    try {
      const result = await getProposals();
      setProposals(result.proposals || []);
    } catch (err) {
      console.error('加载提案失败:', err);
      setProposalError('无法加载提案列表，请稍后重试');
    } finally {
      setIsLoadingProposals(false);
    }
  };
  
  // 当账户变化时重新加载提案
  useEffect(() => {
    if (active && account) {
      loadProposals();
    } else {
      setProposals([]);
    }
  }, [active, account]);
  
  // 创建新提案
  const handleCreateProposal = async () => {
    if (!active || !account) {
      setCreateError('请先连接您的钱包');
      return;
    }
    
    if (!proposalTitle || !proposalDescription) {
      setCreateError('请填写提案标题和描述');
      return;
    }
    
    setIsCreatingProposal(true);
    setCreateError(null);
    
    try {
      // 准备提案数据
      const proposalData = {
        title: proposalTitle,
        description: proposalDescription,
        proposalType: proposalCategory,
        targets: ["0xabcdef1234567890abcdef1234567890abcdef12"], // 示例目标地址
        values: ["0"],
        calldatas: ["0x"] // 示例空调用数据
      };
      
      // 调用API创建提案
      const result = await createProposal(proposalData);
      
      // 重置表单
      setProposalTitle('');
      setProposalDescription('');
      setProposalCategory('COMMUNITY_INITIATIVE');
      setShowCreateForm(false);
      
      // 重新加载提案列表
      loadProposals();
      
    } catch (err) {
      console.error('创建提案失败:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setCreateError(`创建提案失败: ${err.response.data.message}`);
      } else {
        setCreateError(`创建提案失败: ${err.message || '请稍后重试'}`);
      }
    } finally {
      setIsCreatingProposal(false);
    }
  };
  
  // 投票
  const handleCastVote = async () => {
    if (!active || !account || !selectedProposal) {
      setVoteError('请先连接您的钱包并选择提案');
      return;
    }
    
    setIsVoting(true);
    setVoteError(null);
    
    try {
      // 准备投票数据
      const voteData = {
        proposalId: selectedProposal.proposalId,
        support: voteSupport
      };
      
      // 调用API进行投票
      await castVote(voteData);
      
      // 重置选择
      setSelectedProposal(null);
      
      // 重新加载提案列表
      loadProposals();
      
    } catch (err) {
      console.error('投票失败:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setVoteError(`投票失败: ${err.response.data.message}`);
      } else {
        setVoteError(`投票失败: ${err.message || '请稍后重试'}`);
      }
    } finally {
      setIsVoting(false);
    }
  };
  
  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 计算投票百分比
  const calculateVotePercentage = (proposal) => {
    if (!proposal) return { for: 0, against: 0, abstain: 0 };
    
    const forVotes = parseInt(proposal.forVotes || 0);
    const againstVotes = parseInt(proposal.againstVotes || 0);
    const abstainVotes = parseInt(proposal.abstainVotes || 0);
    
    const totalVotes = forVotes + againstVotes + abstainVotes;
    
    if (totalVotes === 0) {
      return { for: 0, against: 0, abstain: 0 };
    }
    
    return {
      for: Math.round((forVotes / totalVotes) * 100),
      against: Math.round((againstVotes / totalVotes) * 100),
      abstain: Math.round((abstainVotes / totalVotes) * 100)
    };
  };
  
  // 获取提案类别标签
  const getCategoryLabel = (categoryValue) => {
    const category = proposalCategories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  
  // 格式化截止时间
  const formatDeadline = (deadline) => {
    if (!deadline) return '';
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return '已结束';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}天${hours}小时后结束`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}小时${minutes}分钟后结束`;
    }
  };
  
  // 渲染创建提案表单
  const renderCreateForm = () => {
    if (!showCreateForm) {
      return (
        <div className="create-proposal-button-container">
          <button 
            className="create-proposal-button"
            onClick={() => setShowCreateForm(true)}
          >
            创建新提案
          </button>
        </div>
      );
    }
    
    return (
      <div className="create-proposal-form">
        <h3>创建新提案</h3>
        
        <div className="form-group">
          <label htmlFor="proposalTitle">提案标题</label>
          <input
            id="proposalTitle"
            type="text"
            value={proposalTitle}
            onChange={(e) => setProposalTitle(e.target.value)}
            placeholder="输入提案标题"
            maxLength={100}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="proposalCategory">提案类别</label>
          <select
            id="proposalCategory"
            value={proposalCategory}
            onChange={(e) => setProposalCategory(e.target.value)}
          >
            {proposalCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="proposalDescription">提案描述</label>
          <textarea
            id="proposalDescription"
            value={proposalDescription}
            onChange={(e) => setProposalDescription(e.target.value)}
            placeholder="详细描述您的提案内容、目的和实施方法"
            rows={6}
          />
        </div>
        
        {createError && (
          <div className="error-message">{createError}</div>
        )}
        
        <div className="form-actions">
          <button 
            className="cancel-button"
            onClick={() => setShowCreateForm(false)}
            disabled={isCreatingProposal}
          >
            取消
          </button>
          <button 
            className="submit-button"
            onClick={handleCreateProposal}
            disabled={isCreatingProposal || !proposalTitle || !proposalDescription}
          >
            {isCreatingProposal ? '提交中...' : '提交提案'}
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染投票表单
  const renderVoteForm = () => {
    if (!selectedProposal) return null;
    
    return (
      <div className="vote-form">
        <div className="vote-form-header">
          <h3>投票: {selectedProposal.title}</h3>
          <button 
            className="close-vote-form"
            onClick={() => setSelectedProposal(null)}
          >
            ×
          </button>
        </div>
        
        <div className="vote-options">
          <div className="vote-option">
            <input
              type="radio"
              id="voteFor"
              name="voteSupport"
              value="FOR"
              checked={voteSupport === 'FOR'}
              onChange={() => setVoteSupport('FOR')}
            />
            <label htmlFor="voteFor">支持</label>
          </div>
          
          <div className="vote-option">
            <input
              type="radio"
              id="voteAgainst"
              name="voteSupport"
              value="AGAINST"
              checked={voteSupport === 'AGAINST'}
              onChange={() => setVoteSupport('AGAINST')}
            />
            <label htmlFor="voteAgainst">反对</label>
          </div>
          
          <div className="vote-option">
            <input
              type="radio"
              id="voteAbstain"
              name="voteSupport"
              value="ABSTAIN"
              checked={voteSupport === 'ABSTAIN'}
              onChange={() => setVoteSupport('ABSTAIN')}
            />
            <label htmlFor="voteAbstain">弃权</label>
          </div>
        </div>
        
        {voteError && (
          <div className="error-message">{voteError}</div>
        )}
        
        <div className="vote-actions">
          <button 
            className="vote-button"
            onClick={handleCastVote}
            disabled={isVoting}
          >
            {isVoting ? '投票中...' : '确认投票'}
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染提案列表
  const renderProposalList = () => {
    if (isLoadingProposals) {
      return <div className="loading-message">加载提案中...</div>;
    }
    
    if (proposalError) {
      return <div className="error-message">{proposalError}</div>;
    }
    
    if (proposals.length === 0) {
      return <div className="empty-message">暂无提案</div>;
    }
    
    return (
      <div className="proposal-list">
        {proposals.map(proposal => {
          const votePercentages = calculateVotePercentage(proposal);
          const state = proposalStates[proposal.status] || { name: '未知', className: '' };
          
          return (
            <div key={proposal.proposalId} className="proposal-card">
              <div className="proposal-header">
                <h3 className="proposal-title">{proposal.title}</h3>
                <div className={`proposal-status ${state.className}`}>
                  {state.name}
                </div>
              </div>
              
              <div className="proposal-meta">
                <div className="proposal-category">
                  {getCategoryLabel(proposal.proposalType)}
                </div>
                <div className="proposal-proposer">
                  提案人: {formatAddress(proposal.proposer)}
                </div>
                <div className="proposal-time">
                  {new Date(proposal.createdAt).toLocaleDateString('zh-CN')}
                </div>
                {proposal.deadline && (
                  <div className="proposal-deadline">
                    {formatDeadline(proposal.deadline)}
                  </div>
                )}
              </div>
              
              <div className="proposal-description">
                {proposal.description}
              </div>
              
              <div className="proposal-votes">
                <div className="vote-bars">
                  <div className="vote-bar-container">
                    <div className="vote-bar for" style={{ width: `${votePercentages.for}%` }}></div>
                    <div className="vote-bar against" style={{ width: `${votePercentages.against}%` }}></div>
                    <div className="vote-bar abstain" style={{ width: `${votePercentages.abstain}%` }}></div>
                  </div>
                  <div className="vote-labels">
                    <div className="vote-label">
                      <span className="vote-dot for"></span>
                      <span>支持: {votePercentages.for}%</span>
                    </div>
                    <div className="vote-label">
                      <span className="vote-dot against"></span>
                      <span>反对: {votePercentages.against}%</span>
                    </div>
                    <div className="vote-label">
                      <span className="vote-dot abstain"></span>
                      <span>弃权: {votePercentages.abstain}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="vote-counts">
                  <div>支持: {parseInt(proposal.forVotes || 0).toLocaleString()}</div>
                  <div>反对: {parseInt(proposal.againstVotes || 0).toLocaleString()}</div>
                  <div>弃权: {parseInt(proposal.abstainVotes || 0).toLocaleString()}</div>
                </div>
              </div>
              
              <div className="proposal-actions">
                <button 
                  className="view-details-button"
                  onClick={() => window.location.href = `/governance/proposals/${proposal.proposalId}`}
                >
                  查看详情
                </button>
                
                {proposal.status === 'ACTIVE' && (
                  <button 
                    className="vote-button"
                    onClick={() => setSelectedProposal(proposal)}
                  >
                    投票
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="governance-proposal-container">
      <div className="governance-header">
        <h2>社区治理</h2>
        <p>参与CultureBridge平台的治理决策，共同塑造文化交流的未来</p>
      </div>
      
      {renderCreateForm()}
      {renderVoteForm()}
      {renderProposalList()}
    </div>
  );
};

export default GovernanceProposal;
