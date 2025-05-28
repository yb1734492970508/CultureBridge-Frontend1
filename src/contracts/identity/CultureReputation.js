// CultureReputation.js - 声誉计算与评分智能合约接口

import { ethers } from 'ethers';
import { getProvider, getSigner } from '../utils/web3Provider';

// 声誉合约ABI
const REPUTATION_ABI = [
  // 初始化声誉
  "function initReputation(uint256 _identityId) external",
  // 更新声誉分数
  "function updateReputation(uint256 _identityId, bytes32 _eventType, int256 _scoreChange, bytes32 _evidence) external",
  // 批量更新声誉
  "function batchUpdateReputation(uint256[] calldata _identityIds, bytes32[] calldata _eventTypes, int256[] calldata _scoreChanges, bytes32[] calldata _evidences) external",
  // 获取声誉信息
  "function getReputation(uint256 _identityId) external view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
  // 获取声誉事件
  "function getReputationEvent(uint256 _identityId, bytes32 _eventId) external view returns (bytes32, int256, uint256, bytes32)",
  // 计算时间衰减后的声誉
  "function getDecayedReputation(uint256 _identityId) external view returns (uint256)",
  // 检查声誉阈值
  "function checkReputationThreshold(uint256 _identityId, uint256 _threshold) external view returns (bool)",
  // 事件
  "event ReputationInitialized(uint256 indexed identityId)",
  "event ReputationUpdated(uint256 indexed identityId, bytes32 indexed eventType, int256 scoreChange)",
  "event ReputationDecayed(uint256 indexed identityId, uint256 oldScore, uint256 newScore)"
];

// 声誉合约地址 - 根据部署环境配置
const REPUTATION_CONTRACT_ADDRESS = {
  mainnet: "0x...", // 以太坊主网
  polygon: "0x...", // Polygon主网
  bnb: "0x...",     // BNB Chain主网
  sepolia: "0x..."  // Sepolia测试网
};

/**
 * 获取声誉合约实例
 * @param {boolean} useSigner - 是否使用签名者（写入操作需要）
 * @param {string} network - 网络名称
 * @returns {ethers.Contract} 合约实例
 */
export const getReputationContract = async (useSigner = false, network = 'sepolia') => {
  try {
    const contractAddress = REPUTATION_CONTRACT_ADDRESS[network];
    if (!contractAddress) {
      throw new Error(`未配置网络 ${network} 的合约地址`);
    }

    if (useSigner) {
      const signer = await getSigner();
      return new ethers.Contract(contractAddress, REPUTATION_ABI, signer);
    } else {
      const provider = await getProvider();
      return new ethers.Contract(contractAddress, REPUTATION_ABI, provider);
    }
  } catch (error) {
    console.error('获取声誉合约实例失败:', error);
    throw error;
  }
};

/**
 * 初始化声誉
 * @param {number} identityId - 身份ID
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 交易结果
 */
export const initReputation = async (identityId, network = 'sepolia') => {
  try {
    const contract = await getReputationContract(true, network);
    
    const tx = await contract.initReputation(identityId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('初始化声誉失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 更新声誉分数
 * @param {number} identityId - 身份ID
 * @param {string} eventType - 事件类型
 * @param {number} scoreChange - 分数变化
 * @param {string} evidence - 证据IPFS哈希
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 交易结果
 */
export const updateReputation = async (identityId, eventType, scoreChange, evidence = '', network = 'sepolia') => {
  try {
    const contract = await getReputationContract(true, network);
    const eventTypeBytes = ethers.utils.formatBytes32String(eventType);
    const evidenceBytes = ethers.utils.formatBytes32String(evidence);
    
    const tx = await contract.updateReputation(identityId, eventTypeBytes, scoreChange, evidenceBytes);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('更新声誉分数失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 批量更新声誉
 * @param {number[]} identityIds - 身份ID数组
 * @param {string[]} eventTypes - 事件类型数组
 * @param {number[]} scoreChanges - 分数变化数组
 * @param {string[]} evidences - 证据IPFS哈希数组
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 交易结果
 */
export const batchUpdateReputation = async (identityIds, eventTypes, scoreChanges, evidences = [], network = 'sepolia') => {
  try {
    const contract = await getReputationContract(true, network);
    
    // 转换为bytes32
    const eventTypesBytes = eventTypes.map(type => ethers.utils.formatBytes32String(type));
    const evidencesBytes = evidences.map(evidence => 
      evidence ? ethers.utils.formatBytes32String(evidence) : ethers.utils.formatBytes32String('')
    );
    
    const tx = await contract.batchUpdateReputation(identityIds, eventTypesBytes, scoreChanges, evidencesBytes);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('批量更新声誉失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取声誉信息
 * @param {number} identityId - 身份ID
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 声誉信息
 */
export const getReputation = async (identityId, network = 'sepolia') => {
  try {
    const contract = await getReputationContract(false, network);
    const result = await contract.getReputation(identityId);
    
    return {
      success: true,
      reputation: {
        totalScore: result[0].toNumber(),
        creationScore: result[1].toNumber(),
        participationScore: result[2].toNumber(),
        tradingScore: result[3].toNumber(),
        contributionScore: result[4].toNumber(),
        lastUpdated: new Date(result[5].toNumber() * 1000)
      }
    };
  } catch (error) {
    console.error('获取声誉信息失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取声誉事件
 * @param {number} identityId - 身份ID
 * @param {string} eventId - 事件ID
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 声誉事件信息
 */
export const getReputationEvent = async (identityId, eventId, network = 'sepolia') => {
  try {
    const contract = await getReputationContract(false, network);
    const eventIdBytes = ethers.utils.formatBytes32String(eventId);
    const result = await contract.getReputationEvent(identityId, eventIdBytes);
    
    return {
      success: true,
      event: {
        eventType: ethers.utils.parseBytes32String(result[0]),
        scoreChange: result[1].toNumber(),
        timestamp: new Date(result[2].toNumber() * 1000),
        evidence: ethers.utils.parseBytes32String(result[3])
      }
    };
  } catch (error) {
    console.error('获取声誉事件失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取时间衰减后的声誉
 * @param {number} identityId - 身份ID
 * @param {string} network - 网络名称
 * @returns {Promise<number>} 衰减后的声誉分数
 */
export const getDecayedReputation = async (identityId, network = 'sepolia') => {
  try {
    const contract = await getReputationContract(false, network);
    const result = await contract.getDecayedReputation(identityId);
    return result.toNumber();
  } catch (error) {
    console.error('获取衰减声誉失败:', error);
    return 0;
  }
};

/**
 * 检查声誉是否达到阈值
 * @param {number} identityId - 身份ID
 * @param {number} threshold - 阈值
 * @param {string} network - 网络名称
 * @returns {Promise<boolean>} 是否达到阈值
 */
export const checkReputationThreshold = async (identityId, threshold, network = 'sepolia') => {
  try {
    const contract = await getReputationContract(false, network);
    return await contract.checkReputationThreshold(identityId, threshold);
  } catch (error) {
    console.error('检查声誉阈值失败:', error);
    return false;
  }
};

/**
 * 监听声誉更新事件
 * @param {Function} callback - 回调函数
 * @param {string} network - 网络名称
 * @returns {ethers.Contract} 合约实例，用于取消监听
 */
export const listenToReputationUpdated = async (callback, network = 'sepolia') => {
  try {
    const contract = await getReputationContract(false, network);
    
    contract.on('ReputationUpdated', (identityId, eventType, scoreChange, event) => {
      callback({
        identityId: identityId.toNumber(),
        eventType: ethers.utils.parseBytes32String(eventType),
        scoreChange: scoreChange.toNumber(),
        transactionHash: event.transactionHash
      });
    });
    
    return contract;
  } catch (error) {
    console.error('监听声誉更新事件失败:', error);
    throw error;
  }
};

/**
 * 取消事件监听
 * @param {ethers.Contract} contract - 合约实例
 * @param {string} eventName - 事件名称
 */
export const removeListener = (contract, eventName) => {
  if (contract && contract.removeAllListeners) {
    contract.removeAllListeners(eventName);
  }
};

/**
 * 计算声誉分数（前端计算，用于预览）
 * @param {Object} params - 计算参数
 * @param {number} params.creationScore - 创作得分
 * @param {number} params.participationScore - 参与得分
 * @param {number} params.tradingScore - 交易得分
 * @param {number} params.contributionScore - 贡献得分
 * @param {Object} weights - 权重参数
 * @returns {number} 总声誉分
 */
export const calculateReputationScore = (params, weights = { creation: 0.4, participation: 0.2, trading: 0.2, contribution: 0.2 }) => {
  const { creationScore, participationScore, tradingScore, contributionScore } = params;
  
  return Math.round(
    creationScore * weights.creation +
    participationScore * weights.participation +
    tradingScore * weights.trading +
    contributionScore * weights.contribution
  );
};

/**
 * 计算时间衰减（前端计算，用于预览）
 * @param {number} score - 原始分数
 * @param {Date} timestamp - 时间戳
 * @param {number} decayRate - 衰减率，默认0.1/年
 * @returns {number} 衰减后的分数
 */
export const calculateTimeDecay = (score, timestamp, decayRate = 0.1) => {
  const now = new Date();
  const timeDiffInYears = (now - timestamp) / (1000 * 60 * 60 * 24 * 365);
  
  return Math.round(score * Math.exp(-decayRate * timeDiffInYears));
};

export default {
  getReputationContract,
  initReputation,
  updateReputation,
  batchUpdateReputation,
  getReputation,
  getReputationEvent,
  getDecayedReputation,
  checkReputationThreshold,
  listenToReputationUpdated,
  removeListener,
  calculateReputationScore,
  calculateTimeDecay
};
