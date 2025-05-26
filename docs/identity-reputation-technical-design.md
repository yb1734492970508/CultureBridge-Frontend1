# CultureBridge 去中心化身份与声誉系统技术方案设计

## 1. 概述

本文档详细描述CultureBridge平台去中心化身份与声誉系统的技术实现方案，包括智能合约接口设计、前端组件结构和数据流设计。该系统将为用户提供自主可控的数字身份，并基于用户在平台上的行为和贡献建立声誉机制，促进健康的社区生态和文化交流。

## 2. 智能合约接口设计

### 2.1 去中心化身份合约接口

```javascript
// CultureID.js - 去中心化身份智能合约接口

import { ethers } from 'ethers';

// 去中心化身份合约ABI
const CultureIDABI = [
  // 身份管理功能
  "function createIdentity(string memory name, string memory bio, string memory avatar) returns (uint256)",
  "function updateIdentity(uint256 identityId, string memory name, string memory bio, string memory avatar) returns (bool)",
  "function getIdentity(uint256 identityId) view returns (tuple(uint256 id, address owner, string name, string bio, string avatar, uint256 createdAt, uint256 updatedAt) memory)",
  "function getIdentityByAddress(address owner) view returns (tuple(uint256 id, address owner, string name, string bio, string avatar, uint256 createdAt, uint256 updatedAt) memory)",
  "function hasIdentity(address owner) view returns (bool)",
  
  // 身份验证功能
  "function verifyIdentity(uint256 identityId, string memory verificationType, string memory verificationData) returns (bool)",
  "function isVerified(uint256 identityId, string memory verificationType) view returns (bool)",
  "function getVerifications(uint256 identityId) view returns (tuple(string verificationType, bool verified, uint256 timestamp)[] memory)",
  
  // 身份关联功能
  "function linkExternalAccount(uint256 identityId, string memory platform, string memory accountId, string memory proof) returns (bool)",
  "function unlinkExternalAccount(uint256 identityId, string memory platform, string memory accountId) returns (bool)",
  "function getLinkedAccounts(uint256 identityId) view returns (tuple(string platform, string accountId, uint256 timestamp)[] memory)",
  
  // 事件
  "event IdentityCreated(uint256 indexed identityId, address indexed owner, uint256 timestamp)",
  "event IdentityUpdated(uint256 indexed identityId, uint256 timestamp)",
  "event IdentityVerified(uint256 indexed identityId, string verificationType, uint256 timestamp)",
  "event ExternalAccountLinked(uint256 indexed identityId, string platform, string accountId, uint256 timestamp)",
  "event ExternalAccountUnlinked(uint256 indexed identityId, string platform, string accountId, uint256 timestamp)"
];

// 测试网络合约地址
const CULTURE_ID_CONTRACT_ADDRESS = {
  1: "0x0000000000000000000000000000000000000000", // 以太坊主网（待部署）
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia测试网（待部署）
  80001: "0x0000000000000000000000000000000000000000" // Polygon Mumbai测试网（待部署）
};

/**
 * 获取去中心化身份合约实例
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 合约实例
 */
export const getCultureIDContract = (provider, chainId) => {
  const address = CULTURE_ID_CONTRACT_ADDRESS[chainId];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`当前网络(chainId: ${chainId})不支持CultureID合约`);
  }
  
  return new ethers.Contract(address, CultureIDABI, provider);
};

/**
 * 获取带签名的去中心化身份合约实例（用于写操作）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 带签名的合约实例
 */
export const getSignedCultureIDContract = async (provider, chainId) => {
  const signer = provider.getSigner();
  const contract = getCultureIDContract(provider, chainId);
  return contract.connect(signer);
};

/**
 * 创建身份
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} name - 用户名
 * @param {string} bio - 个人简介
 * @param {string} avatar - 头像IPFS哈希
 * @returns {Promise<Object>} 交易结果
 */
export const createIdentity = async (provider, chainId, name, bio, avatar) => {
  try {
    const contract = await getSignedCultureIDContract(provider, chainId);
    
    // 发送创建身份交易
    const tx = await contract.createIdentity(name, bio, avatar);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    // 从事件中获取身份ID
    const event = receipt.events.find(e => e.event === 'IdentityCreated');
    const identityId = event.args.identityId.toString();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      identityId
    };
  } catch (error) {
    console.error("创建身份失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 更新身份
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @param {string} name - 用户名
 * @param {string} bio - 个人简介
 * @param {string} avatar - 头像IPFS哈希
 * @returns {Promise<Object>} 交易结果
 */
export const updateIdentity = async (provider, chainId, identityId, name, bio, avatar) => {
  try {
    const contract = await getSignedCultureIDContract(provider, chainId);
    
    // 发送更新身份交易
    const tx = await contract.updateIdentity(identityId, name, bio, avatar);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("更新身份失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取身份信息
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @returns {Promise<Object>} 身份信息
 */
export const getIdentity = async (provider, chainId, identityId) => {
  try {
    const contract = getCultureIDContract(provider, chainId);
    const identity = await contract.getIdentity(identityId);
    
    return {
      id: identity.id.toString(),
      owner: identity.owner,
      name: identity.name,
      bio: identity.bio,
      avatar: identity.avatar,
      createdAt: new Date(identity.createdAt.toNumber() * 1000),
      updatedAt: new Date(identity.updatedAt.toNumber() * 1000)
    };
  } catch (error) {
    console.error("获取身份信息失败:", error);
    return null;
  }
};

/**
 * 根据地址获取身份信息
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} address - 用户地址
 * @returns {Promise<Object>} 身份信息
 */
export const getIdentityByAddress = async (provider, chainId, address) => {
  try {
    const contract = getCultureIDContract(provider, chainId);
    const identity = await contract.getIdentityByAddress(address);
    
    // 检查是否有效身份（id为0表示不存在）
    if (identity.id.toString() === '0') {
      return null;
    }
    
    return {
      id: identity.id.toString(),
      owner: identity.owner,
      name: identity.name,
      bio: identity.bio,
      avatar: identity.avatar,
      createdAt: new Date(identity.createdAt.toNumber() * 1000),
      updatedAt: new Date(identity.updatedAt.toNumber() * 1000)
    };
  } catch (error) {
    console.error("根据地址获取身份信息失败:", error);
    return null;
  }
};

/**
 * 检查用户是否已创建身份
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} address - 用户地址
 * @returns {Promise<boolean>} 是否已创建身份
 */
export const hasIdentity = async (provider, chainId, address) => {
  try {
    const contract = getCultureIDContract(provider, chainId);
    return await contract.hasIdentity(address);
  } catch (error) {
    console.error("检查身份失败:", error);
    return false;
  }
};

/**
 * 验证身份
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @param {string} verificationType - 验证类型
 * @param {string} verificationData - 验证数据
 * @returns {Promise<Object>} 交易结果
 */
export const verifyIdentity = async (provider, chainId, identityId, verificationType, verificationData) => {
  try {
    const contract = await getSignedCultureIDContract(provider, chainId);
    
    // 发送验证身份交易
    const tx = await contract.verifyIdentity(identityId, verificationType, verificationData);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("验证身份失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取身份验证信息
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @returns {Promise<Array>} 验证信息列表
 */
export const getVerifications = async (provider, chainId, identityId) => {
  try {
    const contract = getCultureIDContract(provider, chainId);
    const verifications = await contract.getVerifications(identityId);
    
    return verifications.map(v => ({
      verificationType: v.verificationType,
      verified: v.verified,
      timestamp: new Date(v.timestamp.toNumber() * 1000)
    }));
  } catch (error) {
    console.error("获取身份验证信息失败:", error);
    return [];
  }
};

/**
 * 关联外部账号
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @param {string} platform - 平台名称
 * @param {string} accountId - 账号ID
 * @param {string} proof - 关联证明
 * @returns {Promise<Object>} 交易结果
 */
export const linkExternalAccount = async (provider, chainId, identityId, platform, accountId, proof) => {
  try {
    const contract = await getSignedCultureIDContract(provider, chainId);
    
    // 发送关联外部账号交易
    const tx = await contract.linkExternalAccount(identityId, platform, accountId, proof);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("关联外部账号失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取关联的外部账号
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @returns {Promise<Array>} 关联账号列表
 */
export const getLinkedAccounts = async (provider, chainId, identityId) => {
  try {
    const contract = getCultureIDContract(provider, chainId);
    const accounts = await contract.getLinkedAccounts(identityId);
    
    return accounts.map(a => ({
      platform: a.platform,
      accountId: a.accountId,
      timestamp: new Date(a.timestamp.toNumber() * 1000)
    }));
  } catch (error) {
    console.error("获取关联外部账号失败:", error);
    return [];
  }
};

export default {
  getCultureIDContract,
  getSignedCultureIDContract,
  createIdentity,
  updateIdentity,
  getIdentity,
  getIdentityByAddress,
  hasIdentity,
  verifyIdentity,
  getVerifications,
  linkExternalAccount,
  getLinkedAccounts
};
```

### 2.2 声誉系统合约接口

```javascript
// CultureReputation.js - 声誉系统智能合约接口

import { ethers } from 'ethers';

// 声誉系统合约ABI
const CultureReputationABI = [
  // 声誉管理功能
  "function getReputation(uint256 identityId) view returns (uint256)",
  "function getReputationByAddress(address user) view returns (uint256)",
  "function getReputationByCategory(uint256 identityId, string memory category) view returns (uint256)",
  "function getReputationHistory(uint256 identityId) view returns (tuple(string category, int256 points, string reason, uint256 timestamp)[] memory)",
  
  // 声誉评分功能（仅限授权角色）
  "function awardReputationPoints(uint256 identityId, string memory category, int256 points, string memory reason) returns (bool)",
  "function batchAwardReputationPoints(uint256[] memory identityIds, string memory category, int256 points, string memory reason) returns (bool)",
  
  // 声誉等级功能
  "function getReputationLevel(uint256 identityId) view returns (uint256)",
  "function getReputationLevelName(uint256 level) view returns (string memory)",
  "function getLevelThresholds() view returns (uint256[] memory)",
  
  // 声誉徽章功能
  "function getBadges(uint256 identityId) view returns (tuple(string badgeType, string name, string description, string image, uint256 awardedAt)[] memory)",
  "function hasBadge(uint256 identityId, string memory badgeType) view returns (bool)",
  "function awardBadge(uint256 identityId, string memory badgeType) returns (bool)",
  
  // 事件
  "event ReputationChanged(uint256 indexed identityId, string category, int256 points, string reason, uint256 timestamp)",
  "event ReputationLevelUp(uint256 indexed identityId, uint256 newLevel, uint256 timestamp)",
  "event BadgeAwarded(uint256 indexed identityId, string badgeType, uint256 timestamp)"
];

// 测试网络合约地址
const CULTURE_REPUTATION_CONTRACT_ADDRESS = {
  1: "0x0000000000000000000000000000000000000000", // 以太坊主网（待部署）
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia测试网（待部署）
  80001: "0x0000000000000000000000000000000000000000" // Polygon Mumbai测试网（待部署）
};

/**
 * 获取声誉系统合约实例
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 合约实例
 */
export const getCultureReputationContract = (provider, chainId) => {
  const address = CULTURE_REPUTATION_CONTRACT_ADDRESS[chainId];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`当前网络(chainId: ${chainId})不支持CultureReputation合约`);
  }
  
  return new ethers.Contract(address, CultureReputationABI, provider);
};

/**
 * 获取带签名的声誉系统合约实例（用于写操作）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 带签名的合约实例
 */
export const getSignedCultureReputationContract = async (provider, chainId) => {
  const signer = provider.getSigner();
  const contract = getCultureReputationContract(provider, chainId);
  return contract.connect(signer);
};

/**
 * 获取用户总声誉值
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @returns {Promise<string>} 声誉值
 */
export const getReputation = async (provider, chainId, identityId) => {
  try {
    const contract = getCultureReputationContract(provider, chainId);
    const reputation = await contract.getReputation(identityId);
    return reputation.toString();
  } catch (error) {
    console.error("获取声誉值失败:", error);
    return "0";
  }
};

/**
 * 根据地址获取用户总声誉值
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} address - 用户地址
 * @returns {Promise<string>} 声誉值
 */
export const getReputationByAddress = async (provider, chainId, address) => {
  try {
    const contract = getCultureReputationContract(provider, chainId);
    const reputation = await contract.getReputationByAddress(address);
    return reputation.toString();
  } catch (error) {
    console.error("根据地址获取声誉值失败:", error);
    return "0";
  }
};

/**
 * 获取用户特定类别的声誉值
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @param {string} category - 声誉类别
 * @returns {Promise<string>} 声誉值
 */
export const getReputationByCategory = async (provider, chainId, identityId, category) => {
  try {
    const contract = getCultureReputationContract(provider, chainId);
    const reputation = await contract.getReputationByCategory(identityId, category);
    return reputation.toString();
  } catch (error) {
    console.error("获取特定类别声誉值失败:", error);
    return "0";
  }
};

/**
 * 获取用户声誉历史
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @returns {Promise<Array>} 声誉历史记录
 */
export const getReputationHistory = async (provider, chainId, identityId) => {
  try {
    const contract = getCultureReputationContract(provider, chainId);
    const history = await contract.getReputationHistory(identityId);
    
    return history.map(h => ({
      category: h.category,
      points: h.points.toString(),
      reason: h.reason,
      timestamp: new Date(h.timestamp.toNumber() * 1000)
    }));
  } catch (error) {
    console.error("获取声誉历史失败:", error);
    return [];
  }
};

/**
 * 授予声誉点数（仅限授权角色）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @param {string} category - 声誉类别
 * @param {number} points - 点数（可为负数）
 * @param {string} reason - 原因
 * @returns {Promise<Object>} 交易结果
 */
export const awardReputationPoints = async (provider, chainId, identityId, category, points, reason) => {
  try {
    const contract = await getSignedCultureReputationContract(provider, chainId);
    
    // 发送授予声誉点数交易
    const tx = await contract.awardReputationPoints(identityId, category, points, reason);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("授予声誉点数失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取用户声誉等级
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @returns {Promise<Object>} 声誉等级信息
 */
export const getReputationLevel = async (provider, chainId, identityId) => {
  try {
    const contract = getCultureReputationContract(provider, chainId);
    const level = await contract.getReputationLevel(identityId);
    const levelName = await contract.getReputationLevelName(level);
    
    return {
      level: level.toString(),
      name: levelName
    };
  } catch (error) {
    console.error("获取声誉等级失败:", error);
    return {
      level: "0",
      name: "新手"
    };
  }
};

/**
 * 获取用户徽章
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @returns {Promise<Array>} 徽章列表
 */
export const getBadges = async (provider, chainId, identityId) => {
  try {
    const contract = getCultureReputationContract(provider, chainId);
    const badges = await contract.getBadges(identityId);
    
    return badges.map(b => ({
      badgeType: b.badgeType,
      name: b.name,
      description: b.description,
      image: b.image,
      awardedAt: new Date(b.awardedAt.toNumber() * 1000)
    }));
  } catch (error) {
    console.error("获取徽章失败:", error);
    return [];
  }
};

/**
 * 检查用户是否拥有特定徽章
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} identityId - 身份ID
 * @param {string} badgeType - 徽章类型
 * @returns {Promise<boolean>} 是否拥有徽章
 */
export const hasBadge = async (provider, chainId, identityId, badgeType) => {
  try {
    const contract = getCultureReputationContract(provider, chainId);
    return await contract.hasBadge(identityId, badgeType);
  } catch (error) {
    console.error("检查徽章失败:", error);
    return false;
  }
};

export default {
  getCultureReputationContract,
  getSignedCultureReputationContract,
  getReputation,
  getReputationByAddress,
  getReputationByCategory,
  getReputationHistory,
  awardReputationPoints,
  getReputationLevel,
  getBadges,
  hasBadge
};
```

### 2.3 与其他合约的集成

去中心化身份与声誉系统将与NFT市场合约和DAO治理合约集成，实现身份验证、声誉查询和权限控制等功能。

```javascript
// 在NFT市场合约中使用身份验证
export const listNFTWithIdentity = async (provider, chainId, nftContract, tokenId, price) => {
  try {
    // 1. 检查用户是否有身份
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const hasId = await hasIdentity(provider, chainId, address);
    
    if (!hasId) {
      return {
        success: false,
        error: "您需要先创建身份才能上架NFT"
      };
    }
    
    // 2. 获取用户声誉等级
    const identity = await getIdentityByAddress(provider, chainId, address);
    const reputationLevel = await getReputationLevel(provider, chainId, identity.id);
    
    // 3. 检查声誉等级是否满足要求
    if (parseInt(reputationLevel.level) < 1) {
      return {
        success: false,
        error: "您的声誉等级不足，需要达到1级才能上架NFT"
      };
    }
    
    // 4. 调用市场合约的上架方法
    const marketContract = await getSignedCultureMarketContract(provider, chainId);
    
    // 将ETH转换为Wei
    const priceInWei = ethers.utils.parseEther(price);
    
    // 发送上架交易
    const tx = await marketContract.listNFT(nftContract, tokenId, priceInWei);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    // 5. 授予声誉点数
    await awardReputationPoints(provider, chainId, identity.id, "market", 5, "上架NFT到市场");
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("上架NFT失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

## 3. 前端组件设计

### 3.1 组件结构

去中心化身份与声誉系统将包含以下主要组件：

```
src/
  ├── components/
  │   ├── identity/
  │   │   ├── IdentityProfile.js        # 身份档案组件
  │   │   ├── IdentityCreator.js        # 身份创建组件
  │   │   ├── IdentityEditor.js         # 身份编辑组件
  │   │   ├── IdentityVerifier.js       # 身份验证组件
  │   │   ├── ExternalAccountLinker.js  # 外部账号关联组件
  │   │   ├── ReputationDisplay.js      # 声誉展示组件
  │   │   ├── ReputationHistory.js      # 声誉历史组件
  │   │   ├── BadgeGallery.js           # 徽章展示组件
  │   │   └── UserCard.js               # 用户卡片组件
  ├── contracts/
  │   ├── identity/
  │   │   ├── CultureID.js              # 去中心化身份合约接口
  │   │   └── CultureReputation.js      # 声誉系统合约接口
  ├── context/
  │   ├── identity/
  │   │   └── IdentityContext.js        # 身份上下文
  ├── styles/
  │   └── identity.css                  # 身份相关样式
```

### 3.2 主要组件详细设计

#### 3.2.1 IdentityProfile.js

身份档案组件，展示用户的身份信息、声誉和徽章。

```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { useIdentity } from '../../context/identity';
import { getIdentity, getIdentityByAddress, getVerifications, getLinkedAccounts } from '../../contracts/identity/CultureID';
import { getReputation, getReputationLevel, getReputationHistory, getBadges } from '../../contracts/identity/CultureReputation';
import ReputationDisplay from './ReputationDisplay';
import ReputationHistory from './ReputationHistory';
import BadgeGallery from './BadgeGallery';

const IdentityProfile = ({ address }) => {
  const { identityId } = useParams();
  const navigate = useNavigate();
  const { active, library, chainId, account } = useBlockchain();
  const { refreshIdentity } = useIdentity();
  
  const [identity, setIdentity] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [reputation, setReputation] = useState('0');
  const [reputationLevel, setReputationLevel] = useState({ level: '0', name: '新手' });
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  
  // 加载身份信息
  useEffect(() => {
    const loadIdentityData = async () => {
      if (!active || !library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        let identityData;
        
        // 根据参数决定如何获取身份信息
        if (identityId) {
          identityData = await getIdentity(library, chainId, identityId);
        } else if (address) {
          identityData = await getIdentityByAddress(library, chainId, address);
        } else if (account) {
          identityData = await getIdentityByAddress(library, chainId, account);
        }
        
        if (!identityData) {
          setError('未找到身份信息');
          setLoading(false);
          return;
        }
        
        setIdentity(identityData);
        
        // 检查是否是身份所有者
        setIsOwner(account && identityData.owner.toLowerCase() === account.toLowerCase());
        
        // 获取身份验证信息
        const verificationData = await getVerifications(library, chainId, identityData.id);
        setVerifications(verificationData);
        
        // 获取关联的外部账号
        const accountsData = await getLinkedAccounts(library, chainId, identityData.id);
        setLinkedAccounts(accountsData);
        
        // 获取声誉信息
        const reputationData = await getReputation(library, chainId, identityData.id);
        setReputation(reputationData);
        
        // 获取声誉等级
        const levelData = await getReputationLevel(library, chainId, identityData.id);
        setReputationLevel(levelData);
        
        // 获取徽章
        const badgesData = await getBadges(library, chainId, identityData.id);
        setBadges(badgesData);
      } catch (error) {
        console.error('加载身份信息失败:', error);
        setError('加载身份信息时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadIdentityData();
  }, [active, library, chainId, account, identityId, address]);
  
  if (loading) {
    return (
      <div className="identity-profile loading">
        <p>加载身份信息中...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="identity-profile error">
        <h2>加载失败</h2>
        <p>{error}</p>
        {!identityId && !address && account && (
          <div className="create-identity-prompt">
            <p>您还没有创建身份</p>
            <button 
              onClick={() => navigate('/identity/create')} 
              className="create-identity-btn"
            >
              创建身份
            </button>
          </div>
        )}
      </div>
    );
  }
  
  if (!identity) {
    return (
      <div className="identity-profile not-found">
        <h2>身份不存在</h2>
        {!identityId && !address && account && (
          <div className="create-identity-prompt">
            <p>您还没有创建身份</p>
            <button 
              onClick={() => navigate('/identity/create')} 
              className="create-identity-btn"
            >
              创建身份
            </button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="identity-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={identity.avatar.startsWith('ipfs://') 
              ? `https://ipfs.io/ipfs/${identity.avatar.replace('ipfs://', '')}` 
              : identity.avatar || '/default-avatar.png'} 
            alt={identity.name} 
          />
        </div>
        
        <div className="profile-info">
          <h2>{identity.name}</h2>
          <p className="profile-address">{identity.owner}</p>
          <div className="profile-level">
            <span className="level-badge">Lv.{reputationLevel.level}</span>
            <span className="level-name">{reputationLevel.name}</span>
          </div>
          
          {isOwner && (
            <div className="profile-actions">
              <button 
                onClick={() => navigate(`/identity/edit/${identity.id}`)} 
                className="edit-profile-btn"
              >
                编辑资料
              </button>
              <button 
                onClick={() => navigate(`/identity/verify/${identity.id}`)} 
                className="verify-profile-btn"
              >
                验证身份
              </button>
              <button 
                onClick={() => navigate(`/identity/link/${identity.id}`)} 
                className="link-account-btn"
              >
                关联账号
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="profile-bio">
        <h3>个人简介</h3>
        <p>{identity.bio || '这个用户很懒，还没有填写个人简介'}</p>
      </div>
      
      <div className="profile-sections">
        <div className="profile-section">
          <h3>声誉</h3>
          <ReputationDisplay 
            reputation={reputation} 
            level={reputationLevel} 
          />
        </div>
        
        <div className="profile-section">
          <h3>徽章</h3>
          <BadgeGallery badges={badges} />
        </div>
        
        <div className="profile-section">
          <h3>身份验证</h3>
          {verifications.length === 0 ? (
            <p className="no-data">暂无身份验证</p>
          ) : (
            <div className="verifications-list">
              {verifications.map((verification, index) => (
                <div key={index} className="verification-item">
                  <span className="verification-type">{verification.verificationType}</span>
                  <span className={`verification-status ${verification.verified ? 'verified' : 'unverified'}`}>
                    {verification.verified ? '已验证' : '未验证'}
                  </span>
                  <span className="verification-date">
                    {verification.timestamp.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="profile-section">
          <h3>关联账号</h3>
          {linkedAccounts.length === 0 ? (
            <p className="no-data">暂无关联账号</p>
          ) : (
            <div className="linked-accounts-list">
              {linkedAccounts.map((account, index) => (
                <div key={index} className="linked-account-item">
                  <span className="account-platform">{account.platform}</span>
                  <span className="account-id">{account.accountId}</span>
                  <span className="account-link-date">
                    {account.timestamp.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="profile-section">
          <h3>声誉历史</h3>
          <ReputationHistory identityId={identity.id} />
        </div>
      </div>
    </div>
  );
};

export default IdentityProfile;
```

#### 3.2.2 IdentityCreator.js

身份创建组件，允许用户创建自己的去中心化身份。

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { useIdentity } from '../../context/identity';
import { createIdentity, hasIdentity } from '../../contracts/identity/CultureID';
import { NFTStorage } from 'nft.storage';

// NFT.Storage客户端
const NFT_STORAGE_TOKEN = 'YOUR_NFT_STORAGE_TOKEN';
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

const IdentityCreator = () => {
  const navigate = useNavigate();
  const { active, library, chainId, account } = useBlockchain();
  const { refreshIdentity } = useIdentity();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasExistingIdentity, setHasExistingIdentity] = useState(false);
  
  // 检查用户是否已有身份
  useEffect(() => {
    const checkIdentity = async () => {
      if (!active || !account || !library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const hasId = await hasIdentity(library, chainId, account);
        setHasExistingIdentity(hasId);
        
        if (hasId) {
          setError('您已经创建了身份，不能创建多个身份');
        }
      } catch (error) {
        console.error('检查身份失败:', error);
        setError('检查身份时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    checkIdentity();
  }, [active, account, library, chainId]);
  
  // 处理头像上传
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }
    
    // 检查文件大小（最大2MB）
    if (file.size > 2 * 1024 * 1024) {
      setError('图片大小不能超过2MB');
      return;
    }
    
    setAvatar(file);
    
    // 创建预览URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setError('');
  };
  
  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (hasExistingIdentity) {
      setError('您已经创建了身份，不能创建多个身份');
      return;
    }
    
    if (!name.trim()) {
      setError('请输入用户名');
      return;
    }
    
    try {
      setCreating(true);
      setError('');
      setSuccess('');
      
      // 上传头像到IPFS
      let avatarCid = '';
      if (avatar) {
        const metadata = await client.store({
          name: `${name}'s avatar`,
          description: 'CultureBridge user avatar',
          image: avatar
        });
        
        avatarCid = `ipfs://${metadata.ipnft}`;
      }
      
      // 创建身份
      const result = await createIdentity(
        library,
        chainId,
        name,
        bio,
        avatarCid || 'ipfs://default-avatar'
      );
      
      if (result.success) {
        setSuccess(`身份创建成功！身份ID: ${result.identityId}`);
        
        // 刷新身份上下文
        refreshIdentity();
        
        // 延迟后跳转到身份页面
        setTimeout(() => {
          navigate(`/identity/profile/${result.identityId}`);
        }, 3000);
      } else {
        setError(`创建身份失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setCreating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="identity-creator loading">
        <p>加载中...</p>
      </div>
    );
  }
  
  return (
    <div className="identity-creator">
      <h2>创建身份</h2>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以创建身份</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}
      
      {active && !hasExistingIdentity && (
        <form onSubmit={handleSubmit} className="identity-form">
          <div className="form-group">
            <label htmlFor="name">用户名 *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={creating}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">个人简介</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={creating}
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="avatar">头像</label>
            <div className="avatar-upload">
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={creating}
              />
              {avatarPreview && (
                <div className="avatar-preview">
                  <img src={avatarPreview} alt="Avatar preview" />
                </div>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="create-button"
          >
            {creating ? '创建中...' : '创建身份'}
          </button>
        </form>
      )}
    </div>
  );
};

export default IdentityCreator;
```

#### 3.2.3 ReputationDisplay.js

声誉展示组件，展示用户的声誉值和等级。

```jsx
import React from 'react';

const ReputationDisplay = ({ reputation, level }) => {
  // 计算声誉进度
  const calculateProgress = () => {
    // 假设等级阈值为：0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500
    const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
    const currentLevel = parseInt(level.level);
    
    if (currentLevel >= thresholds.length - 1) {
      return 100; // 最高等级
    }
    
    const currentThreshold = thresholds[currentLevel];
    const nextThreshold = thresholds[currentLevel + 1];
    const reputationValue = parseInt(reputation);
    
    const progress = ((reputationValue - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };
  
  return (
    <div className="reputation-display">
      <div className="reputation-header">
        <div className="reputation-score">
          <span className="score-value">{reputation}</span>
          <span className="score-label">声誉值</span>
        </div>
        
        <div className="reputation-level">
          <span className="level-badge">Lv.{level.level}</span>
          <span className="level-name">{level.name}</span>
        </div>
      </div>
      
      <div className="reputation-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <div className="progress-text">
          距离下一级: {calculateProgress().toFixed(1)}%
        </div>
      </div>
      
      <div className="reputation-benefits">
        <h4>当前等级特权</h4>
        <ul>
          {level.level >= 1 && (
            <li>可以上架NFT到市场</li>
          )}
          {level.level >= 2 && (
            <li>可以参与社区投票</li>
          )}
          {level.level >= 3 && (
            <li>可以创建拍卖</li>
          )}
          {level.level >= 5 && (
            <li>可以提交社区提案</li>
          )}
          {level.level >= 7 && (
            <li>可以成为内容审核员</li>
          )}
          {level.level >= 10 && (
            <li>可以参与平台治理</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ReputationDisplay;
```

#### 3.2.4 BadgeGallery.js

徽章展示组件，展示用户获得的徽章。

```jsx
import React from 'react';

const BadgeGallery = ({ badges }) => {
  if (!badges || badges.length === 0) {
    return (
      <div className="badge-gallery empty">
        <p className="no-badges">暂无徽章</p>
        <p className="badge-tip">参与平台活动和创作可以获得徽章</p>
      </div>
    );
  }
  
  return (
    <div className="badge-gallery">
      <div className="badges-grid">
        {badges.map((badge, index) => (
          <div key={index} className="badge-item">
            <div className="badge-image">
              <img 
                src={badge.image.startsWith('ipfs://') 
                  ? `https://ipfs.io/ipfs/${badge.image.replace('ipfs://', '')}` 
                  : badge.image} 
                alt={badge.name} 
              />
            </div>
            <div className="badge-info">
              <h4 className="badge-name">{badge.name}</h4>
              <p className="badge-description">{badge.description}</p>
              <p className="badge-date">
                获得于: {badge.awardedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeGallery;
```

### 3.3 身份上下文设计

创建身份上下文，管理身份状态和数据。

```jsx
// IdentityContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useBlockchain } from '../blockchain';
import { 
  hasIdentity, 
  getIdentityByAddress 
} from '../../contracts/identity/CultureID';
import { 
  getReputation, 
  getReputationLevel 
} from '../../contracts/identity/CultureReputation';

// 创建身份上下文
export const IdentityContext = createContext({
  hasIdentity: false,
  identity: null,
  reputation: '0',
  reputationLevel: { level: '0', name: '新手' },
  loading: false,
  error: null,
  refreshIdentity: () => {}
});

// 身份上下文提供者组件
export const IdentityProvider = ({ children }) => {
  const { active, account, library, chainId } = useBlockchain();
  
  const [hasId, setHasId] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [reputation, setReputation] = useState('0');
  const [reputationLevel, setReputationLevel] = useState({ level: '0', name: '新手' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 刷新身份信息
  const refreshIdentity = async () => {
    if (!active || !account || !library || !chainId) {
      setHasId(false);
      setIdentity(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 检查用户是否有身份
      const hasIdentityResult = await hasIdentity(library, chainId, account);
      setHasId(hasIdentityResult);
      
      if (hasIdentityResult) {
        // 获取身份信息
        const identityData = await getIdentityByAddress(library, chainId, account);
        setIdentity(identityData);
        
        if (identityData) {
          // 获取声誉信息
          const reputationData = await getReputation(library, chainId, identityData.id);
          setReputation(reputationData);
          
          // 获取声誉等级
          const levelData = await getReputationLevel(library, chainId, identityData.id);
          setReputationLevel(levelData);
        }
      } else {
        setIdentity(null);
        setReputation('0');
        setReputationLevel({ level: '0', name: '新手' });
      }
    } catch (error) {
      console.error('刷新身份信息失败:', error);
      setError('刷新身份信息时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    refreshIdentity();
  }, [active, account, library, chainId]);
  
  // 上下文值
  const contextValue = {
    hasIdentity: hasId,
    identity,
    reputation,
    reputationLevel,
    loading,
    error,
    refreshIdentity
  };
  
  return (
    <IdentityContext.Provider value={contextValue}>
      {children}
    </IdentityContext.Provider>
  );
};

// 自定义Hook，方便在组件中使用身份上下文
export const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error('useIdentity必须在IdentityProvider内部使用');
  }
  return context;
};
```

## 4. 路由与应用集成

### 4.1 路由设计

在App.js中添加去中心化身份与声誉系统相关路由。

```jsx
// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WalletConnector from './components/blockchain/WalletConnector';
import NFTMinter from './components/blockchain/NFTMinter';
import NFTGallery from './components/blockchain/NFTGallery';
import NFTDetail from './components/blockchain/NFTDetail';
import MarketplaceHome from './components/marketplace/MarketplaceHome';
import NFTListingForm from './components/marketplace/NFTListingForm';
import NFTAuctionForm from './components/marketplace/NFTAuctionForm';
import NFTMarketDetail from './components/marketplace/NFTMarketDetail';
import MyListings from './components/marketplace/MyListings';
import MyPurchases from './components/marketplace/MyPurchases';
import TokenWallet from './components/token/TokenWallet';
import TokenStaking from './components/token/TokenStaking';
import RewardCenter from './components/token/RewardCenter';
import IdentityProfile from './components/identity/IdentityProfile';
import IdentityCreator from './components/identity/IdentityCreator';
import IdentityEditor from './components/identity/IdentityEditor';
import IdentityVerifier from './components/identity/IdentityVerifier';
import ExternalAccountLinker from './components/identity/ExternalAccountLinker';
import { MarketplaceProvider } from './context/marketplace/MarketplaceContext';
import { TokenProvider } from './context/token/TokenContext';
import { IdentityProvider } from './context/identity/IdentityContext';
import './App.css';
import './styles/blockchain.css';
import './styles/marketplace.css';
import './styles/token.css';
import './styles/identity.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>CultureBridge</h1>
        <div className="wallet-section">
          <WalletConnector />
        </div>
      </header>
      
      <main className="App-main">
        <IdentityProvider>
          <TokenProvider>
            <MarketplaceProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mint" element={<NFTMinter />} />
                <Route path="/gallery" element={<NFTGallery />} />
                <Route path="/nft/:tokenId" element={<NFTDetailWrapper />} />
                <Route path="/marketplace" element={<MarketplaceHome />} />
                <Route path="/list-nft" element={<NFTListingForm />} />
                <Route path="/list-auction" element={<NFTAuctionForm />} />
                <Route path="/market-item/:nftContract/:tokenId" element={<NFTMarketDetail />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/my-purchases" element={<MyPurchases />} />
                <Route path="/token/wallet" element={<TokenWallet />} />
                <Route path="/token/staking" element={<TokenStaking />} />
                <Route path="/token/rewards" element={<RewardCenter />} />
                <Route path="/identity/profile" element={<IdentityProfile />} />
                <Route path="/identity/profile/:identityId" element={<IdentityProfile />} />
                <Route path="/identity/create" element={<IdentityCreator />} />
                <Route path="/identity/edit/:identityId" element={<IdentityEditor />} />
                <Route path="/identity/verify/:identityId" element={<IdentityVerifier />} />
                <Route path="/identity/link/:identityId" element={<ExternalAccountLinker />} />
              </Routes>
            </MarketplaceProvider>
          </TokenProvider>
        </IdentityProvider>
      </main>
      
      <footer className="App-footer">
        <p>CultureBridge - 基于区块链的跨文化交流平台</p>
      </footer>
    </div>
  );
}

// 首页组件
function Home() {
  return (
    <div className="home-container">
      <h2>欢迎来到CultureBridge</h2>
      <p>探索基于区块链的跨文化交流新体验</p>
      
      <div className="feature-cards">
        <div className="feature-card">
          <h3>创建文化NFT</h3>
          <p>将您的文化作品铸造为NFT，确保数字所有权</p>
          <a href="/mint" className="feature-link">开始创建</a>
        </div>
        
        <div className="feature-card">
          <h3>浏览NFT画廊</h3>
          <p>探索来自世界各地的文化艺术品</p>
          <a href="/gallery" className="feature-link">查看画廊</a>
        </div>
        
        <div className="feature-card">
          <h3>NFT市场</h3>
          <p>交易独特的文化NFT资产</p>
          <a href="/marketplace" className="feature-link">进入市场</a>
        </div>
        
        <div className="feature-card">
          <h3>文化通证</h3>
          <p>获取和使用CULT代币，参与平台生态</p>
          <a href="/token/wallet" className="feature-link">管理代币</a>
        </div>
        
        <div className="feature-card">
          <h3>身份与声誉</h3>
          <p>创建您的去中心化身份，建立声誉</p>
          <a href="/identity/profile" className="feature-link">查看身份</a>
        </div>
      </div>
    </div>
  );
}

// NFT详情包装组件，用于获取路由参数
function NFTDetailWrapper() {
  const tokenId = window.location.pathname.split('/').pop();
  return <NFTDetail tokenId={tokenId} />;
}

export default App;
```

### 4.2 样式设计

创建identity.css样式文件，为去中心化身份与声誉系统组件提供样式。

```css
/* identity.css */

/* 身份档案样式 */
.identity-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 28px;
}

.profile-address {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  word-break: break-all;
}

.profile-level {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.level-badge {
  background-color: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.level-name {
  color: #333;
  font-weight: 500;
}

.profile-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.edit-profile-btn,
.verify-profile-btn,
.link-account-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.edit-profile-btn {
  background-color: #007bff;
  color: white;
}

.verify-profile-btn {
  background-color: #28a745;
  color: white;
}

.link-account-btn {
  background-color: #6c757d;
  color: white;
}

.profile-bio {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.profile-bio h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.profile-bio p {
  margin: 0;
  color: #666;
}

.profile-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.profile-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.profile-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.no-data {
  color: #666;
  font-style: italic;
}

.verifications-list,
.linked-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.verification-item,
.linked-account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.verification-type,
.account-platform {
  font-weight: 500;
  color: #333;
}

.verification-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.verification-status.verified {
  background-color: #d4edda;
  color: #155724;
}

.verification-status.unverified {
  background-color: #f8d7da;
  color: #721c24;
}

.verification-date,
.account-link-date {
  font-size: 12px;
  color: #666;
}

.account-id {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.create-identity-prompt {
  text-align: center;
  margin-top: 20px;
}

.create-identity-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

/* 身份创建表单样式 */
.identity-creator {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.identity-creator h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
  font-size: 28px;
}

.identity-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-top: 10px;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.create-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 18px;
  cursor: pointer;
}

.create-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 声誉展示样式 */
.reputation-display {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.reputation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reputation-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-value {
  font-size: 28px;
  font-weight: 500;
  color: #007bff;
}

.score-label {
  font-size: 14px;
  color: #666;
}

.reputation-progress {
  margin-top: 10px;
}

.progress-bar {
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  border-radius: 5px;
}

.progress-text {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
  text-align: right;
}

.reputation-benefits {
  margin-top: 15px;
}

.reputation-benefits h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 16px;
}

.reputation-benefits ul {
  margin: 0;
  padding-left: 20px;
}

.reputation-benefits li {
  margin-bottom: 5px;
  color: #666;
}

/* 徽章展示样式 */
.badge-gallery {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.badge-gallery.empty {
  text-align: center;
  padding: 20px;
}

.no-badges {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.badge-tip {
  color: #666;
  font-size: 14px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.badge-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.badge-item:hover {
  transform: translateY(-5px);
}

.badge-image {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.badge-image img {
  max-width: 80px;
  max-height: 80px;
}

.badge-info {
  padding: 15px;
}

.badge-name {
  margin-top: 0;
  margin-bottom: 5px;
  color: #333;
  font-size: 16px;
}

.badge-description {
  margin-top: 0;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.badge-date {
  margin: 0;
  color: #666;
  font-size: 12px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-sections {
    grid-template-columns: 1fr;
  }
  
  .profile-actions {
    justify-content: center;
  }
  
  .badges-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
```

## 5. 数据流设计

### 5.1 去中心化身份与声誉系统数据流

```
用户操作 -> 前端组件 -> 身份上下文 -> 合约接口 -> 区块链网络
                                  -> 本地状态管理

区块链网络 -> 合约接口 -> 身份上下文 -> 前端组件 -> 用户界面
```

### 5.2 状态管理

- **全局状态**：通过IdentityContext管理身份全局状态
- **组件状态**：各组件通过useState管理本地状态
- **区块链状态**：通过BlockchainContext管理钱包连接和网络状态

### 5.3 事件监听

监听区块链事件，实时更新身份和声誉状态。

```javascript
// 在IdentityContext中添加事件监听
useEffect(() => {
  if (active && library && chainId && identity) {
    const idContract = getCultureIDContract(library, chainId);
    const reputationContract = getCultureReputationContract(library, chainId);
    
    // 监听身份更新事件
    const identityUpdatedFilter = idContract.filters.IdentityUpdated(identity.id);
    const identityVerifiedFilter = idContract.filters.IdentityVerified(identity.id);
    const accountLinkedFilter = idContract.filters.ExternalAccountLinked(identity.id);
    
    // 监听声誉变化事件
    const reputationChangedFilter = reputationContract.filters.ReputationChanged(identity.id);
    const levelUpFilter = reputationContract.filters.ReputationLevelUp(identity.id);
    const badgeAwardedFilter = reputationContract.filters.BadgeAwarded(identity.id);
    
    const handleIdentityUpdate = () => refreshIdentity();
    const handleReputationChange = () => refreshIdentity();
    
    idContract.on(identityUpdatedFilter, handleIdentityUpdate);
    idContract.on(identityVerifiedFilter, handleIdentityUpdate);
    idContract.on(accountLinkedFilter, handleIdentityUpdate);
    reputationContract.on(reputationChangedFilter, handleReputationChange);
    reputationContract.on(levelUpFilter, handleReputationChange);
    reputationContract.on(badgeAwardedFilter, handleReputationChange);
    
    return () => {
      idContract.off(identityUpdatedFilter, handleIdentityUpdate);
      idContract.off(identityVerifiedFilter, handleIdentityUpdate);
      idContract.off(accountLinkedFilter, handleIdentityUpdate);
      reputationContract.off(reputationChangedFilter, handleReputationChange);
      reputationContract.off(levelUpFilter, handleReputationChange);
      reputationContract.off(badgeAwardedFilter, handleReputationChange);
    };
  }
}, [active, library, chainId, identity]);
```

## 6. 实施计划

### 6.1 开发阶段

1. **第一阶段**：实现去中心化身份合约接口和基础组件
   - 开发CultureID.js合约接口
   - 实现IdentityContext上下文
   - 开发IdentityProfile和IdentityCreator组件

2. **第二阶段**：实现身份验证和外部账号关联功能
   - 开发IdentityVerifier组件
   - 开发ExternalAccountLinker组件
   - 实现身份验证和账号关联流程

3. **第三阶段**：实现声誉系统合约接口和组件
   - 开发CultureReputation.js合约接口
   - 开发ReputationDisplay和BadgeGallery组件
   - 实现声誉历史和徽章展示

4. **第四阶段**：集成与其他功能模块的交互
   - 与NFT市场集成，实现基于身份和声誉的权限控制
   - 与文化通证集成，实现基于声誉的奖励机制
   - 与DAO治理集成，实现基于声誉的投票权重

### 6.2 测试计划

- **单元测试**：测试各合约接口函数
- **集成测试**：测试组件与合约的交互
- **用户流程测试**：测试完整的用户操作流程
- **兼容性测试**：测试不同浏览器和设备的兼容性

## 7. 总结

本技术方案详细设计了CultureBridge平台去中心化身份与声誉系统的实现方案，包括智能合约接口、前端组件结构和数据流设计。通过实现身份创建、验证、声誉积累和徽章获取等功能，将为用户提供自主可控的数字身份，并基于用户在平台上的行为和贡献建立声誉机制，促进健康的社区生态和文化交流。

后续将按照实施计划逐步开发和测试各功能模块，确保去中心化身份与声誉系统的稳定性和用户体验。同时，将与NFT市场、文化通证和DAO治理功能集成，实现基于身份和声誉的权限控制、奖励机制和投票权重，为平台提供更完善的治理和激励模型。
