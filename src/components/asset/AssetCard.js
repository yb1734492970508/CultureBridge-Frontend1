import React, { useState } from 'react';

/**
 * 资产卡片组件
 * 显示单个资产的详细信息
 */
const AssetCard = ({ asset }) => {
  const [showActions, setShowActions] = useState(false);

  // 格式化数字
  const formatNumber = (num, decimals = 2) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  // 格式化余额
  const formatBalance = (balance) => {
    if (balance >= 1000) {
      return formatNumber(balance, 2);
    }
    return balance.toFixed(4);
  };

  // 获取链信息
  const getChainInfo = (chainId) => {
    const chains = {
      ethereum: { name: 'Ethereum', color: '#627eea', icon: '⟠' },
      bnb: { name: 'BNB Chain', color: '#f3ba2f', icon: '🟡' },
      polygon: { name: 'Polygon', color: '#8247e5', icon: '🟣' }
    };
    return chains[chainId] || { name: chainId, color: '#6c757d', icon: '❓' };
  };

  const chainInfo = getChainInfo(asset.chainId);

  // 处理快速操作
  const handleQuickAction = (action) => {
    console.log(`执行操作: ${action} for ${asset.symbol}`);
    // 这里可以添加实际的操作逻辑
  };

  return (
    <div 
      className="asset-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="asset-main-info">
        <div className="asset-icon-section">
          <div className="asset-icon">
            {asset.icon}
          </div>
          <div className="chain-badge" style={{ backgroundColor: chainInfo.color }}>
            {chainInfo.icon}
          </div>
        </div>
        
        <div className="asset-details">
          <div className="asset-header">
            <h4 className="asset-symbol">{asset.symbol}</h4>
            <span className="asset-name">{asset.name}</span>
          </div>
          
          <div className="asset-chain">
            <span className="chain-name">{chainInfo.name}</span>
            {asset.address !== 'native' && (
              <span className="asset-address">
                {asset.address.slice(0, 6)}...{asset.address.slice(-4)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="asset-balance-info">
        <div className="balance-section">
          <div className="balance-amount">
            {formatBalance(asset.balance)} {asset.symbol}
          </div>
          <div className="balance-value">
            ${formatNumber(asset.value)}
          </div>
        </div>
        
        <div className="price-section">
          <div className="current-price">
            ${asset.price.toFixed(asset.price < 1 ? 4 : 2)}
          </div>
          <div className={`price-change ${asset.change24h >= 0 ? 'positive' : 'negative'}`}>
            {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
          </div>
        </div>
      </div>

      {showActions && (
        <div className="asset-actions">
          <button 
            className="action-btn transfer"
            onClick={() => handleQuickAction('transfer')}
            title="转账"
          >
            📤
          </button>
          <button 
            className="action-btn bridge"
            onClick={() => handleQuickAction('bridge')}
            title="跨链"
          >
            🌉
          </button>
          <button 
            className="action-btn stake"
            onClick={() => handleQuickAction('stake')}
            title="质押"
          >
            🔒
          </button>
          <button 
            className="action-btn more"
            onClick={() => handleQuickAction('more')}
            title="更多"
          >
            ⋯
          </button>
        </div>
      )}
    </div>
  );
};

export default AssetCard;

