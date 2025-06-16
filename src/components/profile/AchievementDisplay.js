import React, { useState, useMemo } from 'react';
import { useAchievementSystem } from '../../hooks/useAchievementSystem';
import './AchievementDisplay.css';

/**
 * 成就展示组件
 * 显示用户的成就和徽章系统
 */
const AchievementDisplay = ({
  achievements = [],
  isOwnProfile = false,
  expandedView = false,
  className = ""
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [showUnlocked, setShowUnlocked] = useState(true);

  const {
    claimAchievement,
    getAchievementProgress,
    getNextAchievements
  } = useAchievementSystem();

  // 成就分类
  const achievementCategories = [
    { id: 'all', name: '全部', icon: '🏆' },
    { id: 'trading', name: '交易', icon: '💰' },
    { id: 'collecting', name: '收藏', icon: '🎨' },
    { id: 'social', name: '社交', icon: '👥' },
    { id: 'governance', name: '治理', icon: '🗳️' },
    { id: 'milestones', name: '里程碑', icon: '🎯' },
    { id: 'special', name: '特殊', icon: '⭐' }
  ];

  // 筛选成就
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;

    // 按类别筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(achievement => 
        achievement.category === selectedCategory
      );
    }

    // 按解锁状态筛选
    if (!expandedView) {
      filtered = showUnlocked 
        ? filtered.filter(achievement => achievement.unlocked)
        : filtered.filter(achievement => !achievement.unlocked);
    }

    return filtered;
  }, [achievements, selectedCategory, showUnlocked, expandedView]);

  // 获取成就统计
  const getAchievementStats = () => {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.unlocked).length;
    const progress = total > 0 ? (unlocked / total) * 100 : 0;
    
    return { total, unlocked, progress };
  };

  // 获取稀有度颜色
  const getRarityColor = (rarity) => {
    const colors = {
      common: '#6b7280',
      uncommon: '#10b981',
      rare: '#3b82f6',
      epic: '#8b5cf6',
      legendary: '#f59e0b',
      mythic: '#ef4444'
    };
    return colors[rarity] || colors.common;
  };

  // 获取稀有度名称
  const getRarityName = (rarity) => {
    const names = {
      common: '普通',
      uncommon: '不常见',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说',
      mythic: '神话'
    };
    return names[rarity] || '普通';
  };

  // 处理成就领取
  const handleClaimAchievement = async (achievementId) => {
    try {
      await claimAchievement(achievementId);
    } catch (error) {
      console.error('领取成就失败:', error);
    }
  };

  // 渲染成就卡片
  const renderAchievementCard = (achievement) => {
    const progress = getAchievementProgress(achievement.id);
    const isCompleted = achievement.unlocked || progress >= 100;
    const canClaim = progress >= 100 && !achievement.unlocked && isOwnProfile;

    return (
      <div 
        key={achievement.id}
        className={`achievement-card ${isCompleted ? 'completed' : 'locked'} ${achievement.rarity}`}
      >
        {/* 成就图标 */}
        <div className="achievement-icon-container">
          <div 
            className="achievement-icon"
            style={{ 
              backgroundColor: getRarityColor(achievement.rarity),
              filter: isCompleted ? 'none' : 'grayscale(100%)'
            }}
          >
            {achievement.icon}
          </div>
          {achievement.unlocked && (
            <div className="unlock-badge">✓</div>
          )}
          {canClaim && (
            <div className="claim-badge">!</div>
          )}
        </div>

        {/* 成就信息 */}
        <div className="achievement-info">
          <div className="achievement-title">{achievement.title}</div>
          <div className="achievement-description">{achievement.description}</div>
          
          {/* 稀有度 */}
          <div className="achievement-rarity">
            <span 
              className="rarity-badge"
              style={{ backgroundColor: getRarityColor(achievement.rarity) }}
            >
              {getRarityName(achievement.rarity)}
            </span>
          </div>

          {/* 进度条 */}
          {!isCompleted && achievement.requirements && (
            <div className="achievement-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="progress-text">
                {achievement.requirements.current || 0} / {achievement.requirements.target}
              </div>
            </div>
          )}

          {/* 奖励 */}
          {achievement.rewards && achievement.rewards.length > 0 && (
            <div className="achievement-rewards">
              <div className="rewards-label">奖励:</div>
              <div className="rewards-list">
                {achievement.rewards.map((reward, index) => (
                  <span key={index} className="reward-item">
                    {reward.type === 'xp' && `${reward.amount} XP`}
                    {reward.type === 'token' && `${reward.amount} CBT`}
                    {reward.type === 'nft' && reward.name}
                    {reward.type === 'title' && `称号: ${reward.name}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 解锁时间 */}
          {achievement.unlocked && achievement.unlockedAt && (
            <div className="unlock-time">
              解锁于 {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {canClaim && (
          <div className="achievement-actions">
            <button 
              className="claim-button"
              onClick={() => handleClaimAchievement(achievement.id)}
            >
              领取奖励
            </button>
          </div>
        )}
      </div>
    );
  };

  // 渲染成就列表项
  const renderAchievementListItem = (achievement) => {
    const progress = getAchievementProgress(achievement.id);
    const isCompleted = achievement.unlocked || progress >= 100;

    return (
      <div 
        key={achievement.id}
        className={`achievement-list-item ${isCompleted ? 'completed' : 'locked'}`}
      >
        <div className="list-icon">
          <div 
            className="achievement-icon small"
            style={{ 
              backgroundColor: getRarityColor(achievement.rarity),
              filter: isCompleted ? 'none' : 'grayscale(100%)'
            }}
          >
            {achievement.icon}
          </div>
        </div>

        <div className="list-info">
          <div className="list-title">{achievement.title}</div>
          <div className="list-description">{achievement.description}</div>
        </div>

        <div className="list-rarity">
          <span 
            className="rarity-badge small"
            style={{ backgroundColor: getRarityColor(achievement.rarity) }}
          >
            {getRarityName(achievement.rarity)}
          </span>
        </div>

        <div className="list-progress">
          {isCompleted ? (
            <div className="completed-indicator">✓</div>
          ) : (
            <div className="progress-indicator">
              {progress.toFixed(0)}%
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染分类选择器
  const renderCategorySelector = () => (
    <div className="category-selector">
      {achievementCategories.map(category => (
        <button
          key={category.id}
          className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
          onClick={() => setSelectedCategory(category.id)}
        >
          <span className="category-icon">{category.icon}</span>
          <span className="category-name">{category.name}</span>
        </button>
      ))}
    </div>
  );

  // 渲染控制栏
  const renderControls = () => (
    <div className="achievement-controls">
      <div className="controls-left">
        {!expandedView && (
          <div className="filter-toggle">
            <button
              className={`filter-button ${showUnlocked ? 'active' : ''}`}
              onClick={() => setShowUnlocked(true)}
            >
              已解锁
            </button>
            <button
              className={`filter-button ${!showUnlocked ? 'active' : ''}`}
              onClick={() => setShowUnlocked(false)}
            >
              未解锁
            </button>
          </div>
        )}
      </div>

      <div className="controls-right">
        <div className="view-mode-toggle">
          <button
            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="网格视图"
          >
            ⊞
          </button>
          <button
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="列表视图"
          >
            ☰
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染统计信息
  const renderStats = () => {
    const stats = getAchievementStats();
    
    return (
      <div className="achievement-stats">
        <div className="stats-overview">
          <div className="stat-item">
            <div className="stat-value">{stats.unlocked}</div>
            <div className="stat-label">已解锁</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">总成就</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.progress.toFixed(1)}%</div>
            <div className="stat-label">完成度</div>
          </div>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // 渲染内容
  const renderContent = () => {
    if (filteredAchievements.length === 0) {
      return (
        <div className="empty-achievements">
          <div className="empty-icon">🏆</div>
          <h3>暂无成就</h3>
          <p>
            {showUnlocked ? '还没有解锁任何成就' : '所有成就都已解锁'}
          </p>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="achievements-grid">
          {filteredAchievements.map(renderAchievementCard)}
        </div>
      );
    } else {
      return (
        <div className="achievements-list">
          {filteredAchievements.map(renderAchievementListItem)}
        </div>
      );
    }
  };

  return (
    <div className={`achievement-display ${expandedView ? 'expanded' : ''} ${className}`}>
      {/* 头部 */}
      <div className="achievement-header">
        <h3>成就系统</h3>
        {renderStats()}
      </div>

      {/* 分类选择器 */}
      {expandedView && renderCategorySelector()}

      {/* 控制栏 */}
      {renderControls()}

      {/* 内容区域 */}
      <div className="achievement-content">
        {renderContent()}
      </div>

      {/* 下一个成就提示 */}
      {isOwnProfile && !expandedView && (
        <div className="next-achievements">
          <h4>即将解锁</h4>
          <div className="next-list">
            {getNextAchievements().slice(0, 3).map(achievement => (
              <div key={achievement.id} className="next-item">
                <div className="next-icon">{achievement.icon}</div>
                <div className="next-info">
                  <div className="next-title">{achievement.title}</div>
                  <div className="next-progress">
                    进度: {achievement.progress}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementDisplay;

