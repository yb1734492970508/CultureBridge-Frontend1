import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { ethers } from 'ethers';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { 
  Tabs, 
  Steps, 
  Button, 
  Spin, 
  Alert, 
  Progress, 
  Badge, 
  Select, 
  DatePicker, 
  Radio, 
  Tooltip as AntTooltip,
  Modal,
  Table,
  Tag
} from 'antd';
import { 
  HistoryOutlined, 
  TrophyOutlined, 
  RiseOutlined, 
  UserOutlined, 
  StarOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FilterOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import './ReputationHistory.css';

// 注册Chart.js组件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 声誉系统历史记录ABI
const reputationHistoryABI = [
  "function getUserReputationHistory(address user) external view returns (uint256[] memory timestamps, int256[] memory changes, uint256[] memory eventIds)",
  "function getReputationEventDetails(uint256 eventId) external view returns (uint8 eventType, string memory description, string memory evidence, address initiator)",
  "function getUserCurrentReputation(address user) external view returns (uint256 score, uint256 level, uint256 totalEvents)",
  "function getReputationRanking(uint256 limit) external view returns (address[] memory users, uint256[] memory scores)",
  "function getReputationRewards(address user) external view returns (uint256 pendingRewards, uint256 claimedRewards, uint256 lastClaimTime)",
  "function claimReputationRewards() external returns (uint256)",
  "function getReputationMilestones(address user) external view returns (uint8[] memory achievedMilestones, uint256[] memory timestamps)",
  "function getReputationStats(address user) external view returns (uint256 contributionsCount, uint256 translationsCount, uint256 validationsCount, uint256 endorsementsReceived)",
  "event ReputationChanged(address indexed user, int256 change, uint256 indexed eventId, uint256 timestamp)",
  "event RewardsDistributed(address indexed user, uint256 amount, uint256 timestamp)"
];

// 声誉事件类型
const reputationEventTypes = [
  { id: 0, name: '内容创作', icon: '📝', color: '#1890ff' },
  { id: 1, name: '内容翻译', icon: '🌐', color: '#52c41a' },
  { id: 2, name: '知识贡献', icon: '📚', color: '#722ed1' },
  { id: 3, name: '社区参与', icon: '👥', color: '#faad14' },
  { id: 4, name: '版权登记', icon: '©️', color: '#eb2f96' },
  { id: 5, name: '版权验证', icon: '✅', color: '#13c2c2' },
  { id: 6, name: '学习完成', icon: '🎓', color: '#fa8c16' },
  { id: 7, name: '测验通过', icon: '🏆', color: '#a0d911' },
  { id: 8, name: '背书获得', icon: '👍', color: '#fa541c' },
  { id: 9, name: '其他活动', icon: '🔍', color: '#8c8c8c' }
];

// 声誉等级配置
const reputationLevels = [
  { id: 0, name: '文化新手', minScore: 0, color: '#8BC34A', icon: '🌱', benefits: ['基础功能访问', '每周学习资源'] },
  { id: 1, name: '文化探索者', minScore: 100, color: '#4CAF50', icon: '🔍', benefits: ['社区讨论参与', '基础翻译工具', '每月5个CBT代币'] },
  { id: 2, name: '文化贡献者', minScore: 500, color: '#009688', icon: '🌟', benefits: ['高级翻译工具', '内容推荐权', '每月15个CBT代币'] },
  { id: 3, name: '文化专家', minScore: 1000, color: '#3F51B5', icon: '🏆', benefits: ['专家徽章展示', '内容审核权限', '每月30个CBT代币'] },
  { id: 4, name: '文化大师', minScore: 2500, color: '#673AB7', icon: '👑', benefits: ['大师专属活动', '社区治理投票', '每月50个CBT代币'] },
  { id: 5, name: '文化传奇', minScore: 5000, color: '#9C27B0', icon: '🔱', benefits: ['传奇专属头像框', 'DAO提案权', '每月100个CBT代币'] }
];

// 声誉里程碑
const reputationMilestones = [
  { id: 0, name: '初次贡献', description: '完成第一次文化贡献', icon: '🎯', rewardAmount: 5 },
  { id: 1, name: '翻译先锋', description: '完成10次翻译任务', icon: '🌐', rewardAmount: 10 },
  { id: 2, name: '知识传播者', description: '创作内容获得100次浏览', icon: '📚', rewardAmount: 15 },
  { id: 3, name: '社区活跃者', description: '连续30天登录平台', icon: '📅', rewardAmount: 20 },
  { id: 4, name: '文化守护者', description: '成功验证5个版权', icon: '🛡️', rewardAmount: 25 },
  { id: 5, name: '受人尊敬', description: '获得10次背书', icon: '👍', rewardAmount: 30 },
  { id: 6, name: '声誉卓著', description: '达到文化专家等级', icon: '🏆', rewardAmount: 50 },
  { id: 7, name: '传奇之路', description: '累计声誉达到2500分', icon: '⭐', rewardAmount: 100 }
];

/**
 * 声誉历史记录组件
 * 展示用户声誉变化历史、等级进度和相关事件
 */
const ReputationHistory = ({ userId }) => {
  const { TabPane } = Tabs;
  const { Step } = Steps;
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  
  // 区块链上下文
  const { account, provider, isConnected, connectWallet, getSigner, chainId } = useBlockchain();
  
  // 组件状态
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year', 'all'
  const [dateRange, setDateRange] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [filterType, setFilterType] = useState('all'); // 'all' 或特定事件类型
  const [searchText, setSearchText] = useState('');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [claimingRewards, setClaimingRewards] = useState(false);
  
  // 声誉数据
  const [currentReputation, setCurrentReputation] = useState({
    score: 0,
    level: 0,
    totalEvents: 0
  });
  const [reputationHistory, setReputationHistory] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [reputationRanking, setReputationRanking] = useState([]);
  const [reputationRewards, setReputationRewards] = useState({
    pendingRewards: 0,
    claimedRewards: 0,
    lastClaimTime: 0
  });
  const [reputationMilestones, setReputationMilestones] = useState([]);
  const [reputationStats, setReputationStats] = useState({
    contributionsCount: 0,
    translationsCount: 0,
    validationsCount: 0,
    endorsementsReceived: 0
  });
  
  // 图表数据
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [chartView, setChartView] = useState('cumulative'); // 'cumulative', 'changes', 'distribution'
  
  // 合约实例
  const [reputationContract, setReputationContract] = useState(null);
  const contractAddressRef = useRef(process.env.REACT_APP_REPUTATION_CONTRACT_ADDRESS || "0x...");

  // 初始化合约
  useEffect(() => {
    if (provider) {
      try {
        const signer = getSigner();
        const contract = new ethers.Contract(contractAddressRef.current, reputationHistoryABI, signer || provider);
        setReputationContract(contract);
      } catch (error) {
        console.error("初始化合约失败:", error);
        setErrorMessage("初始化合约失败，请刷新页面重试");
      }
    }
  }, [provider, getSigner]);
  
  // 加载用户声誉数据
  useEffect(() => {
    if (reputationContract && (userId || account)) {
      loadUserReputation();
      loadReputationHistory();
      loadReputationRewards();
      loadReputationMilestones();
      loadReputationStats();
    }
  }, [reputationContract, userId, account, timeRange, filterType, dateRange]);
  
  // 加载排行榜数据
  useEffect(() => {
    if (reputationContract && activeTab === 'ranking') {
      loadReputationRanking();
    }
  }, [reputationContract, activeTab]);
  
  // 加载用户当前声誉
  const loadUserReputation = useCallback(async () => {
    if (!reputationContract) return;
    
    setIsLoading(true);
    try {
      const targetUser = userId || account;
      const reputation = await reputationContract.getUserCurrentReputation(targetUser);
      
      setCurrentReputation({
        score: reputation.score.toNumber(),
        level: reputation.level.toNumber(),
        totalEvents: reputation.totalEvents.toNumber()
      });
    } catch (error) {
      console.error("加载声誉数据失败:", error);
      setErrorMessage("无法加载声誉数据");
    } finally {
      setIsLoading(false);
    }
  }, [reputationContract, userId, account]);
  
  // 加载声誉历史
  const loadReputationHistory = useCallback(async () => {
    if (!reputationContract) return;
    
    setIsLoading(true);
    try {
      const targetUser = userId || account;
      
      // 获取原始历史数据
      const [timestamps, changes, eventIds] = await reputationContract.getUserReputationHistory(targetUser);
      
      // 转换为更易于使用的格式
      let history = [];
      for (let i = 0; i < timestamps.length; i++) {
        // 获取事件详情
        const eventDetails = await reputationContract.getReputationEventDetails(eventIds[i]);
        
        history.push({
          timestamp: timestamps[i].toNumber() * 1000, // 转换为毫秒
          change: changes[i].toNumber(),
          eventId: eventIds[i].toNumber(),
          eventType: eventDetails.eventType,
          description: eventDetails.description,
          evidence: eventDetails.evidence,
          initiator: eventDetails.initiator
        });
      }
      
      // 应用时间范围过滤
      let filteredHistory = history;
      
      if (dateRange && dateRange.length === 2) {
        // 如果有自定义日期范围
        const startTime = dateRange[0].startOf('day').valueOf();
        const endTime = dateRange[1].endOf('day').valueOf();
        filteredHistory = history.filter(item => item.timestamp >= startTime && item.timestamp <= endTime);
      } else if (timeRange === 'week') {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        filteredHistory = history.filter(item => item.timestamp >= weekAgo);
      } else if (timeRange === 'month') {
        const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        filteredHistory = history.filter(item => item.timestamp >= monthAgo);
      } else if (timeRange === 'year') {
        const yearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
        filteredHistory = history.filter(item => item.timestamp >= yearAgo);
      }
      
      // 应用事件类型过滤
      if (filterType !== 'all') {
        const typeIndex = parseInt(filterType);
        filteredHistory = filteredHistory.filter(item => item.eventType === typeIndex);
      }
      
      // 应用搜索文本过滤
      if (searchText) {
        const lowerSearchText = searchText.toLowerCase();
        filteredHistory = filteredHistory.filter(item => 
          item.description.toLowerCase().includes(lowerSearchText) ||
          reputationEventTypes.find(t => t.id === item.eventType)?.name.toLowerCase().includes(lowerSearchText)
        );
      }
      
      // 应用排序
      filteredHistory.sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.timestamp - b.timestamp 
          : b.timestamp - a.timestamp;
      });
      
      setReputationHistory(filteredHistory);
      
      // 准备图表数据
      prepareChartData(filteredHistory);
      
    } catch (error) {
      console.error("加载声誉历史失败:", error);
      setErrorMessage("无法加载声誉历史");
    } finally {
      setIsLoading(false);
    }
  }, [reputationContract, userId, account, timeRange, filterType, sortOrder, dateRange, searchText]);
  
  // 加载声誉排行榜
  const loadReputationRanking = async () => {
    if (!reputationContract) return;
    
    setIsLoading(true);
    try {
      const [users, scores] = await reputationContract.getReputationRanking(50); // 获取前50名
      
      const ranking = [];
      for (let i = 0; i < users.length; i++) {
        ranking.push({
          rank: i + 1,
          address: users[i],
          score: scores[i].toNumber(),
          isCurrentUser: users[i].toLowerCase() === (account || '').toLowerCase()
        });
      }
      
      setReputationRanking(ranking);
    } catch (error) {
      console.error("加载排行榜失败:", error);
      setErrorMessage("无法加载声誉排行榜");
    } finally {
      setIsLoading(false);
    }
  };
  
  // 加载声誉奖励
  const loadReputationRewards = async () => {
    if (!reputationContract || !account) return;
    
    try {
      const rewards = await reputationContract.getReputationRewards(account);
      
      setReputationRewards({
        pendingRewards: rewards.pendingRewards.toNumber(),
        claimedRewards: rewards.claimedRewards.toNumber(),
        lastClaimTime: rewards.lastClaimTime.toNumber() * 1000
      });
    } catch (error) {
      console.error("加载声誉奖励失败:", error);
    }
  };
  
  // 加载声誉里程碑
  const loadReputationMilestones = async () => {
    if (!reputationContract || !(userId || account)) return;
    
    try {
      const targetUser = userId || account;
      const [achievedMilestones, timestamps] = await reputationContract.getReputationMilestones(targetUser);
      
      const milestones = [];
      for (let i = 0; i < achievedMilestones.length; i++) {
        const milestoneId = achievedMilestones[i];
        const milestone = reputationMilestones.find(m => m.id === milestoneId);
        
        if (milestone) {
          milestones.push({
            ...milestone,
            achievedAt: timestamps[i].toNumber() * 1000
          });
        }
      }
      
      setReputationMilestones(milestones);
    } catch (error) {
      console.error("加载声誉里程碑失败:", error);
    }
  };
  
  // 加载声誉统计数据
  const loadReputationStats = async () => {
    if (!reputationContract || !(userId || account)) return;
    
    try {
      const targetUser = userId || account;
      const stats = await reputationContract.getReputationStats(targetUser);
      
      setReputationStats({
        contributionsCount: stats.contributionsCount.toNumber(),
        translationsCount: stats.translationsCount.toNumber(),
        validationsCount: stats.validationsCount.toNumber(),
        endorsementsReceived: stats.endorsementsReceived.toNumber()
      });
    } catch (error) {
      console.error("加载声誉统计数据失败:", error);
    }
  };
  
  // 准备图表数据
  const prepareChartData = (history) => {
    if (!history.length) {
      setChartData({
        labels: [],
        datasets: [{
          label: '声誉变化',
          data: [],
          borderColor: '#3F51B5',
          backgroundColor: 'rgba(63, 81, 181, 0.2)',
        }]
      });
      return;
    }
    
    // 按时间排序（升序）
    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
    
    // 准备标签和数据点
    const labels = sortedHistory.map(item => new Date(item.timestamp).toLocaleDateString());
    
    // 计算累积声誉
    let cumulativeScore = 0;
    const cumulativeData = sortedHistory.map(item => {
      cumulativeScore += item.change;
      return cumulativeScore;
    });
    
    // 按事件类型分组数据
    const eventTypeData = {};
    reputationEventTypes.forEach(type => {
      eventTypeData[type.id] = 0;
    });
    
    history.forEach(item => {
      if (eventTypeData[item.eventType] !== undefined) {
        eventTypeData[item.eventType] += item.change;
      }
    });
    
    // 设置图表数据
    if (chartView === 'cumulative') {
      setChartData({
        labels,
        datasets: [
          {
            label: '累积声誉',
            data: cumulativeData,
            borderColor: '#3F51B5',
            backgroundColor: 'rgba(63, 81, 181, 0.2)',
            tension: 0.4,
            fill: true
          }
        ]
      });
    } else if (chartView === 'changes') {
      setChartData({
        labels,
        datasets: [
          {
            label: '声誉变化',
            data: sortedHistory.map(item => item.change),
            borderColor: '#4CAF50',
            backgroundColor: sortedHistory.map(item => 
              item.change >= 0 ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'
            ),
            type: 'bar'
          }
        ]
      });
    } else if (chartView === 'distribution') {
      setChartData({
        labels: reputationEventTypes.map(type => type.name),
        datasets: [
          {
            label: '声誉分布',
            data: reputationEventTypes.map(type => eventTypeData[type.id] || 0),
            backgroundColor: reputationEventTypes.map(type => type.color),
            borderWidth: 1
          }
        ]
      });
    }
  };
  
  // 领取声誉奖励
  const claimReputationRewards = async () => {
    if (!reputationContract || !account) return;
    
    setClaimingRewards(true);
    try {
      const tx = await reputationContract.claimReputationRewards();
      await tx.wait();
      
      // 更新奖励数据
      await loadReputationRewards();
      
      setSuccessMessage(`成功领取 ${reputationRewards.pendingRewards} CBT 代币奖励！`);
      setShowRewardModal(false);
    } catch (error) {
      console.error("领取奖励失败:", error);
      setErrorMessage("领取奖励失败: " + error.message);
    } finally {
      setClaimingRewards(false);
    }
  };
  
  // 查看事件详情
  const viewEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };
  
  // 获取声誉等级信息
  const getReputationLevel = (score) => {
    // 从高到低查找匹配的等级
    for (let i = reputationLevels.length - 1; i >= 0; i--) {
      if (score >= reputationLevels[i].minScore) {
        return reputationLevels[i];
      }
    }
    return reputationLevels[0]; // 默认最低等级
  };
  
  // 计算下一等级进度
  const calculateNextLevelProgress = (score) => {
    const currentLevel = getReputationLevel(score);
    const currentLevelIndex = reputationLevels.findIndex(level => level.id === currentLevel.id);
    
    // 如果已经是最高等级
    if (currentLevelIndex === reputationLevels.length - 1) {
      return 100;
    }
    
    const nextLevel = reputationLevels[currentLevelIndex + 1];
    const totalNeeded = nextLevel.minScore - currentLevel.minScore;
    const achieved = score - currentLevel.minScore;
    
    return Math.min(100, Math.round((achieved / totalNeeded) * 100));
  };
  
  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 渲染声誉概览
  const renderReputationOverview = () => {
    const currentLevel = getReputationLevel(currentReputation.score);
    const nextLevelProgress = calculateNextLevelProgress(currentReputation.score);
    const currentLevelIndex = reputationLevels.findIndex(level => level.id === currentLevel.id);
    const nextLevel = currentLevelIndex < reputationLevels.length - 1 ? reputationLevels[currentLevelIndex + 1] : null;
    
    return (
      <div className="reputation-overview">
        <div className="overview-header">
          <h3>声誉概览</h3>
          {account && reputationRewards.pendingRewards > 0 && (
            <Button 
              type="primary" 
              onClick={() => setShowRewardModal(true)}
              className="claim-rewards-button"
            >
              领取 {reputationRewards.pendingRewards} CBT 奖励
            </Button>
          )}
        </div>
        
        <div className="overview-content">
          <div className="reputation-score-card">
            <div className="score-header">
              <h3>当前声誉分数</h3>
            </div>
            <div className="score-content">
              <div className="score-value" style={{ color: currentLevel.color }}>
                {currentReputation.score}
              </div>
              <div className="level-badge" style={{ backgroundColor: currentLevel.color }}>
                <span className="level-icon">{currentLevel.icon}</span>
                <span className="level-name">{currentLevel.name}</span>
              </div>
            </div>
          </div>
          
          <div className="level-progress-card">
            <div className="progress-header">
              <h3>等级进度</h3>
            </div>
            <div className="progress-content">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${nextLevelProgress}%`, backgroundColor: currentLevel.color }}
                ></div>
              </div>
              <div className="progress-text">
                {nextLevel ? (
                  <>
                    距离 <span style={{ color: nextLevel.color }}>{nextLevel.icon} {nextLevel.name}</span> 还需 
                    <span className="points-needed">{nextLevel.minScore - currentReputation.score}</span> 分
                  </>
                ) : (
                  <span>已达到最高等级 {currentLevel.icon} {currentLevel.name}</span>
                )}
              </div>
              
              <div className="level-benefits">
                <h4>当前等级特权：</h4>
                <ul>
                  {currentLevel.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              {nextLevel && (
                <div className="next-level-benefits">
                  <h4>下一等级特权：</h4>
                  <ul>
                    {nextLevel.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="reputation-stats-card">
            <div className="stats-header">
              <h3>声誉统计</h3>
            </div>
            <div className="stats-content">
              <div className="stat-item">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <div className="stat-label">总事件数</div>
                  <div className="stat-value">{currentReputation.totalEvents}</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">📝</div>
                <div className="stat-info">
                  <div className="stat-label">内容贡献</div>
                  <div className="stat-value">{reputationStats.contributionsCount}</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">🌐</div>
                <div className="stat-info">
                  <div className="stat-label">翻译完成</div>
                  <div className="stat-value">{reputationStats.translationsCount}</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <div className="stat-label">验证参与</div>
                  <div className="stat-value">{reputationStats.validationsCount}</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">👍</div>
                <div className="stat-info">
                  <div className="stat-label">获得背书</div>
                  <div className="stat-value">{reputationStats.endorsementsReceived}</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <div className="stat-label">本月变化</div>
                  <div className="stat-value">
                    {reputationHistory
                      .filter(item => item.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000)
                      .reduce((sum, item) => sum + item.change, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="milestones-section">
          <h3>声誉里程碑</h3>
          <div className="milestones-content">
            {reputationMilestones.length > 0 ? (
              <Steps progressDot current={reputationMilestones.length}>
                {reputationMilestones.map((milestone, index) => (
                  <Step 
                    key={milestone.id}
                    title={milestone.name}
                    description={
                      <div className="milestone-description">
                        <div>{milestone.description}</div>
                        <div className="milestone-reward">奖励: {milestone.rewardAmount} CBT</div>
                        <div className="milestone-time">达成时间: {formatTimestamp(milestone.achievedAt)}</div>
                      </div>
                    }
                    icon={<div className="milestone-icon">{milestone.icon}</div>}
                  />
                ))}
                
                {reputationMilestones.length < reputationMilestones.length && (
                  <Step 
                    title="下一里程碑"
                    description={
                      <div className="milestone-description">
                        <div>{reputationMilestones[reputationMilestones.length].description}</div>
                        <div className="milestone-reward">奖励: {reputationMilestones[reputationMilestones.length].rewardAmount} CBT</div>
                      </div>
                    }
                    icon={<div className="milestone-icon">{reputationMilestones[reputationMilestones.length].icon}</div>}
                  />
                )}
              </Steps>
            ) : (
              <div className="no-milestones-message">
                <p>尚未达成任何里程碑</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染声誉图表
  const renderReputationChart = () => {
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: chartView === 'distribution',
          title: {
            display: true,
            text: chartView === 'distribution' ? '声誉分布' : '声誉分数'
          }
        },
        x: {
          title: {
            display: true,
            text: chartView === 'distribution' ? '事件类型' : '日期'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: chartView === 'cumulative' ? '声誉累积趋势' : 
                chartView === 'changes' ? '声誉变化历史' : '声誉分布情况'
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              if (chartView === 'distribution') {
                return tooltipItems[0].label;
              }
              return formatTimestamp(reputationHistory[tooltipItems[0].dataIndex]?.timestamp);
            }
          }
        }
      }
    };
    
    return (
      <div className="reputation-chart">
        <div className="chart-controls">
          <div className="control-group">
            <label>图表类型:</label>
            <Radio.Group value={chartView} onChange={(e) => setChartView(e.target.value)}>
              <Radio.Button value="cumulative">累积趋势</Radio.Button>
              <Radio.Button value="changes">变化历史</Radio.Button>
              <Radio.Button value="distribution">分布情况</Radio.Button>
            </Radio.Group>
          </div>
          
          {chartView !== 'distribution' && (
            <div className="control-group">
              <label>时间范围:</label>
              <Select value={timeRange} onChange={(value) => setTimeRange(value)}>
                <Option value="week">最近一周</Option>
                <Option value="month">最近一月</Option>
                <Option value="year">最近一年</Option>
                <Option value="all">全部历史</Option>
              </Select>
            </div>
          )}
          
          {chartView !== 'distribution' && (
            <div className="control-group">
              <label>自定义日期:</label>
              <RangePicker 
                onChange={(dates) => setDateRange(dates)}
                allowClear
              />
            </div>
          )}
        </div>
        
        <div className="chart-container">
          {chartData.labels.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="no-data-message">
              <p>所选条件下没有声誉数据</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // 渲染声誉历史列表
  const renderReputationHistoryList = () => {
    return (
      <div className="reputation-history-list">
        <div className="list-controls">
          <div className="filter-controls">
            <div className="control-group">
              <label><FilterOutlined /> 事件类型:</label>
              <Select value={filterType} onChange={(value) => setFilterType(value)} style={{ width: 150 }}>
                <Option value="all">全部类型</Option>
                {reputationEventTypes.map((type) => (
                  <Option key={type.id} value={type.id.toString()}>
                    <span className="event-type-option">
                      <span className="event-icon">{type.icon}</span>
                      <span>{type.name}</span>
                    </span>
                  </Option>
                ))}
              </Select>
            </div>
            
            <div className="control-group">
              <label><CalendarOutlined /> 时间范围:</label>
              <Select value={timeRange} onChange={(value) => setTimeRange(value)} style={{ width: 120 }}>
                <Option value="week">最近一周</Option>
                <Option value="month">最近一月</Option>
                <Option value="year">最近一年</Option>
                <Option value="all">全部历史</Option>
              </Select>
            </div>
            
            <div className="control-group">
              <label><SearchOutlined /> 搜索:</label>
              <input 
                type="text" 
                value={searchText} 
                onChange={(e) => setSearchText(e.target.value)} 
                placeholder="搜索事件描述"
                className="search-input"
              />
            </div>
            
            <div className="control-group">
              <label>排序:</label>
              <Select value={sortOrder} onChange={(value) => setSortOrder(value)} style={{ width: 120 }}>
                <Option value="desc">最新优先</Option>
                <Option value="asc">最早优先</Option>
              </Select>
            </div>
          </div>
        </div>
        
        {reputationHistory.length > 0 ? (
          <div className="history-items">
            {reputationHistory.map((item) => {
              const eventType = reputationEventTypes.find(t => t.id === item.eventType) || reputationEventTypes[9];
              return (
                <div 
                  key={item.eventId} 
                  className={`history-item ${item.change >= 0 ? 'positive' : 'negative'}`}
                  onClick={() => viewEventDetails(item)}
                >
                  <div className="event-icon" style={{ backgroundColor: eventType.color }}>
                    {eventType.icon}
                  </div>
                  
                  <div className="event-content">
                    <div className="event-header">
                      <div className="event-type">{eventType.name}</div>
                      <div className="event-time">{formatTimestamp(item.timestamp)}</div>
                    </div>
                    
                    <div className="event-description">{item.description}</div>
                    
                    <div className="event-footer">
                      <div className="event-id">事件ID: {item.eventId}</div>
                      <div className="event-change">
                        {item.change > 0 ? '+' : ''}{item.change} 分
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-history-message">
            <p>没有找到符合条件的声誉历史记录</p>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染声誉排行榜
  const renderReputationRanking = () => {
    const columns = [
      {
        title: '排名',
        dataIndex: 'rank',
        key: 'rank',
        render: (rank) => (
          <div className={`rank-cell ${rank <= 3 ? `top-${rank}` : ''}`}>
            {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
          </div>
        )
      },
      {
        title: '用户地址',
        dataIndex: 'address',
        key: 'address',
        render: (address, record) => (
          <div className={`address-cell ${record.isCurrentUser ? 'current-user' : ''}`}>
            {formatAddress(address)}
            {record.isCurrentUser && <Tag color="blue">我</Tag>}
          </div>
        )
      },
      {
        title: '声誉分数',
        dataIndex: 'score',
        key: 'score',
        render: (score) => {
          const level = getReputationLevel(score);
          return (
            <div className="score-cell">
              <span className="score-value">{score}</span>
              <Tag color={level.color} className="level-tag">
                {level.icon} {level.name}
              </Tag>
            </div>
          );
        }
      },
      {
        title: '等级',
        dataIndex: 'score',
        key: 'level',
        render: (score) => {
          const level = getReputationLevel(score);
          return (
            <div className="level-cell" style={{ color: level.color }}>
              {level.icon} {level.name}
            </div>
          );
        }
      }
    ];
    
    return (
      <div className="reputation-ranking">
        <div className="ranking-header">
          <h3><TrophyOutlined /> 声誉排行榜</h3>
          <Button 
            onClick={loadReputationRanking} 
            icon={<RiseOutlined />}
          >
            刷新排行
          </Button>
        </div>
        
        <div className="ranking-content">
          {isLoading ? (
            <div className="loading-container">
              <Spin tip="加载中..." />
            </div>
          ) : reputationRanking.length > 0 ? (
            <Table 
              dataSource={reputationRanking} 
              columns={columns} 
              rowKey="rank"
              pagination={false}
              rowClassName={(record) => record.isCurrentUser ? 'current-user-row' : ''}
            />
          ) : (
            <div className="no-data-message">
              <p>暂无排行榜数据</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // 渲染事件详情弹窗
  const renderEventDetailsModal = () => {
    if (!showEventModal || !selectedEvent) return null;
    
    const eventType = reputationEventTypes.find(t => t.id === selectedEvent.eventType) || reputationEventTypes[9];
    
    return (
      <Modal
        title={
          <div className="event-modal-title">
            <span className="event-icon" style={{ backgroundColor: eventType.color }}>{eventType.icon}</span>
            <span>{eventType.name} 事件详情</span>
          </div>
        }
        visible={showEventModal}
        onCancel={() => setShowEventModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowEventModal(false)}>
            关闭
          </Button>
        ]}
        width={600}
        className="event-details-modal"
      >
        <div className="event-details">
          <div className="detail-item">
            <div className="detail-label">事件ID:</div>
            <div className="detail-value">{selectedEvent.eventId}</div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">事件类型:</div>
            <div className="detail-value">
              <Tag color={eventType.color}>
                {eventType.icon} {eventType.name}
              </Tag>
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">描述:</div>
            <div className="detail-value description">{selectedEvent.description}</div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">声誉变化:</div>
            <div className={`detail-value change ${selectedEvent.change >= 0 ? 'positive' : 'negative'}`}>
              {selectedEvent.change > 0 ? '+' : ''}{selectedEvent.change} 分
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">时间:</div>
            <div className="detail-value">{formatTimestamp(selectedEvent.timestamp)}</div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">发起者:</div>
            <div className="detail-value">{formatAddress(selectedEvent.initiator)}</div>
          </div>
          
          {selectedEvent.evidence && (
            <div className="detail-item evidence-item">
              <div className="detail-label">证明材料:</div>
              <div className="detail-value">
                {selectedEvent.evidence.startsWith('ipfs://') ? (
                  <a 
                    href={selectedEvent.evidence.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="evidence-link"
                  >
                    查看证明材料
                  </a>
                ) : (
                  selectedEvent.evidence
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };
  
  // 渲染奖励领取弹窗
  const renderRewardModal = () => {
    if (!showRewardModal) return null;
    
    return (
      <Modal
        title={
          <div className="reward-modal-title">
            <span className="reward-icon">🎁</span>
            <span>声誉奖励领取</span>
          </div>
        }
        visible={showRewardModal}
        onCancel={() => setShowRewardModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowRewardModal(false)}>
            取消
          </Button>,
          <Button 
            key="claim" 
            type="primary" 
            onClick={claimReputationRewards}
            loading={claimingRewards}
            disabled={reputationRewards.pendingRewards <= 0}
          >
            确认领取
          </Button>
        ]}
        width={500}
        className="reward-modal"
      >
        <div className="reward-details">
          <div className="reward-amount">
            <div className="amount-label">可领取奖励</div>
            <div className="amount-value">{reputationRewards.pendingRewards} CBT</div>
          </div>
          
          <div className="reward-info">
            <div className="info-item">
              <div className="info-label">已领取总额:</div>
              <div className="info-value">{reputationRewards.claimedRewards} CBT</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">上次领取时间:</div>
              <div className="info-value">
                {reputationRewards.lastClaimTime > 0 
                  ? formatTimestamp(reputationRewards.lastClaimTime) 
                  : '从未领取'}
              </div>
            </div>
          </div>
          
          <div className="reward-notice">
            <Alert
              message="奖励说明"
              description={
                <div>
                  <p>声誉奖励是基于您的声誉等级和贡献自动计算的代币奖励。</p>
                  <p>领取后，奖励将直接发送到您的钱包地址。</p>
                  <p>每次领取需支付少量gas费用。</p>
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        </div>
      </Modal>
    );
  };
  
  // 主渲染函数
  return (
    <div className="reputation-history-container">
      <div className="reputation-header">
        <h2><HistoryOutlined /> 文化声誉历史</h2>
        <p className="system-description">
          查看您在CultureBridge平台上的声誉变化历史、等级进度和相关奖励
        </p>
      </div>
      
      {!isConnected && (
        <div className="connect-wallet-banner">
          <div className="banner-content">
            <div className="banner-text">
              <h3>连接钱包以查看您的声誉历史</h3>
              <p>声誉历史和奖励信息需要连接区块链钱包才能查看</p>
            </div>
            <Button type="primary" size="large" onClick={connectWallet}>
              连接钱包
            </Button>
          </div>
        </div>
      )}
      
      <div className="reputation-tabs">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={<span><UserOutlined /> 声誉概览</span>} 
            key="overview"
          >
            {renderReputationOverview()}
          </TabPane>
          
          <TabPane 
            tab={<span><BarChartOutlined /> 声誉图表</span>} 
            key="chart"
          >
            {renderReputationChart()}
          </TabPane>
          
          <TabPane 
            tab={<span><HistoryOutlined /> 历史记录</span>} 
            key="history"
          >
            {renderReputationHistoryList()}
          </TabPane>
          
          <TabPane 
            tab={<span><TrophyOutlined /> 排行榜</span>} 
            key="ranking"
          >
            {renderReputationRanking()}
          </TabPane>
        </Tabs>
      </div>
      
      {/* 成功信息 */}
      {successMessage && (
        <div className="success-message">
          <Alert
            message="成功"
            description={successMessage}
            type="success"
            showIcon
            closable
            onClose={() => setSuccessMessage('')}
          />
        </div>
      )}
      
      {/* 错误信息 */}
      {errorMessage && (
        <div className="error-message">
          <Alert
            message="错误"
            description={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMessage('')}
          />
        </div>
      )}
      
      {/* 模态框 */}
      {renderEventDetailsModal()}
      {renderRewardModal()}
    </div>
  );
};

export default ReputationHistory;
