import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth/AuthContext';
import { TokenProvider } from './context/token/TokenContext';
import { BlockchainProvider } from './context/blockchain/BlockchainContext';
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
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Profile from './pages/auth/Profile';
import SecuritySettings from './pages/auth/SecuritySettings';
import './App.css';

function App() {
  return (
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
                <li className="nav-item"><a href="/wallet" className="nav-link">区块链钱包</a></li>
                <li className="nav-item"><a href="/gallery" className="nav-link">NFT画廊</a></li>
                <li className="nav-item"><a href="/mint" className="nav-link">创建NFT</a></li>
                <li className="nav-item"><a href="/copyright" className="nav-link">版权保护</a></li>
                <li className="nav-item"><a href="/bridge" className="nav-link">跨链桥</a></li>
                <li className="nav-item"><a href="/assets" className="nav-link">资产管理</a></li>
                <li className="nav-item"><a href="/token-economy" className="nav-link">代币经济</a></li>
                <li className="nav-item"><a href="/cbt-manager" className="nav-link">CBT管理</a></li>
              </ul>
            </nav>
            
            <main className="App-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/wallet" element={<BlockchainWallet />} />
                <Route path="/mint" element={<NFTMinter />} />
                <Route path="/gallery" element={<NFTGallery />} />
                <Route path="/nft/:tokenId" element={<NFTDetailWrapper />} />
                <Route path="/copyright" element={<CopyrightProtection />} />
                <Route path="/bridge" element={<CrossChainBridge />} />
                <Route path="/assets" element={<MultiChainAssetManager />} />
                <Route path="/token-economy" element={<TokenEconomyDashboard />} />
                <Route path="/cbt-manager" element={<CBTTokenManager />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/security" element={<SecuritySettings />} />
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
  );
}

// 用户菜单组件
function UserMenu() {
  // 暂时注释掉AuthProvider相关代码，避免错误
  // const { isAuthenticated, user, logout } = React.useContext(AuthProvider);
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <div className="user-menu">
      <div className="auth-buttons">
        <a href="/login" className="login-button">登录</a>
        <a href="/register" className="register-button">注册</a>
      </div>
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
