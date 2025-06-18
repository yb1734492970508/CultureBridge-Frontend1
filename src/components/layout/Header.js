import React, { useState } from 'react';
import { useTheme } from '../../context/theme/ThemeContext';
import { useReward } from '../../context/reward/RewardContext';
import './Header.css';

function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { user, checkIn } = useReward();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleCheckIn = () => {
    checkIn();
    // 可以添加成功提示
  };
  
  const canCheckInToday = () => {
    const today = new Date().toDateString();
    return user.lastCheckIn !== today;
  };
  
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo 和品牌 */}
          <div className="header-brand">
            <div className="logo">
              <span className="logo-icon">🌉</span>
              <span className="logo-text">CultureBridge</span>
            </div>
            <span className="tagline">连接世界文化</span>
          </div>
          
          {/* 用户信息和操作 */}
          <div className="header-actions">
            {/* 积分显示 */}
            <div className="points-display">
              <div className="points-item">
                <span className="points-icon">🎓</span>
                <span className="points-value">{user.learningPoints}</span>
              </div>
              <div className="points-item">
                <span className="points-icon">💬</span>
                <span className="points-value">{user.engagementPoints}</span>
              </div>
              <div className="points-item">
                <span className="points-icon">🏆</span>
                <span className="points-value">{user.contributionPoints}</span>
              </div>
            </div>
            
            {/* 等级显示 */}
            <div className="level-display">
              <div className="level-badge">
                <span className="level-text">Lv.{user.level}</span>
              </div>
              <div className="exp-bar">
                <div 
                  className="exp-fill"
                  style={{ 
                    width: `${(user.experience / user.nextLevelExp) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            
            {/* 签到按钮 */}
            <button 
              className={`check-in-btn ${!canCheckInToday() ? 'disabled' : ''}`}
              onClick={handleCheckIn}
              disabled={!canCheckInToday()}
            >
              {canCheckInToday() ? (
                <>
                  <span className="check-in-icon">📅</span>
                  签到
                </>
              ) : (
                <>
                  <span className="check-in-icon">✅</span>
                  已签到
                </>
              )}
            </button>
            
            {/* 连续签到显示 */}
            {user.streak > 0 && (
              <div className="streak-display">
                <span className="streak-icon">🔥</span>
                <span className="streak-text">{user.streak}天</span>
              </div>
            )}
            
            {/* 主题切换 */}
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              title={isDark() ? '切换到浅色主题' : '切换到深色主题'}
            >
              {isDark() ? '☀️' : '🌙'}
            </button>
            
            {/* 移动端菜单按钮 */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="hamburger"></span>
              <span className="hamburger"></span>
              <span className="hamburger"></span>
            </button>
          </div>
        </div>
        
        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <nav className="mobile-nav">
              <a href="/" className="mobile-nav-link">首页</a>
              <a href="/learning" className="mobile-nav-link">学习</a>
              <a href="/community" className="mobile-nav-link">社区</a>
              <a href="/chat" className="mobile-nav-link">聊天</a>
              <a href="/rewards" className="mobile-nav-link">奖励</a>
              <a href="/profile" className="mobile-nav-link">个人</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

