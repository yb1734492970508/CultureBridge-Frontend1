import React, { useState, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './PriceAnalysis.css';

/**
 * 价格分析组件
 * 提供NFT价格趋势分析和预测
 */
const PriceAnalysis = ({
  data = {},
  timeRange,
  filters,
  selectedCollections = []
}) => {
  const [analysisType, setAnalysisType] = useState('trend'); // trend, distribution, correlation, prediction
  const [priceMetric, setPriceMetric] = useState('average'); // average, floor, ceiling, median

  // 处理价格数据
  const processedData = useMemo(() => {
    if (!data.priceHistory) return [];
    
    return data.priceHistory.map(item => ({
      ...item,
      date: new Date(item.timestamp).toLocaleDateString(),
      averagePrice: item.averagePrice || 0,
      floorPrice: item.floorPrice || 0,
      ceilingPrice: item.ceilingPrice || 0,
      medianPrice: item.medianPrice || 0,
      volume: item.volume || 0,
      sales: item.sales || 0
    }));
  }, [data.priceHistory]);

  // 获取集合价格数据
  const getCollectionPriceData = () => {
    if (selectedCollections.length === 0) return [];
    
    return selectedCollections.map(collection => ({
      name: collection.name,
      data: collection.priceHistory || [],
      color: collection.color || '#667eea'
    }));
  };

  // 价格分布数据
  const getPriceDistributionData = () => {
    if (!data.priceDistribution) return [];
    
    return data.priceDistribution.map(item => ({
      priceRange: item.range,
      count: item.count,
      percentage: item.percentage
    }));
  };

  // 价格相关性数据
  const getCorrelationData = () => {
    if (!data.correlationData) return [];
    
    return data.correlationData.map(item => ({
      price: item.price,
      volume: item.volume,
      marketCap: item.marketCap,
      collection: item.collection
    }));
  };

  // 格式化数值
  const formatValue = (value, type = 'number') => {
    if (!value && value !== 0) return '--';
    
    switch (type) {
      case 'eth':
        return `${value.toFixed(4)} ETH`;
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'compact':
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toLocaleString();
      default:
        return value.toLocaleString();
    }
  };

  // 渲染分析类型选择器
  const renderAnalysisTypeSelector = () => (
    <div className="analysis-type-selector">
      <div className="selector-group">
        <label className="selector-label">分析类型:</label>
        <div className="type-buttons">
          {[
            { value: 'trend', label: '趋势分析', icon: '📈' },
            { value: 'distribution', label: '价格分布', icon: '📊' },
            { value: 'correlation', label: '相关性分析', icon: '🔗' },
            { value: 'prediction', label: '价格预测', icon: '🔮' }
          ].map(type => (
            <button
              key={type.value}
              className={`type-button ${analysisType === type.value ? 'active' : ''}`}
              onClick={() => setAnalysisType(type.value)}
            >
              <span className="type-icon">{type.icon}</span>
              <span className="type-label">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="selector-group">
        <label className="selector-label">价格指标:</label>
        <select
          value={priceMetric}
          onChange={(e) => setPriceMetric(e.target.value)}
          className="metric-select"
        >
          <option value="average">平均价格</option>
          <option value="floor">地板价</option>
          <option value="ceiling">最高价</option>
          <option value="median">中位数价格</option>
        </select>
      </div>
    </div>
  );

  // 渲染趋势分析
  const renderTrendAnalysis = () => {
    if (processedData.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>暂无价格趋势数据</p>
        </div>
      );
    }

    const collectionData = getCollectionPriceData();

    return (
      <div className="trend-analysis">
        {/* 整体价格趋势 */}
        <div className="chart-container">
          <div className="chart-header">
            <h4>整体价格趋势</h4>
            <div className="chart-subtitle">
              {timeRange === '1d' ? '24小时' : timeRange === '7d' ? '7天' : timeRange === '30d' ? '30天' : '90天'}价格变化
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={processedData}>
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
                tickFormatter={(value) => formatValue(value, 'eth')}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [formatValue(value, 'eth'), '价格']}
                labelFormatter={(label) => `日期: ${label}`}
              />
              <Area
                type="monotone"
                dataKey={priceMetric === 'average' ? 'averagePrice' : 
                         priceMetric === 'floor' ? 'floorPrice' :
                         priceMetric === 'ceiling' ? 'ceilingPrice' : 'medianPrice'}
                stroke="#667eea"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 集合对比 */}
        {collectionData.length > 0 && (
          <div className="chart-container">
            <div className="chart-header">
              <h4>集合价格对比</h4>
              <div className="chart-subtitle">
                选中集合的价格趋势对比
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#718096"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#718096"
                  fontSize={12}
                  tickFormatter={(value) => formatValue(value, 'eth')}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                {collectionData.map((collection, index) => (
                  <Line
                    key={collection.name}
                    type="monotone"
                    dataKey={priceMetric === 'average' ? 'averagePrice' : 
                             priceMetric === 'floor' ? 'floorPrice' :
                             priceMetric === 'ceiling' ? 'ceilingPrice' : 'medianPrice'}
                    data={collection.data}
                    stroke={collection.color}
                    strokeWidth={2}
                    name={collection.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 价格统计 */}
        <div className="price-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">当前价格</div>
              <div className="stat-value">
                {formatValue(data.currentPrice, 'eth')}
              </div>
              <div className="stat-change positive">
                +{formatValue(data.priceChange24h, 'percentage')}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">24h最高</div>
              <div className="stat-value">
                {formatValue(data.high24h, 'eth')}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">24h最低</div>
              <div className="stat-value">
                {formatValue(data.low24h, 'eth')}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">历史最高</div>
              <div className="stat-value">
                {formatValue(data.allTimeHigh, 'eth')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染价格分布分析
  const renderDistributionAnalysis = () => {
    const distributionData = getPriceDistributionData();
    
    if (distributionData.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>暂无价格分布数据</p>
        </div>
      );
    }

    return (
      <div className="distribution-analysis">
        <div className="chart-container">
          <div className="chart-header">
            <h4>价格分布</h4>
            <div className="chart-subtitle">
              NFT价格区间分布情况
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="priceRange" 
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
                formatter={(value) => [formatValue(value, 'compact'), '数量']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#667eea"
                strokeWidth={2}
                fill="#667eea"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 分布统计 */}
        <div className="distribution-stats">
          <div className="stats-list">
            {distributionData.map((item, index) => (
              <div key={index} className="distribution-item">
                <div className="price-range">{item.priceRange}</div>
                <div className="count-bar">
                  <div 
                    className="count-fill"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="count-info">
                  <span className="count">{formatValue(item.count, 'compact')}</span>
                  <span className="percentage">{formatValue(item.percentage, 'percentage')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染相关性分析
  const renderCorrelationAnalysis = () => {
    const correlationData = getCorrelationData();
    
    if (correlationData.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>暂无相关性数据</p>
        </div>
      );
    }

    return (
      <div className="correlation-analysis">
        <div className="chart-container">
          <div className="chart-header">
            <h4>价格与交易量相关性</h4>
            <div className="chart-subtitle">
              价格和交易量的关系分析
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number"
                dataKey="price"
                stroke="#718096"
                fontSize={12}
                tickFormatter={(value) => formatValue(value, 'eth')}
                name="价格"
              />
              <YAxis 
                type="number"
                dataKey="volume"
                stroke="#718096"
                fontSize={12}
                tickFormatter={(value) => formatValue(value, 'compact')}
                name="交易量"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'price' ? formatValue(value, 'eth') : formatValue(value, 'compact'),
                  name === 'price' ? '价格' : '交易量'
                ]}
              />
              <Scatter 
                dataKey="volume" 
                fill="#667eea"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* 相关性指标 */}
        <div className="correlation-metrics">
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-title">价格-交易量相关性</div>
              <div className="metric-value">
                {formatValue(data.priceVolumeCorrelation || 0.65, 'percentage')}
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-title">价格-市值相关性</div>
              <div className="metric-value">
                {formatValue(data.priceMarketCapCorrelation || 0.82, 'percentage')}
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-title">波动率</div>
              <div className="metric-value">
                {formatValue(data.volatility || 0.35, 'percentage')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染价格预测
  const renderPredictionAnalysis = () => {
    const predictionData = data.pricePrediction || [];
    
    if (predictionData.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>暂无价格预测数据</p>
        </div>
      );
    }

    return (
      <div className="prediction-analysis">
        <div className="chart-container">
          <div className="chart-header">
            <h4>价格预测</h4>
            <div className="chart-subtitle">
              基于历史数据的价格趋势预测
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#718096"
                fontSize={12}
              />
              <YAxis 
                stroke="#718096"
                fontSize={12}
                tickFormatter={(value) => formatValue(value, 'eth')}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  formatValue(value, 'eth'),
                  name === 'actual' ? '实际价格' : 
                  name === 'predicted' ? '预测价格' :
                  name === 'upper' ? '上限' : '下限'
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#667eea"
                strokeWidth={2}
                name="实际价格"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#f093fb"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="预测价格"
              />
              <Area
                type="monotone"
                dataKey="upper"
                stroke="#10b981"
                strokeWidth={1}
                fill="#10b981"
                fillOpacity={0.1}
                name="预测区间"
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="#10b981"
                strokeWidth={1}
                fill="#10b981"
                fillOpacity={0.1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 预测指标 */}
        <div className="prediction-metrics">
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-title">7天预测</div>
              <div className="metric-value">
                {formatValue(data.prediction7d, 'eth')}
              </div>
              <div className="metric-change positive">
                +{formatValue(data.prediction7dChange, 'percentage')}
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-title">30天预测</div>
              <div className="metric-value">
                {formatValue(data.prediction30d, 'eth')}
              </div>
              <div className="metric-change negative">
                {formatValue(data.prediction30dChange, 'percentage')}
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-title">预测准确率</div>
              <div className="metric-value">
                {formatValue(data.predictionAccuracy || 0.78, 'percentage')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染当前分析内容
  const renderCurrentAnalysis = () => {
    switch (analysisType) {
      case 'trend':
        return renderTrendAnalysis();
      case 'distribution':
        return renderDistributionAnalysis();
      case 'correlation':
        return renderCorrelationAnalysis();
      case 'prediction':
        return renderPredictionAnalysis();
      default:
        return renderTrendAnalysis();
    }
  };

  return (
    <div className="price-analysis">
      {/* 控制栏 */}
      <div className="analysis-controls">
        {renderAnalysisTypeSelector()}
      </div>

      {/* 分析内容 */}
      <div className="analysis-content">
        {renderCurrentAnalysis()}
      </div>
    </div>
  );
};

export default PriceAnalysis;

