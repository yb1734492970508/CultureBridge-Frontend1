// API服务层 - 统一管理所有后端API调用
import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储并跳转到登录页
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // 统一错误格式
    const errorMessage = error.response?.data?.message || error.message || '网络错误';
    return Promise.reject(new Error(errorMessage));
  }
);

// 认证相关API
export const authAPI = {
  // 用户注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 用户登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 获取用户信息
  getProfile: () => api.get('/auth/profile'),
  
  // 更新用户信息
  updateProfile: (userData) => api.put('/auth/profile', userData),
  
  // 刷新token
  refreshToken: () => api.post('/auth/refresh'),
  
  // 用户登出
  logout: () => api.post('/auth/logout'),
  
  // 钱包登录
  walletLogin: (walletData) => api.post('/auth/wallet-login', walletData),
};

// 聊天相关API
export const chatAPI = {
  // 获取聊天室列表
  getRooms: (params) => api.get('/chat/rooms', { params }),
  
  // 创建聊天室
  createRoom: (roomData) => api.post('/chat/rooms', roomData),
  
  // 加入聊天室
  joinRoom: (roomId) => api.post(`/chat/rooms/${roomId}/join`),
  
  // 离开聊天室
  leaveRoom: (roomId) => api.post(`/chat/rooms/${roomId}/leave`),
  
  // 获取聊天历史
  getMessages: (roomId, params) => api.get(`/chat/rooms/${roomId}/messages`, { params }),
  
  // 发送消息
  sendMessage: (roomId, messageData) => api.post(`/chat/rooms/${roomId}/messages`, messageData),
  
  // 删除消息
  deleteMessage: (roomId, messageId) => api.delete(`/chat/rooms/${roomId}/messages/${messageId}`),
  
  // 消息反应
  reactToMessage: (roomId, messageId, reaction) => 
    api.post(`/chat/rooms/${roomId}/messages/${messageId}/react`, { reaction }),
};

// 语音翻译相关API
export const voiceAPI = {
  // 上传语音文件进行翻译
  translateVoice: (formData) => api.post('/voice/translate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // 获取翻译历史
  getTranslationHistory: (params) => api.get('/voice/history', { params }),
  
  // 删除翻译记录
  deleteTranslation: (translationId) => api.delete(`/voice/history/${translationId}`),
  
  // 获取支持的语言列表
  getSupportedLanguages: () => api.get('/voice/languages'),
  
  // 文本转语音
  textToSpeech: (textData) => api.post('/voice/text-to-speech', textData),
};

// 代币相关API
export const tokenAPI = {
  // 获取用户代币余额
  getBalance: () => api.get('/tokens/balance'),
  
  // 获取交易历史
  getTransactions: (params) => api.get('/tokens/transactions', { params }),
  
  // 转账代币
  transfer: (transferData) => api.post('/tokens/transfer', transferData),
  
  // 获取奖励
  claimReward: (rewardType) => api.post('/tokens/rewards/claim', { type: rewardType }),
  
  // 获取奖励历史
  getRewardHistory: (params) => api.get('/tokens/rewards/history', { params }),
  
  // 每日签到
  dailyCheckIn: () => api.post('/tokens/rewards/daily-checkin'),
  
  // 获取代币统计
  getTokenStats: () => api.get('/tokens/stats'),
  
  // 质押代币
  stake: (stakeData) => api.post('/tokens/stake', stakeData),
  
  // 取消质押
  unstake: (unstakeData) => api.post('/tokens/unstake', unstakeData),
};

// 区块链相关API
export const blockchainAPI = {
  // 获取钱包信息
  getWalletInfo: () => api.get('/blockchain/wallet'),
  
  // 连接钱包
  connectWallet: (walletData) => api.post('/blockchain/wallet/connect', walletData),
  
  // 断开钱包连接
  disconnectWallet: () => api.post('/blockchain/wallet/disconnect'),
  
  // 获取交易状态
  getTransactionStatus: (txHash) => api.get(`/blockchain/transactions/${txHash}`),
  
  // 获取网络状态
  getNetworkStatus: () => api.get('/blockchain/network/status'),
  
  // 获取gas费用估算
  estimateGas: (transactionData) => api.post('/blockchain/gas/estimate', transactionData),
  
  // 获取代币合约信息
  getTokenContract: () => api.get('/blockchain/contracts/token'),
};

// 用户相关API
export const userAPI = {
  // 获取学习进度
  getLearningProgress: () => api.get('/users/learning-progress'),
  
  // 更新学习进度
  updateLearningProgress: (progressData) => api.put('/users/learning-progress', progressData),
  
  // 获取用户统计
  getUserStats: () => api.get('/users/stats'),
  
  // 获取用户设置
  getSettings: () => api.get('/users/settings'),
  
  // 更新用户设置
  updateSettings: (settingsData) => api.put('/users/settings', settingsData),
  
  // 上传头像
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// 文件上传API
export const fileAPI = {
  // 上传文件
  upload: (formData) => api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // 删除文件
  delete: (fileId) => api.delete(`/files/${fileId}`),
  
  // 获取文件信息
  getFileInfo: (fileId) => api.get(`/files/${fileId}`),
};

// 通知相关API
export const notificationAPI = {
  // 获取通知列表
  getNotifications: (params) => api.get('/notifications', { params }),
  
  // 标记通知为已读
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  
  // 标记所有通知为已读
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  // 删除通知
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  
  // 获取未读通知数量
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// 系统相关API
export const systemAPI = {
  // 获取系统状态
  getStatus: () => api.get('/system/status'),
  
  // 获取系统配置
  getConfig: () => api.get('/system/config'),
  
  // 健康检查
  healthCheck: () => api.get('/system/health'),
  
  // 获取版本信息
  getVersion: () => api.get('/system/version'),
};

// 导出默认API实例
export default api;

