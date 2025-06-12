import React, { useState, useEffect, useCallback } from 'react';
import { useDelegateDiscovery } from '../../hooks/useDelegateDiscovery';
import DelegateProfileCard from './DelegateProfileCard';
import DelegateFilters from './DelegateFilters';
import DelegateComparison from './DelegateComparison';
import './DelegateDiscovery.css';

/**
 * 代表发现页面组件
 * 提供代表搜索、筛选、比较和选择功能
 */
const DelegateDiscovery = ({ 
  userProfile,
  onDelegateSelect,
  className = ""
}) => {
  const [filters, setFilters] = useState({
    expertise: [],
    performance: { min: 0, max: 100 },
    participation: { min: 0, max: 100 },
    reputation: [],
    location: '',
    language: []
  });
  const [sortBy, setSortBy] = useState('match_score');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, comparison
  const [selectedDelegates, setSelectedDelegates] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const {
    delegates,
    recommendations,
    loading,
    error,
    searchDelegates,
    getRecommendations,
    getDelegateDetails
  } = useDelegateDiscovery();

  // 获取推荐代表
  useEffect(() => {
    if (userProfile) {
      getRecommendations(userProfile);
    }
  }, [userProfile, getRecommendations]);

  // 筛选和排序代表
  const filteredDelegates = React.useMemo(() => {
    let filtered = delegates;

    // 应用筛选条件
    if (filters.expertise.length > 0) {
      filtered = filtered.filter(delegate =>
        delegate.expertise.some(exp => 
          filters.expertise.includes(exp.area)
        )
      );
    }

    if (filters.performance.min > 0 || filters.performance.max < 100) {
      filtered = filtered.filter(delegate =>
        delegate.statistics.performanceScore >= filters.performance.min &&
        delegate.statistics.performanceScore <= filters.performance.max
      );
    }

    if (filters.participation.min > 0 || filters.participation.max < 100) {
      filtered = filtered.filter(delegate =>
        delegate.statistics.participationRate * 100 >= filters.participation.min &&
        delegate.statistics.participationRate * 100 <= filters.participation.max
      );
    }

    if (filters.reputation.length > 0) {
      filtered = filtered.filter(delegate =>
        filters.reputation.includes(delegate.verification.reputation)
      );
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'match_score':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'performance':
          return b.statistics.performanceScore - a.statistics.performanceScore;
        case 'participation':
          return b.statistics.participationRate - a.statistics.participationRate;
        case 'voting_power':
          return b.statistics.totalVotingPower - a.statistics.totalVotingPower;
        case 'experience':
          return b.statistics.totalDelegations - a.statistics.totalDelegations;
        default:
          return 0;
      }
    });

    return filtered;
  }, [delegates, filters, sortBy]);

  // 处理筛选器变更
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // 处理代表选择
  const handleDelegateSelect = useCallback((delegate) => {
    if (onDelegateSelect) {
      onDelegateSelect(delegate);
    }
  }, [onDelegateSelect]);

  // 处理代表比较
  const handleDelegateCompare = useCallback((delegate) => {
    setSelectedDelegates(prev => {
      const isSelected = prev.some(d => d.address === delegate.address);
      if (isSelected) {
        return prev.filter(d => d.address !== delegate.address);
      } else if (prev.length < 3) {
        return [...prev, delegate];
      } else {
        // 替换第一个
        return [delegate, ...prev.slice(1)];
      }
    });
  }, []);

  // 处理显示比较
  const handleShowComparison = useCallback(() => {
    if (selectedDelegates.length >= 2) {
      setShowComparison(true);
    }
  }, [selectedDelegates]);

  // 渲染推荐区域
  const renderRecommendations = () => {
    if (!recommendations || recommendations.length === 0) {
      return null;
    }

    return (
      <div className="recommendations-section">
        <h2 className="section-title">
          <span className="title-icon">⭐</span>
          为您推荐
        </h2>
        <div className="recommendations-grid">
          {recommendations.slice(0, 3).map(delegate => (
            <DelegateProfileCard
              key={delegate.address}
              delegate={delegate}
              isRecommended={true}
              onSelect={() => handleDelegateSelect(delegate)}
              onCompare={() => handleDelegateCompare(delegate)}
              isSelected={selectedDelegates.some(d => d.address === delegate.address)}
              showMatchScore={true}
            />
          ))}
        </div>
      </div>
    );
  };

  // 渲染视图模式切换
  const renderViewModeToggle = () => (
    <div className="view-mode-toggle">
      <button
        className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
        onClick={() => setViewMode('grid')}
        title="网格视图"
      >
        <span className="view-icon">⊞</span>
      </button>
      <button
        className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
        onClick={() => setViewMode('list')}
        title="列表视图"
      >
        <span className="view-icon">☰</span>
      </button>
    </div>
  );

  // 渲染排序控制
  const renderSortControl = () => (
    <div className="sort-control">
      <label htmlFor="sort-select" className="sort-label">排序：</label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="sort-select"
      >
        <option value="match_score">匹配度</option>
        <option value="performance">表现评分</option>
        <option value="participation">参与率</option>
        <option value="voting_power">投票权重</option>
        <option value="experience">经验值</option>
      </select>
    </div>
  );

  // 渲染代表列表
  const renderDelegatesList = () => {
    if (filteredDelegates.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>未找到匹配的代表</h3>
          <p>请尝试调整筛选条件或搜索关键词</p>
          <button
            className="reset-filters-button"
            onClick={() => setFilters({
              expertise: [],
              performance: { min: 0, max: 100 },
              participation: { min: 0, max: 100 },
              reputation: [],
              location: '',
              language: []
            })}
          >
            重置筛选条件
          </button>
        </div>
      );
    }

    const containerClass = viewMode === 'grid' ? 'delegates-grid' : 'delegates-list';

    return (
      <div className={containerClass}>
        {filteredDelegates.map(delegate => (
          <DelegateProfileCard
            key={delegate.address}
            delegate={delegate}
            viewMode={viewMode}
            onSelect={() => handleDelegateSelect(delegate)}
            onCompare={() => handleDelegateCompare(delegate)}
            isSelected={selectedDelegates.some(d => d.address === delegate.address)}
            showMatchScore={sortBy === 'match_score'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="delegate-discovery-loading">
        <div className="loading-spinner" />
        <p>正在搜索代表...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="delegate-discovery-error">
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
    <div className={`delegate-discovery ${className}`}>
      {/* 页面头部 */}
      <div className="discovery-header">
        <div className="header-content">
          <h1 className="discovery-title">发现代表</h1>
          <p className="discovery-subtitle">
            找到最适合代表您投票的专业人士
          </p>
        </div>
      </div>

      {/* 推荐区域 */}
      {renderRecommendations()}

      {/* 筛选和控制区域 */}
      <div className="discovery-controls">
        <DelegateFilters
          filters={filters}
          onChange={handleFiltersChange}
        />
        
        <div className="controls-right">
          {renderSortControl()}
          {renderViewModeToggle()}
        </div>
      </div>

      {/* 比较工具栏 */}
      {selectedDelegates.length > 0 && (
        <div className="comparison-toolbar">
          <div className="selected-count">
            已选择 {selectedDelegates.length} 个代表进行比较
          </div>
          <div className="comparison-actions">
            <button
              className="clear-selection-button"
              onClick={() => setSelectedDelegates([])}
            >
              清除选择
            </button>
            {selectedDelegates.length >= 2 && (
              <button
                className="compare-button primary"
                onClick={handleShowComparison}
              >
                比较代表 ({selectedDelegates.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* 代表列表 */}
      <div className="discovery-content">
        <div className="content-header">
          <h2 className="content-title">
            所有代表 ({filteredDelegates.length})
          </h2>
        </div>
        {renderDelegatesList()}
      </div>

      {/* 代表比较弹窗 */}
      {showComparison && (
        <DelegateComparison
          delegates={selectedDelegates}
          onClose={() => setShowComparison(false)}
          onSelect={handleDelegateSelect}
        />
      )}
    </div>
  );
};

export default DelegateDiscovery;

