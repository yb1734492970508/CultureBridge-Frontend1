import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MarketOverview.css';

/**
 * 市场概览组件
 * 显示NFT市场的整体统计和趋势
 */
const MarketOverview = ({ 
  data,
  timeRange,
  onRefresh
}) => {
  // 格式化数值
  const formatValue = (value, type = 'number') => {
    if (!value && value !== 0) return '--';
    
    switch (type) {
      case 'currency':
        return `$${value.toLocaleString()}`;
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
    if (change > 0) return '#10b981'; // 绿色
    if (change < 0) return '#ef4444'; // 红色
    return '#6b7280'; // 灰色
  };

  // 渲染关键指标卡片
  const renderMetricCard = (title, value, change, type = 'number', icon = '📊') => (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-value">
        {formatValue(value, type)}
      </div>
      {change !== undefined && (
        <div className="metric-change" style={{ color: getTrendColor(change) }}>
          <span className="change-icon">
            {change > 0 ? '↗' : change < 0 ? '↘' : '→'}
          </span>
          {formatValue(Math.abs(change), 'percentage')}
        </div>
      )}
    </div>
  );

  // 渲染价格趋势图表
  const renderPriceTrendChart = () => {
    if (!data?.priceTrend || data.priceTrend.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>暂无价格趋势数据</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data.priceTrend}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#718096"
            fontSize={12}
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
            formatter={(value) => [formatValue(value, 'eth'), '平均价格']}
            labelFormatter={(label) => `日期: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="averagePrice"
            stroke="#667eea"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // 渲染交易量图表
  const renderVolumeChart = () => {
    if (!data?.volumeTrend || data.volumeTrend.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>暂无交易量数据</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.volumeTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#718096"
            fontSize={12}
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
            labelFormatter={(label) => `日期: ${label}`}
          />
          <Bar 
            dataKey="volume" 
            fill="#667eea"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 渲染类别分布图表
  const renderCategoryDistribution = () => {
    if (!data?.categoryDistribution || data.categoryDistribution.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>暂无类别分布数据</p>
        </div>
      );
    }

    const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data.categoryDistribution}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.categoryDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value) => [formatValue(value, 'percentage'), '占比']}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 渲染顶级集合
  const renderTopCollections = () => {
    if (!data?.topCollections || data.topCollections.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>暂无热门集合数据</p>
        </div>
      );
    }

    return (
      <div className="top-collections-list">
        {data.topCollections.slice(0, 5).map((collection, index) => (
          <div key={collection.address} className="collection-item">
            <div className="collection-rank">#{index + 1}</div>
            <img 
              src={collection.image} 
              alt={collection.name}
              className="collection-image"
            />
            <div className="collection-info">
              <div className="collection-name">{collection.name}</div>
              <div className="collection-stats">
                <span className="stat">
                  {formatValue(collection.volume, 'eth')}
                </span>
                <span className="stat-change" style={{ color: getTrendColor(collection.change) }}>
                  {formatValue(collection.change, 'percentage')}
                </span>
              </div>
            </div>
            <div className="collection-floor">
              <div className="floor-price">{formatValue(collection.floorPrice, 'eth')}</div>
              <div className="floor-label">地板价</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!data) {
    return (
      <div className="market-overview-loading">
        <div className="loading-spinner" />
        <p>正在加载市场概览...</p>
      </div>
    );
  }

  return (
    <div className="market-overview">
      {/* 关键指标 */}
      <div className="metrics-grid">
        {renderMetricCard(
          '总市值',
          data.totalMarketCap,
          data.marketCapChange,
          'currency',
          '💎'
        )}
        {renderMetricCard(
          '24h交易量',
          data.volume24h,
          data.volumeChange24h,
          'eth',
          '📈'
        )}
        {renderMetricCard(
          '平均价格',
          data.averagePrice,
          data.priceChange,
          'eth',
          '💰'
        )}
        {renderMetricCard(
          '活跃用户',
          data.activeUsers,
          data.usersChange,
          'compact',
          '👥'
        )}
        {renderMetricCard(
          '总交易数',
          data.totalSales,
          data.salesChange,
          'compact',
          '🛒'
        )}
        {renderMetricCard(
          '活跃集合',
          data.activeCollections,
          data.collectionsChange,
          'number',
          '🎨'
        )}
      </div>

      {/* 图表区域 */}
      <div className="charts-grid">
        {/* 价格趋势 */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">价格趋势</h3>
            <div className="chart-subtitle">
              过去{timeRange === '1d' ? '24小时' : timeRange === '7d' ? '7天' : timeRange === '30d' ? '30天' : timeRange === '90d' ? '90天' : '1年'}的平均价格变化
            </div>
          </div>
          <div className="chart-content">
            {renderPriceTrendChart()}
          </div>
        </div>

        {/* 交易量趋势 */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">交易量趋势</h3>
            <div className="chart-subtitle">
              每日交易量变化情况
            </div>
          </div>
          <div className="chart-content">
            {renderVolumeChart()}
          </div>
        </div>

        {/* 类别分布 */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">类别分布</h3>
            <div className="chart-subtitle">
              按交易量划分的NFT类别占比
            </div>
          </div>
          <div className="chart-content">
            {renderCategoryDistribution()}
          </div>
        </div>

        {/* 热门集合 */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">热门集合</h3>
            <div className="chart-subtitle">
              交易量排名前5的NFT集合
            </div>
          </div>
          <div className="chart-content">
            {renderTopCollections()}
          </div>
        </div>
      </div>

      {/* 市场摘要 */}
      <div className="market-summary">
        <h3>市场摘要</h3>
        <div className="summary-content">
          <div className="summary-item">
            <span className="summary-label">市场状态:</span>
            <span className={`summary-value ${data.marketSentiment?.toLowerCase()}`}>
              {data.marketSentiment === 'bullish' ? '看涨' : 
               data.marketSentiment === 'bearish' ? '看跌' : '中性'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">主要趋势:</span>
            <span className="summary-value">{data.mainTrend || '稳定发展'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">热门类别:</span>
            <span className="summary-value">{data.hotCategory || '艺术类'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">数据更新:</span>
            <span className="summary-value">
              {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : '刚刚'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;

