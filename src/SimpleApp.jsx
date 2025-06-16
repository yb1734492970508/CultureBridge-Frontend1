import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  MessageCircle, 
  Mic, 
  Globe, 
  Trophy, 
  Settings, 
  User, 
  Bell,
  Menu,
  X,
  Home,
  BookOpen,
  Award,
  TrendingUp,
  Users,
  Star,
  Gift,
  Zap,
  Crown,
  Diamond,
  Shield,
  Heart,
  Coffee,
  Music,
  Camera,
  MapPin,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  Share,
  Bookmark,
  Flag,
  ThumbsUp,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Coins,
  DollarSign,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// 导入组件
import WalletConnect from './components/WalletConnect';
import EnhancedChatRoom from './components/EnhancedChatRoom';
import EnhancedVoiceTranslation from './components/EnhancedVoiceTranslation';

const SimpleApp = () => {
  // 状态管理
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [cbtBalance, setCbtBalance] = useState(0);
  const [userLevel, setUserLevel] = useState('Bronze');
  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentEarnings, setRecentEarnings] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    messagesCount: 0,
    translationsCount: 0,
    friendsCount: 0
  });
  
  // 用户等级配置
  const levelConfig = {
    Bronze: { min: 0, max: 99, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Shield },
    Silver: { min: 100, max: 499, color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Star },
    Gold: { min: 500, max: 1999, color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Award },
    Platinum: { min: 2000, max: 9999, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Crown },
    Diamond: { min: 10000, max: Infinity, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Diamond }
  };
  
  // 导航菜单
  const navigationItems = [
    { id: 'home', name: '首页', icon: Home },
    { id: 'chat', name: '聊天室', icon: MessageCircle },
    { id: 'voice', name: '语音翻译', icon: Mic },
    { id: 'learn', name: '学习中心', icon: BookOpen },
    { id: 'rewards', name: '奖励中心', icon: Gift },
    { id: 'leaderboard', name: '排行榜', icon: Trophy },
    { id: 'profile', name: '个人中心', icon: User }
  ];
  
  // 初始化
  useEffect(() => {
    checkWalletConnection();
    loadUserData();
  }, []);
  
  // 检查钱包连接状态
  const checkWalletConnection = async () => {
    const token = localStorage.getItem('token');
    const walletAddress = localStorage.getItem('walletAddress');
    
    if (token && walletAddress) {
      setIsConnected(true);
      setUser({ walletAddress });
      await loadCBTBalance(walletAddress);
    }
  };
  
  // 加载用户数据
  const loadUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setStats(result.stats);
        setRecentEarnings(result.recentEarnings || []);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };
  
  // 加载CBT余额
  const loadCBTBalance = async (walletAddress) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blockchain/balance/${walletAddress}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setCbtBalance(result.balance);
        setUserLevel(calculateUserLevel(result.balance));
      }
    } catch (error) {
      console.error('加载CBT余额失败:', error);
    }
  };
  
  // 计算用户等级
  const calculateUserLevel = (balance) => {
    for (const [level, config] of Object.entries(levelConfig)) {
      if (balance >= config.min && balance <= config.max) {
        return level;
      }
    }
    return 'Bronze';
  };
  
  // 处理钱包连接
  const handleWalletConnect = (walletData) => {
    setUser(walletData);
    setIsConnected(true);
    loadCBTBalance(walletData.walletAddress);
    loadUserData();
    
    // 添加连接成功通知
    addNotification('钱包连接成功！', 'success');
  };
  
  // 处理钱包断开
  const handleWalletDisconnect = () => {
    setUser(null);
    setIsConnected(false);
    setCbtBalance(0);
    setUserLevel('Bronze');
    localStorage.removeItem('token');
    localStorage.removeItem('walletAddress');
    
    addNotification('钱包已断开连接', 'info');
  };
  
  // 处理获得代币
  const handleEarnTokens = (amount, reason) => {
    setCbtBalance(prev => prev + amount);
    
    const earning = {
      id: Date.now(),
      amount,
      reason,
      timestamp: new Date().toISOString()
    };
    
    setRecentEarnings(prev => [earning, ...prev.slice(0, 9)]);
    addNotification(`获得 ${amount} CBT - ${reason}`, 'success');
    
    // 更新用户等级
    const newLevel = calculateUserLevel(cbtBalance + amount);
    if (newLevel !== userLevel) {
      setUserLevel(newLevel);
      addNotification(`恭喜！您已升级到 ${newLevel} 等级！`, 'success');
    }
  };
  
  // 添加通知
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // 3秒后自动移除
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  };
  
  // 移除通知
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // 获取等级信息
  const getLevelInfo = () => {
    return levelConfig[userLevel] || levelConfig.Bronze;
  };
  
  // 计算等级进度
  const getLevelProgress = () => {
    const levelInfo = getLevelInfo();
    if (levelInfo.max === Infinity) return 100;
    
    const progress = ((cbtBalance - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };
  
  // 格式化数字
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(2);
  };
  
  // 渲染页面内容
  const renderPageContent = () => {
    if (!isConnected) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">CultureBridge</h1>
              <p className="text-gray-600">连接世界，分享文化，学习语言</p>
            </div>
            
            <WalletConnect 
              onConnect={handleWalletConnect}
              onDisconnect={handleWalletDisconnect}
            />
            
            <div className="mt-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">为什么选择 CultureBridge？</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">实时多语言聊天</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mic className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">智能语音翻译</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">CBT代币奖励</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="text-gray-700">全球文化交流</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    switch (currentPage) {
      case 'home':
        return (
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* 欢迎横幅 */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">欢迎回来！</h2>
                    <p className="opacity-90">继续您的文化交流之旅</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{formatNumber(cbtBalance)} CBT</div>
                    <div className="text-sm opacity-90">{userLevel} 等级</div>
                  </div>
                </div>
              </div>
              
              {/* 统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">总收益</p>
                      <p className="text-2xl font-bold text-green-600">{formatNumber(stats.totalEarned)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">消息数量</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.messagesCount}</p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">翻译次数</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.translationsCount}</p>
                    </div>
                    <Globe className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">好友数量</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.friendsCount}</p>
                    </div>
                    <Users className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>
              
              {/* 最近收益 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">最近收益</h3>
                {recentEarnings.length > 0 ? (
                  <div className="space-y-3">
                    {recentEarnings.map(earning => (
                      <div key={earning.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Plus className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{earning.reason}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(earning.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-green-600 font-bold">
                          +{earning.amount} CBT
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">暂无收益记录</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'chat':
        return <EnhancedChatRoom user={user} onEarnTokens={handleEarnTokens} />;
        
      case 'voice':
        return <EnhancedVoiceTranslation onEarnTokens={handleEarnTokens} />;
        
      case 'learn':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">学习中心</h2>
              <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
                <BookOpen className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">即将推出</h3>
                <p className="text-gray-600">语言学习课程正在开发中...</p>
              </div>
            </div>
          </div>
        );
        
      case 'rewards':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">奖励中心</h2>
              <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
                <Gift className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">即将推出</h3>
                <p className="text-gray-600">每日任务和成就系统正在开发中...</p>
              </div>
            </div>
          </div>
        );
        
      case 'leaderboard':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">排行榜</h2>
              <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">即将推出</h3>
                <p className="text-gray-600">全球排行榜正在开发中...</p>
              </div>
            </div>
          </div>
        );
        
      case 'profile':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">个人中心</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
                    </h3>
                    <p className="text-gray-600">{userLevel} 等级用户</p>
                  </div>
                </div>
                
                {/* 等级进度 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">等级进度</span>
                    <span className="text-sm text-gray-600">{getLevelProgress().toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getLevelProgress()}%` }}
                    ></div>
                  </div>
                </div>
                
                <button
                  onClick={handleWalletDisconnect}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  断开钱包连接
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isConnected && (
        <>
          {/* 顶部导航栏 */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">CultureBridge</span>
                </div>
                
                {/* 桌面导航 */}
                <div className="hidden md:flex items-center space-x-1">
                  {navigationItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* 用户信息和通知 */}
                <div className="flex items-center space-x-4">
                  {/* CBT余额 */}
                  <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Coins className="h-4 w-4" />
                    <span>{formatNumber(cbtBalance)} CBT</span>
                  </div>
                  
                  {/* 用户等级 */}
                  <div className={`hidden sm:flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getLevelInfo().bgColor} ${getLevelInfo().color}`}>
                    {React.createElement(getLevelInfo().icon, { className: "h-3 w-3" })}
                    <span>{userLevel}</span>
                  </div>
                  
                  {/* 通知铃铛 */}
                  <div className="relative">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      <Bell className="h-5 w-5" />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {notifications.length}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  {/* 移动端菜单按钮 */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* 移动端导航菜单 */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 bg-white">
                <div className="px-4 py-2 space-y-1">
                  {navigationItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
          
          {/* 通知栏 */}
          {notifications.length > 0 && (
            <div className="fixed top-20 right-4 z-50 space-y-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`max-w-sm p-4 rounded-lg shadow-lg border-l-4 bg-white ${
                    notification.type === 'success' ? 'border-green-500' :
                    notification.type === 'error' ? 'border-red-500' :
                    'border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                      {notification.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                      <span className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </span>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* 主要内容区域 */}
      <main className={isConnected ? '' : 'min-h-screen'}>
        {renderPageContent()}
      </main>
    </div>
  );
};

export default SimpleApp;

