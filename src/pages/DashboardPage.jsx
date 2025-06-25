/**
 * 仪表板页面
 * 用户登录后的主要控制面板
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MessageCircle, 
  Languages, 
  BookOpen, 
  Award, 
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Globe,
  Users,
  Zap,
  Target,
  BarChart3,
  Activity,
  Bell,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const DashboardPage = () => {
  const [user, setUser] = useState({
    name: '张三',
    avatar: '/api/placeholder/64/64',
    level: 15,
    points: 2450,
    streak: 7,
    joinDate: '2024-01-15'
  });

  const [stats, setStats] = useState({
    totalTranslations: 1234,
    conversationsCount: 56,
    languagesLearned: 3,
    achievementsUnlocked: 12,
    weeklyProgress: 85,
    monthlyGoal: 100
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'translation',
      description: '翻译了一段中文到英文',
      time: '2小时前',
      icon: Languages,
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'conversation',
      description: '与 John 进行了语言交换',
      time: '4小时前',
      icon: MessageCircle,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'achievement',
      description: '获得了"翻译达人"徽章',
      time: '1天前',
      icon: Award,
      color: 'text-yellow-500'
    },
    {
      id: 4,
      type: 'learning',
      description: '完成了日语基础课程',
      time: '2天前',
      icon: BookOpen,
      color: 'text-purple-500'
    }
  ]);

  const [quickActions] = useState([
    {
      title: '开始翻译',
      description: '翻译文本或语音',
      icon: Languages,
      color: 'from-blue-500 to-cyan-500',
      action: () => console.log('开始翻译')
    },
    {
      title: '语言交换',
      description: '与母语者对话',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      action: () => console.log('语言交换')
    },
    {
      title: '学习课程',
      description: '继续学习进度',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      action: () => console.log('学习课程')
    },
    {
      title: '社区动态',
      description: '查看最新动态',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      action: () => console.log('社区动态')
    }
  ]);

  const [learningProgress] = useState([
    { language: '英语', progress: 85, level: 'B2', color: 'bg-blue-500' },
    { language: '日语', progress: 60, level: 'A2', color: 'bg-red-500' },
    { language: '法语', progress: 35, level: 'A1', color: 'bg-purple-500' }
  ]);

  const [achievements] = useState([
    { name: '翻译新手', description: '完成首次翻译', unlocked: true, icon: '🎯' },
    { name: '对话达人', description: '进行10次语言交换', unlocked: true, icon: '💬' },
    { name: '学习之星', description: '连续学习7天', unlocked: true, icon: '⭐' },
    { name: '文化探索者', description: '了解5种不同文化', unlocked: false, icon: '🌍' },
    { name: '语言大师', description: '掌握3门语言', unlocked: false, icon: '🏆' },
    { name: '社区贡献者', description: '帮助100位用户', unlocked: false, icon: '🤝' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-8">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* 欢迎区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                欢迎回来，{user.name}！
              </h1>
              <p className="text-gray-400">
                今天是学习的好日子，继续您的语言之旅吧
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                <Bell className="h-4 w-4 mr-2" />
                通知
              </Button>
              <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Button>
            </div>
          </div>

          {/* 用户状态卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">等级</p>
                    <p className="text-2xl font-bold text-white">{user.level}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">积分</p>
                    <p className="text-2xl font-bold text-white">{user.points.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-400 text-sm font-medium">连续天数</p>
                    <p className="text-2xl font-bold text-white">{user.streak}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">本周进度</p>
                    <p className="text-2xl font-bold text-white">{stats.weeklyProgress}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧列 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 快速操作 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">快速操作</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card 
                        className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                        onClick={action.action}
                      >
                        <CardContent className="p-4 text-center">
                          <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-white font-medium text-sm mb-1">{action.title}</h3>
                          <p className="text-gray-400 text-xs">{action.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* 学习进度 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    学习进度
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {learningProgress.map((lang, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{lang.language}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {lang.level}
                            </Badge>
                            <span className="text-gray-400 text-sm">{lang.progress}%</span>
                          </div>
                        </div>
                        <Progress value={lang.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 最近活动 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    最近活动
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-4 w-4 ${activity.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm">{activity.description}</p>
                            <p className="text-gray-400 text-xs">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 右侧列 */}
          <div className="space-y-6">
            {/* 统计概览 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    统计概览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">总翻译次数</span>
                      <span className="text-white font-medium">{stats.totalTranslations.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">对话次数</span>
                      <span className="text-white font-medium">{stats.conversationsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">学习语言</span>
                      <span className="text-white font-medium">{stats.languagesLearned}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">解锁成就</span>
                      <span className="text-white font-medium">{stats.achievementsUnlocked}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 成就系统 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    成就徽章
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`text-center p-3 rounded-lg border ${
                          achievement.unlocked
                            ? 'bg-yellow-500/10 border-yellow-500/20'
                            : 'bg-gray-500/10 border-gray-500/20'
                        }`}
                      >
                        <div className="text-2xl mb-1">{achievement.icon}</div>
                        <p className={`text-xs font-medium ${
                          achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'
                        }`}>
                          {achievement.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 今日目标 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    今日目标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">学习时间</span>
                        <span className="text-white text-sm">25/30 分钟</span>
                      </div>
                      <Progress value={83} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">翻译次数</span>
                        <span className="text-white text-sm">8/10 次</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">对话时长</span>
                        <span className="text-white text-sm">12/15 分钟</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

