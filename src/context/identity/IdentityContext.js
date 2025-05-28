import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { CultureIdentity } from '../../contracts/identity/CultureIdentity';
import { CultureReputation } from '../../contracts/identity/CultureReputation';

// 创建身份上下文
export const IdentityContext = createContext();

// 身份上下文提供者组件
export const IdentityProvider = ({ children }) => {
  const { account, library, active } = useWeb3React();
  
  // 状态
  const [currentIdentity, setCurrentIdentity] = useState(null);
  const [identities, setIdentities] = useState([]);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityError, setIdentityError] = useState(null);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [credentialsError, setCredentialsError] = useState(null);
  
  // 初始化合约实例
  const identityContract = useCallback(() => {
    if (active && library) {
      return CultureIdentity(library.getSigner());
    }
    return null;
  }, [active, library]);
  
  const reputationContract = useCallback(() => {
    if (active && library) {
      return CultureReputation(library.getSigner());
    }
    return null;
  }, [active, library]);
  
  // 加载当前用户的身份
  const loadCurrentIdentity = useCallback(async () => {
    if (!active || !account) {
      setCurrentIdentity(null);
      return;
    }
    
    try {
      setIdentityLoading(true);
      setIdentityError(null);
      
      const contract = identityContract();
      if (!contract) {
        throw new Error('合约未初始化');
      }
      
      // 查询用户的身份ID
      const identityId = await contract.getIdentityByAddress(account);
      
      if (identityId && !identityId.isZero()) {
        // 获取身份详情
        const identity = await contract.getIdentity(identityId);
        
        // 获取身份验证信息
        const verifications = await contract.getVerifications(identityId);
        
        // 获取声誉信息
        const repContract = reputationContract();
        let reputation = null;
        
        if (repContract) {
          try {
            const repData = await repContract.getReputation(identityId);
            reputation = {
              totalScore: parseInt(repData.totalScore.toString()),
              creationScore: parseInt(repData.creationScore.toString()),
              participationScore: parseInt(repData.participationScore.toString()),
              contributionScore: parseInt(repData.contributionScore.toString()),
              lastUpdated: new Date(repData.lastUpdated.toNumber() * 1000)
            };
          } catch (error) {
            console.error('获取声誉信息失败:', error);
          }
        }
        
        // 格式化身份数据
        const formattedIdentity = {
          identityId: identityId.toString(),
          owner: identity.owner,
          name: identity.name,
          bio: identity.bio,
          avatar: identity.avatar,
          createdAt: new Date(identity.createdAt.toNumber() * 1000),
          updatedAt: new Date(identity.updatedAt.toNumber() * 1000),
          verifications: verifications.map(v => ({
            verificationType: v.verificationType,
            proof: v.proof,
            verifier: v.verifier,
            valid: v.valid,
            timestamp: new Date(v.timestamp.toNumber() * 1000)
          })),
          reputation: reputation
        };
        
        setCurrentIdentity(formattedIdentity);
      } else {
        setCurrentIdentity(null);
      }
      
      setIdentityLoading(false);
    } catch (error) {
      console.error('加载身份失败:', error);
      setIdentityError(error.message || '加载身份失败');
      setIdentityLoading(false);
    }
  }, [active, account, identityContract, reputationContract]);
  
  // 当钱包连接状态改变时加载身份
  useEffect(() => {
    loadCurrentIdentity();
  }, [active, account, loadCurrentIdentity]);
  
  // 创建身份
  const createIdentity = async (name, bio, avatarIpfsHash) => {
    if (!active || !account) {
      return { success: false, error: '钱包未连接' };
    }
    
    try {
      const contract = identityContract();
      if (!contract) {
        return { success: false, error: '合约未初始化' };
      }
      
      // 检查用户是否已有身份
      const existingId = await contract.getIdentityByAddress(account);
      if (existingId && !existingId.isZero()) {
        return { success: false, error: '您已经创建了身份' };
      }
      
      // 创建身份
      const tx = await contract.createIdentity(name, bio, avatarIpfsHash || '');
      await tx.wait();
      
      // 重新加载身份
      await loadCurrentIdentity();
      
      return { success: true, identity: currentIdentity };
    } catch (error) {
      console.error('创建身份失败:', error);
      return { success: false, error: error.message || '创建身份失败' };
    }
  };
  
  // 更新身份
  const updateIdentity = async (name, bio, avatarIpfsHash) => {
    if (!active || !account || !currentIdentity) {
      return { success: false, error: '钱包未连接或身份不存在' };
    }
    
    try {
      const contract = identityContract();
      if (!contract) {
        return { success: false, error: '合约未初始化' };
      }
      
      // 更新身份
      const tx = await contract.updateIdentity(
        currentIdentity.identityId,
        name,
        bio,
        avatarIpfsHash || currentIdentity.avatar || ''
      );
      await tx.wait();
      
      // 重新加载身份
      await loadCurrentIdentity();
      
      return { success: true, identity: currentIdentity };
    } catch (error) {
      console.error('更新身份失败:', error);
      return { success: false, error: error.message || '更新身份失败' };
    }
  };
  
  // 获取指定身份
  const getIdentity = async (identityId) => {
    try {
      const contract = identityContract();
      if (!contract) {
        return { success: false, error: '合约未初始化' };
      }
      
      // 获取身份详情
      const identity = await contract.getIdentity(identityId);
      
      // 获取身份验证信息
      const verifications = await contract.getVerifications(identityId);
      
      // 格式化身份数据
      const formattedIdentity = {
        identityId: identityId.toString(),
        owner: identity.owner,
        name: identity.name,
        bio: identity.bio,
        avatar: identity.avatar,
        createdAt: new Date(identity.createdAt.toNumber() * 1000),
        updatedAt: new Date(identity.updatedAt.toNumber() * 1000),
        verifications: verifications.map(v => ({
          verificationType: v.verificationType,
          proof: v.proof,
          verifier: v.verifier,
          valid: v.valid,
          timestamp: new Date(v.timestamp.toNumber() * 1000)
        }))
      };
      
      return { success: true, identity: formattedIdentity };
    } catch (error) {
      console.error('获取身份失败:', error);
      return { success: false, error: error.message || '获取身份失败' };
    }
  };
  
  // 添加验证
  const addVerification = async (identityId, verificationType, proof) => {
    if (!active || !account) {
      return { success: false, error: '钱包未连接' };
    }
    
    try {
      const contract = identityContract();
      if (!contract) {
        return { success: false, error: '合约未初始化' };
      }
      
      // 添加验证
      const tx = await contract.addVerification(identityId, verificationType, proof);
      await tx.wait();
      
      // 如果是当前用户的身份，重新加载
      if (currentIdentity && currentIdentity.identityId === identityId.toString()) {
        await loadCurrentIdentity();
      }
      
      return { success: true };
    } catch (error) {
      console.error('添加验证失败:', error);
      return { success: false, error: error.message || '添加验证失败' };
    }
  };
  
  // 验证身份
  const verifyIdentity = async (identityId, verificationType, isValid) => {
    if (!active || !account) {
      return { success: false, error: '钱包未连接' };
    }
    
    try {
      const contract = identityContract();
      if (!contract) {
        return { success: false, error: '合约未初始化' };
      }
      
      // 验证身份
      const tx = await contract.verifyIdentity(identityId, verificationType, isValid);
      await tx.wait();
      
      // 如果是当前用户的身份，重新加载
      if (currentIdentity && currentIdentity.identityId === identityId.toString()) {
        await loadCurrentIdentity();
      }
      
      return { success: true };
    } catch (error) {
      console.error('验证身份失败:', error);
      return { success: false, error: error.message || '验证身份失败' };
    }
  };
  
  // 获取验证信息
  const getVerifications = async (identityId) => {
    try {
      const contract = identityContract();
      if (!contract) {
        return { success: false, error: '合约未初始化' };
      }
      
      // 获取验证信息
      const verifications = await contract.getVerifications(identityId);
      
      // 格式化验证数据
      const formattedVerifications = verifications.map(v => ({
        verificationType: v.verificationType,
        proof: v.proof,
        verifier: v.verifier,
        valid: v.valid,
        timestamp: new Date(v.timestamp.toNumber() * 1000)
      }));
      
      return { success: true, verifications: formattedVerifications };
    } catch (error) {
      console.error('获取验证信息失败:', error);
      return { success: false, error: error.message || '获取验证信息失败' };
    }
  };
  
  // 获取声誉
  const getReputation = async (identityId) => {
    try {
      const contract = reputationContract();
      if (!contract) {
        return { success: false, error: '合约未初始化' };
      }
      
      // 获取声誉信息
      const reputation = await contract.getReputation(identityId);
      
      // 格式化声誉数据
      const formattedReputation = {
        totalScore: parseInt(reputation.totalScore.toString()),
        creationScore: parseInt(reputation.creationScore.toString()),
        participationScore: parseInt(reputation.participationScore.toString()),
        contributionScore: parseInt(reputation.contributionScore.toString()),
        lastUpdated: new Date(reputation.lastUpdated.toNumber() * 1000)
      };
      
      return { success: true, reputation: formattedReputation };
    } catch (error) {
      console.error('获取声誉失败:', error);
      return { success: false, error: error.message || '获取声誉失败' };
    }
  };
  
  // 更新声誉
  const updateReputation = async (identityId, creationDelta, participationDelta, contributionDelta) => {
    if (!active || !account) {
      return { success: false, error: '钱包未连接' };
    }
    
    try {
      const contract = reputationContract();
      if (!contract) {
        return { success: false, error: '合约未初始化' };
      }
      
      // 检查调用者权限
      const hasRole = await contract.hasRole(ethers.utils.id('REPUTATION_UPDATER_ROLE'), account);
      if (!hasRole) {
        return { success: false, error: '没有更新声誉的权限' };
      }
      
      // 更新声誉
      const tx = await contract.updateReputation(
        identityId,
        creationDelta,
        participationDelta,
        contributionDelta
      );
      await tx.wait();
      
      // 如果是当前用户的身份，重新加载
      if (currentIdentity && currentIdentity.identityId === identityId.toString()) {
        await loadCurrentIdentity();
      }
      
      return { success: true };
    } catch (error) {
      console.error('更新声誉失败:', error);
      return { success: false, error: error.message || '更新声誉失败' };
    }
  };
  
  // 获取凭证
  const getCredentials = async (identityId) => {
    try {
      setCredentialsLoading(true);
      setCredentialsError(null);
      
      const contract = identityContract();
      if (!contract) {
        throw new Error('合约未初始化');
      }
      
      // 获取凭证数量
      const count = await contract.getCredentialCount(identityId);
      
      // 获取所有凭证
      const credentials = [];
      for (let i = 0; i < count; i++) {
        const credential = await contract.getCredentialByIndex(identityId, i);
        
        credentials.push({
          id: credential.id.toString(),
          name: credential.name,
          description: credential.description,
          image: credential.image,
          metadata: credential.metadata,
          issuer: credential.issuer,
          issuerName: credential.issuerName,
          credentialType: credential.credentialType,
          issuedAt: new Date(credential.issuedAt.toNumber() * 1000),
          expiresAt: credential.expiresAt.toNumber() > 0 
            ? new Date(credential.expiresAt.toNumber() * 1000) 
            : null
        });
      }
      
      setCredentialsLoading(false);
      return { success: true, credentials };
    } catch (error) {
      console.error('获取凭证失败:', error);
      setCredentialsError(error.message || '获取凭证失败');
      setCredentialsLoading(false);
      return { success: false, error: error.message || '获取凭证失败' };
    }
  };
  
  // 颁发凭证
  const issueCredential = async (identityId, name, description, image, metadata, credentialType, expiresAt) => {
    if (!active || !account) {
      return { success: false, error: '钱包未连接' };
    }
    
    try {
      const contract = identityContract();
      if (!contract) {
        return { success: false, error: '合约未初始化' };
      }
      
      // 检查调用者权限
      const hasRole = await contract.hasRole(ethers.utils.id('CREDENTIAL_ISSUER_ROLE'), account);
      if (!hasRole) {
        return { success: false, error: '没有颁发凭证的权限' };
      }
      
      // 颁发凭证
      const tx = await contract.issueCredential(
        identityId,
        name,
        description,
        image || '',
        metadata || '',
        account,
        '', // issuerName，使用合约中的映射
        credentialType,
        expiresAt ? Math.floor(expiresAt.getTime() / 1000) : 0
      );
      await tx.wait();
      
      return { success: true };
    } catch (error) {
      console.error('颁发凭证失败:', error);
      return { success: false, error: error.message || '颁发凭证失败' };
    }
  };
  
  // 撤销凭证
  const revokeCredential = async (identityId, credentialId) => {
    if (!active || !account) {
      return { success: false, error: '钱包未连接' };
    }
    
    try {
      const contract = identityContract();
      if (!contract) {
        return { success: false, error: '合约未初始化' };
      }
      
      // 撤销凭证
      const tx = await contract.revokeCredential(identityId, credentialId);
      await tx.wait();
      
      return { success: true };
    } catch (error) {
      console.error('撤销凭证失败:', error);
      return { success: false, error: error.message || '撤销凭证失败' };
    }
  };
  
  // 提供上下文值
  const contextValue = {
    currentIdentity,
    identities,
    identityLoading,
    identityError,
    credentialsLoading,
    credentialsError,
    loadCurrentIdentity,
    createIdentity,
    updateIdentity,
    getIdentity,
    addVerification,
    verifyIdentity,
    getVerifications,
    getReputation,
    updateReputation,
    getCredentials,
    issueCredential,
    revokeCredential
  };
  
  return (
    <IdentityContext.Provider value={contextValue}>
      {children}
    </IdentityContext.Provider>
  );
};

export default IdentityProvider;
