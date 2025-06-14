/**
 * CultureBridge Unified Frontend Application
 * 文化桥梁统一前端应用程序
 * 
 * @author Bin Yi <binyi@culturebridge.com>
 * @version 2.1.0
 * @description 基于区块链的跨文化交流平台前端应用
 *              Blockchain-based cross-cultural communication platform frontend application
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
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
  Languages
} from 'lucide-react';
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
      aiPoweredDesc: '人工智能增强的翻译和文化理解功能'
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
      aiPoweredDesc: 'AI-enhanced translation and cultural understanding features'
    }
  };

  const t = translations[currentLang];

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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentLang(currentLang === 'zh' ? 'en' : 'zh')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Languages className="h-4 w-4 mr-1" />
                {currentLang === 'zh' ? 'EN' : '中文'}
              </Button>
              <Button variant="outline" size="sm">
                {t.learnMore}
              </Button>
              <Button size="sm">
                {t.getStarted}
              </Button>
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
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-5 w-5 mr-2" />
              {t.getStarted}
            </Button>
            <Button variant="outline" size="lg">
              {t.learnMore}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* 统计数据 */}
      {stats && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t.stats}</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{t.totalUsers}</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="h-2 w-2 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-2xl font-bold text-gray-900">{stats.onlineUsers.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{t.onlineUsers}</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{t.totalMessages}</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Mic className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.totalTranslations.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{t.totalTranslations}</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Coins className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.totalRewards.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{t.totalRewards}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* 核心特性 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t.features}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>{t.realTimeChat}</CardTitle>
                <CardDescription>{t.realTimeChatDesc}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mic className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>{t.voiceTranslation}</CardTitle>
                <CardDescription>{t.voiceTranslationDesc}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Coins className="h-10 w-10 text-yellow-600 mb-2" />
                <CardTitle>{t.blockchainRewards}</CardTitle>
                <CardDescription>{t.blockchainRewardsDesc}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle>{t.culturalExchange}</CardTitle>
                <CardDescription>{t.culturalExchangeDesc}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>{t.securePrivate}</CardTitle>
                <CardDescription>{t.securePrivateDesc}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>{t.aiPowered}</CardTitle>
                <CardDescription>{t.aiPoweredDesc}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 支持的语言和最近活动 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 支持的语言 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.supportedLanguages}</h3>
              <div className="grid grid-cols-2 gap-4">
                {languages.map((lang) => (
                  <Card key={lang.code} className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <div className="font-medium text-gray-900">{lang.name}</div>
                        <div className="text-sm text-gray-500">{lang.code.toUpperCase()}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* 最近活动 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.recentActivities}</h3>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card key={activity.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
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
            <p className="mt-2">Version 2.1.0 | Project ID: CB-BACKEND-001</p>
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

