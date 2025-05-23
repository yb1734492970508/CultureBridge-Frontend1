import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './VotingInterface.css';

// 治理合约ABI（简化版，实际使用时需要完整ABI）
const GOVERNANCE_ABI = [
  "function castVote(uint256 proposalId, uint8 support) external returns (uint256)",
  "function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason) external returns (uint256)",
  "function getVotingPower(address account) external view returns (uint256)",
  "function hasVoted(uint256 proposalId, address account) external view returns (bool)",
  "function getProposalDeadline(uint256 proposalId) external view returns (uint256)",
  "function getProposalState(uint256 proposalId) external view returns (uint8)"
];

// 治理合约地址（测试网）
const GOVERNANCE_ADDRESS = "0x9A5e5F32d3A0a5C59F3fA0D70B078e5A1F1CB729";

/**
 * 投票界面组件
 * 支持投票和投票理由提交
 */
const VotingInterface = ({ proposalId, onVoteSuccess }) => {
  const { active, account, library } = useBlockchain();
  
  // 投票状态
  const [voteSupport, setVoteSupport] = useState(1); // 0=反对, 1=支持, 2=弃权
  const [voteReason, setVoteReason] = useState('');
  const [includeReason, setIncludeReason] = useState(false);
  const [votingPower, setVotingPower] = useState('0');
  const [hasVoted, setHasVoted] = useState(false);
  const [isProposalActive, setIsProposalActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  // 操作状态
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
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
  
  // 加载投票数据
  useEffect(() => {
    if (!active || !account || !library || !proposalId) return;
    
    const loadVotingData = async () => {
      try {
        const governanceContract = getGovernanceContract();
        if (!governanceContract) {
          throw new Error('无法连接治理合约');
        }
        
        // 获取投票权重
        const power = await governanceContract.getVotingPower(account);
        setVotingPower(ethers.utils.formatEther(power));
        
        // 检查是否已投票
        const voted = await governanceContract.hasVoted(proposalId, account);
        setHasVoted(voted);
        
        // 获取提案状态
        const state = await governanceContract.getProposalState(proposalId);
        setIsProposalActive(state === 1); // 1 = 活跃状态
        
        // 获取投票截止时间
        const deadline = await governanceContract.getProposalDeadline(proposalId);
        updateTimeRemaining(deadline.toNumber());
        
        // 设置定时器更新剩余时间
        const timer = setInterval(() => {
          updateTimeRemaining(deadline.toNumber());
        }, 1000);
        
        return () => clearInterval(timer);
      } catch (err) {
        console.error('加载投票数据失败:', err);
        setError('加载投票数据失败，请刷新页面重试');
      }
    };
    
    loadVotingData();
  }, [active, account, library, proposalId]);
  
  // 更新剩余时间
  const updateTimeRemaining = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = deadline - now;
    
    if (diff <= 0) {
      setTimeRemaining('投票已结束');
      setIsProposalActive(false);
      return;
    }
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    let timeString = '';
    if (days > 0) {
      timeString = `${days}天 ${hours}小时`;
    } else if (hours > 0) {
      timeString = `${hours}小时 ${minutes}分钟`;
    } else {
      timeString = `${minutes}分钟 ${seconds}秒`;
    }
    
    setTimeRemaining(timeString);
  };
  
  // 提交投票
  const submitVote = async () => {
    if (!active || !account || !proposalId) {
      setError('请先连接钱包');
      return;
    }
    
    if (hasVoted) {
      setError('您已经对此提案投过票');
      return;
    }
    
    if (!isProposalActive) {
      setError('此提案当前不在投票期');
      return;
    }
    
    setIsVoting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const governanceContract = getGovernanceContract();
      if (!governanceContract) {
        throw new Error('无法连接治理合约');
      }
      
      let tx;
      
      if (includeReason && voteReason.trim()) {
        // 带理由投票
        tx = await governanceContract.castVoteWithReason(
          proposalId,
          voteSupport,
          voteReason.trim()
        );
      } else {
        // 不带理由投票
        tx = await governanceContract.castVote(
          proposalId,
          voteSupport
        );
      }
      
      setSuccessMessage('投票交易已提交，请等待确认...');
      
      // 等待交易确认
      await tx.wait();
      
      setSuccessMessage('投票成功！');
      setHasVoted(true);
      
      // 通知父组件投票成功
      if (onVoteSuccess) {
        setTimeout(() => {
          onVoteSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error('投票失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setError('您拒绝了交易签名');
      } else {
        setError(`投票失败: ${err.message || '请检查您的钱包连接并重试'}`);
      }
    } finally {
      setIsVoting(false);
    }
  };
  
  // 如果用户已投票或提案不活跃，显示状态信息
  if (hasVoted || !isProposalActive) {
    return (
      <div className="voting-interface">
        {hasVoted ? (
          <div className="vote-status voted">
            <div className="status-icon">✓</div>
            <div className="status-message">您已对此提案投票</div>
          </div>
        ) : (
          <div className="vote-status inactive">
            <div className="status-icon">⚠</div>
            <div className="status-message">此提案当前不在投票期</div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="voting-interface">
      <div className="voting-header">
        <h3>为此提案投票</h3>
        <div className="voting-power">
          您的投票权重: <span className="power-value">{parseFloat(votingPower).toLocaleString()} 票</span>
        </div>
        <div className="time-remaining">
          剩余时间: <span className="time-value">{timeRemaining}</span>
        </div>
      </div>
      
      <div className="vote-options">
        <div className={`vote-option ${voteSupport === 1 ? 'selected' : ''}`}>
          <input
            type="radio"
            id="voteFor"
            name="voteSupport"
            value={1}
            checked={voteSupport === 1}
            onChange={() => setVoteSupport(1)}
          />
          <label htmlFor="voteFor">
            <div className="option-icon for">👍</div>
            <div className="option-text">
              <div className="option-title">支持</div>
              <div className="option-description">我同意此提案</div>
            </div>
          </label>
        </div>
        
        <div className={`vote-option ${voteSupport === 0 ? 'selected' : ''}`}>
          <input
            type="radio"
            id="voteAgainst"
            name="voteSupport"
            value={0}
            checked={voteSupport === 0}
            onChange={() => setVoteSupport(0)}
          />
          <label htmlFor="voteAgainst">
            <div className="option-icon against">👎</div>
            <div className="option-text">
              <div className="option-title">反对</div>
              <div className="option-description">我不同意此提案</div>
            </div>
          </label>
        </div>
        
        <div className={`vote-option ${voteSupport === 2 ? 'selected' : ''}`}>
          <input
            type="radio"
            id="voteAbstain"
            name="voteSupport"
            value={2}
            checked={voteSupport === 2}
            onChange={() => setVoteSupport(2)}
          />
          <label htmlFor="voteAbstain">
            <div className="option-icon abstain">🤔</div>
            <div className="option-text">
              <div className="option-title">弃权</div>
              <div className="option-description">我暂不表态</div>
            </div>
          </label>
        </div>
      </div>
      
      <div className="vote-reason">
        <div className="reason-toggle">
          <input
            type="checkbox"
            id="includeReason"
            checked={includeReason}
            onChange={(e) => setIncludeReason(e.target.checked)}
          />
          <label htmlFor="includeReason">添加投票理由（公开）</label>
        </div>
        
        {includeReason && (
          <textarea
            className="reason-input"
            value={voteReason}
            onChange={(e) => setVoteReason(e.target.value)}
            placeholder="请输入您的投票理由..."
            rows={4}
          />
        )}
      </div>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      <div className="voting-actions">
        <button 
          className="vote-button"
          onClick={submitVote}
          disabled={isVoting}
        >
          {isVoting ? '投票中...' : '提交投票'}
        </button>
      </div>
    </div>
  );
};

export default VotingInterface;
