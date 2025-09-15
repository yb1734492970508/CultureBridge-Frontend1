import React, { useState, useEffect } from "react";
import { Course, UserProgress, User } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Clock, Award, Star, CheckCircle, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [user, setUser] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("id");

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const courses = await Course.list();
        const foundCourse = courses.find(c => c.id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
        }

        try {
          const currentUser = await User.me();
          setUser(currentUser);
          
          const userProgress = await UserProgress.filter({ 
            user_email: currentUser.email, 
            course_id: courseId 
          });
          
          if (userProgress.length > 0) {
            setProgress(userProgress[0]);
          }
        } catch (error) {
          console.log("用户未登录");
        }
      } catch (error) {
        console.error("加载课程数据失败:", error);
      }
    };

    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const startCourse = async () => {
    if (!user) {
      try {
        await User.loginWithRedirect(window.location.href);
        return;
      } catch (error) {
        console.error("登录失败:", error);
        return;
      }
    }

    try {
      if (!progress) {
        await UserProgress.create({
          user_email: user.email,
          course_id: courseId,
          status: "in_progress",
          progress_percentage: 0
        });
      }
      
      setProgress(prev => prev || { 
        status: "in_progress", 
        progress_percentage: 0,
        user_email: user.email,
        course_id: courseId
      });
    } catch (error) {
      console.error("开始课程失败:", error);
    }
  };

  const completeCourse = async () => {
    if (!user || !course) return;
    
    setIsCompleting(true);
    try {
      const completionDate = new Date().toISOString().split("T")[0];
      
      if (progress && progress.id) {
        await UserProgress.update(progress.id, {
          status: "completed",
          progress_percentage: 100,
          points_earned: course.points_reward,
          completion_date: completionDate
        });
      } else {
        await UserProgress.create({
          user_email: user.email,
          course_id: courseId,
          status: "completed",
          progress_percentage: 100,
          points_earned: course.points_reward,
          completion_date: completionDate
        });
      }

      // Update user points
      const newTotalPoints = (user.total_points || 0) + course.points_reward;
      const newLevel = Math.floor(newTotalPoints / 100) + 1;
      
      await User.updateMyUserData({
        total_points: newTotalPoints,
        level: newLevel,
        last_learning_date: completionDate
      });

      setProgress({ 
        ...progress, 
        status: "completed", 
        progress_percentage: 100,
        points_earned: course.points_reward 
      });
      
      setUser(prev => ({ 
        ...prev, 
        total_points: newTotalPoints, 
        level: newLevel 
      }));
    } catch (error) {
      console.error("完成课程失败:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 border-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Courses"))}
            className="hover:bg-purple-50 hover:border-purple-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">课程详情</h1>
            <p className="text-gray-600 text-sm">深入了解课程内容和要求</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 mb-6">
              <div className="relative h-64">
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500">
                  {course.image_url && (
                    <img 
                      src={course.image_url} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="absolute top-6 left-6">
                  <span className="text-4xl">{getCountryFlag(course.country)}</span>
                </div>
                <div className="absolute top-6 right-6">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty === "beginner" ? "初级" : 
                     course.difficulty === "intermediate" ? "中级" : "高级"}
                  </Badge>
                </div>
                
                {progress?.status === "completed" && (
                  <div className="absolute bottom-6 right-6">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      已完成
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">{course.title}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-8 text-sm">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800">预计 {course.duration_minutes || 30} 分钟</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800">奖励 {course.points_reward} 积分</span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">课程内容</h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {course.content}
                    </div>
                  </div>
                </div>

                {course.tags && course.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2 text-gray-900">课程标签</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 sticky top-6">
              <CardContent className="p-6">
                {progress ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">学习进度</span>
                        <span className="text-sm text-gray-500">{progress.progress_percentage}%</span>
                      </div>
                      <Progress value={progress.progress_percentage} className="h-2" />
                    </div>

                    {progress.status === "completed" ? (
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <h3 className="font-semibold text-green-800">课程已完成!</h3>
                          <p className="text-green-600 text-sm mt-1">
                            获得了 {progress.points_earned} 积分奖励
                          </p>
                        </div>
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          onClick={() => navigate(createPageUrl("Courses"))}
                        >
                          浏览更多课程
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                        onClick={completeCourse}
                        disabled={isCompleting}
                      >
                        {isCompleting ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            完成中...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            完成课程
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Play className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-blue-800">准备开始学习</h3>
                      <p className="text-blue-600 text-sm mt-1">
                        完成后可获得 {course.points_reward} 积分
                      </p>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                      onClick={startCourse}
                    >
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        开始学习
                      </div>
                    </Button>
                  </div>
                )}

                {user && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold mb-3 text-gray-900">个人统计</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">当前等级</span>
                        <span className="font-medium">Level {user.level || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">总积分</span>
                        <span className="font-medium">{user.total_points || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


