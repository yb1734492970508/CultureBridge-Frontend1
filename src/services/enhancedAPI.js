import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求日志
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data,
        headers: config.headers,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 添加响应日志
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    
    // 处理认证错误
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // 处理网络错误
    if (!error.response) {
      console.error('Network Error: 无法连接到服务器');
    }
    
    return Promise.reject(error);
  }
);

/**
 * 增强版认证API服务
 */
export const authAPI = {
  // 用户注册
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // 用户登录
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // 钱包登录
  walletLogin: async (walletData) => {
    const response = await api.post('/auth/wallet-login', walletData);
    return response.data;
  },

  // 获取当前用户信息
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // 更新用户详情
  updateDetails: async (userData) => {
    const response = await api.put('/auth/update-details', userData);
    return response.data;
  },

  // 更新密码
  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/update-password', passwordData);
    return response.data;
  },

  // 创建钱包
  createWallet: async () => {
    const response = await api.post('/auth/create-wallet');
    return response.data;
  },

  // 绑定钱包
  bindWallet: async (walletData) => {
    const response = await api.post('/auth/bind-wallet', walletData);
    return response.data;
  },

  // 获取用户权限
  getPermissions: async () => {
    const response = await api.get('/auth/permissions');
    return response.data;
  },

  // 获取用户活动统计
  getActivityStats: async () => {
    const response = await api.get('/auth/activity-stats');
    return response.data;
  },

  // 用户登出
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // 刷新令牌
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },

  // 验证令牌
  verifyToken: async () => {
    const response = await api.get('/auth/verify-token');
    return response.data;
  },
};

/**
 * 区块链API服务
 */
export const blockchainAPI = {
  // 获取网络状态
  getNetworkStatus: async () => {
    const response = await api.get('/blockchain/network');
    return response.data;
  },

  // 获取用户余额
  getBalance: async () => {
    const response = await api.get('/blockchain/balance');
    return response.data;
  },

  // 获取交易历史
  getTransactions: async (params = {}) => {
    const response = await api.get('/blockchain/transactions', { params });
    return response.data;
  },

  // 转账CBT代币
  transfer: async (transferData) => {
    const response = await api.post('/blockchain/transfer', transferData);
    return response.data;
  },

  // 获取代币信息
  getTokenInfo: async () => {
    const response = await api.get('/blockchain/token-info');
    return response.data;
  },

  // 获取合约地址
  getContracts: async () => {
    const response = await api.get('/blockchain/contracts');
    return response.data;
  },

  // 验证钱包签名
  verifySignature: async (signatureData) => {
    const response = await api.post('/blockchain/verify-signature', signatureData);
    return response.data;
  },

  // 生成钱包
  generateWallet: async () => {
    const response = await api.post('/blockchain/generate-wallet');
    return response.data;
  },

  // 导入钱包
  importWallet: async (walletData) => {
    const response = await api.post('/blockchain/import-wallet', walletData);
    return response.data;
  },

  // 获取区块链统计
  getStats: async () => {
    const response = await api.get('/blockchain/stats');
    return response.data;
  },

  // 健康检查
  healthCheck: async () => {
    const response = await api.get('/blockchain/health');
    return response.data;
  },
};

/**
 * 语音翻译API服务
 */
export const voiceAPI = {
  // 获取支持的语言
  getSupportedLanguages: async () => {
    const response = await api.get('/voice/languages');
    return response.data;
  },

  // 语音翻译
  translateVoice: async (formData) => {
    const response = await api.post('/voice/translate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 语音识别
  transcribeAudio: async (formData) => {
    const response = await api.post('/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 文字转语音
  synthesizeSpeech: async (textData) => {
    const response = await api.post('/voice/synthesize', textData);
    return response.data;
  },

  // 文本翻译
  translateText: async (textData) => {
    const response = await api.post('/voice/translate-text', textData);
    return response.data;
  },

  // 获取翻译历史
  getTranslationHistory: async (params = {}) => {
    const response = await api.get('/voice/history', { params });
    return response.data;
  },

  // 获取翻译详情
  getTranslationDetail: async (id) => {
    const response = await api.get(`/voice/translation/${id}`);
    return response.data;
  },

  // 删除翻译记录
  deleteTranslation: async (id) => {
    const response = await api.delete(`/voice/translation/${id}`);
    return response.data;
  },

  // 获取用户语音统计
  getVoiceStats: async () => {
    const response = await api.get('/voice/stats');
    return response.data;
  },

  // 获取配置信息
  getConfig: async () => {
    const response = await api.get('/voice/config');
    return response.data;
  },

  // 健康检查
  healthCheck: async () => {
    const response = await api.get('/voice/health');
    return response.data;
  },
};

/**
 * 聊天API服务
 */
export const chatAPI = {
  // 获取聊天室列表
  getChatRooms: async (params = {}) => {
    const response = await api.get('/chat/rooms', { params });
    return response.data;
  },

  // 创建聊天室
  createChatRoom: async (roomData) => {
    const response = await api.post('/chat/rooms', roomData);
    return response.data;
  },

  // 加入聊天室
  joinChatRoom: async (roomId) => {
    const response = await api.post(`/chat/rooms/${roomId}/join`);
    return response.data;
  },

  // 离开聊天室
  leaveChatRoom: async (roomId) => {
    const response = await api.post(`/chat/rooms/${roomId}/leave`);
    return response.data;
  },

  // 获取聊天消息
  getMessages: async (roomId, params = {}) => {
    const response = await api.get(`/chat/rooms/${roomId}/messages`, { params });
    return response.data;
  },

  // 发送消息
  sendMessage: async (roomId, messageData) => {
    const response = await api.post(`/chat/rooms/${roomId}/messages`, messageData);
    return response.data;
  },

  // 上传语音消息
  uploadVoiceMessage: async (roomId, formData) => {
    const response = await api.post(`/chat/rooms/${roomId}/voice`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 获取在线用户
  getOnlineUsers: async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/users`);
    return response.data;
  },
};

/**
 * 文件上传API服务
 */
export const fileAPI = {
  // 上传文件
  uploadFile: async (formData, onProgress) => {
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  // 删除文件
  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },
};

/**
 * 通用API工具函数
 */
export const apiUtils = {
  // 处理API错误
  handleError: (error) => {
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response;
      return {
        success: false,
        error: data.error || data.message || '服务器错误',
        status,
      };
    } else if (error.request) {
      // 网络错误
      return {
        success: false,
        error: '网络连接失败，请检查网络设置',
        status: 0,
      };
    } else {
      // 其他错误
      return {
        success: false,
        error: error.message || '未知错误',
        status: -1,
      };
    }
  },

  // 格式化API响应
  formatResponse: (response) => {
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.message,
      };
    }
  },

  // 检查API连接
  checkConnection: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },
};

export default api;

