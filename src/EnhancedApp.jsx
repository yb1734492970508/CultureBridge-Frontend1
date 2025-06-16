import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Globe, 
  MessageCircle, 
  Mic, 
  Coins, 
  Users, 
  Shield, 
  Zap, 
  Heart,
  ChevronRight,
  Play,
  Star,
  TrendingUp,
  Award,
  Languages,
  Wallet,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  Home,
  BookOpen,
  Trophy,
  Gift,
  User,
  CreditCard,
  Activity,
  BarChart3
} from 'lucide-react';
import WalletConnect from './components/WalletConnect';
import EnhancedChatRoom from './components/EnhancedChatRoom';
import EnhancedVoiceTranslation from './components/EnhancedVoiceTranslation';
import TokenBalance from './components/TokenBalance';
import UserProfile from './components/UserProfile';
import RewardHistory from './components/RewardHistory';
import './EnhancedApp.css';

// 创建应用上下文
const AppContext = createContext();

// 自定义Hook使用上下文
const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// 通知组件
const NotificationBanner = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 
                  type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        <X size={16} />
      </button>
    </div>
  );
};

// 用户等级徽章组件
const UserLevelBadge = ({ level, balance }) => {
  const levelConfig = {
    BRONZE: { color: 'bg-amber-600', icon: '🥉', name: '青铜' },
    SILVER: { color: 'bg-gray-400', icon: '🥈', name: '白银' },
    GOLD: { color: 'bg-yellow-500', icon: '🥇', name: '黄金' },
    PLATINUM: { color: 'bg-purple-500', icon: '💎', name: '铂金' },
    DIAMOND: { color: 'bg-blue-500', icon: '💠', name: '钻石' }
  };

  const config = levelConfig[level] || levelConfig.BRONZE;

  return (
    <div className={`${config.color} text-white px-3 py-1 rounded-full text-sm flex items-center gap-2`}>
      <span>{config.icon}</span>
      <span>{config.name}</span>
      <span className="font-bold">{balance} CBT</span>
    </div>
  );
};

// 导航栏组件
const Navigation = ({ user, onLogout, activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'chat', label: '聊天室', icon: MessageCircle },
    { id: 'translate', label: '翻译', icon: Languages },
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'rewards', label: '奖励记录', icon: Gift },
    { id: 'stats', label: '统计', icon: BarChart3 }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CultureBridge</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <UserLevelBadge level={user.level} balance={user.balance} />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// 首页组件
const HomePage = ({ user }) => {
  const stats = [
    { label: '总用户数', value: '10,000+', icon: Users, color: 'text-blue-600' },
    { label: '翻译次数', value: '50,000+', icon: Languages, color: 'text-green-600' },
    { label: '奖励发放', value: '100,000 CBT', icon: Coins, color: 'text-yellow-600' },
    { label: '活跃用户', value: '2,500+', icon: Activity, color: 'text-purple-600' }
  ];

  const features = [
    {
      title: '实时聊天',
      description: '与全球用户进行实时文化交流，获得CBT奖励',
      icon: MessageCircle,
      color: 'bg-blue-500'
    },
    {
      title: '智能翻译',
      description: 'AI驱动的多语言翻译，支持语音和文本',
      icon: Languages,
      color: 'bg-green-500'
    },
    {
      title: 'CBT奖励',
      description: '参与平台活动获得代币奖励，提升用户等级',
      icon: Coins,
      color: 'bg-yellow-500'
    },
    {
      title: '文化学习',
      description: '学习不同文化背景，拓展国际视野',
      icon: BookOpen,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              连接世界的
              <span className="text-blue-600"> 文化桥梁</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              通过区块链技术和AI翻译，让全球用户无障碍交流，学习语言，分享文化，获得CBT代币奖励
            </p>
            {user && (
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">欢迎回来，{user.username}！</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{user.balance}</div>
                    <div className="text-gray-500">CBT余额</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{user.level}</div>
                    <div className="text-gray-500">用户等级</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">平台特色功能</h2>
            <p className="text-lg text-gray-600">体验前所未有的文化交流和语言学习</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} text-white mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// 主应用组件
const EnhancedApp = () => {
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // 模拟用户数据
  useEffect(() => {
    if (isConnected) {
      setUser({
        username: 'CultureExplorer',
        walletAddress: '0x1234...5678',
        balance: 125.5,
        level: 'SILVER',
        totalEarned: 200.0,
        totalSpent: 74.5,
        transactionCount: 45,
        joinDate: '2024-01-15'
      });
    } else {
      setUser(null);
    }
  }, [isConnected]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const handleWalletConnect = (walletData) => {
    setIsConnected(true);
    showNotification('钱包连接成功！', 'success');
  };

  const handleWalletDisconnect = () => {
    setIsConnected(false);
    setUser(null);
    setActiveTab('home');
    showNotification('钱包已断开连接', 'info');
  };

  const contextValue = {
    user,
    isConnected,
    showNotification,
    loading,
    setLoading
  };

  // 如果未连接钱包，显示连接页面
  if (!isConnected) {
    return (
      <AppContext.Provider value={contextValue}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md w-full mx-4">
              <div className="text-center mb-8">
                <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">CultureBridge</h1>
                <p className="text-gray-600">连接钱包开始您的文化交流之旅</p>
              </div>
              <WalletConnect onConnect={handleWalletConnect} />
            </div>
          </div>
          {notification && (
            <NotificationBanner
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </div>
      </AppContext.Provider>
    );
  }

  // 渲染主应用内容
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage user={user} />;
      case 'chat':
        return <EnhancedChatRoom user={user} />;
      case 'translate':
        return <EnhancedVoiceTranslation user={user} />;
      case 'profile':
        return <UserProfile user={user} />;
      case 'rewards':
        return <RewardHistory user={user} />;
      case 'stats':
        return <TokenBalance user={user} />;
      default:
        return <HomePage user={user} />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        <Navigation
          user={user}
          onLogout={handleWalletDisconnect}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <main>
          {renderContent()}
        </main>
        {notification && (
          <NotificationBanner
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </AppContext.Provider>
  );
};

export default EnhancedApp;
export { useApp };

