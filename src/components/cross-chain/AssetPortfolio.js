import React, { useState, useCallback } from 'react';
import ChainSelector from './ChainSelector';
import './AssetPortfolio.css';

/**
 * 资产组合组件
 * 显示用户在各个链上的资产分布和详情
 */
const AssetPortfolio = ({
  chains,
  selectedChain,
  assets,
  balances,
  totalValue,
  onChainSelect,
  onRefresh
}) => {
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('value'); // value, name, balance
  const [filterType, setFilterType] = useState('all'); // all, tokens, nfts

  // 筛选和排序资产
  const filteredAndSortedBalances = React.useMemo(() => {
    let filtered = balances;

    // 按类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(balance => {
        if (filterType === 'tokens') return balance.type === 'token';
        if (filterType === 'nfts') return balance.type === 'nft';
        return true;
      });
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b.value || 0) - (a.value || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'balance':
          return parseFloat(b.balance) - parseFloat(a.balance);
        default:
          return 0;
      }
    });

    return filtered;
  }, [balances, filterType, sortBy]);

  // 获取链信息
  const getChainInfo = (chainId) => {
    return chains.find(chain => chain.id === chainId);
  };

  // 格式化余额
  const formatBalance = (balance, decimals = 4) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(decimals);
  };

  // 格式化价值
  const formatValue = (value) => {
    if (!value || value === 0) return '$0.00';
    if (value < 0.01) return '< $0.01';
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 渲染链分布图表
  const renderChainDistribution = () => {
    const chainValues = chains.map(chain => {
      const chainBalances = balances.filter(balance => balance.chainId === chain.id);
      const chainValue = chainBalances.reduce((sum, balance) => sum + (balance.value || 0), 0);
      return {
        chain,
        value: chainValue,
        percentage: totalValue > 0 ? (chainValue / totalValue) * 100 : 0
      };
    }).filter(item => item.value > 0);

    return (
      <div className="chain-distribution">
        <h3>链分布</h3>
        <div className="distribution-chart">
          {chainValues.map(({ chain, value, percentage }) => (
            <div 
              key={chain.id}
              className={`distribution-item ${selectedChain === chain.id ? 'active' : ''}`}
              onClick={() => onChainSelect(chain.id)}
            >
              <div className="chain-info">
                <img src={chain.icon} alt={chain.name} className="chain-icon" />
                <div className="chain-details">
                  <div className="chain-name">{chain.name}</div>
                  <div className="chain-value">{formatValue(value)}</div>
                </div>
              </div>
              <div className="percentage-bar">
                <div 
                  className="percentage-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="percentage-text">{percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染控制栏
  const renderControls = () => (
    <div className="portfolio-controls">
      <div className="controls-left">
        <ChainSelector
          chains={chains}
          selectedChain={selectedChain}
          onSelect={onChainSelect}
        />
        
        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">所有资产</option>
            <option value="tokens">代币</option>
            <option value="nfts">NFT</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="value">按价值排序</option>
            <option value="name">按名称排序</option>
            <option value="balance">按余额排序</option>
          </select>
        </div>
      </div>

      <div className="controls-right">
        <div className="view-mode-toggle">
          <button
            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="网格视图"
          >
            ⊞
          </button>
          <button
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="列表视图"
          >
            ☰
          </button>
        </div>
        
        <button className="refresh-button" onClick={onRefresh}>
          🔄
        </button>
      </div>
    </div>
  );

  // 渲染资产卡片
  const renderAssetCard = (balance) => {
    const chainInfo = getChainInfo(balance.chainId);
    
    return (
      <div key={`${balance.chainId}-${balance.address}`} className="asset-card">
        <div className="asset-header">
          <div className="asset-icon-container">
            <img 
              src={balance.icon || '/default-token.png'} 
              alt={balance.name}
              className="asset-icon"
            />
            <img 
              src={chainInfo?.icon} 
              alt={chainInfo?.name}
              className="chain-badge"
            />
          </div>
          <div className="asset-info">
            <div className="asset-name">{balance.name}</div>
            <div className="asset-symbol">{balance.symbol}</div>
          </div>
        </div>

        <div className="asset-balance">
          <div className="balance-amount">
            {formatBalance(balance.balance)} {balance.symbol}
          </div>
          <div className="balance-value">
            {formatValue(balance.value)}
          </div>
        </div>

        {balance.type === 'nft' && (
          <div className="nft-info">
            <div className="nft-count">数量: {balance.count || 1}</div>
            {balance.floorPrice && (
              <div className="floor-price">
                地板价: {formatValue(balance.floorPrice)}
              </div>
            )}
          </div>
        )}

        <div className="asset-actions">
          <button className="action-button send">发送</button>
          <button className="action-button bridge">桥接</button>
          {balance.type === 'token' && (
            <button className="action-button swap">交换</button>
          )}
        </div>
      </div>
    );
  };

  // 渲染资产列表项
  const renderAssetListItem = (balance) => {
    const chainInfo = getChainInfo(balance.chainId);
    
    return (
      <div key={`${balance.chainId}-${balance.address}`} className="asset-list-item">
        <div className="asset-basic-info">
          <div className="asset-icon-container">
            <img 
              src={balance.icon || '/default-token.png'} 
              alt={balance.name}
              className="asset-icon"
            />
            <img 
              src={chainInfo?.icon} 
              alt={chainInfo?.name}
              className="chain-badge"
            />
          </div>
          <div className="asset-details">
            <div className="asset-name">{balance.name}</div>
            <div className="asset-symbol">{balance.symbol}</div>
          </div>
        </div>

        <div className="asset-balance-info">
          <div className="balance-amount">
            {formatBalance(balance.balance)} {balance.symbol}
          </div>
          <div className="balance-value">
            {formatValue(balance.value)}
          </div>
        </div>

        <div className="asset-chain-info">
          <div className="chain-name">{chainInfo?.name}</div>
          <div className="asset-type">{balance.type === 'nft' ? 'NFT' : '代币'}</div>
        </div>

        <div className="asset-actions">
          <button className="action-button-small send">发送</button>
          <button className="action-button-small bridge">桥接</button>
          {balance.type === 'token' && (
            <button className="action-button-small swap">交换</button>
          )}
        </div>
      </div>
    );
  };

  // 渲染资产列表
  const renderAssetList = () => {
    if (filteredAndSortedBalances.length === 0) {
      return (
        <div className="empty-portfolio">
          <div className="empty-icon">💰</div>
          <h3>暂无资产</h3>
          <p>在选定的链上未找到任何资产</p>
          <button className="refresh-button" onClick={onRefresh}>
            刷新资产
          </button>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="assets-grid">
          {filteredAndSortedBalances.map(renderAssetCard)}
        </div>
      );
    } else {
      return (
        <div className="assets-list">
          <div className="list-header">
            <div className="header-item">资产</div>
            <div className="header-item">余额</div>
            <div className="header-item">网络</div>
            <div className="header-item">操作</div>
          </div>
          {filteredAndSortedBalances.map(renderAssetListItem)}
        </div>
      );
    }
  };

  return (
    <div className="asset-portfolio">
      {/* 链分布图表 */}
      {renderChainDistribution()}

      {/* 控制栏 */}
      {renderControls()}

      {/* 资产列表 */}
      <div className="portfolio-content">
        <div className="content-header">
          <h3>
            {getChainInfo(selectedChain)?.name || '所有链'} 上的资产
            <span className="asset-count">({filteredAndSortedBalances.length})</span>
          </h3>
          <div className="total-value">
            总价值: {formatValue(
              filteredAndSortedBalances.reduce((sum, balance) => sum + (balance.value || 0), 0)
            )}
          </div>
        </div>
        
        {renderAssetList()}
      </div>
    </div>
  );
};

export default AssetPortfolio;

