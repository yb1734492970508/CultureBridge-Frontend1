import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth/EnhancedAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './EnhancedAuth.css';

const EnhancedRegister = () => {
  const { register, isLoading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    country: '',
    language: 'zh-CN',
    agreeToTerms: false,
    subscribeNewsletter: true,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 清除错误信息
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  /**
   * 计算密码强度
   */
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  /**
   * 验证表单字段
   */
  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'username':
        if (!value) {
          errors.username = '用户名不能为空';
        } else if (value.length < 3) {
          errors.username = '用户名至少需要3个字符';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.username = '用户名只能包含字母、数字和下划线';
        } else {
          delete errors.username;
        }
        break;
        
      case 'email':
        if (!value) {
          errors.email = '邮箱地址不能为空';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = '请输入有效的邮箱地址';
        } else {
          delete errors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          errors.password = '密码不能为空';
        } else if (value.length < 8) {
          errors.password = '密码至少需要8个字符';
        } else {
          delete errors.password;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = '请确认密码';
        } else if (value !== formData.password) {
          errors.confirmPassword = '两次输入的密码不一致';
        } else {
          delete errors.confirmPassword;
        }
        break;
        
      case 'firstName':
        if (!value) {
          errors.firstName = '名字不能为空';
        } else {
          delete errors.firstName;
        }
        break;
        
      case 'lastName':
        if (!value) {
          errors.lastName = '姓氏不能为空';
        } else {
          delete errors.lastName;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  /**
   * 处理表单输入变化
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
    
    // 实时验证
    if (name !== 'agreeToTerms' && name !== 'subscribeNewsletter') {
      validateField(name, newValue);
    }
    
    // 计算密码强度
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(newValue));
    }
    
    // 验证确认密码
    if (name === 'confirmPassword' || name === 'password') {
      const confirmPassword = name === 'confirmPassword' ? newValue : formData.confirmPassword;
      const password = name === 'password' ? newValue : formData.password;
      validateField('confirmPassword', confirmPassword);
    }
    
    // 清除错误信息
    if (error) {
      clearError();
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证所有字段
    const requiredFields = ['username', 'email', 'password', 'confirmPassword', 'firstName', 'lastName'];
    let hasErrors = false;
    
    requiredFields.forEach(field => {
      validateField(field, formData[field]);
      if (!formData[field]) {
        hasErrors = true;
      }
    });
    
    if (Object.keys(validationErrors).length > 0 || hasErrors) {
      return;
    }
    
    if (!formData.agreeToTerms) {
      alert('请同意服务条款和隐私政策');
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      country: formData.country,
      language: formData.language,
      subscribeNewsletter: formData.subscribeNewsletter,
    });

    if (result.success) {
      navigate('/');
    }
  };

  /**
   * 获取密码强度文本和颜色
   */
  const getPasswordStrengthInfo = () => {
    const strengthLevels = [
      { text: '很弱', color: '#dc3545' },
      { text: '弱', color: '#fd7e14' },
      { text: '一般', color: '#ffc107' },
      { text: '强', color: '#20c997' },
      { text: '很强', color: '#28a745' },
    ];
    
    return strengthLevels[passwordStrength] || strengthLevels[0];
  };

  const passwordStrengthInfo = getPasswordStrengthInfo();

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-content">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">🌉</span>
              <h1>CultureBridge</h1>
            </div>
            <h2>加入我们</h2>
            <p>创建您的账户，开始您的跨文化交流之旅</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={clearError} className="close-error">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">名字 *</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="输入您的名字"
                    required
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.firstName && (
                  <span className="field-error">{validationErrors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">姓氏 *</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="输入您的姓氏"
                    required
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.lastName && (
                  <span className="field-error">{validationErrors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">用户名 *</label>
              <div className="input-wrapper">
                <span className="input-icon">@</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="输入用户名"
                  required
                  disabled={isLoading}
                />
              </div>
              {validationErrors.username && (
                <span className="field-error">{validationErrors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">邮箱地址 *</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="输入您的邮箱地址"
                  required
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <span className="field-error">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country">国家/地区</label>
                <div className="input-wrapper">
                  <span className="input-icon">🌍</span>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value="">选择国家/地区</option>
                    <option value="CN">中国</option>
                    <option value="US">美国</option>
                    <option value="JP">日本</option>
                    <option value="KR">韩国</option>
                    <option value="GB">英国</option>
                    <option value="FR">法国</option>
                    <option value="DE">德国</option>
                    <option value="CA">加拿大</option>
                    <option value="AU">澳大利亚</option>
                    <option value="SG">新加坡</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="language">首选语言</label>
                <div className="input-wrapper">
                  <span className="input-icon">🗣️</span>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value="zh-CN">中文</option>
                    <option value="en-US">English</option>
                    <option value="ja-JP">日本語</option>
                    <option value="ko-KR">한국어</option>
                    <option value="fr-FR">Français</option>
                    <option value="de-DE">Deutsch</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">密码 *</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="输入密码"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: passwordStrengthInfo.color,
                      }}
                    ></div>
                  </div>
                  <span 
                    className="strength-text"
                    style={{ color: passwordStrengthInfo.color }}
                  >
                    密码强度: {passwordStrengthInfo.text}
                  </span>
                </div>
              )}
              {validationErrors.password && (
                <span className="field-error">{validationErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码 *</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="再次输入密码"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <span className="field-error">{validationErrors.confirmPassword}</span>
              )}
            </div>

            <div className="form-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <span className="checkbox-custom"></span>
                我同意
                <Link to="/terms" className="terms-link">服务条款</Link>
                和
                <Link to="/privacy" className="terms-link">隐私政策</Link>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="subscribeNewsletter"
                  checked={formData.subscribeNewsletter}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="checkbox-custom"></span>
                订阅我们的新闻通讯，获取最新功能和活动信息
              </label>
            </div>

            <button
              type="submit"
              className="auth-button primary"
              disabled={isLoading || Object.keys(validationErrors).length > 0 || !formData.agreeToTerms}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  注册中...
                </>
              ) : (
                '创建账户'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              已有账户？
              <Link to="/login" className="auth-link">
                立即登录
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-sidebar">
          <div className="sidebar-content">
            <h3>🎁 注册奖励</h3>
            <p>注册即可获得 <strong>10 CBT</strong> 代币奖励，开始您的文化交流之旅！</p>
            
            <div className="rewards-list">
              <div className="reward-item">
                <span className="reward-icon">🎉</span>
                <div>
                  <h4>注册奖励</h4>
                  <p>立即获得 10 CBT 代币</p>
                </div>
              </div>
              
              <div className="reward-item">
                <span className="reward-icon">📅</span>
                <div>
                  <h4>每日登录</h4>
                  <p>每天登录获得 1 CBT 代币</p>
                </div>
              </div>
              
              <div className="reward-item">
                <span className="reward-icon">🎤</span>
                <div>
                  <h4>语音翻译</h4>
                  <p>每次使用语音翻译获得 2 CBT</p>
                </div>
              </div>
              
              <div className="reward-item">
                <span className="reward-icon">💬</span>
                <div>
                  <h4>文化分享</h4>
                  <p>发布文化内容获得 5 CBT</p>
                </div>
              </div>
            </div>

            <div className="platform-stats">
              <h4>🌟 平台数据</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">活跃用户</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">支持语言</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">100K+</span>
                  <span className="stat-label">翻译次数</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">1M+</span>
                  <span className="stat-label">CBT流通</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRegister;

