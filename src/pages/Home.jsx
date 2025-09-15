import React, { useState, useEffect } from "react";
import { Course, UserProgress, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Award, TrendingUp, Globe, Star, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, completedCourses: 0, totalPoints: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const courses = await Course.list("-created_date", 6);
      setRecentCourses(courses);
      
      const progress = await UserProgress.filter({ user_email: currentUser.email });
      const completed = progress.filter(p => p.status === "completed").length;
      
      setStats({
        totalCourses: courses.length,
        completedCourses: completed,
        totalPoints: currentUser.total_points || 0
      });
    } catch (error) {
      console.error("加载数据失败:", error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCountryFlag = (country) => {
    const flags = {
      china: "🇨🇳", usa: "🇺🇸", japan: "🇯🇵", france: "🇫🇷", 
      germany: "🇩🇪", italy: "🇮🇹", spain: "🇪🇸", korea: "🇰🇷",
      india: "🇮🇳", brazil: "🇧🇷"
    };
    return flags[country] || "🌍";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              探索世界文化
            </h1>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            通过互动学习体验，深入了解世界各国的文化传统，获得积分奖励，开启您的全球文化之旅
          </p>
          <Link to={createPageUrl("Courses")}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              开始学习
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">总课程数</CardTitle>
                <BookOpen className="w-5 h-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{stats.totalCourses}</div>
                <p className="text-blue-700 text-sm mt-1">门精品课程</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-800">已完成</CardTitle>
                <Star className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">{stats.completedCourses}</div>
                <p className="text-green-700 text-sm mt-1">门课程完成</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">总积分</CardTitle>
                <Award className="w-5 h-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{stats.totalPoints}</div>
                <p className="text-purple-700 text-sm mt-1">积分可兑换奖励</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Featured Courses */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">热门课程</h2>
            <Link to={createPageUrl("Courses")}>
              <Button variant="outline" className="hover:bg-purple-50 hover:border-purple-300 transition-colors duration-300">
                查看全部
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/80 backdrop-blur-sm border-white/20">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 relative overflow-hidden">
                      {course.image_url && (
                        <img 
                          src={course.image_url} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="text-3xl">{getCountryFlag(course.country)}</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty === "beginner" ? "初级" : 
                           course.difficulty === "intermediate" ? "中级" : "高级"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration_minutes || 30}分钟
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {course.points_reward}积分
                        </div>
                      </div>
                      <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                        <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                          开始学习
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

