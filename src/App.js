import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthGuard } from './contexts/AuthContext';
import { TokenProvider } from './context/token/TokenContext'; // Assuming this context exists
import { BlockchainProvider } from './context/blockchain/BlockchainContext'; // Assuming this context exists
import { ErrorBoundary, errorHandler } from './utils/errorHandler';
import socketService from './services/socketService';

// Import existing components and pages
import BNBWalletConnector from './components/blockchain/BNBWalletConnector';
import CBTTokenManager from './components/token/CBTTokenManager';
import NFTMinter from './components/blockchain/NFTMinter';
import NFTGallery from './components/blockchain/NFTGallery';
import NFTDetail from './components/blockchain/NFTDetail';
import CopyrightProtection from './components/blockchain/CopyrightProtection';
import BridgeInterface from './components/cross-chain/BridgeInterface';
import TokenEconomyDashboard from './components/token/TokenEconomyDashboard';
import MultiChainAssetManager from './components/asset/MultiChainAssetManager';
import MultiChainWallet from './components/blockchain/MultiChainWallet';
import SwapInterface from './components/defi/dex/SwapInterface';
import FarmList from './components/defi/farming/FarmList';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Profile from './pages/auth/Profile';
import SecuritySettings from './pages/auth/SecuritySettings';

// New or enhanced components for chat and voice translation
import ChatRoomList from './components/chat/ChatRoomList'; // Assuming this will be created
import ChatWindow from './components/chat/ChatWindow'; // Assuming this will be created
import VoiceTranslator from './components/voice/VoiceTranslator'; // Assuming this will be created

import './App.css';

function App() {
  useEffect(() => {
    // Initialize socket service when the app mounts
    socketService.connect();
    socketService.startHeartbeat();

    // Clean up socket service when the app unmounts
    return () => {
      socketService.stopHeartbeat();
      socketService.disconnect();
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <TokenProvider>
          <BlockchainProvider>
            <div className="App">
              <header className="App-header">
                <h1>CultureBridge</h1>
                <div className="header-actions">
                  <BNBWalletConnector />
                  <UserMenu />
                </div>
              </header>
              
              <nav className="App-nav">
                <ul className="nav-list">
                  <li className="nav-item"><a href="/" className="nav-link">首页</a></li>
                  <li className="nav-item"><a href="/wallet" className="nav-link">多链钱包</a></li>
                  <li className="nav-item"><a href="/gallery" className="nav-link">NFT画廊</a></li>
                  <li className="nav-item"><a href="/mint" className="nav-link">创建NFT</a></li>
                  <li className="nav-item"><a href="/copyright" className="nav-link">版权保护</a></li>
                  <li className="nav-item"><a href="/bridge" className="nav-link">跨链桥</a></li>
                  <li className="nav-item"><a href="/assets" className="nav-link">资产管理</a></li>
                  <li className="nav-item"><a href="/token-economy" className="nav-link">代币经济</a></li>
                  <li className="nav-item"><a href="/cbt-manager" className="nav-link">CBT管理</a></li>
                  <li className="nav-item"><a href="/chat" className="nav-link">实时聊天</a></li>
                  <li className="nav-item"><a href="/translate" className="nav-link">语音翻译</a></li>
                  <li className="nav-item dropdown">
                    <a href="#" className="nav-link">DeFi</a>
                    <ul className="dropdown-menu">
                      <li><a href="/swap" className="dropdown-link">代币交换</a></li>
                      <li><a href="/farming" className="dropdown-link">流动性挖矿</a></li>
                    </ul>
                  </li>
                </ul>
              </nav>
              
              <main className="App-main">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/wallet" element={<AuthGuard><MultiChainWallet /></AuthGuard>} />
                  <Route path="/mint" element={<AuthGuard><NFTMinter /></AuthGuard>} />
                  <Route path="/gallery" element={<NFTGallery />} />
                  <Route path="/nft/:tokenId" element={<NFTDetailWrapper />} />
                  <Route path="/copyright" element={<AuthGuard><CopyrightProtection /></AuthGuard>} />
                  <Route path="/bridge" element={<AuthGuard><BridgeInterface /></AuthGuard>} />
                  <Route path="/assets" element={<AuthGuard><MultiChainAssetManager /></AuthGuard>} />
                  <Route path="/token-economy" element={<TokenEconomyDashboard />} />
                  <Route path="/cbt-manager" element={<AuthGuard><CBTTokenManager /></AuthGuard>} />
                  <Route path="/swap" element={<AuthGuard><SwapInterface /></AuthGuard>} />
                  <Route path="/farming" element={<AuthGuard><FarmList /></AuthGuard>} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
                  <Route path="/security" element={<AuthGuard><SecuritySettings /></AuthGuard>} />
                  <Route path="/chat" element={<AuthGuard><ChatRoomList /></AuthGuard>} />
                  <Route path="/chat/:roomId" element={<AuthGuard><ChatWindow /></AuthGuard>} />
                  <Route path="/translate" element={<AuthGuard><VoiceTranslator /></AuthGuard>} />
                </Routes>
              </main>
              
              <footer className="App-footer">
                <p>CultureBridge - 基于BNB链的跨文化交流平台</p>
                <p>CBT代币驱动的去中心化文化生态系统</p>
              </footer>
            </div>
          </BlockchainProvider>
        </TokenProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// 用户菜单组件
function UserMenu() {
  const { isAuthenticated, user, logout } = React.useContext(AuthContext);
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <div className="user-menu">
      {isAuthenticated ? (
        <div className="authenticated-user">
          <span>欢迎, {user?.username || user?.walletAddress?.substring(0, 6) + '...' + user?.walletAddress?.substring(user.walletAddress.length - 4)}</span>
          <button onClick={logout} className="logout-button">登出</button>
        </div>
      ) : (
        <div className="auth-buttons">
          <a href="/login" className="login-button">登录</a>
          <a href="/register" className="register-button">注册</a>
        </div>
      )}
    </div>
  );
}

// 首页组件
function Home() {
  return (
    <div className="home-container">
      <h2>欢迎来到CultureBridge</h2>
      <p>探索基于区块链的跨文化交流新体验</p>
      
      <div className="feature-cards">
        <div className="feature-card highlight-card">
          <h3>区块链钱包</h3>
          <p>连接MetaMask钱包，管理CBT代币和BNB余额</p>
          <a href="/wallet" className="feature-link">打开钱包</a>
        </div>
        
        <div className="feature-card">
          <h3>创建文化NFT</h3>
          <p>将您的文化作品铸造为NFT，确保数字所有权</p>
          <a href="/mint" className="feature-link">开始创建</a>
        </div>
        
        <div className="feature-card">
          <h3>浏览NFT画廊</h3>
          <p>探索来自世界各地的文化艺术品</p>
          <a href="/gallery" className="feature-link">查看画廊</a>
        </div>
        
        <div className="feature-card">
          <h3>文化知识产权保护</h3>
          <p>基于区块链的文化作品版权登记与验证</p>
          <a href="/copyright" className="feature-link">保护作品</a>
        </div>
        
        <div className="feature-card">
          <h3>跨链资产桥</h3>
          <p>在多个区块链网络间安全转移您的资产</p>
          <a href="/bridge" className="feature-link">开始跨链</a>
        </div>
        
        <div className="feature-card highlight-card">
          <h3>多链资产管理</h3>
          <p>统一管理您在各个区块链上的数字资产</p>
          <a href="/assets" className="feature-link">管理资产</a>
        </div>
        
        <div className="feature-card highlight-card">
          <h3>CBT代币管理</h3>
          <p>管理您的CBT代币，包括转账、质押和授权操作</p>
          <a href="/cbt-manager" className="feature-link">管理CBT</a>
        </div>
        
        <div className="feature-card highlight-card">
          <h3>CBT代币经济</h3>
          <p>了解CBT代币经济模型与BNB链集成方案</p>
          <a href="/token-economy" className="feature-link">查看仪表盘</a>
        </div>
        
        <div className="feature-card highlight-card">
          <h3>DeFi交易所</h3>
          <p>去中心化代币交换，享受低滑点和高流动性</p>
          <a href="/swap" className="feature-link">开始交易</a>
        </div>
        
        <div className="feature-card highlight-card">
          <h3>流动性挖矿</h3>
          <p>提供流动性获得CBT代币奖励，参与收益农场</p>
          <a href="/farming" className="feature-link">开始挖矿</a>
        </div>

        <div className="feature-card highlight-card">
          <h3>实时聊天</h3>
          <p>与全球用户进行实时文化交流</p>
          <a href="/chat" className="feature-link">进入聊天室</a>
        </div>

        <div className="feature-card highlight-card">
          <h3>语音翻译</h3>
          <p>实时语音翻译，无障碍沟通</p>
          <a href="/translate" className="feature-link">开始翻译</a>
        </div>
      </div>
    </div>
  );
}

// NFT详情包装组件，用于获取路由参数
function NFTDetailWrapper() {
  const tokenId = window.location.pathname.split('/').pop();
  return <NFTDetail tokenId={tokenId} />;
}

export default App;


