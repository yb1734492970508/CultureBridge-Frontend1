import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDAO } from '../../context/dao/DAOContext';
import { Card, Tabs, Spin, Alert, Table, Tag, Tooltip, Button, Space, Radio, Select } from 'antd';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { 
  DownloadOutlined,
  InfoCircleOutlined,
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import './VotingAnalytics.css';

/**
 * 投票分析组件
 * 提供对投票数据的多维度分析和可视化
 */
const VotingAnalytics = () => {
  const { 
    proposals, 
    votes,
    loadProposals,
    loadVotes,
    isLoading, 
    error 
  } = useDAO();
  
  // 状态
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, all
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [votingPowerDistribution, setVotingPowerDistribution] = useState([]);
  const [votingTimeDistribution, setVotingTimeDistribution] = useState([]);
  const [voterActivityData, setVoterActivityData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // 加载数据
  useEffect(() => {
    if (!isDataLoaded) {
      loadProposals(1);
      loadVotes();
      setIsDataLoaded(true);
    }
  }, [loadProposals, loadVotes, isDataLoaded]);
  
  // 处理时间范围变更
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // 在实际应用中，这里应该根据时间范围重新加载数据
  };
  
  // 处理标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // 处理提案选择
  const handleProposalSelect = (proposalId) => {
    const proposal = proposals.find(p => p.id === proposalId);
    setSelectedProposal(proposal);
  };
  
  // 导出数据
  const handleExportData = () => {
    // 实现数据导出功能
    alert('数据导出功能即将推出');
  };
  
  // 生成总体投票分布数据
  const overallVotingDistribution = useMemo(() => {
    if (!proposals || proposals.length === 0) return [];
    
    let totalFor = 0;
    let totalAgainst = 0;
    let totalAbstain = 0;
    
    proposals.forEach(proposal => {
      totalFor += parseInt(proposal.forVotes || 0);
      totalAgainst += parseInt(proposal.againstVotes || 0);
      totalAbstain += parseInt(proposal.abstainVotes || 0);
    });
    
    const total = totalFor + totalAgainst + totalAbstain;
    
    if (total === 0) return [];
    
    return [
      { name: '支持', value: totalFor, percentage: Math.round((totalFor / total) * 100) },
      { name: '反对', value: totalAgainst, percentage: Math.round((totalAgainst / total) * 100) },
      { name: '弃权', value: totalAbstain, percentage: Math.round((totalAbstain / total) * 100) }
    ];
  }, [proposals]);
  
  // 生成月度投票参与率趋势数据
  const monthlyParticipationTrendData = useMemo(() => {
    if (!proposals || proposals.length === 0) return [];
    
    const now = new Date();
    const monthsData = {};
    
    // 初始化过去12个月的数据
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      monthsData[monthKey] = {
        month: `${month.getFullYear()}/${month.getMonth() + 1}`,
        participation: 0,
        proposalCount: 0
      };
    }
    
    // 填充提案数据
    proposals.forEach(proposal => {
      if (proposal.state >= 3) { // 已完成投票的提案
        const createdDate = new Date(proposal.createdTimestamp * 1000);
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthsData[monthKey]) {
          const totalVotes = parseInt(proposal.forVotes || 0) + parseInt(proposal.againstVotes || 0) + parseInt(proposal.abstainVotes || 0);
          const totalPossibleVotes = parseInt(proposal.totalVotingPower || 1);
          const participationRate = totalPossibleVotes > 0 ? (totalVotes / totalPossibleVotes) * 100 : 0;
          
          monthsData[monthKey].participation += participationRate;
          monthsData[monthKey].proposalCount++;
        }
      }
    });
    
    // 计算平均参与率
    Object.values(monthsData).forEach(data => {
      data.participation = data.proposalCount > 0 ? Math.round(data.participation / data.proposalCount) : 0;
    });
    
    return Object.values(monthsData);
  }, [proposals]);
  
  // 生成投票权重分布数据
  useEffect(() => {
    if (!votes || votes.length === 0) return;
    
    // 按投票权重分组
    const powerGroups = {
      'small': { name: '小额投票 (<100)', count: 0, totalPower: 0 },
      'medium': { name: '中额投票 (100-1000)', count: 0, totalPower: 0 },
      'large': { name: '大额投票 (1000-10000)', count: 0, totalPower: 0 },
      'whale': { name: '巨额投票 (>10000)', count: 0, totalPower: 0 }
    };
    
    votes.forEach(vote => {
      const power = parseInt(vote.votingPower || 0);
      
      if (power < 100) {
        powerGroups.small.count++;
        powerGroups.small.totalPower += power;
      } else if (power < 1000) {
        powerGroups.medium.count++;
        powerGroups.medium.totalPower += power;
      } else if (power < 10000) {
        powerGroups.large.count++;
        powerGroups.large.totalPower += power;
      } else {
        powerGroups.whale.count++;
        powerGroups.whale.totalPower += power;
      }
    });
    
    const totalPower = Object.values(powerGroups).reduce((sum, group) => sum + group.totalPower, 0);
    
    const distribution = Object.values(powerGroups).map(group => ({
      name: group.name,
      count: group.count,
      totalPower: group.totalPower,
      percentage: totalPower > 0 ? Math.round((group.totalPower / totalPower) * 100) : 0
    }));
    
    setVotingPowerDistribution(distribution);
  }, [votes]);
  
  // 生成投票时间分布数据
  useEffect(() => {
    if (!votes || votes.length === 0 || !proposals || proposals.length === 0) return;
    
    // 创建提案ID到开始时间的映射
    const proposalStartTimes = {};
    proposals.forEach(proposal => {
      proposalStartTimes[proposal.id] = proposal.startTimestamp;
    });
    
    // 按投票时间分组
    const timeGroups = {
      'early': { name: '早期投票 (0-25%)', count: 0 },
      'mid': { name: '中期投票 (25-75%)', count: 0 },
      'late': { name: '晚期投票 (75-100%)', count: 0 }
    };
    
    votes.forEach(vote => {
      const proposalStart = proposalStartTimes[vote.proposalId];
      const proposalEnd = proposalStart + (3 * 24 * 60 * 60); // 假设投票期为3天
      const voteTime = vote.timestamp;
      
      if (!proposalStart || !voteTime) return;
      
      const totalDuration = proposalEnd - proposalStart;
      const elapsedTime = voteTime - proposalStart;
      const percentComplete = (elapsedTime / totalDuration) * 100;
      
      if (percentComplete < 25) {
        timeGroups.early.count++;
      } else if (percentComplete < 75) {
        timeGroups.mid.count++;
      } else {
        timeGroups.late.count++;
      }
    });
    
    const totalVotes = Object.values(timeGroups).reduce((sum, group) => sum + group.count, 0);
    
    const distribution = Object.values(timeGroups).map(group => ({
      name: group.name,
      count: group.count,
      percentage: totalVotes > 0 ? Math.round((group.count / totalVotes) * 100) : 0
    }));
    
    setVotingTimeDistribution(distribution);
  }, [votes, proposals]);
  
  // 生成投票者活跃度数据
  useEffect(() => {
    if (!votes || votes.length === 0) return;
    
    // 按投票者地址分组
    const voterCounts = {};
    
    votes.forEach(vote => {
      const voter = vote.voter;
      if (!voter) return;
      
      if (!voterCounts[voter]) {
        voterCounts[voter] = 1;
      } else {
        voterCounts[voter]++;
      }
    });
    
    // 按活跃度分组
    const activityGroups = {
      'oneTime': { name: '一次性投票者', count: 0 },
      'occasional': { name: '偶尔投票者 (2-5次)', count: 0 },
      'regular': { name: '常规投票者 (6-20次)', count: 0 },
      'active': { name: '活跃投票者 (>20次)', count: 0 }
    };
    
    Object.values(voterCounts).forEach(count => {
      if (count === 1) {
        activityGroups.oneTime.count++;
      } else if (count <= 5) {
        activityGroups.occasional.count++;
      } else if (count <= 20) {
        activityGroups.regular.count++;
      } else {
        activityGroups.active.count++;
      }
    });
    
    const totalVoters = Object.values(activityGroups).reduce((sum, group) => sum + group.count, 0);
    
    const activityData = Object.values(activityGroups).map(group => ({
      name: group.name,
      count: group.count,
      percentage: totalVoters > 0 ? Math.round((group.count / totalVoters) * 100) : 0
    }));
    
    setVoterActivityData(activityData);
  }, [votes]);
  
  // 生成选定提案的投票分布数据
  const selectedProposalVotingData = useMemo(() => {
    if (!selectedProposal) return [];
    
    const forVotes = parseInt(selectedProposal.forVotes || 0);
    const againstVotes = parseInt(selectedProposal.againstVotes || 0);
    const abstainVotes = parseInt(selectedProposal.abstainVotes || 0);
    
    const total = forVotes + againstVotes + abstainVotes;
    
    if (total === 0) return [];
    
    return [
      { name: '支持', value: forVotes, percentage: Math.round((forVotes / total) * 100) },
      { name: '反对', value: againstVotes, percentage: Math.round((againstVotes / total) * 100) },
      { name: '弃权', value: abstainVotes, percentage: Math.round((abstainVotes / total) * 100) }
    ];
  }, [selectedProposal]);
  
  // 表格列定义 - 活跃投票者
  const activeVotersColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      render: (address) => (
        <Tooltip title={address}>
          <span className="voter-address">{address.substring(0, 8)}...{address.substring(address.length - 6)}</span>
        </Tooltip>
      ),
    },
    {
      title: '投票次数',
      dataIndex: 'voteCount',
      key: 'voteCount',
      sorter: (a, b) => a.voteCount - b.voteCount,
    },
    {
      title: '总投票权重',
      dataIndex: 'totalPower',
      key: 'totalPower',
      sorter: (a, b) => a.totalPower - b.totalPower,
    },
    {
      title: '投票倾向',
      dataIndex: 'tendency',
      key: 'tendency',
      render: (tendency) => {
        if (tendency > 0.6) {
          return <Tag color="green">支持倾向 <RiseOutlined /></Tag>;
        } else if (tendency < 0.4) {
          return <Tag color="red">反对倾向 <FallOutlined /></Tag>;
        } else {
          return <Tag color="blue">中立</Tag>;
        }
      },
    },
    {
      title: '最近投票',
      dataIndex: 'lastVote',
      key: 'lastVote',
    },
  ];
  
  // 模拟活跃投票者数据
  const activeVotersData = [
    {
      key: '1',
      rank: 1,
      address: '0x1234567890abcdef1234567890abcdef12345678',
      voteCount: 42,
      totalPower: 125000,
      tendency: 0.85,
      lastVote: '2025-06-10',
    },
    {
      key: '2',
      rank: 2,
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      voteCount: 38,
      totalPower: 98500,
      tendency: 0.32,
      lastVote: '2025-06-09',
    },
    {
      key: '3',
      rank: 3,
      address: '0x7890abcdef1234567890abcdef1234567890abcd',
      voteCount: 35,
      totalPower: 76200,
      tendency: 0.51,
      lastVote: '2025-06-11',
    },
    {
      key: '4',
      rank: 4,
      address: '0xdef1234567890abcdef1234567890abcdef12345',
      voteCount: 29,
      totalPower: 65800,
      tendency: 0.78,
      lastVote: '2025-06-08',
    },
    {
      key: '5',
      rank: 5,
      address: '0x567890abcdef1234567890abcdef1234567890ab',
      voteCount: 27,
      totalPower: 54300,
      tendency: 0.22,
      lastVote: '2025-06-10',
    },
  ];
  
  // 如果正在加载，显示加载状态
  if (isLoading && !isDataLoaded) {
    return (
      <div className="analytics-loading">
        <Spin size="large" />
        <p>正在加载投票数据...</p>
      </div>
    );
  }
  
  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="analytics-error">
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }
  
  return (
    <div className="voting-analytics">
      <div className="analytics-header">
        <h2>投票分析</h2>
        <div className="analytics-actions">
          <div className="time-range-selector">
            <span className={timeRange === 'week' ? 'active' : ''} onClick={() => handleTimeRangeChange('week')}>周</span>
            <span className={timeRange === 'month' ? 'active' : ''} onClick={() => handleTimeRangeChange('month')}>月</span>
            <span className={timeRange === 'year' ? 'active' : ''} onClick={() => handleTimeRangeChange('year')}>年</span>
            <span className={timeRange === 'all' ? 'active' : ''} onClick={() => handleTimeRangeChange('all')}>全部</span>
          </div>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleExportData}
          >
            导出数据
          </Button>
        </div>
      </div>
      
      <div className="analytics-content">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <Tabs.TabPane tab="概览" key="overview">
            <div className="overview-content">
              <div className="overview-metrics">
                <Card className="metric-card">
                  <Tooltip title="参与投票的总人数">
                    <h3>
                      总投票人数
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {votes ? new Set(votes.map(v => v.voter)).size : 0}
                  </div>
                  <div className="metric-icon">
                    <TeamOutlined />
                  </div>
                </Card>
                
                <Card className="metric-card">
                  <Tooltip title="平均每个提案的投票人数">
                    <h3>
                      平均投票人数
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {proposals && proposals.length > 0 && votes
                      ? Math.round(votes.length / proposals.filter(p => p.state >= 3).length)
                      : 0}
                  </div>
                  <div className="metric-icon">
                    <UserOutlined />
                  </div>
                </Card>
                
                <Card className="metric-card">
                  <Tooltip title="平均投票参与率（投票权重/总可投票权重）">
                    <h3>
                      平均参与率
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {(() => {
                      if (!proposals || proposals.length === 0) return '0%';
                      
                      const completedProposals = proposals.filter(p => p.state >= 3);
                      if (completedProposals.length === 0) return '0%';
                      
                      let totalParticipation = 0;
                      completedProposals.forEach(proposal => {
                        const totalVotes = parseInt(proposal.forVotes || 0) + parseInt(proposal.againstVotes || 0) + parseInt(proposal.abstainVotes || 0);
                        const totalPossibleVotes = parseInt(proposal.totalVotingPower || 1);
                        const participationRate = totalPossibleVotes > 0 ? (totalVotes / totalPossibleVotes) * 100 : 0;
                        totalParticipation += participationRate;
                      });
                      
                      return `${Math.round(totalParticipation / completedProposals.length)}%`;
                    })()}
                  </div>
                  <div className="metric-icon">
                    <RiseOutlined />
                  </div>
                </Card>
                
                <Card className="metric-card">
                  <Tooltip title="投票结果与最终执行结果的一致性">
                    <h3>
                      决策有效率
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {(() => {
                      if (!proposals || proposals.length === 0) return '0%';
                      
                      const passedProposals = proposals.filter(p => p.state >= 4);
                      if (passedProposals.length === 0) return '0%';
                      
                      const executedProposals = proposals.filter(p => p.state === 7);
                      return `${Math.round((executedProposals.length / passedProposals.length) * 100)}%`;
                    })()}
                  </div>
                  <div className="metric-icon">
                    <FallOutlined />
                  </div>
                </Card>
              </div>
              
              <Card title="月度投票参与率趋势" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyParticipationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="participation" 
                      name="参与率" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              
              <div className="chart-row">
                <Card title="总体投票分布" className="chart-card">
                  <div className="pie-chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={overallVotingDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          <Cell fill="#4CAF50" /> {/* 支持 */}
                          <Cell fill="#F44336" /> {/* 反对 */}
                          <Cell fill="#FFEB3B" /> {/* 弃权 */}
                        </Pie>
                        <RechartsTooltip formatter={(value, name) => [`${value} (${overallVotingDistribution.find(item => item.name === name)?.percentage}%)`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="pie-chart-legend">
                      {overallVotingDistribution.map((entry, index) => (
                        <div key={`legend-${index}`} className="legend-item">
                          <div 
                            className="legend-color" 
                            style={{ 
                              backgroundColor: index === 0 ? '#4CAF50' : index === 1 ? '#F44336' : '#FFEB3B' 
                            }}
                          ></div>
                          <div className="legend-text">
                            <div className="legend-name">{entry.name}</div>
                            <div className="legend-value">{entry.value} ({entry.percentage}%)</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                
                <Card title="投票权重分布" className="chart-card">
                  <div className="pie-chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={votingPowerDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="totalPower"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {votingPowerDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value, name) => [`${value} (${votingPowerDistribution.find(item => item.name === name)?.percentage}%)`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="pie-chart-legend">
                      {votingPowerDistribution.map((entry, index) => (
                        <div key={`legend-${index}`} className="legend-item">
                          <div 
                            className="legend-color" 
                            style={{ 
                              backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}` 
                            }}
                          ></div>
                          <div className="legend-text">
                            <div className="legend-name">{entry.name}</div>
                            <div className="legend-value">{entry.totalPower} ({entry.percentage}%)</div>
                            <div className="legend-count">{entry.count}个投票者</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="chart-row">
                <Card title="投票时间分布" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={votingTimeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, '投票数']} />
                      <Bar dataKey="count" name="投票数量" fill="#82ca9d">
                        {votingTimeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#8884d8' : index === 1 ? '#82ca9d' : '#ffc658'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
                
                <Card title="投票者活跃度" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={voterActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, '投票者数量']} />
                      <Bar dataKey="count" name="投票者数量" fill="#8884d8">
                        {voterActivityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="提案投票分析" key="proposal">
            <div className="proposal-voting-analysis">
              <Card className="proposal-selector-card">
                <div className="proposal-selector">
                  <span className="selector-label">选择提案：</span>
                  <Select
                    placeholder="请选择提案"
                    style={{ width: 400 }}
                    onChange={handleProposalSelect}
                    options={proposals.map(p => ({ value: p.id, label: p.title }))}
                  />
                </div>
                
                {selectedProposal ? (
                  <div className="selected-proposal-info">
                    <h3>{selectedProposal.title}</h3>
                    <div className="proposal-meta">
                      <Tag color="blue">{selectedProposal.category || '其他'}</Tag>
                      <Tag color={
                        selectedProposal.state === 1 ? 'processing' :
                        selectedProposal.state >= 4 ? 'success' :
                        selectedProposal.state === 3 ? 'error' :
                        'default'
                      }>
                        {
                          selectedProposal.state === 0 ? '待定' :
                          selectedProposal.state === 1 ? '活跃' :
                          selectedProposal.state === 2 ? '已取消' :
                          selectedProposal.state === 3 ? '已失败' :
                          selectedProposal.state === 4 ? '已通过' :
                          selectedProposal.state === 5 ? '已排队' :
                          selectedProposal.state === 6 ? '已过期' :
                          selectedProposal.state === 7 ? '已执行' :
                          '未知'
                        }
                      </Tag>
                      <span className="proposal-date">
                        创建于: {new Date(selectedProposal.createdTimestamp * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="no-proposal-selected">
                    请选择一个提案进行详细分析
                  </div>
                )}
              </Card>
              
              {selectedProposal ? (
                <>
                  <div className="chart-row">
                    <Card title="投票分布" className="chart-card">
                      <div className="pie-chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={selectedProposalVotingData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percentage }) => `${name}: ${percentage}%`}
                            >
                              <Cell fill="#4CAF50" /> {/* 支持 */}
                              <Cell fill="#F44336" /> {/* 反对 */}
                              <Cell fill="#FFEB3B" /> {/* 弃权 */}
                            </Pie>
                            <RechartsTooltip formatter={(value, name) => [`${value} (${selectedProposalVotingData.find(item => item.name === name)?.percentage}%)`, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        <div className="pie-chart-legend">
                          {selectedProposalVotingData.map((entry, index) => (
                            <div key={`legend-${index}`} className="legend-item">
                              <div 
                                className="legend-color" 
                                style={{ 
                                  backgroundColor: index === 0 ? '#4CAF50' : index === 1 ? '#F44336' : '#FFEB3B' 
                                }}
                              ></div>
                              <div className="legend-text">
                                <div className="legend-name">{entry.name}</div>
                                <div className="legend-value">{entry.value} ({entry.percentage}%)</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                    
                    <Card title="投票时间线" className="chart-card">
                      <div className="coming-soon">
                        <h3>投票时间线分析</h3>
                        <p>此功能正在开发中，敬请期待...</p>
                      </div>
                    </Card>
                  </div>
                  
                  <Card title="投票详情" className="votes-detail-card">
                    <div className="coming-soon">
                      <h3>投票详细记录</h3>
                      <p>此功能正在开发中，敬请期待...</p>
                    </div>
                  </Card>
                </>
              ) : null}
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="投票者分析" key="voters">
            <div className="voter-analysis">
              <Card title="活跃投票者排名" className="active-voters-card">
                <Table 
                  columns={activeVotersColumns} 
                  dataSource={activeVotersData} 
                  pagination={{ pageSize: 10 }}
                />
              </Card>
              
              <Card title="投票者行为分析" className="voter-behavior-card">
                <div className="coming-soon">
                  <h3>投票者行为模式分析</h3>
                  <p>此功能正在开发中，敬请期待...</p>
                </div>
              </Card>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default VotingAnalytics;
