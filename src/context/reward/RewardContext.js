import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 奖励系统状态
const initialState = {
  user: {
    learningPoints: 0,
    engagementPoints: 0,
    contributionPoints: 0,
    totalPoints: 0,
    level: 1,
    experience: 0,
    nextLevelExp: 100,
    achievements: [],
    streak: 0, // 连续签到天数
    lastCheckIn: null,
  },
  pointsHistory: [],
  achievements: [
    {
      id: 'first_lesson',
      title: '初学者',
      description: '完成第一节课程',
      icon: '🎓',
      points: 10,
      unlocked: false,
    },
    {
      id: 'week_streak',
      title: '坚持不懈',
      description: '连续签到7天',
      icon: '🔥',
      points: 50,
      unlocked: false,
    },
    {
      id: 'social_butterfly',
      title: '社交达人',
      description: '发布10篇内容',
      icon: '🦋',
      points: 30,
      unlocked: false,
    },
    {
      id: 'helper',
      title: '乐于助人',
      description: '帮助其他用户50次',
      icon: '🤝',
      points: 100,
      unlocked: false,
    },
    {
      id: 'master',
      title: '文化大师',
      description: '达到10级',
      icon: '👑',
      points: 500,
      unlocked: false,
    },
  ],
  rewardShop: [
    {
      id: 'avatar_frame_1',
      name: '金色头像框',
      description: '彰显您的尊贵身份',
      type: 'cosmetic',
      cost: 100,
      currency: 'learningPoints',
      image: '/images/rewards/golden_frame.png',
      available: true,
    },
    {
      id: 'theme_dark',
      name: '深色主题',
      description: '护眼的深色界面主题',
      type: 'theme',
      cost: 50,
      currency: 'engagementPoints',
      image: '/images/rewards/dark_theme.png',
      available: true,
    },
    {
      id: 'premium_course',
      name: '高级课程体验券',
      description: '免费体验任意高级课程7天',
      type: 'service',
      cost: 200,
      currency: 'totalPoints',
      image: '/images/rewards/premium_course.png',
      available: true,
    },
    {
      id: 'gift_card_10',
      name: '10元礼品卡',
      description: '可在合作商家使用的礼品卡',
      type: 'gift',
      cost: 1000,
      currency: 'totalPoints',
      image: '/images/rewards/gift_card.png',
      available: true,
    },
  ],
  loading: false,
  error: null,
};

// 动作类型
const REWARD_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_POINTS: 'ADD_POINTS',
  SPEND_POINTS: 'SPEND_POINTS',
  UPDATE_USER: 'UPDATE_USER',
  UNLOCK_ACHIEVEMENT: 'UNLOCK_ACHIEVEMENT',
  CHECK_IN: 'CHECK_IN',
  PURCHASE_REWARD: 'PURCHASE_REWARD',
  LOAD_USER_DATA: 'LOAD_USER_DATA',
};

// 奖励系统 Reducer
function rewardReducer(state, action) {
  switch (action.type) {
    case REWARD_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case REWARD_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case REWARD_ACTIONS.ADD_POINTS:
      const { type: pointType, amount, reason } = action.payload;
      const newUser = { ...state.user };
      
      // 添加对应类型的积分
      newUser[pointType] += amount;
      newUser.totalPoints += amount;
      newUser.experience += amount;
      
      // 检查是否升级
      while (newUser.experience >= newUser.nextLevelExp) {
        newUser.experience -= newUser.nextLevelExp;
        newUser.level += 1;
        newUser.nextLevelExp = Math.floor(newUser.nextLevelExp * 1.5);
      }
      
      // 添加积分历史记录
      const historyEntry = {
        id: Date.now(),
        type: pointType,
        amount,
        reason,
        timestamp: new Date().toISOString(),
      };
      
      return {
        ...state,
        user: newUser,
        pointsHistory: [historyEntry, ...state.pointsHistory.slice(0, 49)], // 保留最近50条记录
      };
    
    case REWARD_ACTIONS.SPEND_POINTS:
      const { pointType: spendType, amount: spendAmount } = action.payload;
      const updatedUser = { ...state.user };
      
      if (updatedUser[spendType] >= spendAmount) {
        updatedUser[spendType] -= spendAmount;
        updatedUser.totalPoints -= spendAmount;
        return { ...state, user: updatedUser };
      }
      return state;
    
    case REWARD_ACTIONS.UNLOCK_ACHIEVEMENT:
      const achievementId = action.payload;
      const achievement = state.achievements.find(a => a.id === achievementId);
      
      if (achievement && !achievement.unlocked) {
        const updatedAchievements = state.achievements.map(a =>
          a.id === achievementId ? { ...a, unlocked: true } : a
        );
        
        const updatedUserWithAchievement = {
          ...state.user,
          achievements: [...state.user.achievements, achievementId],
          totalPoints: state.user.totalPoints + achievement.points,
        };
        
        return {
          ...state,
          user: updatedUserWithAchievement,
          achievements: updatedAchievements,
        };
      }
      return state;
    
    case REWARD_ACTIONS.CHECK_IN:
      const today = new Date().toDateString();
      const lastCheckIn = state.user.lastCheckIn;
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      let newStreak = 1;
      if (lastCheckIn === yesterday) {
        newStreak = state.user.streak + 1;
      } else if (lastCheckIn === today) {
        return state; // 今天已经签到过了
      }
      
      const checkInUser = {
        ...state.user,
        streak: newStreak,
        lastCheckIn: today,
        learningPoints: state.user.learningPoints + 5,
        totalPoints: state.user.totalPoints + 5,
      };
      
      return { ...state, user: checkInUser };
    
    case REWARD_ACTIONS.PURCHASE_REWARD:
      const { rewardId, cost, currency } = action.payload;
      const purchaseUser = { ...state.user };
      
      if (purchaseUser[currency] >= cost) {
        purchaseUser[currency] -= cost;
        purchaseUser.totalPoints -= cost;
        
        // 这里可以添加购买记录逻辑
        return { ...state, user: purchaseUser };
      }
      return state;
    
    case REWARD_ACTIONS.LOAD_USER_DATA:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        loading: false,
      };
    
    default:
      return state;
  }
}

// 创建 Context
const RewardContext = createContext();

// Provider 组件
export function RewardProvider({ children }) {
  const [state, dispatch] = useReducer(rewardReducer, initialState);
  
  // 从本地存储加载用户数据
  useEffect(() => {
    const savedUserData = localStorage.getItem('culturebridge_user_rewards');
    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        dispatch({ type: REWARD_ACTIONS.LOAD_USER_DATA, payload: userData });
      } catch (error) {
        console.error('Failed to load user reward data:', error);
      }
    }
  }, []);
  
  // 保存用户数据到本地存储
  useEffect(() => {
    localStorage.setItem('culturebridge_user_rewards', JSON.stringify(state.user));
  }, [state.user]);
  
  // 添加积分
  const addPoints = (type, amount, reason) => {
    dispatch({
      type: REWARD_ACTIONS.ADD_POINTS,
      payload: { type, amount, reason },
    });
    
    // 检查成就解锁
    checkAchievements(type, amount);
  };
  
  // 消费积分
  const spendPoints = (type, amount) => {
    dispatch({
      type: REWARD_ACTIONS.SPEND_POINTS,
      payload: { pointType: type, amount },
    });
  };
  
  // 签到
  const checkIn = () => {
    dispatch({ type: REWARD_ACTIONS.CHECK_IN });
    
    // 检查连续签到成就
    if (state.user.streak + 1 >= 7) {
      unlockAchievement('week_streak');
    }
  };
  
  // 解锁成就
  const unlockAchievement = (achievementId) => {
    dispatch({ type: REWARD_ACTIONS.UNLOCK_ACHIEVEMENT, payload: achievementId });
  };
  
  // 购买奖励
  const purchaseReward = (rewardId) => {
    const reward = state.rewardShop.find(r => r.id === rewardId);
    if (reward) {
      dispatch({
        type: REWARD_ACTIONS.PURCHASE_REWARD,
        payload: {
          rewardId,
          cost: reward.cost,
          currency: reward.currency,
        },
      });
      return true;
    }
    return false;
  };
  
  // 检查成就
  const checkAchievements = (pointType, amount) => {
    // 这里可以添加更复杂的成就检查逻辑
    if (pointType === 'learningPoints' && amount >= 10) {
      unlockAchievement('first_lesson');
    }
    
    if (state.user.level >= 10) {
      unlockAchievement('master');
    }
  };
  
  // 获取可用积分
  const getAvailablePoints = (currency) => {
    return state.user[currency] || 0;
  };
  
  // 检查是否可以购买
  const canPurchase = (rewardId) => {
    const reward = state.rewardShop.find(r => r.id === rewardId);
    if (!reward) return false;
    
    return getAvailablePoints(reward.currency) >= reward.cost;
  };
  
  const value = {
    ...state,
    addPoints,
    spendPoints,
    checkIn,
    unlockAchievement,
    purchaseReward,
    getAvailablePoints,
    canPurchase,
  };
  
  return (
    <RewardContext.Provider value={value}>
      {children}
    </RewardContext.Provider>
  );
}

// Hook 使用 Context
export function useReward() {
  const context = useContext(RewardContext);
  if (!context) {
    throw new Error('useReward must be used within a RewardProvider');
  }
  return context;
}

export default RewardContext;

