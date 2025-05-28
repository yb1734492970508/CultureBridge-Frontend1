// CultureIdentity.js - 去中心化身份智能合约接口

import { ethers } from 'ethers';
import { getProvider, getSigner } from '../utils/web3Provider';

// 身份合约ABI
const IDENTITY_ABI = [
  // 创建身份
  "function createIdentity(bytes32 _didDocument) external returns (uint256 identityId)",
  // 更新身份
  "function updateIdentity(uint256 _identityId, bytes32 _didDocument) external",
  // 添加验证
  "function addVerification(uint256 _identityId, bytes32 _type, bytes32 _proof) external",
  // 验证身份
  "function verifyIdentity(uint256 _identityId, bytes32 _verificationType, bool _valid) external",
  // 获取身份信息
  "function getIdentity(uint256 _identityId) external view returns (address, bytes32, uint256, uint256, bool)",
  // 获取验证信息
  "function getVerification(uint256 _identityId, bytes32 _verificationType) external view returns (address, uint256, bytes32, bool)",
  // 检查身份所有权
  "function isIdentityOwner(address _address, uint256 _identityId) external view returns (bool)",
  // 激活/停用身份
  "function setIdentityStatus(uint256 _identityId, bool _active) external",
  // 根据地址获取身份ID
  "function getIdentityByAddress(address _address) external view returns (uint256)",
  // 事件
  "event IdentityCreated(uint256 indexed identityId, address indexed owner, bytes32 didDocument)",
  "event IdentityUpdated(uint256 indexed identityId, bytes32 didDocument)",
  "event VerificationAdded(uint256 indexed identityId, bytes32 indexed verificationType, address verifier)",
  "event IdentityVerified(uint256 indexed identityId, bytes32 indexed verificationType, bool valid)",
  "event IdentityStatusChanged(uint256 indexed identityId, bool active)"
];

// 身份合约地址 - 根据部署环境配置
const IDENTITY_CONTRACT_ADDRESS = {
  mainnet: "0x...", // 以太坊主网
  polygon: "0x...", // Polygon主网
  bnb: "0x...",     // BNB Chain主网
  sepolia: "0x..."  // Sepolia测试网
};

/**
 * 获取身份合约实例
 * @param {boolean} useSigner - 是否使用签名者（写入操作需要）
 * @param {string} network - 网络名称
 * @returns {ethers.Contract} 合约实例
 */
export const getIdentityContract = async (useSigner = false, network = 'sepolia') => {
  try {
    const contractAddress = IDENTITY_CONTRACT_ADDRESS[network];
    if (!contractAddress) {
      throw new Error(`未配置网络 ${network} 的合约地址`);
    }

    if (useSigner) {
      const signer = await getSigner();
      return new ethers.Contract(contractAddress, IDENTITY_ABI, signer);
    } else {
      const provider = await getProvider();
      return new ethers.Contract(contractAddress, IDENTITY_ABI, provider);
    }
  } catch (error) {
    console.error('获取身份合约实例失败:', error);
    throw error;
  }
};

/**
 * 创建新身份
 * @param {string} didDocument - 身份文档IPFS哈希
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 交易结果
 */
export const createIdentity = async (didDocument, network = 'sepolia') => {
  try {
    const contract = await getIdentityContract(true, network);
    const didBytes = ethers.utils.formatBytes32String(didDocument);
    
    const tx = await contract.createIdentity(didBytes);
    const receipt = await tx.wait();
    
    // 从事件中获取身份ID
    const event = receipt.events.find(e => e.event === 'IdentityCreated');
    const identityId = event.args.identityId.toNumber();
    
    return {
      success: true,
      identityId,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('创建身份失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 更新身份信息
 * @param {number} identityId - 身份ID
 * @param {string} didDocument - 更新后的身份文档IPFS哈希
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 交易结果
 */
export const updateIdentity = async (identityId, didDocument, network = 'sepolia') => {
  try {
    const contract = await getIdentityContract(true, network);
    const didBytes = ethers.utils.formatBytes32String(didDocument);
    
    const tx = await contract.updateIdentity(identityId, didBytes);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('更新身份失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 添加身份验证
 * @param {number} identityId - 身份ID
 * @param {string} verificationType - 验证类型
 * @param {string} proof - 验证证明IPFS哈希
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 交易结果
 */
export const addVerification = async (identityId, verificationType, proof, network = 'sepolia') => {
  try {
    const contract = await getIdentityContract(true, network);
    const typeBytes = ethers.utils.formatBytes32String(verificationType);
    const proofBytes = ethers.utils.formatBytes32String(proof);
    
    const tx = await contract.addVerification(identityId, typeBytes, proofBytes);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('添加验证失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 验证身份
 * @param {number} identityId - 身份ID
 * @param {string} verificationType - 验证类型
 * @param {boolean} valid - 验证结果
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 交易结果
 */
export const verifyIdentity = async (identityId, verificationType, valid, network = 'sepolia') => {
  try {
    const contract = await getIdentityContract(true, network);
    const typeBytes = ethers.utils.formatBytes32String(verificationType);
    
    const tx = await contract.verifyIdentity(identityId, typeBytes, valid);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('验证身份失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取身份信息
 * @param {number} identityId - 身份ID
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 身份信息
 */
export const getIdentity = async (identityId, network = 'sepolia') => {
  try {
    const contract = await getIdentityContract(false, network);
    const result = await contract.getIdentity(identityId);
    
    return {
      success: true,
      identity: {
        owner: result[0],
        didDocument: ethers.utils.parseBytes32String(result[1]),
        createdAt: new Date(result[2].toNumber() * 1000),
        updatedAt: new Date(result[3].toNumber() * 1000),
        active: result[4]
      }
    };
  } catch (error) {
    console.error('获取身份信息失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取验证信息
 * @param {number} identityId - 身份ID
 * @param {string} verificationType - 验证类型
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 验证信息
 */
export const getVerification = async (identityId, verificationType, network = 'sepolia') => {
  try {
    const contract = await getIdentityContract(false, network);
    const typeBytes = ethers.utils.formatBytes32String(verificationType);
    const result = await contract.getVerification(identityId, typeBytes);
    
    return {
      success: true,
      verification: {
        verifier: result[0],
        timestamp: new Date(result[1].toNumber() * 1000),
        proof: ethers.utils.parseBytes32String(result[2]),
        valid: result[3]
      }
    };
  } catch (error) {
    console.error('获取验证信息失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 检查身份所有权
 * @param {string} address - 钱包地址
 * @param {number} identityId - 身份ID
 * @param {string} network - 网络名称
 * @returns {Promise<boolean>} 是否是身份所有者
 */
export const isIdentityOwner = async (address, identityId, network = 'sepolia') => {
  try {
    const contract = await getIdentityContract(false, network);
    return await contract.isIdentityOwner(address, identityId);
  } catch (error) {
    console.error('检查身份所有权失败:', error);
    return false;
  }
};

/**
 * 设置身份状态
 * @param {number} identityId - 身份ID
 * @param {boolean} active - 是否激活
 * @param {string} network - 网络名称
 * @returns {Promise<Object>} 交易结果
 */
export const setIdentityStatus = async (identityId, active, network = 'sepolia') => {
  try {
    const contract = await getIdentityContract(true, network);
    
    const tx = await contract.setIdentityStatus(identityId, active);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('设置身份状态失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 根据地址获取身份ID
 * @param {string} address - 钱包地址
 * @param {string} network - 网络名称
 * @returns {Promise<number>} 身份ID
 */
export const getIdentityByAddress = async (address, network = 'sepolia') => {
  try {
    const contract = await getIdentityContract(false, network);
    const identityId = await contract.getIdentityByAddress(address);
    return identityId.toNumber();
  } catch (error) {
    console.error('根据地址获取身份ID失败:', error);
    return 0;
  }
};

/**
 * 监听身份创建事件
 * @param {Function} callback - 回调函数
 * @param {string} network - 网络名称
 * @returns {ethers.Contract} 合约实例，用于取消监听
 */
export const listenToIdentityCreated = async (callback, network = 'sepolia') => {
  try {
    const contract = await getIdentityContract(false, network);
    
    contract.on('IdentityCreated', (identityId, owner, didDocument, event) => {
      callback({
        identityId: identityId.toNumber(),
        owner,
        didDocument: ethers.utils.parseBytes32String(didDocument),
        transactionHash: event.transactionHash
      });
    });
    
    return contract;
  } catch (error) {
    console.error('监听身份创建事件失败:', error);
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

export default {
  getIdentityContract,
  createIdentity,
  updateIdentity,
  addVerification,
  verifyIdentity,
  getIdentity,
  getVerification,
  isIdentityOwner,
  setIdentityStatus,
  getIdentityByAddress,
  listenToIdentityCreated,
  removeListener
};
