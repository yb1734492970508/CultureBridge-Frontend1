import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/auth/EnhancedAuthContext';
import { useAuth } from './context/auth/EnhancedAuthContext';

// 增强版组件
import EnhancedLogin from './components/auth/EnhancedLogin';
import EnhancedRegister from './components/auth/EnhancedRegister';
import EnhancedVoiceTranslation from './components/voice/EnhancedVoiceTranslation';
import EnhancedRealTimeChat from './components/chat/EnhancedRealTimeChat';

// 原有组件
import BNBWalletConnector from './components/blockchain/BNBWalletConnector';
import CBTTokenManager from './components/token/CBTTokenManager';
import NFTMinter from './components/blockchain/NFTMinter';
import NFTGallery from './components/blockchain/NFTGallery';
import NFTDetail from './components/blockchain/NFTDetail';
import CopyrightProtection from './components/blockchain/CopyrightProtection';
import CrossChainBridge from './components/blockchain/CrossChainBridge';
import TokenEconomyDashboard from './components/token/TokenEconomyDashboard';
import MultiChainAssetManager from './components/asset/MultiChainAssetManager';
import BlockchainWallet from './components/BlockchainWallet';
import SwapInterface from './components/defi/dex/SwapInterface';
import FarmList from './components/defi/farming/FarmList';

import './App.css';

// 受保护的路由组件
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// 公共路由组件（已登录用户重定向）
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

// 导航组件
function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="app-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-icon">🌉</span>
          <span className="brand-text">CultureBridge</span>
        </div>

        <ul className="nav-list">
          <li className="nav-item">
            <a href="/" className="nav-link">首页</a>
          </li>
          
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <a href="/voice-translation" className="nav-link">🎤 语音翻译</a>
              </li>
              <li className="nav-item">
                <a href="/chat" className="nav-link">💬 实时聊天</a>
              </li>
              <li className="nav-item">
                <a href="/wallet" className="nav-link">👛 区块链钱包</a>
              </li>
              <li className="nav-item dropdown">
                <a href="#" className="nav-link">🎨 NFT</a>
                <ul className="dropdown-menu">
                  <li><a href="/gallery" className="dropdown-link">NFT画廊</a></li>
                  <li><a href="/mint" className="dropdown-link">创建NFT</a></li>
                  <li><a href="/copyright" className="dropdown-link">版权保护</a></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a href="#" className="nav-link">💰 DeFi</a>
                <ul className="dropdown-menu">
                  <li><a href="/cbt-manager" className="dropdown-link">CBT管理</a></li>
                  <li><a href="/token-economy" className="dropdown-link">代币经济</a></li>
                  <li><a href="/swap" className="dropdown-link">代币交换</a></li>
                  <li><a href="/farming" className="dropdown-link">流动性挖矿</a></li>
                </ul>
              </li>
              <li className="nav-item">
                <a href="/assets" className="nav-link">📊 资产管理</a>
              </li>
              <li className="nav-item">
                <a href="/bridge" className="nav-link">🌉 跨链桥</a>
              </li>
            </>
          )}
        </ul>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <BNBWalletConnector />
              <div className="user-info">
                <span className="user-avatar">👤</span>
                <span className="user-name">{user?.username || user?.email}</span>
                <div className="user-dropdown">
                  <a href="/profile" className="dropdown-link">个人资料</a>
                  <a href="/settings" className="dropdown-link">设置</a>
                  <button onClick={handleLogout} className="dropdown-link logout-btn">
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <a href="/login" className="login-button">登录</a>
              <a href="/register" className="register-button">注册</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// 首页组件
function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            🌍 连接世界文化
            <span className="gradient-text">CultureBridge</span>
          </h1>
          <p className="hero-description">
            基于区块链技术的跨文化交流平台，通过AI语音翻译、实时聊天和CBT代币奖励，
            让您与世界各地的朋友分享文化，学习语言，创造价值。
          </p>
          
          {!isAuthenticated ? (
            <div className="hero-actions">
              <a href="/register" className="cta-button primary">
                🚀 立即开始
              </a>
              <a href="/login" className="cta-button secondary">
                🔑 登录账户
              </a>
            </div>
          ) : (
            <div className="welcome-message">
              <h2>欢迎回来，{user?.firstName || user?.username}！</h2>
              <p>继续您的文化交流之旅</p>
            </div>
          )}
        </div>
        
        <div className="hero-visual">
          <div className="floating-elements">
            <div className="element element-1">🎤</div>
            <div className="element element-2">💬</div>
            <div className="element element-3">🌍</div>
            <div className="element element-4">💰</div>
            <div className="element element-5">🔗</div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">✨ 核心功能</h2>
        <div className="features-grid">
          <div className="feature-card highlight-card">
            <div className="feature-icon">🎤</div>
            <h3>AI语音翻译</h3>
            <p>支持50+种语言的实时语音识别和翻译，打破语言障碍，让沟通无界限。</p>
            <a href="/voice-translation" className="feature-link">
              {isAuthenticated ? '开始翻译' : '了解更多'}
            </a>
          </div>
          
          <div className="feature-card highlight-card">
            <div className="feature-icon">💬</div>
            <h3>实时聊天</h3>
            <p>与全球用户实时交流，支持文字和语音消息，分享文化体验和学习心得。</p>
            <a href="/chat" className="feature-link">
              {isAuthenticated ? '进入聊天' : '了解更多'}
            </a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👛</div>
            <h3>区块链钱包</h3>
            <p>连接MetaMask钱包，管理CBT代币和BNB余额，享受去中心化体验。</p>
            <a href="/wallet" className="feature-link">
              {isAuthenticated ? '打开钱包' : '了解更多'}
            </a>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>文化NFT</h3>
            <p>将您的文化作品铸造为NFT，确保数字所有权，在市场中交易。</p>
            <a href="/gallery" className="feature-link">
              {isAuthenticated ? '查看画廊' : '了解更多'}
            </a>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>版权保护</h3>
            <p>基于区块链的文化作品版权登记与验证，保护您的知识产权。</p>
            <a href="/copyright" className="feature-link">
              {isAuthenticated ? '保护作品' : '了解更多'}
            </a>
          </div>
          
          <div className="feature-card highlight-card">
            <div className="feature-icon">💰</div>
            <h3>CBT代币经济</h3>
            <p>参与文化交流获得CBT代币奖励，创造价值，实现共赢。</p>
            <a href="/token-economy" className="feature-link">
              {isAuthenticated ? '查看仪表盘' : '了解更多'}
            </a>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌉</div>
            <h3>跨链资产桥</h3>
            <p>在多个区块链网络间安全转移您的数字资产。</p>
            <a href="/bridge" className="feature-link">
              {isAuthenticated ? '开始跨链' : '了解更多'}
            </a>
          </div>
          
          <div className="feature-card highlight-card">
            <div className="feature-icon">📊</div>
            <h3>DeFi交易</h3>
            <p>去中心化代币交换和流动性挖矿，享受高收益。</p>
            <a href="/swap" className="feature-link">
              {isAuthenticated ? '开始交易' : '了解更多'}
            </a>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <div className="stats-section">
          <h2 className="section-title">📈 您的数据</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎤</div>
              <div className="stat-number">{user?.stats?.translations || 0}</div>
              <div className="stat-label">翻译次数</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-number">{user?.stats?.messages || 0}</div>
              <div className="stat-label">聊天消息</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-number">{user?.stats?.tokens || 0}</div>
              <div className="stat-label">CBT代币</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎨</div>
              <div className="stat-number">{user?.stats?.nfts || 0}</div>
              <div className="stat-label">NFT作品</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// NFT详情包装组件
function NFTDetailWrapper() {
  const tokenId = window.location.pathname.split('/').pop();
  return <NFTDetail tokenId={tokenId} />;
}

// 主应用组件
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navigation />
          
          <main className="app-main">
            <Routes>
              {/* 公共路由 */}
              <Route path="/login" element={
                <PublicRoute>
                  <EnhancedLogin />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <EnhancedRegister />
                </PublicRoute>
              } />
              
              {/* 首页 */}
              <Route path="/" element={<Home />} />
              
              {/* 受保护的路由 */}
              <Route path="/voice-translation" element={
                <ProtectedRoute>
                  <EnhancedVoiceTranslation />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <EnhancedRealTimeChat />
                </ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute>
                  <BlockchainWallet />
                </ProtectedRoute>
              } />
              <Route path="/mint" element={
                <ProtectedRoute>
                  <NFTMinter />
                </ProtectedRoute>
              } />
              <Route path="/gallery" element={
                <ProtectedRoute>
                  <NFTGallery />
                </ProtectedRoute>
              } />
              <Route path="/nft/:tokenId" element={
                <ProtectedRoute>
                  <NFTDetailWrapper />
                </ProtectedRoute>
              } />
              <Route path="/copyright" element={
                <ProtectedRoute>
                  <CopyrightProtection />
                </ProtectedRoute>
              } />
              <Route path="/bridge" element={
                <ProtectedRoute>
                  <CrossChainBridge />
                </ProtectedRoute>
              } />
              <Route path="/assets" element={
                <ProtectedRoute>
                  <MultiChainAssetManager />
                </ProtectedRoute>
              } />
              <Route path="/token-economy" element={
                <ProtectedRoute>
                  <TokenEconomyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/cbt-manager" element={
                <ProtectedRoute>
                  <CBTTokenManager />
                </ProtectedRoute>
              } />
              <Route path="/swap" element={
                <ProtectedRoute>
                  <SwapInterface />
                </ProtectedRoute>
              } />
              <Route path="/farming" element={
                <ProtectedRoute>
                  <FarmList />
                </ProtectedRoute>
              } />
              
              {/* 404页面 */}
              <Route path="*" element={
                <div className="not-found">
                  <h2>404 - 页面未找到</h2>
                  <p>您访问的页面不存在</p>
                  <a href="/" className="back-home">返回首页</a>
                </div>
              } />
            </Routes>
          </main>
          
          <footer className="app-footer">
            <div className="footer-content">
              <div className="footer-section">
                <h3>CultureBridge</h3>
                <p>基于BNB链的跨文化交流平台</p>
                <p>CBT代币驱动的去中心化文化生态系统</p>
              </div>
              
              <div className="footer-section">
                <h4>功能</h4>
                <ul>
                  <li><a href="/voice-translation">语音翻译</a></li>
                  <li><a href="/chat">实时聊天</a></li>
                  <li><a href="/gallery">NFT画廊</a></li>
                  <li><a href="/token-economy">代币经济</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4>支持</h4>
                <ul>
                  <li><a href="/help">帮助中心</a></li>
                  <li><a href="/contact">联系我们</a></li>
                  <li><a href="/terms">服务条款</a></li>
                  <li><a href="/privacy">隐私政策</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4>社区</h4>
                <ul>
                  <li><a href="#" target="_blank">Discord</a></li>
                  <li><a href="#" target="_blank">Telegram</a></li>
                  <li><a href="#" target="_blank">Twitter</a></li>
                  <li><a href="#" target="_blank">GitHub</a></li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; 2024 CultureBridge. All rights reserved.</p>
              <p>Powered by BNB Smart Chain</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

