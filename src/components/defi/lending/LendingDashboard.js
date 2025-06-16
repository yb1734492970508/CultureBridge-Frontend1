import React, { useState } from 'react';
import LendingInterface from './LendingInterface';
import CollateralManager from './CollateralManager';
import RiskCalculator from './RiskCalculator';
import LendingHistory from './LendingHistory';
import MarketAnalytics from './MarketAnalytics';
import InterestRateChart from './InterestRateChart';
import LiquidationAlert from './LiquidationAlert';
import './styles/LendingDashboard.css';

const LendingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for demonstration
  const userHealthFactor = 1.1; // Example health factor that triggers alert

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <MarketAnalytics />
            <InterestRateChart />
          </div>
        );
      case 'lending':
        return (
          <div className="tab-content">
            <LiquidationAlert healthFactor={userHealthFactor} />
            <LendingInterface />
          </div>
        );
      case 'collateral':
        return (
          <div className="tab-content">
            <CollateralManager />
            <RiskCalculator />
          </div>
        );
      case 'history':
        return (
          <div className="tab-content">
            <LendingHistory />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="lending-dashboard">
      <h1>借贷协议</h1>
      <p className="dashboard-description">
        去中心化借贷平台，通过抵押数字资产获得流动性，或存款获得收益
      </p>
      
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          市场概览
        </button>
        <button
          className={`tab-button ${activeTab === 'lending' ? 'active' : ''}`}
          onClick={() => setActiveTab('lending')}
        >
          借贷操作
        </button>
        <button
          className={`tab-button ${activeTab === 'collateral' ? 'active' : ''}`}
          onClick={() => setActiveTab('collateral')}
        >
          抵押管理
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

export default LendingDashboard;


