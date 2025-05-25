import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { ethers } from 'ethers';
import './CulturalReputationSystem.css';

/**
 * 文化声誉系统组件
 * 
 * 该组件实现了基于区块链的文化声誉系统，允许用户:
 * 1. 查看自己的文化声誉分数和等级
 * 2. 查看声誉历史记录和获取途径
 * 3. 为其他用户背书文化贡献
 * 4. 查看社区内声誉排行榜
 * 5. 解锁基于声誉的特权和奖励
 */
const CulturalReputationSystem = () => {
  // 区块链上下文
  const { account, provider, isConnected, connectWallet } = useBlockchain();
  
  // 组件状态
  const [activeTab, setActiveTab] = useState('profile');
  const [reputationScore, setReputationScore] = useState(0);
  const [reputationLevel, setReputationLevel] = useState('');
  const [reputationHistory, setReputationHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [endorseAddress, setEndorseAddress] = useState('');
  const [endorseCategory, setEndorseCategory] = useState('knowledge');
  const [endorsePoints, setEndorsePoints] = useState(1);
  const [endorseComment, setEndorseComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rewards, setRewards] = useState([]);
  const [unlockedRewards, setUnlockedRewards] = useState([]);
  const [activeReward, setActiveReward] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [userContributions, setUserContributions] = useState([]);
  const [contributionStats, setContributionStats] = useState({});
  const [reputationGrowth, setReputationGrowth] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOption, setSortOption] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [showEndorseModal, setShowEndorseModal] = useState(false);
  const [showReputationDetails, setShowReputationDetails] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [nextLevelScore, setNextLevelScore] = useState(0);
  const [currentLevelScore, setCurrentLevelScore] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [recentEndorsements, setRecentEndorsements] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardFilter, setLeaderboardFilter] = useState('all');
  const [leaderboardTimeRange, setLeaderboardTimeRange] = useState('all');
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedHistoryItem, setExpandedHistoryItem] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllRewards, setShowAllRewards] = useState(false);
  const [reputationMilestones, setReputationMilestones] = useState([]);
  const [nextMilestone, setNextMilestone] = useState(null);
  const [milestoneProgress, setMilestoneProgress] = useState(0);
  
  // 引用
  const chartRef = useRef(null);
  const scoreRef = useRef(null);
  
  // 文化类别选项
  const categories = [
    { id: 'knowledge', label: '文化知识分享', icon: '📚', color: '#4285F4' },
    { id: 'creation', label: '文化创作', icon: '🎨', color: '#EA4335' },
    { id: 'preservation', label: '文化保护', icon: '🏛️', color: '#FBBC05' },
    { id: 'education', label: '文化教育', icon: '🎓', color: '#34A853' },
    { id: 'exchange', label: '跨文化交流', icon: '🌍', color: '#8E24AA' },
    { id: 'translation', label: '文化翻译', icon: '🔄', color: '#00ACC1' },
    { id: 'curation', label: '文化策展', icon: '🖼️', color: '#FB8C00' },
    { id: 'research', label: '文化研究', icon: '🔍', color: '#3949AB' },
    { id: 'performance', label: '文化表演', icon: '🎭', color: '#D81B60' },
    { id: 'heritage', label: '非物质文化遗产', icon: '👐', color: '#388E3C' },
    { id: 'cuisine', label: '饮食文化', icon: '🍲', color: '#F4511E' },
    { id: 'festival', label: '节日文化', icon: '🎉', color: '#6D4C41' }
  ];
  
  // 声誉等级定义
  const reputationLevels = [
    { level: '文化新手', minScore: 0, maxScore: 99, color: '#8E9AAF', icon: '🔰' },
    { level: '文化爱好者', minScore: 100, maxScore: 499, color: '#6DA34D', icon: '🌱' },
    { level: '文化使者', minScore: 500, maxScore: 999, color: '#5E60CE', icon: '🌟' },
    { level: '文化大师', minScore: 1000, maxScore: 2499, color: '#E07A5F', icon: '✨' },
    { level: '文化守护者', minScore: 2500, maxScore: 4999, color: '#3D348B', icon: '🛡️' },
    { level: '文化传奇', minScore: 5000, maxScore: Infinity, color: '#F4D35E', icon: '👑' }
  ];

  // 声誉里程碑定义
  const milestonesDefinition = [
    { id: 'first_contribution', name: '首次贡献', description: '完成首次文化贡献', score: 10, icon: '🎯' },
    { id: 'ten_contributions', name: '持续贡献', description: '完成10次文化贡献', score: 100, icon: '🔄' },
    { id: 'first_endorsement', name: '首次背书', description: '首次为他人背书文化贡献', score: 50, icon: '👍' },
    { id: 'category_master', name: '类别专家', description: '在单一类别中获得100分以上', score: 100, icon: '🏆' },
    { id: 'diversity_champion', name: '多元文化使者', description: '在5个不同类别中获得声誉', score: 250, icon: '🌈' },
    { id: 'community_pillar', name: '社区支柱', description: '获得10次他人背书', score: 500, icon: '🏛️' },
    { id: 'reputation_legend', name: '声誉传奇', description: '总声誉分达到1000分', score: 1000, icon: '🌠' },
    { id: 'cultural_guardian', name: '文化守护者', description: '总声誉分达到2500分', score: 2500, icon: '🔱' },
    { id: 'cultural_icon', name: '文化偶像', description: '总声誉分达到5000分', score: 5000, icon: '💫' }
  ];

  // 奖励定义
  const rewardDefinitions = [
    { 
      id: 'badge_novice', 
      name: '文化新手徽章', 
      description: '完成注册并获得首个声誉点', 
      type: 'badge',
      requiredScore: 1,
      icon: '🔰'
    },
    { 
      id: 'badge_enthusiast', 
      name: '文化爱好者徽章', 
      description: '达到文化爱好者等级', 
      type: 'badge',
      requiredScore: 100,
      icon: '🌱'
    },
    { 
      id: 'badge_ambassador', 
      name: '文化使者徽章', 
      description: '达到文化使者等级', 
      type: 'badge',
      requiredScore: 500,
      icon: '🌟'
    },
    { 
      id: 'badge_master', 
      name: '文化大师徽章', 
      description: '达到文化大师等级', 
      type: 'badge',
      requiredScore: 1000,
      icon: '✨'
    },
    { 
      id: 'badge_guardian', 
      name: '文化守护者徽章', 
      description: '达到文化守护者等级', 
      type: 'badge',
      requiredScore: 2500,
      icon: '🛡️'
    },
    { 
      id: 'badge_legend', 
      name: '文化传奇徽章', 
      description: '达到文化传奇等级', 
      type: 'badge',
      requiredScore: 5000,
      icon: '👑'
    },
    { 
      id: 'feature_governance', 
      name: '治理投票权', 
      description: '参与平台治理提案投票', 
      type: 'feature',
      requiredScore: 300,
      icon: '🗳️'
    },
    { 
      id: 'feature_create_proposal', 
      name: '创建治理提案', 
      description: '创建平台治理提案', 
      type: 'feature',
      requiredScore: 1000,
      icon: '📝'
    },
    { 
      id: 'feature_curator', 
      name: '内容策展权', 
      description: '为平台推荐和策展优质内容', 
      type: 'feature',
      requiredScore: 800,
      icon: '🔍'
    },
    { 
      id: 'feature_verified_creator', 
      name: '认证创作者', 
      description: '获得创作者认证标识', 
      type: 'feature',
      requiredScore: 1500,
      icon: '✅'
    },
    { 
      id: 'token_reward_tier1', 
      name: '代币奖励 Tier 1', 
      description: '获得平台代币奖励', 
      type: 'token',
      requiredScore: 200,
      amount: '50 CBT',
      icon: '🪙'
    },
    { 
      id: 'token_reward_tier2', 
      name: '代币奖励 Tier 2', 
      description: '获得平台代币奖励', 
      type: 'token',
      requiredScore: 600,
      amount: '150 CBT',
      icon: '🪙'
    },
    { 
      id: 'token_reward_tier3', 
      name: '代币奖励 Tier 3', 
      description: '获得平台代币奖励', 
      type: 'token',
      requiredScore: 1200,
      amount: '300 CBT',
      icon: '🪙'
    },
    { 
      id: 'token_reward_tier4', 
      name: '代币奖励 Tier 4', 
      description: '获得平台代币奖励', 
      type: 'token',
      requiredScore: 2000,
      amount: '500 CBT',
      icon: '🪙'
    },
    { 
      id: 'token_reward_tier5', 
      name: '代币奖励 Tier 5', 
      description: '获得平台代币奖励', 
      type: 'token',
      requiredScore: 3500,
      amount: '1000 CBT',
      icon: '🪙'
    },
    { 
      id: 'nft_cultural_badge', 
      name: '文化贡献NFT徽章', 
      description: '独特的NFT徽章，彰显您的文化贡献', 
      type: 'nft',
      requiredScore: 800,
      icon: '🖼️'
    },
    { 
      id: 'nft_cultural_artwork', 
      name: '文化艺术品NFT', 
      description: '由知名艺术家创作的限量版NFT艺术品', 
      type: 'nft',
      requiredScore: 2000,
      icon: '🎨'
    },
    { 
      id: 'feature_premium_content', 
      name: '高级内容访问权', 
      description: '访问平台上的高级文化内容', 
      type: 'feature',
      requiredScore: 400,
      icon: '🔐'
    },
    { 
      id: 'feature_early_access', 
      name: '早期访问权', 
      description: '提前访问平台新功能和内容', 
      type: 'feature',
      requiredScore: 700,
      icon: '⏱️'
    }
  ];

  // 模拟数据 - 实际应用中应从区块链获取
  const mockReputationHistory = [
    { id: 1, date: '2025-05-20', category: 'knowledge', points: 25, description: '分享关于中国传统节日的深度文章', from: '0x1234...5678', fromName: '文化守护者小王', evidence: 'https://example.com/article/123', transaction: '0xabcd...1234' },
    { id: 2, date: '2025-05-15', category: 'creation', points: 50, description: '创作并分享传统音乐作品', from: '0x8765...4321', fromName: '传统艺术家小李', evidence: 'https://example.com/music/456', transaction: '0xefgh...5678' },
    { id: 3, date: '2025-05-10', category: 'exchange', points: 30, description: '组织线上文化交流活动', from: '0x5678...1234', fromName: '语言学者小张', evidence: 'https://example.com/event/789', transaction: '0xijkl...9012' },
    { id: 4, date: '2025-05-05', category: 'education', points: 40, description: '为社区提供语言学习资源', from: '0x4321...8765', fromName: '民俗收藏家小陈', evidence: 'https://example.com/resources/012', transaction: '0xmnop...3456' },
    { id: 5, date: '2025-05-01', category: 'preservation', points: 35, description: '参与数字化保存濒危文化项目', from: '0x2468...1357', fromName: '文化教育家小林', evidence: 'https://example.com/project/345', transaction: '0xqrst...7890' },
    { id: 6, date: '2025-04-25', category: 'translation', points: 20, description: '翻译重要文化文献', from: '0x1357...2468', fromName: '跨文化交流者小刘', evidence: 'https://example.com/translation/678', transaction: '0xuvwx...1234' },
    { id: 7, date: '2025-04-20', category: 'curation', points: 15, description: '策划线上文化展览', from: '0x3690...1478', fromName: '传统音乐家小赵', evidence: 'https://example.com/exhibition/901', transaction: '0xyzab...5678' },
    { id: 8, date: '2025-04-15', category: 'research', points: 45, description: '发布文化研究报告', from: '0x1478...3690', fromName: '文化研究者小孙', evidence: 'https://example.com/research/234', transaction: '0xcdef...9012' },
    { id: 9, date: '2025-04-10', category: 'performance', points: 30, description: '举办传统文化表演活动', from: '0x9012...3456', fromName: '文化爱好者小钱', evidence: 'https://example.com/performance/567', transaction: '0xghij...3456' },
    { id: 10, date: '2025-04-05', category: 'heritage', points: 40, description: '记录并分享非物质文化遗产', from: '0x3456...9012', fromName: '文化传播者小周', evidence: 'https://example.com/heritage/890', transaction: '0xklmn...7890' },
    { id: 11, date: '2025-04-01', category: 'cuisine', points: 25, description: '分享传统美食制作技艺', from: '0x7890...1234', fromName: '美食文化专家小吴', evidence: 'https://example.com/cuisine/123', transaction: '0xopqr...1234' },
    { id: 12, date: '2025-03-25', category: 'festival', points: 35, description: '组织传统节日庆祝活动', from: '0x1234...7890', fromName: '节日文化研究者小郑', evidence: 'https://example.com/festival/456', transaction: '0xstuv...5678' }
  ];
  
  const mockLeaderboard = [
    { rank: 1, address: '0x1234...5678', name: '文化守护者小王', score: 3750, level: '文化守护者', avatar: 'https://i.pravatar.cc/150?img=1', topCategory: 'knowledge', contributions: 45 },
    { rank: 2, address: '0x8765...4321', name: '传统艺术家小李', score: 2890, level: '文化守护者', avatar: 'https://i.pravatar.cc/150?img=2', topCategory: 'creation', contributions: 38 },
    { rank: 3, address: '0x5678...1234', name: '语言学者小张', score: 2340, level: '文化大师', avatar: 'https://i.pravatar.cc/150?img=3', topCategory: 'education', contributions: 32 },
    { rank: 4, address: '0x4321...8765', name: '民俗收藏家小陈', score: 1980, level: '文化大师', avatar: 'https://i.pravatar.cc/150?img=4', topCategory: 'preservation', contributions: 29 },
    { rank: 5, address: '0x2468...1357', name: '文化教育家小林', score: 1750, level: '文化大师', avatar: 'https://i.pravatar.cc/150?img=5', topCategory: 'education', contributions: 27 },
    { rank: 6, address: '0x1357...2468', name: '跨文化交流者小刘', score: 1520, level: '文化大师', avatar: 'https://i.pravatar.cc/150?img=6', topCategory: 'exchange', contributions: 25 },
    { rank: 7, address: '0x3690...1478', name: '传统音乐家小赵', score: 1340, level: '文化大师', avatar: 'https://i.pravatar.cc/150?img=7', topCategory: 'creation', contributions: 22 },
    { rank: 8, address: '0x1478...3690', name: '文化研究者小孙', score: 980, level: '文化使者', avatar: 'https://i.pravatar.cc/150?img=8', topCategory: 'research', contributions: 18 },
    { rank: 9, address: '0x9012...3456', name: '文化爱好者小钱', score: 780, level: '文化使者', avatar: 'https://i.pravatar.cc/150?img=9', topCategory: 'performance', contributions: 15 },
    { rank: 10, address: '0x3456...9012', name: '文化传播者小周', score: 650, level: '文化使者', avatar: 'https://i.pravatar.cc/150?img=10', topCategory: 'heritage', contributions: 12 },
    { rank: 11, address: '0x7890...1234', name: '美食文化专家小吴', score: 580, level: '文化使者', avatar: 'https://i.pravatar.cc/150?img=11', topCategory: 'cuisine', contributions: 10 },
    { rank: 12, address: '0x1234...7890', name: '节日文化研究者小郑', score: 520, level: '文化使者', avatar: 'https://i.pravatar.cc/150?img=12', topCategory: 'festival', contributions: 9 },
    { rank: 13, address: '0x5678...9012', name: '传统工艺师小马', score: 480, level: '文化爱好者', avatar: 'https://i.pravatar.cc/150?img=13', topCategory: 'creation', contributions: 8 },
    { rank: 14, address: '0x9012...5678', name: '文化记录者小黄', score: 420, level: '文化爱好者', avatar: 'https://i.pravatar.cc/150?img=14', topCategory: 'preservation', contributions: 7 },
    { rank: 15, address: '0x3456...1234', name: '民间故事收集者小杨', score: 380, level: '文化爱好者', avatar: 'https://i.pravatar.cc/150?img=15', topCategory: 'knowledge', contributions: 6 }
  ];

  // 模拟用户贡献数据
  const mockUserContributions = [
    { category: 'knowledge', count: 12, totalPoints: 240 },
    { category: 'creation', count: 8, totalPoints: 320 },
    { category: 'preservation', count: 5, totalPoints: 125 },
    { category: 'education', count: 7, totalPoints: 210 },
    { category: 'exchange', count: 10, totalPoints: 250 },
    { category: 'translation', count: 4, totalPoints: 80 },
    { category: 'curation', count: 3, totalPoints: 60 },
    { category: 'research', count: 6, totalPoints: 180 },
    { category: 'performance', count: 2, totalPoints: 60 },
    { category: 'heritage', count: 3, totalPoints: 90 },
    { category: 'cuisine', count: 1, totalPoints: 25 },
    { category: 'festival', count: 2, totalPoints: 70 }
  ];

  // 模拟最近背书数据
  const mockRecentEndorsements = [
    { id: 1, date: '2025-05-22', from: '0x1234...5678', fromName: '文化守护者小王', category: 'knowledge', points: 15, description: '分享了有深度的文化分析文章' },
    { id: 2, date: '2025-05-21', from: '0x8765...4321', fromName: '传统艺术家小李', category: 'creation', points: 20, description: '创作的传统音乐作品非常出色' },
    { id: 3, date: '2025-05-20', from: '0x5678...1234', fromName: '语言学者小张', category: 'education', points: 10, description: '提供的语言学习资源很有帮助' }
  ];

  // 模拟声誉里程碑数据
  const generateMockMilestones = (score) => {
    return milestonesDefinition.map(milestone => {
      const achieved = score >= milestone.score;
      const nextToAchieve = !achieved && score > 0 && score < milestone.score;
      const progress = achieved ? 100 : (score / milestone.score) * 100;
      
      return {
        ...milestone,
        achieved,
        nextToAchieve,
        progress: Math.min(100, progress),
        achievedDate: achieved ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
      };
    });
  };

  // 模拟声誉增长数据
  const generateMockGrowthData = (range) => {
    let data = [];
    let currentDate = new Date();
    let points = 0;
    
    if (range === 'week') {
      // 过去7天的数据
      for (let i = 6; i >= 0; i--) {
        let date = new Date();
        date.setDate(currentDate.getDate() - i);
        let dailyPoints = Math.floor(Math.random() * 30) + 5;
        points += dailyPoints;
        data.push({
          date: date.toISOString().split('T')[0],
          points: points,
          dailyIncrease: dailyPoints
        });
      }
    } else if (range === 'month') {
      // 过去30天的数据
      for (let i = 29; i >= 0; i--) {
        let date = new Date();
        date.setDate(currentDate.getDate() - i);
        let dailyPoints = Math.floor(Math.random() * 20) + 3;
        points += dailyPoints;
        data.push({
          date: date.toISOString().split('T')[0],
          points: points,
          dailyIncrease: dailyPoints
        });
      }
    } else if (range === 'year') {
      // 过去12个月的数据
      for (let i = 11; i >= 0; i--) {
        let date = new Date();
        date.setMonth(currentDate.getMonth() - i);
        let monthlyPoints = Math.floor(Math.random() * 150) + 50;
        points += monthlyPoints;
        data.push({
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          points: points,
          monthlyIncrease: monthlyPoints
        });
      }
    }
    
    return data;
  };

  // 初始化数据
  useEffect(() => {
    if (isConnected && account) {
      fetchReputationData();
    }
  }, [isConnected, account]);

  // 过滤和排序声誉历史
  useEffect(() => {
    if (!reputationHistory.length) return;
    
    let filtered = [...reputationHistory];
    
    // 应用类别过滤
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    // 应用排序
    filtered.sort((a, b) => {
      if (sortOption === 'date') {
        return sortDirection === 'desc' 
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      } else if (sortOption === 'points') {
        return sortDirection === 'desc' 
          ? b.points - a.points
          : a.points - b.points;
      } else if (sortOption === 'category') {
        const catA = getCategoryLabel(a.category);
        const catB = getCategoryLabel(b.category);
        return sortDirection === 'desc'
          ? catB.localeCompare(catA)
          : catA.localeCompare(catB);
      }
      return 0;
    });
    
    setFilteredHistory(filtered);
  }, [reputationHistory, filterCategory, sortOption, sortDirection]);

  // 获取声誉数据
  const fetchReputationData = async () => {
    setIsLoading(true);
    try {
      // 模拟从区块链获取数据
      // 实际应用中应调用智能合约
      setTimeout(() => {
        const mockScore = 780;
        setReputationScore(mockScore);
        
        // 设置声誉等级
        const level = reputationLevels.find(
          level => mockScore >= level.minScore && mockScore <= level.maxScore
        );
        setReputationLevel(level.level);
        
        // 计算下一级所需分数和进度
        const nextLevel = reputationLevels.find(
          l => mockScore < l.minScore
        );
        
        if (nextLevel) {
          setNextLevelScore(nextLevel.minScore);
          setCurrentLevelScore(level.minScore);
          const progress = ((mockScore - level.minScore) / (nextLevel.minScore - level.minScore)) * 100;
          setProgressPercent(progress);
        } else {
          // 已是最高级
          setNextLevelScore(level.maxScore);
          setCurrentLevelScore(level.minScore);
          const progress = ((mockScore - level.minScore) / (level.maxScore - level.minScore)) * 100;
          setProgressPercent(progress);
        }
        
        // 设置声誉历史
        setReputationHistory(mockReputationHistory);
        setFilteredHistory(mockReputationHistory);
        
        // 设置排行榜
        setLeaderboard(mockLeaderboard);
        
        // 设置用户贡献
        setUserContributions(mockUserContributions);
        
        // 计算贡献统计
        const stats = {
          totalContributions: mockUserContributions.reduce((sum, item) => sum + item.count, 0),
          totalPoints: mockUserContributions.reduce((sum, item) => sum + item.totalPoints, 0),
          topCategory: mockUserContributions.sort((a, b) => b.totalPoints - a.totalPoints)[0].category,
          categoriesCount: mockUserContributions.length,
          avgPointsPerContribution: Math.round(
            mockUserContributions.reduce((sum, item) => sum + item.totalPoints, 0) / 
            mockUserContributions.reduce((sum, item) => sum + item.count, 0)
          )
        };
        setContributionStats(stats);
        
        // 设置声誉增长数据
        setReputationGrowth(generateMockGrowthData('month'));
        
        // 设置奖励
        const allRewards = rewardDefinitions.map(reward => ({
          ...reward,
          isUnlocked: mockScore >= reward.requiredScore,
          isClaimed: mockScore >= reward.requiredScore && Math.random() > 0.3,
          progress: Math.min(100, (mockScore / reward.requiredScore) * 100)
        }));
        
        setRewards(allRewards);
        setUnlockedRewards(allRewards.filter(reward => reward.isUnlocked));
        
        // 设置最近背书
        setRecentEndorsements(mockRecentEndorsements);
        
        // 设置声誉里程碑
        const milestones = generateMockMilestones(mockScore);
        setReputationMilestones(milestones);
        
        // 设置下一个里程碑
        const nextMilestone = milestones.find(m => !m.achieved);
        if (nextMilestone) {
          setNextMilestone(nextMilestone);
          setMilestoneProgress(nextMilestone.progress);
        }
        
        // 动画效果
        setAnimateScore(true);
        setTimeout(() => setAnimateScore(false), 1500);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取声誉数据失败:', error);
      setErrorMessage('获取声誉数据失败，请稍后再试');
      setIsLoading(false);
    }
  };

  // 更新声誉增长数据
  useEffect(() => {
    setReputationGrowth(generateMockGrowthData(timeRange));
  }, [timeRange]);

  // 为其他用户背书
  const handleEndorse = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!endorseAddress) {
      setErrorMessage('请输入要背书的用户地址');
      return;
    }
    
    if (!ethers.utils.isAddress(endorseAddress)) {
      setErrorMessage('请输入有效的以太坊地址');
      return;
    }
    
    if (endorseAddress.toLowerCase() === account.toLowerCase()) {
      setErrorMessage('不能为自己背书');
      return;
    }
    
    if (!endorseComment) {
      setErrorMessage('请输入背书理由');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // 模拟区块链交互
      // 实际应用中应调用智能合约
      setTimeout(() => {
        setSuccessMessage('背书成功！您的评价将帮助建立更可信的文化社区');
        setEndorseAddress('');
        setEndorseComment('');
        setEndorsePoints(1);
        setIsLoading(false);
        setShowEndorseModal(false);
        
        // 显示通知
        setNotification({
          type: 'success',
          message: '背书成功！您的评价将帮助建立更可信的文化社区'
        });
        setShowNotification(true);
        
        // 3秒后清除通知
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('背书失败:', error);
      setErrorMessage('背书失败，请稍后再试');
      setIsLoading(false);
    }
  };

  // 领取奖励
  const claimReward = (reward) => {
    setIsLoading(true);
    
    // 模拟区块链交互
    setTimeout(() => {
      // 更新奖励状态
      const updatedRewards = rewards.map(r => {
        if (r.id === reward.id) {
          return { ...r, isClaimed: true };
        }
        return r;
      });
      
      setRewards(updatedRewards);
      setUnlockedRewards(updatedRewards.filter(r => r.isUnlocked));
      
      // 显示通知
      setNotification({
        type: 'success',
        message: `成功领取奖励: ${reward.name}`
      });
      setShowNotification(true);
      
      setIsLoading(false);
      setShowRewardModal(false);
      
      // 3秒后清除通知
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }, 1500);
  };

  // 分享声誉档案
  const shareReputationProfile = (method) => {
    const profileUrl = `https://culturebridge.example/reputation/${account}`;
    setShareUrl(profileUrl);
    
    switch (method) {
      case 'qrcode':
        setShowQRCode(true);
        break;
      case 'email':
        window.open(`mailto:?subject=我的文化声誉档案&body=查看我在CultureBridge平台的文化声誉档案：%0A%0A${profileUrl}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(profileUrl)
          .then(() => {
            setNotification({
              type: 'success',
              message: '链接已复制到剪贴板'
            });
            setShowNotification(true);
            
            setTimeout(() => {
              setShowNotification(false);
            }, 3000);
          })
          .catch(err => {
            console.error('复制失败:', err);
            setNotification({
              type: 'error',
              message: '复制失败，请手动复制'
            });
            setShowNotification(true);
            
            setTimeout(() => {
              setShowNotification(false);
            }, 3000);
          });
        break;
      default:
        break;
    }
    
    setShowShareModal(false);
  };

  // 获取类别标签
  const getCategoryLabel = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.label : categoryId;
  };

  // 获取类别图标
  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '📄';
  };

  // 获取类别颜色
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#cccccc';
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  // 渲染声誉概览
  const renderReputationOverview = () => {
    return (
      <div className="reputation-overview">
        <div className="overview-header">
          <div className="score-container">
            <div className="score-label">声誉分数</div>
            <div className={`score-value ${animateScore ? 'animate' : ''}`} ref={scoreRef}>
              {reputationScore}
            </div>
            <div className="level-badge" style={{ backgroundColor: reputationLevels.find(l => l.level === reputationLevel)?.color }}>
              {reputationLevels.find(l => l.level === reputationLevel)?.icon} {reputationLevel}
            </div>
          </div>
          
          <div className="level-progress">
            <div className="progress-label">
              <span>当前等级: {reputationLevel}</span>
              {nextLevelScore !== Infinity && (
                <span>下一等级: {reputationLevels.find(l => l.minScore === nextLevelScore)?.level}</span>
              )}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: reputationLevels.find(l => l.level === reputationLevel)?.color 
                }}
              ></div>
            </div>
            <div className="progress-values">
              <span>{currentLevelScore}</span>
              <span className="current-score">{reputationScore}</span>
              <span>{nextLevelScore}</span>
            </div>
          </div>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{contributionStats.totalContributions || 0}</div>
            <div className="stat-label">总贡献次数</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{contributionStats.categoriesCount || 0}</div>
            <div className="stat-label">贡献类别数</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{contributionStats.avgPointsPerContribution || 0}</div>
            <div className="stat-label">平均每次贡献分</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">{getCategoryIcon(contributionStats.topCategory)}</div>
            <div className="stat-value">{getCategoryLabel(contributionStats.topCategory)}</div>
            <div className="stat-label">最强类别</div>
          </div>
        </div>
        
        {nextMilestone && (
          <div className="next-milestone">
            <div className="milestone-header">
              <h4>下一个里程碑: {nextMilestone.name}</h4>
              <div className="milestone-description">{nextMilestone.description}</div>
            </div>
            <div className="milestone-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${milestoneProgress}%` }}
                ></div>
              </div>
              <div className="progress-values">
                <span>{reputationScore} / {nextMilestone.score}</span>
                <span>{Math.round(milestoneProgress)}%</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="action-buttons">
          <button 
            className="action-button share-button"
            onClick={() => setShowShareModal(true)}
          >
            <span className="button-icon">🔗</span>
            分享声誉档案
          </button>
          
          <button 
            className="action-button endorse-button"
            onClick={() => setShowEndorseModal(true)}
          >
            <span className="button-icon">👍</span>
            为他人背书
          </button>
          
          <button 
            className="action-button details-button"
            onClick={() => setShowReputationDetails(true)}
          >
            <span className="button-icon">📋</span>
            查看详细数据
          </button>
        </div>
        
        {recentEndorsements.length > 0 && (
          <div className="recent-endorsements">
            <h4>最近收到的背书</h4>
            <div className="endorsements-list">
              {recentEndorsements.map(endorsement => (
                <div key={endorsement.id} className="endorsement-item">
                  <div className="endorsement-header">
                    <div className="endorsement-from">
                      <span className="from-name">{endorsement.fromName}</span>
                      <span className="from-address">{endorsement.from}</span>
                    </div>
                    <div className="endorsement-points">+{endorsement.points} 分</div>
                  </div>
                  <div className="endorsement-category" style={{ backgroundColor: getCategoryColor(endorsement.category) }}>
                    {getCategoryIcon(endorsement.category)} {getCategoryLabel(endorsement.category)}
                  </div>
                  <div className="endorsement-description">{endorsement.description}</div>
                  <div className="endorsement-date">{formatDate(endorsement.date)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染声誉历史记录
  const renderReputationHistory = () => {
    if (filteredHistory.length === 0) {
      return (
        <div className="empty-state">
          <p>暂无声誉历史记录</p>
        </div>
      );
    }

    const itemsPerPage = 5;
    const maxPage = Math.ceil(filteredHistory.length / itemsPerPage);
    const startIndex = (historyPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredHistory.length);
    const currentItems = filteredHistory.slice(startIndex, endIndex);

    return (
      <div className="reputation-history-container">
        <div className="history-filters">
          <div className="filter-group">
            <label>类别筛选:</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">全部类别</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>排序方式:</label>
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="filter-select"
            >
              <option value="date">按日期</option>
              <option value="points">按分数</option>
              <option value="category">按类别</option>
            </select>
            
            <button 
              className="sort-direction-button" 
              onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            >
              {sortDirection === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>
        
        <div className="reputation-history">
          {currentItems.map(item => (
            <div 
              key={item.id} 
              className={`history-item ${expandedHistoryItem === item.id ? 'expanded' : ''}`}
              onClick={() => setExpandedHistoryItem(expandedHistoryItem === item.id ? null : item.id)}
            >
              <div className="history-date">{formatDate(item.date)}</div>
              <div className="history-content">
                <div className="history-category">
                  <span 
                    className="category-tag"
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  >
                    {getCategoryIcon(item.category)} {getCategoryLabel(item.category)}
                  </span>
                </div>
                <div className="history-description">{item.description}</div>
                <div className="history-points">+{item.points} 声誉值</div>
                <div className="history-from">
                  <span className="label">来自:</span> 
                  <span className="from-name">{item.fromName}</span>
                  <span className="from-address">{item.from}</span>
                </div>
                
                {expandedHistoryItem === item.id && (
                  <div className="history-details">
                    {item.evidence && (
                      <div className="detail-row">
                        <span className="detail-label">证明链接:</span>
                        <a 
                          href={item.evidence} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="detail-value evidence-link"
                        >
                          {item.evidence}
                        </a>
                      </div>
                    )}
                    
                    {item.transaction && (
                      <div className="detail-row">
                        <span className="detail-label">交易哈希:</span>
                        <a 
                          href={`https://etherscan.io/tx/${item.transaction}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="detail-value transaction-link"
                        >
                          {item.transaction}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredHistory.length > itemsPerPage && (
          <div className="pagination">
            <button 
              className="pagination-button"
              disabled={historyPage === 1}
              onClick={() => setHistoryPage(historyPage - 1)}
            >
              上一页
            </button>
            
            <span className="pagination-info">
              第 {historyPage} 页，共 {maxPage} 页
            </span>
            
            <button 
              className="pagination-button"
              disabled={historyPage === maxPage}
              onClick={() => setHistoryPage(historyPage + 1)}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    );
  };

  // 渲染排行榜
  const renderLeaderboard = () => {
    if (leaderboard.length === 0) {
      return (
        <div className="empty-state">
          <p>暂无排行榜数据</p>
        </div>
      );
    }

    const itemsPerPage = 5;
    const filteredLeaderboard = leaderboardFilter === 'all' 
      ? leaderboard 
      : leaderboard.filter(user => {
          const level = reputationLevels.find(l => l.level === user.level);
          return level && level.minScore >= reputationLevels.find(l => l.level === leaderboardFilter)?.minScore;
        });
    
    const maxPage = Math.ceil(filteredLeaderboard.length / itemsPerPage);
    const startIndex = (leaderboardPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredLeaderboard.length);
    const currentItems = filteredLeaderboard.slice(startIndex, endIndex);

    return (
      <div className="leaderboard-container">
        <div className="leaderboard-filters">
          <div className="filter-group">
            <label>等级筛选:</label>
            <select 
              value={leaderboardFilter} 
              onChange={(e) => {
                setLeaderboardFilter(e.target.value);
                setLeaderboardPage(1);
              }}
              className="filter-select"
            >
              <option value="all">全部等级</option>
              {reputationLevels.map(level => (
                <option key={level.level} value={level.level}>
                  {level.icon} {level.level}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>时间范围:</label>
            <select 
              value={leaderboardTimeRange} 
              onChange={(e) => setLeaderboardTimeRange(e.target.value)}
              className="filter-select"
            >
              <option value="all">全部时间</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="year">今年</option>
            </select>
          </div>
        </div>
        
        <div className="leaderboard">
          <div className="leaderboard-header">
            <div className="rank">排名</div>
            <div className="user">用户</div>
            <div className="score">声誉分</div>
            <div className="level">等级</div>
            <div className="contributions">贡献</div>
          </div>
          
          {currentItems.map(user => (
            <div 
              key={user.rank} 
              className={`leaderboard-item ${user.address.toLowerCase() === (account || '').toLowerCase() ? 'current-user' : ''}`}
            >
              <div className="rank">
                {user.rank <= 3 ? (
                  <span className={`rank-badge rank-${user.rank}`}>{user.rank}</span>
                ) : (
                  user.rank
                )}
              </div>
              
              <div className="user">
                {user.avatar && (
                  <div className="user-avatar">
                    <img src={user.avatar} alt={user.name} />
                  </div>
                )}
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-address">{user.address}</div>
                </div>
              </div>
              
              <div className="score">{user.score}</div>
              
              <div className="level">
                <span 
                  className="level-badge"
                  style={{ backgroundColor: reputationLevels.find(l => l.level === user.level)?.color }}
                >
                  {reputationLevels.find(l => l.level === user.level)?.icon} {user.level}
                </span>
              </div>
              
              <div className="contributions">
                <div className="contribution-count">{user.contributions}</div>
                {user.topCategory && (
                  <div 
                    className="top-category"
                    style={{ backgroundColor: getCategoryColor(user.topCategory) }}
                  >
                    {getCategoryIcon(user.topCategory)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredLeaderboard.length > itemsPerPage && (
          <div className="pagination">
            <button 
              className="pagination-button"
              disabled={leaderboardPage === 1}
              onClick={() => setLeaderboardPage(leaderboardPage - 1)}
            >
              上一页
            </button>
            
            <span className="pagination-info">
              第 {leaderboardPage} 页，共 {maxPage} 页
            </span>
            
            <button 
              className="pagination-button"
              disabled={leaderboardPage === maxPage}
              onClick={() => setLeaderboardPage(leaderboardPage + 1)}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    );
  };

  // 渲染贡献分析
  const renderContributionAnalysis = () => {
    if (userContributions.length === 0) {
      return (
        <div className="empty-state">
          <p>暂无贡献数据</p>
        </div>
      );
    }

    // 按总分排序
    const sortedContributions = [...userContributions].sort((a, b) => b.totalPoints - a.totalPoints);
    const displayContributions = showAllCategories ? sortedContributions : sortedContributions.slice(0, 5);
    
    // 计算最高分，用于相对比例
    const maxPoints = Math.max(...sortedContributions.map(c => c.totalPoints));

    return (
      <div className="contribution-analysis">
        <div className="contribution-summary">
          <div className="summary-card">
            <div className="summary-value">{contributionStats.totalContributions}</div>
            <div className="summary-label">总贡献次数</div>
          </div>
          
          <div className="summary-card">
            <div className="summary-value">{contributionStats.totalPoints}</div>
            <div className="summary-label">总获得分数</div>
          </div>
          
          <div className="summary-card">
            <div className="summary-value">{contributionStats.categoriesCount}</div>
            <div className="summary-label">贡献类别数</div>
          </div>
          
          <div className="summary-card">
            <div className="summary-value">{contributionStats.avgPointsPerContribution}</div>
            <div className="summary-label">平均每次分数</div>
          </div>
        </div>
        
        <div className="contribution-chart">
          <h4>类别分布</h4>
          <div className="category-bars">
            {displayContributions.map(contribution => (
              <div key={contribution.category} className="category-bar-container">
                <div className="category-label">
                  <span className="category-icon">{getCategoryIcon(contribution.category)}</span>
                  <span className="category-name">{getCategoryLabel(contribution.category)}</span>
                </div>
                <div className="category-bar-wrapper">
                  <div 
                    className="category-bar" 
                    style={{ 
                      width: `${(contribution.totalPoints / maxPoints) * 100}%`,
                      backgroundColor: getCategoryColor(contribution.category)
                    }}
                  ></div>
                  <span className="category-points">{contribution.totalPoints}分 ({contribution.count}次)</span>
                </div>
              </div>
            ))}
          </div>
          
          {sortedContributions.length > 5 && (
            <button 
              className="show-more-button"
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? '显示更少' : `显示全部 ${sortedContributions.length} 个类别`}
            </button>
          )}
        </div>
        
        <div className="growth-chart">
          <h4>声誉增长趋势</h4>
          <div className="time-range-selector">
            <button 
              className={`range-button ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              周
            </button>
            <button 
              className={`range-button ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              月
            </button>
            <button 
              className={`range-button ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => setTimeRange('year')}
            >
              年
            </button>
          </div>
          
          <div className="chart-container" ref={chartRef}>
            {/* 在实际应用中，这里应该使用图表库如Chart.js或Recharts */}
            <div className="chart-placeholder">
              <div className="chart-info">
                <div className="info-item">
                  <span className="info-label">起始分数:</span>
                  <span className="info-value">0</span>
                </div>
                <div className="info-item">
                  <span className="info-label">当前分数:</span>
                  <span className="info-value">{reputationScore}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">增长率:</span>
                  <span className="info-value">+{timeRange === 'week' ? '18%' : timeRange === 'month' ? '42%' : '156%'}</span>
                </div>
              </div>
              <div className="chart-message">
                声誉增长图表将在这里显示
              </div>
            </div>
          </div>
        </div>
        
        <div className="milestones-section">
          <h4>声誉里程碑</h4>
          <div className="milestones-list">
            {reputationMilestones.map(milestone => (
              <div 
                key={milestone.id} 
                className={`milestone-item ${milestone.achieved ? 'achieved' : ''} ${milestone.nextToAchieve ? 'next' : ''}`}
              >
                <div className="milestone-icon">{milestone.icon}</div>
                <div className="milestone-content">
                  <div className="milestone-header">
                    <div className="milestone-name">{milestone.name}</div>
                    <div className="milestone-score">{milestone.score}分</div>
                  </div>
                  <div className="milestone-description">{milestone.description}</div>
                  <div className="milestone-progress-bar">
                    <div 
                      className="milestone-progress-fill"
                      style={{ width: `${milestone.progress}%` }}
                    ></div>
                  </div>
                  <div className="milestone-status">
                    {milestone.achieved ? (
                      <div className="achieved-status">
                        <span className="achieved-icon">✓</span>
                        <span className="achieved-date">已达成于 {formatDate(milestone.achievedDate)}</span>
                      </div>
                    ) : (
                      <div className="progress-status">
                        <span className="progress-percent">{Math.round(milestone.progress)}%</span>
                        <span className="progress-remaining">还需 {milestone.score - reputationScore} 分</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染奖励
  const renderRewards = () => {
    if (rewards.length === 0) {
      return (
        <div className="empty-state">
          <p>暂无奖励数据</p>
        </div>
      );
    }

    // 按类型和解锁状态分组
    const badgeRewards = rewards.filter(r => r.type === 'badge');
    const featureRewards = rewards.filter(r => r.type === 'feature');
    const tokenRewards = rewards.filter(r => r.type === 'token');
    const nftRewards = rewards.filter(r => r.type === 'nft');
    
    const unlockedCount = rewards.filter(r => r.isUnlocked).length;
    const lockedCount = rewards.length - unlockedCount;
    const claimedCount = rewards.filter(r => r.isClaimed).length;

    return (
      <div className="rewards-container">
        <div className="rewards-summary">
          <div className="summary-card">
            <div className="summary-value">{rewards.length}</div>
            <div className="summary-label">总奖励数</div>
          </div>
          
          <div className="summary-card">
            <div className="summary-value">{unlockedCount}</div>
            <div className="summary-label">已解锁</div>
          </div>
          
          <div className="summary-card">
            <div className="summary-value">{lockedCount}</div>
            <div className="summary-label">待解锁</div>
          </div>
          
          <div className="summary-card">
            <div className="summary-value">{claimedCount}</div>
            <div className="summary-label">已领取</div>
          </div>
        </div>
        
        <div className="rewards-sections">
          {badgeRewards.length > 0 && (
            <div className="rewards-section">
              <h4 className="section-title">徽章奖励</h4>
              <div className="rewards-grid">
                {badgeRewards.map(reward => (
                  <div 
                    key={reward.id} 
                    className={`reward-card ${reward.isUnlocked ? 'unlocked' : 'locked'} ${reward.isClaimed ? 'claimed' : ''}`}
                    onClick={() => {
                      if (reward.isUnlocked && !reward.isClaimed) {
                        setActiveReward(reward);
                        setShowRewardModal(true);
                      }
                    }}
                  >
                    <div className="reward-icon">{reward.icon}</div>
                    <div className="reward-name">{reward.name}</div>
                    <div className="reward-description">{reward.description}</div>
                    <div className="reward-progress-bar">
                      <div 
                        className="reward-progress-fill"
                        style={{ width: `${reward.progress}%` }}
                      ></div>
                    </div>
                    <div className="reward-status">
                      {reward.isUnlocked ? (
                        reward.isClaimed ? (
                          <span className="claimed-status">已领取</span>
                        ) : (
                          <span className="claimable-status">可领取</span>
                        )
                      ) : (
                        <span className="locked-status">
                          需要 {reward.requiredScore} 分 (还差 {reward.requiredScore - reputationScore} 分)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {featureRewards.length > 0 && (
            <div className="rewards-section">
              <h4 className="section-title">功能特权</h4>
              <div className="rewards-grid">
                {featureRewards.map(reward => (
                  <div 
                    key={reward.id} 
                    className={`reward-card ${reward.isUnlocked ? 'unlocked' : 'locked'} ${reward.isClaimed ? 'claimed' : ''}`}
                    onClick={() => {
                      if (reward.isUnlocked && !reward.isClaimed) {
                        setActiveReward(reward);
                        setShowRewardModal(true);
                      }
                    }}
                  >
                    <div className="reward-icon">{reward.icon}</div>
                    <div className="reward-name">{reward.name}</div>
                    <div className="reward-description">{reward.description}</div>
                    <div className="reward-progress-bar">
                      <div 
                        className="reward-progress-fill"
                        style={{ width: `${reward.progress}%` }}
                      ></div>
                    </div>
                    <div className="reward-status">
                      {reward.isUnlocked ? (
                        reward.isClaimed ? (
                          <span className="claimed-status">已激活</span>
                        ) : (
                          <span className="claimable-status">可激活</span>
                        )
                      ) : (
                        <span className="locked-status">
                          需要 {reward.requiredScore} 分 (还差 {reward.requiredScore - reputationScore} 分)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {tokenRewards.length > 0 && (
            <div className="rewards-section">
              <h4 className="section-title">代币奖励</h4>
              <div className="rewards-grid">
                {tokenRewards.map(reward => (
                  <div 
                    key={reward.id} 
                    className={`reward-card ${reward.isUnlocked ? 'unlocked' : 'locked'} ${reward.isClaimed ? 'claimed' : ''}`}
                    onClick={() => {
                      if (reward.isUnlocked && !reward.isClaimed) {
                        setActiveReward(reward);
                        setShowRewardModal(true);
                      }
                    }}
                  >
                    <div className="reward-icon">{reward.icon}</div>
                    <div className="reward-name">{reward.name}</div>
                    <div className="reward-amount">{reward.amount}</div>
                    <div className="reward-description">{reward.description}</div>
                    <div className="reward-progress-bar">
                      <div 
                        className="reward-progress-fill"
                        style={{ width: `${reward.progress}%` }}
                      ></div>
                    </div>
                    <div className="reward-status">
                      {reward.isUnlocked ? (
                        reward.isClaimed ? (
                          <span className="claimed-status">已领取</span>
                        ) : (
                          <span className="claimable-status">可领取</span>
                        )
                      ) : (
                        <span className="locked-status">
                          需要 {reward.requiredScore} 分 (还差 {reward.requiredScore - reputationScore} 分)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {nftRewards.length > 0 && (
            <div className="rewards-section">
              <h4 className="section-title">NFT奖励</h4>
              <div className="rewards-grid">
                {nftRewards.map(reward => (
                  <div 
                    key={reward.id} 
                    className={`reward-card ${reward.isUnlocked ? 'unlocked' : 'locked'} ${reward.isClaimed ? 'claimed' : ''}`}
                    onClick={() => {
                      if (reward.isUnlocked && !reward.isClaimed) {
                        setActiveReward(reward);
                        setShowRewardModal(true);
                      }
                    }}
                  >
                    <div className="reward-icon">{reward.icon}</div>
                    <div className="reward-name">{reward.name}</div>
                    <div className="reward-description">{reward.description}</div>
                    <div className="reward-progress-bar">
                      <div 
                        className="reward-progress-fill"
                        style={{ width: `${reward.progress}%` }}
                      ></div>
                    </div>
                    <div className="reward-status">
                      {reward.isUnlocked ? (
                        reward.isClaimed ? (
                          <span className="claimed-status">已铸造</span>
                        ) : (
                          <span className="claimable-status">可铸造</span>
                        )
                      ) : (
                        <span className="locked-status">
                          需要 {reward.requiredScore} 分 (还差 {reward.requiredScore - reputationScore} 分)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {rewards.length > 12 && !showAllRewards && (
          <button 
            className="show-more-button"
            onClick={() => setShowAllRewards(true)}
          >
            显示全部 {rewards.length} 个奖励
          </button>
        )}
      </div>
    );
  };

  // 渲染背书表单
  const renderEndorseForm = () => {
    return (
      <form className="endorse-form" onSubmit={handleEndorse}>
        <div className="form-group">
          <label htmlFor="endorseAddress">用户地址</label>
          <input
            type="text"
            id="endorseAddress"
            value={endorseAddress}
            onChange={(e) => setEndorseAddress(e.target.value)}
            placeholder="输入以太坊地址 (0x...)"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endorseCategory">贡献类别</label>
          <div className="category-selector">
            {categories.map(category => (
              <div 
                key={category.id}
                className={`category-option ${endorseCategory === category.id ? 'selected' : ''}`}
                onClick={() => setEndorseCategory(category.id)}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-label">{category.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="endorsePoints">声誉分数</label>
          <div className="points-selector">
            <button 
              type="button" 
              className={`point-option ${endorsePoints === 1 ? 'selected' : ''}`}
              onClick={() => setEndorsePoints(1)}
            >
              1分
            </button>
            <button 
              type="button" 
              className={`point-option ${endorsePoints === 2 ? 'selected' : ''}`}
              onClick={() => setEndorsePoints(2)}
            >
              2分
            </button>
            <button 
              type="button" 
              className={`point-option ${endorsePoints === 5 ? 'selected' : ''}`}
              onClick={() => setEndorsePoints(5)}
            >
              5分
            </button>
            <button 
              type="button" 
              className={`point-option ${endorsePoints === 10 ? 'selected' : ''}`}
              onClick={() => setEndorsePoints(10)}
            >
              10分
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="endorseComment">背书理由</label>
          <textarea
            id="endorseComment"
            value={endorseComment}
            onChange={(e) => setEndorseComment(e.target.value)}
            placeholder="请描述该用户的文化贡献..."
            rows={4}
            required
          />
        </div>
        
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => setShowEndorseModal(false)}
          >
            取消
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : '提交背书'}
          </button>
        </div>
      </form>
    );
  };

  // 渲染奖励模态框
  const renderRewardModal = () => {
    if (!activeReward) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-container reward-modal">
          <div className="modal-header">
            <h3>领取奖励</h3>
            <button 
              className="close-button"
              onClick={() => setShowRewardModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <div className="reward-details">
              <div className="reward-icon large">{activeReward.icon}</div>
              <div className="reward-name">{activeReward.name}</div>
              <div className="reward-description">{activeReward.description}</div>
              
              {activeReward.type === 'token' && (
                <div className="reward-amount">{activeReward.amount}</div>
              )}
              
              <div className="reward-requirement">
                需要声誉分数: {activeReward.requiredScore}
              </div>
              
              <div className="reward-status">
                状态: <span className="status-unlocked">已解锁</span>
              </div>
            </div>
            
            <div className="claim-section">
              <p className="claim-info">
                {activeReward.type === 'badge' && '领取此徽章将在您的个人资料中显示此成就。'}
                {activeReward.type === 'feature' && '激活此特权将解锁相应的平台功能。'}
                {activeReward.type === 'token' && '领取此奖励将向您的钱包发送相应数量的代币。'}
                {activeReward.type === 'nft' && '铸造此NFT将创建一个独特的数字收藏品并发送到您的钱包。'}
              </p>
              
              <div className="claim-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowRewardModal(false)}
                >
                  取消
                </button>
                <button 
                  className="claim-button"
                  onClick={() => claimReward(activeReward)}
                  disabled={isLoading}
                >
                  {isLoading ? '处理中...' : (
                    activeReward.type === 'badge' ? '领取徽章' :
                    activeReward.type === 'feature' ? '激活特权' :
                    activeReward.type === 'token' ? '领取代币' :
                    activeReward.type === 'nft' ? '铸造NFT' : '领取奖励'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染背书模态框
  const renderEndorseModal = () => {
    return (
      <div className="modal-overlay">
        <div className="modal-container endorse-modal">
          <div className="modal-header">
            <h3>为他人背书</h3>
            <button 
              className="close-button"
              onClick={() => setShowEndorseModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            {renderEndorseForm()}
          </div>
        </div>
      </div>
    );
  };

  // 渲染声誉详情模态框
  const renderReputationDetailsModal = () => {
    return (
      <div className="modal-overlay">
        <div className="modal-container reputation-details-modal">
          <div className="modal-header">
            <h3>声誉详细数据</h3>
            <button 
              className="close-button"
              onClick={() => setShowReputationDetails(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <div className="details-section">
              <h4>声誉等级</h4>
              <div className="levels-table">
                <div className="table-header">
                  <div className="header-cell">等级</div>
                  <div className="header-cell">最低分数</div>
                  <div className="header-cell">最高分数</div>
                  <div className="header-cell">状态</div>
                </div>
                {reputationLevels.map(level => (
                  <div 
                    key={level.level} 
                    className={`table-row ${level.level === reputationLevel ? 'current-level' : ''}`}
                  >
                    <div className="table-cell level-name">
                      <span className="level-icon">{level.icon}</span>
                      <span>{level.level}</span>
                    </div>
                    <div className="table-cell">{level.minScore}</div>
                    <div className="table-cell">{level.maxScore === Infinity ? '无上限' : level.maxScore}</div>
                    <div className="table-cell">
                      {reputationScore >= level.minScore && reputationScore <= level.maxScore ? (
                        <span className="current-status">当前</span>
                      ) : reputationScore > level.maxScore ? (
                        <span className="achieved-status">已达成</span>
                      ) : (
                        <span className="future-status">未达成</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="details-section">
              <h4>声誉来源分布</h4>
              <div className="sources-chart">
                <div className="source-item">
                  <div className="source-label">他人背书</div>
                  <div className="source-bar-wrapper">
                    <div className="source-bar" style={{ width: '65%' }}></div>
                    <span className="source-value">65%</span>
                  </div>
                </div>
                <div className="source-item">
                  <div className="source-label">内容创作</div>
                  <div className="source-bar-wrapper">
                    <div className="source-bar" style={{ width: '20%' }}></div>
                    <span className="source-value">20%</span>
                  </div>
                </div>
                <div className="source-item">
                  <div className="source-label">社区活动</div>
                  <div className="source-bar-wrapper">
                    <div className="source-bar" style={{ width: '10%' }}></div>
                    <span className="source-value">10%</span>
                  </div>
                </div>
                <div className="source-item">
                  <div className="source-label">治理参与</div>
                  <div className="source-bar-wrapper">
                    <div className="source-bar" style={{ width: '5%' }}></div>
                    <span className="source-value">5%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="details-section">
              <h4>声誉统计</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">总声誉分</div>
                  <div className="stat-value">{reputationScore}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">贡献次数</div>
                  <div className="stat-value">{contributionStats.totalContributions}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">贡献类别</div>
                  <div className="stat-value">{contributionStats.categoriesCount}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">平均每次分数</div>
                  <div className="stat-value">{contributionStats.avgPointsPerContribution}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">最高单次分数</div>
                  <div className="stat-value">50</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">排行榜排名</div>
                  <div className="stat-value">#9</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">已解锁奖励</div>
                  <div className="stat-value">{unlockedRewards.length}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">已达成里程碑</div>
                  <div className="stat-value">{reputationMilestones.filter(m => m.achieved).length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染分享模态框
  const renderShareModal = () => {
    return (
      <div className="modal-overlay">
        <div className="modal-container share-modal">
          <div className="modal-header">
            <h3>分享声誉档案</h3>
            <button 
              className="close-button"
              onClick={() => setShowShareModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <div className="share-options">
              <button 
                className="share-option"
                onClick={() => shareReputationProfile('qrcode')}
              >
                <div className="option-icon">📱</div>
                <div className="option-label">二维码</div>
              </button>
              
              <button 
                className="share-option"
                onClick={() => shareReputationProfile('email')}
              >
                <div className="option-icon">📧</div>
                <div className="option-label">电子邮件</div>
              </button>
              
              <button 
                className="share-option"
                onClick={() => shareReputationProfile('copy')}
              >
                <div className="option-icon">📋</div>
                <div className="option-label">复制链接</div>
              </button>
            </div>
            
            {showQRCode && (
              <div className="qrcode-container">
                <div className="qrcode-placeholder">
                  <div className="qrcode-message">
                    二维码将在这里显示
                  </div>
                </div>
                <button 
                  className="close-qrcode"
                  onClick={() => setShowQRCode(false)}
                >
                  关闭
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染通知
  const renderNotification = () => {
    if (!showNotification) return null;
    
    return (
      <div className={`notification ${notification.type}`}>
        <div className="notification-icon">
          {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
        </div>
        <div className="notification-message">{notification.message}</div>
      </div>
    );
  };

  // 主渲染函数
  return (
    <div className="cultural-reputation-system">
      {!isConnected ? (
        <div className="connect-wallet-prompt">
          <h3>连接钱包以查看您的文化声誉</h3>
          <p>您需要连接以太坊钱包来访问文化声誉系统的功能。</p>
          <button 
            className="connect-button"
            onClick={connectWallet}
          >
            连接钱包
          </button>
        </div>
      ) : (
        <>
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              声誉概览
            </button>
            <button 
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              声誉历史
            </button>
            <button 
              className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              声誉排行榜
            </button>
            <button 
              className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
            >
              贡献分析
            </button>
            <button 
              className={`tab-button ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => setActiveTab('rewards')}
            >
              声誉奖励
            </button>
          </div>
          
          <div className="tab-content">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>加载中，请稍候...</p>
              </div>
            ) : (
              <>
                {activeTab === 'profile' && renderReputationOverview()}
                {activeTab === 'history' && renderReputationHistory()}
                {activeTab === 'leaderboard' && renderLeaderboard()}
                {activeTab === 'analysis' && renderContributionAnalysis()}
                {activeTab === 'rewards' && renderRewards()}
              </>
            )}
          </div>
          
          {showEndorseModal && renderEndorseModal()}
          {showRewardModal && renderRewardModal()}
          {showReputationDetails && renderReputationDetailsModal()}
          {showShareModal && renderShareModal()}
          {renderNotification()}
        </>
      )}
    </div>
  );
};

export default CulturalReputationSystem;
