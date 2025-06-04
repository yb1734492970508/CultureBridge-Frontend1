import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { useIdentity } from '../../context/identity/IdentityContext';
import '../../styles/identity.css';

// 懒加载组件
const CredentialGallery = lazy(() => import('./CredentialGallery'));

// 骨架屏组件
const IdentityVerifierSkeleton = () => (
  <div className="identity-container">
    <div className="identity-header-skeleton">
      <div className="skeleton-title"></div>
      <div className="skeleton-subtitle"></div>
    </div>
    <div className="identity-content-skeleton">
      <div className="skeleton-card">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-info">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
      <div className="skeleton-verification">
        <div className="skeleton-section-title"></div>
        <div className="skeleton-steps">
          <div className="skeleton-step"></div>
          <div className="skeleton-step"></div>
          <div className="skeleton-step"></div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * 身份验证组件
 * 提供用户身份验证、声誉查看和凭证管理功能
 * 
 * @component
 * @version 2.0.0
 */
const IdentityVerifier = () => {
  const navigate = useNavigate();
  const { account, active, chainId } = useBlockchain();
  const { 
    userIdentity, 
    userReputation, 
    userCredentials,
    isLoading,
    error,
    verifyIdentity,
    checkIdentityStatus,
    getReputationScore,
    getUserCredentials
  } = useIdentity();
  
  // 本地状态
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationData, setVerificationData] = useState({
    name: '',
    email: '',
    proofType: 'document',
    proofFile: null,
    agreeTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [notification, setNotification] = useState(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  // 加载用户身份数据
  useEffect(() => {
    let isMounted = true;
    
    const loadIdentityData = async () => {
      if (!active || !account) return;
      
      try {
        // 检查身份状态
        await checkIdentityStatus(account);
        
        // 如果用户已有身份，获取声誉分数
        if (userIdentity && userIdentity.verified) {
          await getReputationScore(account);
          await getUserCredentials(account);
        }
      } catch (error) {
        console.error('加载身份数据失败:', error);
        if (isMounted) {
          showNotification('加载身份数据失败，请刷新页面重试', 'error');
        }
      }
    };
    
    loadIdentityData();
    
    return () => {
      isMounted = false;
    };
  }, [active, account, checkIdentityStatus, getReputationScore, getUserCredentials, userIdentity]);
  
  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setVerificationData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'file') {
      setVerificationData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setVerificationData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // 处理验证步骤
  const handleNextStep = () => {
    if (verificationStep < 3) {
      setVerificationStep(prev => prev + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (verificationStep > 0) {
      setVerificationStep(prev => prev - 1);
    }
  };
  
  // 处理身份验证提交
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    
    if (!active) {
      showNotification('请先连接钱包', 'warning');
      return;
    }
    
    // 表单验证
    if (!verificationData.name || !verificationData.email || !verificationData.proofFile || !verificationData.agreeTerms) {
      showNotification('请填写所有必填字段并同意条款', 'warning');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setVerificationProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      // 提交身份验证
      const result = await verifyIdentity({
        address: account,
        name: verificationData.name,
        email: verificationData.email,
        proofType: verificationData.proofType,
        proofFile: verificationData.proofFile
      });
      
      clearInterval(progressInterval);
      setVerificationProgress(100);
      
      if (result.success) {
        showNotification('身份验证申请已提交，等待审核', 'success');
        setTimeout(() => {
          setVerificationStep(3); // 移动到完成步骤
        }, 1000);
      } else {
        showNotification(`身份验证失败: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('身份验证失败:', error);
      showNotification('身份验证过程中发生错误', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 显示通知
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    // 5秒后自动关闭
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  // 使用useMemo缓存声誉等级计算
  const reputationLevel = useMemo(() => {
    if (!userReputation) return { level: 0, title: '未知', nextLevel: 0 };
    
    const score = userReputation.score;
    
    if (score < 100) {
      return { 
        level: 1, 
        title: '新手', 
        nextLevel: 100,
        progress: score / 100 * 100
      };
    } else if (score < 300) {
      return { 
        level: 2, 
        title: '贡献者', 
        nextLevel: 300,
        progress: (score - 100) / 200 * 100
      };
    } else if (score < 600) {
      return { 
        level: 3, 
        title: '专家', 
        nextLevel: 600,
        progress: (score - 300) / 300 * 100
      };
    } else if (score < 1000) {
      return { 
        level: 4, 
        title: '大师', 
        nextLevel: 1000,
        progress: (score - 600) / 400 * 100
      };
    } else {
      return { 
        level: 5, 
        title: '传奇', 
        nextLevel: null,
        progress: 100
      };
    }
  }, [userReputation]);
  
  // 渲染加载状态
  if (isLoading && !userIdentity) {
    return <IdentityVerifierSkeleton />;
  }
  
  return (
    <div className="identity-container">
      <div className="identity-header">
        <h1>身份与声誉系统</h1>
        <p className="subtitle">验证您的身份，建立声誉，获取专属凭证</p>
      </div>
      
      {/* 错误消息 */}
      {error && (
        <div className="error-message" role="alert">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={() => navigate(0)} className="refresh-btn">刷新</button>
        </div>
      )}
      
      {/* 通知消息 */}
      {notification && (
        <div className={`notification ${notification.type}`} role="status">
          <p>{notification.message}</p>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}
      
      {/* 未连接钱包提示 */}
      {!active && (
        <div className="wallet-warning" role="alert">
          <div className="warning-icon">🔒</div>
          <div className="warning-content">
            <h3>请先连接钱包</h3>
            <p>您需要连接钱包以访问身份验证和声誉系统</p>
          </div>
          <button 
            onClick={() => navigate('/wallet')} 
            className="connect-wallet-btn"
            aria-label="连接钱包"
          >
            连接钱包
          </button>
        </div>
      )}
      
      {/* 已验证身份展示 */}
      {active && userIdentity && userIdentity.verified && (
        <div className="identity-verified-section">
          <div className="identity-card">
            <div className="identity-avatar">
              <img 
                src={userIdentity.avatar || `https://avatars.dicebear.com/api/identicon/${account}.svg`} 
                alt="用户头像" 
              />
              <div className="verified-badge" title="已验证身份">✓</div>
            </div>
            
            <div className="identity-info">
              <h2>{userIdentity.name}</h2>
              <p className="identity-address" title={account}>{account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
              <p className="identity-since">身份验证时间: {new Date(userIdentity.verifiedAt).toLocaleDateString()}</p>
              
              <div className="identity-actions">
                <button 
                  className="view-credentials-btn"
                  onClick={() => setShowCredentials(!showCredentials)}
                  aria-expanded={showCredentials}
                >
                  {showCredentials ? '隐藏凭证' : '查看凭证'}
                </button>
                <button 
                  className="edit-profile-btn"
                  onClick={() => navigate('/profile')}
                >
                  编辑资料
                </button>
              </div>
            </div>
          </div>
          
          {/* 声誉展示 */}
          {userReputation && (
            <div className="reputation-section">
              <h3>文化声誉</h3>
              
              <div className="reputation-card">
                <div className="reputation-header">
                  <div className="reputation-score">
                    <span className="score-value">{userReputation.score}</span>
                    <span className="score-label">声誉分</span>
                  </div>
                  
                  <div className="reputation-level">
                    <span className="level-badge">Lv.{reputationLevel.level}</span>
                    <span className="level-title">{reputationLevel.title}</span>
                  </div>
                </div>
                
                <div className="reputation-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${reputationLevel.progress}%` }}
                      role="progressbar"
                      aria-valuenow={reputationLevel.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  
                  <div className="progress-info">
                    {reputationLevel.nextLevel ? (
                      <span>距离下一级还需 {reputationLevel.nextLevel - userReputation.score} 分</span>
                    ) : (
                      <span>已达到最高等级</span>
                    )}
                  </div>
                </div>
                
                <div className="reputation-stats">
                  <div className="stat-item">
                    <span className="stat-value">{userReputation.contributions || 0}</span>
                    <span className="stat-label">贡献</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{userReputation.participations || 0}</span>
                    <span className="stat-label">参与</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{userReputation.creations || 0}</span>
                    <span className="stat-label">创作</span>
                  </div>
                </div>
                
                <div className="reputation-actions">
                  <button 
                    className="view-history-btn"
                    onClick={() => navigate('/reputation-history')}
                  >
                    查看历史记录
                  </button>
                  <button 
                    className="view-leaderboard-btn"
                    onClick={() => navigate('/reputation-leaderboard')}
                  >
                    查看排行榜
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* 凭证展示 */}
          {showCredentials && (
            <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div></div>}>
              <CredentialGallery 
                credentials={userCredentials || []} 
                address={account}
              />
            </Suspense>
          )}
        </div>
      )}
      
      {/* 身份验证流程 */}
      {active && (!userIdentity || !userIdentity.verified) && (
        <div className="identity-verification-section">
          <div className="verification-header">
            <h2>身份验证</h2>
            <p>完成身份验证以解锁平台全部功能并开始建立您的声誉</p>
          </div>
          
          <div className="verification-steps">
            <div className="steps-indicator">
              {[0, 1, 2, 3].map((step) => (
                <div 
                  key={step} 
                  className={`step-indicator ${verificationStep >= step ? 'active' : ''} ${verificationStep === step ? 'current' : ''}`}
                >
                  <div className="step-number">{step + 1}</div>
                  <div className="step-label">
                    {step === 0 && '基本信息'}
                    {step === 1 && '身份证明'}
                    {step === 2 && '确认提交'}
                    {step === 3 && '完成'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="verification-form-container">
              <form onSubmit={handleSubmitVerification} className="verification-form">
                {/* 步骤1: 基本信息 */}
                {verificationStep === 0 && (
                  <div className="verification-step">
                    <h3>基本信息</h3>
                    
                    <div className="form-group">
                      <label htmlFor="name">姓名 <span className="required">*</span></label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={verificationData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="请输入您的真实姓名"
                        aria-required="true"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">电子邮箱 <span className="required">*</span></label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={verificationData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="请输入您的电子邮箱"
                        aria-required="true"
                      />
                      <p className="form-hint">我们将通过此邮箱与您联系验证结果</p>
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="next-btn"
                        onClick={handleNextStep}
                        disabled={!verificationData.name || !verificationData.email}
                      >
                        下一步
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 步骤2: 身份证明 */}
                {verificationStep === 1 && (
                  <div className="verification-step">
                    <h3>身份证明</h3>
                    
                    <div className="form-group">
                      <label htmlFor="proofType">证明类型</label>
                      <select
                        id="proofType"
                        name="proofType"
                        value={verificationData.proofType}
                        onChange={handleInputChange}
                      >
                        <option value="document">身份证件</option>
                        <option value="passport">护照</option>
                        <option value="license">驾驶证</option>
                        <option value="other">其他证件</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="proofFile">上传证件 <span className="required">*</span></label>
                      <div className="file-upload">
                        <input
                          type="file"
                          id="proofFile"
                          name="proofFile"
                          onChange={handleInputChange}
                          accept="image/jpeg,image/png,application/pdf"
                          required
                          aria-required="true"
                        />
                        <div className="file-upload-label">
                          {verificationData.proofFile ? (
                            <span className="file-name">{verificationData.proofFile.name}</span>
                          ) : (
                            <>
                              <span className="upload-icon">📎</span>
                              <span>点击或拖拽文件至此处</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="form-hint">支持JPG、PNG或PDF格式，文件大小不超过5MB</p>
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="back-btn"
                        onClick={handlePrevStep}
                      >
                        上一步
                      </button>
                      <button
                        type="button"
                        className="next-btn"
                        onClick={handleNextStep}
                        disabled={!verificationData.proofFile}
                      >
                        下一步
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 步骤3: 确认提交 */}
                {verificationStep === 2 && (
                  <div className="verification-step">
                    <h3>确认提交</h3>
                    
                    <div className="verification-summary">
                      <div className="summary-item">
                        <span className="summary-label">姓名:</span>
                        <span className="summary-value">{verificationData.name}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">电子邮箱:</span>
                        <span className="summary-value">{verificationData.email}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">证明类型:</span>
                        <span className="summary-value">{verificationData.proofType}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">上传文件:</span>
                        <span className="summary-value">{verificationData.proofFile?.name}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">钱包地址:</span>
                        <span className="summary-value">{account}</span>
                      </div>
                    </div>
                    
                    <div className="form-group checkbox-group">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={verificationData.agreeTerms}
                        onChange={handleInputChange}
                        required
                        aria-required="true"
                      />
                      <label htmlFor="agreeTerms">
                        我同意平台的<a href="/terms" target="_blank" rel="noopener noreferrer">服务条款</a>和<a href="/privacy" target="_blank" rel="noopener noreferrer">隐私政策</a>，并确认所提供的信息真实有效
                      </label>
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="back-btn"
                        onClick={handlePrevStep}
                        disabled={isSubmitting}
                      >
                        上一步
                      </button>
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting || !verificationData.agreeTerms}
                      >
                        {isSubmitting ? '提交中...' : '提交验证'}
                      </button>
                    </div>
                    
                    {isSubmitting && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${verificationProgress}%` }}
                            role="progressbar"
                            aria-valuenow={verificationProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <div className="progress-percentage">{verificationProgress}%</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 步骤4: 完成 */}
                {verificationStep === 3 && (
                  <div className="verification-step">
                    <div className="verification-complete">
                      <div className="complete-icon">✓</div>
                      <h3>验证申请已提交</h3>
                      <p>我们已收到您的身份验证申请，正在进行审核。审核结果将通过邮件通知您，请留意邮箱。</p>
                      <p className="verification-time">预计审核时间: 1-3个工作日</p>
                      
                      <button
                        type="button"
                        className="return-btn"
                        onClick={() => navigate('/')}
                      >
                        返回首页
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
          
          <div className="verification-benefits">
            <h3>身份验证的好处</h3>
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">🔒</div>
                <h4>增强安全性</h4>
                <p>验证身份可以保护您的账户安全，防止未授权访问</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🏆</div>
                <h4>建立声誉</h4>
                <p>开始积累您的文化声誉分数，解锁更多平台特权</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🎭</div>
                <h4>获取凭证</h4>
                <p>获得独特的身份凭证NFT，展示您的文化成就</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🗳️</div>
                <h4>参与治理</h4>
                <p>获得投票权，参与平台重要决策的制定</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentityVerifier;
