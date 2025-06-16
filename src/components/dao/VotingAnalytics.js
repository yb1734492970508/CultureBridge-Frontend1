import React, { useState, useEffect, useContext } from 'react';
import { DAOContext } from '../../context/dao/DAOContext';
import './VotingAnalytics.css';

// 投票分析组件
const VotingAnalytics = () => {
  const { proposals, votes, delegates } = useContext(DAOContext);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('participation');
  const [analyticsData, setAnalyticsData] = useState({
    participation: {},
    patterns: {},
    demographics: {},
    trends: {}
  });

  // 时间范围选项
  const timeRangeOptions = [
    { value: '7d', label: '最近7天' },
    { value: '30d', label: '最近30天' },
    { value: '90d', label: '最近90天' },
    { value: '1y', label: '最近1年' },
    { value: 'all', label: '全部时间' }
  ];

  // 分析指标选项
  const metricOptions = [
    { value: 'participation', label: '参与度分析' },
    { value: 'patterns', label: '投票模式' },
    { value: 'demographics', label: '用户画像' },
    { value: 'trends', label: '趋势分析' }
  ];

  // 计算投票分析数据
  useEffect(() => {
    calculateAnalytics();
  }, [proposals, votes, timeRange]);

  const calculateAnalytics = () => {
    const now = new Date();
    const timeRangeMs = getTimeRangeMs(timeRange);
    const cutoffDate = new Date(now.getTime() - timeRangeMs);

    // 筛选时间范围内的数据
    const filteredProposals = proposals.filter(p => 
      new Date(p.createdAt) >= cutoffDate
    );
    const filteredVotes = votes.filter(v => 
      new Date(v.timestamp) >= cutoffDate
    );

    // 计算参与度分析
    const participation = calculateParticipation(filteredProposals, filteredVotes);
    
    // 计算投票模式
    const patterns = calculateVotingPatterns(filteredVotes);
    
    // 计算用户画像
    const demographics = calculateDemographics(filteredVotes);
    
    // 计算趋势分析
    const trends = calculateTrends(filteredProposals, filteredVotes);

    setAnalyticsData({
      participation,
      patterns,
      demographics,
      trends
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

  // 计算参与度分析
  const calculateParticipation = (proposals, votes) => {
    const totalProposals = proposals.length;
    const totalVotes = votes.length;
    const uniqueVoters = new Set(votes.map(v => v.voter)).size;
    
    // 计算平均参与率
    const avgParticipation = totalProposals > 0 ? 
      (totalVotes / totalProposals / uniqueVoters * 100) : 0;

    // 按提案类型分析参与度
    const participationByType = {};
    proposals.forEach(proposal => {
      const proposalVotes = votes.filter(v => v.proposalId === proposal.id);
      const participationRate = proposalVotes.length / uniqueVoters * 100;
      
      if (!participationByType[proposal.type]) {
        participationByType[proposal.type] = [];
      }
      participationByType[proposal.type].push(participationRate);
    });

    // 计算每种类型的平均参与率
    Object.keys(participationByType).forEach(type => {
      const rates = participationByType[type];
      participationByType[type] = {
        average: rates.reduce((a, b) => a + b, 0) / rates.length,
        count: rates.length,
        rates
      };
    });

    // 活跃投票者分析
    const voterActivity = {};
    votes.forEach(vote => {
      if (!voterActivity[vote.voter]) {
        voterActivity[vote.voter] = 0;
      }
      voterActivity[vote.voter]++;
    });

    const activityLevels = {
      high: 0, // 参与超过80%的提案
      medium: 0, // 参与50-80%的提案
      low: 0 // 参与少于50%的提案
    };

    Object.values(voterActivity).forEach(count => {
      const participationRate = count / totalProposals;
      if (participationRate >= 0.8) {
        activityLevels.high++;
      } else if (participationRate >= 0.5) {
        activityLevels.medium++;
      } else {
        activityLevels.low++;
      }
    });

    return {
      totalProposals,
      totalVotes,
      uniqueVoters,
      avgParticipation: avgParticipation.toFixed(2),
      participationByType,
      activityLevels
    };
  };

  // 计算投票模式
  const calculateVotingPatterns = (votes) => {
    // 投票选择分布
    const voteDistribution = {
      for: votes.filter(v => v.choice === 'for').length,
      against: votes.filter(v => v.choice === 'against').length,
      abstain: votes.filter(v => v.choice === 'abstain').length
    };

    // 投票时间模式
    const hourlyPattern = new Array(24).fill(0);
    const dailyPattern = new Array(7).fill(0);
    
    votes.forEach(vote => {
      const date = new Date(vote.timestamp);
      hourlyPattern[date.getHours()]++;
      dailyPattern[date.getDay()]++;
    });

    // 投票权重分析
    const weightDistribution = {
      small: votes.filter(v => v.weight < 1000).length,
      medium: votes.filter(v => v.weight >= 1000 && v.weight < 10000).length,
      large: votes.filter(v => v.weight >= 10000).length
    };

    // 快速投票 vs 深思熟虑投票
    const votingSpeed = {
      quick: 0, // 提案发布后24小时内投票
      normal: 0, // 24-72小时内投票
      late: 0 // 72小时后投票
    };

    votes.forEach(vote => {
      const proposal = proposals.find(p => p.id === vote.proposalId);
      if (proposal) {
        const timeDiff = new Date(vote.timestamp) - new Date(proposal.createdAt);
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff <= 24) {
          votingSpeed.quick++;
        } else if (hoursDiff <= 72) {
          votingSpeed.normal++;
        } else {
          votingSpeed.late++;
        }
      }
    });

    return {
      voteDistribution,
      hourlyPattern,
      dailyPattern,
      weightDistribution,
      votingSpeed
    };
  };

  // 计算用户画像
  const calculateDemographics = (votes) => {
    // 按投票权重分组用户
    const usersByWeight = {
      whale: [], // 权重 > 100k
      dolphin: [], // 权重 10k-100k
      fish: [], // 权重 1k-10k
      shrimp: [] // 权重 < 1k
    };

    const userWeights = {};
    votes.forEach(vote => {
      if (!userWeights[vote.voter]) {
        userWeights[vote.voter] = 0;
      }
      userWeights[vote.voter] = Math.max(userWeights[vote.voter], vote.weight);
    });

    Object.entries(userWeights).forEach(([user, weight]) => {
      if (weight > 100000) {
        usersByWeight.whale.push(user);
      } else if (weight > 10000) {
        usersByWeight.dolphin.push(user);
      } else if (weight > 1000) {
        usersByWeight.fish.push(user);
      } else {
        usersByWeight.shrimp.push(user);
      }
    });

    // 投票行为分析
    const behaviorAnalysis = {};
    votes.forEach(vote => {
      if (!behaviorAnalysis[vote.voter]) {
        behaviorAnalysis[vote.voter] = {
          for: 0,
          against: 0,
          abstain: 0,
          total: 0
        };
      }
      behaviorAnalysis[vote.voter][vote.choice]++;
      behaviorAnalysis[vote.voter].total++;
    });

    // 分类用户行为类型
    const behaviorTypes = {
      supporter: 0, // 主要投赞成票
      critic: 0, // 主要投反对票
      neutral: 0, // 经常弃权
      balanced: 0 // 各种投票都有
    };

    Object.values(behaviorAnalysis).forEach(behavior => {
      const forRate = behavior.for / behavior.total;
      const againstRate = behavior.against / behavior.total;
      const abstainRate = behavior.abstain / behavior.total;

      if (forRate > 0.7) {
        behaviorTypes.supporter++;
      } else if (againstRate > 0.7) {
        behaviorTypes.critic++;
      } else if (abstainRate > 0.5) {
        behaviorTypes.neutral++;
      } else {
        behaviorTypes.balanced++;
      }
    });

    return {
      usersByWeight,
      behaviorTypes,
      totalUsers: Object.keys(userWeights).length
    };
  };

  // 计算趋势分析
  const calculateTrends = (proposals, votes) => {
    // 按月统计参与度趋势
    const monthlyTrends = {};
    
    proposals.forEach(proposal => {
      const month = new Date(proposal.createdAt).toISOString().slice(0, 7);
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = {
          proposals: 0,
          votes: 0,
          uniqueVoters: new Set()
        };
      }
      monthlyTrends[month].proposals++;
      
      const proposalVotes = votes.filter(v => v.proposalId === proposal.id);
      monthlyTrends[month].votes += proposalVotes.length;
      proposalVotes.forEach(vote => {
        monthlyTrends[month].uniqueVoters.add(vote.voter);
      });
    });

    // 转换为数组格式
    const trendsArray = Object.entries(monthlyTrends).map(([month, data]) => ({
      month,
      proposals: data.proposals,
      votes: data.votes,
      uniqueVoters: data.uniqueVoters.size,
      avgVotesPerProposal: data.proposals > 0 ? data.votes / data.proposals : 0
    })).sort((a, b) => a.month.localeCompare(b.month));

    // 计算增长率
    const growthRates = trendsArray.map((current, index) => {
      if (index === 0) return { ...current, growth: 0 };
      
      const previous = trendsArray[index - 1];
      const growth = previous.uniqueVoters > 0 ? 
        ((current.uniqueVoters - previous.uniqueVoters) / previous.uniqueVoters * 100) : 0;
      
      return { ...current, growth: growth.toFixed(2) };
    });

    return {
      monthlyTrends: growthRates,
      totalGrowth: growthRates.length > 1 ? 
        growthRates[growthRates.length - 1].growth : 0
    };
  };

  // 渲染参与度分析
  const renderParticipationAnalysis = () => {
    const { participation } = analyticsData;
    
    return (
      <div className="analytics-section">
        <h3>参与度分析</h3>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>总体统计</h4>
            <div className="metric-value">{participation.totalProposals}</div>
            <div className="metric-label">总提案数</div>
          </div>
          
          <div className="metric-card">
            <h4>投票总数</h4>
            <div className="metric-value">{participation.totalVotes}</div>
            <div className="metric-label">累计投票</div>
          </div>
          
          <div className="metric-card">
            <h4>活跃用户</h4>
            <div className="metric-value">{participation.uniqueVoters}</div>
            <div className="metric-label">独立投票者</div>
          </div>
          
          <div className="metric-card">
            <h4>平均参与率</h4>
            <div className="metric-value">{participation.avgParticipation}%</div>
            <div className="metric-label">参与度</div>
          </div>
        </div>

        <div className="participation-breakdown">
          <h4>按提案类型参与度</h4>
          <div className="type-participation">
            {Object.entries(participation.participationByType || {}).map(([type, data]) => (
              <div key={type} className="type-item">
                <span className="type-name">{type}</span>
                <div className="participation-bar">
                  <div 
                    className="participation-fill" 
                    style={{ width: `${data.average}%` }}
                  ></div>
                </div>
                <span className="participation-value">{data.average.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-levels">
          <h4>用户活跃度分布</h4>
          <div className="activity-chart">
            <div className="activity-item">
              <div className="activity-label">高活跃度</div>
              <div className="activity-bar">
                <div 
                  className="activity-fill high" 
                  style={{ width: `${(participation.activityLevels?.high || 0) / participation.uniqueVoters * 100}%` }}
                ></div>
              </div>
              <span>{participation.activityLevels?.high || 0}</span>
            </div>
            
            <div className="activity-item">
              <div className="activity-label">中等活跃度</div>
              <div className="activity-bar">
                <div 
                  className="activity-fill medium" 
                  style={{ width: `${(participation.activityLevels?.medium || 0) / participation.uniqueVoters * 100}%` }}
                ></div>
              </div>
              <span>{participation.activityLevels?.medium || 0}</span>
            </div>
            
            <div className="activity-item">
              <div className="activity-label">低活跃度</div>
              <div className="activity-bar">
                <div 
                  className="activity-fill low" 
                  style={{ width: `${(participation.activityLevels?.low || 0) / participation.uniqueVoters * 100}%` }}
                ></div>
              </div>
              <span>{participation.activityLevels?.low || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染投票模式分析
  const renderPatternsAnalysis = () => {
    const { patterns } = analyticsData;
    
    return (
      <div className="analytics-section">
        <h3>投票模式分析</h3>
        
        <div className="patterns-grid">
          <div className="pattern-card">
            <h4>投票选择分布</h4>
            <div className="vote-distribution">
              <div className="vote-item for">
                <span>赞成</span>
                <span>{patterns.voteDistribution?.for || 0}</span>
              </div>
              <div className="vote-item against">
                <span>反对</span>
                <span>{patterns.voteDistribution?.against || 0}</span>
              </div>
              <div className="vote-item abstain">
                <span>弃权</span>
                <span>{patterns.voteDistribution?.abstain || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="pattern-card">
            <h4>投票权重分布</h4>
            <div className="weight-distribution">
              <div className="weight-item">
                <span>小额投票者 (&lt;1K)</span>
                <span>{patterns.weightDistribution?.small || 0}</span>
              </div>
              <div className="weight-item">
                <span>中等投票者 (1K-10K)</span>
                <span>{patterns.weightDistribution?.medium || 0}</span>
              </div>
              <div className="weight-item">
                <span>大额投票者 (&gt;10K)</span>
                <span>{patterns.weightDistribution?.large || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="timing-patterns">
          <h4>投票时间模式</h4>
          <div className="timing-grid">
            <div className="timing-chart">
              <h5>每日投票分布</h5>
              <div className="daily-chart">
                {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => (
                  <div key={day} className="day-bar">
                    <div 
                      className="day-fill" 
                      style={{ 
                        height: `${(patterns.dailyPattern?.[index] || 0) / Math.max(...(patterns.dailyPattern || [1])) * 100}%` 
                      }}
                    ></div>
                    <span className="day-label">{day}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="speed-analysis">
              <h5>投票响应速度</h5>
              <div className="speed-distribution">
                <div className="speed-item quick">
                  <span>快速投票 (24h内)</span>
                  <span>{patterns.votingSpeed?.quick || 0}</span>
                </div>
                <div className="speed-item normal">
                  <span>正常投票 (24-72h)</span>
                  <span>{patterns.votingSpeed?.normal || 0}</span>
                </div>
                <div className="speed-item late">
                  <span>延迟投票 (72h后)</span>
                  <span>{patterns.votingSpeed?.late || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染用户画像分析
  const renderDemographicsAnalysis = () => {
    const { demographics } = analyticsData;
    
    return (
      <div className="analytics-section">
        <h3>用户画像分析</h3>
        
        <div className="demographics-grid">
          <div className="demo-card">
            <h4>按投票权重分类</h4>
            <div className="weight-categories">
              <div className="category-item whale">
                <span>鲸鱼用户 (&gt;100K)</span>
                <span>{demographics.usersByWeight?.whale?.length || 0}</span>
              </div>
              <div className="category-item dolphin">
                <span>海豚用户 (10K-100K)</span>
                <span>{demographics.usersByWeight?.dolphin?.length || 0}</span>
              </div>
              <div className="category-item fish">
                <span>鱼类用户 (1K-10K)</span>
                <span>{demographics.usersByWeight?.fish?.length || 0}</span>
              </div>
              <div className="category-item shrimp">
                <span>虾米用户 (&lt;1K)</span>
                <span>{demographics.usersByWeight?.shrimp?.length || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="demo-card">
            <h4>投票行为类型</h4>
            <div className="behavior-types">
              <div className="behavior-item supporter">
                <span>支持者</span>
                <span>{demographics.behaviorTypes?.supporter || 0}</span>
              </div>
              <div className="behavior-item critic">
                <span>批评者</span>
                <span>{demographics.behaviorTypes?.critic || 0}</span>
              </div>
              <div className="behavior-item neutral">
                <span>中立者</span>
                <span>{demographics.behaviorTypes?.neutral || 0}</span>
              </div>
              <div className="behavior-item balanced">
                <span>平衡者</span>
                <span>{demographics.behaviorTypes?.balanced || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染趋势分析
  const renderTrendsAnalysis = () => {
    const { trends } = analyticsData;
    
    return (
      <div className="analytics-section">
        <h3>趋势分析</h3>
        
        <div className="trends-overview">
          <div className="trend-metric">
            <h4>总体增长率</h4>
            <div className={`trend-value ${trends.totalGrowth >= 0 ? 'positive' : 'negative'}`}>
              {trends.totalGrowth}%
            </div>
          </div>
        </div>

        <div className="monthly-trends">
          <h4>月度参与趋势</h4>
          <div className="trends-chart">
            {trends.monthlyTrends?.map((month, index) => (
              <div key={month.month} className="trend-item">
                <div className="trend-month">{month.month}</div>
                <div className="trend-metrics">
                  <div className="trend-proposals">{month.proposals} 提案</div>
                  <div className="trend-voters">{month.uniqueVoters} 投票者</div>
                  <div className={`trend-growth ${month.growth >= 0 ? 'positive' : 'negative'}`}>
                    {month.growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染当前选中的分析内容
  const renderCurrentAnalysis = () => {
    switch (selectedMetric) {
      case 'participation':
        return renderParticipationAnalysis();
      case 'patterns':
        return renderPatternsAnalysis();
      case 'demographics':
        return renderDemographicsAnalysis();
      case 'trends':
        return renderTrendsAnalysis();
      default:
        return renderParticipationAnalysis();
    }
  };

  return (
    <div className="voting-analytics">
      <div className="analytics-header">
        <h2>投票分析</h2>
        
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
            <label>分析指标:</label>
            <select 
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="metric-select"
            >
              {metricOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        {renderCurrentAnalysis()}
      </div>
    </div>
  );
};

export default VotingAnalytics;

