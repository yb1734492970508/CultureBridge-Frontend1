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
  Gift
} from 'lucide-react';
import WalletConnect from './components/WalletConnect';
import ChatRoom from './components/ChatRoom';
import VoiceTranslation from './components/VoiceTranslation';
import './App.css';

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

  const bgColor = type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
                  type === 'error' ? 'bg-red-100 border-red-500 text-red-700' :
                  'bg-blue-100 border-blue-500 text-blue-700';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 border-l-4 rounded-lg shadow-lg ${bgColor} max-w-sm`}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// 用户等级徽章组件
const UserLevelBadge = ({ level, cbtBalance }) => {
  const getLevelInfo = (balance) => {
    if (balance >= 10000) return { name: 'Diamond', color: 'from-purple-400 to-pink-400', icon: '💎' };
    if (balance >= 2000) return { name: 'Platinum', color: 'from-gray-300 to-gray-500', icon: '🏆' };
    if (balance >= 500) return { name: 'Gold', color: 'from-yellow-400 to-yellow-600', icon: '🥇' };
    if (balance >= 100) return { name: 'Silver', color: 'from-gray-200 to-gray-400', icon: '🥈' };
    return { name: 'Bronze', color: 'from-orange-300 to-orange-500', icon: '🥉' };
  };

  const levelInfo = getLevelInfo(cbtBalance);

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r ${levelInfo.color} text-white text-xs font-medium`}>
      <span>{levelInfo.icon}</span>
      <span>{levelInfo.name}</span>
    </div>
  );
};

// 导航栏组件
const Navigation = ({ user, onTabChange, activeTab, onLogout, notifications }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: 'home', name: '首页', icon: Home },
    { id: 'chat', name: '聊天', icon: MessageCircle },
    { id: 'translate', name: '翻译', icon: Mic },
    { id: 'learn', name: '学习', icon: BookOpen },
    { id: 'rewards', name: '奖励', icon: Gift },
    { id: 'wallet', name: '钱包', icon: Wallet }
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CultureBridge
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
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

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">通知</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">暂无新通知</div>
                      ) : (
                        notifications.map(notification => (
                          <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                            <div className="text-sm text-gray-900">{notification.message}</div>
                            <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    <div className="text-xs text-gray-500">{user.cbtBalance} CBT</div>
                  </div>
                  <UserLevelBadge level={user.level} cbtBalance={user.cbtBalance} />
                </div>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="退出登录"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
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
        )}
      </div>
    </nav>
  );
};

// 学习页面组件
const LearningPage = ({ user, onEarnTokens }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    // 模拟课程数据
    setCourses([
      {
        id: 1,
        title: '英语日常对话',
        description: '学习基础英语对话技巧',
        language: 'en',
        flag: '🇺🇸',
        level: '初级',
        lessons: 12,
        progress: 75,
        reward: 20
      },
      {
        id: 2,
        title: '中国文化介绍',
        description: '了解中国传统文化和现代社会',
        language: 'zh',
        flag: '🇨🇳',
        level: '中级',
        lessons: 8,
        progress: 30,
        reward: 25
      },
      {
        id: 3,
        title: '西班牙语基础',
        description: '从零开始学习西班牙语',
        language: 'es',
        flag: '🇪🇸',
        level: '初级',
        lessons: 15,
        progress: 0,
        reward: 30
      }
    ]);
  }, []);

  const startLesson = (course) => {
    setSelectedCourse(course);
    // 模拟完成课程奖励
    setTimeout(() => {
      onEarnTokens && onEarnTokens(course.reward, 'COURSE_COMPLETION');
      setSelectedCourse(null);
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">语言学习中心</h1>
        <p className="text-gray-600">通过互动课程学习新语言，获得CBT奖励</p>
      </div>

      {selectedCourse ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">正在学习</h2>
            <p className="text-gray-600">{selectedCourse.title}</p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-blue-600 h-3 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          
          <p className="text-sm text-gray-500">课程进行中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{course.flag}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {course.level}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">进度</span>
                    <span className="text-gray-900">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{course.lessons} 课时</span>
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <Coins className="h-4 w-4" />
                    <span className="text-sm font-medium">{course.reward} CBT</span>
                  </div>
                </div>
                
                <button
                  onClick={() => startLesson(course)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {course.progress > 0 ? '继续学习' : '开始学习'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 奖励页面组件
const RewardsPage = ({ user, onEarnTokens }) => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // 模拟每日任务
    setDailyTasks([
      { id: 1, name: '每日登录', reward: 1, completed: true, description: '每天登录获得奖励' },
      { id: 2, name: '发送10条消息', reward: 5, completed: false, progress: 7, total: 10, description: '在聊天室发送消息' },
      { id: 3, name: '完成3次翻译', reward: 3, completed: false, progress: 1, total: 3, description: '使用语音翻译功能' },
      { id: 4, name: '学习30分钟', reward: 10, completed: false, progress: 15, total: 30, description: '参与语言学习课程' }
    ]);

    // 模拟成就
    setAchievements([
      { id: 1, name: '初来乍到', icon: '🎉', description: '完成首次注册', unlocked: true, reward: 10 },
      { id: 2, name: '聊天新手', icon: '💬', description: '发送100条消息', unlocked: true, reward: 20 },
      { id: 3, name: '翻译达人', icon: '🌐', description: '完成50次翻译', unlocked: false, progress: 23, total: 50, reward: 50 },
      { id: 4, name: '学习之星', icon: '⭐', description: '完成10门课程', unlocked: false, progress: 3, total: 10, reward: 100 }
    ]);

    // 模拟排行榜
    setLeaderboard([
      { rank: 1, name: 'Alice', cbt: 5420, avatar: '👩', country: '🇺🇸' },
      { rank: 2, name: '小明', cbt: 4890, avatar: '👨', country: '🇨🇳' },
      { rank: 3, name: 'Maria', cbt: 4567, avatar: '👩', country: '🇪🇸' },
      { rank: 4, name: 'Jean', cbt: 4234, avatar: '👨', country: '🇫🇷' },
      { rank: 5, name: user?.username || '你', cbt: user?.cbtBalance || 0, avatar: '👤', country: '🌍', isCurrentUser: true }
    ]);
  }, [user]);

  const claimDailyReward = (taskId) => {
    setDailyTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
    const task = dailyTasks.find(t => t.id === taskId);
    onEarnTokens && onEarnTokens(task.reward, 'DAILY_TASK');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">奖励中心</h1>
        <p className="text-gray-600">完成任务和成就，获得更多CBT奖励</p>
      </div>

      {/* 每日任务 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Gift className="h-6 w-6 text-blue-600" />
          <span>每日任务</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyTasks.map(task => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{task.name}</h3>
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-medium">{task.reward} CBT</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{task.description}</p>
              
              {!task.completed && task.progress !== undefined && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>进度</span>
                    <span>{task.progress}/{task.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(task.progress / task.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => claimDailyReward(task.id)}
                disabled={task.completed || (task.progress !== undefined && task.progress < task.total)}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  task.completed 
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : task.progress !== undefined && task.progress < task.total
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {task.completed ? '已完成' : task.progress !== undefined && task.progress < task.total ? '进行中' : '领取奖励'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 成就系统 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          <span>成就徽章</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map(achievement => (
            <div key={achievement.id} className={`border-2 rounded-lg p-4 text-center ${
              achievement.unlocked 
                ? 'border-yellow-300 bg-yellow-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h3 className="font-medium text-gray-900 mb-1">{achievement.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
              
              {!achievement.unlocked && achievement.progress !== undefined && (
                <div className="mb-2">
                  <div className="text-xs text-gray-500 mb-1">
                    {achievement.progress}/{achievement.total}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-1 text-yellow-600">
                <Coins className="h-3 w-3" />
                <span className="text-xs font-medium">{achievement.reward} CBT</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 排行榜 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <span>CBT排行榜</span>
        </h2>
        
        <div className="space-y-3">
          {leaderboard.map(user => (
            <div key={user.rank} className={`flex items-center justify-between p-3 rounded-lg ${
              user.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  user.rank === 1 ? 'bg-yellow-500' :
                  user.rank === 2 ? 'bg-gray-400' :
                  user.rank === 3 ? 'bg-orange-500' :
                  'bg-gray-300'
                }`}>
                  {user.rank}
                </div>
                <span className="text-lg">{user.avatar}</span>
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.country}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{user.cbt.toLocaleString()} CBT</div>
                {user.isCurrentUser && (
                  <div className="text-xs text-blue-600">你的排名</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 主应用组件
const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);

  // 模拟API服务
  const mockAPI = {
    getStats: () => ({
      totalUsers: 15420,
      onlineUsers: 1234,
      totalMessages: 89567,
      totalTranslations: 45678,
      totalRewards: 234567.89
    }),
    
    getLanguages: () => [
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'pt', name: 'Português', flag: '🇵🇹' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' }
    ],
    
    getRecentActivities: () => [
      { id: 1, user: 'Alice', action: 'earned 50 CBT for cultural exchange', time: '2 minutes ago' },
      { id: 2, user: 'Bob', action: 'completed voice translation session', time: '5 minutes ago' },
      { id: 3, user: 'Charlie', action: 'joined Chinese-English chat room', time: '8 minutes ago' },
      { id: 4, user: 'Diana', action: 'shared cultural insight about festivals', time: '12 minutes ago' },
      { id: 5, user: 'Eve', action: 'helped with pronunciation practice', time: '15 minutes ago' }
    ]
  };

  const [stats, setStats] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // 模拟API调用
    setStats(mockAPI.getStats());
    setLanguages(mockAPI.getLanguages());
    setActivities(mockAPI.getRecentActivities());
  }, []);

  const handleWalletConnected = (address) => {
    const newUser = {
      id: 'user_' + Date.now(),
      username: '用户_' + address.slice(-4),
      walletAddress: address,
      cbtBalance: 1234.56,
      level: 'Gold'
    };
    setUser(newUser);
    showNotification('钱包连接成功！欢迎来到CultureBridge！', 'success');
  };

  const handleWalletDisconnected = () => {
    setUser(null);
    showNotification('钱包已断开连接', 'info');
  };

  const handleEarnTokens = (amount, activityType) => {
    if (user) {
      setUser(prev => ({
        ...prev,
        cbtBalance: prev.cbtBalance + amount
      }));
      
      const activityNames = {
        'CHAT_MESSAGE': '发送消息',
        'VOICE_MESSAGE': '语音消息',
        'VOICE_TRANSLATION': '语音翻译',
        'TEXT_TRANSLATION': '文本翻译',
        'DAILY_TASK': '每日任务',
        'COURSE_COMPLETION': '完成课程',
        'LIKE_RECEIVED': '收到点赞'
      };
      
      showNotification(
        `恭喜！您通过${activityNames[activityType] || activityType}获得了 ${amount} CBT！`,
        'success'
      );
    }
  };

  const showNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      time: new Date().toLocaleTimeString()
    };
    
    setCurrentNotification(notification);
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
    showNotification('已退出登录', 'info');
  };

  // 如果用户未连接钱包，显示钱包连接页面
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation 
          user={user} 
          onTabChange={setActiveTab} 
          activeTab={activeTab}
          onLogout={handleLogout}
          notifications={notifications}
        />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <WalletConnect 
            onWalletConnected={handleWalletConnected}
            onDisconnect={handleWalletDisconnected}
          />
        </div>
        
        {currentNotification && (
          <NotificationBanner
            message={currentNotification.message}
            type={currentNotification.type}
            onClose={() => setCurrentNotification(null)}
          />
        )}
      </div>
    );
  }

  // 渲染不同的页面内容
  const renderPageContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatRoom user={user} onEarnTokens={handleEarnTokens} />;
      case 'translate':
        return <VoiceTranslation onEarnTokens={handleEarnTokens} />;
      case 'learn':
        return <LearningPage user={user} onEarnTokens={handleEarnTokens} />;
      case 'rewards':
        return <RewardsPage user={user} onEarnTokens={handleEarnTokens} />;
      case 'wallet':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <WalletConnect 
              onWalletConnected={handleWalletConnected}
              onDisconnect={handleWalletDisconnected}
            />
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* 英雄区域 */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                  文化桥梁
                  <span className="block text-blue-600 mt-2">连接世界，交流文化</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  基于区块链的跨文化交流平台，通过智能语音翻译和代币奖励机制，促进全球文化交流与语言学习。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>开始聊天</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('translate')}
                    className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Mic className="h-5 w-5" />
                    <span>语音翻译</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 统计数据 */}
            {stats && (
              <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                  <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">平台统计</h2>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">总用户数</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="h-2 w-2 bg-green-500 rounded-full mx-auto mb-2"></div>
                      <div className="text-2xl font-bold text-gray-900">{stats.onlineUsers.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">在线用户</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">总消息数</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <Mic className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{stats.totalTranslations.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">总翻译数</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <Coins className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{stats.totalRewards.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">总奖励 (CBT)</div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 核心特性 */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">核心特性</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">实时聊天</h3>
                    <p className="text-gray-600">多语言实时聊天，自动翻译，文化背景注释</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Mic className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">语音翻译</h3>
                    <p className="text-gray-600">智能语音识别与翻译，支持10种主要语言</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                      <Coins className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">区块链奖励</h3>
                    <p className="text-gray-600">通过文化交流获得CBT代币奖励</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Globe className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">文化交流</h3>
                    <p className="text-gray-600">深度文化交流，学习不同文化背景知识</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">安全私密</h3>
                    <p className="text-gray-600">端到端加密，保护用户隐私和数据安全</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI驱动</h3>
                    <p className="text-gray-600">人工智能增强的翻译和文化理解功能</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <AppContext.Provider value={{ user, notifications, showNotification }}>
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          user={user} 
          onTabChange={setActiveTab} 
          activeTab={activeTab}
          onLogout={handleLogout}
          notifications={notifications}
        />
        
        {renderPageContent()}
        
        {currentNotification && (
          <NotificationBanner
            message={currentNotification.message}
            type={currentNotification.type}
            onClose={() => setCurrentNotification(null)}
          />
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;

