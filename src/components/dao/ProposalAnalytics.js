import React, { useState, useEffect, useCallback } from 'react';
import { useDAO } from '../../context/dao/DAOContext';
import { Card, Tabs, Table, Tag, Tooltip, Button, Space, Spin, Alert } from 'antd';
import { 
  BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { 
  SortAscendingOutlined, 
  SortDescendingOutlined, 
  FilterOutlined,
  DownloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import './ProposalAnalytics.css';

/**
 * 提案分析组件
 * 提供对提案数据的多维度分析和可视化
 */
const ProposalAnalytics = () => {
  const { 
    proposals, 
    loadProposals, 
    isLoading, 
    error 
  } = useDAO();
  
  // 状态
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, all
  const [sortField, setSortField] = useState('createdTimestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [stateFilter, setStateFilter] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // 加载数据
  useEffect(() => {
    if (!isDataLoaded && proposals.length === 0) {
      loadProposals(1);
      setIsDataLoaded(true);
    } else {
      applyFiltersAndSort();
    }
  }, [loadProposals, proposals, isDataLoaded]);
  
  // 应用筛选和排序
  const applyFiltersAndSort = useCallback(() => {
    let result = [...proposals];
    
    // 应用类别筛选
    if (categoryFilter.length > 0) {
      result = result.filter(p => categoryFilter.includes(p.category || '其他'));
    }
    
    // 应用状态筛选
    if (stateFilter.length > 0) {
      result = result.filter(p => stateFilter.includes(p.state));
    }
    
    // 应用排序
    result.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      // 处理特殊字段
      if (sortField === 'votingPower') {
        valueA = parseInt(a.forVotes || 0) + parseInt(a.againstVotes || 0) + parseInt(a.abstainVotes || 0);
        valueB = parseInt(b.forVotes || 0) + parseInt(b.againstVotes || 0) + parseInt(b.abstainVotes || 0);
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredProposals(result);
  }, [proposals, categoryFilter, stateFilter, sortField, sortOrder]);
  
  // 处理排序变更
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };
  
  // 处理类别筛选变更
  const handleCategoryFilterChange = (categories) => {
    setCategoryFilter(categories);
  };
  
  // 处理状态筛选变更
  const handleStateFilterChange = (states) => {
    setStateFilter(states);
  };
  
  // 处理标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // 处理时间范围变更
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // 在实际应用中，这里应该根据时间范围重新加载数据
  };
  
  // 导出数据
  const handleExportData = () => {
    // 实现数据导出功能
    alert('数据导出功能即将推出');
  };
  
  // 应用筛选和排序
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);
  
  // 生成提案通过率趋势数据
  const generatePassRateTrendData = useCallback(() => {
    if (!proposals || proposals.length === 0) return [];
    
    const now = new Date();
    const monthsData = {};
    
    // 初始化过去12个月的数据
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      monthsData[monthKey] = {
        month: `${month.getFullYear()}/${month.getMonth() + 1}`,
        total: 0,
        passed: 0,
        passRate: 0
      };
    }
    
    // 填充提案数据
    proposals.forEach(proposal => {
      if (proposal.state >= 3) { // 已完成投票的提案
        const createdDate = new Date(proposal.createdTimestamp * 1000);
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthsData[monthKey]) {
          monthsData[monthKey].total++;
          
          if (proposal.state >= 4) { // 已通过的提案
            monthsData[monthKey].passed++;
          }
        }
      }
    });
    
    // 计算通过率
    Object.values(monthsData).forEach(data => {
      data.passRate = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;
    });
    
    return Object.values(monthsData);
  }, [proposals]);
  
  // 生成提案类别分布数据
  const generateCategoryDistributionData = useCallback(() => {
    if (!proposals || proposals.length === 0) return [];
    
    const categories = {};
    
    proposals.forEach(proposal => {
      const category = proposal.category || '其他';
      if (!categories[category]) {
        categories[category] = 1;
      } else {
        categories[category]++;
      }
    });
    
    return Object.keys(categories).map(category => ({
      name: category,
      value: categories[category]
    }));
  }, [proposals]);
  
  // 生成提案状态分布数据
  const generateStateDistributionData = useCallback(() => {
    if (!proposals || proposals.length === 0) return [];
    
    const stateMap = {
      0: '待定',
      1: '活跃',
      2: '已取消',
      3: '已失败',
      4: '已通过',
      5: '已排队',
      6: '已过期',
      7: '已执行'
    };
    
    const states = {};
    
    proposals.forEach(proposal => {
      const stateId = proposal.state;
      const stateName = stateMap[stateId] || '未知';
      
      if (!states[stateName]) {
        states[stateName] = {
          name: stateName,
          value: 1,
          stateId
        };
      } else {
        states[stateName].value++;
      }
    });
    
    return Object.values(states).sort((a, b) => a.stateId - b.stateId);
  }, [proposals]);
  
  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="proposal-id">{id.substring(0, 8)}...</span>,
    },
    {
      title: (
        <div className="sortable-column" onClick={() => handleSortChange('title')}>
          标题
          {sortField === 'title' && (
            sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
          )}
        </div>
      ),
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span className="proposal-title">{title}</span>,
    },
    {
      title: (
        <div className="sortable-column" onClick={() => handleSortChange('category')}>
          类别
          {sortField === 'category' && (
            sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
          )}
        </div>
      ),
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">{category || '其他'}</Tag>
      ),
      filters: generateCategoryDistributionData().map(cat => ({ text: cat.name, value: cat.name })),
      onFilter: (value, record) => record.category === value || (!record.category && value === '其他'),
    },
    {
      title: (
        <div className="sortable-column" onClick={() => handleSortChange('state')}>
          状态
          {sortField === 'state' && (
            sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
          )}
        </div>
      ),
      dataIndex: 'state',
      key: 'state',
      render: (state) => {
        const stateMap = {
          0: { text: '待定', color: 'default' },
          1: { text: '活跃', color: 'processing' },
          2: { text: '已取消', color: 'error' },
          3: { text: '已失败', color: 'error' },
          4: { text: '已通过', color: 'success' },
          5: { text: '已排队', color: 'warning' },
          6: { text: '已过期', color: 'default' },
          7: { text: '已执行', color: 'success' }
        };
        
        const stateInfo = stateMap[state] || { text: '未知', color: 'default' };
        
        return <Tag color={stateInfo.color}>{stateInfo.text}</Tag>;
      },
      filters: generateStateDistributionData().map(state => ({ text: state.name, value: state.stateId })),
      onFilter: (value, record) => record.state === value,
    },
    {
      title: (
        <div className="sortable-column" onClick={() => handleSortChange('votingPower')}>
          投票权重
          {sortField === 'votingPower' && (
            sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
          )}
        </div>
      ),
      key: 'votingPower',
      render: (_, record) => {
        const totalVotes = parseInt(record.forVotes || 0) + parseInt(record.againstVotes || 0) + parseInt(record.abstainVotes || 0);
        return <span>{totalVotes}</span>;
      },
    },
    {
      title: (
        <div className="sortable-column" onClick={() => handleSortChange('createdTimestamp')}>
          创建时间
          {sortField === 'createdTimestamp' && (
            sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />
          )}
        </div>
      ),
      dataIndex: 'createdTimestamp',
      key: 'createdTimestamp',
      render: (timestamp) => {
        const date = new Date(timestamp * 1000);
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => window.location.href = `/dao/proposal/${record.id}`}>
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
        <p>正在加载提案数据...</p>
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
    <div className="proposal-analytics">
      <div className="analytics-header">
        <h2>提案分析</h2>
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
                  <Tooltip title="已创建的提案总数">
                    <h3>
                      总提案数
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">{proposals.length}</div>
                </Card>
                
                <Card className="metric-card">
                  <Tooltip title="当前活跃状态的提案数量">
                    <h3>
                      活跃提案
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {proposals.filter(p => p.state === 1).length}
                  </div>
                </Card>
                
                <Card className="metric-card">
                  <Tooltip title="已通过的提案占已完成投票提案的百分比">
                    <h3>
                      通过率
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {(() => {
                      const completed = proposals.filter(p => p.state >= 3).length;
                      const passed = proposals.filter(p => p.state >= 4).length;
                      return completed > 0 ? `${Math.round((passed / completed) * 100)}%` : '0%';
                    })()}
                  </div>
                </Card>
                
                <Card className="metric-card">
                  <Tooltip title="已执行的提案占已通过提案的百分比">
                    <h3>
                      执行率
                      <InfoCircleOutlined className="info-icon" />
                    </h3>
                  </Tooltip>
                  <div className="metric-value">
                    {(() => {
                      const passed = proposals.filter(p => p.state >= 4).length;
                      const executed = proposals.filter(p => p.state === 7).length;
                      return passed > 0 ? `${Math.round((executed / passed) * 100)}%` : '0%';
                    })()}
                  </div>
                </Card>
              </div>
              
              <Card title="提案通过率趋势" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generatePassRateTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="passRate" 
                      name="通过率" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              
              <div className="chart-row">
                <Card title="提案类别分布" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={generateCategoryDistributionData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="提案数量" fill="#8884d8">
                        {generateCategoryDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
                
                <Card title="提案状态分布" className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={generateStateDistributionData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="提案数量" fill="#82ca9d">
                        {generateStateDistributionData().map((entry) => {
                          const colorMap = {
                            '待定': '#bfbfbf',
                            '活跃': '#1890ff',
                            '已取消': '#ff4d4f',
                            '已失败': '#ff7a45',
                            '已通过': '#52c41a',
                            '已排队': '#faad14',
                            '已过期': '#d9d9d9',
                            '已执行': '#13c2c2'
                          };
                          return <Cell key={entry.name} fill={colorMap[entry.name] || '#8884d8'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="提案列表" key="list">
            <div className="proposal-list">
              <Table 
                columns={columns} 
                dataSource={filteredProposals} 
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="详细分析" key="detailed">
            <Card className="coming-soon">
              <h3>详细分析功能</h3>
              <p>更多高级分析功能正在开发中，敬请期待...</p>
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ProposalAnalytics;
