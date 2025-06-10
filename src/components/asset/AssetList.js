import React, { useState } from 'react';
import AssetCard from './AssetCard';

/**
 * 资产列表组件
 * 显示用户的资产列表
 */
const AssetList = ({ assets, selectedChain, loading, error, onRefresh }) => {
  const [sortBy, setSortBy] = useState('value'); // 'value', 'balance', 'change'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤和排序资产
  const processedAssets = React.useMemo(() => {
    let filtered = assets;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'balance':
          aValue = a.balance;
          bValue = b.balance;
          break;
        case 'change':
          aValue = a.change24h;
          bValue = b.change24h;
          break;
        case 'value':
        default:
          aValue = a.value;
          bValue = b.value;
          break;
      }

      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [assets, searchTerm, sortBy, sortDirection]);

  // 处理排序
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // 获取排序图标
  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="asset-list loading">
        <div className="loading-spinner"></div>
        <p>加载资产列表中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asset-list error">
        <div className="error-message">
          <h3>加载失败</h3>
          <p>{error}</p>
          <button onClick={onRefresh} className="retry-button">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-list">
      <div className="asset-list-header">
        <h3>资产列表</h3>
        
        <div className="list-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索资产..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sort-controls">
            <button
              className={`sort-button ${sortBy === 'value' ? 'active' : ''}`}
              onClick={() => handleSort('value')}
            >
              价值 {getSortIcon('value')}
            </button>
            <button
              className={`sort-button ${sortBy === 'balance' ? 'active' : ''}`}
              onClick={() => handleSort('balance')}
            >
              余额 {getSortIcon('balance')}
            </button>
            <button
              className={`sort-button ${sortBy === 'change' ? 'active' : ''}`}
              onClick={() => handleSort('change')}
            >
              涨跌 {getSortIcon('change')}
            </button>
          </div>
        </div>
      </div>

      <div className="asset-cards">
        {processedAssets.length > 0 ? (
          processedAssets.map((asset, index) => (
            <AssetCard
              key={`${asset.chainId}-${asset.symbol}-${index}`}
              asset={asset}
            />
          ))
        ) : (
          <div className="empty-state">
            <h3>暂无资产</h3>
            <p>
              {searchTerm 
                ? `没有找到包含 "${searchTerm}" 的资产` 
                : selectedChain === 'all' 
                  ? '您还没有任何资产' 
                  : '在此链上没有找到资产'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetList;

