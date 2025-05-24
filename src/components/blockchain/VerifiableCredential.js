import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './VerifiableCredential.css';

/**
 * 可验证凭证组件
 * 用于展示和验证DID身份凭证
 */
const VerifiableCredential = ({ credential, onVerify, onRevoke }) => {
  const { account, provider, isConnected } = useBlockchain();
  
  // 凭证状态
  const [isExpanded, setIsExpanded] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [credentialDetails, setCredentialDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 初始化凭证详情
  useEffect(() => {
    if (credential && credential.id) {
      fetchCredentialDetails();
    }
  }, [credential]);
  
  // 获取凭证详情
  const fetchCredentialDetails = async () => {
    if (!credential) return;
    
    setIsLoading(true);
    
    try {
      // 模拟从区块链或IPFS获取详细数据
      // 实际应用中应调用相应的API或智能合约
      setTimeout(() => {
        const details = {
          ...credential,
          metadata: {
            schema: "https://schema.org/EducationalCredential",
            version: "1.0.0",
            revocable: true,
            transferable: false
          },
          evidence: [
            {
              id: `evidence-${credential.id}-1`,
              type: "DocumentVerification",
              verifier: "CultureBridge验证服务",
              evidenceDocument: "身份证明文件",
              subjectPresence: "Physical",
              documentPresence: "Physical",
              verificationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          termsOfUse: [
            {
              type: "IssuerPolicy",
              id: "https://culturebridge.example/policies/credential/4",
              prohibition: [
                {
                  assigner: credential.issuer,
                  assignee: "AllVerifiers",
                  target: credential.id,
                  action: ["Archival"]
                }
              ]
            }
          ],
          refreshService: {
            id: `https://culturebridge.example/refresh/${credential.id}`,
            type: "CredentialRefreshService"
          }
        };
        
        setCredentialDetails(details);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取凭证详情失败:', error);
      setIsLoading(false);
    }
  };
  
  // 验证凭证
  const verifyCredential = async () => {
    if (!isConnected || !provider || !credential) return;
    
    setIsVerifying(true);
    setVerifyError(null);
    
    try {
      // 在实际应用中，这里应该调用验证服务或智能合约验证凭证
      // 这里我们模拟验证过程
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 验证步骤
      const verificationSteps = [
        { name: "验证签名", status: "success", details: "发行方签名有效" },
        { name: "验证结构", status: "success", details: "凭证结构符合W3C标准" },
        { name: "检查吊销状态", status: "success", details: "凭证未被吊销" },
        { name: "验证有效期", status: "success", details: "凭证在有效期内" },
        { name: "验证发行方", status: "success", details: "发行方身份已确认" }
      ];
      
      // 随机验证结果，实际应用中应该是确定性的
      const isValid = Math.random() > 0.2;
      
      if (!isValid) {
        // 随机选择一个失败步骤
        const failStep = Math.floor(Math.random() * verificationSteps.length);
        verificationSteps[failStep].status = "error";
        
        switch (failStep) {
          case 0:
            verificationSteps[failStep].details = "发行方签名无效";
            break;
          case 1:
            verificationSteps[failStep].details = "凭证结构不符合W3C标准";
            break;
          case 2:
            verificationSteps[failStep].details = "凭证已被吊销";
            break;
          case 3:
            verificationSteps[failStep].details = "凭证已过期";
            break;
          case 4:
            verificationSteps[failStep].details = "无法确认发行方身份";
            break;
        }
      }
      
      // 设置验证状态
      setVerificationStatus({
        isValid,
        timestamp: Date.now(),
        verifier: '文化桥验证服务',
        details: isValid 
          ? '凭证签名有效，内容未被篡改' 
          : '凭证验证失败，请查看详细信息',
        steps: verificationSteps
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
  
  // 分享凭证
  const shareCredential = (method) => {
    if (!credential) return;
    
    switch (method) {
      case 'qrcode':
        setShowQRCode(true);
        break;
      case 'email':
        window.open(`mailto:?subject=分享凭证：${credential.name}&body=我想与你分享我的凭证：${credential.name}%0A%0A凭证ID：${credential.id}%0A发行方：${credential.issuer}%0A发行日期：${formatDate(credential.issuedAt)}%0A%0A请访问以下链接查看详情：%0Ahttps://culturebridge.example/verify/${credential.id}`);
        break;
      case 'copy':
        const credentialUrl = `https://culturebridge.example/verify/${credential.id}`;
        navigator.clipboard.writeText(credentialUrl)
          .then(() => {
            alert('凭证链接已复制到剪贴板');
          })
          .catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
          });
        break;
      default:
        break;
    }
    
    setShowShareOptions(false);
  };
  
  // 导出凭证
  const exportCredential = (format) => {
    if (!credential) return;
    
    let exportData;
    let fileName;
    let dataType;
    
    switch (format) {
      case 'json':
        exportData = JSON.stringify(credentialDetails || credential, null, 2);
        fileName = `credential-${credential.id}.json`;
        dataType = 'application/json';
        break;
      case 'jsonld':
        // 转换为JSON-LD格式
        const jsonLdData = {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
          ],
          "id": credential.id,
          "type": ["VerifiableCredential", credential.type],
          "issuer": credential.issuer,
          "issuanceDate": new Date(credential.issuedAt).toISOString(),
          "credentialSubject": {
            "id": account,
            "name": credential.name,
            "description": credential.description
          },
          "proof": {
            "type": "Ed25519Signature2018",
            "created": new Date(credential.issuedAt).toISOString(),
            "proofPurpose": "assertionMethod",
            "verificationMethod": `did:example:${credential.issuer}#keys-1`,
            "jws": credential.hash || "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YtqjEYnFENT7fNW-COD0HAACxeuQxPKAmp4nIl8jYAu__6IH2FpSxv81w-l5PvE1og50tS9tH8WyXMlXyo45CA"
          }
        };
        exportData = JSON.stringify(jsonLdData, null, 2);
        fileName = `credential-${credential.id}.jsonld`;
        dataType = 'application/ld+json';
        break;
      case 'pdf':
        // 在实际应用中，这里应该生成PDF
        alert('PDF导出功能正在开发中');
        return;
      default:
        return;
    }
    
    // 创建下载链接
    const blob = new Blob([exportData], { type: dataType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // 格式化日期
  const formatDate = (timestamp) => {
    if (!timestamp) return '未知';
    
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
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
      case 'achievement':
      case '成就':
        return '🌟';
      case 'license':
      case '许可证':
        return '📋';
      case 'badge':
      case '徽章':
        return '🔰';
      case 'certification':
      case '认证':
        return '✅';
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
            <span className="detail-label">凭证名称:</span>
            <span className="detail-value">{credential.name}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">发行方:</span>
            <span className="detail-value">{credential.issuer}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">发行日期:</span>
            <span className="detail-value">{formatDate(credential.issuedAt)}</span>
          </div>
          
          {credential.expiresAt && (
            <div className="detail-row">
              <span className="detail-label">过期日期:</span>
              <span className="detail-value">{formatDate(credential.expiresAt)}</span>
            </div>
          )}
          
          {credential.description && (
            <div className="detail-row">
              <span className="detail-label">描述:</span>
              <span className="detail-value">{credential.description}</span>
            </div>
          )}
          
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
          
          {credentialDetails && credentialDetails.metadata && (
            <div className="detail-section">
              <h4 className="section-title">元数据</h4>
              <div className="detail-row">
                <span className="detail-label">Schema:</span>
                <span className="detail-value">{credentialDetails.metadata.schema}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">版本:</span>
                <span className="detail-value">{credentialDetails.metadata.version}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">可撤销:</span>
                <span className="detail-value">{credentialDetails.metadata.revocable ? '是' : '否'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">可转让:</span>
                <span className="detail-value">{credentialDetails.metadata.transferable ? '是' : '否'}</span>
              </div>
            </div>
          )}
          
          {credentialDetails && credentialDetails.evidence && credentialDetails.evidence.length > 0 && (
            <div className="detail-section">
              <h4 className="section-title">证明</h4>
              {credentialDetails.evidence.map((evidence, index) => (
                <div key={index} className="evidence-item">
                  <div className="detail-row">
                    <span className="detail-label">类型:</span>
                    <span className="detail-value">{evidence.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">验证者:</span>
                    <span className="detail-value">{evidence.verifier}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">验证日期:</span>
                    <span className="detail-value">{formatDate(evidence.verificationDate)}</span>
                  </div>
                </div>
              ))}
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
                <span className="detail-label">结果:</span>
                <span className="detail-value">{verificationStatus.details}</span>
              </div>
              
              {verificationStatus.steps && (
                <div className="verification-steps">
                  <h4>验证步骤</h4>
                  {verificationStatus.steps.map((step, index) => (
                    <div key={index} className={`verification-step ${step.status}`}>
                      <div className="step-header">
                        <span className="step-icon">
                          {step.status === 'success' ? '✓' : '✗'}
                        </span>
                        <span className="step-name">{step.name}</span>
                      </div>
                      <div className="step-details">{step.details}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {verifyError && (
          <div className="verification-error">
            {verifyError}
          </div>
        )}
        
        <div className="credential-actions">
          <div className="action-group">
            <button
              className="verify-button"
              onClick={verifyCredential}
              disabled={isVerifying}
            >
              {isVerifying ? '验证中...' : '验证凭证'}
            </button>
            
            <div className="dropdown">
              <button
                className="share-button"
                onClick={() => setShowShareOptions(!showShareOptions)}
              >
                分享
              </button>
              {showShareOptions && (
                <div className="dropdown-menu">
                  <button onClick={() => shareCredential('qrcode')}>
                    二维码分享
                  </button>
                  <button onClick={() => shareCredential('email')}>
                    邮件分享
                  </button>
                  <button onClick={() => shareCredential('copy')}>
                    复制链接
                  </button>
                </div>
              )}
            </div>
            
            <div className="dropdown">
              <button
                className="export-button"
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                导出
              </button>
              {showExportOptions && (
                <div className="dropdown-menu">
                  <button onClick={() => exportCredential('json')}>
                    JSON格式
                  </button>
                  <button onClick={() => exportCredential('jsonld')}>
                    JSON-LD格式
                  </button>
                  <button onClick={() => exportCredential('pdf')}>
                    PDF格式
                  </button>
                </div>
              )}
            </div>
          </div>
          
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
  
  // 渲染QR码模态框
  const renderQRCodeModal = () => {
    if (!showQRCode) return null;
    
    return (
      <div className="qrcode-modal-overlay">
        <div className="qrcode-modal">
          <div className="modal-header">
            <h3>凭证二维码</h3>
            <button 
              className="close-button"
              onClick={() => setShowQRCode(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <div className="qrcode-container">
              {/* 实际应用中应使用QR码生成库 */}
              <div className="qrcode-placeholder">
                <p>扫描此二维码查看凭证</p>
                <p className="qrcode-url">https://culturebridge.example/verify/{credential.id}</p>
              </div>
            </div>
            
            <div className="qrcode-info">
              <h4>{credential.name}</h4>
              <p>发行方: {credential.issuer}</p>
              <p>发行日期: {formatDate(credential.issuedAt)}</p>
            </div>
            
            <button 
              className="download-qrcode-button"
              onClick={() => {
                alert('二维码下载功能正在开发中');
                setShowQRCode(false);
              }}
            >
              下载二维码
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 状态变量
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  return (
    <div className={`verifiable-credential ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className="credential-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="credential-type">
          <span className="type-icon">{getCredentialTypeIcon(credential.type)}</span>
          <span className="type-name">{credential.name || credential.type}</span>
        </div>
        
        <div className="credential-status">
          {credential.verified && (
            <span className="verified-badge">已验证</span>
          )}
          
          {verificationStatus && (
            <span className={`verification-badge ${verificationStatus.isValid ? 'valid' : 'invalid'}`}>
              {verificationStatus.isValid ? '验证通过' : '验证失败'}
            </span>
          )}
          
          <span className="expand-icon">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="credential-loading">
          <div className="loading-spinner"></div>
          <p>加载凭证详情...</p>
        </div>
      ) : (
        renderCredentialContent()
      )}
      
      {renderQRCodeModal()}
    </div>
  );
};

/**
 * 可验证凭证管理组件
 * 用于管理和展示多个凭证
 */
export const VerifiableCredentialManager = () => {
  const { account, isConnected, connectWallet } = useBlockchain();
  
  // 组件状态
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState('json');
  const [importData, setImportData] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // 获取凭证列表
  useEffect(() => {
    if (isConnected && account) {
      fetchCredentials();
    }
  }, [isConnected, account]);
  
  // 获取凭证
  const fetchCredentials = async () => {
    setIsLoading(true);
    
    try {
      // 模拟从区块链或IPFS获取凭证
      // 实际应用中应调用相应的API或智能合约
      setTimeout(() => {
        const mockCredentials = [
          {
            id: 'cred-001',
            type: 'education',
            name: '北京大学学位证书',
            issuer: '北京大学',
            issuedAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
            expiresAt: null,
            description: '计算机科学与技术学士学位',
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            uri: 'https://example.com/credentials/1',
            verified: true
          },
          {
            id: 'cred-002',
            type: 'certificate',
            name: '中文教师资格证',
            issuer: '中国教育部',
            issuedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
            expiresAt: Date.now() + 730 * 24 * 60 * 60 * 1000,
            description: '高级中文教师资格认证',
            hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            uri: 'https://example.com/credentials/2',
            verified: true
          },
          {
            id: 'cred-003',
            type: 'cultural',
            name: '非物质文化遗产传承人证书',
            issuer: '中国文化和旅游部',
            issuedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
            expiresAt: null,
            description: '京剧艺术省级传承人认证',
            hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
            uri: 'https://example.com/credentials/3',
            verified: true
          },
          {
            id: 'cred-004',
            type: 'membership',
            name: '文化桥高级会员',
            issuer: 'CultureBridge DAO',
            issuedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
            expiresAt: Date.now() + 335 * 24 * 60 * 60 * 1000,
            description: '文化桥平台高级会员资格',
            hash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
            uri: 'https://example.com/credentials/4',
            verified: true
          },
          {
            id: 'cred-005',
            type: 'award',
            name: '跨文化交流贡献奖',
            issuer: '国际文化交流协会',
            issuedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
            expiresAt: null,
            description: '表彰在跨文化交流领域的突出贡献',
            hash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
            uri: 'https://example.com/credentials/5',
            verified: false
          }
        ];
        
        setCredentials(mockCredentials);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('获取凭证失败:', error);
      setIsLoading(false);
    }
  };
  
  // 验证凭证
  const handleVerify = (credentialId, isValid) => {
    // 更新凭证验证状态
    setCredentials(prevCredentials => 
      prevCredentials.map(cred => 
        cred.id === credentialId 
          ? { ...cred, verified: isValid } 
          : cred
      )
    );
  };
  
  // 吊销凭证
  const handleRevoke = (credentialId) => {
    if (window.confirm('确定要吊销此凭证吗？此操作不可逆。')) {
      setIsLoading(true);
      
      // 模拟吊销操作
      setTimeout(() => {
        setCredentials(prevCredentials => 
          prevCredentials.filter(cred => cred.id !== credentialId)
        );
        
        setIsLoading(false);
        alert('凭证已成功吊销');
      }, 1500);
    }
  };
  
  // 导入凭证
  const handleImport = () => {
    setImportError('');
    
    if (importType === 'json' && !importData.trim()) {
      setImportError('请输入有效的JSON数据');
      return;
    }
    
    if (importType === 'file' && !importFile) {
      setImportError('请选择要导入的文件');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 模拟导入操作
      setTimeout(() => {
        const newCredential = {
          id: `cred-${Math.floor(Math.random() * 1000)}`,
          type: 'certificate',
          name: '导入的凭证',
          issuer: '外部发行方',
          issuedAt: Date.now(),
          expiresAt: null,
          description: '通过导入功能添加的凭证',
          hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          uri: null,
          verified: false
        };
        
        setCredentials(prevCredentials => [...prevCredentials, newCredential]);
        
        setIsLoading(false);
        setShowImportModal(false);
        setImportData('');
        setImportFile(null);
        
        alert('凭证导入成功');
      }, 1500);
    } catch (error) {
      console.error('导入凭证失败:', error);
      setImportError('导入失败，请检查数据格式');
      setIsLoading(false);
    }
  };
  
  // 处理文件选择
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      
      // 读取文件内容
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          setImportData(content);
        } catch (error) {
          console.error('读取文件失败:', error);
          setImportError('无法读取文件内容');
        }
      };
      reader.readAsText(file);
    }
  };
  
  // 过滤凭证
  const filteredCredentials = credentials.filter(cred => {
    // 按标签过滤
    if (activeTab !== 'all' && cred.type !== activeTab) {
      return false;
    }
    
    // 按搜索词过滤
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        cred.name.toLowerCase().includes(searchLower) ||
        cred.issuer.toLowerCase().includes(searchLower) ||
        cred.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // 排序凭证
  const sortedCredentials = [...filteredCredentials].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = a.issuedAt - b.issuedAt;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'issuer':
        comparison = a.issuer.localeCompare(b.issuer);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // 渲染导入模态框
  const renderImportModal = () => {
    if (!showImportModal) return null;
    
    return (
      <div className="import-modal-overlay">
        <div className="import-modal">
          <div className="modal-header">
            <h3>导入凭证</h3>
            <button 
              className="close-button"
              onClick={() => setShowImportModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <div className="import-options">
              <div className="option-group">
                <label>
                  <input 
                    type="radio" 
                    name="importType" 
                    value="json" 
                    checked={importType === 'json'} 
                    onChange={() => setImportType('json')} 
                  />
                  JSON数据
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="importType" 
                    value="file" 
                    checked={importType === 'file'} 
                    onChange={() => setImportType('file')} 
                  />
                  文件导入
                </label>
              </div>
              
              {importType === 'json' ? (
                <div className="json-input">
                  <label htmlFor="jsonData">JSON凭证数据:</label>
                  <textarea 
                    id="jsonData"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="粘贴JSON格式的凭证数据..."
                    rows={10}
                  />
                </div>
              ) : (
                <div className="file-input">
                  <label htmlFor="credentialFile">选择凭证文件:</label>
                  <input 
                    type="file" 
                    id="credentialFile" 
                    accept=".json,.jsonld"
                    onChange={handleFileChange}
                  />
                  {importFile && (
                    <div className="file-info">
                      <p>文件名: {importFile.name}</p>
                      <p>大小: {(importFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  )}
                </div>
              )}
              
              {importError && (
                <div className="import-error">
                  {importError}
                </div>
              )}
              
              <div className="import-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowImportModal(false)}
                >
                  取消
                </button>
                <button 
                  className="import-button"
                  onClick={handleImport}
                  disabled={isLoading}
                >
                  {isLoading ? '导入中...' : '导入凭证'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染凭证类型标签
  const credentialTypes = [
    { id: 'all', label: '全部', icon: '🗂️' },
    { id: 'education', label: '教育', icon: '🎓' },
    { id: 'certificate', label: '证书', icon: '📜' },
    { id: 'cultural', label: '文化', icon: '🏛️' },
    { id: 'membership', label: '会员', icon: '🏅' },
    { id: 'award', label: '奖项', icon: '🏆' },
    { id: 'identity', label: '身份', icon: '🪪' },
    { id: 'skill', label: '技能', icon: '🛠️' }
  ];
  
  return (
    <div className="verifiable-credential-manager">
      <div className="manager-header">
        <h2>可验证凭证管理</h2>
        <p className="subtitle">管理和验证您的数字身份凭证</p>
      </div>
      
      {!isConnected ? (
        <div className="connect-wallet-prompt">
          <p>请连接钱包以访问您的凭证</p>
          <button className="connect-wallet-btn" onClick={connectWallet}>
            连接钱包
          </button>
        </div>
      ) : (
        <>
          <div className="manager-toolbar">
            <div className="search-bar">
              <input 
                type="text"
                placeholder="搜索凭证..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button">🔍</button>
            </div>
            
            <div className="sort-options">
              <label htmlFor="sortBy">排序:</label>
              <select 
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">日期</option>
                <option value="name">名称</option>
                <option value="issuer">发行方</option>
                <option value="type">类型</option>
              </select>
              
              <button 
                className="sort-order-button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? '升序' : '降序'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            
            <button 
              className="import-credential-button"
              onClick={() => setShowImportModal(true)}
            >
              导入凭证
            </button>
          </div>
          
          <div className="credential-type-tabs">
            {credentialTypes.map(type => (
              <button
                key={type.id}
                className={`type-tab ${activeTab === type.id ? 'active' : ''}`}
                onClick={() => setActiveTab(type.id)}
              >
                <span className="tab-icon">{type.icon}</span>
                <span className="tab-label">{type.label}</span>
              </button>
            ))}
          </div>
          
          <div className="credentials-list">
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>加载凭证中...</p>
              </div>
            ) : sortedCredentials.length > 0 ? (
              sortedCredentials.map(credential => (
                <VerifiableCredential
                  key={credential.id}
                  credential={credential}
                  onVerify={handleVerify}
                  onRevoke={handleRevoke}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>没有找到符合条件的凭证</p>
                {activeTab !== 'all' && (
                  <button 
                    className="show-all-button"
                    onClick={() => setActiveTab('all')}
                  >
                    显示全部凭证
                  </button>
                )}
              </div>
            )}
          </div>
          
          {renderImportModal()}
        </>
      )}
    </div>
  );
};

export default VerifiableCredential;
