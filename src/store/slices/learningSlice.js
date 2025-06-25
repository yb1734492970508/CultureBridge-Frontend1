/**
 * 学习状态管理
 * 处理语言学习、课程进度、练习记录等
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { learningAPI } from '../services/api';

// 异步action：获取课程列表
export const fetchCourses = createAsyncThunk(
  'learning/fetchCourses',
  async (language, { rejectWithValue }) => {
    try {
      const response = await learningAPI.getCourses(language);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：获取课程详情
export const fetchCourseDetails = createAsyncThunk(
  'learning/fetchCourseDetails',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await learningAPI.getCourseDetails(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：获取学习进度
export const fetchLearningProgress = createAsyncThunk(
  'learning/fetchLearningProgress',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await learningAPI.getProgress(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：提交练习结果
export const submitExercise = createAsyncThunk(
  'learning/submitExercise',
  async ({ exerciseId, answers }, { rejectWithValue }) => {
    try {
      const response = await learningAPI.submitExercise(exerciseId, answers);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：完成课程
export const completeCourse = createAsyncThunk(
  'learning/completeCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await learningAPI.completeCourse(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 初始状态
const initialState = {
  // 可用语言
  availableLanguages: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ],
  
  // 当前学习语言
  currentLanguage: 'en',
  
  // 课程数据
  courses: [],
  currentCourse: null,
  
  // 学习进度
  progress: {
    totalLessons: 0,
    completedLessons: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalStudyTime: 0, // 分钟
    weeklyGoal: 30, // 分钟
    weeklyProgress: 0,
    dailyGoal: 15, // 分钟
    dailyProgress: 0,
    level: 1,
    experience: 0,
    nextLevelExp: 1000,
  },
  
  // 词汇学习
  vocabulary: {
    totalWords: 0,
    learnedWords: 0,
    reviewWords: 0,
    newWords: [],
    reviewQueue: [],
    masteredWords: [],
  },
  
  // 练习记录
  exercises: {
    current: null,
    history: [],
    statistics: {
      totalAttempts: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageTime: 0,
    },
  },
  
  // 学习会话
  sessions: {
    current: null,
    history: [],
    todayTime: 0,
    weekTime: 0,
  },
  
  // 成就系统
  achievements: {
    unlocked: [],
    available: [],
    progress: {},
  },
  
  // 学习偏好
  preferences: {
    difficulty: 'intermediate', // 'beginner', 'intermediate', 'advanced'
    studyReminders: true,
    reminderTime: '19:00',
    autoAdvance: true,
    showTranslations: true,
    enableAudio: true,
    speechSpeed: 'normal', // 'slow', 'normal', 'fast'
  },
  
  // 复习系统
  review: {
    dueCards: [],
    reviewedToday: 0,
    nextReviewTime: null,
    spaceRepetition: {
      intervals: [1, 3, 7, 14, 30, 90], // 天数
      easeFactor: 2.5,
    },
  },
  
  // 语音练习
  pronunciation: {
    isRecording: false,
    currentWord: null,
    scores: {},
    feedback: [],
  },
  
  // 文化学习
  culture: {
    topics: [],
    currentTopic: null,
    completedTopics: [],
    favorites: [],
  },
  
  // 状态标志
  isLoading: false,
  isSubmitting: false,
  error: null,
  
  // 搜索和筛选
  search: {
    query: '',
    results: [],
    filters: {
      difficulty: 'all',
      category: 'all',
      duration: 'all',
    },
  },
};

// 创建slice
const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 设置当前学习语言
    setCurrentLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
    
    // 设置当前课程
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
    },
    
    // 开始学习会话
    startLearningSession: (state, action) => {
      const session = {
        id: Date.now(),
        startTime: Date.now(),
        courseId: action.payload.courseId,
        lessonId: action.payload.lessonId,
        type: action.payload.type || 'lesson',
      };
      state.sessions.current = session;
    },
    
    // 结束学习会话
    endLearningSession: (state, action) => {
      if (state.sessions.current) {
        const session = {
          ...state.sessions.current,
          endTime: Date.now(),
          duration: action.payload.duration,
          wordsLearned: action.payload.wordsLearned || 0,
          exercisesCompleted: action.payload.exercisesCompleted || 0,
          accuracy: action.payload.accuracy || 0,
        };
        
        state.sessions.history.unshift(session);
        state.sessions.current = null;
        
        // 更新今日学习时间
        state.sessions.todayTime += session.duration;
        state.progress.dailyProgress += session.duration;
        state.progress.totalStudyTime += session.duration;
      }
    },
    
    // 更新学习进度
    updateProgress: (state, action) => {
      state.progress = { ...state.progress, ...action.payload };
    },
    
    // 完成课程
    completeLesson: (state, action) => {
      const lessonId = action.payload;
      state.progress.completedLessons += 1;
      
      // 增加经验值
      const expGained = 50;
      state.progress.experience += expGained;
      
      // 检查是否升级
      if (state.progress.experience >= state.progress.nextLevelExp) {
        state.progress.level += 1;
        state.progress.experience -= state.progress.nextLevelExp;
        state.progress.nextLevelExp = state.progress.level * 1000;
      }
    },
    
    // 更新连续天数
    updateStreak: (state, action) => {
      state.progress.currentStreak = action.payload;
      if (action.payload > state.progress.longestStreak) {
        state.progress.longestStreak = action.payload;
      }
    },
    
    // 添加新单词
    addNewWord: (state, action) => {
      const word = action.payload;
      if (!state.vocabulary.newWords.find(w => w.id === word.id)) {
        state.vocabulary.newWords.push(word);
        state.vocabulary.totalWords += 1;
      }
    },
    
    // 学会单词
    learnWord: (state, action) => {
      const wordId = action.payload;
      
      // 从新单词中移除
      state.vocabulary.newWords = state.vocabulary.newWords.filter(w => w.id !== wordId);
      
      // 添加到复习队列
      const reviewCard = {
        wordId,
        nextReview: Date.now() + 24 * 60 * 60 * 1000, // 明天
        interval: 1,
        easeFactor: 2.5,
        reviews: 0,
      };
      state.vocabulary.reviewQueue.push(reviewCard);
      state.vocabulary.learnedWords += 1;
    },
    
    // 掌握单词
    masterWord: (state, action) => {
      const wordId = action.payload;
      
      // 从复习队列中移除
      state.vocabulary.reviewQueue = state.vocabulary.reviewQueue.filter(w => w.wordId !== wordId);
      
      // 添加到已掌握列表
      if (!state.vocabulary.masteredWords.includes(wordId)) {
        state.vocabulary.masteredWords.push(wordId);
      }
    },
    
    // 开始练习
    startExercise: (state, action) => {
      state.exercises.current = {
        id: action.payload.id,
        type: action.payload.type,
        startTime: Date.now(),
        questions: action.payload.questions,
        currentQuestion: 0,
        answers: [],
        score: 0,
      };
    },
    
    // 回答问题
    answerQuestion: (state, action) => {
      if (state.exercises.current) {
        const { answer, isCorrect, timeSpent } = action.payload;
        
        state.exercises.current.answers.push({
          questionIndex: state.exercises.current.currentQuestion,
          answer,
          isCorrect,
          timeSpent,
        });
        
        if (isCorrect) {
          state.exercises.current.score += 1;
        }
        
        state.exercises.current.currentQuestion += 1;
      }
    },
    
    // 完成练习
    finishExercise: (state, action) => {
      if (state.exercises.current) {
        const exercise = {
          ...state.exercises.current,
          endTime: Date.now(),
          totalTime: Date.now() - state.exercises.current.startTime,
          accuracy: (state.exercises.current.score / state.exercises.current.questions.length) * 100,
        };
        
        state.exercises.history.unshift(exercise);
        state.exercises.current = null;
        
        // 更新统计
        state.exercises.statistics.totalAttempts += 1;
        state.exercises.statistics.correctAnswers += exercise.score;
        state.exercises.statistics.accuracy = 
          (state.exercises.statistics.correctAnswers / 
           (state.exercises.statistics.totalAttempts * exercise.questions.length)) * 100;
      }
    },
    
    // 开始语音录制
    startPronunciationRecording: (state, action) => {
      state.pronunciation.isRecording = true;
      state.pronunciation.currentWord = action.payload;
    },
    
    // 停止语音录制
    stopPronunciationRecording: (state) => {
      state.pronunciation.isRecording = false;
    },
    
    // 添加发音分数
    addPronunciationScore: (state, action) => {
      const { word, score, feedback } = action.payload;
      state.pronunciation.scores[word] = score;
      if (feedback) {
        state.pronunciation.feedback.push({
          word,
          feedback,
          timestamp: Date.now(),
        });
      }
    },
    
    // 解锁成就
    unlockAchievement: (state, action) => {
      const achievement = action.payload;
      if (!state.achievements.unlocked.find(a => a.id === achievement.id)) {
        state.achievements.unlocked.push(achievement);
      }
    },
    
    // 更新成就进度
    updateAchievementProgress: (state, action) => {
      const { achievementId, progress } = action.payload;
      state.achievements.progress[achievementId] = progress;
    },
    
    // 更新学习偏好
    updateLearningPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // 添加复习卡片
    addReviewCard: (state, action) => {
      const card = action.payload;
      const existingIndex = state.review.dueCards.findIndex(c => c.wordId === card.wordId);
      
      if (existingIndex >= 0) {
        state.review.dueCards[existingIndex] = card;
      } else {
        state.review.dueCards.push(card);
      }
    },
    
    // 完成复习
    completeReview: (state, action) => {
      const { wordId, quality } = action.payload; // quality: 0-5
      const cardIndex = state.review.dueCards.findIndex(c => c.wordId === wordId);
      
      if (cardIndex >= 0) {
        const card = state.review.dueCards[cardIndex];
        
        // 计算新的间隔和难度因子
        if (quality >= 3) {
          // 正确回答
          card.interval = Math.round(card.interval * card.easeFactor);
          card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        } else {
          // 错误回答
          card.interval = 1;
          card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
        }
        
        card.nextReview = Date.now() + card.interval * 24 * 60 * 60 * 1000;
        card.reviews += 1;
        
        // 移动到复习队列
        state.vocabulary.reviewQueue.push(card);
        state.review.dueCards.splice(cardIndex, 1);
        state.review.reviewedToday += 1;
      }
    },
    
    // 设置搜索查询
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    
    // 设置搜索结果
    setSearchResults: (state, action) => {
      state.search.results = action.payload;
    },
    
    // 更新搜索筛选
    updateSearchFilters: (state, action) => {
      state.search.filters = { ...state.search.filters, ...action.payload };
    },
    
    // 添加文化主题到收藏
    addCultureFavorite: (state, action) => {
      const topicId = action.payload;
      if (!state.culture.favorites.includes(topicId)) {
        state.culture.favorites.push(topicId);
      }
    },
    
    // 移除文化主题收藏
    removeCultureFavorite: (state, action) => {
      const topicId = action.payload;
      state.culture.favorites = state.culture.favorites.filter(id => id !== topicId);
    },
    
    // 完成文化主题
    completeCultureTopic: (state, action) => {
      const topicId = action.payload;
      if (!state.culture.completedTopics.includes(topicId)) {
        state.culture.completedTopics.push(topicId);
      }
    },
  },
  extraReducers: (builder) => {
    // 获取课程列表
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // 获取课程详情
    builder
      .addCase(fetchCourseDetails.fulfilled, (state, action) => {
        state.currentCourse = action.payload;
      });
    
    // 获取学习进度
    builder
      .addCase(fetchLearningProgress.fulfilled, (state, action) => {
        state.progress = { ...state.progress, ...action.payload };
      });
    
    // 提交练习结果
    builder
      .addCase(submitExercise.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(submitExercise.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // 处理练习结果
        const result = action.payload;
        if (result.pointsEarned) {
          state.progress.experience += result.pointsEarned;
        }
      })
      .addCase(submitExercise.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
    
    // 完成课程
    builder
      .addCase(completeCourse.fulfilled, (state, action) => {
        const result = action.payload;
        state.progress.completedLessons += 1;
        if (result.pointsEarned) {
          state.progress.experience += result.pointsEarned;
        }
      });
  },
});

// 导出actions
export const {
  clearError,
  setCurrentLanguage,
  setCurrentCourse,
  startLearningSession,
  endLearningSession,
  updateProgress,
  completeLesson,
  updateStreak,
  addNewWord,
  learnWord,
  masterWord,
  startExercise,
  answerQuestion,
  finishExercise,
  startPronunciationRecording,
  stopPronunciationRecording,
  addPronunciationScore,
  unlockAchievement,
  updateAchievementProgress,
  updateLearningPreferences,
  addReviewCard,
  completeReview,
  setSearchQuery,
  setSearchResults,
  updateSearchFilters,
  addCultureFavorite,
  removeCultureFavorite,
  completeCultureTopic,
} = learningSlice.actions;

// 选择器
export const selectLearning = (state) => state.learning;
export const selectAvailableLanguages = (state) => state.learning.availableLanguages;
export const selectCurrentLanguage = (state) => state.learning.currentLanguage;
export const selectCourses = (state) => state.learning.courses;
export const selectCurrentCourse = (state) => state.learning.currentCourse;
export const selectLearningProgress = (state) => state.learning.progress;
export const selectVocabulary = (state) => state.learning.vocabulary;
export const selectExercises = (state) => state.learning.exercises;
export const selectCurrentExercise = (state) => state.learning.exercises.current;
export const selectLearningPreferences = (state) => state.learning.preferences;
export const selectAchievements = (state) => state.learning.achievements;
export const selectReview = (state) => state.learning.review;
export const selectPronunciation = (state) => state.learning.pronunciation;
export const selectCulture = (state) => state.learning.culture;
export const selectLearningSearch = (state) => state.learning.search;

// 计算选择器
export const selectProgressPercentage = (state) => {
  const { completedLessons, totalLessons } = state.learning.progress;
  return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
};

export const selectDailyGoalProgress = (state) => {
  const { dailyProgress, dailyGoal } = state.learning.progress;
  return dailyGoal > 0 ? (dailyProgress / dailyGoal) * 100 : 0;
};

export const selectWeeklyGoalProgress = (state) => {
  const { weeklyProgress, weeklyGoal } = state.learning.progress;
  return weeklyGoal > 0 ? (weeklyProgress / weeklyGoal) * 100 : 0;
};

export const selectVocabularyProgress = (state) => {
  const { learnedWords, totalWords } = state.learning.vocabulary;
  return totalWords > 0 ? (learnedWords / totalWords) * 100 : 0;
};

export const selectDueReviewCount = (state) => {
  const now = Date.now();
  return state.learning.review.dueCards.filter(card => card.nextReview <= now).length;
};

export const selectCurrentExerciseProgress = (state) => {
  const exercise = state.learning.exercises.current;
  if (!exercise) return 0;
  return (exercise.currentQuestion / exercise.questions.length) * 100;
};

export default learningSlice.reducer;

