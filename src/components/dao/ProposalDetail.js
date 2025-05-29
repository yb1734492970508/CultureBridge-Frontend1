import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import { useIdentity } from '../../context/identity/IdentityContext';
import { formatAddress, formatTimestamp, formatEther } from '../../utils/formatters';
import VotingInterface from './VotingInterface';
import '../../styles/dao.css';

/**
 * 提案详情组件
 * 展示提案的详细信息、投票情况和执行状态
 */
const ProposalDetail = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const { account, active } = useBlockchain();
  const { userReputation } = useIdentity();
  
  const { 
    currentProposal, 
    userVotes,
    isLoading, 
    error, 
    successMessage,
    loadProposalDetails,
    vote,
    queueProposalAction,
    executeProposalAction,
    clearMessages
  } = useDAO();
  
  // 本地状态
  const [showVotingInterface, setShowVotingInterface] = useState(false);
  const [executionStatus, setExecutionStatus] = useState('');
  
  // 加载提案详情
  useEffect(() => {
    if (proposalId) {
      loadProposalDetails(proposalId);
    }
  }, [proposalId, loadProposalDetails]);
  
  // 获取提案状态对应的样式类和文本
  const getStatusInfo = (status) => {
    const statusMap = {
      0: { className: 'status-pending', text: '待处理', description: '提案已创建，等待投票开始' },
      1: { className: 'status-active', text: '投票中', description: '提案正在投票中，请参与投票' },
      2: { className: 'status-canceled', text: '已取消', description: '提案已被取消' },
      3: { className: 'status-defeated', text: '已否决', description: '提案未获得足够支持，已被否决' },
      4: { className: 'status-succeeded', text: '已通过', description: '提案已获得足够支持，等待执行' },
      5: { className: 'status-queued', text: '队列中', description: '提案已进入执行队列，等待时间锁定期结束' },
      6: { className: 'status-expired', text: '已过期', description: '提案已过期，未能在有效期内执行' },
      7: { className: 'status-executed', text: '已执行', description: '提案已成功执行' }
    };
    
    return statusMap[status] || { className: '', text: '未知状态', description: '未知状态' };
  };
  
  // 处理投票
  const handleVote = async (support, reason) => {
    try {
      const result = await vote(proposalId, support, reason);
      if (result.success) {
        setShowVotingInterface(false);
      }
    } catch (error) {
      console.error('投票失败:', error);
    }
  };
  
  // 处理将提案加入队列
  const handleQueueProposal = async () => {
    try {
      setExecutionStatus('正在将提案加入队列...');
      const result = await queueProposalAction(proposalId);
      if (result.success) {
        setExecutionStatus('提案已成功加入队列');
      } else {
        setExecutionStatus(`加入队列失败: ${result.error}`);
      }
    } catch (error) {
      console.error('加入队列失败:', error);
      setExecutionStatus(`加入队列失败: ${error.message}`);
    }
  };
  
  // 处理执行提案
  const handleExecuteProposal = async () => {
    try {
      setExecutionStatus('正在执行提案...');
      const result = await executeProposalAction(proposalId);
      if (result.success) {
        setExecutionStatus('提案已成功执行');
      } else {
        setExecutionStatus(`执行提案失败: ${result.error}`);
      }
    } catch (error) {
      console.error('执行提案失败:', error);
      setExecutionStatus(`执行提案失败: ${error.message}`);
    }
  };
  
  // 检查用户是否已投票
  const hasUserVoted = () => {
    return userVotes && userVotes[proposalId] && userVotes[proposalId].hasVoted;
  };
  
  // 获取用户投票信息
  const getUserVoteInfo = () => {
    if (!userVotes || !userVotes[proposalId] || !userVotes[proposalId].hasVoted) {
      return null;
    }
    
    const vote = userVotes[proposalId];
    const supportText = vote.support === 0 ? '反对' : vote.support === 1 ? '支持' : '弃权';
    
    return {
      support: vote.support,
      supportText,
      weight: vote.weight,
      reason: vote.reason || '未提供理由'
    };
  };
  
  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="dao-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载提案详情中...</p>
        </div>
      </div>
    );
  }
  
  // 渲染错误状态
  if (error) {
    return (
      <div className="dao-container">
        <div className="error-message">
          <p>{error}</p>
          <div className="action-buttons">
            <button onClick={clearMessages} className="dao-btn secondary-btn">关闭</button>
            <button onClick={() => navigate('/dao')} className="dao-btn primary-btn">返回提案列表</button>
          </div>
        </div>
      </div>
    );
  }
  
  // 如果提案不存在
  if (!currentProposal) {
    return (
      <div className="dao-container">
        <div className="error-message">
          <p>未找到提案</p>
          <button onClick={() => navigate('/dao')} className="dao-btn primary-btn">返回提案列表</button>
        </div>
      </div>
    );
  }
  
  // 获取状态信息
  const statusInfo = getStatusInfo(currentProposal.state);
  
  // 解析提案描述
  const proposalLines = currentProposal.description.split('\n');
  const proposalTitle = proposalLines[0] || '无标题提案';
  const proposalDescription = proposalLines.slice(1).join('\n').trim();
  
  // 计算投票进度
  const totalVotes = parseInt(currentProposal.forVotes) + 
                     parseInt(currentProposal.againstVotes) + 
                     parseInt(currentProposal.abstainVotes);
  
  const forPercentage = totalVotes > 0 ? (currentProposal.forVotes / totalVotes * 100).toFixed(2) : '0';
  const againstPercentage = totalVotes > 0 ? (currentProposal.againstVotes / totalVotes * 100).toFixed(2) : '0';
  const abstainPercentage = totalVotes > 0 ? (currentProposal.abstainVotes / totalVotes * 100).toFixed(2) : '0';
  
  // 用户投票信息
  const userVoteInfo = getUserVoteInfo();
  
  return (
    <div className="dao-container">
      <div className="proposal-detail-header">
        <button onClick={() => navigate('/dao')} className="back-button">
          &larr; 返回提案列表
        </button>
        <h1>提案 #{proposalId}</h1>
      </div>
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
          <button onClick={clearMessages} className="dao-btn secondary-btn">关闭</button>
        </div>
      )}
      
      <div className="proposal-detail-card">
        <div className="proposal-status-banner">
          <span className={`proposal-status ${statusInfo.className}`}>
            {statusInfo.text}
          </span>
          <p className="status-description">{statusInfo.description}</p>
        </div>
        
        <div className="proposal-detail-content">
          <h2 className="proposal-title">{proposalTitle}</h2>
          
          <div className="proposal-meta">
            <div className="meta-item">
              <span className="meta-label">提案人:</span>
              <span className="meta-value">{formatAddress(currentProposal.proposer)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">创建时间:</span>
              <span className="meta-value">{formatTimestamp(currentProposal.startBlock)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">投票截止时间:</span>
              <span className="meta-value">{formatTimestamp(currentProposal.endBlock)}</span>
            </div>
          </div>
          
          <div className="proposal-description">
            <h3>提案描述</h3>
            <div className="description-content">
              {proposalDescription.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
          
          <div className="proposal-actions">
            <h3>提案操作</h3>
            <div className="actions-content">
              {currentProposal.targets.map((target, index) => (
                <div key={index} className="action-item">
                  <div className="action-header">
                    <span className="action-number">操作 #{index + 1}</span>
                  </div>
                  <div className="action-details">
                    <div className="action-detail-item">
                      <span className="detail-label">目标合约:</span>
                      <span className="detail-value">{formatAddress(target)}</span>
                    </div>
                    <div className="action-detail-item">
                      <span className="detail-label">发送数量:</span>
                      <span className="detail-value">{formatEther(currentProposal.values[index])} ETH</span>
                    </div>
                    <div className="action-detail-item">
                      <span className="detail-label">调用数据:</span>
                      <span className="detail-value calldata">{currentProposal.calldatas[index]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="proposal-voting">
            <h3>投票情况</h3>
            <div className="voting-stats">
              <div className="voting-stat">
                <span className="stat-label">总投票数:</span>
                <span className="stat-value">{totalVotes}</span>
              </div>
              <div className="voting-stat">
                <span className="stat-label">法定人数:</span>
                <span className="stat-value">{currentProposal.quorumVotes}</span>
              </div>
            </div>
            
            <div className="voting-progress">
              <div className="progress-bar">
                <div 
                  className="progress-for" 
                  style={{ width: `${forPercentage}%` }}
                  title={`支持: ${forPercentage}%`}
                ></div>
                <div 
                  className="progress-against" 
                  style={{ width: `${againstPercentage}%` }}
                  title={`反对: ${againstPercentage}%`}
                ></div>
                <div 
                  className="progress-abstain" 
                  style={{ width: `${abstainPercentage}%` }}
                  title={`弃权: ${abstainPercentage}%`}
                ></div>
              </div>
              
              <div className="vote-counts">
                <div className="vote-count vote-for">
                  <span className="vote-icon">👍</span>
                  <span className="vote-label">支持</span>
                  <span className="vote-number">{currentProposal.forVotes}</span>
                  <span className="vote-percentage">({forPercentage}%)</span>
                </div>
                <div className="vote-count vote-against">
                  <span className="vote-icon">👎</span>
                  <span className="vote-label">反对</span>
                  <span className="vote-number">{currentProposal.againstVotes}</span>
                  <span className="vote-percentage">({againstPercentage}%)</span>
                </div>
                <div className="vote-count vote-abstain">
                  <span className="vote-icon">🤔</span>
                  <span className="vote-label">弃权</span>
                  <span className="vote-number">{currentProposal.abstainVotes}</span>
                  <span className="vote-percentage">({abstainPercentage}%)</span>
                </div>
              </div>
            </div>
            
            {userVoteInfo && (
              <div className="user-vote-info">
                <h4>您的投票</h4>
                <div className="user-vote-details">
                  <div className="vote-detail">
                    <span className="detail-label">投票选择:</span>
                    <span className={`detail-value vote-${userVoteInfo.supportText}`}>
                      {userVoteInfo.supportText}
                    </span>
                  </div>
                  <div className="vote-detail">
                    <span className="detail-label">投票权重:</span>
                    <span className="detail-value">{userVoteInfo.weight}</span>
                  </div>
                  {userVoteInfo.reason && (
                    <div className="vote-detail">
                      <span className="detail-label">投票理由:</span>
                      <span className="detail-value">{userVoteInfo.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="proposal-actions-buttons">
            {/* 投票按钮 - 仅在投票期内且用户未投票时显示 */}
            {currentProposal.state === 1 && !hasUserVoted() && active && (
              <button 
                onClick={() => setShowVotingInterface(true)} 
                className="dao-btn primary-btn"
              >
                投票
              </button>
            )}
            
            {/* 加入队列按钮 - 仅在提案通过且未加入队列时显示 */}
            {currentProposal.state === 4 && active && (
              <button 
                onClick={handleQueueProposal} 
                className="dao-btn secondary-btn"
              >
                加入执行队列
              </button>
            )}
            
            {/* 执行按钮 - 仅在提案在队列中且时间锁定期已过时显示 */}
            {currentProposal.state === 5 && active && (
              <button 
                onClick={handleExecuteProposal} 
                className="dao-btn primary-btn"
              >
                执行提案
              </button>
            )}
            
            {/* 执行状态信息 */}
            {executionStatus && (
              <div className="execution-status">
                <p>{executionStatus}</p>
              </div>
            )}
            
            {/* 未连接钱包提示 */}
            {!active && currentProposal.state === 1 && (
              <div className="wallet-warning">
                <p>请先连接钱包以参与投票</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 投票界面 */}
      {showVotingInterface && (
        <VotingInterface 
          proposalId={proposalId}
          onVote={handleVote}
          onClose={() => setShowVotingInterface(false)}
          userReputation={userReputation}
        />
      )}
    </div>
  );
};

export default ProposalDetail;
