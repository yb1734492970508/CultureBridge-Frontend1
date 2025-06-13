import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDAO } from '../../context/dao/DAOContext';
import { Card, Tabs, Spin, Alert, Table, Tag, Tooltip, Button, Space, Select } from 'antd';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer, Cell, Scatter, ScatterChart, ZAxis
} from 'recharts';
import { 
  DownloadOutlined,
  InfoCircleOutlined,
  UserOutlined,
  TeamOutlined,
  SwapOutlined,
  LinkOutlined
} from '@ant-design/icons';
import './DelegationAnalytics.css';

/**
 * 委托分析组件
 * 提供对委托数据的多维度分析和可视化
 */
const DelegationAnalytics = () => {
  const { 
    delegations,
    votes,
    loadDelegations,
    loadVotes,
    isLoading, 
    error 
  } = useDAO();
  
  // 状态
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, all
  const [selectedDelegate, setSelectedDelegate] = useState(null);
  const [delegationNetwork, setDelegationNetwork] = useState([]);
  const [delegateRanking, setDelegateRanking] = useState([]);
  const [delegationTrend, setDelegationTrend] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // 加载数据
  useEffect(() => {
    if (!isDataLoaded) {
      loadDelegations();
      loadVotes();
      setIsDataLoaded(true);
    }
  }, [loadDelegations, loadVotes, isDataLoaded]);
  
  // 处理时间范围变更
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // 在实际应用中，这里应该根据时间范围重新加载数据
  };
  
  // 处理标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // 处理委托人选择
  const handleDelegateSelect = (delegateAddress) => {
    setSelectedDelegate(delegateAddress);
  };
  
  // 导出数据
  const handleExportData = () => {
    // 实现数据导出功能
    alert('数据导出功能即将推出');
  };
  
  // 生成委托网络数据
  useEffect(() => {
    if (!delegations || delegations.length === 0) {
      // 使用模拟数据进行开发
      const mockDelegationNetwork = {
        nodes: [
          { id: '0x1234...5678', name: '委托人A', value: 120000, type: 'delegate' },
          { id: '0xabcd...ef01', name: '委托人B', value: 85000, type: 'delegate' },
          { id: '0x2345...6789', name: '委托人C', value: 65000, type: 'delegate' },
          { id: '0x3456...7890', name: '委托人D', value: 45000, type: 'delegate' },
          { id: '0x4567...8901', name: '委托人E', value: 30000, type: 'delegate' },
          { id: '0x5678...9012', name: '用户1', value: 12000, type: 'delegator' },
          { id: '0x6789...0123', name: '用户2', value: 8500, type: 'delegator' },
          { id: '0x7890...1234', name: '用户3', value: 7200, type: 'delegator' },
          { id: '0x8901...2345', name: '用户4', value: 6500, type: 'delegator' },
          { id: '0x9012...3456', name: '用户5', value: 5800, type: 'delegator' },
          { id: '0x0123...4567', name: '用户6', value: 4900, type: 'delegator' },
          { id: '0xbcde...f012', name: '用户7', value: 4200, type: 'delegator' },
          { id: '0xcdef...0123', name: '用户8', value: 3800, type: 'delegator' },
          { id: '0xdef0...1234', name: '用户9', value: 3200, type: 'delegator' },
          { id: '0xef01...2345', name: '用户10', value: 2800, type: 'delegator' },
        ],
        links: [
          { source: '0x5678...9012', target: '0x1234...5678', value: 12000 },
          { source: '0x6789...0123', target: '0x1234...5678', value: 8500 },
          { source: '0x7890...1234', target: '0xabcd...ef01', value: 7200 },
          { source: '0x8901...2345', target: '0xabcd...ef01', value: 6500 },
          { source: '0x9012...3456', target: '0x2345...6789', value: 5800 },
          { source: '0x0123...4567', target: '0x2345...6789', value: 4900 },
          { source: '0xbcde...f012', target: '0x3456...7890', value: 4200 },
          { source: '0xcdef...0123', target: '0x3456...7890', value: 3800 },
          { source: '0xdef0...1234', target: '0x4567...8901', value: 3200 },
          { source: '0xef01...2345', target: '0x4567...8901', value: 2800 },
        ]
      };
      
      setDelegationNetwork(mockDelegationNetwork);
      
      // 生成委托人排名
      const delegateNodes = mockDelegationNetwork.nodes.filter(node => node.type === 'delegate');
      setDelegateRanking(delegateNodes.map((node, index) => ({
        key: index.toString(),
        rank: index + 1,
        address: node.id,
        name: node.name,
        delegatedPower: node.value,
        delegatorCount: mockDelegationNetwork.links.filter(link => link.target === node.id).length,
        participationRate: Math.round(70 + Math.random() * 25) // 模拟70%-95%的参与率
      })));
      
      // 生成委托趋势数据
      const now = new Date();
      const trendData = [];
      
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${month.getFullYear()}/${month.getMonth() + 1}`;
        
        // 模拟数据，随着时间增长
        const baseValue = 100000 + (11 - i) * 15000 + Math.random() * 10000;
        const delegatorCount = 50 + (11 - i) * 8 + Math.floor(Math.random() * 5);
        const delegateCount = 3 + Math.floor((11 - i) / 3) + Math.floor(Math.random() * 2);
        
        trendData.push({
          month: monthStr,
          totalDelegatedPower: Math.round(baseValue),
          delegatorCount,
          delegateCount
        });
      }
      
      setDelegationTrend(trendData);
      
      return;
    }
    
    // 实际数据处理逻辑
    // TODO: 实现实际委托网络数据的处理
  }, [delegations]);
  
  // 生成委托集中度数据
  const delegationConcentrationData = useMemo(() => {
    if (!delegateRanking || delegateRanking.length === 0) return [];
    
    // 按委托权重排序
    const sortedDelegates = [...delegateRanking].sort((a, b) => b.delegatedPower - a.delegatedPower);
    
    // 计算总委托权重
    const totalDelegatedPower = sortedDelegates.reduce((sum, delegate) => sum + delegate.delegatedPower, 0);
    
    // 计算前N名委托人的权重占比
    const top1Percentage = totalDelegatedPower > 0 ? Math.round((sortedDelegates[0].delegatedPower / totalDelegatedPower) * 100) : 0;
    
    const top3Power = sortedDelegates.slice(0, 3).reduce((sum, delegate) => sum + delegate.delegatedPower, 0);
    const top3Percentage = totalDelegatedPower > 0 ? Math.round((top3Power / totalDelegatedPower) * 100) : 0;
    
    const top5Power = sortedDelegates.slice(0, 5).reduce((sum, delegate) => sum + delegate.delegatedPower, 0);
    const top5Percentage = totalDelegatedPower > 0 ? Math.round((top5Power / totalDelegatedPower) * 100) : 0;
    
    return [
      { name: '前1名', value: top1Percentage },
      { name: '前3名', value: top3Percentage },
      { name: '前5名', value: top5Percentage },
      { name: '其他', value: 100 - top5Percentage }
    ];
  }, [delegateRanking]);
  
  // 生成委托参与率数据
  const delegationParticipationData = useMemo(() => {
    if (!delegateRanking || delegateRanking.length === 0) return [];
    
    // 按参与率分组
    const participationGroups = {
      'high': { name: '高参与率 (>90%)', count: 0 },
      'medium': { name: '中参与率 (70-90%)', count: 0 },
      'low': { name: '低参与率 (<70%)', count: 0 }
    };
    
    delegateRanking.forEach(delegate => {
      const rate = delegate.participationRate;
      
      if (rate > 90) {
        participationGroups.high.count++;
      } else if (rate > 70) {
        participationGroups.medium.count++;
      } else {
        participationGroups.low.count++;
      }
    });
    
    return Object.values(participationGroups).map(group => ({
      name: group.name,
      value: group.count
    }));
  }, [delegateRanking]);
  
  // 表格列定义 - 委托人排名
  const delegateColumns = [
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
          <span className="delegate-address">{address}</span>
        </Tooltip>
      ),
    },
    {
      title: '委托权重',
      dataIndex: 'delegatedPower',
      key: 'delegatedPower',
      sorter: (a, b) => a.delegatedPower - b.delegatedPower,
      defaultSortOrder: 'descend',
    },
    {
      title: '委托人数',
      dataIndex: 'delegatorCount',
      key: 'delegatorCount',
      sorter: (a, b) => a.delegatorCount - b.delegatorCount,
    },
    {
      title: '参与率',
      dataIndex: 'participationRate',
      key: 'participationRate',
      render: (rate) => {
        let color = 'green';
        if (rate < 70) {
          color = 'red';
        } else if (rate < 90) {
          color = 'orange';
        }
        return <Tag color={color}>{rate}%</Tag>;
      },
      sorter: (a, b) => a.participationRate - b.participationRate,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleDelegateSelect(record.address)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];
  
  // 如果正在加载，显示加载状态
  if (isLoading && !isDataLoaded) {
    return (
      <div className="analytics-loading">
        <Spin size="large" />
        <p>正在加载委托数据...</p>
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
    <div className="delegation-analytics">
      <div className="analytics-header">
        <h2>委托分析</h2>
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
                  <Tooltip title="当前活跃的委托关系总数">
                    <h3>
                      委托关系数
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {delegationNetwork.links ? delegationNetwork.links.length : 0}
                  </div>
                  <div className="metric-icon">
                    <LinkOutlined />
                  </div>
                </Card>
                
                <Card className="metric-card">
                  <Tooltip title="已委托出投票权的用户数量">
                    <h3>
                      委托人数
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {delegationNetwork.nodes ? delegationNetwork.nodes.filter(node => node.type === 'delegator').length : 0}
                  </div>
                  <div className="metric-icon">
                    <UserOutlined />
                  </div>
                </Card>
                
                <Card className="metric-card">
                  <Tooltip title="接收委托投票权的用户数量">
                    <h3>
                      代表人数
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {delegationNetwork.nodes ? delegationNetwork.nodes.filter(node => node.type === 'delegate').length : 0}
                  </div>
                  <div className="metric-icon">
                    <TeamOutlined />
                  </div>
                </Card>
                
                <Card className="metric-card">
                  <Tooltip title="委托投票权占总投票权的百分比">
                    <h3>
                      委托率
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {(() => {
                      // 在实际应用中，这应该是从后端获取的数据
                      return '38%';
                    })()}
                  </div>
                  <div className="metric-icon">
                    <SwapOutlined />
                  </div>
                </Card>
              </div>
              
              <Card title="委托趋势" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={delegationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="totalDelegatedPower" 
                      name="委托权重" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="delegatorCount" 
                      name="委托人数" 
                      stroke="#82ca9d" 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="delegateCount" 
                      name="代表人数" 
                      stroke="#ffc658" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              
              <div className="chart-row">
                <Card title="委托集中度" className="chart-card">
                  <div className="pie-chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={delegationConcentrationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {delegationConcentrationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="pie-chart-legend">
                      {delegationConcentrationData.map((entry, index) => (
                        <div key={`legend-${index}`} className="legend-item">
                          <div 
                            className="legend-color" 
                            style={{ 
                              backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}` 
                            }}
                          ></div>
                          <div className="legend-text">
                            <div className="legend-name">{entry.name}</div>
                            <div className="legend-value">{entry.value}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                
                <Card title="代表参与率分布" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={delegationParticipationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="代表数量" fill="#82ca9d">
                        {delegationParticipationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#4CAF50' : index === 1 ? '#FFC107' : '#F44336'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
              
              <Card title="委托网络可视化" className="network-card">
                <div className="coming-soon">
                  <h3>委托网络图</h3>
                  <p>此功能正在开发中，敬请期待...</p>
                  <p>委托网络可视化将展示委托人与代表之间的关系网络，帮助您理解委托结构和权力分布。</p>
                </div>
              </Card>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="代表排名" key="delegates">
            <div className="delegates-ranking">
              <Card title="代表排名" className="delegates-card">
                <Table 
                  columns={delegateColumns} 
                  dataSource={delegateRanking} 
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="委托效率分析" key="efficiency">
            <div className="delegation-efficiency">
              <Card className="efficiency-card">
                <div className="coming-soon">
                  <h3>委托效率分析</h3>
                  <p>此功能正在开发中，敬请期待...</p>
                  <p>委托效率分析将评估代表的投票行为与委托人意愿的一致性，以及委托对治理参与率和决策质量的影响。</p>
                </div>
              </Card>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="代表详情" key="delegate-detail">
            <div className="delegate-detail">
              <Card className="delegate-selector-card">
                <div className="delegate-selector">
                  <span className="selector-label">选择代表：</span>
                  <Select
                    placeholder="请选择代表"
                    style={{ width: 400 }}
                    onChange={handleDelegateSelect}
                    options={delegateRanking.map(d => ({ value: d.address, label: `${d.name} (${d.address})` }))}
                  />
                </div>
                
                {selectedDelegate ? (
                  <div className="selected-delegate-info">
                    <h3>代表详情</h3>
                    <p>此功能正在开发中，敬请期待...</p>
                  </div>
                ) : (
                  <div className="no-delegate-selected">
                    请选择一个代表进行详细分析
                  </div>
                )}
              </Card>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default DelegationAnalytics;
