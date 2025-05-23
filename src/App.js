import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './components/pages/HomePage';
import ForumListPage from './components/pages/ForumListPage';
import EventsPage from './components/pages/EventsPage';
import WalletConnect from './components/WalletConnect';
import UserIdentity from './components/UserIdentity';
import AssetManagement from './components/AssetManagement';
import MarketplaceView from './components/MarketplaceView';
import { BlockchainProvider } from './context/blockchain';
import './styles/App.css';

// 区块链组件导入
import { 
  NFTGallery, 
  NFTMinter, 
  TokenBalance, 
  TransactionHistory, 
  ContractInteraction,
  GovernanceProposal,
  CrossChainBridge
} from './components/blockchain';

function App() {
  const [account, setAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  // 监听账户变化
  useEffect(() => {
    const handleAccountChanged = (event) => {
      setAccount(event.detail);
    };

    const handleDisconnect = () => {
      setAccount(null);
    };

    window.addEventListener('accountChanged', handleAccountChanged);
    window.addEventListener('walletDisconnected', handleDisconnect);

    return () => {
      window.removeEventListener('accountChanged', handleAccountChanged);
      window.removeEventListener('walletDisconnected', handleDisconnect);
    };
  }, []);

  // 切换标签页
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 简单版本 - 直接在页面中集成区块链功能
  const SimpleApp = () => (
    <div className="App">
      <header className="App-header">
        <h1>CultureBridge</h1>
        <p>连接世界，促进文化交流</p>
        <div className="wallet-section">
          <WalletConnect />
        </div>
      </header>

      <nav className="main-nav">
        <ul>
          <li className={activeTab === 'home' ? 'active' : ''}>
            <button onClick={() => handleTabChange('home')}>首页</button>
          </li>
          <li className={activeTab === 'identity' ? 'active' : ''}>
            <button onClick={() => handleTabChange('identity')}>身份管理</button>
          </li>
          <li className={activeTab === 'assets' ? 'active' : ''}>
            <button onClick={() => handleTabChange('assets')}>资产管理</button>
          </li>
          <li className={activeTab === 'marketplace' ? 'active' : ''}>
            <button onClick={() => handleTabChange('marketplace')}>文化市场</button>
          </li>
        </ul>
      </nav>

      <main>
        {activeTab === 'home' && (
          <section className="welcome-section">
            <h2>欢迎来到CultureBridge</h2>
            <p>这是一个基于区块链技术的跨文化交流平台，旨在连接不同文化背景的人们，促进文化理解与交流。</p>
            <div className="features">
              <div className="feature">
                <h3>数字身份</h3>
                <p>创建您的区块链身份，安全地管理您的文化身份和声誉。</p>
              </div>
              <div className="feature">
                <h3>文化资产</h3>
                <p>将您的文化作品和资源数字化，创建独特的NFT资产。</p>
              </div>
              <div className="feature">
                <h3>文化交流</h3>
                <p>参与各种文化交流活动，分享您的文化知识和经验。</p>
              </div>
              <div className="feature">
                <h3>文化市场</h3>
                <p>在去中心化市场中交易文化资产，支持文化创作者。</p>
              </div>
            </div>
            <div className="get-started">
              <h3>开始使用</h3>
              <p>连接您的钱包，开始您的文化交流之旅！</p>
            </div>
          </section>
        )}

        {activeTab === 'identity' && (
          <section className="identity-section">
            <UserIdentity account={account} />
          </section>
        )}

        {activeTab === 'assets' && (
          <section className="assets-section">
            <AssetManagement account={account} />
          </section>
        )}

        {activeTab === 'marketplace' && (
          <section className="marketplace-section">
            <MarketplaceView account={account} />
          </section>
        )}
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} CultureBridge. All rights reserved.</p>
      </footer>
    </div>
  );

  // 路由版本 - 使用React Router进行页面路由
  const RoutedApp = () => (
    <BlockchainProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/forum" element={<ForumListPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/nft/gallery" element={<NFTGallery />} />
            <Route path="/nft/create" element={<NFTMinter />} />
            <Route path="/token/balance" element={<TokenBalance />} />
            <Route path="/transaction/history" element={<TransactionHistory />} />
            <Route path="/contract/interaction" element={<ContractInteraction />} />
            <Route path="/governance" element={<GovernanceProposal />} />
            <Route path="/bridge" element={<CrossChainBridge />} />
            <Route path="/identity" element={<UserIdentity account={account} />} />
            <Route path="/assets" element={<AssetManagement account={account} />} />
            <Route path="/marketplace" element={<MarketplaceView account={account} />} />
            <Route path="*" element={
              <div className="coming-soon">
                <h2>功能开发中</h2>
                <p>该页面正在开发中，敬请期待！</p>
              </div>
            } />
          </Routes>
        </Layout>
      </Router>
    </BlockchainProvider>
  );

  // 根据环境变量或配置选择使用哪个版本的App
  // 这里默认使用路由版本，更适合大型应用
  return <RoutedApp />;
}

export default App;
