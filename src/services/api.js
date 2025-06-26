/**
 * CultureBridge API 服务
 * 处理与后端的所有HTTP通信
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // 设置认证token
  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // 获取认证headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
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

  // 健康检查
  async healthCheck() {
    return this.get('/health');
  }

  // 认证相关API
  async register(userData) {
    const response = await this.post('/api/auth/register', userData);
    if (response.success && response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.post('/api/auth/login', credentials);
    if (response.success && response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  logout() {
    this.setAuthToken(null);
  }

  // 用户相关API
  async getUser(userId) {
    return this.get(`/api/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.put(`/api/users/${userId}`, userData);
  }

  // 积分系统API
  async getUserPoints(userId) {
    return this.get(`/api/points/${userId}`);
  }

  async addPoints(userId, points, reason) {
    return this.post(`/api/points/${userId}/add`, { points, reason });
  }

  // 文化探索API
  async getCultures(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/cultures?${queryString}` : '/api/cultures';
    return this.get(endpoint);
  }

  async getCulture(cultureId) {
    return this.get(`/api/cultures/${cultureId}`);
  }

  // 语言学习API
  async getUserLanguages(userId) {
    return this.get(`/api/languages/${userId}`);
  }

  // 聊天室API
  async getChatRooms() {
    return this.get('/api/chat/rooms');
  }

  async getChatMessages(roomId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/chat/rooms/${roomId}/messages?${queryString}` : `/api/chat/rooms/${roomId}/messages`;
    return this.get(endpoint);
  }

  async sendMessage(roomId, message) {
    return this.post(`/api/chat/rooms/${roomId}/messages`, { message });
  }

  // 翻译API
  async translateText(text, sourceLanguage, targetLanguage) {
    return this.post('/api/translate/text', {
      text,
      sourceLanguage,
      targetLanguage,
    });
  }

  async translateMobileContent(audioContent, sourceLanguage, targetLanguage) {
    return this.post('/api/translate/mobile-content', {
      audioContent,
      sourceLanguage,
      targetLanguage,
    });
  }

  async translateExternalAudio(audioData, sourceLanguage, targetLanguage) {
    return this.post('/api/translate/external-audio', {
      audioData,
      sourceLanguage,
      targetLanguage,
    });
  }

  // 语音通话API
  async matchCall(language, country) {
    return this.post('/api/call/match', { language, country });
  }
}

// 创建单例实例
const apiService = new ApiService();

export default apiService;

