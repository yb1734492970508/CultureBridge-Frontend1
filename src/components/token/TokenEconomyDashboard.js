import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/token/TokenContext';
import { useBlockchain } from '../../context/blockchain';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, LineElement, BarElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import '../../styles/token-economy.css';

// 注册Chart.js组件
ChartJS.register(ArcElement, LineElement, BarElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

/**
 * 代币经济模型仪表盘组件
 * 展示CBT代币经济模型的关键指标和数据可视化
 */
const TokenEconomyDashboard = () => {
  const { active, account } = useBlockchain();
  const { 
    balance, 
    totalSupply, 
    stakeInfo,
    isLoading, 
    error,
    fetchBalance,
    fetchTotalSupply,
    fetchStakeInfo,
    formatTokenAmount
  } = useToken();
  
  // 状态
  const [tokenMetrics, setTokenMetrics] = useState({
    circulatingSupply: '0',
    marketCap: '0',
    stakingAPY: '0',
    totalStaked: '0',
    stakingRatio: '0',
    tokenPrice: '0',
    tokenVolume24h: '0',
    tokenHolders: '0'
  });
  
  const [tokenDistribution, setTokenDistribution] = useState({
    ecosystem: 30,
    team: 15,
    investors: 20,
    community: 25,
    reserve: 10
  });
  
  const [priceHistory, setPriceHistory] = useState({
    labels: [],
    prices: []
  });
  
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  
  // 初始化加载
  useEffect(() => {
    if (active) {
      fetchBalance();
      fetchTotalSupply();
      fetchStakeInfo();
      fetchTokenMetrics();
      fetchPriceHistory(timeRange);
    }
  }, [active, account]);
  
  // 获取代币指标数据
  const fetchTokenMetrics = async () => {
    try {
      // 这里应该从API获取实际数据
      // 以下是模拟数据
      const metrics = {
        circulatingSupply: '450000000',
        marketCap: '22500000',
        stakingAPY: '12.5',
        totalStaked: '150000000',
        stakingRatio: '33.33',
        tokenPrice: '0.05',
        tokenVolume24h: '1250000',
        tokenHolders: '8750'
      };
      
      setTokenMetrics(metrics);
    } catch (error) {
      console.error('获取代币指标失败:', error);
    }
  };
  
  // 获取价格历史数据
  const fetchPriceHistory = async (range) => {
    try {
      // 这里应该从API获取实际数据
      // 以下是模拟数据
      let labels = [];
      let prices = [];
      
      const now = new Date();
      let dataPoints = 0;
      let interval = 0;
      
      switch (range) {
        case '7d':
          dataPoints = 7;
          interval = 24 * 60 * 60 * 1000; // 1天
          break;
        case '30d':
          dataPoints = 30;
          interval = 24 * 60 * 60 * 1000; // 1天
          break;
        case '90d':
          dataPoints = 90;
          interval = 24 * 60 * 60 * 1000; // 1天
          break;
        case '1y':
          dataPoints = 12;
          interval = 30 * 24 * 60 * 60 * 1000; // 30天
          break;
        default:
          dataPoints = 30;
          interval = 24 * 60 * 60 * 1000; // 1天
      }
      
      for (let i = dataPoints - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * interval));
        labels.push(formatDate(date, range));
        
        // 生成模拟价格数据
        const basePrice = 0.05;
        const randomFactor = 0.2; // 20%的随机波动
        const randomVariation = basePrice * randomFactor * (Math.random() - 0.5);
        const price = basePrice + randomVariation;
        prices.push(price.toFixed(4));
      }
      
      setPriceHistory({
        labels,
        prices
      });
      
    } catch (error) {
      console.error('获取价格历史失败:', error);
    }
  };
  
  // 格式化日期
  const formatDate = (date, range) => {
    const options = { month: 'short', day: 'numeric' };
    
    if (range === '1y') {
      return date.toLocaleDateString(undefined, { month: 'short' });
    }
    
    return date.toLocaleDateString(undefined, options);
  };
  
  // 处理时间范围变更
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    fetchPriceHistory(range);
  };
  
  // 价格图表配置
  const priceChartData = {
    labels: priceHistory.labels,
    datasets: [
      {
        label: 'CBT价格 (USD)',
        data: priceHistory.prices,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4
      }
    ]
  };
  
  const priceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'CBT价格走势'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };
  
  // 代币分配图表配置
  const distributionChartData = {
    labels: ['生态系统', '团队', '投资者', '社区', '储备'],
    datasets: [
      {
        data: [
          tokenDistribution.ecosystem,
          tokenDistribution.team,
          tokenDistribution.investors,
          tokenDistribution.community,
          tokenDistribution.reserve
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const distributionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'CBT代币分配'
      }
    }
  };
  
  // 格式化大数字
  const formatLargeNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num;
  };
  
  return (
    <div className="token-economy-dashboard">
      <div className="dashboard-header">
        <h2>CBT代币经济仪表盘</h2>
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            概览
          </button>
          <button 
            className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            指标
          </button>
          <button 
            className={`tab-btn ${activeTab === 'distribution' ? 'active' : ''}`}
            onClick={() => setActiveTab('distribution')}
          >
            分配
          </button>
          <button 
            className={`tab-btn ${activeTab === 'exchange' ? 'active' : ''}`}
            onClick={() => setActiveTab('exchange')}
          >
            交易所
          </button>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div className="dashboard-overview">
          <div className="metrics-cards">
            <div className="metric-card">
              <h3>CBT价格</h3>
              <div className="metric-value">${tokenMetrics.tokenPrice}</div>
              <div className="metric-change positive">+5.2% (24h)</div>
            </div>
            <div className="metric-card">
              <h3>市值</h3>
              <div className="metric-value">${formatLargeNumber(tokenMetrics.marketCap)}</div>
              <div className="metric-change positive">+3.8% (24h)</div>
            </div>
            <div className="metric-card">
              <h3>24h交易量</h3>
              <div className="metric-value">${formatLargeNumber(tokenMetrics.tokenVolume24h)}</div>
              <div className="metric-change negative">-2.1% (24h)</div>
            </div>
            <div className="metric-card">
              <h3>质押APY</h3>
              <div className="metric-value">{tokenMetrics.stakingAPY}%</div>
              <div className="metric-change neutral">+0.2% (24h)</div>
            </div>
          </div>
          
          <div className="price-chart-container">
            <div className="chart-header">
              <h3>价格走势</h3>
              <div className="time-range-selector">
                <button 
                  className={`range-btn ${timeRange === '7d' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('7d')}
                >
                  7天
                </button>
                <button 
                  className={`range-btn ${timeRange === '30d' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('30d')}
                >
                  30天
                </button>
                <button 
                  className={`range-btn ${timeRange === '90d' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('90d')}
                >
                  90天
                </button>
                <button 
                  className={`range-btn ${timeRange === '1y' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('1y')}
                >
                  1年
                </button>
              </div>
            </div>
            <div className="chart-container">
              <Chart type="line" data={priceChartData} options={priceChartOptions} />
            </div>
          </div>
          
          <div className="token-info-section">
            <div className="info-column">
              <h3>代币信息</h3>
              <div className="info-item">
                <span className="info-label">代币名称:</span>
                <span className="info-value">Culture Token</span>
              </div>
              <div className="info-item">
                <span className="info-label">代币符号:</span>
                <span className="info-value">CBT</span>
              </div>
              <div className="info-item">
                <span className="info-label">代币类型:</span>
                <span className="info-value">ERC-20</span>
              </div>
              <div className="info-item">
                <span className="info-label">总供应量:</span>
                <span className="info-value">{formatLargeNumber(totalSupply)} CBT</span>
              </div>
              <div className="info-item">
                <span className="info-label">流通供应量:</span>
                <span className="info-value">{formatLargeNumber(tokenMetrics.circulatingSupply)} CBT</span>
              </div>
              <div className="info-item">
                <span className="info-label">持有者数量:</span>
                <span className="info-value">{formatLargeNumber(tokenMetrics.tokenHolders)}</span>
              </div>
            </div>
            <div className="info-column">
              <h3>质押信息</h3>
              <div className="info-item">
                <span className="info-label">总质押量:</span>
                <span className="info-value">{formatLargeNumber(tokenMetrics.totalStaked)} CBT</span>
              </div>
              <div className="info-item">
                <span className="info-label">质押比例:</span>
                <span className="info-value">{tokenMetrics.stakingRatio}%</span>
              </div>
              <div className="info-item">
                <span className="info-label">当前APY:</span>
                <span className="info-value">{tokenMetrics.stakingAPY}%</span>
              </div>
              <div className="info-item">
                <span className="info-label">您的质押:</span>
                <span className="info-value">{stakeInfo.amount} CBT</span>
              </div>
              <div className="info-item">
                <span className="info-label">您的奖励:</span>
                <span className="info-value">{stakeInfo.rewards} CBT</span>
              </div>
              <div className="info-item">
                <span className="info-label">锁定期:</span>
                <span className="info-value">30天</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'metrics' && (
        <div className="dashboard-metrics">
          <div className="metrics-detail-cards">
            <div className="metric-detail-card">
              <h3>代币供应</h3>
              <div className="detail-metrics">
                <div className="detail-metric">
                  <span className="detail-label">总供应量:</span>
                  <span className="detail-value">{formatLargeNumber(totalSupply)} CBT</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">流通供应量:</span>
                  <span className="detail-value">{formatLargeNumber(tokenMetrics.circulatingSupply)} CBT</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">锁定供应量:</span>
                  <span className="detail-value">{formatLargeNumber(totalSupply - tokenMetrics.circulatingSupply)} CBT</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">质押总量:</span>
                  <span className="detail-value">{formatLargeNumber(tokenMetrics.totalStaked)} CBT</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">质押比例:</span>
                  <span className="detail-value">{tokenMetrics.stakingRatio}%</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">流通率:</span>
                  <span className="detail-value">{(tokenMetrics.circulatingSupply / totalSupply * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>
            
            <div className="metric-detail-card">
              <h3>市场数据</h3>
              <div className="detail-metrics">
                <div className="detail-metric">
                  <span className="detail-label">当前价格:</span>
                  <span className="detail-value">${tokenMetrics.tokenPrice}</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">市值:</span>
                  <span className="detail-value">${formatLargeNumber(tokenMetrics.marketCap)}</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">24h交易量:</span>
                  <span className="detail-value">${formatLargeNumber(tokenMetrics.tokenVolume24h)}</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">全连稀释市值:</span>
                  <span className="detail-value">${formatLargeNumber(totalSupply * tokenMetrics.tokenPrice)}</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">持有者数量:</span>
                  <span className="detail-value">{formatLargeNumber(tokenMetrics.tokenHolders)}</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">交易对数量:</span>
                  <span className="detail-value">12</span>
                </div>
              </div>
            </div>
            
            <div className="metric-detail-card">
              <h3>质押与奖励</h3>
              <div className="detail-metrics">
                <div className="detail-metric">
                  <span className="detail-label">当前APY:</span>
                  <span className="detail-value">{tokenMetrics.stakingAPY}%</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">质押总量:</span>
                  <span className="detail-value">{formatLargeNumber(tokenMetrics.totalStaked)} CBT</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">活跃质押者:</span>
                  <span className="detail-value">{formatLargeNumber(tokenMetrics.tokenHolders * 0.4)}</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">平均质押期:</span>
                  <span className="detail-value">62天</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">每日奖励分发:</span>
                  <span className="detail-value">{formatLargeNumber(tokenMetrics.totalStaked * tokenMetrics.stakingAPY / 365 / 100)} CBT</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">奖励池余额:</span>
                  <span className="detail-value">{formatLargeNumber(totalSupply * 0.05)} CBT</span>
                </div>
              </div>
            </div>
            
            <div className="metric-detail-card">
              <h3>链上活动</h3>
              <div className="detail-metrics">
                <div className="detail-metric">
                  <span className="detail-label">24h交易数:</span>
                  <span className="detail-value">{formatLargeNumber(8750)}</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">7日平均交易数:</span>
                  <span className="detail-value">{formatLargeNumber(7820)}</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">活跃地址:</span>
                  <span className="detail-value">{formatLargeNumber(tokenMetrics.tokenHolders * 0.3)}</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">新增地址(24h):</span>
                  <span className="detail-value">{formatLargeNumber(tokenMetrics.tokenHolders * 0.01)}</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">平均持有量:</span>
                  <span className="detail-value">{formatLargeNumber(tokenMetrics.circulatingSupply / tokenMetrics.tokenHolders)} CBT</span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">Gas消耗(24h):</span>
                  <span className="detail-value">{formatLargeNumber(12.5)} ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'distribution' && (
        <div className="dashboard-distribution">
          <div className="distribution-chart-container">
            <div className="chart-container">
              <Chart type="pie" data={distributionChartData} options={distributionChartOptions} />
            </div>
            <div className="distribution-details">
              <h3>代币分配详情</h3>
              <div className="distribution-item">
                <div className="item-color" style={{backgroundColor: 'rgba(255, 99, 132, 0.6)'}}></div>
                <span className="item-label">生态系统:</span>
                <span className="item-value">{tokenDistribution.ecosystem}% ({formatLargeNumber(totalSupply * tokenDistribution.ecosystem / 100)} CBT)</span>
              </div>
              <div className="distribution-item">
                <div className="item-color" style={{backgroundColor: 'rgba(54, 162, 235, 0.6)'}}></div>
                <span className="item-label">团队:</span>
                <span className="item-value">{tokenDistribution.team}% ({formatLargeNumber(totalSupply * tokenDistribution.team / 100)} CBT)</span>
              </div>
              <div className="distribution-item">
                <div className="item-color" style={{backgroundColor: 'rgba(255, 206, 86, 0.6)'}}></div>
                <span className="item-label">投资者:</span>
                <span className="item-value">{tokenDistribution.investors}% ({formatLargeNumber(totalSupply * tokenDistribution.investors / 100)} CBT)</span>
              </div>
              <div className="distribution-item">
                <div className="item-color" style={{backgroundColor: 'rgba(75, 192, 192, 0.6)'}}></div>
                <span className="item-label">社区:</span>
                <span className="item-value">{tokenDistribution.community}% ({formatLargeNumber(totalSupply * tokenDistribution.community / 100)} CBT)</span>
              </div>
              <div className="distribution-item">
                <div className="item-color" style={{backgroundColor: 'rgba(153, 102, 255, 0.6)'}}></div>
                <span className="item-label">储备:</span>
                <span className="item-value">{tokenDistribution.reserve}% ({formatLargeNumber(totalSupply * tokenDistribution.reserve / 100)} CBT)</span>
              </div>
            </div>
          </div>
          
          <div className="token-release-schedule">
            <h3>代币释放计划</h3>
            <div className="release-table-container">
              <table className="release-table">
                <thead>
                  <tr>
                    <th>阶段</th>
                    <th>时间</th>
                    <th>释放比例</th>
                    <th>释放数量</th>
                    <th>累计释放</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>初始释放</td>
                    <td>上线日</td>
                    <td>15%</td>
                    <td>{formatLargeNumber(totalSupply * 0.15)} CBT</td>
                    <td>15%</td>
                    <td>包含流动性和早期支持者</td>
                  </tr>
                  <tr>
                    <td>第一阶段</td>
                    <td>3个月</td>
                    <td>10%</td>
                    <td>{formatLargeNumber(totalSupply * 0.1)} CBT</td>
                    <td>25%</td>
                    <td>团队和投资者部分解锁</td>
                  </tr>
                  <tr>
                    <td>第二阶段</td>
                    <td>6个月</td>
                    <td>15%</td>
                    <td>{formatLargeNumber(totalSupply * 0.15)} CBT</td>
                    <td>40%</td>
                    <td>社区激励和生态建设</td>
                  </tr>
                  <tr>
                    <td>第三阶段</td>
                    <td>12个月</td>
                    <td>20%</td>
                    <td>{formatLargeNumber(totalSupply * 0.2)} CBT</td>
                    <td>60%</td>
                    <td>团队和投资者继续解锁</td>
                  </tr>
                  <tr>
                    <td>第四阶段</td>
                    <td>18个月</td>
                    <td>20%</td>
                    <td>{formatLargeNumber(totalSupply * 0.2)} CBT</td>
                    <td>80%</td>
                    <td>市场扩展和生态系统增长</td>
                  </tr>
                  <tr>
                    <td>最终阶段</td>
                    <td>24个月</td>
                    <td>20%</td>
                    <td>{formatLargeNumber(totalSupply * 0.2)} CBT</td>
                    <td>100%</td>
                    <td>全部代币释放完成</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="token-utility-section">
            <h3>代币实用性</h3>
            <div className="utility-cards">
              <div className="utility-card">
                <div className="utility-icon">💰</div>
                <h4>平台支付</h4>
                <p>使用CBT支付平台服务费用，享受折扣优惠</p>
              </div>
              <div className="utility-card">
                <div className="utility-icon">🏛️</div>
                <h4>治理投票</h4>
                <p>持有CBT参与DAO治理投票，决定平台发展方向</p>
              </div>
              <div className="utility-card">
                <div className="utility-icon">🔒</div>
                <h4>质押奖励</h4>
                <p>质押CBT获取被动收益和额外平台权益</p>
              </div>
              <div className="utility-card">
                <div className="utility-icon">🎭</div>
                <h4>NFT增强</h4>
                <p>使用CBT提升NFT创作、交易和展示体验</p>
              </div>
              <div className="utility-card">
                <div className="utility-icon">🌉</div>
                <h4>跨链桥费用</h4>
                <p>支付跨链转移手续费，实现多链资产流通</p>
              </div>
              <div className="utility-card">
                <div className="utility-icon">🎁</div>
                <h4>社区激励</h4>
                <p>获取社区贡献奖励，促进生态系统发展</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'exchange' && (
        <div className="dashboard-exchange">
          <div className="exchange-status-section">
            <h3>交易所上线状态</h3>
            <div className="exchange-status-card">
              <div className="status-icon preparing"></div>
              <div className="status-content">
                <h4>准备阶段</h4>
                <div className="status-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '75%'}}></div>
                  </div>
                  <span className="progress-text">75% 完成</span>
                </div>
                <p className="status-description">
                  CBT代币正在积极准备上线交易所，目前处于最终审计和交易所谈判阶段。预计在未来3个月内完成首个交易所上线。
                </p>
              </div>
            </div>
            
            <div className="exchange-roadmap">
              <h4>上线路线图</h4>
              <div className="roadmap-timeline">
                <div className="timeline-item completed">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h5>代币合约开发</h5>
                    <p>完成ERC-20标准合约开发和初步测试</p>
                    <span className="timeline-date">已完成</span>
                  </div>
                </div>
                <div className="timeline-item completed">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h5>经济模型设计</h5>
                    <p>完成代币经济模型和分配方案设计</p>
                    <span className="timeline-date">已完成</span>
                  </div>
                </div>
                <div className="timeline-item active">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h5>安全审计</h5>
                    <p>委托专业机构进行合约安全审计</p>
                    <span className="timeline-date">进行中 - 预计1.5个月完成</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h5>交易所申请</h5>
                    <p>向中小型交易所提交上币申请</p>
                    <span className="timeline-date">预计1个月内开始</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h5>首次上线</h5>
                    <p>在首个交易所完成上线并开放交易</p>
                    <span className="timeline-date">预计3个月内完成</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h5>扩展上线</h5>
                    <p>扩展到更多交易所并增加交易对</p>
                    <span className="timeline-date">预计4-6个月内完成</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="exchange-partners-section">
            <h3>潜在交易所合作伙伴</h3>
            <div className="exchange-partners">
              <div className="partner-card">
                <div className="partner-logo">
                  <span className="placeholder-logo">DEX-1</span>
                </div>
                <h4>去中心化交易所</h4>
                <p>首选上线目标，支持自动做市商(AMM)模式</p>
                <div className="partner-status preparing">准备中</div>
              </div>
              <div className="partner-card">
                <div className="partner-logo">
                  <span className="placeholder-logo">CEX-A</span>
                </div>
                <h4>中型中心化交易所</h4>
                <p>目标第二阶段上线，提供更高流动性</p>
                <div className="partner-status planned">计划中</div>
              </div>
              <div className="partner-card">
                <div className="partner-logo">
                  <span className="placeholder-logo">CEX-B</span>
                </div>
                <h4>区域性交易所</h4>
                <p>针对特定地区市场，提升本地影响力</p>
                <div className="partner-status planned">计划中</div>
              </div>
              <div className="partner-card">
                <div className="partner-logo">
                  <span className="placeholder-logo">DEX-2</span>
                </div>
                <h4>跨链去中心化交易所</h4>
                <p>支持多链交易，增强跨链流动性</p>
                <div className="partner-status future">未来计划</div>
              </div>
            </div>
          </div>
          
          <div className="liquidity-strategy-section">
            <h3>流动性策略</h3>
            <div className="strategy-cards">
              <div className="strategy-card">
                <h4>初始流动性</h4>
                <p>项目将提供总量5%的代币和等值资金作为初始流动性，确保上线后的价格稳定和交易深度。</p>
              </div>
              <div className="strategy-card">
                <h4>流动性挖矿</h4>
                <p>推出流动性挖矿计划，激励用户提供流动性，获得额外CBT奖励，提升市场深度。</p>
              </div>
              <div className="strategy-card">
                <h4>做市商合作</h4>
                <p>与专业做市商合作，确保主要交易对的价差合理，提供稳定的交易环境。</p>
              </div>
              <div className="strategy-card">
                <h4>回购与销毁</h4>
                <p>平台收入的一部分将用于市场回购，并定期销毁一定比例的代币，减少流通量。</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenEconomyDashboard;
