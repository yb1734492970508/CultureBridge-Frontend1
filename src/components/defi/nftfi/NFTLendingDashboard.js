import React, { useState } from 'react';
import NFTMarketOverview from './NFTMarketOverview';
import NFTCollateralManager from './NFTCollateralManager';
import NFTBorrowInterface from './NFTBorrowInterface';
import NFTRepayWithdraw from './NFTRepayWithdraw';
import NFTLoanHistory from './NFTLoanHistory';
import './styles/NFTLendingDashboard.css';

const NFTLendingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <NFTMarketOverview />
          </div>
        );
      case 'collateral':
        return (
          <div className="tab-content">
            <NFTCollateralManager />
          </div>
        );
      case 'borrow':
        return (
          <div className="tab-content">
            <NFTBorrowInterface />
          </div>
        );
      case 'repay':
        return (
          <div className="tab-content">
            <NFTRepayWithdraw />
          </div>
        );
      case 'history':
        return (
          <div className="tab-content">
            <NFTLoanHistory />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="nft-lending-dashboard">
      <h1>NFT金融 (NFTFi)</h1>
      <p className="dashboard-description">
        将您的NFT作为抵押品获得流动性，或参与NFT借贷市场获得收益
      </p>
      
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          市场概览
        </button>
        <button
          className={`tab-button ${activeTab === 'collateral' ? 'active' : ''}`}
          onClick={() => setActiveTab('collateral')}
        >
          抵押管理
        </button>
        <button
          className={`tab-button ${activeTab === 'borrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrow')}
        >
          NFT借款
        </button>
        <button
          className={`tab-button ${activeTab === 'repay' ? 'active' : ''}`}
          onClick={() => setActiveTab('repay')}
        >
          还款赎回
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          历史记录
        </button>
      </div>
      
      {renderTabContent()}
    </div>
  );
};

export default NFTLendingDashboard;

