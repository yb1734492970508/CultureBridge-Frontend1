import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * 资产概览组件
 * 显示总资产价值、变化和分布
 */
const AssetOverview = ({ totalValue, totalChange, distribution, loading }) => {
  // 格式化数字
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  };

  // 格式化百分比
  const formatPercentage = (num) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  // 饼图颜色
  const colors = ['#4a6cfa', '#2ed573', '#ffa726', '#ff4757', '#8247e5'];

  if (loading) {
    return (
      <div className="asset-overview loading">
        <div className="loading-spinner"></div>
        <p>加载资产数据中...</p>
      </div>
    );
  }

  return (
    <div className="asset-overview">
      <div className="total-value-section">
        <div className="total-value">
          <div className="total-value-amount">
            ${formatNumber(totalValue)}
          </div>
          <div className={`total-value-change ${totalChange >= 0 ? 'positive' : 'negative'}`}>
            {formatPercentage(totalChange)} (24h)
          </div>
        </div>
        
        <div className="value-stats">
          <div className="stat-item">
            <span className="stat-label">总资产数量</span>
            <span className="stat-value">{distribution.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">活跃链数</span>
            <span className="stat-value">{distribution.length}</span>
          </div>
        </div>
      </div>

      <div className="asset-distribution">
        <h3>资产分布</h3>
        
        <div className="distribution-content">
          <div className="distribution-chart">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${formatNumber(value)}`, '价值']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="distribution-legend">
            {distribution.map((item, index) => (
              <div key={item.name} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <div className="legend-info">
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-value">
                    ${formatNumber(item.value)} ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetOverview;

