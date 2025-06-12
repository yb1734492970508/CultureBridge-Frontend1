import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDAO } from '../../context/dao/DAOContext';
import { useBlockchain } from '../../context/blockchain';
import { Card, Spin, Alert, Tabs } from 'antd';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import './DashboardHome.css';

/**
 * DAO治理仪表盘主页组件
 * 展示DAO治理的关键指标和概览数据
 */
const DashboardHome = () => {
  const { 
    proposals, 
    statistics, 
    loadProposals, 
    isLoading, 
    error 
  } = useDAO();
  const { active } = useBlockchain();
  
  // 状态
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, all
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // 加载数据
  useEffect(() => {
    if (active && !isDataLoaded) {
      loadProposals(1);
      setIsDataLoaded(true);
    }
  }, [active, loadProposals, isDataLoaded]);
  
  // 计算治理健康度指标
  const governanceHealth = useMemo(() => {
    if (!proposals || proposals.length === 0) return { score: 0, level: '未知' };
    
    // 计算通过率
    const totalFinished = proposals.filter(p => p.state >= 3).length;
    const passed = proposals.filter(p => p.state >= 4).length;
    const passRate = totalFinished > 0 ? (passed / totalFinished) * 100 : 0;
    
    // 计算执行率
    const executed = proposals.filter(p => p.state === 7).length;
    const executionRate = passed > 0 ? (executed / passed) * 100 : 0;
    
    // 计算参与率 (使用统计信息中的参与率)
    const participationRate = parseFloat(statistics.participationRate || '0%');
    
    // 计算综合健康度分数 (0-100)
    const score = Math.round((passRate * 0.3) + (executionRate * 0.3) + (participationRate * 0.4));
    
    // 确定健康度级别
    let level = '优秀';
    if (score < 30) level = '危险';
    else if (score < 50) level = '警告';
    else if (score < 70) level = '良好';
    else if (score < 90) level = '优秀';
    else level = '卓越';
    
    return {
      score,
      level,
      metrics: {
        passRate: Math.round(passRate),
        executionRate: Math.round(executionRate),
        participationRate: Math.round(participationRate)
      }
    };
  }, [proposals, statistics]);
  
  // 生成提案类别分布数据
  const proposalCategoryData = useMemo(() => {
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
  const proposalStateData = useMemo(() => {
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
      const stateName = stateMap[proposal.state] || '未知';
      if (!states[stateName]) {
        states[stateName] = 1;
      } else {
        states[stateName]++;
      }
    });
    
    return Object.keys(states).map(state => ({
      name: state,
      value: states[state]
    }));
  }, [proposals]);
  
  // 生成月度提案趋势数据
  const monthlyProposalTrendData = useMemo(() => {
    if (!proposals || proposals.length === 0) return [];
    
    const now = new Date();
    const monthsData = {};
    
    // 初始化过去12个月的数据
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      monthsData[monthKey] = {
        month: `${month.getFullYear()}/${month.getMonth() + 1}`,
        created: 0,
        passed: 0,
        executed: 0
      };
    }
    
    // 填充提案数据
    proposals.forEach(proposal => {
      const createdDate = new Date(proposal.createdTimestamp * 1000);
      const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthsData[monthKey]) {
        monthsData[monthKey].created++;
        
        if (proposal.state >= 4) {
          monthsData[monthKey].passed++;
        }
        
        if (proposal.state === 7) {
          monthsData[monthKey].executed++;
        }
      }
    });
    
    return Object.values(monthsData);
  }, [proposals]);
  
  // 生成投票分布数据
  const votingDistributionData = useMemo(() => {
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
      { name: '支持', value: totalFor },
      { name: '反对', value: totalAgainst },
      { name: '弃权', value: totalAbstain }
    ];
  }, [proposals]);
  
  // 处理时间范围变更
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // 在实际应用中，这里应该根据时间范围重新加载数据
  };
  
  // 处理标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // 饼图颜色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF85C0', '#4CAF50', '#F44336'];
  
  // 如果正在加载，显示加载状态
  if (isLoading && !isDataLoaded) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
        <p>正在加载治理数据...</p>
      </div>
    );
  }
  
  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="dashboard-error">
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
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1>DAO治理仪表盘</h1>
        <div className="time-range-selector">
          <span className={timeRange === 'week' ? 'active' : ''} onClick={() => handleTimeRangeChange('week')}>周</span>
          <span className={timeRange === 'month' ? 'active' : ''} onClick={() => handleTimeRangeChange('month')}>月</span>
          <span className={timeRange === 'year' ? 'active' : ''} onClick={() => handleTimeRangeChange('year')}>年</span>
          <span className={timeRange === 'all' ? 'active' : ''} onClick={() => handleTimeRangeChange('all')}>全部</span>
        </div>
      </div>
      
      <div className="dashboard-content">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <Tabs.TabPane tab="概览" key="overview">
            <div className="dashboard-overview">
              {/* 关键指标卡片 */}
              <div className="metrics-cards">
                <Card className="metric-card">
                  <h3>活跃提案</h3>
                  <div className="metric-value">{statistics.activeProposals || 0}</div>
                  <div className="metric-description">当前需要投票的提案</div>
                </Card>
                
                <Card className="metric-card">
                  <h3>总提案数</h3>
                  <div className="metric-value">{statistics.totalProposals || 0}</div>
                  <div className="metric-description">已创建的提案总数</div>
                </Card>
                
                <Card className="metric-card">
                  <h3>已执行提案</h3>
                  <div className="metric-value">{statistics.executedProposals || 0}</div>
                  <div className="metric-description">成功执行的提案数量</div>
                </Card>
                
                <Card className="metric-card">
                  <h3>参与率</h3>
                  <div className="metric-value">{statistics.participationRate || '0%'}</div>
                  <div className="metric-description">平均投票参与率</div>
                </Card>
              </div>
              
              {/* 治理健康度 */}
              <Card title="治理健康度" className="health-card">
                <div className="health-score">
                  <div className="score-circle" style={{ 
                    background: `conic-gradient(var(--color-primary) ${governanceHealth.score}%, #f0f0f0 0)` 
                  }}>
                    <div className="score-inner">
                      <span className="score-value">{governanceHealth.score}</span>
                      <span className="score-label">{governanceHealth.level}</span>
                    </div>
                  </div>
                  
                  <div className="health-metrics">
                    <div className="health-metric">
                      <span className="metric-label">提案通过率</span>
                      <div className="metric-bar">
                        <div className="metric-progress" style={{ width: `${governanceHealth.metrics.passRate}%` }}></div>
                      </div>
                      <span className="metric-value">{governanceHealth.metrics.passRate}%</span>
                    </div>
                    
                    <div className="health-metric">
                      <span className="metric-label">提案执行率</span>
                      <div className="metric-bar">
                        <div className="metric-progress" style={{ width: `${governanceHealth.metrics.executionRate}%` }}></div>
                      </div>
                      <span className="metric-value">{governanceHealth.metrics.executionRate}%</span>
                    </div>
                    
                    <div className="health-metric">
                      <span className="metric-label">投票参与率</span>
                      <div className="metric-bar">
                        <div className="metric-progress" style={{ width: `${governanceHealth.metrics.participationRate}%` }}></div>
                      </div>
                      <span className="metric-value">{governanceHealth.metrics.participationRate}%</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* 提案趋势图 */}
              <Card title="月度提案趋势" className="trend-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyProposalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="created" name="已创建" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="passed" name="已通过" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="executed" name="已执行" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              
              {/* 提案分布图 */}
              <div className="distribution-charts">
                <Card title="提案类别分布" className="distribution-card">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={proposalCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {proposalCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
                
                <Card title="提案状态分布" className="distribution-card">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={proposalStateData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {proposalStateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>
              
              {/* 投票分布图 */}
              <Card title="投票分布" className="voting-card">
                <div className="voting-charts">
                  <div className="voting-pie">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={votingDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#4CAF50" /> {/* 支持 */}
                          <Cell fill="#F44336" /> {/* 反对 */}
                          <Cell fill="#FFEB3B" /> {/* 弃权 */}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="voting-bar">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={votingDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="票数">
                          <Cell fill="#4CAF50" /> {/* 支持 */}
                          <Cell fill="#F44336" /> {/* 反对 */}
                          <Cell fill="#FFEB3B" /> {/* 弃权 */}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="提案分析" key="proposals">
            <div className="proposal-analysis">
              <Card className="coming-soon">
                <h3>提案详细分析</h3>
                <p>此功能正在开发中，敬请期待...</p>
              </Card>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="投票分析" key="voting">
            <div className="voting-analysis">
              <Card className="coming-soon">
                <h3>投票详细分析</h3>
                <p>此功能正在开发中，敬请期待...</p>
              </Card>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="委托分析" key="delegation">
            <div className="delegation-analysis">
              <Card className="coming-soon">
                <h3>委托网络分析</h3>
                <p>此功能正在开发中，敬请期待...</p>
              </Card>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardHome;
