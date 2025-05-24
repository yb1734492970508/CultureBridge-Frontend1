import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './VerifiableCredential.css';

/**
 * 可验证凭证组件
 * 用于展示和验证DID身份凭证
 */
const VerifiableCredential = ({ credential, onVerify, onRevoke }) => {
  const { active, library } = useBlockchain();
  
  // 凭证状态
  const [isExpanded, setIsExpanded] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  
  // 验证凭证
  const verifyCredential = async () => {
    if (!active || !library || !credential) return;
    
    setIsVerifying(true);
    setVerifyError(null);
    
    try {
      // 在实际应用中，这里应该调用验证服务或智能合约验证凭证
      // 这里我们模拟验证过程
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 随机验证结果，实际应用中应该是确定性的
      const isValid = Math.random() > 0.2;
      
      // 设置验证状态
      setVerificationStatus({
        isValid,
        timestamp: Date.now(),
        verifier: '文化桥验证服务',
        details: isValid 
          ? '凭证签名有效，内容未被篡改' 
          : '凭证签名无效或内容已被篡改'
      });
      
      // 调用回调
      if (onVerify) {
        onVerify(credential.id, isValid);
      }
      
    } catch (err) {
      console.error('验证凭证失败:', err);
      setVerifyError('验证过程中发生错误，请稍后重试');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // 格式化日期
  const formatDate = (timestamp) => {
    if (!timestamp) return '未知';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // 获取凭证类型图标
  const getCredentialTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'education':
      case '教育':
        return '🎓';
      case 'employment':
      case '就业':
        return '💼';
      case 'identity':
      case '身份':
        return '🪪';
      case 'membership':
      case '会员':
        return '🏅';
      case 'certificate':
      case '证书':
        return '📜';
      case 'award':
      case '奖项':
        return '🏆';
      case 'skill':
      case '技能':
        return '🛠️';
      case 'cultural':
      case '文化':
        return '🏛️';
      default:
        return '📄';
    }
  };
  
  // 获取验证状态标签
  const getVerificationStatusLabel = () => {
    if (!verificationStatus) {
      return { label: '未验证', className: 'status-unverified' };
    }
    
    return verificationStatus.isValid
      ? { label: '已验证', className: 'status-verified' }
      : { label: '验证失败', className: 'status-invalid' };
  };
  
  // 渲染凭证内容
  const renderCredentialContent = () => {
    if (!isExpanded) return null;
    
    return (
      <div className="credential-expanded-content">
        <div className="credential-details">
          <div className="detail-row">
            <span className="detail-label">发行方:</span>
            <span className="detail-value">{credential.issuer}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">发行日期:</span>
            <span className="detail-value">{formatDate(credential.issuedAt)}</span>
          </div>
          
          {credential.hash && (
            <div className="detail-row">
              <span className="detail-label">哈希值:</span>
              <span className="detail-value hash-value">{credential.hash}</span>
            </div>
          )}
          
          {credential.uri && (
            <div className="detail-row">
              <span className="detail-label">URI:</span>
              <a 
                href={credential.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="detail-value uri-link"
              >
                {credential.uri}
              </a>
            </div>
          )}
        </div>
        
        {verificationStatus && (
          <div className={`verification-result ${verificationStatus.isValid ? 'valid' : 'invalid'}`}>
            <div className="verification-header">
              <span className="verification-icon">
                {verificationStatus.isValid ? '✅' : '❌'}
              </span>
              <span className="verification-title">
                {verificationStatus.isValid ? '验证成功' : '验证失败'}
              </span>
            </div>
            
            <div className="verification-details">
              <div className="detail-row">
                <span className="detail-label">验证时间:</span>
                <span className="detail-value">{formatDate(verificationStatus.timestamp)}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">验证者:</span>
                <span className="detail-value">{verificationStatus.verifier}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">详情:</span>
                <span className="detail-value">{verificationStatus.details}</span>
              </div>
            </div>
          </div>
        )}
        
        {verifyError && (
          <div className="verification-error">
            {verifyError}
          </div>
        )}
        
        <div className="credential-actions">
          <button
            className="verify-button"
            onClick={verifyCredential}
            disabled={isVerifying}
          >
            {isVerifying ? '验证中...' : '验证凭证'}
          </button>
          
          {onRevoke && (
            <button
              className="revoke-button"
              onClick={() => onRevoke(credential.id)}
            >
              吊销凭证
            </button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`verifiable-credential ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className="credential-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="credential-type">
          <span className="type-icon">{getCredentialTypeIcon(credential.type)}</span>
          <span className="type-name">{credential.type}</span>
        </div>
        
        <div className="credential-status">
          {credential.verified && (
            <span className="verified-badge">已验证</span>
          )}
          
          <span className="expand-icon">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>
      
      {renderCredentialContent()}
    </div>
  );
};

export default VerifiableCredential;
