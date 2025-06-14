import React, { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import ProfileStats from './ProfileStats';
import NFTCollection from './NFTCollection';
import ActivityFeed from './ActivityFeed';
import AchievementDisplay from './AchievementDisplay';
import SocialConnections from './SocialConnections';
import './UserProfile.css';

/**
 * 用户个人资料组件
 * 显示用户的完整个人资料信息
 */
const UserProfile = ({ 
  userAddress,
  isOwnProfile = false,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({});

  const {
    profile,
    nftCollection,
    activities,
    achievements,
    socialConnections,
    stats,
    loading,
    error,
    fetchProfile,
    updateProfile,
    followUser,
    unfollowUser,
    refreshData
  } = useUserProfile(userAddress);

  // 初始化数据
  useEffect(() => {
    if (userAddress) {
      fetchProfile();
    }
  }, [userAddress, fetchProfile]);

  // 处理资料更新
  const handleProfileUpdate = useCallback(async (updates) => {
    try {
      await updateProfile(updates);
      setEditMode(false);
      setProfileData({});
    } catch (err) {
      console.error('更新资料失败:', err);
    }
  }, [updateProfile]);

  // 处理关注/取消关注
  const handleFollowToggle = useCallback(async () => {
    try {
      if (profile.isFollowing) {
        await unfollowUser();
      } else {
        await followUser();
      }
    } catch (err) {
      console.error('关注操作失败:', err);
    }
  }, [profile.isFollowing, followUser, unfollowUser]);

  // 处理标签页切换
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // 处理编辑模式切换
  const handleEditToggle = useCallback(() => {
    if (editMode) {
      setProfileData({});
    } else {
      setProfileData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        website: profile.website || '',
        twitter: profile.twitter || '',
        discord: profile.discord || ''
      });
    }
    setEditMode(!editMode);
  }, [editMode, profile]);

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content overview-content">
            <div className="overview-grid">
              <div className="overview-left">
                <ProfileStats stats={stats} />
                <AchievementDisplay 
                  achievements={achievements}
                  isOwnProfile={isOwnProfile}
                />
              </div>
              <div className="overview-right">
                <ActivityFeed 
                  activities={activities.slice(0, 10)}
                  showHeader={true}
                />
              </div>
            </div>
          </div>
        );
      
      case 'collection':
        return (
          <div className="tab-content collection-content">
            <NFTCollection 
              collection={nftCollection}
              userAddress={userAddress}
              isOwnProfile={isOwnProfile}
            />
          </div>
        );
      
      case 'activity':
        return (
          <div className="tab-content activity-content">
            <ActivityFeed 
              activities={activities}
              showHeader={false}
              showFilters={true}
            />
          </div>
        );
      
      case 'achievements':
        return (
          <div className="tab-content achievements-content">
            <AchievementDisplay 
              achievements={achievements}
              isOwnProfile={isOwnProfile}
              expandedView={true}
            />
          </div>
        );
      
      case 'social':
        return (
          <div className="tab-content social-content">
            <SocialConnections 
              connections={socialConnections}
              userAddress={userAddress}
              isOwnProfile={isOwnProfile}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading && !profile.address) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner" />
        <p>正在加载用户资料...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{error.message}</p>
        <button onClick={refreshData}>
          重试
        </button>
      </div>
    );
  }

  if (!profile.address) {
    return (
      <div className="profile-not-found">
        <div className="not-found-icon">👤</div>
        <h3>用户不存在</h3>
        <p>未找到该地址对应的用户资料</p>
      </div>
    );
  }

  return (
    <div className={`user-profile ${className}`}>
      {/* 个人资料头部 */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        editMode={editMode}
        profileData={profileData}
        onProfileDataChange={setProfileData}
        onEditToggle={handleEditToggle}
        onProfileUpdate={handleProfileUpdate}
        onFollowToggle={handleFollowToggle}
      />

      {/* 标签页导航 */}
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        stats={{
          nftCount: nftCollection.length,
          activityCount: activities.length,
          achievementCount: achievements.filter(a => a.unlocked).length,
          followingCount: socialConnections.following?.length || 0,
          followersCount: socialConnections.followers?.length || 0
        }}
      />

      {/* 标签页内容 */}
      <div className="profile-content">
        {renderTabContent()}
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

export default UserProfile;

