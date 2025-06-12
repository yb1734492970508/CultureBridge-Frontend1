import React, { useState, useEffect, useCallback } from 'react';
import { useDelegationManager } from '../../hooks/useDelegationManager';
import DelegateCard from './DelegateCard';
import DelegationStats from './DelegationStats';
import './DelegationDashboard.css';

/**
 * 委托仪表板组件
 * 展示用户的委托状态和管理功能
 */
const DelegationDashboard = ({ 
  userAddress,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDelegation, setShowCreateDelegation] = useState(false);

  const {
    delegations,
    delegatedPower,
    receivedDelegations,
    totalVotingPower,
    availablePower,
    loading,
    error,
    createDelegation,
    revokeDelegation,
    updateDelegation,
    getDelegationHistory
  } = useDelegationManager(userAddress);

  // 计算委托统计
  const delegationStats = React.useMemo(() => {
    const activeDelegations = delegations.filter(d => d.status === 'active');
    const totalDelegated = activeDelegations.reduce((sum, d) => sum + d.votingPower, 0);
    const totalReceived = receivedDelegations.reduce((sum, d) => sum + d.votingPower, 0);
    
    return {
      totalDelegated,
      totalReceived,
      activeDelegations: activeDelegations.length,
      delegationRate: totalVotingPower > 0 ? (totalDelegated / totalVotingPower) * 100 : 0,
      availableRate: totalVotingPower > 0 ? (availablePower / totalVotingPower) * 100 : 0
    };
  }, [delegations, receivedDelegations, totalVotingPower, availablePower]);

  // 处理委托撤销
  const handleRevokeDelegation = useCallback(async (delegationId) => {
    try {
      await revokeDelegation(delegationId);
    } catch (error) {
      console.error('撤销委托失败:', error);
    }
  }, [revokeDelegation]);

  // 处理委托更新
  const handleUpdateDelegation = useCallback(async (delegationId, updates) => {
    try {
      await updateDelegation(delegationId, updates);
    } catch (error) {
      console.error('更新委托失败:', error);
    }
  }, [updateDelegation]);

  // 渲染概览标签页
  const renderOverviewTab = () => (
    <div className="overview-tab">
      {/* 委托统计 */}
      <DelegationStats stats={delegationStats} />

      {/* 投票权分配图表 */}
      <div className="power-allocation-chart">
        <h3>投票权分配</h3>
        <div className="allocation-visual">
          <div className="allocation-bar">
            <div 
              className="allocated-portion"
              style={{ width: `${delegationStats.delegationRate}%` }}
              title={`已委托: ${delegationStats.delegationRate.toFixed(1)}%`}
            />
            <div 
              className="available-portion"
              style={{ width: `${delegationStats.availableRate}%` }}
              title={`可用: ${delegationStats.availableRate.toFixed(1)}%`}
            />
          </div>
          <div className="allocation-legend">
            <div className="legend-item">
              <span className="legend-color allocated" />
              <span>已委托 ({delegationStats.totalDelegated})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color available" />
              <span>可用 ({availablePower})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="quick-actions">
        <h3>快速操作</h3>
        <div className="action-buttons">
          <button
            className="action-button primary"
            onClick={() => setShowCreateDelegation(true)}
          >
            <span className="action-icon">➕</span>
            创建新委托
          </button>
          <button
            className="action-button secondary"
            onClick={() => setActiveTab('delegates')}
          >
            <span className="action-icon">🔍</span>
            发现代表
          </button>
          <button
            className="action-button secondary"
            onClick={() => setActiveTab('history')}
          >
            <span className="action-icon">📊</span>
            查看历史
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染我的委托标签页
  const renderMyDelegationsTab = () => (
    <div className="my-delegations-tab">
      <div className="tab-header">
        <h3>我的委托</h3>
        <button
          className="create-delegation-button"
          onClick={() => setShowCreateDelegation(true)}
        >
          <span className="button-icon">➕</span>
          新建委托
        </button>
      </div>

      {delegations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗳️</div>
          <h4>暂无委托</h4>
          <p>您还没有创建任何委托。开始委托您的投票权给信任的代表吧！</p>
          <button
            className="empty-action-button"
            onClick={() => setShowCreateDelegation(true)}
          >
            创建第一个委托
          </button>
        </div>
      ) : (
        <div className="delegations-grid">
          {delegations.map(delegation => (
            <DelegateCard
              key={delegation.id}
              delegation={delegation}
              onRevoke={() => handleRevokeDelegation(delegation.id)}
              onUpdate={(updates) => handleUpdateDelegation(delegation.id, updates)}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );

  // 渲染收到的委托标签页
  const renderReceivedDelegationsTab = () => (
    <div className="received-delegations-tab">
      <div className="tab-header">
        <h3>收到的委托</h3>
        <div className="received-stats">
          <span className="stat-item">
            <span className="stat-value">{receivedDelegations.length}</span>
            <span className="stat-label">委托人</span>
          </span>
          <span className="stat-item">
            <span className="stat-value">{delegationStats.totalReceived}</span>
            <span className="stat-label">总投票权</span>
          </span>
        </div>
      </div>

      {receivedDelegations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📥</div>
          <h4>暂无收到的委托</h4>
          <p>还没有人委托投票权给您。提高您的声誉和专业度来获得更多委托吧！</p>
        </div>
      ) : (
        <div className="received-delegations-list">
          {receivedDelegations.map(delegation => (
            <div key={delegation.id} className="received-delegation-item">
              <div className="delegator-info">
                <img
                  src={delegation.delegator.avatar}
                  alt={delegation.delegator.name}
                  className="delegator-avatar"
                />
                <div className="delegator-details">
                  <h4 className="delegator-name">{delegation.delegator.name}</h4>
                  <p className="delegation-type">{delegation.type}</p>
                </div>
              </div>
              <div className="delegation-power">
                <span className="power-value">{delegation.votingPower}</span>
                <span className="power-label">投票权</span>
              </div>
              <div className="delegation-date">
                {new Date(delegation.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="delegation-dashboard-loading">
        <div className="loading-spinner" />
        <p>正在加载委托信息...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="delegation-dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className={`delegation-dashboard ${className}`}>
      {/* 仪表板头部 */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">委托管理</h1>
          <p className="dashboard-subtitle">
            管理您的投票权委托，参与DAO治理决策
          </p>
        </div>
        
        {/* 总投票权显示 */}
        <div className="total-power-display">
          <div className="power-item">
            <span className="power-value">{totalVotingPower}</span>
            <span className="power-label">总投票权</span>
          </div>
          <div className="power-item">
            <span className="power-value">{availablePower}</span>
            <span className="power-label">可用投票权</span>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          概览
        </button>
        <button
          className={`tab-button ${activeTab === 'my-delegations' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-delegations')}
        >
          <span className="tab-icon">🗳️</span>
          我的委托
          {delegations.length > 0 && (
            <span className="tab-badge">{delegations.length}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          <span className="tab-icon">📥</span>
          收到的委托
          {receivedDelegations.length > 0 && (
            <span className="tab-badge">{receivedDelegations.length}</span>
          )}
        </button>
      </div>

      {/* 标签页内容 */}
      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'my-delegations' && renderMyDelegationsTab()}
        {activeTab === 'received' && renderReceivedDelegationsTab()}
      </div>
    </div>
  );
};

export default DelegationDashboard;

