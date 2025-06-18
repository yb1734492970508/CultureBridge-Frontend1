import React, { useState, useEffect } from 'react';
import './EnhancedHeader.css';

const EnhancedHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(1250);
  const [userLevel, setUserLevel] = useState(5);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCheckIn = () => {
    setUserPoints(prev => prev + 50);
    // 这里可以调用API进行签到
  };

  return (
    <header className={`enhanced-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo区域 */}
        <div className="logo-section">
          <div className="logo-icon">
            <span className="logo-emoji">🌉</span>
          </div>
          <div className="logo-text">
            <h1>CultureBridge</h1>
            <span className="tagline">连接世界文化</span>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="search-section">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="搜索课程、文化、朋友..." 
              className="search-input"
            />
            <button className="search-btn">
              <span>🔍</span>
            </button>
          </div>
        </div>

        {/* 用户信息区域 */}
        <div className="user-section">
          {/* 积分显示 */}
          <div className="points-display">
            <span className="points-icon">💎</span>
            <span className="points-value">{userPoints.toLocaleString()}</span>
          </div>

          {/* 等级显示 */}
          <div className="level-display">
            <span className="level-icon">⭐</span>
            <span className="level-value">Lv.{userLevel}</span>
          </div>

          {/* 签到按钮 */}
          <button className="checkin-btn" onClick={handleCheckIn}>
            <span className="checkin-icon">📅</span>
            <span className="checkin-text">签到</span>
          </button>

          {/* 通知 */}
          <div className="notification-container">
            <button className="notification-btn">
              <span className="notification-icon">🔔</span>
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>
          </div>

          {/* 用户头像 */}
          <div className="user-avatar">
            <img 
              src="/api/placeholder/40/40" 
              alt="用户头像" 
              className="avatar-img"
            />
            <div className="status-indicator online"></div>
          </div>

          {/* 移动端菜单按钮 */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          <a href="#home" className="mobile-nav-item">
            <span className="nav-icon">🏠</span>
            <span className="nav-text">首页</span>
          </a>
          <a href="#learning" className="mobile-nav-item">
            <span className="nav-icon">📚</span>
            <span className="nav-text">学习</span>
          </a>
          <a href="#community" className="mobile-nav-item">
            <span className="nav-icon">👥</span>
            <span className="nav-text">社区</span>
          </a>
          <a href="#chat" className="mobile-nav-item">
            <span className="nav-icon">💬</span>
            <span className="nav-text">聊天</span>
          </a>
          <a href="#rewards" className="mobile-nav-item">
            <span className="nav-icon">🎁</span>
            <span className="nav-text">奖励</span>
          </a>
          <a href="#profile" className="mobile-nav-item">
            <span className="nav-icon">👤</span>
            <span className="nav-text">个人</span>
          </a>
        </nav>
      </div>
    </header>
  );
};

export default EnhancedHeader;

