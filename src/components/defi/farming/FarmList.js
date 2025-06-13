import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import TransactionButton from '../common/TransactionButton';
import './FarmList.css';

/**
 * 流动性挖矿农场列表组件
 * 显示可用的流动性挖矿机会和用户的质押状态
 */
const FarmList = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, inactive, staked
  const [sortBy, setSortBy] = useState('apy'); // apy, tvl, rewards
  const [searchTerm, setSearchTerm] = useState('');
  const [userStakes, setUserStakes] = useState({});

  // 模拟农场数据
  const mockFarms = [
    {
      id: 1,
      name: 'ETH-USDC LP',
      token0: { symbol: 'ETH', logo: '/images/tokens/eth.png' },
      token1: { symbol: 'USDC', logo: '/images/tokens/usdc.png' },
      apy: 45.6,
      tvl: 12500000,
      rewardToken: { symbol: 'CBT', logo: '/images/tokens/cbt.png' },
      rewardRate: 1000,
      isActive: true,
      multiplier: '2x',
      lockPeriod: 0, // 0 = no lock
      userStaked: 0,
      userRewards: 0,
      poolAddress: '0x1234...5678'
    },
    {
      id: 2,
      name: 'ETH-DAI LP',
      token0: { symbol: 'ETH', logo: '/images/tokens/eth.png' },
      token1: { symbol: 'DAI', logo: '/images/tokens/dai.png' },
      apy: 38.2,
      tvl: 8750000,
      rewardToken: { symbol: 'CBT', logo: '/images/tokens/cbt.png' },
      rewardRate: 750,
      isActive: true,
      multiplier: '1.5x',
      lockPeriod: 7, // 7 days
      userStaked: 1500,
      userRewards: 45.6,
      poolAddress: '0x2345...6789'
    },
    {
      id: 3,
      name: 'USDC-USDT LP',
      token0: { symbol: 'USDC', logo: '/images/tokens/usdc.png' },
      token1: { symbol: 'USDT', logo: '/images/tokens/usdt.png' },
      apy: 22.8,
      tvl: 15200000,
      rewardToken: { symbol: 'CBT', logo: '/images/tokens/cbt.png' },
      rewardRate: 500,
      isActive: true,
      multiplier: '1x',
      lockPeriod: 0,
      userStaked: 0,
      userRewards: 0,
      poolAddress: '0x3456...7890'
    },
    {
      id: 4,
      name: 'CBT-ETH LP',
      token0: { symbol: 'CBT', logo: '/images/tokens/cbt.png' },
      token1: { symbol: 'ETH', logo: '/images/tokens/eth.png' },
      apy: 125.4,
      tvl: 3200000,
      rewardToken: { symbol: 'CBT', logo: '/images/tokens/cbt.png' },
      rewardRate: 2000,
      isActive: true,
      multiplier: '5x',
      lockPeriod: 30, // 30 days
      userStaked: 0,
      userRewards: 0,
      poolAddress: '0x4567...8901'
    },
    {
      id: 5,
      name: 'WBTC-ETH LP',
      token0: { symbol: 'WBTC', logo: '/images/tokens/wbtc.png' },
      token1: { symbol: 'ETH', logo: '/images/tokens/eth.png' },
      apy: 0,
      tvl: 5600000,
      rewardToken: { symbol: 'CBT', logo: '/images/tokens/cbt.png' },
      rewardRate: 0,
      isActive: false,
      multiplier: '3x',
      lockPeriod: 14,
      userStaked: 0,
      userRewards: 0,
      poolAddress: '0x5678...9012'
    }
  ];

  // 加载农场数据
  useEffect(() => {
    const loadFarms = async () => {
      setLoading(true);
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFarms(mockFarms);
        
        // 模拟用户质押数据
        const stakes = {};
        mockFarms.forEach(farm => {
          if (farm.userStaked > 0) {
            stakes[farm.id] = {
              amount: farm.userStaked,
              rewards: farm.userRewards,
              stakedAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            };
          }
        });
        setUserStakes(stakes);
        
      } catch (error) {
        console.error('加载农场数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFarms();
  }, []);

  // 过滤和排序农场
  const filteredAndSortedFarms = farms
    .filter(farm => {
      // 搜索过滤
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          farm.name.toLowerCase().includes(searchLower) ||
          farm.token0.symbol.toLowerCase().includes(searchLower) ||
          farm.token1.symbol.toLowerCase().includes(searchLower) ||
          farm.rewardToken.symbol.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // 状态过滤
      switch (filter) {
        case 'active':
          return farm.isActive;
        case 'inactive':
          return !farm.isActive;
        case 'staked':
          return farm.userStaked > 0;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'apy':
          return b.apy - a.apy;
        case 'tvl':
          return b.tvl - a.tvl;
        case 'rewards':
          return b.rewardRate - a.rewardRate;
        default:
          return 0;
      }
    });

  // 格式化数值
  const formatNumber = (num, decimals = 2) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(decimals)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(decimals)}K`;
    }
    return `$${num.toFixed(decimals)}`;
  };

  // 格式化APY
  const formatAPY = (apy) => {
    if (apy === 0) return '已结束';
    return `${apy.toFixed(1)}%`;
  };

  // 计算总统计数据
  const totalStats = farms.reduce((acc, farm) => {
    acc.totalTVL += farm.tvl;
    acc.totalRewards += farm.rewardRate;
    if (farm.userStaked > 0) {
      acc.userTotalStaked += farm.userStaked;
      acc.userTotalRewards += farm.userRewards;
    }
    return acc;
  }, {
    totalTVL: 0,
    totalRewards: 0,
    userTotalStaked: 0,
    userTotalRewards: 0
  });

  // TVL分布数据（用于饼图）
  const tvlDistribution = farms
    .filter(farm => farm.tvl > 0)
    .map(farm => ({
      name: farm.name,
      value: farm.tvl,
      color: `hsl(${farm.id * 60}, 70%, 60%)`
    }));

  // APY对比数据（用于柱状图）
  const apyComparison = farms
    .filter(farm => farm.isActive)
    .map(farm => ({
      name: farm.name.replace(' LP', ''),
      apy: farm.apy
    }));

  // 处理质押操作
  const handleStake = (farmId) => {
    // 这里应该打开质押模态框
    console.log('质押农场:', farmId);
  };

  // 处理取消质押操作
  const handleUnstake = (farmId) => {
    // 这里应该打开取消质押模态框
    console.log('取消质押农场:', farmId);
  };

  // 处理领取奖励操作
  const handleClaimRewards = (farmId) => {
    // 这里应该执行领取奖励操作
    console.log('领取奖励:', farmId);
  };

  if (loading) {
    return (
      <div className="farm-list-loading">
        <div className="loading-spinner"></div>
        <p>加载流动性挖矿数据...</p>
      </div>
    );
  }

  return (
    <div className="farm-list">
      {/* 页面标题 */}
      <div className="farm-list-header">
        <h1>流动性挖矿</h1>
        <p>通过提供流动性获得代币奖励</p>
      </div>

      {/* 统计概览 */}
      <div className="farm-stats-grid">
        <div className="stat-card">
          <div className="stat-label">总锁定价值</div>
          <div className="stat-value">{formatNumber(totalStats.totalTVL)}</div>
          <div className="stat-change">+12.5% 24h</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">总奖励率</div>
          <div className="stat-value">{totalStats.totalRewards.toLocaleString()} CBT/天</div>
          <div className="stat-change">+5.2% 24h</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">我的质押</div>
          <div className="stat-value">{formatNumber(totalStats.userTotalStaked)}</div>
          <div className="stat-change">3 个农场</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">待领取奖励</div>
          <div className="stat-value">{totalStats.userTotalRewards.toFixed(2)} CBT</div>
          <div className="stat-change">
            <TransactionButton 
              size="small" 
              onClick={() => console.log('领取所有奖励')}
              disabled={totalStats.userTotalRewards === 0}
            >
              全部领取
            </TransactionButton>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="farm-charts">
        <div className="chart-container">
          <h3>TVL分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={tvlDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {tvlDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h3>APY对比</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={apyComparison}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="apy" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 过滤和搜索 */}
      <div className="farm-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="搜索农场..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={`filter-button ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            活跃
          </button>
          <button
            className={`filter-button ${filter === 'staked' ? 'active' : ''}`}
            onClick={() => setFilter('staked')}
          >
            已质押
          </button>
          <button
            className={`filter-button ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            已结束
          </button>
        </div>
        
        <div className="sort-container">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="apy">按APY排序</option>
            <option value="tvl">按TVL排序</option>
            <option value="rewards">按奖励排序</option>
          </select>
        </div>
      </div>

      {/* 农场列表 */}
      <div className="farm-grid">
        {filteredAndSortedFarms.map(farm => (
          <div key={farm.id} className={`farm-card ${!farm.isActive ? 'inactive' : ''}`}>
            {/* 农场头部 */}
            <div className="farm-card-header">
              <div className="farm-tokens">
                <div className="token-pair">
                  <img src={farm.token0.logo} alt={farm.token0.symbol} className="token-logo" />
                  <img src={farm.token1.logo} alt={farm.token1.symbol} className="token-logo overlap" />
                </div>
                <div className="farm-name">
                  <h3>{farm.name}</h3>
                  <span className="multiplier">{farm.multiplier}</span>
                </div>
              </div>
              
              <div className="farm-status">
                {farm.isActive ? (
                  <span className="status-badge active">活跃</span>
                ) : (
                  <span className="status-badge inactive">已结束</span>
                )}
              </div>
            </div>

            {/* 农场信息 */}
            <div className="farm-info">
              <div className="info-row">
                <span className="info-label">APY</span>
                <span className={`info-value apy ${farm.apy > 50 ? 'high' : ''}`}>
                  {formatAPY(farm.apy)}
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-label">TVL</span>
                <span className="info-value">{formatNumber(farm.tvl)}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">奖励代币</span>
                <span className="info-value">
                  <img src={farm.rewardToken.logo} alt={farm.rewardToken.symbol} className="reward-token-logo" />
                  {farm.rewardToken.symbol}
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-label">日奖励</span>
                <span className="info-value">{farm.rewardRate.toLocaleString()} CBT</span>
              </div>
              
              {farm.lockPeriod > 0 && (
                <div className="info-row">
                  <span className="info-label">锁定期</span>
                  <span className="info-value">{farm.lockPeriod} 天</span>
                </div>
              )}
            </div>

            {/* 用户质押信息 */}
            {farm.userStaked > 0 && (
              <div className="user-stake-info">
                <div className="stake-amount">
                  <span className="stake-label">已质押</span>
                  <span className="stake-value">{formatNumber(farm.userStaked)}</span>
                </div>
                
                <div className="pending-rewards">
                  <span className="rewards-label">待领取</span>
                  <span className="rewards-value">{farm.userRewards.toFixed(4)} CBT</span>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="farm-actions">
              {farm.isActive ? (
                <>
                  {farm.userStaked > 0 ? (
                    <div className="staked-actions">
                      <TransactionButton
                        variant="secondary"
                        size="small"
                        onClick={() => handleUnstake(farm.id)}
                        className="action-button"
                      >
                        取消质押
                      </TransactionButton>
                      
                      <TransactionButton
                        size="small"
                        onClick={() => handleClaimRewards(farm.id)}
                        disabled={farm.userRewards === 0}
                        className="action-button"
                      >
                        领取奖励
                      </TransactionButton>
                      
                      <TransactionButton
                        size="small"
                        onClick={() => handleStake(farm.id)}
                        className="action-button"
                      >
                        增加质押
                      </TransactionButton>
                    </div>
                  ) : (
                    <TransactionButton
                      fullWidth
                      onClick={() => handleStake(farm.id)}
                      className="stake-button"
                    >
                      开始质押
                    </TransactionButton>
                  )}
                </>
              ) : (
                <TransactionButton
                  fullWidth
                  disabled
                  variant="secondary"
                  className="disabled-button"
                >
                  农场已结束
                </TransactionButton>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {filteredAndSortedFarms.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🌾</div>
          <h3>没有找到匹配的农场</h3>
          <p>尝试调整搜索条件或过滤器</p>
        </div>
      )}
    </div>
  );
};

export default FarmList;

