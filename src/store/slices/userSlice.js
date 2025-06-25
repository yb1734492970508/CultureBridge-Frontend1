/**
 * 用户状态管理
 * 处理用户个人资料、偏好设置、学习进度等
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../services/api';

// 异步action：获取用户资料
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProfile(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：更新用户资料
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(userId, profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：上传头像
export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async ({ userId, file }, { rejectWithValue }) => {
    try {
      const response = await userAPI.uploadAvatar(userId, file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：获取用户统计
export const fetchUserStats = createAsyncThunk(
  'user/fetchUserStats',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getStats(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：获取用户成就
export const fetchUserAchievements = createAsyncThunk(
  'user/fetchUserAchievements',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getAchievements(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 异步action：更新用户偏好
export const updateUserPreferences = createAsyncThunk(
  'user/updateUserPreferences',
  async ({ userId, preferences }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updatePreferences(userId, preferences);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 初始状态
const initialState = {
  // 基本信息
  profile: {
    id: null,
    username: '',
    email: '',
    displayName: '',
    avatar: '',
    bio: '',
    location: '',
    timezone: '',
    birthDate: null,
    gender: '',
    nativeLanguage: '',
    learningLanguages: [],
    interests: [],
    joinDate: null,
    lastActive: null,
  },
  
  // 统计数据
  stats: {
    totalPoints: 0,
    level: 1,
    experience: 0,
    streak: 0,
    lessonsCompleted: 0,
    wordsLearned: 0,
    conversationsHad: 0,
    culturesExplored: 0,
    friendsConnected: 0,
    achievementsUnlocked: 0,
  },
  
  // 成就系统
  achievements: [],
  unlockedBadges: [],
  
  // 学习进度
  learningProgress: {
    currentCourse: null,
    completedLessons: [],
    currentStreak: 0,
    weeklyGoal: 0,
    weeklyProgress: 0,
    dailyGoal: 0,
    dailyProgress: 0,
  },
  
  // 用户偏好
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      reminders: true,
      achievements: true,
      social: true,
    },
    privacy: {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowFriendRequests: true,
      showLearningProgress: true,
    },
    learning: {
      difficultyLevel: 'intermediate',
      studyReminders: true,
      voiceEnabled: true,
      autoTranslate: true,
    },
  },
  
  // 社交信息
  social: {
    friends: [],
    followers: [],
    following: [],
    blockedUsers: [],
    friendRequests: [],
  },
  
  // 状态标志
  isLoading: false,
  isUpdating: false,
  error: null,
  lastUpdated: null,
};

// 创建slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 重置用户状态
    resetUser: () => initialState,
    
    // 更新积分
    updatePoints: (state, action) => {
      state.stats.totalPoints += action.payload;
    },
    
    // 更新连续天数
    updateStreak: (state, action) => {
      state.stats.streak = action.payload;
      state.learningProgress.currentStreak = action.payload;
    },
    
    // 添加成就
    addAchievement: (state, action) => {
      const achievement = action.payload;
      if (!state.achievements.find(a => a.id === achievement.id)) {
        state.achievements.push(achievement);
        state.stats.achievementsUnlocked += 1;
      }
    },
    
    // 解锁徽章
    unlockBadge: (state, action) => {
      const badge = action.payload;
      if (!state.unlockedBadges.find(b => b.id === badge.id)) {
        state.unlockedBadges.push(badge);
      }
    },
    
    // 更新学习进度
    updateLearningProgress: (state, action) => {
      state.learningProgress = { ...state.learningProgress, ...action.payload };
    },
    
    // 完成课程
    completeLesson: (state, action) => {
      const lessonId = action.payload;
      if (!state.learningProgress.completedLessons.includes(lessonId)) {
        state.learningProgress.completedLessons.push(lessonId);
        state.stats.lessonsCompleted += 1;
      }
    },
    
    // 添加朋友
    addFriend: (state, action) => {
      const friend = action.payload;
      if (!state.social.friends.find(f => f.id === friend.id)) {
        state.social.friends.push(friend);
        state.stats.friendsConnected += 1;
      }
    },
    
    // 移除朋友
    removeFriend: (state, action) => {
      const friendId = action.payload;
      state.social.friends = state.social.friends.filter(f => f.id !== friendId);
      state.stats.friendsConnected = Math.max(0, state.stats.friendsConnected - 1);
    },
    
    // 更新在线状态
    updateLastActive: (state) => {
      state.profile.lastActive = new Date().toISOString();
    },
    
    // 设置主题
    setTheme: (state, action) => {
      state.preferences.theme = action.payload;
    },
    
    // 设置语言
    setLanguage: (state, action) => {
      state.preferences.language = action.payload;
    },
    
    // 更新通知设置
    updateNotificationSettings: (state, action) => {
      state.preferences.notifications = { ...state.preferences.notifications, ...action.payload };
    },
    
    // 更新隐私设置
    updatePrivacySettings: (state, action) => {
      state.preferences.privacy = { ...state.preferences.privacy, ...action.payload };
    },
    
    // 更新学习设置
    updateLearningSettings: (state, action) => {
      state.preferences.learning = { ...state.preferences.learning, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // 获取用户资料
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = { ...state.profile, ...action.payload };
        state.lastUpdated = Date.now();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // 更新用户资料
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = { ...state.profile, ...action.payload };
        state.lastUpdated = Date.now();
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
    
    // 上传头像
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile.avatar = action.payload.avatarUrl;
        state.lastUpdated = Date.now();
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
    
    // 获取用户统计
    builder
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...action.payload };
      });
    
    // 获取用户成就
    builder
      .addCase(fetchUserAchievements.fulfilled, (state, action) => {
        state.achievements = action.payload.achievements || [];
        state.unlockedBadges = action.payload.badges || [];
      });
    
    // 更新用户偏好
    builder
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.preferences = { ...state.preferences, ...action.payload };
        state.lastUpdated = Date.now();
      });
  },
});

// 导出actions
export const {
  clearError,
  resetUser,
  updatePoints,
  updateStreak,
  addAchievement,
  unlockBadge,
  updateLearningProgress,
  completeLesson,
  addFriend,
  removeFriend,
  updateLastActive,
  setTheme,
  setLanguage,
  updateNotificationSettings,
  updatePrivacySettings,
  updateLearningSettings,
} = userSlice.actions;

// 选择器
export const selectUser = (state) => state.user;
export const selectUserProfile = (state) => state.user.profile;
export const selectUserStats = (state) => state.user.stats;
export const selectUserAchievements = (state) => state.user.achievements;
export const selectUserPreferences = (state) => state.user.preferences;
export const selectUserSocial = (state) => state.user.social;
export const selectUserTheme = (state) => state.user.preferences.theme;
export const selectUserLanguage = (state) => state.user.preferences.language;
export const selectLearningProgress = (state) => state.user.learningProgress;

// 计算用户等级
export const selectUserLevel = (state) => {
  const experience = state.user.stats.experience;
  return Math.floor(experience / 1000) + 1;
};

// 计算下一等级所需经验
export const selectExperienceToNextLevel = (state) => {
  const experience = state.user.stats.experience;
  const currentLevel = Math.floor(experience / 1000) + 1;
  const nextLevelExp = currentLevel * 1000;
  return nextLevelExp - experience;
};

// 检查是否完成每日目标
export const selectIsDailyGoalComplete = (state) => {
  const { dailyGoal, dailyProgress } = state.user.learningProgress;
  return dailyProgress >= dailyGoal;
};

// 检查是否完成每周目标
export const selectIsWeeklyGoalComplete = (state) => {
  const { weeklyGoal, weeklyProgress } = state.user.learningProgress;
  return weeklyProgress >= weeklyGoal;
};

export default userSlice.reducer;

