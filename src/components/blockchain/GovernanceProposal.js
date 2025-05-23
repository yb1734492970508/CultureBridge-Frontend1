import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './GovernanceProposal.css';

// 治理合约ABI（简化版）
const GOVERNANCE_ABI = [
  "function propose(string memory title, string memory description, address[] memory targets, uint256[] memory values, bytes[] memory calldatas) returns (uint256)",
  "function castVote(uint256 proposalId, uint8 support) returns (uint256)",
  "function getProposalState(uint256 proposalId) view returns (uint8)",
  "function getProposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
  "function getProposalDescription(uint256 proposalId) view returns (string)",
  "function getProposalDeadline(uint256 proposalId) view returns (uint256)",
  "function getProposals() view returns (uint256[])",
  "event ProposalCreated(uint256 indexed proposalId, address proposer, string title)",
  "event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 weight)"
];

// 治理合约地址（测试网）
const GOVERNANCE_ADDRESS = "0x9A5e5F32d3A0a5C59F3fA0D70B078e5A1F1CB729";

/**
 * 去中心化治理提案组件
 * 允许用户创建和投票社区治理提案
 */
const GovernanceProposal = () => {
  const { active, account, library, chainId } = useBlockchain();
  
  // 提案列表状态
  const [proposals, setProposals] = useState([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [proposalError, setProposalError] = useState(null);
  
  // 创建提案状态
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalCategory, setProposalCategory] = useState('community');
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [createError, setCreateError] = useState(null);
  
  // 投票状态
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [voteSupport, setVoteSupport] = useState(1); // 0=反对, 1=支持, 2=弃权
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState(null);
  
  // 提案类别选项
  const proposalCategories = [
    { value: 'community', label: '社区建设' },
    { value: 'cultural', label: '文化活动' },
    { value: 'technical', label: '技术开发' },
    { value: 'financial', label: '财务决策' },
    { value: 'partnership', label: '合作伙伴' }
  ];
  
  // 提案状态映射
  const proposalStates = {
    0: { name: '待定', className: 'pending' },
    1: { name: '活跃', className: 'active' },
    2: { name: '已取消', className: 'canceled' },
    3: { name: '已失败', className: 'defeated' },
    4: { name: '已通过', className: 'succeeded' },
    5: { name: '已排队', className: 'queued' },
    6: { name: '已过期', className: 'expired' },
    7: { name: '已执行', className: 'executed' }
  };
  
  // 获取治理合约实例
  const getGovernanceContract = () => {
    if (!active || !library) return null;
    
    try {
      return new ethers.Contract(
        GOVERNANCE_ADDRESS,
        GOVERNANCE_ABI,
        library.getSigner()
      );
    } catch (err) {
      console.error('创建治理合约实例失败:', err);
      return null;
    }
  };
  
  // 加载提案列表
  const loadProposals = async () => {
    if (!active || !library) return;
    
    setIsLoadingProposals(true);
    setProposalError(null);
    
    try {
      const governanceContract = getGovernanceContract();
      if (!governanceContract) {
        throw new Error('无法连接治理合约');
      }
      
      // 在实际应用中，这里应该调用合约获取提案列表
      // 这里我们使用模拟数据
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成模拟提案数据
      const mockProposals = [
        {
          id: 1,
          title: '增加中国传统文化展示区域',
          description: '提议在平台首页增加中国传统文化展示区域，包括书法、国画、戏曲等内容，提高中国传统文化的展示度。',
          proposer: '0x7a16fF8270133F063aAb6C9977183D9e72835428',
          category: 'cultural',
          state: 1, // 活跃
          forVotes: ethers.utils.parseEther('1200'),
          againstVotes: ethers.utils.parseEther('300'),
          abstainVotes: ethers.utils.parseEther('100'),
          deadline: Math.floor(Date.now() / 1000) + 86400 * 3, // 3天后
          hasVoted: false
        },
        {
          id: 2,
          title: '建立跨文化交流基金',
          description: '建议设立专项基金，用于支持平台上的跨文化交流活动，包括线上讲座、文化工作坊和艺术展览等。',
          proposer: '0x3F8C962eb167aD2f80C72b5F933511CcDF0719D6',
          category: 'financial',
          state: 4, // 已通过
          forVotes: ethers.utils.parseEther('2500'),
          againstVotes: ethers.utils.parseEther('500'),
          abstainVotes: ethers.utils.parseEther('200'),
          deadline: Math.floor(Date.now() / 1000) - 86400, // 1天前
          hasVoted: true,
          userVote: 1 // 用户投了支持票
        },
        {
          id: 3,
          title: '集成更多语言学习资源',
          description: '提议与专业语言学习平台合作，集成更多高质量的语言学习资源，包括课程、练习和测试等。',
          proposer: account,
          category: 'partnership',
          state: 1, // 活跃
          forVotes: ethers.utils.parseEther('800'),
          againstVotes: ethers.utils.parseEther('200'),
          abstainVotes: ethers.utils.parseEther('50'),
          deadline: Math.floor(Date.now() / 1000) + 86400 * 5, // 5天后
          hasVoted: false
        },
        {
          id: 4,
          title: '优化移动端用户体验',
          description: '建议对移动端应用进行全面优化，提高响应速度，简化操作流程，增强用户体验。',
          proposer: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
          category: 'technical',
          state: 3, // 已失败
          forVotes: ethers.utils.parseEther('700'),
          againstVotes: ethers.utils.parseEther('1200'),
          abstainVotes: ethers.utils.parseEther('100'),
          deadline: Math.floor(Date.now() / 1000) - 86400 * 2, // 2天前
          hasVoted: true,
          userVote: 0 // 用户投了反对票
        },
        {
          id: 5,
          title: '组织线下文化交流活动',
          description: '提议在主要城市组织线下文化交流活动，增强社区成员之间的联系，促进面对面的文化交流。',
          proposer: '0x6B51E0e69AF95626e9d4053D2ae68555e54BFd64',
          category: 'community',
          state: 1, // 活跃
          forVotes: ethers.utils.parseEther('1500'),
          againstVotes: ethers.utils.parseEther('400'),
          abstainVotes: ethers.utils.parseEther('150'),
          deadline: Math.floor(Date.now() / 1000) + 86400 * 2, // 2天后
          hasVoted: false
        }
      ];
      
      setProposals(mockProposals);
    } catch (err) {
      console.error('加载提案失败:', err);
      setProposalError('无法加载提案列表，请稍后重试');
    } finally {
      setIsLoadingProposals(false);
    }
  };
  
  // 当账户或链ID变化时重新加载提案
  useEffect(() => {
    if (active && account) {
      loadProposals();
    } else {
      setProposals([]);
    }
  }, [active, account, chainId]);
  
  // 创建新提案
  const createProposal = async () => {
    if (!active || !account || !library) {
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
      const governanceContract = getGovernanceContract();
      if (!governanceContract) {
        throw new Error('无法连接治理合约');
      }
      
      // 在实际应用中，这里应该调用合约创建提案
      // 这里我们模拟创建过程
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 创建新提案对象
      const newProposal = {
        id: proposals.length + 1,
        title: proposalTitle,
        description: proposalDescription,
        proposer: account,
        category: proposalCategory,
        state: 1, // 活跃
        forVotes: ethers.utils.parseEther('0'),
        againstVotes: ethers.utils.parseEther('0'),
        abstainVotes: ethers.utils.parseEther('0'),
        deadline: Math.floor(Date.now() / 1000) + 86400 * 7, // 7天后
        hasVoted: false
      };
      
      // 更新提案列表
      setProposals(prev => [newProposal, ...prev]);
      
      // 重置表单
      setProposalTitle('');
      setProposalDescription('');
      setProposalCategory('community');
      setShowCreateForm(false);
      
    } catch (err) {
      console.error('创建提案失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setCreateError('您拒绝了交易签名');
      } else {
        setCreateError(`创建提案失败: ${err.message || '请稍后重试'}`);
      }
    } finally {
      setIsCreatingProposal(false);
    }
  };
  
  // 投票
  const castVote = async () => {
    if (!active || !account || !library || !selectedProposal) {
      setVoteError('请先连接您的钱包并选择提案');
      return;
    }
    
    setIsVoting(true);
    setVoteError(null);
    
    try {
      const governanceContract = getGovernanceContract();
      if (!governanceContract) {
        throw new Error('无法连接治理合约');
      }
      
      // 在实际应用中，这里应该调用合约进行投票
      // 这里我们模拟投票过程
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 更新提案投票状态
      setProposals(prev => prev.map(p => {
        if (p.id === selectedProposal.id) {
          // 更新投票数据
          const updatedProposal = { ...p, hasVoted: true, userVote: voteSupport };
          
          // 根据投票类型更新票数
          if (voteSupport === 0) {
            updatedProposal.againstVotes = ethers.BigNumber.from(p.againstVotes).add(ethers.utils.parseEther('100'));
          } else if (voteSupport === 1) {
            updatedProposal.forVotes = ethers.BigNumber.from(p.forVotes).add(ethers.utils.parseEther('100'));
          } else {
            updatedProposal.abstainVotes = ethers.BigNumber.from(p.abstainVotes).add(ethers.utils.parseEther('100'));
          }
          
          return updatedProposal;
        }
        return p;
      }));
      
      // 重置选择
      setSelectedProposal(null);
      
    } catch (err) {
      console.error('投票失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setVoteError('您拒绝了交易签名');
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
  
  // 格式化投票数
  const formatVotes = (votes) => {
    if (!votes) return '0';
    
    const votesInEther = parseFloat(ethers.utils.formatEther(votes));
    
    if (votesInEther >= 1000000) {
      return `${(votesInEther / 1000000).toFixed(2)}M`;
    } else if (votesInEther >= 1000) {
      return `${(votesInEther / 1000).toFixed(2)}K`;
    } else {
      return votesInEther.toFixed(2);
    }
  };
  
  // 计算投票百分比
  const calculateVotePercentage = (proposal) => {
    if (!proposal) return { for: 0, against: 0, abstain: 0 };
    
    const forVotes = ethers.BigNumber.from(proposal.forVotes);
    const againstVotes = ethers.BigNumber.from(proposal.againstVotes);
    const abstainVotes = ethers.BigNumber.from(proposal.abstainVotes);
    
    const totalVotes = forVotes.add(againstVotes).add(abstainVotes);
    
    if (totalVotes.eq(0)) {
      return { for: 0, against: 0, abstain: 0 };
    }
    
    return {
      for: Math.round(forVotes.mul(100).div(totalVotes).toNumber()),
      against: Math.round(againstVotes.mul(100).div(totalVotes).toNumber()),
      abstain: Math.round(abstainVotes.mul(100).div(totalVotes).toNumber())
    };
  };
  
  // 格式化截止时间
  const formatDeadline = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = deadline - now;
    
    if (diff <= 0) {
      return '已结束';
    }
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    
    if (days > 0) {
      return `${days}天${hours}小时后结束`;
    } else {
      const minutes = Math.floor((diff % 3600) / 60);
      return `${hours}小时${minutes}分钟后结束`;
    }
  };
  
  // 获取提案类别标签
  const getCategoryLabel = (categoryValue) => {
    const category = proposalCategories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
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
            onClick={createProposal}
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
              value={1}
              checked={voteSupport === 1}
              onChange={() => setVoteSupport(1)}
            />
            <label htmlFor="voteFor">支持</label>
          </div>
          
          <div className="vote-option">
            <input
              type="radio"
              id="voteAgainst"
              name="voteSupport"
              value={0}
              checked={voteSupport === 0}
              onChange={() => setVoteSupport(0)}
            />
            <label htmlFor="voteAgainst">反对</label>
          </div>
          
          <div className="vote-option">
            <input
              type="radio"
              id="voteAbstain"
              name="voteSupport"
              value={2}
              checked={voteSupport === 2}
              onChange={() => setVoteSupport(2)}
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
            onClick={castVote}
            disabled={isVoting}
          >
            {isVoting ? '投票中...' : '确认投票'}
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染提案列表
  const renderProposals = () => {
    if (!active) {
      return (
        <div className="governance-message">
          <p>请连接您的钱包以参与社区治理</p>
        </div>
      );
    }
    
    if (isLoadingProposals && proposals.length === 0) {
      return (
        <div className="governance-loading">
          <div className="governance-loading-spinner"></div>
          <p>加载提案列表...</p>
        </div>
      );
    }
    
    if (proposalError && proposals.length === 0) {
      return (
        <div className="governance-error">
          <p>{proposalError}</p>
          <button onClick={loadProposals}>重试</button>
        </div>
      );
    }
    
    if (proposals.length === 0) {
      return (
        <div className="governance-empty">
          <p>暂无提案</p>
          <button 
            className="create-first-proposal"
            onClick={() => setShowCreateForm(true)}
          >
            创建第一个提案
          </button>
        </div>
      );
    }
    
    return (
      <div className="proposal-list">
        {proposals.map(proposal => {
          const votePercentages = calculateVotePercentage(proposal);
          
          return (
            <div key={proposal.id} className="proposal-item">
              <div className="proposal-header">
                <div className="proposal-title-container">
                  <h3 className="proposal-title">{proposal.title}</h3>
                  <span className={`proposal-state ${proposalStates[proposal.state].className}`}>
                    {proposalStates[proposal.state].name}
                  </span>
                </div>
                <div className="proposal-meta">
                  <span className="proposal-category">{getCategoryLabel(proposal.category)}</span>
                  <span className="proposal-id">ID: {proposal.id}</span>
                </div>
              </div>
              
              <div className="proposal-body">
                <p className="proposal-description">{proposal.description}</p>
                
                <div className="proposal-details">
                  <div className="proposal-creator">
                    <span className="detail-label">提案人:</span>
                    <span className="detail-value">
                      {proposal.proposer === account ? '您' : formatAddress(proposal.proposer)}
                    </span>
                  </div>
                  <div className="proposal-deadline">
                    <span className="detail-label">截止时间:</span>
                    <span className="detail-value">{formatDeadline(proposal.deadline)}</span>
                  </div>
                </div>
                
                <div className="proposal-votes">
                  <div className="vote-bars">
                    <div className="vote-bar-container">
                      <div className="vote-bar-label">
                        <span>支持</span>
                        <span>{formatVotes(proposal.forVotes)} ({votePercentages.for}%)</span>
                      </div>
                      <div className="vote-bar">
                        <div 
                          className="vote-bar-fill for" 
                          style={{ width: `${votePercentages.for}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="vote-bar-container">
                      <div className="vote-bar-label">
                        <span>反对</span>
                        <span>{formatVotes(proposal.againstVotes)} ({votePercentages.against}%)</span>
                      </div>
                      <div className="vote-bar">
                        <div 
                          className="vote-bar-fill against" 
                          style={{ width: `${votePercentages.against}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="vote-bar-container">
                      <div className="vote-bar-label">
                        <span>弃权</span>
                        <span>{formatVotes(proposal.abstainVotes)} ({votePercentages.abstain}%)</span>
                      </div>
                      <div className="vote-bar">
                        <div 
                          className="vote-bar-fill abstain" 
                          style={{ width: `${votePercentages.abstain}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="proposal-footer">
                {proposal.hasVoted ? (
                  <div className="user-vote-status">
                    <span>您已投票: </span>
                    <span className={`vote-type ${
                      proposal.userVote === 0 ? 'against' : 
                      proposal.userVote === 1 ? 'for' : 'abstain'
                    }`}>
                      {proposal.userVote === 0 ? '反对' : 
                       proposal.userVote === 1 ? '支持' : '弃权'}
                    </span>
                  </div>
                ) : proposal.state === 1 ? (
                  <button 
                    className="vote-now-button"
                    onClick={() => setSelectedProposal(proposal)}
                  >
                    立即投票
                  </button>
                ) : (
                  <div className="voting-closed">
                    投票已结束
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="governance-proposal">
      <div className="governance-header">
        <h2>社区治理</h2>
        <p>参与CultureBridge社区决策，共同塑造平台未来</p>
      </div>
      
      <div className="governance-content">
        {renderCreateForm()}
        {renderProposals()}
        {renderVoteForm()}
      </div>
    </div>
  );
};

export default GovernanceProposal;
