import React, { useState, useEffect } from "react";
import { Course, UserProgress, User } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Filter, Clock, Award, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [userProgress, setUserProgress] = useState([]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const filterCourses = () => {
      let filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filterCountry !== "all") {
        filtered = filtered.filter(course => course.country === filterCountry);
      }

      if (filterDifficulty !== "all") {
        filtered = filtered.filter(course => course.difficulty === filterDifficulty);
      }

      setFilteredCourses(filtered);
    };

    filterCourses();
  }, [courses, searchTerm, filterCountry, filterDifficulty]);

  const loadCourses = async () => {
    try {
      const allCourses = await Course.list("-created_date");
      setCourses(allCourses);

      try {
        const user = await User.me();
        const progress = await UserProgress.filter({ user_email: user.email });
        setUserProgress(progress);
      } catch (error) {
        // User not logged in, progress will remain empty, which is fine.
        console.log("用户未登录");
      }
    } catch (error) {
      console.error("加载课程失败:", error);
    }
  };

  const getCourseProgress = (courseId) => {
    return userProgress.find(p => p.course_id === courseId);
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

  const getCountryName = (country) => {
    const names = {
      china: "中国", usa: "美国", japan: "日本", france: "法国",
      germany: "德国", italy: "意大利", spain: "西班牙", korea: "韩国",
      india: "印度", brazil: "巴西"
    };
    return names[country] || country;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">课程中心</h1>
          <p className="text-gray-600">探索世界各国的文化课程，开启您的学习之旅</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索课程名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4">
                <Select value={filterCountry} onValueChange={setFilterCountry}>
                  <SelectTrigger className="w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="国家" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部国家</SelectItem>
                    <SelectItem value="china">中国</SelectItem>
                    <SelectItem value="usa">美国</SelectItem>
                    <SelectItem value="japan">日本</SelectItem>
                    <SelectItem value="france">法国</SelectItem>
                    <SelectItem value="germany">德国</SelectItem>
                    <SelectItem value="italy">意大利</SelectItem>
                    <SelectItem value="spain">西班牙</SelectItem>
                    <SelectItem value="korea">韩国</SelectItem>
                    <SelectItem value="india">印度</SelectItem>
                    <SelectItem value="brazil">巴西</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="难度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部难度</SelectItem>
                    <SelectItem value="beginner">初级</SelectItem>
                    <SelectItem value="intermediate">中级</SelectItem>
                    <SelectItem value="advanced">高级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const progress = getCourseProgress(course.id);

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 h-full">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 relative overflow-hidden">
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
                  
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
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
                          {progress ? (
                            progress.status === "completed" ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" /> 已完成
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" /> 继续学习
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" /> 开始学习
                            </div>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无相关课程</h3>
            <p className="text-gray-500">请尝试调整搜索条件或稍后再试</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

