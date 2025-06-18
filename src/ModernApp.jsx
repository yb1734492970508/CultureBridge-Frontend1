import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ModernApp.css';

// 导入组件
import Navbar from './components/modern/Navbar';
import Sidebar from './components/modern/Sidebar';
import HomePage from './components/modern/HomePage';
import ChatPage from './components/modern/ChatPage';
import LearningPage from './components/modern/LearningPage';
import ProfilePage from './components/modern/ProfilePage';
import CommunityPage from './components/modern/CommunityPage';

// 用户数据
const mockUser = {
  id: 'user123',
  username: '文化探索者',
  avatar: '/api/placeholder/40/40',
  level: 18,
  points: 2847,
  streak: 7,
  achievements: ['first_lesson', 'daily_streak_7', 'translator_pro'],
  languages: ['Chinese', 'English', 'Japanese'],
  preferredLanguage: 'zh-CN'
};

function ModernApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(mockUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);

  // 页面切换动画配置
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  // 主题切换
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // 渲染页面内容
  const renderPage = () => {
    const pageProps = {
      user,
      setUser,
      theme,
      notifications,
      setNotifications
    };

    switch (currentPage) {
      case 'home':
        return <HomePage {...pageProps} />;
      case 'chat':
        return <ChatPage {...pageProps} />;
      case 'learning':
        return <LearningPage {...pageProps} />;
      case 'community':
        return <CommunityPage {...pageProps} />;
      case 'profile':
        return <ProfilePage {...pageProps} />;
      default:
        return <HomePage {...pageProps} />;
    }
  };

  return (
    <div className={`modern-app ${theme}`}>
      {/* 背景渐变 */}
      <div className="app-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* 导航栏 */}
      <Navbar
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notifications={notifications}
      />

      {/* 侧边栏 */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        theme={theme}
      />

      {/* 主要内容区域 */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="page-container"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 移动端底部导航 */}
      <div className="mobile-bottom-nav">
        {[
          { key: 'home', icon: '🏠', label: '首页' },
          { key: 'chat', icon: '💬', label: '聊天' },
          { key: 'learning', icon: '📚', label: '学习' },
          { key: 'community', icon: '🌍', label: '社区' },
          { key: 'profile', icon: '👤', label: '我的' }
        ].map(item => (
          <button
            key={item.key}
            className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ModernApp;

