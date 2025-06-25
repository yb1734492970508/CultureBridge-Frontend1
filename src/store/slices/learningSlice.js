/**
 * 学习状态管理
 * 处理学习课程、进度、成就等相关状态
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 异步action：获取课程列表
export const getCourses = createAsyncThunk(
  'learning/getCourses',
  async (_, { rejectWithValue }) => {
    try {
      // 模拟API调用
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: [
              {
                id: 1,
                title: '中国传统文化入门',
                description: '了解中国五千年历史文化',
                level: 'beginner',
                duration: '2小时',
                progress: 75,
                instructor: '李老师',
                rating: 4.8,
                students: 1250,
                thumbnail: '/api/placeholder/300/200'
              },
              {
                id: 2,
                title: '日本茶道文化',
                description: '体验日本传统茶道艺术',
                level: 'intermediate',
                duration: '1.5小时',
                progress: 30,
                instructor: '田中老师',
                rating: 4.9,
                students: 890,
                thumbnail: '/api/placeholder/300/200'
              }
            ]
          });
        }, 1000);
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步action：获取学习进度
export const getLearningProgress = createAsyncThunk(
  'learning/getLearningProgress',
  async (userId, { rejectWithValue }) => {
    try {
      // 模拟API调用
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              totalCourses: 15,
              completedCourses: 8,
              totalHours: 45,
              currentStreak: 7,
              achievements: 12,
              points: 2850
            }
          });
        }, 500);
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 初始状态
const initialState = {
  // 课程相关
  courses: [],
  currentCourse: null,
  isLoadingCourses: false,
  
  // 学习进度
  progress: {
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    currentStreak: 0,
    achievements: 0,
    points: 0
  },
  isLoadingProgress: false,
  
  // 当前学习状态
  currentLesson: null,
  isLearning: false,
  lessonProgress: 0,
  
  // 学习历史
  learningHistory: [
    {
      id: 1,
      courseId: 1,
      lessonTitle: '中国书法艺术',
      completedAt: '2024-06-20',
      duration: 30,
      score: 95
    },
    {
      id: 2,
      courseId: 2,
      lessonTitle: '茶道基础礼仪',
      completedAt: '2024-06-19',
      duration: 25,
      score: 88
    }
  ],
  
  // 成就系统
  achievements: [
    {
      id: 1,
      title: '初学者',
      description: '完成第一门课程',
      icon: '🎓',
      unlocked: true,
      unlockedAt: '2024-06-15'
    },
    {
      id: 2,
      title: '文化探索者',
      description: '学习5门不同文化课程',
      icon: '🌍',
      unlocked: true,
      unlockedAt: '2024-06-18'
    },
    {
      id: 3,
      title: '学习达人',
      description: '连续学习7天',
      icon: '🔥',
      unlocked: false,
      progress: 70
    }
  ],
  
  // 学习偏好
  preferences: {
    language: 'zh-CN',
    difficulty: 'intermediate',
    interests: ['传统文化', '语言学习', '艺术'],
    studyTime: 'evening',
    notifications: true
  },
  
  // 错误状态
  error: null,
  
  // 搜索和筛选
  searchQuery: '',
  filters: {
    level: 'all',
    category: 'all',
    duration: 'all'
  }
};

// 创建slice
const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    // 设置当前课程
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
    },
    
    // 开始学习
    startLearning: (state, action) => {
      state.isLearning = true;
      state.currentLesson = action.payload;
      state.lessonProgress = 0;
    },
    
    // 结束学习
    endLearning: (state) => {
      state.isLearning = false;
      state.currentLesson = null;
      state.lessonProgress = 0;
    },
    
    // 更新课程进度
    updateLessonProgress: (state, action) => {
      state.lessonProgress = action.payload;
    },
    
    // 完成课程
    completeCourse: (state, action) => {
      const courseId = action.payload;
      const course = state.courses.find(c => c.id === courseId);
      if (course) {
        course.progress = 100;
        state.progress.completedCourses += 1;
      }
    },
    
    // 添加学习记录
    addLearningRecord: (state, action) => {
      const record = {
        id: Date.now(),
        ...action.payload,
        completedAt: new Date().toISOString().split('T')[0]
      };
      state.learningHistory.unshift(record);
      
      // 限制历史记录数量
      if (state.learningHistory.length > 100) {
        state.learningHistory = state.learningHistory.slice(0, 100);
      }
    },
    
    // 解锁成就
    unlockAchievement: (state, action) => {
      const achievementId = action.payload;
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString().split('T')[0];
      }
    },
    
    // 更新成就进度
    updateAchievementProgress: (state, action) => {
      const { achievementId, progress } = action.payload;
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        achievement.progress = progress;
      }
    },
    
    // 设置搜索查询
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    // 设置筛选条件
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // 更新学习偏好
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 增加学习积分
    addLearningPoints: (state, action) => {
      state.progress.points += action.payload;
    },
    
    // 更新学习连击
    updateStreak: (state, action) => {
      state.progress.currentStreak = action.payload;
    }
  },
  extraReducers: (builder) => {
    // 获取课程列表
    builder
      .addCase(getCourses.pending, (state) => {
        state.isLoadingCourses = true;
        state.error = null;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.isLoadingCourses = false;
        state.courses = action.payload;
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.isLoadingCourses = false;
        state.error = action.payload;
      });
    
    // 获取学习进度
    builder
      .addCase(getLearningProgress.pending, (state) => {
        state.isLoadingProgress = true;
      })
      .addCase(getLearningProgress.fulfilled, (state, action) => {
        state.isLoadingProgress = false;
        state.progress = { ...state.progress, ...action.payload };
      })
      .addCase(getLearningProgress.rejected, (state, action) => {
        state.isLoadingProgress = false;
        state.error = action.payload;
      });
  },
});

// 导出actions
export const {
  setCurrentCourse,
  startLearning,
  endLearning,
  updateLessonProgress,
  completeCourse,
  addLearningRecord,
  unlockAchievement,
  updateAchievementProgress,
  setSearchQuery,
  setFilters,
  updatePreferences,
  clearError,
  addLearningPoints,
  updateStreak,
} = learningSlice.actions;

// 选择器
export const selectLearning = (state) => state.learning;
export const selectCourses = (state) => state.learning.courses;
export const selectCurrentCourse = (state) => state.learning.currentCourse;
export const selectLearningProgress = (state) => state.learning.progress;
export const selectIsLearning = (state) => state.learning.isLearning;
export const selectCurrentLesson = (state) => state.learning.currentLesson;
export const selectLessonProgress = (state) => state.learning.lessonProgress;
export const selectLearningHistory = (state) => state.learning.learningHistory;
export const selectAchievements = (state) => state.learning.achievements;
export const selectLearningPreferences = (state) => state.learning.preferences;
export const selectSearchQuery = (state) => state.learning.searchQuery;
export const selectFilters = (state) => state.learning.filters;
export const selectIsLoadingCourses = (state) => state.learning.isLoadingCourses;
export const selectLearningError = (state) => state.learning.error;

// 计算选择器
export const selectFilteredCourses = (state) => {
  const { courses, searchQuery, filters } = state.learning;
  
  return courses.filter(course => {
    // 搜索过滤
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // 级别过滤
    if (filters.level !== 'all' && course.level !== filters.level) {
      return false;
    }
    
    // 其他过滤条件...
    
    return true;
  });
};

export const selectCompletionRate = (state) => {
  const { totalCourses, completedCourses } = state.learning.progress;
  return totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
};

// 导出reducer
export default learningSlice.reducer;

