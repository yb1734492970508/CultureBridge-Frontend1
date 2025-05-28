import axios from 'axios';
import { API_BASE_URL } from '../config';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器，添加认证token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * 获取用户代币余额
 * @returns {Promise} - 返回用户代币余额信息
 */
export const getBalance = async () => {
  try {
    const response = await api.get('/token/balance');
    return response.data;
  } catch (error) {
    console.error('获取代币余额失败:', error);
    throw error;
  }
};

/**
 * 转移代币
 * @param {Object} transferData - 转账数据
 * @param {string} transferData.to - 接收方地址
 * @param {string} transferData.amount - 转账金额
 * @param {string} transferData.reason - 转账原因
 * @returns {Promise} - 返回转账结果
 */
export const transferTokens = async (transferData) => {
  try {
    const response = await api.post('/token/transfer', transferData);
    return response.data;
  } catch (error) {
    console.error('转移代币失败:', error);
    throw error;
  }
};

/**
 * 质押代币
 * @param {Object} stakeData - 质押数据
 * @param {string} stakeData.amount - 质押金额
 * @param {number} stakeData.lockPeriodIndex - 锁定期索引
 * @returns {Promise} - 返回质押结果
 */
export const stakeTokens = async (stakeData) => {
  try {
    const response = await api.post('/token/stake', stakeData);
    return response.data;
  } catch (error) {
    console.error('质押代币失败:', error);
    throw error;
  }
};

/**
 * 获取质押信息
 * @returns {Promise} - 返回质押信息
 */
export const getStakeInfo = async () => {
  try {
    const response = await api.get('/token/stake');
    return response.data;
  } catch (error) {
    console.error('获取质押信息失败:', error);
    throw error;
  }
};

/**
 * 领取奖励
 * @returns {Promise} - 返回领取结果
 */
export const claimRewards = async () => {
  try {
    const response = await api.post('/token/rewards/claim');
    return response.data;
  } catch (error) {
    console.error('领取奖励失败:', error);
    throw error;
  }
};

/**
 * 获取交易历史
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.type - 交易类型筛选
 * @returns {Promise} - 返回交易历史数据
 */
export const getTransactionHistory = async (params = {}) => {
  try {
    const response = await api.get('/token/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('获取交易历史失败:', error);
    throw error;
  }
};

/**
 * 获取代币统计信息
 * @returns {Promise} - 返回代币统计数据
 */
export const getTokenStats = async () => {
  try {
    const response = await api.get('/token/stats');
    return response.data;
  } catch (error) {
    console.error('获取代币统计信息失败:', error);
    throw error;
  }
};

export default {
  getBalance,
  transferTokens,
  stakeTokens,
  getStakeInfo,
  claimRewards,
  getTransactionHistory,
  getTokenStats
};
