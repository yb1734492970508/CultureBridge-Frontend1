import React, { useState, useEffect, useCallback } from 'react';
import { useSocialFeatures } from '../../hooks/useSocialFeatures';
import SocialFeed from './SocialFeed';
import UserDiscovery from './UserDiscovery';
import CommunityGroups from './CommunityGroups';
import MessageCenter from './MessageCenter';
import SocialStats from './SocialStats';
import './SocialHub.css';

/**
 * 社交中心组件
 * 提供完整的社交功能和社区互动
 */
const SocialHub = ({ 
  currentUser,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [feedFilter, setFeedFilter] = useState('all'); // all, following, trending
  const [notifications, setNotifications] = useState([]);

  const {
    socialFeed,
    userSuggestions,
    communityGroups,
    messages,
    socialStats,
    loading,
    error,
    fetchSocialFeed,
    fetchUserSuggestions,
    fetchCommunityGroups,
    fetchMessages,
    createPost,
    likePost,
    commentOnPost,
    followUser,
    unfollowUser,
    joinGroup,
    leaveGroup,
    sendMessage,
    refreshData
  } = useSocialFeatures(currentUser?.address);

  // 初始化数据
  useEffect(() => {
    if (currentUser?.address) {
      fetchSocialFeed(feedFilter);
      fetchUserSuggestions();
      fetchCommunityGroups();
      fetchMessages();
    }
  }, [currentUser?.address, feedFilter, fetchSocialFeed, fetchUserSuggestions, fetchCommunityGroups, fetchMessages]);

  // 处理动态筛选变更
  const handleFeedFilterChange = useCallback((filter) => {
    setFeedFilter(filter);
    fetchSocialFeed(filter);
  }, [fetchSocialFeed]);

  // 处理发布动态
  const handleCreatePost = useCallback(async (postData) => {
    try {
      await createPost(postData);
      fetchSocialFeed(feedFilter);
    } catch (err) {
      console.error('发布动态失败:', err);
    }
  }, [createPost, fetchSocialFeed, feedFilter]);

  // 处理点赞
  const handleLikePost = useCallback(async (postId) => {
    try {
      await likePost(postId);
    } catch (err) {
      console.error('点赞失败:', err);
    }
  }, [likePost]);

  // 处理评论
  const handleCommentOnPost = useCallback(async (postId, comment) => {
    try {
      await commentOnPost(postId, comment);
    } catch (err) {
      console.error('评论失败:', err);
    }
  }, [commentOnPost]);

  // 处理关注用户
  const handleFollowUser = useCallback(async (userAddress) => {
    try {
      await followUser(userAddress);
      fetchUserSuggestions();
    } catch (err) {
      console.error('关注失败:', err);
    }
  }, [followUser, fetchUserSuggestions]);

  // 处理取消关注
  const handleUnfollowUser = useCallback(async (userAddress) => {
    try {
      await unfollowUser(userAddress);
      fetchUserSuggestions();
    } catch (err) {
      console.error('取消关注失败:', err);
    }
  }, [unfollowUser, fetchUserSuggestions]);

  // 处理加入群组
  const handleJoinGroup = useCallback(async (groupId) => {
    try {
      await joinGroup(groupId);
      fetchCommunityGroups();
    } catch (err) {
      console.error('加入群组失败:', err);
    }
  }, [joinGroup, fetchCommunityGroups]);

  // 处理离开群组
  const handleLeaveGroup = useCallback(async (groupId) => {
    try {
      await leaveGroup(groupId);
      fetchCommunityGroups();
    } catch (err) {
      console.error('离开群组失败:', err);
    }
  }, [leaveGroup, fetchCommunityGroups]);

  // 处理发送消息
  const handleSendMessage = useCallback(async (recipientAddress, message) => {
    try {
      await sendMessage(recipientAddress, message);
      fetchMessages();
    } catch (err) {
      console.error('发送消息失败:', err);
    }
  }, [sendMessage, fetchMessages]);

  // 渲染标签页
  const renderTabs = () => {
    const tabs = [
      { id: 'feed', label: '动态', icon: '📱', count: socialFeed.length },
      { id: 'discover', label: '发现', icon: '🔍', count: userSuggestions.length },
      { id: 'groups', label: '群组', icon: '👥', count: communityGroups.length },
      { id: 'messages', label: '消息', icon: '💬', count: messages.filter(m => !m.read).length }
    ];

    return (
      <div className="social-tabs">
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

  // 渲染动态筛选器
  const renderFeedFilters = () => (
    <div className="feed-filters">
      <div className="filter-buttons">
        {[
          { value: 'all', label: '全部动态' },
          { value: 'following', label: '关注的人' },
          { value: 'trending', label: '热门动态' }
        ].map(filter => (
          <button
            key={filter.value}
            className={`filter-button ${feedFilter === filter.value ? 'active' : ''}`}
            onClick={() => handleFeedFilterChange(filter.value)}
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
      case 'feed':
        return (
          <div className="tab-content feed-content">
            {renderFeedFilters()}
            <SocialFeed
              feed={socialFeed}
              currentUser={currentUser}
              onCreatePost={handleCreatePost}
              onLikePost={handleLikePost}
              onCommentOnPost={handleCommentOnPost}
              onFollowUser={handleFollowUser}
              onUnfollowUser={handleUnfollowUser}
            />
          </div>
        );
      
      case 'discover':
        return (
          <div className="tab-content discover-content">
            <UserDiscovery
              suggestions={userSuggestions}
              currentUser={currentUser}
              onFollowUser={handleFollowUser}
              onUnfollowUser={handleUnfollowUser}
            />
          </div>
        );
      
      case 'groups':
        return (
          <div className="tab-content groups-content">
            <CommunityGroups
              groups={communityGroups}
              currentUser={currentUser}
              onJoinGroup={handleJoinGroup}
              onLeaveGroup={handleLeaveGroup}
            />
          </div>
        );
      
      case 'messages':
        return (
          <div className="tab-content messages-content">
            <MessageCenter
              messages={messages}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading && socialFeed.length === 0) {
    return (
      <div className="social-hub-loading">
        <div className="loading-spinner" />
        <p>正在加载社交内容...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="social-hub-error">
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
    <div className={`social-hub ${className}`}>
      {/* 页面头部 */}
      <div className="social-header">
        <div className="header-content">
          <h1 className="social-title">社交中心</h1>
          <p className="social-subtitle">
            与CultureBridge社区成员互动，分享您的NFT收藏和文化见解
          </p>
        </div>

        {/* 社交统计 */}
        <SocialStats stats={socialStats} />

        {/* 快速操作 */}
        <div className="quick-actions">
          <button 
            className="action-button primary"
            onClick={() => setActiveTab('feed')}
          >
            <span className="action-icon">✏️</span>
            发布动态
          </button>
          <button 
            className="action-button secondary"
            onClick={() => setActiveTab('discover')}
          >
            <span className="action-icon">🔍</span>
            发现用户
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
      <div className="social-content">
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

export default SocialHub;

