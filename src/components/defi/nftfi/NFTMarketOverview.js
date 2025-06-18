import React from 'react';
import './styles/NFTMarketOverview.css';

const NFTMarketOverview = () => {
  // 模拟市场数据
  const marketStats = {
    totalValueLocked: 15000000, // 总锁仓价值 (USD)
    totalNFTsCollateralized: 2500, // 已抵押NFT数量
    totalBorrowed: 8500000, // 总借款量 (USD)
    averageInterestRate: 12.5, // 平均利率 (%)
  };

  // 模拟NFT系列数据
  const nftCollections = [
    {
      name: 'CryptoPunks',
      floorPrice: 45.2,
      maxLTV: 50,
      interestRate: 8.5,
      totalCollateralized: 120,
      icon: '🎭'
    },
    {
      name: 'Bored Ape Yacht Club',
      floorPrice: 28.7,
      maxLTV: 45,
      interestRate: 9.2,
      totalCollateralized: 85,
      icon: '🐵'
    },
    {
      name: 'Azuki',
      floorPrice: 12.3,
      maxLTV: 40,
      interestRate: 10.1,
      totalCollateralized: 65,
      icon: '🌸'
    },
    {
      name: 'Doodles',
      floorPrice: 8.9,
      maxLTV: 35,
      interestRate: 11.5,
      totalCollateralized: 42,
      icon: '🎨'
    }
  ];

  return (
    <div className="nft-market-overview">
      <h2>NFT借贷市场概览</h2>
      
      {/* 市场统计 */}
      <div className="market-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>总锁仓价值</h3>
            <p className="stat-value">${marketStats.totalValueLocked.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🖼️</div>
          <div className="stat-content">
            <h3>已抵押NFT</h3>
            <p className="stat-value">{marketStats.totalNFTsCollateralized.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>总借款量</h3>
            <p className="stat-value">${marketStats.totalBorrowed.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>平均利率</h3>
            <p className="stat-value">{marketStats.averageInterestRate}%</p>
          </div>
        </div>
      </div>

      {/* NFT系列列表 */}
      <div className="collections-section">
        <h3>支持的NFT系列</h3>
        <div className="collections-grid">
          {nftCollections.map((collection, index) => (
            <div key={index} className="collection-card">
              <div className="collection-header">
                <span className="collection-icon">{collection.icon}</span>
                <h4>{collection.name}</h4>
              </div>
              
              <div className="collection-stats">
                <div className="stat-row">
                  <span className="stat-label">地板价:</span>
                  <span className="stat-value">{collection.floorPrice} ETH</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">最大LTV:</span>
                  <span className="stat-value">{collection.maxLTV}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">利率:</span>
                  <span className="stat-value interest-rate">{collection.interestRate}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">已抵押:</span>
                  <span className="stat-value">{collection.totalCollateralized}</span>
                </div>
              </div>
              
              <button className="collection-action-btn">
                查看详情
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 市场趋势 */}
      <div className="market-trends">
        <h3>市场趋势</h3>
        <div className="trend-info">
          <div className="trend-item">
            <span className="trend-indicator positive">↗</span>
            <span>NFT抵押量较上周增长 15.2%</span>
          </div>
          <div className="trend-item">
            <span className="trend-indicator negative">↘</span>
            <span>平均借贷利率较上月下降 2.1%</span>
          </div>
          <div className="trend-item">
            <span className="trend-indicator positive">↗</span>
            <span>新增支持NFT系列 3 个</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMarketOverview;

