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
        } else {
          setHasIdentity(false);
          setIdentity(null);
          setCredentials([]);
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
        uri: cred.uri
      }));
      
      setCredentials(formattedCredentials);
    } catch (err) {
      console.error('加载凭证失败:', err);
      setCredentials([]);
    }
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
  
  // 格式化日期
  const formatDate = (date) => {
    if (!date) return '';
    
    return date.toLocaleString();
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
            {identity.imageURI ? (
              <img src={identity.imageURI} alt={identity.name} />
            ) : (
              <div className="placeholder-image">
                {identity.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h3>{identity.name}</h3>
            <p className="profile-description">{identity.description || '暂无描述'}</p>
            <div className="profile-meta">
              <span className="profile-id">ID: {identity.id}</span>
              <span className="profile-created">创建于: {formatDate(identity.createdAt)}</span>
              {identity.verified && (
                <span className="profile-verified">已验证</span>
              )}
            </div>
          </div>
        </div>
        
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
    if (credentials.length === 0) {
      return (
        <div className="credentials-empty">
          <p>暂无凭证记录</p>
        </div>
      );
    }
    
    return (
      <div className="credentials-list">
        {credentials.map((credential) => (
          <div 
            key={credential.id} 
            className={`credential-item ${selectedCredential === credential.id ? 'selected' : ''}`}
            onClick={() => setSelectedCredential(selectedCredential === credential.id ? null : credential.id)}
          >
            <div className="credential-header">
              <div className="credential-type">{credential.type}</div>
              {credential.verified ? (
                <div className="credential-verified">已验证</div>
              ) : (
                <div className="credential-unverified">未验证</div>
              )}
            </div>
            
            <div className="credential-body">
              <div className="credential-issuer">
                <span className="label">发行方:</span>
                <span className="value">{credential.issuer}</span>
              </div>
              
              <div className="credential-issued-at">
                <span className="label">发行时间:</span>
                <span className="value">{formatDate(credential.issuedAt)}</span>
              </div>
              
              {selectedCredential === credential.id && (
                <>
                  {credential.hash && (
                    <div className="credential-hash">
                      <span className="label">哈希:</span>
                      <span className="value">{credential.hash}</span>
                    </div>
                  )}
                  
                  {credential.uri && (
                    <div className="credential-uri">
                      <span className="label">URI:</span>
                      <a 
                        href={credential.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="value"
                      >
                        {credential.uri}
                      </a>
                    </div>
                  )}
                  
                  <div className="credential-actions">
                    {!credential.verified && (
                      <button
                        className="verify-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          verifyCredential(credential.id);
                        }}
                      >
                        验证
                      </button>
                    )}
                    
                    <button
                      className="revoke-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        revokeCredential(credential.id);
                      }}
                    >
                      吊销
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染凭证管理
  const renderCredentialsManagement = () => {
    return (
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
        
        {showCredentialForm ? renderCredentialForm() : renderCredentialsList()}
      </div>
    );
  };
  
  // 渲染未连接钱包状态
  const renderNotConnected = () => {
    return (
      <div className="not-connected">
        <h3>请连接钱包</h3>
        <p>您需要连接以太坊钱包才能管理您的去中心化身份。</p>
      </div>
    );
  };
  
  return (
    <div className="did-manager">
      <div className="did-header">
        <h2>去中心化身份管理</h2>
        <p>安全地创建和管理您的区块链身份和凭证</p>
      </div>
      
      {!active ? (
        renderNotConnected()
      ) : (
        <>
          {!hasIdentity ? (
            renderIdentityCreationForm()
          ) : (
            <>
              <div className="did-tabs">
                <div 
                  className={`did-tab ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  身份信息
                </div>
                <div 
                  className={`did-tab ${activeTab === 'credentials' ? 'active' : ''}`}
                  onClick={() => setActiveTab('credentials')}
                >
                  凭证管理
                </div>
              </div>
              
              <div className="did-content">
                {activeTab === 'profile' ? renderIdentityProfile() : renderCredentialsManagement()}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DIDManager;
