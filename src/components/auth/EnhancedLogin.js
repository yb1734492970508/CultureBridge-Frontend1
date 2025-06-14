import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth/EnhancedAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './EnhancedAuth.css';

const EnhancedLogin = () => {
  const { login, walletLogin, isLoading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'wallet'
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
   * 处理表单输入变化
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // 清除错误信息
    if (error) {
      clearError();
    }
  };

  /**
   * 处理邮箱登录
   */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    const result = await login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });

    if (result.success) {
      navigate('/');
    }
  };

  /**
   * 处理钱包登录
   */
  const handleWalletLogin = async () => {
    if (!window.ethereum) {
      alert('请安装MetaMask钱包');
      return;
    }

    try {
      setWalletConnecting(true);
      
      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('未选择钱包账户');
      }

      const address = accounts[0];
      
      // 获取签名消息
      const message = `CultureBridge登录验证\n时间戳: ${Date.now()}`;
      
      // 请求签名
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // 调用钱包登录API
      const result = await walletLogin({
        address,
        message,
        signature,
      });

      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('钱包登录失败:', error);
      alert(`钱包登录失败: ${error.message}`);
    } finally {
      setWalletConnecting(false);
    }
  };

  /**
   * 切换登录方式
   */
  const switchLoginMethod = (method) => {
    setLoginMethod(method);
    clearError();
  };

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
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">🌉</span>
              <h1>CultureBridge</h1>
            </div>
            <h2>欢迎回来</h2>
            <p>登录您的账户，继续您的文化交流之旅</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={clearError} className="close-error">×</button>
            </div>
          )}

          <div className="login-methods">
            <div className="method-tabs">
              <button
                className={`method-tab ${loginMethod === 'email' ? 'active' : ''}`}
                onClick={() => switchLoginMethod('email')}
              >
                📧 邮箱登录
              </button>
              <button
                className={`method-tab ${loginMethod === 'wallet' ? 'active' : ''}`}
                onClick={() => switchLoginMethod('wallet')}
              >
                👛 钱包登录
              </button>
            </div>

            {loginMethod === 'email' ? (
              <form onSubmit={handleEmailLogin} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">邮箱地址</label>
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
                </div>

                <div className="form-group">
                  <label htmlFor="password">密码</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="输入您的密码"
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
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    <span className="checkbox-custom"></span>
                    记住我
                  </label>
                  
                  <Link to="/forgot-password" className="forgot-link">
                    忘记密码？
                  </Link>
                </div>

                <button
                  type="submit"
                  className="auth-button primary"
                  disabled={isLoading || !formData.email || !formData.password}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      登录中...
                    </>
                  ) : (
                    '登录'
                  )}
                </button>
              </form>
            ) : (
              <div className="wallet-login">
                <div className="wallet-info">
                  <div className="wallet-icon">👛</div>
                  <h3>使用Web3钱包登录</h3>
                  <p>连接您的MetaMask钱包，享受去中心化的登录体验</p>
                </div>

                <div className="wallet-features">
                  <div className="feature-item">
                    <span className="feature-icon">🔐</span>
                    <span>安全可靠</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <span>快速便捷</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🌐</span>
                    <span>去中心化</span>
                  </div>
                </div>

                <button
                  onClick={handleWalletLogin}
                  className="auth-button wallet"
                  disabled={walletConnecting}
                >
                  {walletConnecting ? (
                    <>
                      <span className="loading-spinner"></span>
                      连接中...
                    </>
                  ) : (
                    <>
                      <span className="metamask-icon">🦊</span>
                      连接MetaMask
                    </>
                  )}
                </button>

                {!window.ethereum && (
                  <div className="wallet-notice">
                    <p>未检测到MetaMask钱包</p>
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="install-link"
                    >
                      点击安装MetaMask
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="auth-footer">
            <p>
              还没有账户？
              <Link to="/register" className="auth-link">
                立即注册
              </Link>
            </p>
            
            <div className="social-login">
              <p>或使用以下方式登录</p>
              <div className="social-buttons">
                <button className="social-button google" disabled>
                  <span>🔍</span>
                  Google
                </button>
                <button className="social-button github" disabled>
                  <span>🐙</span>
                  GitHub
                </button>
                <button className="social-button discord" disabled>
                  <span>💬</span>
                  Discord
                </button>
              </div>
              <p className="coming-soon">更多登录方式即将推出</p>
            </div>
          </div>
        </div>

        <div className="auth-sidebar">
          <div className="sidebar-content">
            <h3>🌍 连接世界文化</h3>
            <p>CultureBridge是一个基于区块链技术的跨文化交流平台，让您与世界各地的朋友分享文化，学习语言，获得CBT代币奖励。</p>
            
            <div className="features-list">
              <div className="feature">
                <span className="feature-emoji">🎤</span>
                <div>
                  <h4>AI语音翻译</h4>
                  <p>实时多语言语音翻译，打破语言障碍</p>
                </div>
              </div>
              
              <div className="feature">
                <span className="feature-emoji">💬</span>
                <div>
                  <h4>实时聊天</h4>
                  <p>与全球用户实时交流，分享文化体验</p>
                </div>
              </div>
              
              <div className="feature">
                <span className="feature-emoji">💰</span>
                <div>
                  <h4>CBT代币奖励</h4>
                  <p>参与文化交流获得代币奖励，创造价值</p>
                </div>
              </div>
              
              <div className="feature">
                <span className="feature-emoji">🔗</span>
                <div>
                  <h4>区块链技术</h4>
                  <p>基于BNB链的去中心化平台，安全可信</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLogin;

