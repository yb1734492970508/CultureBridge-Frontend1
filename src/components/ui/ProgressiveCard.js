import React, { useState, useEffect } from 'react';
import './ProgressiveCard.css';

const ProgressiveCard = ({ 
  title, 
  description, 
  image, 
  progress = 0, 
  level = 1, 
  points = 0,
  category = 'learning',
  onClick,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getCategoryIcon = (category) => {
    const icons = {
      learning: '📚',
      culture: '🌍',
      language: '🗣️',
      community: '👥',
      achievement: '🏆',
      reward: '🎁'
    };
    return icons[category] || '📚';
  };

  const getCategoryColor = (category) => {
    const colors = {
      learning: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      culture: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      language: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      community: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      achievement: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      reward: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };
    return colors[category] || colors.learning;
  };

  return (
    <div 
      className={`progressive-card ${isVisible ? 'visible' : ''} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 背景装饰 */}
      <div className="card-background">
        <div className="gradient-overlay" style={{ background: getCategoryColor(category) }}></div>
        {image && <img src={image} alt={title} className="background-image" />}
      </div>

      {/* 内容区域 */}
      <div className="card-content">
        {/* 头部信息 */}
        <div className="card-header">
          <div className="category-badge">
            <span className="category-icon">{getCategoryIcon(category)}</span>
            <span className="category-text">{category}</span>
          </div>
          <div className="level-badge">
            <span className="level-icon">⭐</span>
            <span className="level-text">Lv.{level}</span>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="card-main">
          <h3 className="card-title">{title}</h3>
          <p className="card-description">{description}</p>
        </div>

        {/* 进度条 */}
        {progress > 0 && (
          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-label">学习进度</span>
              <span className="progress-value">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${progress}%`,
                  background: getCategoryColor(category)
                }}
              ></div>
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="card-footer">
          <div className="points-info">
            <span className="points-icon">💎</span>
            <span className="points-value">{points} 积分</span>
          </div>
          <div className="action-hint">
            <span className={`action-arrow ${isHovered ? 'animated' : ''}`}>→</span>
          </div>
        </div>
      </div>

      {/* 悬浮效果 */}
      <div className="card-glow" style={{ background: getCategoryColor(category) }}></div>
    </div>
  );
};

export default ProgressiveCard;

