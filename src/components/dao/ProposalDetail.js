import React, { useState, useEffect, useMemo, Suspense, lazy, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import { useIdentity } from '../../context/identity/IdentityContext';
import { formatAddress, formatTimestamp, formatEther } from '../../utils/formatters';
import '../../styles/dao.css';

// 懒加载投票界面组件，减少初始加载时间
const VotingInterface = lazy(() => import('./VotingInterface'));

/**
 * 提案详情组件 - 极致优化版
 * 展示提案的详细信息、投票情况和执行状态
 * 
 * 优化点：
 * 1. 性能优化（懒加载、虚拟化、缓存）
 * 2. 无障碍支持增强
 * 3. 动画和交互优化
 * 4. 移动端适配完善
 * 5. 错误处理和恢复机制
 * 6. 实时更新和数据同步
 * 
 * @component
 * @version 3.0.0
 */
const ProposalDetail = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const { account, active, chainId } = useBlockchain();
  const { userReputation, reputationScore } = useIdentity();
  
  // 引用缓存
  const detailsRef = useRef(null);
  const votingRef = useRef(null);
  const actionsRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const animationFrameRef = useRef(null);
  
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
    clearMessages,
    getProposalVoters
  } = useDAO();
  
  // 本地状态
  const [showVotingInterface, setShowVotingInterface] = useState(false);
  const [executionStatus, setExecutionStatus] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'voters', 'actions'
  const [voters, setVoters] = useState([]);
  const [votersPage, setVotersPage] = useState(1);
  const [isLoadingVoters, setIsLoadingVoters] = useState(false);
  const [hasMoreVoters, setHasMoreVoters] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // 加载提案详情
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (proposalId && isMounted) {
        await loadProposalDetails(proposalId);
      }
    };
    
    fetchData();
    
    // 定期刷新提案状态 - 使用递减间隔，减少不必要的网络请求
    const setupRefreshInterval = () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      
      // 根据提案状态调整刷新频率
      let refreshInterval = 30000; // 默认30秒
      if (currentProposal) {
        // 活跃投票中的提案更频繁刷新
        if (currentProposal.state === 1) {
          refreshInterval = 15000; // 15秒
        } 
        // 队列中的提案适中刷新
        else if (currentProposal.state === 5) {
          refreshInterval = 20000; // 20秒
        }
        // 已结束的提案减少刷新
        else if (currentProposal.state >= 6) {
          refreshInterval = 60000; // 60秒
        }
      }
      
      refreshTimerRef.current = setTimeout(() => {
        if (isMounted && currentProposal && currentProposal.state < 7) {
          loadProposalDetails(proposalId, true); // 静默刷新，不显示加载状态
          setupRefreshInterval(); // 递归设置下一次刷新
        }
      }, refreshInterval);
    };
    
    setupRefreshInterval();
    
    // 设置可见性检测
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          startEntranceAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (detailsRef.current) {
      observer.observe(detailsRef.current);
    }
    
    return () => {
      isMounted = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      observer.disconnect();
    };
  }, [proposalId, loadProposalDetails, currentProposal]);
  
  // 入场动画
  const startEntranceAnimation = () => {
    let start = null;
    const duration = 800; // 动画持续时间（毫秒）
    
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      setAnimationProgress(progress);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  // 加载投票者列表
  const loadVoters = useCallback(async (page = 1, append = false) => {
    if (isLoadingVoters || !currentProposal || !proposalId) return;
    
    try {
      setIsLoadingVoters(true);
      const pageSize = 10;
      const result = await getProposalVoters(proposalId, page, pageSize);
      
      if (result.success) {
        if (append) {
          setVoters(prev => [...prev, ...result.voters]);
        } else {
          setVoters(result.voters);
        }
        setHasMoreVoters(result.voters.length === pageSize);
      } else {
        console.error('加载投票者失败:', result.error);
      }
    } catch (error) {
      console.error('加载投票者出错:', error);
    } finally {
      setIsLoadingVoters(false);
    }
  }, [proposalId, currentProposal, getProposalVoters]);
  
  // 当切换到投票者标签时加载投票者
  useEffect(() => {
    if (activeTab === 'voters' && voters.length === 0 && !isLoadingVoters) {
      loadVoters(1);
    }
  }, [activeTab, voters.length, isLoadingVoters, loadVoters]);
  
  // 加载更多投票者
  const handleLoadMoreVoters = () => {
    if (!isLoadingVoters && hasMoreVoters) {
      const nextPage = votersPage + 1;
      setVotersPage(nextPage);
      loadVoters(nextPage, true);
    }
  };
  
  // 使用useMemo缓存状态映射，避免重复计算
  const statusMap = useMemo(() => ({
    0: { 
      className: 'status-pending', 
      text: '待处理', 
      description: '提案已创建，等待投票开始', 
      icon: '⏳',
      color: '#f39c12'
    },
    1: { 
      className: 'status-active', 
      text: '投票中', 
      description: '提案正在投票中，请参与投票', 
      icon: '🗳️',
      color: '#3498db'
    },
    2: { 
      className: 'status-canceled', 
      text: '已取消', 
      description: '提案已被取消', 
      icon: '❌',
      color: '#e74c3c'
    },
    3: { 
      className: 'status-defeated', 
      text: '已否决', 
      description: '提案未获得足够支持，已被否决', 
      icon: '👎',
      color: '#e74c3c'
    },
    4: { 
      className: 'status-succeeded', 
      text: '已通过', 
      description: '提案已获得足够支持，等待执行', 
      icon: '👍',
      color: '#2ecc71'
    },
    5: { 
      className: 'status-queued', 
      text: '队列中', 
      description: '提案已进入执行队列，等待时间锁定期结束', 
      icon: '⏱️',
      color: '#f1c40f'
    },
    6: { 
      className: 'status-expired', 
      text: '已过期', 
      description: '提案已过期，未能在有效期内执行', 
      icon: '⌛',
      color: '#95a5a6'
    },
    7: { 
      className: 'status-executed', 
      text: '已执行', 
      description: '提案已成功执行', 
      icon: '✅',
      color: '#27ae60'
    }
  }), []);
  
  // 获取提案状态对应的样式类和文本
  const getStatusInfo = (status) => {
    return statusMap[status] || { 
      className: '', 
      text: '未知状态', 
      description: '未知状态', 
      icon: '❓',
      color: '#95a5a6'
    };
  };
  
  // 处理投票
  const handleVote = async (support, reason) => {
    try {
      setIsTransitioning(true);
      const result = await vote(proposalId, support, reason);
      if (result.success) {
        setShowVotingInterface(false);
        
        // 添加乐观UI更新
        const voteWeight = reputationScore || 1;
        const optimisticUpdate = {
          ...currentProposal,
        };
        
        if (support === 0) {
          optimisticUpdate.againstVotes = (parseInt(optimisticUpdate.againstVotes) + voteWeight).toString();
        } else if (support === 1) {
          optimisticUpdate.forVotes = (parseInt(optimisticUpdate.forVotes) + voteWeight).toString();
        } else {
          optimisticUpdate.abstainVotes = (parseInt(optimisticUpdate.abstainVotes) + voteWeight).toString();
        }
        
        // 添加到投票者列表
        const newVoter = {
          address: account,
          support,
          weight: voteWeight,
          reason,
          timestamp: Date.now()
        };
        
        setVoters(prev => [newVoter, ...prev]);
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
        
        // 乐观UI更新
        setTimeout(() => {
          loadProposalDetails(proposalId);
        }, 1000);
      } else {
        setExecutionStatus(`加入队列失败: ${result.error}`);
      }
    } catch (error) {
      console.error('加入队列失败:', error);
      setExecutionStatus(`加入队列失败: ${error.message}`);
    } finally {
      setIsTransitioning(false);
      setShowConfirmation(false);
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
        
        // 乐观UI更新
        setTimeout(() => {
          loadProposalDetails(proposalId);
        }, 1000);
      } else {
        setExecutionStatus(`执行提案失败: ${result.error}`);
      }
    } catch (error) {
      console.error('执行提案失败:', error);
      setExecutionStatus(`执行提案失败: ${error.message}`);
    } finally {
      setIsTransitioning(false);
      setShowConfirmation(false);
    }
  };
  
  // 显示确认对话框
  const showConfirmDialog = (action) => {
    setConfirmationAction(action);
    setShowConfirmation(true);
  };
  
  // 处理确认操作
  const handleConfirmAction = () => {
    if (confirmationAction === 'queue') {
      handleQueueProposal();
    } else if (confirmationAction === 'execute') {
      handleExecuteProposal();
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
    const supportClass = vote.support === 0 ? 'against' : vote.support === 1 ? 'for' : 'abstain';
    
    return {
      support: vote.support,
      supportText,
      supportClass,
      weight: vote.weight,
      reason: vote.reason || '未提供理由',
      timestamp: vote.timestamp
    };
  }, [userVotes, proposalId]);
  
  // 计算投票进度 - 使用useMemo缓存计算结果
  const votingStats = useMemo(() => {
    if (!currentProposal) return { totalVotes: 0, forPercentage: 0, againstPercentage: 0, abstainPercentage: 0 };
    
    const forVotes = parseInt(currentProposal.forVotes) || 0;
    const againstVotes = parseInt(currentProposal.againstVotes) || 0;
    const abstainVotes = parseInt(currentProposal.abstainVotes) || 0;
    
    const totalVotes = forVotes + againstVotes + abstainVotes;
    
    const forPercentage = totalVotes > 0 ? (forVotes / totalVotes * 100).toFixed(2) : '0';
    const againstPercentage = totalVotes > 0 ? (againstVotes / totalVotes * 100).toFixed(2) : '0';
    const abstainPercentage = totalVotes > 0 ? (abstainVotes / totalVotes * 100).toFixed(2) : '0';
    
    // 计算是否达到法定人数
    const quorumVotes = parseInt(currentProposal.quorumVotes) || 0;
    const quorumReached = totalVotes >= quorumVotes;
    const quorumPercentage = quorumVotes > 0 ? (totalVotes / quorumVotes * 100).toFixed(2) : '0';
    
    // 计算预计结果
    let projectedResult = '未知';
    let resultClass = '';
    
    if (currentProposal.state === 1) { // 只在投票中状态预测
      if (forVotes > againstVotes && quorumReached) {
        projectedResult = '预计通过';
        resultClass = 'projected-pass';
      } else if (forVotes <= againstVotes) {
        projectedResult = '预计否决';
        resultClass = 'projected-fail';
      } else if (!quorumReached) {
        projectedResult = '尚未达到法定人数';
        resultClass = 'projected-pending';
      }
    }
    
    return {
      totalVotes,
      forVotes,
      againstVotes,
      abstainVotes,
      forPercentage,
      againstPercentage,
      abstainPercentage,
      quorumReached,
      quorumPercentage,
      projectedResult,
      resultClass
    };
  }, [currentProposal]);
  
  // 骨架屏组件
  const ProposalDetailSkeleton = () => (
    <div className="dao-container">
      <div className="proposal-detail-skeleton" aria-busy="true" aria-live="polite">
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
              onClick={() => {
                clearMessages();
                loadProposalDetails(proposalId); // 尝试重新加载
              }} 
              className="dao-btn secondary-btn"
              aria-label="重试"
            >
              <span className="btn-icon">🔄</span>
              <span className="btn-text">重试</span>
            </button>
            <button 
              onClick={() => navigate('/dao')} 
              className="dao-btn primary-btn"
              aria-label="返回提案列表"
            >
              <span className="btn-icon">⬅️</span>
              <span className="btn-text">返回提案列表</span>
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
            <span className="btn-icon">⬅️</span>
            <span className="btn-text">返回提案列表</span>
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
  
  // 计算时间相关信息
  const now = Date.now();
  const startTime = currentProposal.startTimestamp || 0;
  const endTime = currentProposal.endTimestamp || 0;
  const executionTime = currentProposal.eta || 0;
  
  const isVotingActive = currentProposal.state === 1;
  const isVotingEnded = now > endTime;
  const isExecutable = currentProposal.state === 5 && now > executionTime;
  const timeRemaining = isVotingActive ? Math.max(0, endTime - now) : 0;
  
  // 格式化剩余时间
  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return '已结束';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}天 ${hours}小时`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };
  
  return (
    <div 
      className={`dao-container proposal-detail-container ${isVisible ? 'visible' : ''}`} 
      aria-live="polite"
      ref={detailsRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
      }}
    >
      <div className="proposal-detail-header">
        <button 
          onClick={() => navigate('/dao')} 
          className="back-button"
          aria-label="返回提案列表"
        >
          <span className="back-icon">⬅️</span>
          <span className="back-text">返回提案列表</span>
        </button>
        <h1 tabIndex="0">提案 #{proposalId}</h1>
        
        <div className="proposal-network-info">
          <span className="network-indicator" title={`当前网络: ${chainId}`}>
            <span className="network-dot"></span>
            <span className="network-name">以太坊</span>
          </span>
        </div>
      </div>
      
      {successMessage && (
        <div 
          className="success-message" 
          role="status"
          aria-live="polite"
        >
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
      
      {executionStatus && (
        <div 
          className="execution-status" 
          role="status"
          aria-live="polite"
        >
          <div className="status-icon">
            {executionStatus.includes('成功') ? '✅' : executionStatus.includes('失败') ? '❌' : '⏳'}
          </div>
          <p>{executionStatus}</p>
          <button 
            onClick={() => setExecutionStatus('')} 
            className="dao-btn secondary-btn"
            aria-label="关闭状态消息"
          >
            关闭
          </button>
        </div>
      )}
      
      <div 
        className="proposal-detail-card"
        style={{
          transform: `translateY(${(1 - animationProgress) * 20}px)`,
          opacity: animationProgress
        }}
      >
        <div 
          className="proposal-status-banner" 
          role="status" 
          aria-live="polite"
          style={{
            backgroundColor: `${statusInfo.color}20`,
            borderColor: statusInfo.color
          }}
        >
          <span className={`proposal-status ${statusInfo.className}`}>
            <span className="status-icon">{statusInfo.icon}</span>
            <span className="status-text">{statusInfo.text}</span>
          </span>
          <p className="status-description">{statusInfo.description}</p>
          
          {isVotingActive && (
            <div className="voting-time-remaining">
              <span className="time-icon">⏱️</span>
              <span className="time-text">
                投票剩余时间: {formatTimeRemaining(timeRemaining)}
              </span>
              <div className="time-progress-bar">
                <div 
                  className="time-progress" 
                  style={{ 
                    width: `${Math.max(0, Math.min(100, ((endTime - now) / (endTime - startTime)) * 100))}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="proposal-tabs">
          <button 
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
            aria-selected={activeTab === 'details'}
            role="tab"
            aria-controls="details-panel"
            id="details-tab"
          >
            <span className="tab-icon">📄</span>
            <span className="tab-text">详情</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'voters' ? 'active' : ''}`}
            onClick={() => setActiveTab('voters')}
            aria-selected={activeTab === 'voters'}
            role="tab"
            aria-controls="voters-panel"
            id="voters-tab"
          >
            <span className="tab-icon">👥</span>
            <span className="tab-text">投票者</span>
            <span className="tab-badge">{votingStats.totalVotes}</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
            aria-selected={activeTab === 'actions'}
            role="tab"
            aria-controls="actions-panel"
            id="actions-tab"
          >
            <span className="tab-icon">⚙️</span>
            <span className="tab-text">操作</span>
            <span className="tab-badge">{currentProposal.targets.length}</span>
          </button>
        </div>
        
        <div 
          id="details-panel"
          className={`tab-panel ${activeTab === 'details' ? 'active' : ''}`}
          role="tabpanel"
          aria-labelledby="details-tab"
        >
          <div className="proposal-detail-content">
            <h2 className="proposal-title" tabIndex="0">{proposalTitle}</h2>
            
            <div className="proposal-meta">
              <div className="meta-item">
                <span className="meta-label">提案人:</span>
                <span className="meta-value" title={currentProposal.proposer}>
                  <span className="address-avatar" style={{ 
                    backgroundColor: `#${currentProposal.proposer.substring(2, 8)}` 
                  }}></span>
                  {formatAddress(currentProposal.proposer)}
                </span>
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
            
            <div className="proposal-voting" ref={votingRef}>
              <h3 tabIndex="0">投票情况</h3>
              <div className="voting-stats">
                <div className="voting-stat">
                  <span className="stat-label">总投票数:</span>
                  <span className="stat-value">{votingStats.totalVotes.toLocaleString()}</span>
                </div>
                <div className="voting-stat">
                  <span className="stat-label">法定人数:</span>
                  <span className="stat-value">{parseInt(currentProposal.quorumVotes).toLocaleString()}</span>
                </div>
                <div className="voting-stat">
                  <span className="stat-label">法定人数进度:</span>
                  <span className={`stat-value ${votingStats.quorumReached ? 'quorum-reached' : ''}`}>
                    {votingStats.quorumPercentage}%
                    {votingStats.quorumReached && <span className="quorum-icon">✓</span>}
                  </span>
                </div>
                {isVotingActive && (
                  <div className="voting-stat">
                    <span className="stat-label">预计结果:</span>
                    <span className={`stat-value ${votingStats.resultClass}`}>
                      {votingStats.projectedResult}
                    </span>
                  </div>
                )}
              </div>
              
              <div 
                className="voting-progress" 
                role="progressbar" 
                aria-valuemin="0" 
                aria-valuemax="100"
                aria-valuenow={votingStats.forPercentage}
                aria-valuetext={`支持: ${votingStats.forPercentage}%, 反对: ${votingStats.againstPercentage}%, 弃权: ${votingStats.abstainPercentage}%`}
              >
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
                    <span className="vote-number">{votingStats.forVotes.toLocaleString()}</span>
                    <span className="vote-percentage">({votingStats.forPercentage}%)</span>
                  </div>
                  <div className="vote-count vote-against">
                    <span className="vote-icon" role="img" aria-label="反对">👎</span>
                    <span className="vote-label">反对</span>
                    <span className="vote-number">{votingStats.againstVotes.toLocaleString()}</span>
                    <span className="vote-percentage">({votingStats.againstPercentage}%)</span>
                  </div>
                  <div className="vote-count vote-abstain">
                    <span className="vote-icon" role="img" aria-label="弃权">🤔</span>
                    <span className="vote-label">弃权</span>
                    <span className="vote-number">{votingStats.abstainVotes.toLocaleString()}</span>
                    <span className="vote-percentage">({votingStats.abstainPercentage}%)</span>
                  </div>
                </div>
              </div>
              
              {userVoteInfo && (
                <div 
                  className="user-vote-info" 
                  role="region" 
                  aria-label="您的投票信息"
                >
                  <h4 tabIndex="0">您的投票</h4>
                  <div className="user-vote-details">
                    <div className="vote-detail">
                      <span className="detail-label">投票选择:</span>
                      <span className={`detail-value vote-${userVoteInfo.supportClass}`}>
                        <span className="vote-icon">
                          {userVoteInfo.support === 0 ? '👎' : userVoteInfo.support === 1 ? '👍' : '🤔'}
                        </span>
                        {userVoteInfo.supportText}
                      </span>
                    </div>
                    <div className="vote-detail">
                      <span className="detail-label">投票权重:</span>
                      <span className="detail-value">{userVoteInfo.weight}</span>
                    </div>
                    <div className="vote-detail">
                      <span className="detail-label">投票时间:</span>
                      <span className="detail-value">
                        {userVoteInfo.timestamp ? formatTimestamp(userVoteInfo.timestamp) : '未知'}
                      </span>
                    </div>
                    <div className="vote-detail vote-reason">
                      <span className="detail-label">投票理由:</span>
                      <span className="detail-value">{userVoteInfo.reason}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {isVotingActive && active && !hasUserVoted && (
                <div className="voting-actions">
                  {!showVotingInterface ? (
                    <button 
                      className="dao-btn primary-btn vote-btn"
                      onClick={() => setShowVotingInterface(true)}
                      disabled={isTransitioning}
                      aria-label="参与投票"
                    >
                      <span className="btn-icon">🗳️</span>
                      <span className="btn-text">参与投票</span>
                    </button>
                  ) : (
                    <div className="voting-interface-container">
                      <Suspense fallback={<div className="loading-message">加载投票界面...</div>}>
                        <VotingInterface 
                          onVote={handleVote} 
                          onCancel={() => setShowVotingInterface(false)}
                          userReputation={userReputation}
                          isLoading={isTransitioning}
                        />
                      </Suspense>
                    </div>
                  )}
                </div>
              )}
              
              {isVotingActive && !active && (
                <div className="connect-wallet-notice">
                  <span className="notice-icon">🔌</span>
                  <span className="notice-text">请连接钱包参与投票</span>
                </div>
              )}
              
              {isVotingActive && active && hasUserVoted && (
                <div className="already-voted-notice">
                  <span className="notice-icon">✓</span>
                  <span className="notice-text">您已经对此提案进行了投票</span>
                </div>
              )}
              
              {!isVotingActive && currentProposal.state === 4 && active && (
                <div className="proposal-execution-actions">
                  <button 
                    className="dao-btn primary-btn"
                    onClick={() => showConfirmDialog('queue')}
                    disabled={isTransitioning}
                    aria-label="将提案加入执行队列"
                  >
                    <span className="btn-icon">⏱️</span>
                    <span className="btn-text">加入执行队列</span>
                  </button>
                </div>
              )}
              
              {isExecutable && active && (
                <div className="proposal-execution-actions">
                  <button 
                    className="dao-btn primary-btn"
                    onClick={() => showConfirmDialog('execute')}
                    disabled={isTransitioning}
                    aria-label="执行提案"
                  >
                    <span className="btn-icon">✅</span>
                    <span className="btn-text">执行提案</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div 
          id="voters-panel"
          className={`tab-panel ${activeTab === 'voters' ? 'active' : ''}`}
          role="tabpanel"
          aria-labelledby="voters-tab"
        >
          <div className="voters-list-container">
            <h3>投票者列表</h3>
            
            {voters.length === 0 && !isLoadingVoters && (
              <div className="no-voters-message">
                <span className="message-icon">🔍</span>
                <span className="message-text">暂无投票记录</span>
              </div>
            )}
            
            {voters.length > 0 && (
              <div className="voters-list">
                {voters.map((voter, index) => (
                  <div key={index} className="voter-item">
                    <div className="voter-avatar" style={{ 
                      backgroundColor: `#${voter.address.substring(2, 8)}` 
                    }}></div>
                    <div className="voter-info">
                      <div className="voter-address" title={voter.address}>
                        {formatAddress(voter.address)}
                      </div>
                      <div className="voter-vote-info">
                        <span className={`vote-type vote-${voter.support === 0 ? 'against' : voter.support === 1 ? 'for' : 'abstain'}`}>
                          {voter.support === 0 ? '反对' : voter.support === 1 ? '支持' : '弃权'}
                        </span>
                        <span className="vote-weight">
                          权重: {voter.weight}
                        </span>
                        <span className="vote-time">
                          {formatTimestamp(voter.timestamp)}
                        </span>
                      </div>
                      {voter.reason && (
                        <div className="voter-reason">
                          "{voter.reason}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {hasMoreVoters && (
                  <div className="load-more-container">
                    <button 
                      className="dao-btn secondary-btn load-more-btn"
                      onClick={handleLoadMoreVoters}
                      disabled={isLoadingVoters}
                    >
                      {isLoadingVoters ? (
                        <>
                          <span className="loading-spinner-small"></span>
                          <span>加载中...</span>
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">⬇️</span>
                          <span className="btn-text">加载更多</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {isLoadingVoters && voters.length === 0 && (
              <div className="loading-voters">
                <div className="loading-spinner"></div>
                <p>加载投票者数据...</p>
              </div>
            )}
          </div>
        </div>
        
        <div 
          id="actions-panel"
          className={`tab-panel ${activeTab === 'actions' ? 'active' : ''}`}
          role="tabpanel"
          aria-labelledby="actions-tab"
          ref={actionsRef}
        >
          <div className="proposal-actions">
            <h3 tabIndex="0">提案操作</h3>
            <div className="actions-content">
              {currentProposal.targets.map((target, index) => (
                <div key={index} className="action-item">
                  <div className="action-header">
                    <span className="action-number">操作 #{index + 1}</span>
                    <span className="action-type">
                      {currentProposal.values[index] !== '0' ? '转账操作' : '合约调用'}
                    </span>
                  </div>
                  <div className="action-details">
                    <div className="action-detail-item">
                      <span className="detail-label">目标合约:</span>
                      <span className="detail-value address-value" title={target}>
                        <span className="address-avatar" style={{ 
                          backgroundColor: `#${target.substring(2, 8)}` 
                        }}></span>
                        {formatAddress(target)}
                        <button 
                          className="copy-button" 
                          onClick={() => {
                            navigator.clipboard.writeText(target);
                            // 显示复制成功提示
                            const copyBtn = document.activeElement;
                            const originalText = copyBtn.textContent;
                            copyBtn.textContent = '已复制!';
                            setTimeout(() => {
                              copyBtn.textContent = originalText;
                            }, 2000);
                          }}
                          aria-label="复制合约地址"
                        >
                          <span className="copy-icon">📋</span>
                        </button>
                      </span>
                    </div>
                    <div className="action-detail-item">
                      <span className="detail-label">发送数量:</span>
                      <span className="detail-value">
                        <span className="eth-value">{formatEther(currentProposal.values[index])}</span>
                        <span className="eth-symbol">ETH</span>
                      </span>
                    </div>
                    <div className="action-detail-item">
                      <span className="detail-label">调用数据:</span>
                      <div className="calldata-container">
                        <span className="detail-value calldata" title={currentProposal.calldatas[index]}>
                          {currentProposal.calldatas[index].length > 50 
                            ? `${currentProposal.calldatas[index].substring(0, 50)}...` 
                            : currentProposal.calldatas[index]}
                        </span>
                        <div className="calldata-actions">
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
                            <span className="copy-icon">📋</span>
                            <span className="copy-text">复制</span>
                          </button>
                          <button 
                            className="view-button" 
                            onClick={() => {
                              // 显示完整调用数据
                              alert(currentProposal.calldatas[index]);
                            }}
                            aria-label="查看完整调用数据"
                          >
                            <span className="view-icon">🔍</span>
                            <span className="view-text">查看</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="action-detail-item">
                      <span className="detail-label">函数签名:</span>
                      <span className="detail-value function-signature">
                        {currentProposal.signatures[index] || '0x'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 确认对话框 */}
      {showConfirmation && (
        <div className="confirmation-dialog" role="dialog" aria-modal="true">
          <div className="dialog-content">
            <h3>确认操作</h3>
            <p>
              {confirmationAction === 'queue' 
                ? '您确定要将此提案加入执行队列吗？此操作将消耗Gas费用。' 
                : '您确定要执行此提案吗？此操作将消耗Gas费用并且不可撤销。'}
            </p>
            <div className="dialog-actions">
              <button 
                className="dao-btn secondary-btn"
                onClick={() => setShowConfirmation(false)}
                aria-label="取消"
              >
                取消
              </button>
              <button 
                className="dao-btn primary-btn"
                onClick={handleConfirmAction}
                disabled={isTransitioning}
                aria-label="确认"
              >
                {isTransitioning ? '处理中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 返回顶部按钮 */}
      <button 
        className="back-to-top-button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="返回顶部"
        title="返回顶部"
      >
        ↑
      </button>
    </div>
  );
};

export default ProposalDetail;
