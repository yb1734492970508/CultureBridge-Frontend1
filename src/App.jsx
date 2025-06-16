/**
 * CultureBridge 主应用组件 - Main Application Component
 * 集成钱包连接、实时聊天、语音翻译等功能
 */

import React, { useState, useEffect } from 'react';
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
  Wallet
} from 'lucide-react';
import WalletConnect from './components/WalletConnect';
import ChatRoom from './components/ChatRoom';
import VoiceTranslation from './components/VoiceTranslation';
import './App.css';

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

// 主页组件
const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [currentLang, setCurrentLang] = useState('zh');
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // 模拟API调用
    setStats(mockAPI.getStats());
    setLanguages(mockAPI.getLanguages());
    setActivities(mockAPI.getRecentActivities());
  }, []);

  const translations = {
    zh: {
      title: '文化桥梁',
      subtitle: '连接世界，交流文化',
      description: '基于区块链的跨文化交流平台，通过智能语音翻译和代币奖励机制，促进全球文化交流与语言学习。',
      features: '核心特性',
      getStarted: '开始体验',
      learnMore: '了解更多',
      stats: '平台统计',
      totalUsers: '总用户数',
      onlineUsers: '在线用户',
      totalMessages: '总消息数',
      totalTranslations: '总翻译数',
      totalRewards: '总奖励 (CBT)',
      supportedLanguages: '支持的语言',
      recentActivities: '最近活动',
      realTimeChat: '实时聊天',
      realTimeChatDesc: '多语言实时聊天，自动翻译，文化背景注释',
      voiceTranslation: '语音翻译',
      voiceTranslationDesc: '智能语音识别与翻译，支持10种主要语言',
      blockchainRewards: '区块链奖励',
      blockchainRewardsDesc: '通过文化交流获得CBT代币奖励',
      culturalExchange: '文化交流',
      culturalExchangeDesc: '深度文化交流，学习不同文化背景知识',
      securePrivate: '安全私密',
      securePrivateDesc: '端到端加密，保护用户隐私和数据安全',
      aiPowered: 'AI驱动',
      aiPoweredDesc: '人工智能增强的翻译和文化理解功能',
      wallet: '钱包',
      chat: '聊天',
      translate: '翻译'
    },
    en: {
      title: 'Culture Bridge',
      subtitle: 'Connecting the World, Exchanging Cultures',
      description: 'A blockchain-based cross-cultural communication platform that promotes global cultural exchange and language learning through intelligent voice translation and token reward mechanisms.',
      features: 'Core Features',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      stats: 'Platform Statistics',
      totalUsers: 'Total Users',
      onlineUsers: 'Online Users',
      totalMessages: 'Total Messages',
      totalTranslations: 'Total Translations',
      totalRewards: 'Total Rewards (CBT)',
      supportedLanguages: 'Supported Languages',
      recentActivities: 'Recent Activities',
      realTimeChat: 'Real-time Chat',
      realTimeChatDesc: 'Multi-language real-time chat with automatic translation and cultural context',
      voiceTranslation: 'Voice Translation',
      voiceTranslationDesc: 'Intelligent speech recognition and translation supporting 10 major languages',
      blockchainRewards: 'Blockchain Rewards',
      blockchainRewardsDesc: 'Earn CBT token rewards through cultural exchange',
      culturalExchange: 'Cultural Exchange',
      culturalExchangeDesc: 'Deep cultural exchange and learning about different cultural backgrounds',
      securePrivate: 'Secure & Private',
      securePrivateDesc: 'End-to-end encryption protecting user privacy and data security',
      aiPowered: 'AI Powered',
      aiPoweredDesc: 'AI-enhanced translation and cultural understanding features',
      wallet: 'Wallet',
      chat: 'Chat',
      translate: 'Translate'
    }
  };

  const t = translations[currentLang];

  const handleWalletConnected = (address) => {
    setConnectedWallet(address);
    setCurrentUser({
      id: 'user_' + Date.now(),
      username: '用户_' + address.slice(-4),
      walletAddress: address
    });
  };

  const handleWalletDisconnected = () => {
    setConnectedWallet(null);
    setCurrentUser(null);
  };

  const handleEarnTokens = (amount, activityType) => {
    console.log(`用户获得 ${amount} CBT 代币 (${activityType})`);
    // 这里可以添加通知或更新UI的逻辑
  };

  if (activeTab === 'chat') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 导航栏 */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">{t.title}</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  首页
                </button>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t.wallet}
                </button>
                <button
                  onClick={() => setActiveTab('translate')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t.translate}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* 聊天界面 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ChatRoom user={currentUser} onEarnTokens={handleEarnTokens} />
        </div>
      </div>
    );
  }

  if (activeTab === 'wallet') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 导航栏 */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">{t.title}</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  首页
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t.chat}
                </button>
                <button
                  onClick={() => setActiveTab('translate')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t.translate}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* 钱包界面 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <WalletConnect 
              onWalletConnected={handleWalletConnected}
              onDisconnect={handleWalletDisconnected}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'translate') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 导航栏 */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">{t.title}</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  首页
                </button>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t.wallet}
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t.chat}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* 翻译界面 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <VoiceTranslation onEarnTokens={handleEarnTokens} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">{t.title}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentLang(currentLang === 'zh' ? 'en' : 'zh')}
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Languages className="h-4 w-4" />
                <span>{currentLang === 'zh' ? 'EN' : '中文'}</span>
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Wallet className="h-4 w-4" />
                <span>{t.wallet}</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t.chat}</span>
              </button>
              <button
                onClick={() => setActiveTab('translate')}
                className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Mic className="h-4 w-4" />
                <span>{t.translate}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            {t.title}
            <span className="block text-blue-600 mt-2">{t.subtitle}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setActiveTab('chat')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>{t.getStarted}</span>
            </button>
            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
              <span>{t.learnMore}</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 统计数据 */}
      {stats && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t.stats}</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t.totalUsers}</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full mx-auto mb-2"></div>
                <div className="text-2xl font-bold text-gray-900">{stats.onlineUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t.onlineUsers}</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t.totalMessages}</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Mic className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalTranslations.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t.totalTranslations}</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Coins className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalRewards.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{t.totalRewards}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 核心特性 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t.features}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <MessageCircle className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.realTimeChat}</h3>
              <p className="text-gray-600">{t.realTimeChatDesc}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <Mic className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.voiceTranslation}</h3>
              <p className="text-gray-600">{t.voiceTranslationDesc}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <Coins className="h-10 w-10 text-yellow-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.blockchainRewards}</h3>
              <p className="text-gray-600">{t.blockchainRewardsDesc}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <Heart className="h-10 w-10 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.culturalExchange}</h3>
              <p className="text-gray-600">{t.culturalExchangeDesc}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <Shield className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.securePrivate}</h3>
              <p className="text-gray-600">{t.securePrivateDesc}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <Zap className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.aiPowered}</h3>
              <p className="text-gray-600">{t.aiPoweredDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold">{t.title}</span>
          </div>
          <p className="text-gray-400 mb-4">{t.subtitle}</p>
          <div className="text-sm text-gray-500">
            <p>© 2024 CultureBridge. Developed by Bin Yi. All rights reserved.</p>
            <p className="mt-2">Version 2.1.0 | Project ID: CB-FRONTEND-001</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// 主应用组件
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

