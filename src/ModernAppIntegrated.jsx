import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ModernApp.css';

// 导入组件
import Navbar from './components/modern/Navbar';
import Sidebar from './components/modern/Sidebar';
import HomePage from './components/modern/HomePage';
import ChatPage from './components/modern/ChatPage';
import LearningPage from './components/modern/LearningPage';
import CommunityPage from './components/modern/CommunityPage';
import ProfilePage from './components/modern/ProfilePage';

// 导入高级组件
import AIContentAssistant from './components/advanced/AIContentAssistant';
import EnhancedCommunity from './components/advanced/EnhancedCommunity';
import PersonalizedRecommendation from './components/advanced/PersonalizedRecommendation';
import RealTimeInteraction from './components/advanced/RealTimeInteraction';

// 导入API服务
import apiService from './services/apiService';

const ModernApp = () => {
  // 应用状态
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({
    username: '文化探索者',
    avatar: '/api/placeholder/40/40',
    level: 18,
    points: 2847,
    streak: 7
  });
  const [notifications, setNotifications] = useState([
    { id: 1, message: '来自东京的Yuki向你发送了消息', time: '2分钟前' },
    { id: 2, message: '你获得了"连续学习7天"成就', time: '1小时前' }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  // 主题切换
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 初始化应用
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 加载保存的主题
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        // 检查API连接
        try {
          await apiService.healthCheck();
          setApiConnected(true);
          console.log('✅ API连接成功');
        } catch (error) {
          console.warn('⚠️ API连接失败，使用模拟数据:', error);
          setApiConnected(false);
        }

        // 尝试获取用户信息
        const token = localStorage.getItem('authToken');
        if (token && apiConnected) {
          try {
            const userData = await apiService.getCurrentUser();
            setUser(userData.user);
          } catch (error) {
            console.warn('获取用户信息失败:', error);
            localStorage.removeItem('authToken');
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('应用初始化失败:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // 页面组件映射
  const pageComponents = {
    home: HomePage,
    chat: ChatPage,
    learning: LearningPage,
    community: CommunityPage,
    profile: ProfilePage,
    'ai-assistant': AIContentAssistant,
    'enhanced-community': EnhancedCommunity,
    'recommendations': PersonalizedRecommendation,
    'real-time': RealTimeInteraction
  };

  const CurrentPageComponent = pageComponents[currentPage] || HomePage;

  // 加载状态
  if (isLoading) {
    return (
      <div className="loading-screen">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          🌉
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          正在加载 CultureBridge...
        </motion.p>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      {/* API连接状态指示器 */}
      {!apiConnected && (
        <motion.div
          className="api-status-banner"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#f59e0b',
            color: 'white',
            padding: '8px',
            textAlign: 'center',
            fontSize: '0.875rem',
            zIndex: 1000
          }}
        >
          ⚠️ 当前使用演示模式，部分功能可能受限
        </motion.div>
      )}

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

      {/* 主内容区域 */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="content-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentPageComponent
                user={user}
                setUser={setUser}
                theme={theme}
                notifications={notifications}
                setNotifications={setNotifications}
                apiConnected={apiConnected}
                apiService={apiService}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 全局样式 */}
      <style jsx global>{`
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .loading-spinner {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .api-status-banner {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            padding-top: ${!apiConnected ? '120px' : '80px'};
          }

          .main-content.sidebar-open {
            margin-left: 0;
          }
        }

        @media (min-width: 769px) {
          .main-content {
            margin-left: ${sidebarOpen ? '280px' : '0'};
            padding-top: ${!apiConnected ? '120px' : '80px'};
            transition: margin-left var(--transition-smooth);
          }
        }
      `}</style>
    </div>
  );
};

export default ModernApp;

