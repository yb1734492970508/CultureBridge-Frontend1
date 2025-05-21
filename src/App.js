import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './components/pages/HomePage';
import ForumListPage from './components/pages/ForumListPage';
import EventsPage from './components/pages/EventsPage';
import { 
  NFTGallery, 
  NFTMinter, 
  TokenBalance, 
  TransactionHistory, 
  WalletConnect, 
  ContractInteraction,
  GovernanceProposal
} from './components/blockchain';
import { BlockchainProvider } from './context/blockchain';
import './styles/App.css';

function App() {
  return (
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
}

export default App;
