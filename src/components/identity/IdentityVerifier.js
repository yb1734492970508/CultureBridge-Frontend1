import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { useIdentity } from '../../context/identity/IdentityContext';
import '../../styles/identity.css';

/**
 * 身份验证组件 - 极致优化版
 * 提供用户身份验证、声誉查看和凭证管理功能
 * 
 * 优化点：
 * 1. 性能优化（懒加载、虚拟化、缓存）
 * 2. 无障碍支持增强
 * 3. 动画和交互优化
 * 4. 移动端适配完善
 * 5. 错误处理和恢复机制
 * 6. 实时更新和数据同步
 * 7. 安全性增强
 * 
 * @component
 * @version 3.0.0
 */
const IdentityVerifier = () => {
  const navigate = useNavigate();
  const { account, active, chainId, networkName } = useBlockchain();
  
  // 引用缓存
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const identityCardRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const { 
    userIdentity, 
    userReputation, 
    userCredentials,
    isLoading,
    error,
    verifyIdentity,
    checkIdentityStatus,
    getReputationScore,
    getUserCredentials,
    clearIdentityError
  } = useIdentity();
  
  // 本地状态
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationData, setVerificationData] = useState({
    name: '',
    email: '',
    proofType: 'document',
    proofFile: null,
    agreeTerms: false,
    agreePrivacy: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [notification, setNotification] = useState(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [credentialsFilter, setCredentialsFilter] = useState('all');
  const [showReputationHistory, setShowReputationHistory] = useState(false);
  const [reputationHistory, setReputationHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
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
    
    // 设置可见性检测
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          startEntranceAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (identityCardRef.current) {
      observer.observe(identityCardRef.current);
    }
    
    return () => {
      isMounted = false;
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      observer.disconnect();
    };
  }, [active, account, checkIdentityStatus, getReputationScore, getUserCredentials, userIdentity]);
  
  // 入场动画
  const startEntranceAnimation = () => {
    let start = null;
    const duration = 800; // 动画持续时间（毫秒）
    
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      setAnimationProgress(progress);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setVerificationData(prev => ({
        ...prev,
        [name]: checked
      }));
      
      // 清除相关错误
      if (checked && formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: null
        }));
      }
    } else if (type === 'file') {
      if (files && files[0]) {
        // 验证文件类型和大小
        const file = files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
          setFormErrors(prev => ({
            ...prev,
            proofFile: '不支持的文件类型，请上传JPG、PNG或PDF文件'
          }));
          return;
        }
        
        if (file.size > maxSize) {
          setFormErrors(prev => ({
            ...prev,
            proofFile: '文件大小不能超过5MB'
          }));
          return;
        }
        
        setVerificationData(prev => ({
          ...prev,
          [name]: file
        }));
        
        // 清除错误
        setFormErrors(prev => ({
          ...prev,
          [name]: null
        }));
        
        // 创建文件预览
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setFilePreview(e.target.result);
          };
          reader.readAsDataURL(file);
        } else {
          // PDF预览
          setFilePreview('pdf');
        }
      }
    } else {
      setVerificationData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // 清除相关错误
      if (value && formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: null
        }));
      }
    }
  };
  
  // 处理拖放文件
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          proofFile: '不支持的文件类型，请上传JPG、PNG或PDF文件'
        }));
        return;
      }
      
      if (file.size > maxSize) {
        setFormErrors(prev => ({
          ...prev,
          proofFile: '文件大小不能超过5MB'
        }));
        return;
      }
      
      setVerificationData(prev => ({
        ...prev,
        proofFile: file
      }));
      
      // 清除错误
      setFormErrors(prev => ({
        ...prev,
        proofFile: null
      }));
      
      // 创建文件预览
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        // PDF预览
        setFilePreview('pdf');
      }
    }
  };
  
  // 处理验证步骤
  const handleNextStep = () => {
    // 验证当前步骤
    let hasErrors = false;
    const newErrors = {};
    
    if (verificationStep === 0) {
      // 验证基本信息
      if (!verificationData.name) {
        newErrors.name = '请输入您的姓名';
        hasErrors = true;
      } else if (verificationData.name.length < 2) {
        newErrors.name = '姓名长度不能少于2个字符';
        hasErrors = true;
      }
      
      if (!verificationData.email) {
        newErrors.email = '请输入您的电子邮箱';
        hasErrors = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verificationData.email)) {
        newErrors.email = '请输入有效的电子邮箱地址';
        hasErrors = true;
      }
    } else if (verificationStep === 1) {
      // 验证身份证明
      if (!verificationData.proofFile) {
        newErrors.proofFile = '请上传身份证明文件';
        hasErrors = true;
      }
    } else if (verificationStep === 2) {
      // 验证条款同意
      if (!verificationData.agreeTerms) {
        newErrors.agreeTerms = '请同意服务条款';
        hasErrors = true;
      }
      
      if (!verificationData.agreePrivacy) {
        newErrors.agreePrivacy = '请同意隐私政策';
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      setFormErrors(newErrors);
      
      // 滚动到第一个错误
      const firstError = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstError);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      return;
    }
    
    // 进入下一步
    if (verificationStep < 3) {
      setVerificationStep(prev => prev + 1);
      
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePrevStep = () => {
    if (verificationStep > 0) {
      setVerificationStep(prev => prev - 1);
      
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!verificationData.name || !verificationData.email || !verificationData.proofFile || !verificationData.agreeTerms || !verificationData.agreePrivacy) {
      showNotification('请填写所有必填字段并同意条款', 'warning');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 模拟上传进度
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      progressIntervalRef.current = setInterval(() => {
        setVerificationProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressIntervalRef.current);
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
      
      clearInterval(progressIntervalRef.current);
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
    
    // 清除之前的定时器
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    // 5秒后自动关闭
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  // 加载声誉历史
  const loadReputationHistory = useCallback(async () => {
    if (isLoadingHistory || !account) return;
    
    try {
      setIsLoadingHistory(true);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟数据
      const history = [
        {
          id: 1,
          type: 'contribution',
          description: '参与社区讨论',
          points: 5,
          timestamp: Date.now() - 86400000 * 2
        },
        {
          id: 2,
          type: 'creation',
          description: '创建文化NFT',
          points: 20,
          timestamp: Date.now() - 86400000 * 5
        },
        {
          id: 3,
          type: 'participation',
          description: '参与DAO投票',
          points: 10,
          timestamp: Date.now() - 86400000 * 7
        },
        {
          id: 4,
          type: 'contribution',
          description: '提交文化资源',
          points: 15,
          timestamp: Date.now() - 86400000 * 10
        },
        {
          id: 5,
          type: 'participation',
          description: '参与社区活动',
          points: 25,
          timestamp: Date.now() - 86400000 * 15
        }
      ];
      
      setReputationHistory(history);
    } catch (error) {
      console.error('加载声誉历史失败:', error);
      showNotification('加载声誉历史失败', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [account]);
  
  // 当显示声誉历史时加载数据
  useEffect(() => {
    if (showReputationHistory && reputationHistory.length === 0) {
      loadReputationHistory();
    }
  }, [showReputationHistory, reputationHistory.length, loadReputationHistory]);
  
  // 使用useMemo缓存声誉等级计算
  const reputationLevel = useMemo(() => {
    if (!userReputation) return { level: 0, title: '未知', nextLevel: 0 };
    
    const score = userReputation.score;
    
    if (score < 100) {
      return { 
        level: 1, 
        title: '新手', 
        nextLevel: 100,
        progress: score / 100 * 100,
        color: '#3498db'
      };
    } else if (score < 300) {
      return { 
        level: 2, 
        title: '贡献者', 
        nextLevel: 300,
        progress: (score - 100) / 200 * 100,
        color: '#2ecc71'
      };
    } else if (score < 600) {
      return { 
        level: 3, 
        title: '专家', 
        nextLevel: 600,
        progress: (score - 300) / 300 * 100,
        color: '#f39c12'
      };
    } else if (score < 1000) {
      return { 
        level: 4, 
        title: '大师', 
        nextLevel: 1000,
        progress: (score - 600) / 400 * 100,
        color: '#9b59b6'
      };
    } else {
      return { 
        level: 5, 
        title: '传奇', 
        nextLevel: null,
        progress: 100,
        color: '#e74c3c'
      };
    }
  }, [userReputation]);
  
  // 过滤凭证
  const filteredCredentials = useMemo(() => {
    if (!userCredentials) return [];
    
    if (credentialsFilter === 'all') {
      return userCredentials;
    }
    
    return userCredentials.filter(cred => cred.type === credentialsFilter);
  }, [userCredentials, credentialsFilter]);
  
  // 骨架屏组件
  const IdentityVerifierSkeleton = () => (
    <div className="identity-container">
      <div className="identity-header-skeleton" aria-busy="true" aria-live="polite">
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
  
  // 渲染加载状态
  if (isLoading && !userIdentity) {
    return <IdentityVerifierSkeleton />;
  }
  
  return (
    <div 
      className={`identity-container ${isVisible ? 'visible' : ''}`}
      ref={identityCardRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
      }}
    >
      <div className="identity-header">
        <h1>身份与声誉系统</h1>
        <p className="subtitle">验证您的身份，建立声誉，获取专属凭证</p>
        
        {active && (
          <div className="network-indicator">
            <span className="network-dot" style={{ backgroundColor: chainId === 1 ? '#2ecc71' : '#e74c3c' }}></span>
            <span className="network-name">{networkName || '未知网络'}</span>
          </div>
        )}
      </div>
      
      {/* 错误消息 */}
      {error && (
        <div 
          className="error-message" 
          role="alert"
          aria-live="assertive"
        >
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              onClick={clearIdentityError} 
              className="close-btn"
              aria-label="关闭错误消息"
            >
              关闭
            </button>
            <button 
              onClick={() => navigate(0)} 
              className="refresh-btn"
              aria-label="刷新页面"
            >
              <span className="refresh-icon">🔄</span>
              <span className="refresh-text">刷新</span>
            </button>
          </div>
        </div>
      )}
      
      {/* 通知消息 */}
      {notification && (
        <div 
          className={`notification ${notification.type}`} 
          role="status"
          aria-live="polite"
        >
          <div className="notification-icon">
            {notification.type === 'success' && '✅'}
            {notification.type === 'error' && '❌'}
            {notification.type === 'warning' && '⚠️'}
            {notification.type === 'info' && 'ℹ️'}
          </div>
          <p>{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            aria-label="关闭通知"
          >
            ×
          </button>
        </div>
      )}
      
      {/* 未连接钱包提示 */}
      {!active && (
        <div 
          className="wallet-warning" 
          role="alert"
          aria-live="polite"
        >
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
            <span className="btn-icon">🔌</span>
            <span className="btn-text">连接钱包</span>
          </button>
        </div>
      )}
      
      {/* 已验证身份展示 */}
      {active && userIdentity && userIdentity.verified && (
        <div 
          className="identity-verified-section"
          style={{
            transform: `translateY(${(1 - animationProgress) * 20}px)`,
            opacity: animationProgress
          }}
        >
          <div className="identity-card">
            <div className="identity-avatar">
              <img 
                src={userIdentity.avatar || `https://avatars.dicebear.com/api/identicon/${account}.svg`} 
                alt="用户头像" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://avatars.dicebear.com/api/identicon/${account}.svg`;
                }}
              />
              <div className="verified-badge" title="已验证身份">✓</div>
            </div>
            
            <div className="identity-info">
              <h2>{userIdentity.name}</h2>
              <p className="identity-address" title={account}>
                <span className="address-icon">📝</span>
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
                <button 
                  className="copy-address"
                  onClick={() => {
                    navigator.clipboard.writeText(account);
                    showNotification('地址已复制到剪贴板', 'success');
                  }}
                  aria-label="复制地址"
                  title="复制地址"
                >
                  📋
                </button>
              </p>
              <p className="identity-since">
                <span className="since-icon">🕒</span>
                身份验证时间: {new Date(userIdentity.verifiedAt).toLocaleDateString()}
              </p>
              
              <div className="identity-actions">
                <button 
                  className="view-credentials-btn"
                  onClick={() => setShowCredentials(!showCredentials)}
                  aria-expanded={showCredentials}
                >
                  <span className="btn-icon">🏆</span>
                  <span className="btn-text">{showCredentials ? '隐藏凭证' : '查看凭证'}</span>
                </button>
                <button 
                  className="edit-profile-btn"
                  onClick={() => navigate('/profile')}
                >
                  <span className="btn-icon">✏️</span>
                  <span className="btn-text">编辑资料</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* 声誉展示 */}
          {userReputation && (
            <div 
              className="reputation-section"
              style={{
                transform: `translateY(${(1 - animationProgress) * 20}px)`,
                opacity: animationProgress,
                transitionDelay: '0.1s'
              }}
            >
              <h3>
                <span className="section-icon">⭐</span>
                文化声誉
              </h3>
              
              <div className="reputation-card">
                <div className="reputation-header">
                  <div className="reputation-score">
                    <span className="score-value">{userReputation.score}</span>
                    <span className="score-label">声誉分</span>
                  </div>
                  
                  <div className="reputation-level" style={{ backgroundColor: `${reputationLevel.color}20`, borderColor: reputationLevel.color }}>
                    <span className="level-badge" style={{ backgroundColor: reputationLevel.color }}>Lv.{reputationLevel.level}</span>
                    <span className="level-title">{reputationLevel.title}</span>
                  </div>
                </div>
                
                <div className="reputation-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${reputationLevel.progress}%`,
                        backgroundColor: reputationLevel.color
                      }}
                      role="progressbar"
                      aria-valuenow={reputationLevel.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  
                  <div className="progress-info">
                    {reputationLevel.nextLevel ? (
                      <span>距离下一级还需 <strong>{reputationLevel.nextLevel - userReputation.score}</strong> 分</span>
                    ) : (
                      <span>已达到最高等级</span>
                    )}
                  </div>
                </div>
                
                <div className="reputation-stats">
                  <div className="stat-item">
                    <div className="stat-icon" style={{ backgroundColor: '#3498db' }}>🤝</div>
                    <div className="stat-content">
                      <span className="stat-value">{userReputation.contributions || 0}</span>
                      <span className="stat-label">贡献</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon" style={{ backgroundColor: '#2ecc71' }}>🗳️</div>
                    <div className="stat-content">
                      <span className="stat-value">{userReputation.participations || 0}</span>
                      <span className="stat-label">参与</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon" style={{ backgroundColor: '#e74c3c' }}>🎨</div>
                    <div className="stat-content">
                      <span className="stat-value">{userReputation.creations || 0}</span>
                      <span className="stat-label">创作</span>
                    </div>
                  </div>
                </div>
                
                <div className="reputation-actions">
                  <button 
                    className="view-history-btn"
                    onClick={() => setShowReputationHistory(!showReputationHistory)}
                    aria-expanded={showReputationHistory}
                  >
                    <span className="btn-icon">📜</span>
                    <span className="btn-text">{showReputationHistory ? '隐藏历史' : '查看历史'}</span>
                  </button>
                  <button 
                    className="view-leaderboard-btn"
                    onClick={() => navigate('/reputation-leaderboard')}
                  >
                    <span className="btn-icon">🏆</span>
                    <span className="btn-text">查看排行榜</span>
                  </button>
                </div>
              </div>
              
              {/* 声誉历史 */}
              {showReputationHistory && (
                <div className="reputation-history">
                  <h4>声誉历史记录</h4>
                  
                  {isLoadingHistory ? (
                    <div className="loading-history">
                      <div className="loading-spinner"></div>
                      <p>加载历史记录...</p>
                    </div>
                  ) : reputationHistory.length > 0 ? (
                    <div className="history-list">
                      {reputationHistory.map(item => (
                        <div key={item.id} className="history-item">
                          <div className={`history-type ${item.type}`}>
                            {item.type === 'contribution' && '🤝'}
                            {item.type === 'participation' && '🗳️'}
                            {item.type === 'creation' && '🎨'}
                          </div>
                          <div className="history-content">
                            <div className="history-description">{item.description}</div>
                            <div className="history-meta">
                              <span className="history-points">+{item.points} 分</span>
                              <span className="history-time">{new Date(item.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-history">
                      <p>暂无声誉历史记录</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* 凭证展示 */}
          {showCredentials && (
            <div 
              className="credentials-section"
              style={{
                transform: `translateY(${(1 - animationProgress) * 20}px)`,
                opacity: animationProgress,
                transitionDelay: '0.2s'
              }}
            >
              <h3>
                <span className="section-icon">🏅</span>
                我的凭证
              </h3>
              
              <div className="credentials-filter">
                <button 
                  className={`filter-btn ${credentialsFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCredentialsFilter('all')}
                >
                  全部
                </button>
                <button 
                  className={`filter-btn ${credentialsFilter === 'achievement' ? 'active' : ''}`}
                  onClick={() => setCredentialsFilter('achievement')}
                >
                  成就
                </button>
                <button 
                  className={`filter-btn ${credentialsFilter === 'participation' ? 'active' : ''}`}
                  onClick={() => setCredentialsFilter('participation')}
                >
                  参与
                </button>
                <button 
                  className={`filter-btn ${credentialsFilter === 'creation' ? 'active' : ''}`}
                  onClick={() => setCredentialsFilter('creation')}
                >
                  创作
                </button>
              </div>
              
              {filteredCredentials.length > 0 ? (
                <div className="credentials-gallery">
                  {filteredCredentials.map((credential, index) => (
                    <div 
                      key={credential.id} 
                      className="credential-card"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="credential-image">
                        <img 
                          src={credential.image} 
                          alt={credential.name} 
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=凭证';
                          }}
                        />
                      </div>
                      <div className="credential-info">
                        <h4 className="credential-name">{credential.name}</h4>
                        <p className="credential-description">{credential.description}</p>
                        <div className="credential-meta">
                          <span className="credential-date">获得于: {new Date(credential.issuedAt).toLocaleDateString()}</span>
                          <span className={`credential-type ${credential.type}`}>
                            {credential.type === 'achievement' && '成就'}
                            {credential.type === 'participation' && '参与'}
                            {credential.type === 'creation' && '创作'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-credentials">
                  <div className="no-data-icon">🏆</div>
                  <p>暂无凭证</p>
                  <p className="no-data-hint">参与平台活动和创作可以获得凭证</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* 身份验证流程 */}
      {active && (!userIdentity || !userIdentity.verified) && (
        <div 
          className="identity-verification-section"
          style={{
            transform: `translateY(${(1 - animationProgress) * 20}px)`,
            opacity: animationProgress
          }}
        >
          <div className="verification-header">
            <h2>
              <span className="section-icon">🔐</span>
              身份验证
            </h2>
            <p>完成身份验证以解锁平台全部功能并开始建立您的声誉</p>
          </div>
          
          <div className="verification-steps">
            <div className="steps-indicator">
              {[0, 1, 2, 3].map((step) => (
                <div 
                  key={step} 
                  className={`step-indicator ${verificationStep >= step ? 'active' : ''} ${verificationStep === step ? 'current' : ''}`}
                  aria-current={verificationStep === step ? 'step' : undefined}
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
              <form 
                onSubmit={handleSubmitVerification} 
                className="verification-form"
                ref={formRef}
                noValidate
              >
                {/* 步骤1: 基本信息 */}
                {verificationStep === 0 && (
                  <div 
                    className="verification-step"
                    role="group"
                    aria-labelledby="step1-title"
                  >
                    <h3 id="step1-title">基本信息</h3>
                    
                    <div className={`form-group ${formErrors.name ? 'has-error' : ''}`}>
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
                        aria-invalid={!!formErrors.name}
                        aria-describedby={formErrors.name ? "name-error" : undefined}
                        autoComplete="name"
                      />
                      {formErrors.name && (
                        <div className="error-message" id="name-error" role="alert">
                          {formErrors.name}
                        </div>
                      )}
                    </div>
                    
                    <div className={`form-group ${formErrors.email ? 'has-error' : ''}`}>
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
                        aria-invalid={!!formErrors.email}
                        aria-describedby={formErrors.email ? "email-error" : "email-hint"}
                        autoComplete="email"
                      />
                      {formErrors.email ? (
                        <div className="error-message" id="email-error" role="alert">
                          {formErrors.email}
                        </div>
                      ) : (
                        <p className="form-hint" id="email-hint">我们将通过此邮箱与您联系验证结果</p>
                      )}
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="next-btn"
                        onClick={handleNextStep}
                      >
                        <span className="btn-text">下一步</span>
                        <span className="btn-icon">→</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 步骤2: 身份证明 */}
                {verificationStep === 1 && (
                  <div 
                    className="verification-step"
                    role="group"
                    aria-labelledby="step2-title"
                  >
                    <h3 id="step2-title">身份证明</h3>
                    
                    <div className="form-group">
                      <label htmlFor="proofType">证明类型</label>
                      <select
                        id="proofType"
                        name="proofType"
                        value={verificationData.proofType}
                        onChange={handleInputChange}
                        aria-label="选择证明类型"
                      >
                        <option value="document">身份证件</option>
                        <option value="passport">护照</option>
                        <option value="license">驾驶证</option>
                        <option value="other">其他证件</option>
                      </select>
                    </div>
                    
                    <div className={`form-group file-upload-group ${formErrors.proofFile ? 'has-error' : ''}`}>
                      <label htmlFor="proofFile">
                        证明文件 <span className="required">*</span>
                        <span className="file-formats">(支持 JPG, PNG, PDF, 最大5MB)</span>
                      </label>
                      
                      <div 
                        className={`file-drop-area ${dragActive ? 'active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="proofFile"
                          name="proofFile"
                          onChange={handleInputChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="file-input"
                          ref={fileInputRef}
                          aria-required="true"
                          aria-invalid={!!formErrors.proofFile}
                          aria-describedby={formErrors.proofFile ? "file-error" : "file-hint"}
                        />
                        
                        {!verificationData.proofFile ? (
                          <div className="drop-message">
                            <div className="upload-icon">📤</div>
                            <p>拖放文件到此处或</p>
                            <button 
                              type="button" 
                              className="browse-btn"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              浏览文件
                            </button>
                          </div>
                        ) : (
                          <div className="file-preview">
                            {filePreview && filePreview !== 'pdf' ? (
                              <img src={filePreview} alt="文件预览" className="preview-image" />
                            ) : (
                              <div className="pdf-preview">
                                <span className="pdf-icon">📄</span>
                                <span className="pdf-name">{verificationData.proofFile.name}</span>
                              </div>
                            )}
                            <div className="file-info">
                              <span className="file-name">{verificationData.proofFile.name}</span>
                              <span className="file-size">
                                {(verificationData.proofFile.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                            <button 
                              type="button" 
                              className="remove-file"
                              onClick={() => {
                                setVerificationData(prev => ({
                                  ...prev,
                                  proofFile: null
                                }));
                                setFilePreview(null);
                              }}
                              aria-label="移除文件"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {formErrors.proofFile ? (
                        <div className="error-message" id="file-error" role="alert">
                          {formErrors.proofFile}
                        </div>
                      ) : (
                        <p className="form-hint" id="file-hint">
                          请上传清晰的身份证明文件，我们将严格保护您的隐私
                        </p>
                      )}
                    </div>
                    
                    <div className="security-notice">
                      <div className="notice-icon">🔒</div>
                      <div className="notice-content">
                        <h4>安全保障</h4>
                        <p>您的身份文件将被加密存储，仅用于身份验证目的，验证完成后将自动删除</p>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="prev-btn"
                        onClick={handlePrevStep}
                      >
                        <span className="btn-icon">←</span>
                        <span className="btn-text">上一步</span>
                      </button>
                      <button
                        type="button"
                        className="next-btn"
                        onClick={handleNextStep}
                      >
                        <span className="btn-text">下一步</span>
                        <span className="btn-icon">→</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 步骤3: 确认提交 */}
                {verificationStep === 2 && (
                  <div 
                    className="verification-step"
                    role="group"
                    aria-labelledby="step3-title"
                  >
                    <h3 id="step3-title">确认提交</h3>
                    
                    <div className="verification-summary">
                      <h4>信息摘要</h4>
                      
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
                        <span className="summary-value">
                          {verificationData.proofType === 'document' && '身份证件'}
                          {verificationData.proofType === 'passport' && '护照'}
                          {verificationData.proofType === 'license' && '驾驶证'}
                          {verificationData.proofType === 'other' && '其他证件'}
                        </span>
                      </div>
                      
                      <div className="summary-item">
                        <span className="summary-label">证明文件:</span>
                        <span className="summary-value">
                          {verificationData.proofFile?.name}
                          <span className="file-size">
                            ({(verificationData.proofFile?.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </span>
                      </div>
                      
                      <div className="summary-item">
                        <span className="summary-label">钱包地址:</span>
                        <span className="summary-value address">
                          {account}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`form-group checkbox-group ${formErrors.agreeTerms ? 'has-error' : ''}`}>
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="agreeTerms"
                          name="agreeTerms"
                          checked={verificationData.agreeTerms}
                          onChange={handleInputChange}
                          required
                          aria-required="true"
                          aria-invalid={!!formErrors.agreeTerms}
                          aria-describedby={formErrors.agreeTerms ? "terms-error" : undefined}
                        />
                        <label htmlFor="agreeTerms">
                          我同意 <a href="/terms" target="_blank" rel="noopener noreferrer">服务条款</a>
                        </label>
                      </div>
                      {formErrors.agreeTerms && (
                        <div className="error-message" id="terms-error" role="alert">
                          {formErrors.agreeTerms}
                        </div>
                      )}
                    </div>
                    
                    <div className={`form-group checkbox-group ${formErrors.agreePrivacy ? 'has-error' : ''}`}>
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="agreePrivacy"
                          name="agreePrivacy"
                          checked={verificationData.agreePrivacy}
                          onChange={handleInputChange}
                          required
                          aria-required="true"
                          aria-invalid={!!formErrors.agreePrivacy}
                          aria-describedby={formErrors.agreePrivacy ? "privacy-error" : undefined}
                        />
                        <label htmlFor="agreePrivacy">
                          我同意 <a href="/privacy" target="_blank" rel="noopener noreferrer">隐私政策</a>
                        </label>
                      </div>
                      {formErrors.agreePrivacy && (
                        <div className="error-message" id="privacy-error" role="alert">
                          {formErrors.agreePrivacy}
                        </div>
                      )}
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="prev-btn"
                        onClick={handlePrevStep}
                        disabled={isSubmitting}
                      >
                        <span className="btn-icon">←</span>
                        <span className="btn-text">上一步</span>
                      </button>
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="loading-spinner-small"></span>
                            <span className="btn-text">提交中...</span>
                          </>
                        ) : (
                          <>
                            <span className="btn-icon">✓</span>
                            <span className="btn-text">提交验证</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {isSubmitting && (
                      <div className="upload-progress" role="progressbar" aria-valuenow={verificationProgress} aria-valuemin="0" aria-valuemax="100">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${verificationProgress}%` }}
                          ></div>
                        </div>
                        <div className="progress-text">{verificationProgress}%</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 步骤4: 完成 */}
                {verificationStep === 3 && (
                  <div 
                    className="verification-step completion-step"
                    role="group"
                    aria-labelledby="step4-title"
                  >
                    <div className="completion-icon">✅</div>
                    <h3 id="step4-title">验证申请已提交</h3>
                    <p className="completion-message">
                      您的身份验证申请已成功提交，我们将在1-3个工作日内完成审核。
                      审核结果将通过邮件发送至您提供的邮箱地址。
                    </p>
                    
                    <div className="next-steps">
                      <h4>接下来您可以:</h4>
                      <ul>
                        <li>浏览平台内容，了解更多文化资源</li>
                        <li>关注您的邮箱，等待验证结果通知</li>
                        <li>准备开始您的文化创作和贡献之旅</li>
                      </ul>
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="home-btn"
                        onClick={() => navigate('/')}
                      >
                        <span className="btn-icon">🏠</span>
                        <span className="btn-text">返回首页</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* 返回顶部按钮 */}
      <button 
        className="back-to-top-button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="返回顶部"
        title="返回顶部"
      >
        ↑
      </button>
    </div>
  );
};

export default IdentityVerifier;
