// API配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API请求工具类
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // 设置认证令牌
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // 获取请求头
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  // GET请求
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST请求
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT请求
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE请求
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // 文件上传
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  }

  // 认证相关API
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // 用户相关API
  async getProfile(userId) {
    return this.get(`/profiles/${userId}`);
  }

  async updateProfile(profileData) {
    return this.put('/profiles/me', profileData);
  }

  // 聊天相关API
  async getMessages(chatId, page = 1, limit = 50) {
    return this.get(`/messages/${chatId}?page=${page}&limit=${limit}`);
  }

  async sendMessage(messageData) {
    return this.post('/messages', messageData);
  }

  async getChatRooms() {
    return this.get('/chat/rooms');
  }

  async joinChatRoom(roomId) {
    return this.post(`/chat/rooms/${roomId}/join`);
  }

  // 翻译相关API
  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    return this.post('/translation/text', {
      text,
      targetLanguage,
      sourceLanguage,
    });
  }

  async translateVoice(audioBlob, targetLanguage) {
    return this.uploadFile('/voice/translate', audioBlob, {
      targetLanguage,
    });
  }

  // 语言学习相关API
  async getLearningCourses() {
    return this.get('/language-learning/courses');
  }

  async getCourseProgress(courseId) {
    return this.get(`/language-learning/courses/${courseId}/progress`);
  }

  async submitLessonProgress(lessonId, progressData) {
    return this.post(`/language-learning/lessons/${lessonId}/progress`, progressData);
  }

  // 社区相关API
  async getCommunities() {
    return this.get('/communities');
  }

  async joinCommunity(communityId) {
    return this.post(`/communities/${communityId}/join`);
  }

  async getCommunityPosts(communityId, page = 1, limit = 20) {
    return this.get(`/communities/${communityId}/posts?page=${page}&limit=${limit}`);
  }

  async createPost(postData) {
    return this.post('/posts', postData);
  }

  async likePost(postId) {
    return this.post(`/posts/${postId}/like`);
  }

  async commentOnPost(postId, commentData) {
    return this.post(`/posts/${postId}/comments`, commentData);
  }

  // 文化交流相关API
  async getCulturalEvents() {
    return this.get('/cultural-exchange/events');
  }

  async joinEvent(eventId) {
    return this.post(`/cultural-exchange/events/${eventId}/join`);
  }

  async getCulturalTopics() {
    return this.get('/cultural-exchange/topics');
  }

  // 奖励系统API
  async getUserRewards() {
    return this.get('/rewards/user');
  }

  async claimReward(rewardId) {
    return this.post(`/rewards/${rewardId}/claim`);
  }

  async getLeaderboard() {
    return this.get('/rewards/leaderboard');
  }

  // 健康检查
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.json();
    } catch (error) {
      console.error('健康检查失败:', error);
      throw error;
    }
  }
}

// 创建全局API服务实例
const apiService = new ApiService();

export default apiService;

