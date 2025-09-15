import React, { useState, useEffect } from "react";
import { User, UserProgress, Course } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Award, BookOpen, TrendingUp, Calendar, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalPoints: 0,
    currentLevel: 1,
    completionRate: 0
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const progress = await UserProgress.filter({ user_email: currentUser.email });
      setUserProgress(progress);
      
      const allCourses = await Course.list();
      setCourses(allCourses);
      
      const completed = progress.filter(p => p.status === "completed");
      const inProgress = progress.filter(p => p.status === "in_progress");
      const totalPoints = currentUser.total_points || 0;
      const currentLevel = currentUser.level || 1;
      const completionRate = progress.length > 0 ? (completed.length / progress.length) * 100 : 0;
      
      setStats({
        totalCourses: progress.length,
        completedCourses: completed.length,
        inProgressCourses: inProgress.length,
        totalPoints,
        currentLevel,
        completionRate
      });
    } catch (error) {
      if (error.message?.includes("401") || error.message?.includes("unauthorized")) {
        // User not logged in
        try {
          await User.loginWithRedirect(window.location.href);
        } catch (loginError) {
          console.error("登录失败:", loginError);
        }
      } else {
        console.error("加载个人资料失败:", error);
      }
    }
  };

  const getCompletedCourseDetails = () => {
    return userProgress
      .filter(p => p.status === "completed")
      .map(p => {
        const course = courses.find(c => c.id === p.course_id);
        return { ...p, course };
      })
      .filter(p => p.course)
      .sort((a, b) => new Date(b.completion_date) - new Date(a.completion_date));
  };

  const getInProgressCourseDetails = () => {
    return userProgress
      .filter(p => p.status === "in_progress")
      .map(p => {
        const course = courses.find(c => c.id === p.course_id);
        return { ...p, course };
      })
      .filter(p => p.course);
  };

  const getNextLevelProgress = () => {
    const currentLevelPoints = (stats.currentLevel - 1) * 100;
    const nextLevelPoints = stats.currentLevel * 100;
    const progress = ((stats.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getCountryFlag = (country) => {
    const flags = {
      china: "🇨🇳", usa: "🇺🇸", japan: "🇯🇵", france: "🇫🇷", 
      germany: "🇩🇪", italy: "🇮🇹", spain: "🇪🇸", korea: "🇰🇷",
      india: "🇮🇳", brazil: "🇧🇷"
    };
    return flags[country] || "🌍";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载个人资料中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white border-none">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-white/20">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-2xl bg-white/20 text-white">
                    {user.full_name?.[0] || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{user.full_name || "学习者"}</h1>
                  <p className="text-white/80 mb-4">{user.email}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                    <Badge className="bg-white/20 text-white border-white/20 px-4 py-2">
                      <Trophy className="w-4 h-4 mr-2" />
                      Level {stats.currentLevel}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/20 px-4 py-2">
                      <Award className="w-4 h-4 mr-2" />
                      {stats.totalPoints} 积分
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/20 px-4 py-2">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {stats.completedCourses} 门课程已完成
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Level Progress */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">
                    Level {stats.currentLevel} 进度
                  </span>
                  <span className="text-white text-sm font-medium">
                    {stats.totalPoints} / {stats.currentLevel * 100} 积分
                  </span>
                </div>
                <Progress 
                  value={getNextLevelProgress()} 
                  className="h-2 bg-white/20" 
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">总学习时长</CardTitle>
                <Calendar className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {stats.completedCourses * 30} 分钟
                </div>
                <p className="text-blue-700 text-xs mt-1">累计学习时长</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">完成率</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {stats.completionRate.toFixed(0)}%
                </div>
                <p className="text-green-700 text-xs mt-1">课程完成率</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">学习连击</CardTitle>
                <Star className="w-4 h-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  {user.learning_streak || 0}
                </div>
                <p className="text-orange-700 text-xs mt-1">连续学习天数</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">进行中课程</CardTitle>
                <BookOpen className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {stats.inProgressCourses}
                </div>
                <p className="text-purple-700 text-xs mt-1">门课程进行中</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Completed Courses */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">已完成课程</h2>
          {getCompletedCourseDetails().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getCompletedCourseDetails().map((p, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">{getCountryFlag(p.course.country)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{p.course.title}</h3>
                      <p className="text-sm text-gray-600">完成日期: {p.completion_date}</p>
                      <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                        +{p.points_earned} 积分
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/80 backdrop-blur-sm border-white/20 rounded-lg">
              <p className="text-gray-500">暂无已完成课程</p>
            </div>
          )}
        </motion.div>

        {/* In Progress Courses */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">进行中课程</h2>
          {getInProgressCourseDetails().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getInProgressCourseDetails().map((p, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">{getCountryFlag(p.course.country)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{p.course.title}</h3>
                      <p className="text-sm text-gray-600">进度: {p.progress_percentage}%</p>
                      <Progress value={p.progress_percentage} className="h-2 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/80 backdrop-blur-sm border-white/20 rounded-lg">
              <p className="text-gray-500">暂无进行中课程</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

