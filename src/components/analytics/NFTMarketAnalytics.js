import React, { useState, useEffect, useCallback } from 'react';
import { useNFTMarketAnalytics } from '../../hooks/useNFTMarketAnalytics';
import MarketOverview from './MarketOverview';
import TrendingCollections from './TrendingCollections';
import PriceAnalysis from './PriceAnalysis';
import VolumeAnalysis from './VolumeAnalysis';
import CollectionComparison from './CollectionComparison';
import MarketInsights from './MarketInsights';
import './NFTMarketAnalytics.css';

/**
 * NFT市场分析组件
 * 提供全面的NFT市场数据分析和可视化
 */
const NFTMarketAnalytics = ({ 
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d'); // 1d, 7d, 30d, 90d, 1y
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: { min: 0, max: Infinity },
    volumeRange: { min: 0, max: Infinity }
  });

  const {
    marketData,
    trendingCollections,
    priceData,
    volumeData,
    insights,
    loading,
    error,
    fetchMarketData,
    fetchTrendingCollections,
    fetchPriceData,
    fetchVolumeData,
    fetchInsights,
    refreshData
  } = useNFTMarketAnalytics();

  // 初始化数据
  useEffect(() => {
    fetchMarketData(timeRange);
    fetchTrendingCollections(timeRange);
    fetchPriceData(timeRange);
    fetchVolumeData(timeRange);
    fetchInsights(timeRange);
  }, [timeRange, fetchMarketData, fetchTrendingCollections, fetchPriceData, fetchVolumeData, fetchInsights]);

  // 处理时间范围变更
  const handleTimeRangeChange = useCallback((newTimeRange) => {
    setTimeRange(newTimeRange);
  }, []);

  // 处理集合选择
  const handleCollectionSelect = useCallback((collection) => {
    setSelectedCollections(prev => {
      const isSelected = prev.some(c => c.address === collection.address);
      if (isSelected) {
        return prev.filter(c => c.address !== collection.address);
      } else if (prev.length < 5) {
        return [...prev, collection];
      } else {
        // 替换第一个
        return [collection, ...prev.slice(1)];
      }
    });
  }, []);

  // 处理筛选器变更
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    refreshData(timeRange);
  }, [refreshData, timeRange]);

  // 渲染标签页
  const renderTabs = () => {
    const tabs = [
      { id: 'overview', label: '市场概览', icon: '📊' },
      { id: 'trending', label: '热门集合', icon: '🔥' },
      { id: 'price', label: '价格分析', icon: '💰' },
      { id: 'volume', label: '交易量分析', icon: '📈' },
      { id: 'comparison', label: '集合对比', icon: '⚖️' },
      { id: 'insights', label: '市场洞察', icon: '🔍' }
    ];

    return (
      <div className="analytics-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // 渲染时间范围选择器
  const renderTimeRangeSelector = () => {
    const ranges = [
      { value: '1d', label: '1天' },
      { value: '7d', label: '7天' },
      { value: '30d', label: '30天' },
      { value: '90d', label: '90天' },
      { value: '1y', label: '1年' }
    ];

    return (
      <div className="time-range-selector">
        <label className="selector-label">时间范围:</label>
        <div className="range-buttons">
          {ranges.map(range => (
            <button
              key={range.value}
              className={`range-button ${timeRange === range.value ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 渲染筛选器
  const renderFilters = () => (
    <div className="analytics-filters">
      <div className="filter-group">
        <label className="filter-label">类别:</label>
        <select
          value={filters.category}
          onChange={(e) => handleFiltersChange({ category: e.target.value })}
          className="filter-select"
        >
          <option value="all">所有类别</option>
          <option value="art">艺术</option>
          <option value="gaming">游戏</option>
          <option value="music">音乐</option>
          <option value="sports">体育</option>
          <option value="utility">实用</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">价格范围 (ETH):</label>
        <div className="range-inputs">
          <input
            type="number"
            placeholder="最低"
            value={filters.priceRange.min || ''}
            onChange={(e) => handleFiltersChange({
              priceRange: { ...filters.priceRange, min: parseFloat(e.target.value) || 0 }
            })}
            className="range-input"
          />
          <span className="range-separator">-</span>
          <input
            type="number"
            placeholder="最高"
            value={filters.priceRange.max === Infinity ? '' : filters.priceRange.max}
            onChange={(e) => handleFiltersChange({
              priceRange: { ...filters.priceRange, max: parseFloat(e.target.value) || Infinity }
            })}
            className="range-input"
          />
        </div>
      </div>
    </div>
  );

  // 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <MarketOverview
            data={marketData}
            timeRange={timeRange}
            onRefresh={handleRefresh}
          />
        );
      
      case 'trending':
        return (
          <TrendingCollections
            collections={trendingCollections}
            timeRange={timeRange}
            filters={filters}
            onCollectionSelect={handleCollectionSelect}
            selectedCollections={selectedCollections}
          />
        );
      
      case 'price':
        return (
          <PriceAnalysis
            data={priceData}
            timeRange={timeRange}
            filters={filters}
            selectedCollections={selectedCollections}
          />
        );
      
      case 'volume':
        return (
          <VolumeAnalysis
            data={volumeData}
            timeRange={timeRange}
            filters={filters}
            selectedCollections={selectedCollections}
          />
        );
      
      case 'comparison':
        return (
          <CollectionComparison
            collections={selectedCollections}
            timeRange={timeRange}
            onCollectionRemove={(collection) => {
              setSelectedCollections(prev => 
                prev.filter(c => c.address !== collection.address)
              );
            }}
          />
        );
      
      case 'insights':
        return (
          <MarketInsights
            insights={insights}
            timeRange={timeRange}
            marketData={marketData}
          />
        );
      
      default:
        return null;
    }
  };

  if (loading && !marketData) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <p>正在加载市场数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <div className="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{error.message}</p>
        <button onClick={handleRefresh}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className={`nft-market-analytics ${className}`}>
      {/* 页面头部 */}
      <div className="analytics-header">
        <div className="header-content">
          <h1 className="analytics-title">NFT市场分析</h1>
          <p className="analytics-subtitle">
            深入了解NFT市场趋势、价格动态和交易数据
          </p>
        </div>

        {/* 快速统计 */}
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-value">
              {marketData?.totalVolume ? `${(marketData.totalVolume / 1000).toFixed(1)}K` : '--'}
            </div>
            <div className="stat-label">总交易量 (ETH)</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {marketData?.totalSales ? marketData.totalSales.toLocaleString() : '--'}
            </div>
            <div className="stat-label">总交易数</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {marketData?.averagePrice ? `${marketData.averagePrice.toFixed(2)}` : '--'}
            </div>
            <div className="stat-label">平均价格 (ETH)</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {marketData?.activeCollections ? marketData.activeCollections.toLocaleString() : '--'}
            </div>
            <div className="stat-label">活跃集合</div>
          </div>
        </div>

        {/* 刷新按钮 */}
        <button 
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          <span className="refresh-icon">🔄</span>
          {loading ? '刷新中...' : '刷新'}
        </button>
      </div>

      {/* 控制栏 */}
      <div className="analytics-controls">
        {renderTimeRangeSelector()}
        {(activeTab === 'trending' || activeTab === 'price' || activeTab === 'volume') && renderFilters()}
        
        {/* 选中的集合 */}
        {selectedCollections.length > 0 && (
          <div className="selected-collections">
            <span className="selected-label">已选择集合:</span>
            <div className="selected-items">
              {selectedCollections.map(collection => (
                <div key={collection.address} className="selected-item">
                  <img src={collection.image} alt={collection.name} className="collection-icon" />
                  <span className="collection-name">{collection.name}</span>
                  <button
                    className="remove-button"
                    onClick={() => handleCollectionSelect(collection)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 标签页导航 */}
      {renderTabs()}

      {/* 内容区域 */}
      <div className="analytics-content">
        {renderContent()}
      </div>

      {/* 状态指示器 */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner small" />
        </div>
      )}
    </div>
  );
};

export default NFTMarketAnalytics;

