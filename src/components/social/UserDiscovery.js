import React, { useState, useCallback } from 'react';
import { useUserDiscovery } from '../../hooks/useUserDiscovery';
import UserCard from './UserCard';
import './UserDiscovery.css';

/**
 * 用户发现组件
 * 帮助用户发现和关注其他用户
 */
const UserDiscovery = ({
  suggestions = [],
  currentUser,
  onFollowUser,
  onUnfollowUser,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('recommended'); // recommended, trending, new, search
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    interests: [],
    location: '',
    nftCount: { min: 0, max: 1000 },
    joinedDate: 'all' // all, week, month, year
  });

  const {
    searchUsers,
    getTrendingUsers,
    getNewUsers,
    loading,
    error
  } = useUserDiscovery();

  // 处理搜索
  const handleSearch = useCallback(async (query) => {
    if (query.trim()) {
      try {
        await searchUsers(query);
      } catch (err) {
        console.error('搜索用户失败:', err);
      }
    }
  }, [searchUsers]);

  // 处理筛选变更
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // 获取当前标签页的用户列表
  const getCurrentUsers = () => {
    switch (activeTab) {
      case 'recommended':
        return suggestions;
      case 'trending':
        return []; // 从hook获取
      case 'new':
        return []; // 从hook获取
      case 'search':
        return []; // 从搜索结果获取
      default:
        return suggestions;
    }
  };

  // 渲染标签页
  const renderTabs = () => {
    const tabs = [
      { id: 'recommended', label: '推荐用户', icon: '⭐' },
      { id: 'trending', label: '热门用户', icon: '🔥' },
      { id: 'new', label: '新用户', icon: '🆕' },
      { id: 'search', label: '搜索用户', icon: '🔍' }
    ];

    return (
      <div className="discovery-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // 渲染搜索栏
  const renderSearchBar = () => (
    <div className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="搜索用户名、地址或兴趣..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchQuery);
              setActiveTab('search');
            }
          }}
          className="search-input"
        />
        <button
          className="search-button"
          onClick={() => {
            handleSearch(searchQuery);
            setActiveTab('search');
          }}
        >
          🔍
        </button>
      </div>
    </div>
  );

  // 渲染筛选器
  const renderFilters = () => (
    <div className="discovery-filters">
      <div className="filter-group">
        <label className="filter-label">兴趣领域:</label>
        <div className="interest-tags">
          {['艺术', '音乐', '游戏', '收藏', '投资', '技术', '文化', '教育'].map(interest => (
            <button
              key={interest}
              className={`interest-tag ${filters.interests.includes(interest) ? 'active' : ''}`}
              onClick={() => {
                const newInterests = filters.interests.includes(interest)
                  ? filters.interests.filter(i => i !== interest)
                  : [...filters.interests, interest];
                handleFilterChange('interests', newInterests);
              }}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">NFT收藏数量:</label>
        <div className="range-filter">
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.nftCount.max}
            onChange={(e) => handleFilterChange('nftCount', {
              ...filters.nftCount,
              max: parseInt(e.target.value)
            })}
            className="range-input"
          />
          <span className="range-value">0 - {filters.nftCount.max}</span>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">加入时间:</label>
        <select
          value={filters.joinedDate}
          onChange={(e) => handleFilterChange('joinedDate', e.target.value)}
          className="filter-select"
        >
          <option value="all">全部</option>
          <option value="week">最近一周</option>
          <option value="month">最近一月</option>
          <option value="year">最近一年</option>
        </select>
      </div>
    </div>
  );

  // 渲染用户网格
  const renderUserGrid = () => {
    const users = getCurrentUsers();

    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>正在加载用户...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>加载失败</h3>
          <p>{error.message}</p>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="empty-users">
          <div className="empty-icon">👥</div>
          <h3>暂无用户</h3>
          <p>
            {activeTab === 'search' 
              ? '没有找到匹配的用户，试试其他关键词'
              : '暂时没有推荐的用户'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="users-grid">
        {users.map(user => (
          <UserCard
            key={user.address}
            user={user}
            currentUser={currentUser}
            onFollow={() => onFollowUser(user.address)}
            onUnfollow={() => onUnfollowUser(user.address)}
          />
        ))}
      </div>
    );
  };

  // 渲染推荐理由
  const renderRecommendationReasons = () => {
    if (activeTab !== 'recommended') return null;

    return (
      <div className="recommendation-info">
        <h4>推荐依据</h4>
        <div className="recommendation-reasons">
          <div className="reason-item">
            <span className="reason-icon">🎨</span>
            <span className="reason-text">相似的NFT收藏偏好</span>
          </div>
          <div className="reason-item">
            <span className="reason-icon">👥</span>
            <span className="reason-text">共同关注的用户</span>
          </div>
          <div className="reason-item">
            <span className="reason-icon">💬</span>
            <span className="reason-text">相似的社交活动</span>
          </div>
          <div className="reason-item">
            <span className="reason-icon">🏷️</span>
            <span className="reason-text">共同的兴趣标签</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`user-discovery ${className}`}>
      {/* 页面头部 */}
      <div className="discovery-header">
        <h2>发现用户</h2>
        <p>找到志同道合的NFT收藏者和文化爱好者</p>
      </div>

      {/* 搜索栏 */}
      {renderSearchBar()}

      {/* 标签页 */}
      {renderTabs()}

      {/* 筛选器 */}
      {renderFilters()}

      {/* 推荐理由 */}
      {renderRecommendationReasons()}

      {/* 用户网格 */}
      {renderUserGrid()}

      {/* 加载更多 */}
      <div className="load-more-container">
        <button className="load-more-button">
          加载更多用户
        </button>
      </div>
    </div>
  );
};

export default UserDiscovery;

