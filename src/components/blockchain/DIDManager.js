import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './DIDManager.css';

// 简化版DID合约ABI
const DID_CONTRACT_ABI = [
  "function createIdentity(string name, string description, string imageURI) returns (uint256)",
  "function getIdentity(address owner) view returns (uint256 id, string name, string description, string imageURI, uint256 createdAt, bool verified)",
  "function updateIdentity(string name, string description, string imageURI) returns (bool)",
  "function addCredential(uint256 identityId, string credentialType, string issuer, string hash, string uri) returns (uint256)",
  "function getCredentials(uint256 identityId) view returns (tuple(uint256 id, string credentialType, string issuer, uint256 issuedAt, string hash, string uri)[] credentials)",
  "function verifyCredential(uint256 credentialId, bool status) returns (bool)",
  "function revokeCredential(uint256 credentialId) returns (bool)",
  "event IdentityCreated(address indexed owner, uint256 indexed identityId, string name)",
  "event IdentityUpdated(address indexed owner, uint256 indexed identityId, string name)",
  "event CredentialAdded(uint256 indexed identityId, uint256 indexed credentialId, string credentialType, string issuer)",
  "event CredentialVerified(uint256 indexed credentialId, bool status)",
  "event CredentialRevoked(uint256 indexed credentialId)"
];

// DID合约地址（测试网）
const DID_CONTRACT_ADDRESS = "0x9B7dD1E99B5C9B1e0c6B3A59C43915773C9e467A";

/**
 * 去中心化身份管理组件
 * 允许用户创建和管理自己的区块链身份和凭证
 */
const DIDManager = () => {
  const { active, account, library, chainId } = useBlockchain();
  
  // 身份状态
  const [hasIdentity, setHasIdentity] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [credentials, setCredentials] = useState([]);
  
  // 表单状态
  const [identityName, setIdentityName] = useState('');
  const [identityDescription, setIdentityDescription] = useState('');
  const [identityImage, setIdentityImage] = useState('');
  const [credentialType, setCredentialType] = useState('');
  const [credentialIssuer, setCredentialIssuer] = useState('');
  const [credentialHash, setCredentialHash] = useState('');
  const [credentialURI, setCredentialURI] = useState('');
  
  // 交易状态
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingCredential, setIsAddingCredential] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [credentialError, setCredentialError] = useState(null);
  
  // 显示状态
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' 或 'credentials'
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  
  // 隐私设置
  const [privacySettings, setPrivacySettings] = useState({
    showName: true,
    showDescription: true,
    showImage: true,
    showCredentials: true,
    showIssuers: true
  });
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  
  // 社交恢复
  const [recoveryAddresses, setRecoveryAddresses] = useState([]);
  const [newRecoveryAddress, setNewRecoveryAddress] = useState('');
  const [showRecoverySettings, setShowRecoverySettings] = useState(false);
  const [recoveryError, setRecoveryError] = useState(null);
  
  // 凭证验证状态
  const [verificationStatus, setVerificationStatus] = useState({});
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  
  // 获取DID合约实例
  const getDIDContract = () => {
    if (!active || !library) return null;
    
    try {
      return new ethers.Contract(
        DID_CONTRACT_ADDRESS,
        DID_CONTRACT_ABI,
        library.getSigner()
      );
    } catch (err) {
      console.error('创建DID合约实例失败:', err);
      return null;
    }
  };
  
  // 加载用户身份
  useEffect(() => {
    const loadIdentity = async () => {
      if (!active || !account || !library) {
        setHasIdentity(false);
        setIdentity(null);
        return;
      }
      
      try {
        const didContract = getDIDContract();
        if (!didContract) return;
        
        const identityData = await didContract.getIdentity(account);
        
        // 检查是否有身份（id > 0表示有身份）
        if (identityData.id.gt(0)) {
          setHasIdentity(true);
          setIdentity({
            id: identityData.id.toString(),
            name: identityData.name,
            description: identityData.description,
            imageURI: identityData.imageURI,
            createdAt: new Date(identityData.createdAt.toNumber() * 1000),
            verified: identityData.verified
          });
          
          // 预填充表单
          setIdentityName(identityData.name);
          setIdentityDescription(identityData.description);
          setIdentityImage(identityData.imageURI);
          
          // 加载凭证
          loadCredentials(identityData.id);
          
          // 加载社交恢复地址（模拟数据）
          loadRecoveryAddresses(identityData.id);
          
          // 加载验证状态（模拟数据）
          loadVerificationStatus(identityData.id);
        } else {
          setHasIdentity(false);
          setIdentity(null);
          setCredentials([]);
          setRecoveryAddresses([]);
          setVerificationStatus({});
        }
      } catch (err) {
        console.error('加载身份失败:', err);
        setHasIdentity(false);
        setIdentity(null);
      }
    };
    
    loadIdentity();
  }, [active, account, library]);
  
  // 加载用户凭证
  const loadCredentials = async (identityId) => {
    if (!active || !library || !identityId) {
      setCredentials([]);
      return;
    }
    
    try {
      const didContract = getDIDContract();
      if (!didContract) return;
      
      const credentialsData = await didContract.getCredentials(identityId);
      
      const formattedCredentials = credentialsData.map(cred => ({
        id: cred.id.toString(),
        type: cred.credentialType,
        issuer: cred.issuer,
        issuedAt: new Date(cred.issuedAt.toNumber() * 1000),
        hash: cred.hash,
        uri: cred.uri,
        verified: Math.random() > 0.3 // 模拟验证状态
      }));
      
      setCredentials(formattedCredentials);
    } catch (err) {
      console.error('加载凭证失败:', err);
      setCredentials([]);
    }
  };
  
  // 加载社交恢复地址（模拟数据）
  const loadRecoveryAddresses = (identityId) => {
    // 模拟数据
    const mockRecoveryAddresses = [
      '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    ];
    
    setRecoveryAddresses(mockRecoveryAddresses);
  };
  
  // 加载验证状态（模拟数据）
  const loadVerificationStatus = (identityId) => {
    // 模拟数据
    const mockVerificationStatus = {
      'email': {
        status: 'verified',
        verifier: 'CultureBridge验证服务',
        timestamp: Date.now() - 86400000 * 3, // 3天前
        expiresAt: Date.now() + 86400000 * 30, // 30天后
        value: 'user@example.com'
      },
      'phone': {
        status: 'pending',
        verifier: 'CultureBridge验证服务',
        timestamp: Date.now() - 3600000, // 1小时前
        value: '+86 1XX XXXX XXXX'
      },
      'kyc': {
        status: 'verified',
        verifier: '第三方KYC服务',
        timestamp: Date.now() - 86400000 * 10, // 10天前
        expiresAt: Date.now() + 86400000 * 180, // 180天后
        level: 2
      }
    };
    
    setVerificationStatus(mockVerificationStatus);
  };
  
  // 创建身份
  const createIdentity = async () => {
    if (!active || !account || !library) {
      setCreateError('请先连接钱包');
      return;
    }
    
    if (!identityName) {
      setCreateError('请输入身份名称');
      return;
    }
    
    setIsCreating(true);
    setCreateError(null);
    
    try {
      const didContract = getDIDContract();
      if (!didContract) {
        throw new Error('无法连接DID合约');
      }
      
      // 创建身份
      const tx = await didContract.createIdentity(
        identityName,
        identityDescription || '',
        identityImage || ''
      );
      
      // 等待交易确认
      await tx.wait();
      
      // 重新加载身份
      const identityData = await didContract.getIdentity(account);
      setHasIdentity(true);
      setIdentity({
        id: identityData.id.toString(),
        name: identityData.name,
        description: identityData.description,
        imageURI: identityData.imageURI,
        createdAt: new Date(identityData.createdAt.toNumber() * 1000),
        verified: identityData.verified
      });
      
      // 设置默认隐私设置
      setPrivacySettings({
        showName: true,
        showDescription: true,
        showImage: true,
        showCredentials: true,
        showIssuers: true
      });
      
    } catch (err) {
      console.error('创建身份失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setCreateError('您拒绝了交易签名');
      } else {
        setCreateError(`创建失败: ${err.message || '请稍后重试'}`);
      }
    } finally {
      setIsCreating(false);
    }
  };
  
  // 更新身份
  const updateIdentity = async () => {
    if (!active || !account || !library || !hasIdentity) {
      setUpdateError('请先连接钱包并创建身份');
      return;
    }
    
    if (!identityName) {
      setUpdateError('请输入身份名称');
      return;
    }
    
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      const didContract = getDIDContract();
      if (!didContract) {
        throw new Error('无法连接DID合约');
      }
      
      // 更新身份
      const tx = await didContract.updateIdentity(
        identityName,
        identityDescription || '',
        identityImage || ''
      );
      
      // 等待交易确认
      await tx.wait();
      
      // 更新本地状态
      setIdentity(prev => ({
        ...prev,
        name: identityName,
        description: identityDescription || '',
        imageURI: identityImage || ''
      }));
      
    } catch (err) {
      console.error('更新身份失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setUpdateError('您拒绝了交易签名');
      } else {
        setUpdateError(`更新失败: ${err.message || '请稍后重试'}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 添加凭证
  const addCredential = async () => {
    if (!active || !account || !library || !hasIdentity) {
      setCredentialError('请先连接钱包并创建身份');
      return;
    }
    
    if (!credentialType || !credentialIssuer) {
      setCredentialError('请填写凭证类型和发行方');
      return;
    }
    
    setIsAddingCredential(true);
    setCredentialError(null);
    
    try {
      const didContract = getDIDContract();
      if (!didContract) {
        throw new Error('无法连接DID合约');
      }
      
      // 添加凭证
      const tx = await didContract.addCredential(
        identity.id,
        credentialType,
        credentialIssuer,
        credentialHash || ethers.utils.id(Date.now().toString()), // 如果没有提供哈希，生成一个随机哈希
        credentialURI || ''
      );
      
      // 等待交易确认
      await tx.wait();
      
      // 重新加载凭证
      loadCredentials(identity.id);
      
      // 重置表单
      setCredentialType('');
      setCredentialIssuer('');
      setCredentialHash('');
      setCredentialURI('');
      setShowCredentialForm(false);
      
    } catch (err) {
      console.error('添加凭证失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setCredentialError('您拒绝了交易签名');
      } else {
        setCredentialError(`添加失败: ${err.message || '请稍后重试'}`);
      }
    } finally {
      setIsAddingCredential(false);
    }
  };
  
  // 验证凭证（仅模拟，实际应由授权验证者调用）
  const verifyCredential = async (credentialId) => {
    if (!active || !library) return;
    
    try {
      const didContract = getDIDContract();
      if (!didContract) return;
      
      // 在实际应用中，这里应该调用合约验证凭证
      // 这里我们只是模拟验证过程
      
      // 更新本地状态
      setCredentials(prev => prev.map(cred => {
        if (cred.id === credentialId) {
          return { ...cred, verified: true };
        }
        return cred;
      }));
      
    } catch (err) {
      console.error('验证凭证失败:', err);
    }
  };
  
  // 吊销凭证
  const revokeCredential = async (credentialId) => {
    if (!active || !library) return;
    
    try {
      const didContract = getDIDContract();
      if (!didContract) return;
      
      // 在实际应用中，这里应该调用合约吊销凭证
      // 这里我们只是模拟吊销过程
      
      // 更新本地状态
      setCredentials(prev => prev.filter(cred => cred.id !== credentialId));
      
    } catch (err) {
      console.error('吊销凭证失败:', err);
    }
  };
  
  // 添加社交恢复地址
  const addRecoveryAddress = () => {
    if (!ethers.utils.isAddress(newRecoveryAddress)) {
      setRecoveryError('请输入有效的以太坊地址');
      return;
    }
    
    if (recoveryAddresses.includes(newRecoveryAddress)) {
      setRecoveryError('该地址已在恢复列表中');
      return;
    }
    
    // 添加新的恢复地址
    setRecoveryAddresses(prev => [...prev, newRecoveryAddress]);
    setNewRecoveryAddress('');
    setRecoveryError(null);
  };
  
  // 移除社交恢复地址
  const removeRecoveryAddress = (address) => {
    setRecoveryAddresses(prev => prev.filter(addr => addr !== address));
  };
  
  // 更新隐私设置
  const updatePrivacySettings = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // 格式化日期
  const formatDate = (date) => {
    if (!date) return '';
    
    return date.toLocaleString();
  };
  
  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 渲染身份创建表单
  const renderIdentityCreationForm = () => {
    return (
      <div className="identity-creation-form">
        <h3>创建您的数字身份</h3>
        <p>在区块链上创建您的去中心化身份，安全地管理您的文化身份和声誉。</p>
        
        <div className="form-group">
          <label>身份名称 *</label>
          <input
            type="text"
            value={identityName}
            onChange={(e) => setIdentityName(e.target.value)}
            placeholder="输入您的身份名称"
            required
          />
        </div>
        
        <div className="form-group">
          <label>身份描述</label>
          <textarea
            value={identityDescription}
            onChange={(e) => setIdentityDescription(e.target.value)}
            placeholder="简要描述您的身份（可选）"
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label>头像图片URL</label>
          <input
            type="text"
            value={identityImage}
            onChange={(e) => setIdentityImage(e.target.value)}
            placeholder="输入头像图片URL（可选）"
          />
        </div>
        
        {createError && (
          <div className="error-message">{createError}</div>
        )}
        
        <button
          className="create-button"
          onClick={createIdentity}
          disabled={isCreating || !identityName}
        >
          {isCreating ? '创建中...' : '创建身份'}
        </button>
      </div>
    );
  };
  
  // 渲染身份信息
  const renderIdentityProfile = () => {
    if (!identity) return null;
    
    return (
      <div className="identity-profile">
        <div className="profile-header">
          <div className="profile-image">
            {privacySettings.showImage && identity.imageURI ? (
              <img src={identity.imageURI} alt={identity.name} />
            ) : (
              <div className="placeholder-image">
                {privacySettings.showName ? identity.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h3>{privacySettings.showName ? identity.name : '匿名用户'}</h3>
            {privacySettings.showDescription && (
              <p className="profile-description">{identity.description || '暂无描述'}</p>
            )}
            <div className="profile-meta">
              <span className="profile-id">ID: {identity.id}</span>
              <span className="profile-created">创建于: {formatDate(identity.createdAt)}</span>
              {identity.verified && (
                <span className="profile-verified">已验证</span>
              )}
            </div>
            
            <div className="profile-actions">
              <button 
                className="privacy-button"
                onClick={() => setShowPrivacySettings(!showPrivacySettings)}
              >
                隐私设置
              </button>
              <button 
                className="recovery-button"
                onClick={() => setShowRecoverySettings(!showRecoverySettings)}
              >
                社交恢复
              </button>
            </div>
          </div>
        </div>
        
        {showPrivacySettings && renderPrivacySettings()}
        {showRecoverySettings && renderRecoverySettings()}
        
        <div className="profile-edit">
          <h4>编辑身份信息</h4>
          
          <div className="form-group">
            <label>身份名称 *</label>
            <input
              type="text"
              value={identityName}
              onChange={(e) => setIdentityName(e.target.value)}
              placeholder="输入您的身份名称"
              required
            />
          </div>
          
          <div className="form-group">
            <label>身份描述</label>
            <textarea
              value={identityDescription}
              onChange={(e) => setIdentityDescription(e.target.value)}
              placeholder="简要描述您的身份（可选）"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>头像图片URL</label>
            <input
              type="text"
              value={identityImage}
              onChange={(e) => setIdentityImage(e.target.value)}
              placeholder="输入头像图片URL（可选）"
            />
          </div>
          
          {updateError && (
            <div className="error-message">{updateError}</div>
          )}
          
          <button
            className="update-button"
            onClick={updateIdentity}
            disabled={isUpdating || !identityName}
          >
            {isUpdating ? '更新中...' : '更新身份'}
          </button>
        </div>
        
        {renderVerificationStatus()}
      </div>
    );
  };
  
  // 渲染隐私设置
  const renderPrivacySettings = () => {
    return (
      <div className="privacy-settings">
        <h4>隐私设置</h4>
        <p>控制您的身份信息对外展示的内容</p>
        
        <div className="privacy-options">
          <div className="privacy-option">
            <label>
              <input
                type="checkbox"
                checked={privacySettings.showName}
                onChange={(e) => updatePrivacySettings('showName', e.target.checked)}
              />
              显示姓名
            </label>
          </div>
          
          <div className="privacy-option">
            <label>
              <input
                type="checkbox"
                checked={privacySettings.showDescription}
                onChange={(e) => updatePrivacySettings('showDescription', e.target.checked)}
              />
              显示描述
            </label>
          </div>
          
          <div className="privacy-option">
            <label>
              <input
                type="checkbox"
                checked={privacySettings.showImage}
                onChange={(e) => updatePrivacySettings('showImage', e.target.checked)}
              />
              显示头像
            </label>
          </div>
          
          <div className="privacy-option">
            <label>
              <input
                type="checkbox"
                checked={privacySettings.showCredentials}
                onChange={(e) => updatePrivacySettings('showCredentials', e.target.checked)}
              />
              显示凭证
            </label>
          </div>
          
          <div className="privacy-option">
            <label>
              <input
                type="checkbox"
                checked={privacySettings.showIssuers}
                onChange={(e) => updatePrivacySettings('showIssuers', e.target.checked)}
              />
              显示发行方
            </label>
          </div>
        </div>
        
        <div className="privacy-note">
          <p>注意：隐私设置仅控制前端显示，链上数据仍然可见。</p>
        </div>
      </div>
    );
  };
  
  // 渲染社交恢复设置
  const renderRecoverySettings = () => {
    return (
      <div className="recovery-settings">
        <h4>社交恢复设置</h4>
        <p>添加可信任的地址，用于在您丢失私钥时恢复身份</p>
        
        <div className="recovery-addresses">
          <h5>当前恢复地址</h5>
          
          {recoveryAddresses.length === 0 ? (
            <p>暂无恢复地址</p>
          ) : (
            <ul className="address-list">
              {recoveryAddresses.map((address, index) => (
                <li key={index} className="address-item">
                  <span className="address">{formatAddress(address)}</span>
                  <button
                    className="remove-address"
                    onClick={() => removeRecoveryAddress(address)}
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="add-recovery">
          <h5>添加恢复地址</h5>
          
          <div className="form-group">
            <input
              type="text"
              value={newRecoveryAddress}
              onChange={(e) => setNewRecoveryAddress(e.target.value)}
              placeholder="输入以太坊地址"
            />
            <button
              className="add-button"
              onClick={addRecoveryAddress}
              disabled={!newRecoveryAddress}
            >
              添加
            </button>
          </div>
          
          {recoveryError && (
            <div className="error-message">{recoveryError}</div>
          )}
        </div>
        
        <div className="recovery-note">
          <p>注意：至少需要3个恢复地址才能启用社交恢复功能。</p>
        </div>
      </div>
    );
  };
  
  // 渲染验证状态
  const renderVerificationStatus = () => {
    return (
      <div className="verification-status">
        <h4>身份验证状态</h4>
        
        <div className="verification-items">
          {Object.entries(verificationStatus).map(([key, value]) => (
            <div 
              key={key} 
              className={`verification-item ${value.status}`}
              onClick={() => {
                setSelectedVerification({ key, ...value });
                setShowVerificationDetails(true);
              }}
            >
              <div className="verification-type">
                {key === 'email' ? '电子邮箱' : key === 'phone' ? '手机号码' : 'KYC验证'}
              </div>
              <div className="verification-info">
                <span className={`status-badge ${value.status}`}>
                  {value.status === 'verified' ? '已验证' : value.status === 'pending' ? '待验证' : '未验证'}
                </span>
                {value.status === 'verified' && value.expiresAt && (
                  <span className="expiry">
                    {new Date(value.expiresAt).toLocaleDateString()} 到期
                  </span>
                )}
              </div>
            </div>
          ))}
          
          <div className="add-verification">
            <button className="add-verification-button">
              添加新验证
            </button>
          </div>
        </div>
        
        {showVerificationDetails && selectedVerification && (
          <div className="verification-details-modal">
            <div className="verification-details">
              <div className="details-header">
                <h4>验证详情</h4>
                <button 
                  className="close-button"
                  onClick={() => setShowVerificationDetails(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="details-content">
                <div className="detail-item">
                  <span className="detail-label">类型:</span>
                  <span className="detail-value">
                    {selectedVerification.key === 'email' ? '电子邮箱' : 
                     selectedVerification.key === 'phone' ? '手机号码' : 'KYC验证'}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">状态:</span>
                  <span className={`detail-value status-${selectedVerification.status}`}>
                    {selectedVerification.status === 'verified' ? '已验证' : 
                     selectedVerification.status === 'pending' ? '待验证' : '未验证'}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">验证方:</span>
                  <span className="detail-value">{selectedVerification.verifier}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">验证时间:</span>
                  <span className="detail-value">
                    {new Date(selectedVerification.timestamp).toLocaleString()}
                  </span>
                </div>
                
                {selectedVerification.expiresAt && (
                  <div className="detail-item">
                    <span className="detail-label">到期时间:</span>
                    <span className="detail-value">
                      {new Date(selectedVerification.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {selectedVerification.value && (
                  <div className="detail-item">
                    <span className="detail-label">验证值:</span>
                    <span className="detail-value">{selectedVerification.value}</span>
                  </div>
                )}
                
                {selectedVerification.level !== undefined && (
                  <div className="detail-item">
                    <span className="detail-label">验证级别:</span>
                    <span className="detail-value">Level {selectedVerification.level}</span>
                  </div>
                )}
              </div>
              
              <div className="details-actions">
                {selectedVerification.status === 'pending' && (
                  <button className="verify-button">
                    完成验证
                  </button>
                )}
                
                {selectedVerification.status === 'verified' && (
                  <button className="renew-button">
                    更新验证
                  </button>
                )}
                
                <button className="delete-button">
                  删除验证
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染凭证表单
  const renderCredentialForm = () => {
    return (
      <div className="credential-form">
        <h4>添加新凭证</h4>
        
        <div className="form-group">
          <label>凭证类型 *</label>
          <input
            type="text"
            value={credentialType}
            onChange={(e) => setCredentialType(e.target.value)}
            placeholder="例如：教育证书、语言能力、文化技能"
            required
          />
        </div>
        
        <div className="form-group">
          <label>发行方 *</label>
          <input
            type="text"
            value={credentialIssuer}
            onChange={(e) => setCredentialIssuer(e.target.value)}
            placeholder="例如：大学、机构、组织名称"
            required
          />
        </div>
        
        <div className="form-group">
          <label>凭证哈希</label>
          <input
            type="text"
            value={credentialHash}
            onChange={(e) => setCredentialHash(e.target.value)}
            placeholder="凭证内容的哈希值（可选）"
          />
        </div>
        
        <div className="form-group">
          <label>凭证URI</label>
          <input
            type="text"
            value={credentialURI}
            onChange={(e) => setCredentialURI(e.target.value)}
            placeholder="指向凭证详情的URI（可选）"
          />
        </div>
        
        {credentialError && (
          <div className="error-message">{credentialError}</div>
        )}
        
        <div className="form-actions">
          <button
            className="cancel-button"
            onClick={() => {
              setShowCredentialForm(false);
              setCredentialType('');
              setCredentialIssuer('');
              setCredentialHash('');
              setCredentialURI('');
              setCredentialError(null);
            }}
          >
            取消
          </button>
          
          <button
            className="add-button"
            onClick={addCredential}
            disabled={isAddingCredential || !credentialType || !credentialIssuer}
          >
            {isAddingCredential ? '添加中...' : '添加凭证'}
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染凭证列表
  const renderCredentialsList = () => {
    if (!privacySettings.showCredentials) {
      return (
        <div className="credentials-hidden">
          <p>凭证已设为私密，仅您可见</p>
        </div>
      );
    }
    
    return (
      <div className="credentials-list">
        {credentials.length === 0 ? (
          <div className="no-credentials">
            <p>暂无凭证</p>
          </div>
        ) : (
          credentials.map(credential => (
            <div key={credential.id} className="credential-item">
              <div className="credential-header">
                <h4 className="credential-type">{credential.type}</h4>
                {credential.verified && (
                  <span className="credential-verified">已验证</span>
                )}
              </div>
              
              {privacySettings.showIssuers && (
                <div className="credential-issuer">
                  发行方: {credential.issuer}
                </div>
              )}
              
              <div className="credential-date">
                发行于: {formatDate(credential.issuedAt)}
              </div>
              
              {credential.uri && (
                <div className="credential-uri">
                  <a href={credential.uri} target="_blank" rel="noopener noreferrer">
                    查看凭证详情
                  </a>
                </div>
              )}
              
              <div className="credential-actions">
                {!credential.verified && (
                  <button
                    className="verify-button"
                    onClick={() => verifyCredential(credential.id)}
                  >
                    验证
                  </button>
                )}
                
                <button
                  className="revoke-button"
                  onClick={() => revokeCredential(credential.id)}
                >
                  吊销
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };
  
  // 渲染可验证凭证展示
  const renderVerifiableCredentials = () => {
    // 模拟可验证凭证数据
    const vcData = [
      {
        id: '1',
        type: 'EducationCredential',
        issuer: '北京大学',
        issuanceDate: new Date(2022, 5, 15),
        expirationDate: new Date(2032, 5, 15),
        subject: {
          id: account,
          degree: '计算机科学学士',
          graduationYear: '2022'
        },
        proof: {
          type: 'EcdsaSecp256k1Signature2019',
          created: new Date(2022, 5, 15),
          verificationMethod: 'did:ethr:0x123...abc#keys-1',
          proofPurpose: 'assertionMethod',
          jws: 'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..'
        }
      },
      {
        id: '2',
        type: 'LanguageProficiencyCredential',
        issuer: '文化桥语言评估中心',
        issuanceDate: new Date(2023, 2, 10),
        expirationDate: new Date(2026, 2, 10),
        subject: {
          id: account,
          language: '英语',
          level: 'C1',
          skills: {
            speaking: 'Proficient',
            writing: 'Advanced',
            reading: 'Proficient',
            listening: 'Advanced'
          }
        },
        proof: {
          type: 'EcdsaSecp256k1Signature2019',
          created: new Date(2023, 2, 10),
          verificationMethod: 'did:ethr:0x456...def#keys-1',
          proofPurpose: 'assertionMethod',
          jws: 'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..'
        }
      }
    ];
    
    return (
      <div className="verifiable-credentials">
        <h4>可验证凭证</h4>
        <p>符合W3C标准的可验证凭证，可用于跨平台身份验证</p>
        
        <div className="vc-list">
          {vcData.map(vc => (
            <div key={vc.id} className="vc-item">
              <div className="vc-header">
                <h5>{vc.type}</h5>
                <span className="vc-issuer">由 {vc.issuer} 颁发</span>
              </div>
              
              <div className="vc-dates">
                <div className="vc-date">
                  <span className="date-label">颁发日期:</span>
                  <span className="date-value">{vc.issuanceDate.toLocaleDateString()}</span>
                </div>
                <div className="vc-date">
                  <span className="date-label">到期日期:</span>
                  <span className="date-value">{vc.expirationDate.toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="vc-subject">
                {Object.entries(vc.subject).map(([key, value]) => {
                  if (key === 'id') return null;
                  
                  if (typeof value === 'object') {
                    return (
                      <div key={key} className="vc-subject-group">
                        <h6>{key}:</h6>
                        {Object.entries(value).map(([subKey, subValue]) => (
                          <div key={subKey} className="vc-subject-item">
                            <span className="subject-label">{subKey}:</span>
                            <span className="subject-value">{subValue}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  
                  return (
                    <div key={key} className="vc-subject-item">
                      <span className="subject-label">{key}:</span>
                      <span className="subject-value">{value}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="vc-actions">
                <button className="verify-vc-button">
                  验证凭证
                </button>
                <button className="share-vc-button">
                  分享凭证
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="vc-import">
          <button className="import-vc-button">
            导入凭证
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染组件
  return (
    <div className="did-manager">
      <div className="did-header">
        <h2>去中心化身份管理</h2>
        <p>创建和管理您的区块链身份和凭证</p>
      </div>
      
      {!active ? (
        <div className="connect-wallet-message">
          <p>请连接您的钱包以管理身份</p>
        </div>
      ) : !hasIdentity ? (
        renderIdentityCreationForm()
      ) : (
        <div className="did-content">
          <div className="did-tabs">
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              身份信息
            </button>
            <button
              className={`tab-button ${activeTab === 'credentials' ? 'active' : ''}`}
              onClick={() => setActiveTab('credentials')}
            >
              凭证管理
            </button>
          </div>
          
          <div className="did-tab-content">
            {activeTab === 'profile' ? (
              renderIdentityProfile()
            ) : (
              <div className="credentials-management">
                <div className="credentials-header">
                  <h3>凭证管理</h3>
                  <button
                    className="add-credential-button"
                    onClick={() => setShowCredentialForm(true)}
                  >
                    添加凭证
                  </button>
                </div>
                
                {showCredentialForm ? (
                  renderCredentialForm()
                ) : (
                  <>
                    {renderCredentialsList()}
                    {renderVerifiableCredentials()}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DIDManager;
