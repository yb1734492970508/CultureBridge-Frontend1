/**
 * 用户状态管理
 * 处理用户资料、偏好设置、社交关系等相关状态
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 异步action：获取用户资料
export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      // 模拟API调用
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: userId || 'current-user',
              username: 'culturelover',
              email: 'user@culturebridge.com',
              displayName: '文化爱好者',
              avatar: '/api/placeholder/100/100',
              bio: '热爱探索世界各地文化，喜欢语言学习和文化交流',
              location: '北京, 中国',
              languages: ['中文', 'English', '日本語'],
              interests: ['传统文化', '语言学习', '艺术', '音乐'],
              joinDate: '2024-01-15',
              followers: 256,
              following: 189,
              posts: 42,
              level: 'Gold',
              points: 2850,
              badges: [
                { id: 1, name: '文化探索者', icon: '🌍', description: '探索了10种不同文化' },
                { id: 2, name: '语言大师', icon: '🗣️', description: '掌握了3种语言' },
                { id: 3, name: '社区贡献者', icon: '🤝', description: '帮助了100位用户' }
              ]
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

// 异步action：更新用户资料
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      // 模拟API调用
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              ...profileData,
              updatedAt: new Date().toISOString()
            }
          });
        }, 1000);
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步action：关注用户
export const followUser = createAsyncThunk(
  'user/followUser',
  async (targetUserId, { rejectWithValue }) => {
    try {
      // 模拟API调用
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              targetUserId,
              isFollowing: true,
              followedAt: new Date().toISOString()
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
  // 当前用户信息
  currentUser: null,
  isLoadingProfile: false,
  isUpdatingProfile: false,
  
  // 用户偏好设置
  preferences: {
    language: 'zh-CN',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      chat: true,
      learning: true,
      social: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
      allowMessages: true
    },
    learning: {
      difficulty: 'intermediate',
      studyTime: 'evening',
      reminderEnabled: true,
      autoTranslate: false
    }
  },
  
  // 社交关系
  following: [],
  followers: [],
  blockedUsers: [],
  isLoadingFollowing: false,
  isLoadingFollowers: false,
  
  // 用户活动
  activities: [
    {
      id: 1,
      type: 'course_completed',
      title: '完成了《中国传统文化》课程',
      timestamp: '2024-06-25T10:00:00Z',
      points: 100
    },
    {
      id: 2,
      type: 'badge_earned',
      title: '获得了"文化探索者"徽章',
      timestamp: '2024-06-24T15:30:00Z',
      points: 50
    }
  ],
  
  // 用户统计
  stats: {
    totalLearningTime: 45, // 小时
    coursesCompleted: 8,
    postsCreated: 42,
    commentsPosted: 156,
    likesReceived: 892,
    streakDays: 7,
    currentLevel: 'Gold',
    nextLevelProgress: 75
  },
  
  // 成就系统
  achievements: [
    {
      id: 1,
      title: '初学者',
      description: '完成第一门课程',
      icon: '🎓',
      category: 'learning',
      unlocked: true,
      unlockedAt: '2024-06-15',
      points: 10
    },
    {
      id: 2,
      title: '文化探索者',
      description: '学习5门不同文化课程',
      icon: '🌍',
      category: 'culture',
      unlocked: true,
      unlockedAt: '2024-06-18',
      points: 50
    },
    {
      id: 3,
      title: '社交达人',
      description: '获得100个关注者',
      icon: '👥',
      category: 'social',
      unlocked: false,
      progress: 75,
      target: 100,
      points: 100
    }
  ],
  
  // 收藏和书签
  bookmarks: [],
  favorites: [],
  
  // 搜索历史
  searchHistory: [],
  
  // 错误状态
  error: null,
  
  // 头像上传
  isUploadingAvatar: false,
  avatarUploadProgress: 0,
  
  // 账户安全
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: '2024-05-15',
    loginSessions: [
      {
        id: 1,
        device: 'Chrome on Windows',
        location: '北京, 中国',
        lastActive: '2024-06-25T12:00:00Z',
        isCurrent: true
      }
    ]
  },
  
  // 订阅和会员
  subscription: {
    plan: 'premium',
    status: 'active',
    expiresAt: '2024-12-25',
    features: ['unlimited_courses', 'priority_support', 'advanced_analytics']
  }
};

// 创建slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 设置当前用户
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    
    // 清除当前用户
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    
    // 更新用户偏好
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // 更新通知设置
    updateNotificationSettings: (state, action) => {
      state.preferences.notifications = { 
        ...state.preferences.notifications, 
        ...action.payload 
      };
    },
    
    // 更新隐私设置
    updatePrivacySettings: (state, action) => {
      state.preferences.privacy = { 
        ...state.preferences.privacy, 
        ...action.payload 
      };
    },
    
    // 更新学习设置
    updateLearningSettings: (state, action) => {
      state.preferences.learning = { 
        ...state.preferences.learning, 
        ...action.payload 
      };
    },
    
    // 添加关注
    addFollowing: (state, action) => {
      const userId = action.payload;
      if (!state.following.includes(userId)) {
        state.following.push(userId);
        state.stats.following = state.following.length;
      }
    },
    
    // 取消关注
    removeFollowing: (state, action) => {
      const userId = action.payload;
      state.following = state.following.filter(id => id !== userId);
      state.stats.following = state.following.length;
    },
    
    // 添加粉丝
    addFollower: (state, action) => {
      const userId = action.payload;
      if (!state.followers.includes(userId)) {
        state.followers.push(userId);
        state.stats.followers = state.followers.length;
      }
    },
    
    // 移除粉丝
    removeFollower: (state, action) => {
      const userId = action.payload;
      state.followers = state.followers.filter(id => id !== userId);
      state.stats.followers = state.followers.length;
    },
    
    // 屏蔽用户
    blockUser: (state, action) => {
      const userId = action.payload;
      if (!state.blockedUsers.includes(userId)) {
        state.blockedUsers.push(userId);
      }
      // 同时从关注列表中移除
      state.following = state.following.filter(id => id !== userId);
      state.followers = state.followers.filter(id => id !== userId);
    },
    
    // 解除屏蔽
    unblockUser: (state, action) => {
      const userId = action.payload;
      state.blockedUsers = state.blockedUsers.filter(id => id !== userId);
    },
    
    // 添加活动记录
    addActivity: (state, action) => {
      const activity = {
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      state.activities.unshift(activity);
      
      // 限制活动记录数量
      if (state.activities.length > 100) {
        state.activities = state.activities.slice(0, 100);
      }
    },
    
    // 更新统计数据
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    
    // 解锁成就
    unlockAchievement: (state, action) => {
      const achievementId = action.payload;
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        
        // 添加积分
        state.stats.totalPoints = (state.stats.totalPoints || 0) + achievement.points;
        
        // 添加活动记录
        const activity = {
          id: Date.now(),
          type: 'achievement_unlocked',
          title: `解锁成就：${achievement.title}`,
          timestamp: new Date().toISOString(),
          points: achievement.points
        };
        state.activities.unshift(activity);
      }
    },
    
    // 更新成就进度
    updateAchievementProgress: (state, action) => {
      const { achievementId, progress } = action.payload;
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        achievement.progress = progress;
        
        // 检查是否达到解锁条件
        if (progress >= achievement.target) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date().toISOString();
        }
      }
    },
    
    // 添加书签
    addBookmark: (state, action) => {
      const bookmark = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString()
      };
      state.bookmarks.unshift(bookmark);
    },
    
    // 移除书签
    removeBookmark: (state, action) => {
      const bookmarkId = action.payload;
      state.bookmarks = state.bookmarks.filter(b => b.id !== bookmarkId);
    },
    
    // 添加收藏
    addFavorite: (state, action) => {
      const favorite = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString()
      };
      state.favorites.unshift(favorite);
    },
    
    // 移除收藏
    removeFavorite: (state, action) => {
      const favoriteId = action.payload;
      state.favorites = state.favorites.filter(f => f.id !== favoriteId);
    },
    
    // 添加搜索历史
    addSearchHistory: (state, action) => {
      const query = action.payload;
      // 移除重复项
      state.searchHistory = state.searchHistory.filter(q => q !== query);
      // 添加到开头
      state.searchHistory.unshift(query);
      // 限制数量
      if (state.searchHistory.length > 20) {
        state.searchHistory = state.searchHistory.slice(0, 20);
      }
    },
    
    // 清除搜索历史
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
    
    // 设置头像上传进度
    setAvatarUploadProgress: (state, action) => {
      state.avatarUploadProgress = action.payload;
    },
    
    // 设置头像上传状态
    setUploadingAvatar: (state, action) => {
      state.isUploadingAvatar = action.payload;
      if (!action.payload) {
        state.avatarUploadProgress = 0;
      }
    },
    
    // 更新安全设置
    updateSecuritySettings: (state, action) => {
      state.security = { ...state.security, ...action.payload };
    },
    
    // 添加登录会话
    addLoginSession: (state, action) => {
      const session = {
        id: Date.now(),
        ...action.payload,
        lastActive: new Date().toISOString()
      };
      state.security.loginSessions.push(session);
    },
    
    // 移除登录会话
    removeLoginSession: (state, action) => {
      const sessionId = action.payload;
      state.security.loginSessions = state.security.loginSessions.filter(
        s => s.id !== sessionId
      );
    },
    
    // 更新订阅信息
    updateSubscription: (state, action) => {
      state.subscription = { ...state.subscription, ...action.payload };
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 获取用户资料
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoadingProfile = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.currentUser = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.error = action.payload;
      });
    
    // 更新用户资料
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdatingProfile = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.currentUser = { ...state.currentUser, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.error = action.payload;
      });
    
    // 关注用户
    builder
      .addCase(followUser.pending, (state) => {
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { targetUserId } = action.payload;
        if (!state.following.includes(targetUserId)) {
          state.following.push(targetUserId);
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// 导出actions
export const {
  setCurrentUser,
  clearCurrentUser,
  updatePreferences,
  updateNotificationSettings,
  updatePrivacySettings,
  updateLearningSettings,
  addFollowing,
  removeFollowing,
  addFollower,
  removeFollower,
  blockUser,
  unblockUser,
  addActivity,
  updateStats,
  unlockAchievement,
  updateAchievementProgress,
  addBookmark,
  removeBookmark,
  addFavorite,
  removeFavorite,
  addSearchHistory,
  clearSearchHistory,
  setAvatarUploadProgress,
  setUploadingAvatar,
  updateSecuritySettings,
  addLoginSession,
  removeLoginSession,
  updateSubscription,
  clearError,
} = userSlice.actions;

// 选择器
export const selectUser = (state) => state.user;
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectUserPreferences = (state) => state.user.preferences;
export const selectNotificationSettings = (state) => state.user.preferences.notifications;
export const selectPrivacySettings = (state) => state.user.preferences.privacy;
export const selectLearningSettings = (state) => state.user.preferences.learning;
export const selectFollowing = (state) => state.user.following;
export const selectFollowers = (state) => state.user.followers;
export const selectBlockedUsers = (state) => state.user.blockedUsers;
export const selectUserActivities = (state) => state.user.activities;
export const selectUserStats = (state) => state.user.stats;
export const selectUserAchievements = (state) => state.user.achievements;
export const selectBookmarks = (state) => state.user.bookmarks;
export const selectFavorites = (state) => state.user.favorites;
export const selectSearchHistory = (state) => state.user.searchHistory;
export const selectSecuritySettings = (state) => state.user.security;
export const selectSubscription = (state) => state.user.subscription;
export const selectIsLoadingProfile = (state) => state.user.isLoadingProfile;
export const selectIsUpdatingProfile = (state) => state.user.isUpdatingProfile;
export const selectIsUploadingAvatar = (state) => state.user.isUploadingAvatar;
export const selectAvatarUploadProgress = (state) => state.user.avatarUploadProgress;
export const selectUserError = (state) => state.user.error;

// 计算选择器
export const selectUnlockedAchievements = (state) => {
  return state.user.achievements.filter(achievement => achievement.unlocked);
};

export const selectPendingAchievements = (state) => {
  return state.user.achievements.filter(achievement => !achievement.unlocked);
};

export const selectTotalPoints = (state) => {
  return state.user.achievements
    .filter(achievement => achievement.unlocked)
    .reduce((total, achievement) => total + achievement.points, 0);
};

export const selectIsFollowing = (state, targetUserId) => {
  return state.user.following.includes(targetUserId);
};

export const selectIsBlocked = (state, targetUserId) => {
  return state.user.blockedUsers.includes(targetUserId);
};

// 导出reducer
export default userSlice.reducer;

