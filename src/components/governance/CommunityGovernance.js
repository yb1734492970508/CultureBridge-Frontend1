import React, { useState, useEffect, useCallback } from 'react';
import { useCommunityGovernance } from '../../hooks/useCommunityGovernance';
import GovernanceOverview from './GovernanceOverview';
import ProposalList from './ProposalList';
import VotingInterface from './VotingInterface';
import GovernanceStats from './GovernanceStats';
import CommunityPolls from './CommunityPolls';
import './CommunityGovernance.css';

/**
 * 社区治理组件
 * 提供社区治理和投票功能
 */
const CommunityGovernance = ({ 
  currentUser,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [proposalFilter, setProposalFilter] = useState('active'); // active, pending, completed, all
  const [selectedProposal, setSelectedProposal] = useState(null);

  const {
    governanceStats,
    proposals,
    userVotingPower,
    userVotes,
    communityPolls,
    loading,
    error,
    fetchGovernanceData,
    fetchProposals,
    fetchUserVotingPower,
    fetchUserVotes,
    fetchCommunityPolls,
    createProposal,
    voteOnProposal,
    delegateVotingPower,
    createPoll,
    voteOnPoll,
    refreshData
  } = useCommunityGovernance(currentUser?.address);

  // 初始化数据
  useEffect(() => {
    if (currentUser?.address) {
      fetchGovernanceData();
      fetchProposals(proposalFilter);
      fetchUserVotingPower();
      fetchUserVotes();
      fetchCommunityPolls();
    }
  }, [currentUser?.address, proposalFilter, fetchGovernanceData, fetchProposals, fetchUserVotingPower, fetchUserVotes, fetchCommunityPolls]);

  // 处理提案筛选变更
  const handleProposalFilterChange = useCallback((filter) => {
    setProposalFilter(filter);
    fetchProposals(filter);
  }, [fetchProposals]);

  // 处理创建提案
  const handleCreateProposal = useCallback(async (proposalData) => {
    try {
      await createProposal(proposalData);
      fetchProposals(proposalFilter);
      fetchGovernanceData();
    } catch (err) {
      console.error('创建提案失败:', err);
    }
  }, [createProposal, fetchProposals, proposalFilter, fetchGovernanceData]);

  // 处理投票
  const handleVoteOnProposal = useCallback(async (proposalId, vote, votingPower) => {
    try {
      await voteOnProposal(proposalId, vote, votingPower);
      fetchProposals(proposalFilter);
      fetchUserVotes();
      fetchGovernanceData();
    } catch (err) {
      console.error('投票失败:', err);
    }
  }, [voteOnProposal, fetchProposals, proposalFilter, fetchUserVotes, fetchGovernanceData]);

  // 处理委托投票权
  const handleDelegateVotingPower = useCallback(async (delegateAddress, amount) => {
    try {
      await delegateVotingPower(delegateAddress, amount);
      fetchUserVotingPower();
      fetchGovernanceData();
    } catch (err) {
      console.error('委托投票权失败:', err);
    }
  }, [delegateVotingPower, fetchUserVotingPower, fetchGovernanceData]);

  // 处理创建投票
  const handleCreatePoll = useCallback(async (pollData) => {
    try {
      await createPoll(pollData);
      fetchCommunityPolls();
    } catch (err) {
      console.error('创建投票失败:', err);
    }
  }, [createPoll, fetchCommunityPolls]);

  // 处理投票
  const handleVoteOnPoll = useCallback(async (pollId, optionId) => {
    try {
      await voteOnPoll(pollId, optionId);
      fetchCommunityPolls();
    } catch (err) {
      console.error('投票失败:', err);
    }
  }, [voteOnPoll, fetchCommunityPolls]);

  // 渲染标签页
  const renderTabs = () => {
    const tabs = [
      { id: 'overview', label: '治理概览', icon: '📊' },
      { id: 'proposals', label: '提案', icon: '📋', count: proposals.filter(p => p.status === 'active').length },
      { id: 'voting', label: '投票', icon: '🗳️' },
      { id: 'polls', label: '社区投票', icon: '📊', count: communityPolls.filter(p => p.status === 'active').length }
    ];

    return (
      <div className="governance-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.count > 0 && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  // 渲染提案筛选器
  const renderProposalFilters = () => (
    <div className="proposal-filters">
      <div className="filter-buttons">
        {[
          { value: 'active', label: '进行中' },
          { value: 'pending', label: '待执行' },
          { value: 'completed', label: '已完成' },
          { value: 'all', label: '全部' }
        ].map(filter => (
          <button
            key={filter.value}
            className={`filter-button ${proposalFilter === filter.value ? 'active' : ''}`}
            onClick={() => handleProposalFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );

  // 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content overview-content">
            <GovernanceOverview
              stats={governanceStats}
              userVotingPower={userVotingPower}
              recentProposals={proposals.slice(0, 5)}
              onCreateProposal={handleCreateProposal}
              onDelegateVotingPower={handleDelegateVotingPower}
            />
          </div>
        );
      
      case 'proposals':
        return (
          <div className="tab-content proposals-content">
            {renderProposalFilters()}
            <ProposalList
              proposals={proposals}
              currentUser={currentUser}
              userVotes={userVotes}
              onVoteOnProposal={handleVoteOnProposal}
              onSelectProposal={setSelectedProposal}
              onCreateProposal={handleCreateProposal}
            />
          </div>
        );
      
      case 'voting':
        return (
          <div className="tab-content voting-content">
            <VotingInterface
              selectedProposal={selectedProposal}
              userVotingPower={userVotingPower}
              userVotes={userVotes}
              onVoteOnProposal={handleVoteOnProposal}
              onDelegateVotingPower={handleDelegateVotingPower}
            />
          </div>
        );
      
      case 'polls':
        return (
          <div className="tab-content polls-content">
            <CommunityPolls
              polls={communityPolls}
              currentUser={currentUser}
              onCreatePoll={handleCreatePoll}
              onVoteOnPoll={handleVoteOnPoll}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading && proposals.length === 0) {
    return (
      <div className="governance-loading">
        <div className="loading-spinner" />
        <p>正在加载治理数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="governance-error">
        <div className="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{error.message}</p>
        <button onClick={refreshData}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className={`community-governance ${className}`}>
      {/* 页面头部 */}
      <div className="governance-header">
        <div className="header-content">
          <h1 className="governance-title">社区治理</h1>
          <p className="governance-subtitle">
            参与CultureBridge社区决策，共同塑造平台的未来发展
          </p>
        </div>

        {/* 治理统计 */}
        <GovernanceStats stats={governanceStats} userVotingPower={userVotingPower} />

        {/* 快速操作 */}
        <div className="quick-actions">
          <button 
            className="action-button primary"
            onClick={() => setActiveTab('proposals')}
          >
            <span className="action-icon">📝</span>
            创建提案
          </button>
          <button 
            className="action-button secondary"
            onClick={() => setActiveTab('voting')}
          >
            <span className="action-icon">🗳️</span>
            参与投票
          </button>
          <button 
            className="action-button secondary"
            onClick={refreshData}
            disabled={loading}
          >
            <span className="action-icon">🔄</span>
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 标签页导航 */}
      {renderTabs()}

      {/* 内容区域 */}
      <div className="governance-content">
        {renderContent()}
      </div>

      {/* 状态指示器 */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner small" />
        </div>
      )}
    </div>
  );
};

export default CommunityGovernance;

