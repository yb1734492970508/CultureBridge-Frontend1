import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WalletConnector from './components/blockchain/WalletConnector';
import NFTMinter from './components/blockchain/NFTMinter';
import NFTGallery from './components/blockchain/NFTGallery';
import NFTDetail from './components/blockchain/NFTDetail';
import CopyrightProtection from './components/blockchain/CopyrightProtection';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>CultureBridge</h1>
        <div className="wallet-section">
          <WalletConnector />
        </div>
      </header>
      
      <main className="App-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<NFTMinter />} />
          <Route path="/gallery" element={<NFTGallery />} />
          <Route path="/nft/:tokenId" element={<NFTDetailWrapper />} />
          <Route path="/copyright" element={<CopyrightProtection />} />
        </Routes>
      </main>
      
      <footer className="App-footer">
        <p>CultureBridge - 基于区块链的跨文化交流平台</p>
      </footer>
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
