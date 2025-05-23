import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './ProposalDetails.css';

// 治理合约ABI（简化版，实际使用时需要完整ABI）
const GOVERNANCE_ABI = [
  "function getProposal(uint256 proposalId) view returns (tuple(uint256 id, address proposer, string title, string description, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool executed, bool canceled))",
  "function getProposalState(uint256 proposalId) view returns (uint8)",
  "function getProposalActions(uint256 proposalId) view returns (address[] targets, uint256[] values, bytes[] calldatas, string description)",
  "function hasVoted(uint256 proposalId, address account) view returns (bool)",
  "function getReceipt(uint256 proposalId, address voter) view returns (tuple(bool hasVoted, uint8 support, uint256 votes))",
  "function getProposalThreshold() view returns (uint256)",
  "function getQuorumVotes() view returns (uint256)"
];

// 治理合约地址（测试网）
const GOVERNANCE_ADDRESS = "0x9A5e5F32d3A0a5C59F3fA0D70B078e5A1F1CB729";

/**
 * 提案详情组件
 * 展示提案的详细信息、投票进度和执行状态
 */
const ProposalDetails = ({ proposalId, onBack }) => {
  const { active, account, library, chainId } = useBlockchain();
  
  // 提案数据
  const [proposal, setProposal] = useState(null);
  const [proposalState, setProposalState] = useState(null);
  const [proposalActions, setProposalActions] = useState(null);
  const [userVoteReceipt, setUserVoteReceipt] = useState(null);
  const [proposalThreshold, setProposalThreshold] = useState('0');
  const [quorumVotes, setQuorumVotes] = useState('0');
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 提案状态映射
  const proposalStates = {
    0: { name: '待定', className: 'pending', description: '提案正在等待进入投票期' },
    1: { name: '活跃', className: 'active', description: '提案当前处于投票期，可以进行投票' },
    2: { name: '已取消', className: 'canceled', description: '提案已被取消' },
    3: { name: '已失败', className: 'defeated', description: '提案未达到通过所需的投票数量' },
    4: { name: '已通过', className: 'succeeded', description: '提案已获得足够的支持票，等待执行' },
    5: { name: '已排队', className: 'queued', description: '提案已进入执行队列' },
    6: { name: '已过期', className: 'expired', description: '提案在队列中过期，未能执行' },
    7: { name: '已执行', className: 'executed', description: '提案已成功执行' }
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
  
  // 加载提案详情
  useEffect(() => {
    if (!active || !library || !proposalId) return;
    
    const loadProposalDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const governanceContract = getGovernanceContract();
        if (!governanceContract) {
          throw new Error('无法连接治理合约');
        }
        
        // 获取提案数据
        const proposalData = await governanceContract.getProposal(proposalId);
        
        // 获取提案状态
        const state = await governanceContract.getProposalState(proposalId);
        
        // 获取提案执行操作
        const actions = await governanceContract.getProposalActions(proposalId);
        
        // 获取用户投票记录
        let receipt = null;
        if (account) {
          const hasVoted = await governanceContract.hasVoted(proposalId, account);
          if (hasVoted) {
            receipt = await governanceContract.getReceipt(proposalId, account);
          }
        }
        
        // 获取提案门槛和法定票数
        const threshold = await governanceContract.getProposalThreshold();
        const quorum = await governanceContract.getQuorumVotes();
        
        // 格式化提案数据
        const formattedProposal = {
          id: proposalData.id.toString(),
          proposer: proposalData.proposer,
          title: proposalData.title,
          description: proposalData.description,
          startBlock: proposalData.startBlock.toNumber(),
          endBlock: proposalData.endBlock.toNumber(),
          forVotes: ethers.utils.formatEther(proposalData.forVotes),
          againstVotes: ethers.utils.formatEther(proposalData.againstVotes),
          abstainVotes: ethers.utils.formatEther(proposalData.abstainVotes),
          executed: proposalData.executed,
          canceled: proposalData.canceled
        };
        
        // 格式化执行操作
        const formattedActions = {
          targets: actions.targets,
          values: actions.values.map(v => ethers.utils.formatEther(v)),
          calldatas: actions.calldatas,
          description: actions.description
        };
        
        // 格式化用户投票记录
        const formattedReceipt = receipt ? {
          hasVoted: receipt.hasVoted,
          support: receipt.support,
          votes: ethers.utils.formatEther(receipt.votes)
        } : null;
        
        setProposal(formattedProposal);
        setProposalState(state);
        setProposalActions(formattedActions);
        setUserVoteReceipt(formattedReceipt);
        setProposalThreshold(ethers.utils.formatEther(threshold));
        setQuorumVotes(ethers.utils.formatEther(quorum));
      } catch (err) {
        console.error('加载提案详情失败:', err);
        setError('无法加载提案详情，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProposalDetails();
  }, [active, library, account, proposalId, chainId]);
  
  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 计算投票百分比
  const calculateVotePercentage = () => {
    if (!proposal) return { for: 0, against: 0, abstain: 0 };
    
    const forVotes = parseFloat(proposal.forVotes);
    const againstVotes = parseFloat(proposal.againstVotes);
    const abstainVotes = parseFloat(proposal.abstainVotes);
    
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
  
  // 计算法定人数进度
  const calculateQuorumProgress = () => {
    if (!proposal || !quorumVotes) return 0;
    
    const forVotes = parseFloat(proposal.forVotes);
    const quorum = parseFloat(quorumVotes);
    
    if (quorum === 0) return 100;
    
    const progress = (forVotes / quorum) * 100;
    return Math.min(progress, 100);
  };
  
  // 渲染提案状态标签
  const renderStateLabel = () => {
    if (proposalState === null) return null;
    
    const state = proposalStates[proposalState];
    
    return (
      <div className={`proposal-state ${state.className}`}>
        <span className="state-name">{state.name}</span>
        <span className="state-description">{state.description}</span>
      </div>
    );
  };
  
  // 渲染投票进度条
  const renderVoteProgress = () => {
    if (!proposal) return null;
    
    const percentages = calculateVotePercentage();
    
    return (
      <div className="vote-progress">
        <div className="progress-bar">
          <div 
            className="progress-for" 
            style={{ width: `${percentages.for}%` }}
            title={`支持: ${percentages.for}%`}
          ></div>
          <div 
            className="progress-against" 
            style={{ width: `${percentages.against}%` }}
            title={`反对: ${percentages.against}%`}
          ></div>
          <div 
            className="progress-abstain" 
            style={{ width: `${percentages.abstain}%` }}
            title={`弃权: ${percentages.abstain}%`}
          ></div>
        </div>
        
        <div className="vote-counts">
          <div className="vote-count for">
            <span className="vote-label">支持</span>
            <span className="vote-value">{parseFloat(proposal.forVotes).toLocaleString()} ({percentages.for}%)</span>
          </div>
          <div className="vote-count against">
            <span className="vote-label">反对</span>
            <span className="vote-value">{parseFloat(proposal.againstVotes).toLocaleString()} ({percentages.against}%)</span>
          </div>
          <div className="vote-count abstain">
            <span className="vote-label">弃权</span>
            <span className="vote-value">{parseFloat(proposal.abstainVotes).toLocaleString()} ({percentages.abstain}%)</span>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染法定人数进度
  const renderQuorumProgress = () => {
    if (!proposal || !quorumVotes) return null;
    
    const progress = calculateQuorumProgress();
    const quorum = parseFloat(quorumVotes).toLocaleString();
    
    return (
      <div className="quorum-progress">
        <div className="quorum-header">
          <span className="quorum-label">法定票数进度</span>
          <span className="quorum-value">{Math.round(progress)}%</span>
        </div>
        <div className="quorum-bar">
          <div 
            className="quorum-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="quorum-info">
          需要至少 {quorum} 票支持才能达到法定票数
        </div>
      </div>
    );
  };
  
  // 渲染用户投票记录
  const renderUserVote = () => {
    if (!userVoteReceipt || !userVoteReceipt.hasVoted) return null;
    
    const voteTypes = ['反对', '支持', '弃权'];
    const voteType = voteTypes[userVoteReceipt.support] || '未知';
    
    return (
      <div className="user-vote">
        <div className="user-vote-header">您的投票</div>
        <div className="user-vote-details">
          <div className="user-vote-type">
            <span className="vote-label">投票类型:</span>
            <span className={`vote-value ${voteType === '支持' ? 'for' : voteType === '反对' ? 'against' : 'abstain'}`}>
              {voteType}
            </span>
          </div>
          <div className="user-vote-power">
            <span className="vote-label">投票权重:</span>
            <span className="vote-value">{parseFloat(userVoteReceipt.votes).toLocaleString()} 票</span>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染提案执行操作
  const renderProposalActions = () => {
    if (!proposalActions || !proposalActions.targets || proposalActions.targets.length === 0) {
      return null;
    }
    
    return (
      <div className="proposal-actions">
        <h3>执行操作</h3>
        
        {proposalActions.targets.map((target, index) => (
          <div key={index} className="action-item">
            <div className="action-target">
              <span className="action-label">目标合约:</span>
              <span className="action-value">{target}</span>
            </div>
            
            <div className="action-value">
              <span className="action-label">发送数量:</span>
              <span className="action-value">{proposalActions.values[index]} ETH</span>
            </div>
            
            <div className="action-calldata">
              <span className="action-label">调用数据:</span>
              <span className="action-value calldata">{proposalActions.calldatas[index]}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染提案描述
  const renderProposalDescription = () => {
    if (!proposal || !proposal.description) return null;
    
    // 这里可以添加Markdown渲染库，如react-markdown
    // 简单起见，我们只做基本的换行处理
    const formattedDescription = proposal.description.split('\n').map((line, index) => (
      <p key={index}>{line}</p>
    ));
    
    return (
      <div className="proposal-description">
        <h3>提案描述</h3>
        <div className="description-content">
          {formattedDescription}
        </div>
      </div>
    );
  };
  
  // 渲染提案信息
  const renderProposalInfo = () => {
    if (!proposal) return null;
    
    return (
      <div className="proposal-info">
        <div className="info-item">
          <span className="info-label">提案ID:</span>
          <span className="info-value">{proposal.id}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">提案人:</span>
          <span className="info-value">{formatAddress(proposal.proposer)}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">开始区块:</span>
          <span className="info-value">{proposal.startBlock}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">结束区块:</span>
          <span className="info-value">{proposal.endBlock}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">提案门槛:</span>
          <span className="info-value">{parseFloat(proposalThreshold).toLocaleString()} 票</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">法定票数:</span>
          <span className="info-value">{parseFloat(quorumVotes).toLocaleString()} 票</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="proposal-details">
      <div className="details-header">
        <button className="back-button" onClick={onBack}>
          &larr; 返回提案列表
        </button>
        
        {proposal && (
          <h2 className="proposal-title">{proposal.title}</h2>
        )}
        
        {renderStateLabel()}
      </div>
      
      {isLoading ? (
        <div className="loading-spinner">加载提案详情...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : proposal ? (
        <div className="details-content">
          <div className="details-main">
            {renderVoteProgress()}
            {renderQuorumProgress()}
            {renderUserVote()}
            {renderProposalDescription()}
            {renderProposalActions()}
          </div>
          
          <div className="details-sidebar">
            {renderProposalInfo()}
          </div>
        </div>
      ) : (
        <div className="error-message">未找到提案</div>
      )}
    </div>
  );
};

export default ProposalDetails;
