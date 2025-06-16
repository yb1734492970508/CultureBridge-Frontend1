import React from 'react';
import './styles/MarketAnalytics.css';

const MarketAnalytics = () => {
  // Dummy data for demonstration
  const tvl = 150000000; // Total Value Locked
  const totalBorrowed = 80000000;
  const utilizationRate = (totalBorrowed / tvl) * 100;

  return (
    <div className="market-analytics">
      <h2>市场分析</h2>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>总锁仓价值 (TVL)</h3>
          <p>${tvl.toLocaleString()}</p>
        </div>
        <div className="analytics-card">
          <h3>总借款量</h3>
          <p>${totalBorrowed.toLocaleString()}</p>
        </div>
        <div className="analytics-card">
          <h3>资金利用率</h3>
          <p>{utilizationRate.toFixed(2)}%</p>
        </div>
        {/* TODO: Add more market metrics and charts */}
      </div>
    </div>
  );
};

export default MarketAnalytics;


