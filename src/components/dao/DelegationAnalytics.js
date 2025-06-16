import React, { useState, useEffect, useContext } from 'react';
import { DAOContext } from '../../context/dao/DAOContext';
import './DelegationAnalytics.css';

// 委托分析组件
const DelegationAnalytics = () => {
  const { delegates, delegations, votes, proposals } = useContext(DAOContext);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedView, setSelectedView] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    delegates: {},
    delegators: {},
    performance: {},
    network: {}
  });

  // 时间范围选项
  const timeRangeOptions = [
    { value: '7d', label: '最近7天' },
    { value: '30d', label: '最近30天' },
    { value: '90d', label: '最近90天' },
    { value: '1y', label: '最近1年' },
    { value: 'all', label: '全部时间' }
  ];

  // 视图选项
  const viewOptions = [
    { value: 'overview', label: '总览' },
    { value: 'delegates', label: '代表分析' },
    { value: 'delegators', label: '委托者分析' },
    { value: 'performance', label: '绩效分析' },
    { value: 'network', label: '网络分析' }
  ];

  // 计算委托分析数据
  useEffect(() => {
    calculateDelegationAnalytics();
  }, [delegates, delegations, votes, timeRange]);

  const calculateDelegationAnalytics = () => {
    const now = new Date();
    const timeRangeMs = getTimeRangeMs(timeRange);
    const cutoffDate = new Date(now.getTime() - timeRangeMs);

    // 筛选时间范围内的数据
    const filteredDelegations = delegations.filter(d => 
      new Date(d.createdAt) >= cutoffDate
    );
    const filteredVotes = votes.filter(v => 
      new Date(v.timestamp) >= cutoffDate
    );

    // 计算各种分析数据
    const overview = calculateOverview(filteredDelegations, filteredVotes);
    const delegatesAnalysis = calculateDelegatesAnalysis(filteredDelegations, filteredVotes);
    const delegatorsAnalysis = calculateDelegatorsAnalysis(filteredDelegations);
    const performance = calculatePerformanceAnalysis(filteredVotes, filteredDelegations);
    const network = calculateNetworkAnalysis(filteredDelegations);

    setAnalyticsData({
      overview,
      delegates: delegatesAnalysis,
      delegators: delegatorsAnalysis,
      performance,
      network
    });
  };

  // 获取时间范围毫秒数
  const getTimeRangeMs = (range) => {
    const timeMap = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };
    return timeMap[range] || timeMap['30d'];
  };

  // 计算总览数据
  const calculateOverview = (delegations, votes) => {
    const totalDelegations = delegations.length;
    const activeDelegations = delegations.filter(d => d.status === 'active').length;
    const totalDelegatedPower = delegations.reduce((sum, d) => sum + d.amount, 0);
    
    // 计算委托率
    const totalVotingPower = delegates.reduce((sum, d) => sum + d.votingPower, 0);
    const delegationRate = totalVotingPower > 0 ? 
      (totalDelegatedPower / totalVotingPower * 100) : 0;

    // 计算平均委托金额
    const avgDelegationAmount = totalDelegations > 0 ? 
      totalDelegatedPower / totalDelegations : 0;

    // 委托增长趋势
    const delegationsByMonth = {};
    delegations.forEach(delegation => {
      const month = new Date(delegation.createdAt).toISOString().slice(0, 7);
      if (!delegationsByMonth[month]) {
        delegationsByMonth[month] = 0;
      }
      delegationsByMonth[month]++;
    });

    // 代表活跃度
    const delegateActivity = {};
    votes.forEach(vote => {
      if (vote.isDelegated) {
        if (!delegateActivity[vote.delegate]) {
          delegateActivity[vote.delegate] = 0;
        }
        delegateActivity[vote.delegate]++;
      }
    });

    const activeDelegates = Object.keys(delegateActivity).length;
    const totalDelegates = delegates.length;
    const delegateActivityRate = totalDelegates > 0 ? 
      (activeDelegates / totalDelegates * 100) : 0;

    return {
      totalDelegations,
      activeDelegations,
      totalDelegatedPower,
      delegationRate: delegationRate.toFixed(2),
      avgDelegationAmount: avgDelegationAmount.toFixed(2),
      delegationsByMonth,
      activeDelegates,
      totalDelegates,
      delegateActivityRate: delegateActivityRate.toFixed(2)
    };
  };

  // 计算代表分析数据
  const calculateDelegatesAnalysis = (delegations, votes) => {
    // 按代表统计委托信息
    const delegateStats = {};
    
    delegations.forEach(delegation => {
      const delegateId = delegation.delegate;
      if (!delegateStats[delegateId]) {
        delegateStats[delegateId] = {
          totalDelegated: 0,
          delegatorCount: 0,
          delegations: []
        };
      }
      delegateStats[delegateId].totalDelegated += delegation.amount;
      delegateStats[delegateId].delegatorCount++;
      delegateStats[delegateId].delegations.push(delegation);
    });

    // 计算代表投票活动
    const delegateVoting = {};
    votes.forEach(vote => {
      if (vote.isDelegated) {
        const delegateId = vote.delegate;
        if (!delegateVoting[delegateId]) {
          delegateVoting[delegateId] = {
            totalVotes: 0,
            votingPower: 0,
            choices: { for: 0, against: 0, abstain: 0 }
          };
        }
        delegateVoting[delegateId].totalVotes++;
        delegateVoting[delegateId].votingPower += vote.weight;
        delegateVoting[delegateId].choices[vote.choice]++;
      }
    });

    // 合并代表数据
    const delegateAnalysis = delegates.map(delegate => {
      const stats = delegateStats[delegate.id] || { totalDelegated: 0, delegatorCount: 0 };
      const voting = delegateVoting[delegate.id] || { totalVotes: 0, votingPower: 0, choices: { for: 0, against: 0, abstain: 0 } };
      
      return {
        ...delegate,
        ...stats,
        ...voting,
        efficiency: stats.delegatorCount > 0 ? voting.totalVotes / proposals.length * 100 : 0
      };
    });

    // 排序和分类
    const topDelegatesByPower = [...delegateAnalysis]
      .sort((a, b) => b.totalDelegated - a.totalDelegated)
      .slice(0, 10);

    const topDelegatesByActivity = [...delegateAnalysis]
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, 10);

    // 代表类型分布
    const delegateTypes = {
      whale: delegateAnalysis.filter(d => d.totalDelegated > 100000).length,
      active: delegateAnalysis.filter(d => d.totalVotes > proposals.length * 0.8).length,
      moderate: delegateAnalysis.filter(d => d.totalVotes > proposals.length * 0.5 && d.totalVotes <= proposals.length * 0.8).length,
      inactive: delegateAnalysis.filter(d => d.totalVotes <= proposals.length * 0.5).length
    };

    return {
      delegateAnalysis,
      topDelegatesByPower,
      topDelegatesByActivity,
      delegateTypes
    };
  };

  // 计算委托者分析数据
  const calculateDelegatorsAnalysis = (delegations) => {
    // 按委托者统计
    const delegatorStats = {};
    
    delegations.forEach(delegation => {
      const delegatorId = delegation.delegator;
      if (!delegatorStats[delegatorId]) {
        delegatorStats[delegatorId] = {
          totalDelegated: 0,
          delegateCount: 0,
          delegations: []
        };
      }
      delegatorStats[delegatorId].totalDelegated += delegation.amount;
      delegatorStats[delegatorId].delegateCount++;
      delegatorStats[delegatorId].delegations.push(delegation);
    });

    // 委托者行为分析
    const behaviorAnalysis = {
      singleDelegate: 0, // 只委托给一个代表
      multiDelegate: 0, // 委托给多个代表
      largeDelegator: 0, // 大额委托者
      smallDelegator: 0 // 小额委托者
    };

    Object.values(delegatorStats).forEach(stats => {
      if (stats.delegateCount === 1) {
        behaviorAnalysis.singleDelegate++;
      } else {
        behaviorAnalysis.multiDelegate++;
      }
      
      if (stats.totalDelegated > 10000) {
        behaviorAnalysis.largeDelegator++;
      } else {
        behaviorAnalysis.smallDelegator++;
      }
    });

    // 委托金额分布
    const amountDistribution = {
      small: delegations.filter(d => d.amount < 1000).length,
      medium: delegations.filter(d => d.amount >= 1000 && d.amount < 10000).length,
      large: delegations.filter(d => d.amount >= 10000).length
    };

    // 委托持续时间分析
    const now = new Date();
    const durationAnalysis = {
      short: 0, // 少于30天
      medium: 0, // 30-90天
      long: 0 // 超过90天
    };

    delegations.forEach(delegation => {
      const duration = now - new Date(delegation.createdAt);
      const days = duration / (1000 * 60 * 60 * 24);
      
      if (days < 30) {
        durationAnalysis.short++;
      } else if (days < 90) {
        durationAnalysis.medium++;
      } else {
        durationAnalysis.long++;
      }
    });

    return {
      totalDelegators: Object.keys(delegatorStats).length,
      behaviorAnalysis,
      amountDistribution,
      durationAnalysis,
      delegatorStats
    };
  };

  // 计算绩效分析数据
  const calculatePerformanceAnalysis = (votes, delegations) => {
    // 代表投票绩效
    const delegatePerformance = {};
    
    votes.forEach(vote => {
      if (vote.isDelegated) {
        const delegateId = vote.delegate;
        if (!delegatePerformance[delegateId]) {
          delegatePerformance[delegateId] = {
            totalVotes: 0,
            onTimeVotes: 0,
            proposalsParticipated: new Set(),
            avgResponseTime: 0,
            responseTimes: []
          };
        }
        
        delegatePerformance[delegateId].totalVotes++;
        delegatePerformance[delegateId].proposalsParticipated.add(vote.proposalId);
        
        // 计算响应时间
        const proposal = proposals.find(p => p.id === vote.proposalId);
        if (proposal) {
          const responseTime = new Date(vote.timestamp) - new Date(proposal.createdAt);
          const hours = responseTime / (1000 * 60 * 60);
          delegatePerformance[delegateId].responseTimes.push(hours);
          
          // 24小时内投票算及时
          if (hours <= 24) {
            delegatePerformance[delegateId].onTimeVotes++;
          }
        }
      }
    });

    // 计算平均响应时间
    Object.keys(delegatePerformance).forEach(delegateId => {
      const perf = delegatePerformance[delegateId];
      perf.avgResponseTime = perf.responseTimes.length > 0 ? 
        perf.responseTimes.reduce((a, b) => a + b, 0) / perf.responseTimes.length : 0;
      perf.participationRate = (perf.proposalsParticipated.size / proposals.length * 100).toFixed(2);
      perf.onTimeRate = (perf.onTimeVotes / perf.totalVotes * 100).toFixed(2);
    });

    // 绩效排名
    const performanceRanking = Object.entries(delegatePerformance)
      .map(([delegateId, perf]) => ({
        delegateId,
        ...perf,
        score: (parseFloat(perf.participationRate) * 0.4 + parseFloat(perf.onTimeRate) * 0.6)
      }))
      .sort((a, b) => b.score - a.score);

    // 委托效果分析
    const delegationEffectiveness = {
      totalDelegatedVotes: votes.filter(v => v.isDelegated).length,
      totalDirectVotes: votes.filter(v => !v.isDelegated).length,
      avgDelegatedWeight: 0,
      avgDirectWeight: 0
    };

    const delegatedVotes = votes.filter(v => v.isDelegated);
    const directVotes = votes.filter(v => !v.isDelegated);

    if (delegatedVotes.length > 0) {
      delegationEffectiveness.avgDelegatedWeight = 
        delegatedVotes.reduce((sum, v) => sum + v.weight, 0) / delegatedVotes.length;
    }

    if (directVotes.length > 0) {
      delegationEffectiveness.avgDirectWeight = 
        directVotes.reduce((sum, v) => sum + v.weight, 0) / directVotes.length;
    }

    return {
      delegatePerformance,
      performanceRanking,
      delegationEffectiveness
    };
  };

  // 计算网络分析数据
  const calculateNetworkAnalysis = (delegations) => {
    // 委托网络图数据
    const nodes = new Set();
    const edges = [];

    delegations.forEach(delegation => {
      nodes.add(delegation.delegator);
      nodes.add(delegation.delegate);
      edges.push({
        source: delegation.delegator,
        target: delegation.delegate,
        weight: delegation.amount
      });
    });

    // 网络中心性分析
    const centrality = {};
    nodes.forEach(node => {
      centrality[node] = {
        inDegree: 0, // 入度（被委托次数）
        outDegree: 0, // 出度（委托次数）
        totalWeight: 0 // 总权重
      };
    });

    edges.forEach(edge => {
      centrality[edge.target].inDegree++;
      centrality[edge.source].outDegree++;
      centrality[edge.target].totalWeight += edge.weight;
    });

    // 识别关键节点
    const keyNodes = {
      hubs: [], // 委托枢纽（高出度）
      authorities: [], // 权威节点（高入度）
      bridges: [] // 桥接节点
    };

    Object.entries(centrality).forEach(([node, metrics]) => {
      if (metrics.outDegree > 3) {
        keyNodes.hubs.push({ node, ...metrics });
      }
      if (metrics.inDegree > 5) {
        keyNodes.authorities.push({ node, ...metrics });
      }
    });

    // 网络密度
    const maxPossibleEdges = nodes.size * (nodes.size - 1);
    const networkDensity = maxPossibleEdges > 0 ? 
      (edges.length / maxPossibleEdges * 100) : 0;

    // 委托集中度
    const totalDelegated = delegations.reduce((sum, d) => sum + d.amount, 0);
    const top10Delegates = Object.entries(centrality)
      .sort((a, b) => b[1].totalWeight - a[1].totalWeight)
      .slice(0, 10);
    
    const top10Power = top10Delegates.reduce((sum, [_, metrics]) => sum + metrics.totalWeight, 0);
    const concentrationRatio = totalDelegated > 0 ? (top10Power / totalDelegated * 100) : 0;

    return {
      networkSize: nodes.size,
      totalEdges: edges.length,
      networkDensity: networkDensity.toFixed(2),
      concentrationRatio: concentrationRatio.toFixed(2),
      keyNodes,
      centrality
    };
  };

  // 渲染总览
  const renderOverview = () => {
    const { overview } = analyticsData;
    
    return (
      <div className="analytics-section">
        <h3>委托总览</h3>
        
        <div className="overview-metrics">
          <div className="metric-row">
            <div className="metric-card">
              <h4>总委托数</h4>
              <div className="metric-value">{overview.totalDelegations}</div>
              <div className="metric-label">累计委托</div>
            </div>
            
            <div className="metric-card">
              <h4>活跃委托</h4>
              <div className="metric-value">{overview.activeDelegations}</div>
              <div className="metric-label">当前有效</div>
            </div>
            
            <div className="metric-card">
              <h4>委托总量</h4>
              <div className="metric-value">{parseFloat(overview.totalDelegatedPower).toLocaleString()}</div>
              <div className="metric-label">投票权重</div>
            </div>
            
            <div className="metric-card">
              <h4>委托率</h4>
              <div className="metric-value">{overview.delegationRate}%</div>
              <div className="metric-label">参与度</div>
            </div>
          </div>
          
          <div className="metric-row">
            <div className="metric-card">
              <h4>平均委托</h4>
              <div className="metric-value">{parseFloat(overview.avgDelegationAmount).toLocaleString()}</div>
              <div className="metric-label">单笔金额</div>
            </div>
            
            <div className="metric-card">
              <h4>活跃代表</h4>
              <div className="metric-value">{overview.activeDelegates}</div>
              <div className="metric-label">参与投票</div>
            </div>
            
            <div className="metric-card">
              <h4>总代表数</h4>
              <div className="metric-value">{overview.totalDelegates}</div>
              <div className="metric-label">注册代表</div>
            </div>
            
            <div className="metric-card">
              <h4>代表活跃率</h4>
              <div className="metric-value">{overview.delegateActivityRate}%</div>
              <div className="metric-label">投票参与</div>
            </div>
          </div>
        </div>

        <div className="delegation-trends">
          <h4>委托增长趋势</h4>
          <div className="trends-chart">
            {Object.entries(overview.delegationsByMonth || {}).map(([month, count]) => (
              <div key={month} className="trend-bar">
                <div className="trend-month">{month}</div>
                <div className="trend-value">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染代表分析
  const renderDelegatesAnalysis = () => {
    const { delegates: delegatesData } = analyticsData;
    
    return (
      <div className="analytics-section">
        <h3>代表分析</h3>
        
        <div className="delegates-overview">
          <h4>代表类型分布</h4>
          <div className="delegate-types">
            <div className="type-item whale">
              <span>鲸鱼代表 (&gt;100K)</span>
              <span>{delegatesData.delegateTypes?.whale || 0}</span>
            </div>
            <div className="type-item active">
              <span>活跃代表 (&gt;80%参与)</span>
              <span>{delegatesData.delegateTypes?.active || 0}</span>
            </div>
            <div className="type-item moderate">
              <span>中等代表 (50-80%参与)</span>
              <span>{delegatesData.delegateTypes?.moderate || 0}</span>
            </div>
            <div className="type-item inactive">
              <span>不活跃代表 (&lt;50%参与)</span>
              <span>{delegatesData.delegateTypes?.inactive || 0}</span>
            </div>
          </div>
        </div>

        <div className="top-delegates">
          <div className="top-list">
            <h4>权重排行榜</h4>
            <div className="delegate-list">
              {delegatesData.topDelegatesByPower?.slice(0, 5).map((delegate, index) => (
                <div key={delegate.id} className="delegate-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="delegate-name">{delegate.name}</span>
                  <span className="delegate-power">{delegate.totalDelegated.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="top-list">
            <h4>活跃度排行榜</h4>
            <div className="delegate-list">
              {delegatesData.topDelegatesByActivity?.slice(0, 5).map((delegate, index) => (
                <div key={delegate.id} className="delegate-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="delegate-name">{delegate.name}</span>
                  <span className="delegate-votes">{delegate.totalVotes} 票</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染委托者分析
  const renderDelegatorsAnalysis = () => {
    const { delegators } = analyticsData;
    
    return (
      <div className="analytics-section">
        <h3>委托者分析</h3>
        
        <div className="delegators-overview">
          <div className="overview-stat">
            <h4>总委托者数</h4>
            <div className="stat-value">{delegators.totalDelegators}</div>
          </div>
        </div>

        <div className="behavior-analysis">
          <h4>委托行为分析</h4>
          <div className="behavior-grid">
            <div className="behavior-item">
              <span>单一委托</span>
              <span>{delegators.behaviorAnalysis?.singleDelegate || 0}</span>
            </div>
            <div className="behavior-item">
              <span>多重委托</span>
              <span>{delegators.behaviorAnalysis?.multiDelegate || 0}</span>
            </div>
            <div className="behavior-item">
              <span>大额委托者</span>
              <span>{delegators.behaviorAnalysis?.largeDelegator || 0}</span>
            </div>
            <div className="behavior-item">
              <span>小额委托者</span>
              <span>{delegators.behaviorAnalysis?.smallDelegator || 0}</span>
            </div>
          </div>
        </div>

        <div className="amount-distribution">
          <h4>委托金额分布</h4>
          <div className="distribution-chart">
            <div className="amount-item small">
              <span>小额 (&lt;1K)</span>
              <span>{delegators.amountDistribution?.small || 0}</span>
            </div>
            <div className="amount-item medium">
              <span>中等 (1K-10K)</span>
              <span>{delegators.amountDistribution?.medium || 0}</span>
            </div>
            <div className="amount-item large">
              <span>大额 (&gt;10K)</span>
              <span>{delegators.amountDistribution?.large || 0}</span>
            </div>
          </div>
        </div>

        <div className="duration-analysis">
          <h4>委托持续时间</h4>
          <div className="duration-chart">
            <div className="duration-item short">
              <span>短期 (&lt;30天)</span>
              <span>{delegators.durationAnalysis?.short || 0}</span>
            </div>
            <div className="duration-item medium">
              <span>中期 (30-90天)</span>
              <span>{delegators.durationAnalysis?.medium || 0}</span>
            </div>
            <div className="duration-item long">
              <span>长期 (&gt;90天)</span>
              <span>{delegators.durationAnalysis?.long || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染绩效分析
  const renderPerformanceAnalysis = () => {
    const { performance } = analyticsData;
    
    return (
      <div className="analytics-section">
        <h3>绩效分析</h3>
        
        <div className="performance-ranking">
          <h4>代表绩效排名</h4>
          <div className="ranking-list">
            {performance.performanceRanking?.slice(0, 10).map((delegate, index) => (
              <div key={delegate.delegateId} className="ranking-item">
                <span className="rank">#{index + 1}</span>
                <span className="delegate-id">{delegate.delegateId}</span>
                <span className="participation">{delegate.participationRate}%</span>
                <span className="on-time">{delegate.onTimeRate}%</span>
                <span className="score">{delegate.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="effectiveness-comparison">
          <h4>委托效果对比</h4>
          <div className="comparison-grid">
            <div className="comparison-item">
              <h5>委托投票</h5>
              <div className="comparison-value">{performance.delegationEffectiveness?.totalDelegatedVotes || 0}</div>
              <div className="comparison-label">总票数</div>
            </div>
            <div className="comparison-item">
              <h5>直接投票</h5>
              <div className="comparison-value">{performance.delegationEffectiveness?.totalDirectVotes || 0}</div>
              <div className="comparison-label">总票数</div>
            </div>
            <div className="comparison-item">
              <h5>委托平均权重</h5>
              <div className="comparison-value">{(performance.delegationEffectiveness?.avgDelegatedWeight || 0).toFixed(0)}</div>
              <div className="comparison-label">投票权重</div>
            </div>
            <div className="comparison-item">
              <h5>直接平均权重</h5>
              <div className="comparison-value">{(performance.delegationEffectiveness?.avgDirectWeight || 0).toFixed(0)}</div>
              <div className="comparison-label">投票权重</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染网络分析
  const renderNetworkAnalysis = () => {
    const { network } = analyticsData;
    
    return (
      <div className="analytics-section">
        <h3>网络分析</h3>
        
        <div className="network-metrics">
          <div className="network-metric">
            <h4>网络规模</h4>
            <div className="metric-value">{network.networkSize}</div>
            <div className="metric-label">节点数</div>
          </div>
          
          <div className="network-metric">
            <h4>连接数</h4>
            <div className="metric-value">{network.totalEdges}</div>
            <div className="metric-label">委托关系</div>
          </div>
          
          <div className="network-metric">
            <h4>网络密度</h4>
            <div className="metric-value">{network.networkDensity}%</div>
            <div className="metric-label">连接度</div>
          </div>
          
          <div className="network-metric">
            <h4>集中度</h4>
            <div className="metric-value">{network.concentrationRatio}%</div>
            <div className="metric-label">Top10占比</div>
          </div>
        </div>

        <div className="key-nodes">
          <h4>关键节点</h4>
          <div className="nodes-grid">
            <div className="node-category">
              <h5>权威节点</h5>
              <div className="node-list">
                {network.keyNodes?.authorities?.slice(0, 5).map((node, index) => (
                  <div key={node.node} className="node-item authority">
                    <span>{node.node}</span>
                    <span>{node.inDegree} 委托</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="node-category">
              <h5>委托枢纽</h5>
              <div className="node-list">
                {network.keyNodes?.hubs?.slice(0, 5).map((node, index) => (
                  <div key={node.node} className="node-item hub">
                    <span>{node.node}</span>
                    <span>{node.outDegree} 委托</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染当前选中的视图
  const renderCurrentView = () => {
    switch (selectedView) {
      case 'overview':
        return renderOverview();
      case 'delegates':
        return renderDelegatesAnalysis();
      case 'delegators':
        return renderDelegatorsAnalysis();
      case 'performance':
        return renderPerformanceAnalysis();
      case 'network':
        return renderNetworkAnalysis();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="delegation-analytics">
      <div className="analytics-header">
        <h2>委托分析</h2>
        
        <div className="analytics-controls">
          <div className="control-group">
            <label>时间范围:</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-select"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>分析视图:</label>
            <select 
              value={selectedView} 
              onChange={(e) => setSelectedView(e.target.value)}
              className="view-select"
            >
              {viewOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default DelegationAnalytics;

