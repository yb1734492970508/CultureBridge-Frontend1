import React, { useState } from 'react';
import './styles/NFTCollateralManager.css';

const NFTCollateralManager = () => {
  // 模拟用户抵押的NFT数据
  const [collateralizedNFTs] = useState([
    {
      id: 1,
      tokenId: '1234',
      collection: 'CryptoPunks',
      name: 'CryptoPunk #1234',
      image: 'https://via.placeholder.com/200x200/667eea/ffffff?text=Punk%231234',
      collateralValue: 45.2, // ETH
      borrowedAmount: 22.6, // ETH
      healthFactor: 1.8,
      liquidationPrice: 35.0, // ETH
      interestRate: 8.5,
      status: 'healthy'
    },
    {
      id: 2,
      tokenId: '5678',
      collection: 'Bored Ape Yacht Club',
      name: 'Bored Ape #5678',
      image: 'https://via.placeholder.com/200x200/764ba2/ffffff?text=Ape%235678',
      collateralValue: 28.7, // ETH
      borrowedAmount: 17.2, // ETH
      healthFactor: 1.4,
      liquidationPrice: 22.0, // ETH
      interestRate: 9.2,
      status: 'warning'
    },
    {
      id: 3,
      tokenId: '9999',
      collection: 'Azuki',
      name: 'Azuki #9999',
      image: 'https://via.placeholder.com/200x200/ff6b6b/ffffff?text=Azuki%239999',
      collateralValue: 12.3, // ETH
      borrowedAmount: 9.8, // ETH
      healthFactor: 1.1,
      liquidationPrice: 11.0, // ETH
      interestRate: 10.1,
      status: 'danger'
    }
  ]);

  const getHealthFactorColor = (healthFactor) => {
    if (healthFactor >= 1.5) return 'healthy';
    if (healthFactor >= 1.2) return 'warning';
    return 'danger';
  };

  const getStatusBadge = (status) => {
    const badges = {
      healthy: { text: '健康', class: 'status-healthy' },
      warning: { text: '警告', class: 'status-warning' },
      danger: { text: '危险', class: 'status-danger' }
    };
    return badges[status] || badges.healthy;
  };

  return (
    <div className="nft-collateral-manager">
      <h2>NFT抵押品管理</h2>
      <p className="section-description">
        管理您已抵押的NFT，监控健康因子，避免清算风险
      </p>

      {collateralizedNFTs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🖼️</div>
          <h3>暂无抵押的NFT</h3>
          <p>您还没有抵押任何NFT，前往借款页面开始使用NFT获得流动性</p>
          <button className="empty-action-btn">开始借款</button>
        </div>
      ) : (
        <div className="collateral-grid">
          {collateralizedNFTs.map((nft) => (
            <div key={nft.id} className="collateral-card">
              <div className="nft-image-container">
                <img src={nft.image} alt={nft.name} className="nft-image" />
                <div className={`status-badge ${getStatusBadge(nft.status).class}`}>
                  {getStatusBadge(nft.status).text}
                </div>
              </div>
              
              <div className="nft-info">
                <h3 className="nft-name">{nft.name}</h3>
                <p className="nft-collection">{nft.collection}</p>
              </div>

              <div className="collateral-stats">
                <div className="stat-row">
                  <span className="stat-label">抵押价值:</span>
                  <span className="stat-value">{nft.collateralValue} ETH</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">借款金额:</span>
                  <span className="stat-value">{nft.borrowedAmount} ETH</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">健康因子:</span>
                  <span className={`stat-value health-factor ${getHealthFactorColor(nft.healthFactor)}`}>
                    {nft.healthFactor.toFixed(2)}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">清算价格:</span>
                  <span className="stat-value">{nft.liquidationPrice} ETH</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">利率:</span>
                  <span className="stat-value interest-rate">{nft.interestRate}%</span>
                </div>
              </div>

              <div className="collateral-actions">
                <button className="action-btn primary">追加抵押</button>
                <button className="action-btn secondary">部分还款</button>
                <button className="action-btn danger">全额还款</button>
              </div>

              {nft.healthFactor < 1.3 && (
                <div className="risk-warning">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-content">
                    <strong>清算风险警告!</strong>
                    <p>您的健康因子较低，建议立即追加抵押品或部分还款以避免清算</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 总体统计 */}
      {collateralizedNFTs.length > 0 && (
        <div className="portfolio-summary">
          <h3>投资组合概览</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">总抵押价值:</span>
              <span className="summary-value">
                {collateralizedNFTs.reduce((sum, nft) => sum + nft.collateralValue, 0).toFixed(2)} ETH
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">总借款金额:</span>
              <span className="summary-value">
                {collateralizedNFTs.reduce((sum, nft) => sum + nft.borrowedAmount, 0).toFixed(2)} ETH
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">平均健康因子:</span>
              <span className="summary-value">
                {(collateralizedNFTs.reduce((sum, nft) => sum + nft.healthFactor, 0) / collateralizedNFTs.length).toFixed(2)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">风险NFT数量:</span>
              <span className="summary-value danger">
                {collateralizedNFTs.filter(nft => nft.healthFactor < 1.3).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTCollateralManager;

