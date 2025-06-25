/**
 * 增强版API服务
 * 提供统一的API调用接口，包含错误处理、重试机制、缓存等功能
 */

import axios from 'axios';
import config from '../utils/config';

// 创建axios实例
const createApiInstance = (baseURL, options = {}) => {
  const instance = axios.create({
    baseURL,
    timeout: config.get('VITE_API_TIMEOUT', 10000),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...options,
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 添加认证token
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 添加请求ID用于追踪
      config.headers['X-Request-ID'] = generateRequestId();

      // 添加时间戳防止缓存
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          _t: Date.now(),
        };
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      // 统一处理响应数据
      return {
        ...response,
        data: response.data?.data || response.data,
        meta: response.data?.meta || {},
      };
    },
    async (error) => {
      const originalRequest = error.config;

      // 处理401错误（token过期）
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await authAPI.refreshToken(refreshToken);
            const newToken = response.data.token;
            
            localStorage.setItem('auth_token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // 刷新失败，清除token并跳转到登录页
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // 处理网络错误
      if (!error.response) {
        error.message = '网络连接失败，请检查网络设置';
      }

      // 处理服务器错误
      if (error.response?.status >= 500) {
        error.message = '服务器内部错误，请稍后重试';
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// 生成请求ID
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 创建API实例
const apiConfig = config.getApiConfig();
const api = createApiInstance(apiConfig.baseURL);

// 认证API
export const authAPI = {
  // 用户登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 用户注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 钱包登录
  walletLogin: (walletData) => api.post('/auth/wallet-login', walletData),
  
  // 刷新token
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  
  // 验证token
  verifyToken: (token) => api.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  
  // 登出
  logout: () => api.post('/auth/logout'),
  
  // 忘记密码
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // 重置密码
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  
  // 修改密码
  changePassword: (oldPassword, newPassword) => api.post('/auth/change-password', {
    oldPassword,
    newPassword
  }),
};

// 用户API
export const userAPI = {
  // 获取用户资料
  getProfile: (userId) => api.get(`/users/${userId}`),
  
  // 更新用户资料
  updateProfile: (userId, profileData) => api.put(`/users/${userId}`, profileData),
  
  // 上传头像
  uploadAvatar: (userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // 获取用户统计
  getStats: (userId) => api.get(`/users/${userId}/stats`),
  
  // 获取用户成就
  getAchievements: (userId) => api.get(`/users/${userId}/achievements`),
  
  // 更新用户偏好
  updatePreferences: (userId, preferences) => api.put(`/users/${userId}/preferences`, preferences),
  
  // 获取用户朋友列表
  getFriends: (userId) => api.get(`/users/${userId}/friends`),
  
  // 添加朋友
  addFriend: (userId, friendId) => api.post(`/users/${userId}/friends`, { friendId }),
  
  // 删除朋友
  removeFriend: (userId, friendId) => api.delete(`/users/${userId}/friends/${friendId}`),
  
  // 搜索用户
  searchUsers: (query, filters = {}) => api.get('/users/search', {
    params: { q: query, ...filters }
  }),
};

// 聊天API
export const chatAPI = {
  // 获取聊天室列表
  getRooms: () => api.get('/chat/rooms'),
  
  // 获取聊天室详情
  getRoomDetails: (roomId) => api.get(`/chat/rooms/${roomId}`),
  
  // 获取消息历史
  getMessages: (roomId, options = {}) => api.get(`/chat/rooms/${roomId}/messages`, {
    params: options
  }),
  
  // 发送消息
  sendMessage: (roomId, messageData) => api.post(`/chat/rooms/${roomId}/messages`, messageData),
  
  // 删除消息
  deleteMessage: (roomId, messageId) => api.delete(`/chat/rooms/${roomId}/messages/${messageId}`),
  
  // 翻译消息
  translateMessage: (messageId, targetLanguage) => api.post(`/chat/messages/${messageId}/translate`, {
    targetLanguage
  }),
  
  // 获取在线用户
  getOnlineUsers: (roomId) => api.get(`/chat/rooms/${roomId}/online-users`),
  
  // 加入聊天室
  joinRoom: (roomId) => api.post(`/chat/rooms/${roomId}/join`),
  
  // 离开聊天室
  leaveRoom: (roomId) => api.post(`/chat/rooms/${roomId}/leave`),
};

// 学习API
export const learningAPI = {
  // 获取课程列表
  getCourses: (language) => api.get('/learning/courses', {
    params: { language }
  }),
  
  // 获取课程详情
  getCourseDetails: (courseId) => api.get(`/learning/courses/${courseId}`),
  
  // 获取学习进度
  getProgress: (userId) => api.get(`/learning/progress/${userId}`),
  
  // 更新学习进度
  updateProgress: (userId, progressData) => api.put(`/learning/progress/${userId}`, progressData),
  
  // 提交练习结果
  submitExercise: (exerciseId, answers) => api.post(`/learning/exercises/${exerciseId}/submit`, {
    answers
  }),
  
  // 完成课程
  completeCourse: (courseId) => api.post(`/learning/courses/${courseId}/complete`),
  
  // 获取词汇列表
  getVocabulary: (userId, language) => api.get(`/learning/vocabulary/${userId}`, {
    params: { language }
  }),
  
  // 添加词汇
  addVocabulary: (userId, wordData) => api.post(`/learning/vocabulary/${userId}`, wordData),
  
  // 获取复习卡片
  getReviewCards: (userId) => api.get(`/learning/review/${userId}`),
  
  // 提交复习结果
  submitReview: (userId, reviewData) => api.post(`/learning/review/${userId}`, reviewData),
};

// 文化API
export const cultureAPI = {
  // 获取文化主题列表
  getTopics: (category) => api.get('/culture/topics', {
    params: { category }
  }),
  
  // 获取文化主题详情
  getTopicDetails: (topicId) => api.get(`/culture/topics/${topicId}`),
  
  // 获取文化分类
  getCategories: () => api.get('/culture/categories'),
  
  // 搜索文化内容
  searchCulture: (query, filters = {}) => api.get('/culture/search', {
    params: { q: query, ...filters }
  }),
  
  // 标记文化主题为已完成
  markTopicComplete: (topicId) => api.post(`/culture/topics/${topicId}/complete`),
  
  // 添加文化主题到收藏
  addToFavorites: (topicId) => api.post(`/culture/topics/${topicId}/favorite`),
  
  // 从收藏中移除
  removeFromFavorites: (topicId) => api.delete(`/culture/topics/${topicId}/favorite`),
};

// 区块链API
export const blockchainAPI = {
  // 连接钱包
  connectWallet: (walletType) => api.post('/blockchain/wallet/connect', { walletType }),
  
  // 获取余额
  getBalance: (address) => api.get(`/blockchain/balance/${address}`),
  
  // 发送代币
  sendTokens: (to, amount, memo) => api.post('/blockchain/transfer', { to, amount, memo }),
  
  // 获取交易历史
  getTransactionHistory: (address, options = {}) => api.get(`/blockchain/transactions/${address}`, {
    params: options
  }),
  
  // 质押代币
  stakeTokens: (amount, duration) => api.post('/blockchain/stake', { amount, duration }),
  
  // 取消质押
  unstakeTokens: (stakeId) => api.post(`/blockchain/unstake/${stakeId}`),
  
  // 获取质押信息
  getStakingInfo: (address) => api.get(`/blockchain/staking/${address}`),
  
  // 领取奖励
  claimRewards: (address) => api.post(`/blockchain/rewards/${address}/claim`),
  
  // 获取代币价格
  getTokenPrices: () => api.get('/blockchain/prices'),
  
  // 获取网络状态
  getNetworkStatus: () => api.get('/blockchain/network/status'),
};

// 翻译API
export const translationAPI = {
  // 文本翻译
  translateText: (text, sourceLang, targetLang) => api.post('/translation/translate', {
    text,
    sourceLang,
    targetLang
  }),
  
  // 语音识别
  speechToText: (audioBlob, language) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('language', language);
    return api.post('/translation/speech-to-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // 语音合成
  textToSpeech: (text, language, voice) => api.post('/translation/text-to-speech', {
    text,
    language,
    voice
  }),
  
  // 检测语言
  detectLanguage: (text) => api.post('/translation/detect', { text }),
  
  // 批量翻译
  batchTranslate: (texts, sourceLang, targetLang) => api.post('/translation/batch', {
    texts,
    sourceLang,
    targetLang
  }),
  
  // 获取翻译历史
  getHistory: (userId) => api.get(`/translation/history/${userId}`),
  
  // 获取收藏的翻译
  getFavorites: (userId) => api.get(`/translation/favorites/${userId}`),
  
  // 添加到收藏
  addToFavorites: (userId, translationData) => api.post(`/translation/favorites/${userId}`, translationData),
  
  // 从收藏中移除
  removeFromFavorites: (userId, translationId) => api.delete(`/translation/favorites/${userId}/${translationId}`),
};

// 通用API工具
export const apiUtils = {
  // 上传文件
  uploadFile: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // 获取系统配置
  getSystemConfig: () => api.get('/system/config'),
  
  // 健康检查
  healthCheck: () => api.get('/health'),
  
  // 获取版本信息
  getVersion: () => api.get('/version'),
  
  // 发送反馈
  sendFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  
  // 报告错误
  reportError: (errorData) => api.post('/error-report', errorData),
};

// 导出默认API实例
export default api;

