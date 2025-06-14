import React, { useState, useCallback, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TrendingCollections.css';

/**
 * 热门集合组件
 * 显示当前热门和趋势NFT集合
 */
const TrendingCollections = ({
  collections = [],
  timeRange,
  filters,
  onCollectionSelect,
  selectedCollections = []
}) => {
  const [viewMode, setViewMode] = useState('grid'); // grid, list, chart
  const [sortBy, setSortBy] = useState('volume'); // volume, change, floor, sales
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  // 筛选和排序集合
  const filteredAndSortedCollections = useMemo(() => {
    let filtered = collections;

    // 按类别筛选
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(collection => 
        collection.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // 按价格范围筛选
    if (filters.priceRange) {
      filtered = filtered.filter(collection => {
        const floorPrice = collection.floorPrice || 0;
        return floorPrice >= filters.priceRange.min && 
               floorPrice <= filters.priceRange.max;
      });
    }

    // 按交易量范围筛选
    if (filters.volumeRange) {
      filtered = filtered.filter(collection => {
        const volume = collection.volume || 0;
        return volume >= filters.volumeRange.min && 
               volume <= filters.volumeRange.max;
      });
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'volume':
          aValue = a.volume || 0;
          bValue = b.volume || 0;
          break;
        case 'change':
          aValue = a.change || 0;
          bValue = b.change || 0;
          break;
        case 'floor':
          aValue = a.floorPrice || 0;
          bValue = b.floorPrice || 0;
          break;
        case 'sales':
          aValue = a.sales || 0;
          bValue = b.sales || 0;
          break;
        default:
          aValue = a.volume || 0;
          bValue = b.volume || 0;
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  }, [collections, filters, sortBy, sortOrder]);

  // 格式化数值
  const formatValue = (value, type = 'number') => {
    if (!value && value !== 0) return '--';
    
    switch (type) {
      case 'eth':
        return `${value.toFixed(2)} ETH`;
      case 'percentage':
        return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
      case 'compact':
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toLocaleString();
      default:
        return value.toLocaleString();
    }
  };

  // 获取变化趋势颜色
  const getTrendColor = (change) => {
    if (change > 0) return '#10b981';
    if (change < 0) return '#ef4444';
    return '#6b7280';
  };

  // 检查集合是否已选中
  const isCollectionSelected = (collection) => {
    return selectedCollections.some(c => c.address === collection.address);
  };

  // 处理集合选择
  const handleCollectionSelect = useCallback((collection) => {
    onCollectionSelect?.(collection);
  }, [onCollectionSelect]);

  // 渲染排序控制
  const renderSortControls = () => (
    <div className="sort-controls">
      <div className="sort-group">
        <label className="sort-label">排序方式:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="volume">交易量</option>
          <option value="change">涨跌幅</option>
          <option value="floor">地板价</option>
          <option value="sales">销售数</option>
        </select>
      </div>
      
      <button
        className={`sort-order-button ${sortOrder}`}
        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        title={sortOrder === 'desc' ? '降序' : '升序'}
      >
        {sortOrder === 'desc' ? '↓' : '↑'}
      </button>
    </div>
  );

  // 渲染视图模式切换
  const renderViewModeToggle = () => (
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
      <button
        className={`view-button ${viewMode === 'chart' ? 'active' : ''}`}
        onClick={() => setViewMode('chart')}
        title="图表视图"
      >
        📊
      </button>
    </div>
  );

  // 渲染集合卡片
  const renderCollectionCard = (collection, index) => (
    <div 
      key={collection.address}
      className={`collection-card ${isCollectionSelected(collection) ? 'selected' : ''}`}
      onClick={() => handleCollectionSelect(collection)}
    >
      <div className="collection-rank">#{index + 1}</div>
      
      <div className="collection-image-container">
        <img 
          src={collection.image || '/default-collection.png'} 
          alt={collection.name}
          className="collection-image"
        />
        {collection.verified && (
          <div className="verified-badge" title="已验证">✓</div>
        )}
      </div>

      <div className="collection-info">
        <div className="collection-name">{collection.name}</div>
        <div className="collection-category">{collection.category}</div>
      </div>

      <div className="collection-stats">
        <div className="stat-item">
          <div className="stat-value">{formatValue(collection.volume, 'eth')}</div>
          <div className="stat-label">交易量</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{formatValue(collection.floorPrice, 'eth')}</div>
          <div className="stat-label">地板价</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{formatValue(collection.sales, 'compact')}</div>
          <div className="stat-label">销售数</div>
        </div>
      </div>

      <div className="collection-change">
        <span 
          className="change-value"
          style={{ color: getTrendColor(collection.change) }}
        >
          {formatValue(collection.change, 'percentage')}
        </span>
        <span className="change-period">{timeRange}</span>
      </div>

      {collection.trending && (
        <div className="trending-badge">🔥 热门</div>
      )}
    </div>
  );

  // 渲染集合列表项
  const renderCollectionListItem = (collection, index) => (
    <div 
      key={collection.address}
      className={`collection-list-item ${isCollectionSelected(collection) ? 'selected' : ''}`}
      onClick={() => handleCollectionSelect(collection)}
    >
      <div className="list-rank">#{index + 1}</div>
      
      <div className="list-image-container">
        <img 
          src={collection.image || '/default-collection.png'} 
          alt={collection.name}
          className="list-image"
        />
        {collection.verified && (
          <div className="verified-badge small">✓</div>
        )}
      </div>

      <div className="list-info">
        <div className="list-name">
          {collection.name}
          {collection.trending && <span className="trending-indicator">🔥</span>}
        </div>
        <div className="list-category">{collection.category}</div>
      </div>

      <div className="list-volume">
        <div className="list-value">{formatValue(collection.volume, 'eth')}</div>
        <div className="list-label">交易量</div>
      </div>

      <div className="list-floor">
        <div className="list-value">{formatValue(collection.floorPrice, 'eth')}</div>
        <div className="list-label">地板价</div>
      </div>

      <div className="list-sales">
        <div className="list-value">{formatValue(collection.sales, 'compact')}</div>
        <div className="list-label">销售数</div>
      </div>

      <div className="list-change">
        <span 
          className="change-value"
          style={{ color: getTrendColor(collection.change) }}
        >
          {formatValue(collection.change, 'percentage')}
        </span>
      </div>

      <div className="list-actions">
        <button className="action-button">查看</button>
      </div>
    </div>
  );

  // 渲染图表视图
  const renderChartView = () => {
    const chartData = filteredAndSortedCollections.slice(0, 10).map((collection, index) => ({
      name: collection.name.length > 10 ? collection.name.substring(0, 10) + '...' : collection.name,
      volume: collection.volume || 0,
      change: collection.change || 0,
      floor: collection.floorPrice || 0,
      rank: index + 1
    }));

    return (
      <div className="chart-view">
        <div className="chart-container">
          <h4>交易量排名</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#718096"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#718096"
                fontSize={12}
                tickFormatter={(value) => formatValue(value, 'compact')}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [formatValue(value, 'eth'), '交易量']}
              />
              <Bar 
                dataKey="volume" 
                fill="#667eea"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4>价格变化趋势</h4>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#718096"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#718096"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [formatValue(value, 'percentage'), '变化']}
              />
              <Line 
                type="monotone" 
                dataKey="change" 
                stroke="#667eea"
                strokeWidth={2}
                dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 渲染内容
  const renderContent = () => {
    if (filteredAndSortedCollections.length === 0) {
      return (
        <div className="empty-collections">
          <div className="empty-icon">🎨</div>
          <h3>暂无热门集合</h3>
          <p>当前筛选条件下没有找到匹配的NFT集合</p>
        </div>
      );
    }

    switch (viewMode) {
      case 'grid':
        return (
          <div className="collections-grid">
            {filteredAndSortedCollections.map(renderCollectionCard)}
          </div>
        );
      
      case 'list':
        return (
          <div className="collections-list">
            <div className="list-header">
              <div className="header-item">排名</div>
              <div className="header-item">集合</div>
              <div className="header-item">交易量</div>
              <div className="header-item">地板价</div>
              <div className="header-item">销售数</div>
              <div className="header-item">变化</div>
              <div className="header-item">操作</div>
            </div>
            {filteredAndSortedCollections.map(renderCollectionListItem)}
          </div>
        );
      
      case 'chart':
        return renderChartView();
      
      default:
        return null;
    }
  };

  return (
    <div className="trending-collections">
      {/* 控制栏 */}
      <div className="collections-controls">
        <div className="controls-left">
          <h3>
            热门集合
            <span className="collection-count">({filteredAndSortedCollections.length})</span>
          </h3>
          {renderSortControls()}
        </div>

        <div className="controls-right">
          {renderViewModeToggle()}
        </div>
      </div>

      {/* 选中集合提示 */}
      {selectedCollections.length > 0 && (
        <div className="selected-info">
          <span className="selected-text">
            已选择 {selectedCollections.length} 个集合进行对比
          </span>
          <button 
            className="clear-selection"
            onClick={() => selectedCollections.forEach(collection => 
              handleCollectionSelect(collection)
            )}
          >
            清除选择
          </button>
        </div>
      )}

      {/* 内容区域 */}
      <div className="collections-content">
        {renderContent()}
      </div>

      {/* 加载更多 */}
      {filteredAndSortedCollections.length >= 20 && (
        <div className="load-more">
          <button className="load-more-button">
            加载更多集合
          </button>
        </div>
      )}
    </div>
  );
};

export default TrendingCollections;

