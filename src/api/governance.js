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
 * 获取提案列表
 * @param {Object} params - 查询参数
 * @param {string} params.status - 提案状态筛选
 * @param {string} params.proposalType - 提案类型筛选
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @returns {Promise} - 返回提案列表数据
 */
export const getProposals = async (params = {}) => {
  try {
    const response = await api.get('/governance/proposals', { params });
    return response.data;
  } catch (error) {
    console.error('获取提案列表失败:', error);
    throw error;
  }
};

/**
 * 获取提案详情
 * @param {string} proposalId - 提案ID
 * @returns {Promise} - 返回提案详情数据
 */
export const getProposalById = async (proposalId) => {
  try {
    const response = await api.get(`/governance/proposals/${proposalId}`);
    return response.data;
  } catch (error) {
    console.error('获取提案详情失败:', error);
    throw error;
  }
};

/**
 * 创建提案
 * @param {Object} proposalData - 提案数据
 * @param {string} proposalData.title - 提案标题
 * @param {string} proposalData.description - 提案描述
 * @param {string} proposalData.proposalType - 提案类型
 * @param {Array} proposalData.targets - 目标合约地址数组
 * @param {Array} proposalData.values - 交易金额数组
 * @param {Array} proposalData.calldatas - 调用数据数组
 * @returns {Promise} - 返回创建结果
 */
export const createProposal = async (proposalData) => {
  try {
    const response = await api.post('/governance/proposals', proposalData);
    return response.data;
  } catch (error) {
    console.error('创建提案失败:', error);
    throw error;
  }
};

/**
 * 投票
 * @param {Object} voteData - 投票数据
 * @param {string} voteData.proposalId - 提案ID
 * @param {string} voteData.support - 投票选项 (FOR, AGAINST, ABSTAIN)
 * @returns {Promise} - 返回投票结果
 */
export const castVote = async (voteData) => {
  try {
    const response = await api.post('/governance/vote', voteData);
    return response.data;
  } catch (error) {
    console.error('投票失败:', error);
    throw error;
  }
};

/**
 * 执行提案
 * @param {string} proposalId - 提案ID
 * @returns {Promise} - 返回执行结果
 */
export const executeProposal = async (proposalId) => {
  try {
    const response = await api.post(`/governance/proposals/${proposalId}/execute`);
    return response.data;
  } catch (error) {
    console.error('执行提案失败:', error);
    throw error;
  }
};

/**
 * 获取用户提案
 * @returns {Promise} - 返回用户提案列表
 */
export const getUserProposals = async () => {
  try {
    const response = await api.get('/governance/user/proposals');
    return response.data;
  } catch (error) {
    console.error('获取用户提案失败:', error);
    throw error;
  }
};

/**
 * 获取治理统计信息
 * @returns {Promise} - 返回治理统计数据
 */
export const getGovernanceStats = async () => {
  try {
    const response = await api.get('/governance/stats');
    return response.data;
  } catch (error) {
    console.error('获取治理统计信息失败:', error);
    throw error;
  }
};

export default {
  getProposals,
  getProposalById,
  createProposal,
  castVote,
  executeProposal,
  getUserProposals,
  getGovernanceStats
};
