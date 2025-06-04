import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import { useIdentity } from '../../context/identity/IdentityContext';
import { formatAddress, formatTimestamp, formatEther } from '../../utils/formatters';
import '../../styles/dao.css';

// 懒加载投票界面组件，减少初始加载时间
const VotingInterface = lazy(() => import('./VotingInterface'));

// 骨架屏组件
const ProposalDetailSkeleton = () => (
  <div className="dao-container">
    <div className="proposal-detail-skeleton">
      <div className="skeleton-header"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-meta">
        <div className="skeleton-meta-item"></div>
        <div className="skeleton-meta-item"></div>
        <div className="skeleton-meta-item"></div>
      </div>
      <div className="skeleton-description">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
      <div className="skeleton-voting">
        <div className="skeleton-progress"></div>
        <div className="skeleton-votes">
          <div className="skeleton-vote"></div>
          <div className="skeleton-vote"></div>
          <div className="skeleton-vote"></div>
        </div>
      </div>
      <div className="skeleton-actions">
        <div className="skeleton-button"></div>
      </div>
    </div>
  </div>
);

/**
 * 提案详情组件
 * 展示提案的详细信息、投票情况和执行状态
 * 
 * @component
 * @version 2.0.0
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 加载提案详情
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (proposalId && isMounted) {
        await loadProposalDetails(proposalId);
      }
    };
    
    fetchData();
    
    // 定期刷新提案状态
    const refreshInterval = setInterval(() => {
      if (isMounted && currentProposal && currentProposal.state < 7) {
        loadProposalDetails(proposalId, true); // 静默刷新，不显示加载状态
      }
    }, 30000); // 每30秒刷新一次
    
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [proposalId, loadProposalDetails]);
  
  // 使用useMemo缓存状态映射，避免重复计算
  const statusMap = useMemo(() => ({
    0: { className: 'status-pending', text: '待处理', description: '提案已创建，等待投票开始', icon: '⏳' },
    1: { className: 'status-active', text: '投票中', description: '提案正在投票中，请参与投票', icon: '🗳️' },
    2: { className: 'status-canceled', text: '已取消', description: '提案已被取消', icon: '❌' },
    3: { className: 'status-defeated', text: '已否决', description: '提案未获得足够支持，已被否决', icon: '👎' },
    4: { className: 'status-succeeded', text: '已通过', description: '提案已获得足够支持，等待执行', icon: '👍' },
    5: { className: 'status-queued', text: '队列中', description: '提案已进入执行队列，等待时间锁定期结束', icon: '⏱️' },
    6: { className: 'status-expired', text: '已过期', description: '提案已过期，未能在有效期内执行', icon: '⌛' },
    7: { className: 'status-executed', text: '已执行', description: '提案已成功执行', icon: '✅' }
  }), []);
  
  // 获取提案状态对应的样式类和文本
  const getStatusInfo = (status) => {
    return statusMap[status] || { className: '', text: '未知状态', description: '未知状态', icon: '❓' };
  };
  
  // 处理投票
  const handleVote = async (support, reason) => {
    try {
      setIsTransitioning(true);
      const result = await vote(proposalId, support, reason);
      if (result.success) {
        setShowVotingInterface(false);
      }
    } catch (error) {
      console.error('投票失败:', error);
    } finally {
      setIsTransitioning(false);
    }
  };
  
  // 处理将提案加入队列
  const handleQueueProposal = async () => {
    try {
      setIsTransitioning(true);
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
    } finally {
      setIsTransitioning(false);
    }
  };
  
  // 处理执行提案
  const handleExecuteProposal = async () => {
    try {
      setIsTransitioning(true);
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
    } finally {
      setIsTransitioning(false);
    }
  };
  
  // 检查用户是否已投票 - 使用useMemo缓存结果
  const hasUserVoted = useMemo(() => {
    return userVotes && userVotes[proposalId] && userVotes[proposalId].hasVoted;
  }, [userVotes, proposalId]);
  
  // 获取用户投票信息 - 使用useMemo缓存结果
  const userVoteInfo = useMemo(() => {
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
  }, [userVotes, proposalId]);
  
  // 渲染加载状态
  if (isLoading) {
    return <ProposalDetailSkeleton />;
  }
  
  // 渲染错误状态
  if (error) {
    return (
      <div className="dao-container">
        <div className="error-message" role="alert">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <div className="action-buttons">
            <button 
              onClick={clearMessages} 
              className="dao-btn secondary-btn"
              aria-label="关闭错误消息"
            >
              关闭
            </button>
            <button 
              onClick={() => navigate('/dao')} 
              className="dao-btn primary-btn"
              aria-label="返回提案列表"
            >
              返回提案列表
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 如果提案不存在
  if (!currentProposal) {
    return (
      <div className="dao-container">
        <div className="error-message" role="alert">
          <div className="error-icon">🔍</div>
          <p>未找到提案</p>
          <button 
            onClick={() => navigate('/dao')} 
            className="dao-btn primary-btn"
            aria-label="返回提案列表"
          >
            返回提案列表
          </button>
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
  
  // 计算投票进度 - 使用useMemo缓存计算结果
  const votingStats = useMemo(() => {
    const totalVotes = parseInt(currentProposal.forVotes) + 
                       parseInt(currentProposal.againstVotes) + 
                       parseInt(currentProposal.abstainVotes);
    
    const forPercentage = totalVotes > 0 ? (currentProposal.forVotes / totalVotes * 100).toFixed(2) : '0';
    const againstPercentage = totalVotes > 0 ? (currentProposal.againstVotes / totalVotes * 100).toFixed(2) : '0';
    const abstainPercentage = totalVotes > 0 ? (currentProposal.abstainVotes / totalVotes * 100).toFixed(2) : '0';
    
    return {
      totalVotes,
      forPercentage,
      againstPercentage,
      abstainPercentage
    };
  }, [currentProposal.forVotes, currentProposal.againstVotes, currentProposal.abstainVotes]);
  
  return (
    <div className="dao-container" aria-live="polite">
      <div className="proposal-detail-header">
        <button 
          onClick={() => navigate('/dao')} 
          className="back-button"
          aria-label="返回提案列表"
        >
          &larr; 返回提案列表
        </button>
        <h1 tabIndex="0">提案 #{proposalId}</h1>
      </div>
      
      {successMessage && (
        <div className="success-message" role="status">
          <div className="success-icon">✅</div>
          <p>{successMessage}</p>
          <button 
            onClick={clearMessages} 
            className="dao-btn secondary-btn"
            aria-label="关闭成功消息"
          >
            关闭
          </button>
        </div>
      )}
      
      <div className="proposal-detail-card">
        <div className="proposal-status-banner" role="status" aria-live="polite">
          <span className={`proposal-status ${statusInfo.className}`}>
            {statusInfo.icon} {statusInfo.text}
          </span>
          <p className="status-description">{statusInfo.description}</p>
        </div>
        
        <div className="proposal-detail-content">
          <h2 className="proposal-title" tabIndex="0">{proposalTitle}</h2>
          
          <div className="proposal-meta">
            <div className="meta-item">
              <span className="meta-label">提案人:</span>
              <span className="meta-value" title={currentProposal.proposer}>{formatAddress(currentProposal.proposer)}</span>
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
            <h3 tabIndex="0">提案描述</h3>
            <div className="description-content">
              {proposalDescription.split('\n').map((line, index) => (
                <p key={index} tabIndex="0">{line}</p>
              ))}
            </div>
          </div>
          
          <div className="proposal-actions">
            <h3 tabIndex="0">提案操作</h3>
            <div className="actions-content">
              {currentProposal.targets.map((target, index) => (
                <div key={index} className="action-item">
                  <div className="action-header">
                    <span className="action-number">操作 #{index + 1}</span>
                  </div>
                  <div className="action-details">
                    <div className="action-detail-item">
                      <span className="detail-label">目标合约:</span>
                      <span className="detail-value" title={target}>{formatAddress(target)}</span>
                    </div>
                    <div className="action-detail-item">
                      <span className="detail-label">发送数量:</span>
                      <span className="detail-value">{formatEther(currentProposal.values[index])} ETH</span>
                    </div>
                    <div className="action-detail-item">
                      <span className="detail-label">调用数据:</span>
                      <span className="detail-value calldata" title={currentProposal.calldatas[index]}>
                        {currentProposal.calldatas[index].length > 50 
                          ? `${currentProposal.calldatas[index].substring(0, 50)}...` 
                          : currentProposal.calldatas[index]}
                      </span>
                      <button 
                        className="copy-button" 
                        onClick={() => {
                          navigator.clipboard.writeText(currentProposal.calldatas[index]);
                          // 显示复制成功提示
                          const copyBtn = document.activeElement;
                          const originalText = copyBtn.textContent;
                          copyBtn.textContent = '已复制!';
                          setTimeout(() => {
                            copyBtn.textContent = originalText;
                          }, 2000);
                        }}
                        aria-label="复制调用数据"
                      >
                        复制
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="proposal-voting">
            <h3 tabIndex="0">投票情况</h3>
            <div className="voting-stats">
              <div className="voting-stat">
                <span className="stat-label">总投票数:</span>
                <span className="stat-value">{votingStats.totalVotes}</span>
              </div>
              <div className="voting-stat">
                <span className="stat-label">法定人数:</span>
                <span className="stat-value">{currentProposal.quorumVotes}</span>
              </div>
            </div>
            
            <div className="voting-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar">
                <div 
                  className="progress-for" 
                  style={{ width: `${votingStats.forPercentage}%` }}
                  title={`支持: ${votingStats.forPercentage}%`}
                ></div>
                <div 
                  className="progress-against" 
                  style={{ width: `${votingStats.againstPercentage}%` }}
                  title={`反对: ${votingStats.againstPercentage}%`}
                ></div>
                <div 
                  className="progress-abstain" 
                  style={{ width: `${votingStats.abstainPercentage}%` }}
                  title={`弃权: ${votingStats.abstainPercentage}%`}
                ></div>
              </div>
              
              <div className="vote-counts">
                <div className="vote-count vote-for">
                  <span className="vote-icon" role="img" aria-label="支持">👍</span>
                  <span className="vote-label">支持</span>
                  <span className="vote-number">{currentProposal.forVotes}</span>
                  <span className="vote-percentage">({votingStats.forPercentage}%)</span>
                </div>
                <div className="vote-count vote-against">
                  <span className="vote-icon" role="img" aria-label="反对">👎</span>
                  <span className="vote-label">反对</span>
                  <span className="vote-number">{currentProposal.againstVotes}</span>
                  <span className="vote-percentage">({votingStats.againstPercentage}%)</span>
                </div>
                <div className="vote-count vote-abstain">
                  <span className="vote-icon" role="img" aria-label="弃权">🤔</span>
                  <span className="vote-label">弃权</span>
                  <span className="vote-number">{currentProposal.abstainVotes}</span>
                  <span className="vote-percentage">({votingStats.abstainPercentage}%)</span>
                </div>
              </div>
            </div>
            
            {userVoteInfo && (
              <div className="user-vote-info" role="region" aria-label="您的投票信息">
                <h4 tabIndex="0">您的投票</h4>
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
            {currentProposal.state === 1 && !hasUserVoted && active && (
              <button 
                onClick={() => setShowVotingInterface(true)} 
                className="dao-btn primary-btn"
                disabled={isTransitioning}
                aria-label="参与投票"
              >
                {isTransitioning ? '处理中...' : '投票'}
              </button>
            )}
            
            {/* 加入队列按钮 - 仅在提案通过且未加入队列时显示 */}
            {currentProposal.state === 4 && active && (
              <button 
                onClick={handleQueueProposal} 
                className="dao-btn secondary-btn"
                disabled={isTransitioning}
                aria-label="将提案加入执行队列"
              >
                {isTransitioning ? '处理中...' : '加入执行队列'}
              </button>
            )}
            
            {/* 执行按钮 - 仅在提案在队列中且时间锁定期已过时显示 */}
            {currentProposal.state === 5 && active && (
              <button 
                onClick={handleExecuteProposal} 
                className="dao-btn primary-btn"
                disabled={isTransitioning}
                aria-label="执行提案"
              >
                {isTransitioning ? '处理中...' : '执行提案'}
              </button>
            )}
            
            {/* 执行状态信息 */}
            {executionStatus && (
              <div className="execution-status" role="status" aria-live="polite">
                <p>{executionStatus}</p>
              </div>
            )}
            
            {/* 未连接钱包提示 */}
            {!active && currentProposal.state === 1 && (
              <div className="wallet-warning" role="alert">
                <p>请先连接钱包以参与投票</p>
                <button 
                  onClick={() => navigate('/wallet')} 
                  className="dao-btn secondary-btn"
                  aria-label="连接钱包"
                >
                  连接钱包
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 投票界面 */}
      {showVotingInterface && (
        <Suspense fallback={<div className="loading-overlay"><div className="loading-spinner"></div></div>}>
          <VotingInterface 
            proposalId={proposalId}
            onVote={handleVote}
            onClose={() => setShowVotingInterface(false)}
            userReputation={userReputation}
            isTransitioning={isTransitioning}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ProposalDetail;
