/**
 * 学习页面
 * 语言学习和课程管理功能
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  VolumeX,
  Award,
  Target,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  Circle,
  Headphones,
  Mic,
  Eye,
  PenTool,
  Brain,
  Zap,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LearningPage = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);

  const [courses] = useState([
    {
      id: 1,
      title: '英语口语进阶',
      description: '提升英语口语表达能力，掌握日常对话技巧',
      language: 'English',
      flag: '🇺🇸',
      level: 'B2',
      progress: 65,
      totalLessons: 24,
      completedLessons: 16,
      duration: '3个月',
      rating: 4.8,
      students: 1234,
      image: '/api/placeholder/300/200',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: '日语基础入门',
      description: '从零开始学习日语，掌握基本语法和常用词汇',
      language: 'Japanese',
      flag: '🇯🇵',
      level: 'A1',
      progress: 30,
      totalLessons: 20,
      completedLessons: 6,
      duration: '2个月',
      rating: 4.9,
      students: 856,
      image: '/api/placeholder/300/200',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 3,
      title: '法语文化探索',
      description: '通过文化学习法语，了解法国的历史和传统',
      language: 'French',
      flag: '🇫🇷',
      level: 'B1',
      progress: 80,
      totalLessons: 18,
      completedLessons: 14,
      duration: '2.5个月',
      rating: 4.7,
      students: 642,
      image: '/api/placeholder/300/200',
      color: 'from-purple-500 to-indigo-500'
    }
  ]);

  const [lessons] = useState([
    {
      id: 1,
      title: '日常问候与介绍',
      duration: '15分钟',
      type: 'video',
      completed: true,
      skills: ['听力', '口语']
    },
    {
      id: 2,
      title: '数字与时间表达',
      duration: '12分钟',
      type: 'interactive',
      completed: true,
      skills: ['词汇', '语法']
    },
    {
      id: 3,
      title: '购物场景对话',
      duration: '18分钟',
      type: 'conversation',
      completed: false,
      skills: ['口语', '听力']
    },
    {
      id: 4,
      title: '语法练习：现在时',
      duration: '20分钟',
      type: 'exercise',
      completed: false,
      skills: ['语法', '写作']
    }
  ]);

  const [achievements] = useState([
    { name: '学习新手', description: '完成第一课', icon: '🎯', unlocked: true },
    { name: '坚持不懈', description: '连续学习7天', icon: '🔥', unlocked: true },
    { name: '词汇达人', description: '掌握100个单词', icon: '📚', unlocked: true },
    { name: '对话高手', description: '完成10次对话练习', icon: '💬', unlocked: false },
    { name: '语法专家', description: '完成所有语法练习', icon: '✏️', unlocked: false },
    { name: '文化探索者', description: '了解5个文化知识点', icon: '🌍', unlocked: false }
  ]);

  const [weeklyStats] = useState([
    { day: '周一', minutes: 45, target: 30 },
    { day: '周二', minutes: 30, target: 30 },
    { day: '周三', minutes: 60, target: 30 },
    { day: '周四', minutes: 25, target: 30 },
    { day: '周五', minutes: 40, target: 30 },
    { day: '周六', minutes: 35, target: 30 },
    { day: '周日', minutes: 50, target: 30 }
  ]);

  const skillTypes = {
    '听力': { icon: Headphones, color: 'text-blue-500' },
    '口语': { icon: Mic, color: 'text-green-500' },
    '阅读': { icon: Eye, color: 'text-purple-500' },
    '写作': { icon: PenTool, color: 'text-orange-500' },
    '词汇': { icon: Brain, color: 'text-pink-500' },
    '语法': { icon: Zap, color: 'text-yellow-500' }
  };

  const lessonTypes = {
    'video': { name: '视频课程', icon: Play, color: 'bg-blue-500' },
    'interactive': { name: '互动练习', icon: Target, color: 'bg-green-500' },
    'conversation': { name: '对话练习', icon: Mic, color: 'bg-purple-500' },
    'exercise': { name: '练习题', icon: PenTool, color: 'bg-orange-500' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-8">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">语言学习</h1>
          <p className="text-gray-400">探索世界语言，开启文化之旅</p>
        </motion.div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="courses" className="data-[state=active]:bg-white/20">
              我的课程
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-white/20">
              学习进度
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-white/20">
              成就徽章
            </TabsTrigger>
          </TabsList>

          {/* 我的课程 */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 课程列表 */}
              <div className="lg:col-span-2">
                <div className="grid gap-6">
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card 
                        className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className={`w-16 h-16 bg-gradient-to-r ${course.color} rounded-xl flex items-center justify-center text-2xl`}>
                              {course.flag}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-semibold text-lg">{course.title}</h3>
                                <Badge variant="secondary">{course.level}</Badge>
                              </div>
                              <p className="text-gray-400 text-sm mb-3">{course.description}</p>
                              
                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-400 text-sm">{course.duration}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <BookOpen className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-400 text-sm">
                                    {course.completedLessons}/{course.totalLessons} 课程
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="text-gray-400 text-sm">{course.rating}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400 text-sm">进度</span>
                                  <span className="text-white text-sm">{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 课程详情/今日学习 */}
              <div className="space-y-6">
                {/* 今日学习目标 */}
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
                          <span className="text-gray-400 text-sm">完成课程</span>
                          <span className="text-white text-sm">2/3 节</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">练习题</span>
                          <span className="text-white text-sm">8/10 题</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 课程详情 */}
                {selectedCourse && (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        课程内容
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {lessons.map((lesson, index) => {
                          const LessonIcon = lessonTypes[lesson.type].icon;
                          return (
                            <div
                              key={lesson.id}
                              className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                                lesson.completed
                                  ? 'bg-green-500/10 border-green-500/20'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 ${lessonTypes[lesson.type].color} rounded-lg flex items-center justify-center`}>
                                  <LessonIcon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-white font-medium text-sm">{lesson.title}</h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-gray-400 text-xs">{lesson.duration}</span>
                                    <div className="flex items-center space-x-1">
                                      {lesson.skills.map((skill, skillIndex) => {
                                        const SkillIcon = skillTypes[skill].icon;
                                        return (
                                          <div key={skillIndex} className="flex items-center space-x-1">
                                            <SkillIcon className={`h-3 w-3 ${skillTypes[skill].color}`} />
                                            <span className="text-xs text-gray-400">{skill}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  {lesson.completed ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 学习进度 */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 本周学习统计 */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    本周学习统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyStats.map((stat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">{stat.day}</span>
                          <span className="text-white text-sm">{stat.minutes}分钟</span>
                        </div>
                        <div className="relative">
                          <Progress value={(stat.minutes / 60) * 100} className="h-2" />
                          <div 
                            className="absolute top-0 h-2 w-1 bg-yellow-500 rounded-full"
                            style={{ left: `${(stat.target / 60) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 技能分析 */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    技能分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(skillTypes).map(([skill, config], index) => {
                      const Icon = config.icon;
                      const progress = Math.floor(Math.random() * 40) + 60; // 模拟进度
                      return (
                        <div key={skill} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                              <span className="text-white text-sm">{skill}</span>
                            </div>
                            <span className="text-gray-400 text-sm">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 成就徽章 */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  成就徽章
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`text-center p-4 rounded-lg border ${
                        achievement.unlocked
                          ? 'bg-yellow-500/10 border-yellow-500/20'
                          : 'bg-gray-500/10 border-gray-500/20'
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h3 className={`font-medium text-sm mb-1 ${
                        achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-xs ${
                        achievement.unlocked ? 'text-yellow-300' : 'text-gray-600'
                      }`}>
                        {achievement.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearningPage;

