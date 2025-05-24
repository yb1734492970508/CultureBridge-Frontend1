import React, { useState, useEffect, useCallback } from 'react';
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
  
  // 文化类别选项
  const categories = [
    { id: 'knowledge', label: '文化知识分享', icon: '📚' },
    { id: 'creation', label: '文化创作', icon: '🎨' },
    { id: 'preservation', label: '文化保护', icon: '🏛️' },
    { id: 'education', label: '文化教育', icon: '🎓' },
    { id: 'exchange', label: '跨文化交流', icon: '🌍' },
    { id: 'translation', label: '文化翻译', icon: '🔄' },
    { id: 'curation', label: '文化策展', icon: '🖼️' },
    { id: 'research', label: '文化研究', icon: '🔍' }
  ];
  
  // 声誉等级定义
  const reputationLevels = [
    { level: '文化新手', minScore: 0, maxScore: 99, color: '#8E9AAF' },
    { level: '文化爱好者', minScore: 100, maxScore: 499, color: '#6DA34D' },
    { level: '文化使者', minScore: 500, maxScore: 999, color: '#5E60CE' },
    { level: '文化大师', minScore: 1000, maxScore: 2499, color: '#E07A5F' },
    { level: '文化守护者', minScore: 2500, maxScore: 4999, color: '#3D348B' },
    { level: '文化传奇', minScore: 5000, maxScore: Infinity, color: '#F4D35E' }
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
    }
  ];

  // 模拟数据 - 实际应用中应从区块链获取
  const mockReputationHistory = [
    { id: 1, date: '2025-05-20', category: 'knowledge', points: 25, description: '分享关于中国传统节日的深度文章', from: '0x1234...5678' },
    { id: 2, date: '2025-05-15', category: 'creation', points: 50, description: '创作并分享传统音乐作品', from: '0x8765...4321' },
    { id: 3, date: '2025-05-10', category: 'exchange', points: 30, description: '组织线上文化交流活动', from: '0x5678...1234' },
    { id: 4, date: '2025-05-05', category: 'education', points: 40, description: '为社区提供语言学习资源', from: '0x4321...8765' },
    { id: 5, date: '2025-05-01', category: 'preservation', points: 35, description: '参与数字化保存濒危文化项目', from: '0x2468...1357' },
    { id: 6, date: '2025-04-25', category: 'translation', points: 20, description: '翻译重要文化文献', from: '0x1357...2468' },
    { id: 7, date: '2025-04-20', category: 'curation', points: 15, description: '策划线上文化展览', from: '0x3690...1478' },
    { id: 8, date: '2025-04-15', category: 'research', points: 45, description: '发布文化研究报告', from: '0x1478...3690' }
  ];
  
  const mockLeaderboard = [
    { rank: 1, address: '0x1234...5678', name: '文化守护者小王', score: 3750, level: '文化守护者' },
    { rank: 2, address: '0x8765...4321', name: '传统艺术家小李', score: 2890, level: '文化守护者' },
    { rank: 3, address: '0x5678...1234', name: '语言学者小张', score: 2340, level: '文化大师' },
    { rank: 4, address: '0x4321...8765', name: '民俗收藏家小陈', score: 1980, level: '文化大师' },
    { rank: 5, address: '0x2468...1357', name: '文化教育家小林', score: 1750, level: '文化大师' },
    { rank: 6, address: '0x1357...2468', name: '跨文化交流者小刘', score: 1520, level: '文化大师' },
    { rank: 7, address: '0x3690...1478', name: '传统音乐家小赵', score: 1340, level: '文化大师' },
    { rank: 8, address: '0x1478...3690', name: '文化研究者小孙', score: 980, level: '文化使者' },
    { rank: 9, address: '0x9012...3456', name: '文化爱好者小钱', score: 780, level: '文化使者' },
    { rank: 10, address: '0x3456...9012', name: '文化传播者小周', score: 650, level: '文化使者' }
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
    { category: 'research', count: 6, totalPoints: 180 }
  ];

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
        
        // 设置声誉历史
        setReputationHistory(mockReputationHistory);
        
        // 设置排行榜
        setLeaderboard(mockLeaderboard);
        
        // 设置用户贡献
        setUserContributions(mockUserContributions);
        
        // 计算贡献统计
        const stats = {
          totalContributions: mockUserContributions.reduce((sum, item) => sum + item.count, 0),
          totalPoints: mockUserContributions.reduce((sum, item) => sum + item.totalPoints, 0),
          topCategory: mockUserContributions.sort((a, b) => b.totalPoints - a.totalPoints)[0].category
        };
        setContributionStats(stats);
        
        // 设置声誉增长数据
        setReputationGrowth(generateMockGrowthData('month'));
        
        // 设置奖励
        const allRewards = rewardDefinitions.map(reward => ({
          ...reward,
          isUnlocked: mockScore >= reward.requiredScore,
          progress: Math.min(100, (mockScore / reward.requiredScore) * 100)
        }));
        
        setRewards(allRewards);
        setUnlockedRewards(allRewards.filter(reward => reward.isUnlocked));
        
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
        
        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccessMessage('');
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
      
      setSuccessMessage(`成功领取奖励: ${reward.name}`);
      setIsLoading(false);
      setShowRewardModal(false);
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1500);
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

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  // 渲染声誉历史记录
  const renderReputationHistory = () => {
    if (reputationHistory.length === 0) {
      return (
        <div className="empty-state">
          <p>暂无声誉历史记录</p>
        </div>
      );
    }

    return (
      <div className="reputation-history">
        {reputationHistory.map(item => (
          <div key={item.id} className="history-item">
            <div className="history-date">{item.date}</div>
            <div className="history-content">
              <div className="history-category">
                <span className={`category-tag ${item.category}`}>
                  {getCategoryIcon(item.category)} {getCategoryLabel(item.category)}
                </span>
              </div>
              <div className="history-description">{item.description}</div>
              <div className="history-points">+{item.points} 声誉值</div>
              <div className="history-from">
                <span className="label">来自:</span> {item.from}
              </div>
            </div>
          </div>
        ))}
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

    return (
      <div className="leaderboard">
        <div className="leaderboard-header">
          <div className="rank">排名</div>
          <div className="user">用户</div>
          <div className="score">声誉分</div>
          <div className="level">等级</div>
        </div>
        {leaderboard.map(user => (
          <div key={user.rank} className={`leaderboard-item ${user.address.toLowerCase() === (account || '').toLowerCase() ? 'current-user' : ''}`}>
            <div className="rank">
              {user.rank <= 3 ? (
                <span className={`rank-badge rank-${user.rank}`}>{user.rank}</span>
              ) : (
                user.rank
              )}
            </div>
            <div className="user">
              <div className="user-name">{user.name}</div>
              <div className="user-address">{user.address}</div>
            </div>
            <div className="score">{user.score}</div>
            <div className="level">{user.level}</div>
          </div>
        ))}
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
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endorseCategory">文化贡献类别</label>
          <select
            id="endorseCategory"
            value={endorseCategory}
            onChange={(e) => setEndorseCategory(e.target.value)}
            disabled={isLoading}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="endorsePoints">声誉点数</label>
          <div className="points-selector">
            {[1, 2, 3, 5, 10].map(point => (
              <button
                key={point}
                type="button"
                className={`point-btn ${endorsePoints === point ? 'active' : ''}`}
                onClick={() => setEndorsePoints(point)}
                disabled={isLoading}
              >
                {point}
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="endorseComment">背书理由</label>
          <textarea
            id="endorseComment"
            value={endorseComment}
            onChange={(e) => setEndorseComment(e.target.value)}
            placeholder="请描述该用户的文化贡献..."
            disabled={isLoading}
            required
          />
        </div>
        
        {errorMessage && (
          <div className="error-message">
            <i className="error-icon">!</i> {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="success-message">
            <i className="success-icon">✓</i> {successMessage}
          </div>
        )}
        
        <button
          type="submit"
          className="endorse-btn"
          disabled={isLoading}
        >
          {isLoading ? '处理中...' : '提交背书'}
        </button>
      </form>
    );
  };

  // 渲染声誉等级进度
  const renderReputationProgress = () => {
    const currentLevel = reputationLevels.find(
      level => reputationScore >= level.minScore && reputationScore <= level.maxScore
    );
    
    const nextLevel = reputationLevels.find(
      level => level.minScore > currentLevel.maxScore
    );
    
    const progress = nextLevel 
      ? ((reputationScore - currentLevel.minScore) / (currentLevel.maxScore - currentLevel.minScore)) * 100
      : 100;
    
    return (
      <div className="reputation-progress">
        <div className="current-level">
          <span className="level-label">当前等级:</span>
          <span className="level-value" style={{ color: currentLevel.color }}>{reputationLevel}</span>
        </div>
        
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: currentLevel.color
            }}
          ></div>
        </div>
        
        <div className="level-info">
          <div className="current-score">
            <span className="score-value">{reputationScore}</span>
            <span className="score-label">声誉值</span>
          </div>
          
          {nextLevel && (
            <div className="next-level">
              <span className="next-level-label">距离 {nextLevel.level} 还需:</span>
              <span className="next-level-value">{nextLevel.minScore - reputationScore} 声誉值</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染用户贡献统计
  const renderContributionStats = () => {
    if (!contributionStats.totalContributions) {
      return (
        <div className="empty-state">
          <p>暂无贡献数据</p>
        </div>
      );
    }

    // 找到顶级类别
    const topCategory = categories.find(cat => cat.id === contributionStats.topCategory);

    return (
      <div className="contribution-stats">
        <div className="stats-summary">
          <div className="stat-item">
            <div className="stat-value">{contributionStats.totalContributions}</div>
            <div className="stat-label">总贡献次数</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{contributionStats.totalPoints}</div>
            <div className="stat-label">总获得声誉值</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {topCategory ? (
                <>
                  {topCategory.icon} {topCategory.label}
                </>
              ) : '未知'}
            </div>
            <div className="stat-label">最活跃领域</div>
          </div>
        </div>

        <div className="contribution-chart">
          <h4>贡献分布</h4>
          <div className="category-bars">
            {userContributions.map(contribution => {
              const category = categories.find(cat => cat.id === contribution.category);
              const percentage = (contribution.totalPoints / contributionStats.totalPoints) * 100;
              
              return (
                <div key={contribution.category} className="category-bar-item">
                  <div className="category-label">
                    {category ? (
                      <>
                        {category.icon} {category.label}
                      </>
                    ) : contribution.category}
                    <span className="category-points">({contribution.totalPoints}分)</span>
                  </div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: `var(--category-${contribution.category}-color, #6DA34D)`
                      }}
                    ></div>
                  </div>
                  <div className="category-percentage">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 渲染声誉增长图表
  const renderReputationGrowth = () => {
    if (!reputationGrowth.length) {
      return (
        <div className="empty-state">
          <p>暂无增长数据</p>
        </div>
      );
    }

    const maxPoints = Math.max(...reputationGrowth.map(item => item.points));
    const chartHeight = 200; // 图表高度

    return (
      <div className="reputation-growth">
        <div className="growth-header">
          <h4>声誉增长趋势</h4>
          <div className="time-range-selector">
            <button 
              className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              周
            </button>
            <button 
              className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              月
            </button>
            <button 
              className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => setTimeRange('year')}
            >
              年
            </button>
          </div>
        </div>

        <div className="growth-chart">
          <div className="chart-y-axis">
            <div className="y-label">{maxPoints}</div>
            <div className="y-label">{Math.floor(maxPoints * 0.75)}</div>
            <div className="y-label">{Math.floor(maxPoints * 0.5)}</div>
            <div className="y-label">{Math.floor(maxPoints * 0.25)}</div>
            <div className="y-label">0</div>
          </div>
          
          <div className="chart-content">
            {reputationGrowth.map((item, index) => {
              const height = (item.points / maxPoints) * chartHeight;
              const label = timeRange === 'year' 
                ? item.date.split('-')[1] 
                : item.date.split('-')[2];
              
              return (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${height}px`,
                      backgroundColor: `var(--reputation-color, #5E60CE)`
                    }}
                    title={`${item.date}: ${item.points}分`}
                  >
                    <div className="bar-tooltip">
                      <div>日期: {item.date}</div>
                      <div>总分: {item.points}</div>
                      <div>
                        {timeRange === 'year' ? '月增: ' : '日增: '}
                        {timeRange === 'year' ? item.monthlyIncrease : item.dailyIncrease}
                      </div>
                    </div>
                  </div>
                  <div className="bar-label">{label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="growth-summary">
          <div className="summary-item">
            <div className="summary-value">
              {timeRange === 'year' 
                ? reputationGrowth[reputationGrowth.length - 1].monthlyIncrease
                : reputationGrowth[reputationGrowth.length - 1].dailyIncrease}
            </div>
            <div className="summary-label">
              {timeRange === 'year' ? '本月增长' : '今日增长'}
            </div>
          </div>
          
          <div className="summary-item">
            <div className="summary-value">
              {reputationGrowth.reduce((sum, item) => 
                sum + (timeRange === 'year' ? item.monthlyIncrease : item.dailyIncrease), 0
              )}
            </div>
            <div className="summary-label">
              {timeRange === 'year' ? '年度总增长' : timeRange === 'month' ? '月度总增长' : '周度总增长'}
            </div>
          </div>
          
          <div className="summary-item">
            <div className="summary-value">
              {(reputationGrowth[reputationGrowth.length - 1].points - reputationGrowth[0].points) / reputationGrowth[0].points * 100 > 0 
                ? '+' 
                : ''}
              {((reputationGrowth[reputationGrowth.length - 1].points - reputationGrowth[0].points) / reputationGrowth[0].points * 100).toFixed(1)}%
            </div>
            <div className="summary-label">增长率</div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染奖励和特权
  const renderRewards = () => {
    if (!rewards.length) {
      return (
        <div className="empty-state">
          <p>暂无奖励数据</p>
        </div>
      );
    }

    // 按类型分组
    const badgeRewards = rewards.filter(reward => reward.type === 'badge');
    const featureRewards = rewards.filter(reward => reward.type === 'feature');
    const tokenRewards = rewards.filter(reward => reward.type === 'token');

    return (
      <div className="rewards-container">
        <div className="rewards-summary">
          <div className="summary-item">
            <div className="summary-value">{unlockedRewards.length}</div>
            <div className="summary-label">已解锁奖励</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{rewards.length - unlockedRewards.length}</div>
            <div className="summary-label">待解锁奖励</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">
              {unlockedRewards.filter(r => r.type === 'token').reduce((sum, r) => {
                const amount = parseInt(r.amount.split(' ')[0]);
                return sum + amount;
              }, 0)} CBT
            </div>
            <div className="summary-label">可获代币</div>
          </div>
        </div>

        <div className="rewards-sections">
          <div className="rewards-section">
            <h4>徽章</h4>
            <div className="rewards-grid">
              {badgeRewards.map(reward => (
                <div 
                  key={reward.id} 
                  className={`reward-item ${reward.isUnlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => {
                    if (reward.isUnlocked) {
                      setActiveReward(reward);
                      setShowRewardModal(true);
                    }
                  }}
                >
                  <div className="reward-icon">{reward.icon}</div>
                  <div className="reward-name">{reward.name}</div>
                  <div className="reward-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${reward.progress}%` }}
                    ></div>
                  </div>
                  <div className="reward-status">
                    {reward.isUnlocked ? (
                      <span className="unlocked-status">已解锁</span>
                    ) : (
                      <span className="required-score">需要 {reward.requiredScore} 分</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rewards-section">
            <h4>功能特权</h4>
            <div className="rewards-grid">
              {featureRewards.map(reward => (
                <div 
                  key={reward.id} 
                  className={`reward-item ${reward.isUnlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => {
                    if (reward.isUnlocked) {
                      setActiveReward(reward);
                      setShowRewardModal(true);
                    }
                  }}
                >
                  <div className="reward-icon">{reward.icon}</div>
                  <div className="reward-name">{reward.name}</div>
                  <div className="reward-description">{reward.description}</div>
                  <div className="reward-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${reward.progress}%` }}
                    ></div>
                  </div>
                  <div className="reward-status">
                    {reward.isUnlocked ? (
                      <span className="unlocked-status">已解锁</span>
                    ) : (
                      <span className="required-score">需要 {reward.requiredScore} 分</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rewards-section">
            <h4>代币奖励</h4>
            <div className="rewards-grid">
              {tokenRewards.map(reward => (
                <div 
                  key={reward.id} 
                  className={`reward-item ${reward.isUnlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => {
                    if (reward.isUnlocked) {
                      setActiveReward(reward);
                      setShowRewardModal(true);
                    }
                  }}
                >
                  <div className="reward-icon">{reward.icon}</div>
                  <div className="reward-name">{reward.name}</div>
                  <div className="reward-amount">{reward.amount}</div>
                  <div className="reward-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${reward.progress}%` }}
                    ></div>
                  </div>
                  <div className="reward-status">
                    {reward.isUnlocked ? (
                      reward.isClaimed ? (
                        <span className="claimed-status">已领取</span>
                      ) : (
                        <span className="unlocked-status">可领取</span>
                      )
                    ) : (
                      <span className="required-score">需要 {reward.requiredScore} 分</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染奖励详情模态框
  const renderRewardModal = () => {
    if (!showRewardModal || !activeReward) return null;

    return (
      <div className="reward-modal-overlay">
        <div className="reward-modal">
          <div className="modal-header">
            <h3>奖励详情</h3>
            <button 
              className="close-button"
              onClick={() => setShowRewardModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <div className="reward-detail-icon">{activeReward.icon}</div>
            <h4 className="reward-detail-name">{activeReward.name}</h4>
            <p className="reward-detail-description">{activeReward.description}</p>
            
            {activeReward.type === 'token' && (
              <div className="reward-detail-amount">
                <span className="amount-label">奖励金额:</span>
                <span className="amount-value">{activeReward.amount}</span>
              </div>
            )}
            
            <div className="reward-detail-requirement">
              <span className="requirement-label">解锁要求:</span>
              <span className="requirement-value">{activeReward.requiredScore} 声誉分</span>
            </div>
            
            <div className="reward-detail-status">
              <span className="status-label">状态:</span>
              <span className={`status-value ${activeReward.isUnlocked ? 'unlocked' : 'locked'}`}>
                {activeReward.isUnlocked ? '已解锁' : '未解锁'}
              </span>
            </div>
            
            {activeReward.type === 'token' && activeReward.isUnlocked && !activeReward.isClaimed && (
              <div className="reward-claim-section">
                <p className="claim-note">
                  领取此奖励将向您的钱包发送 {activeReward.amount} 代币。
                  交易将记录在区块链上，需要支付少量gas费用。
                </p>
                
                <button 
                  className="claim-button"
                  onClick={() => claimReward(activeReward)}
                  disabled={isLoading}
                >
                  {isLoading ? '处理中...' : '领取奖励'}
                </button>
              </div>
            )}
            
            {activeReward.type === 'feature' && activeReward.isUnlocked && (
              <div className="feature-activation-section">
                <p className="activation-note">
                  此特权已解锁，您可以立即使用相关功能。
                </p>
                
                <button 
                  className="activation-button"
                  onClick={() => {
                    setShowRewardModal(false);
                    // 这里可以添加导航到相关功能的逻辑
                  }}
                >
                  前往使用
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染声誉系统说明
  const renderReputationInfo = () => {
    return (
      <div className="reputation-info">
        <h3>文化声誉系统说明</h3>
        
        <div className="info-section">
          <h4>什么是文化声誉?</h4>
          <p>
            文化声誉是CultureBridge平台上衡量用户文化贡献和参与度的指标。
            它基于区块链技术，确保透明、不可篡改，并由社区共同维护。
          </p>
        </div>
        
        <div className="info-section">
          <h4>如何获得声誉?</h4>
          <ul>
            <li>分享有价值的文化知识和见解</li>
            <li>创作和分享原创文化作品</li>
            <li>参与文化保护和传承活动</li>
            <li>提供文化教育资源</li>
            <li>促进跨文化交流和理解</li>
            <li>获得其他用户的背书认可</li>
          </ul>
        </div>
        
        <div className="info-section">
          <h4>声誉等级</h4>
          <div className="level-list">
            {reputationLevels.map((level, index) => (
              <div key={index} className="level-item" style={{ borderLeftColor: level.color }}>
                <span className="level-name">{level.level}</span>
                <span className="level-range">
                  {level.minScore} - {level.maxScore === Infinity ? '∞' : level.maxScore}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="info-section">
          <h4>声誉的作用</h4>
          <ul>
            <li>提高社区中的可信度和影响力</li>
            <li>解锁特定的平台功能和权限</li>
            <li>参与平台治理和决策</li>
            <li>获得特定活动和资源的优先访问权</li>
            <li>在文化市场中建立信任</li>
            <li>获得代币奖励和其他激励</li>
          </ul>
        </div>
        
        <div className="info-section">
          <h4>声誉与区块链</h4>
          <p>
            CultureBridge的声誉系统基于区块链技术，具有以下特点：
          </p>
          <ul>
            <li><strong>透明性：</strong>所有声誉变动都记录在区块链上，任何人都可以查看</li>
            <li><strong>不可篡改：</strong>一旦记录，声誉历史无法被修改</li>
            <li><strong>去中心化：</strong>声誉系统由社区共同维护，而非单一中心控制</li>
            <li><strong>可验证性：</strong>所有声誉贡献都可以通过区块链进行验证</li>
            <li><strong>跨平台互操作：</strong>声誉可以在不同的兼容平台间共享和使用</li>
          </ul>
        </div>
      </div>
    );
  };

  // 主渲染函数
  return (
    <div className="cultural-reputation-system">
      <div className="reputation-header">
        <h2>文化声誉系统</h2>
        <p className="subtitle">基于区块链的文化贡献认可与信任建立机制</p>
      </div>
      
      {!isConnected ? (
        <div className="connect-wallet-prompt">
          <p>请连接钱包以访问您的文化声誉信息</p>
          <button className="connect-wallet-btn" onClick={connectWallet}>
            连接钱包
          </button>
        </div>
      ) : (
        <>
          <div className="reputation-tabs">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              我的声誉
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              声誉历史
            </button>
            <button
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              贡献统计
            </button>
            <button
              className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => setActiveTab('rewards')}
            >
              奖励特权
            </button>
            <button
              className={`tab-btn ${activeTab === 'endorse' ? 'active' : ''}`}
              onClick={() => setActiveTab('endorse')}
            >
              背书他人
            </button>
            <button
              className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              声誉排行
            </button>
            <button
              className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              系统说明
            </button>
          </div>
          
          <div className="reputation-content">
            {isLoading && !activeTab === 'endorse' ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>加载中...</p>
              </div>
            ) : (
              <>
                {activeTab === 'profile' && (
                  <div className="reputation-profile">
                    <div className="reputation-summary">
                      <div className="reputation-score">
                        <span className="score-value">{reputationScore}</span>
                        <span className="score-label">声誉值</span>
                      </div>
                      <div className="reputation-level">
                        <span className="level-label">等级:</span>
                        <span className="level-value" style={{ color: reputationLevels.find(l => l.level === reputationLevel)?.color }}>
                          {reputationLevel}
                        </span>
                      </div>
                    </div>
                    
                    {renderReputationProgress()}
                    
                    <div className="recent-activity">
                      <h3>最近活动</h3>
                      {reputationHistory.slice(0, 3).map(item => (
                        <div key={item.id} className="activity-item">
                          <div className="activity-icon">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="activity-content">
                            <div className="activity-description">{item.description}</div>
                            <div className="activity-meta">
                              <span className="activity-date">{item.date}</span>
                              <span className="activity-points">+{item.points} 声誉值</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button 
                        className="view-all-button"
                        onClick={() => setActiveTab('history')}
                      >
                        查看全部历史
                      </button>
                    </div>
                    
                    <div className="unlocked-rewards-preview">
                      <h3>已解锁奖励</h3>
                      <div className="rewards-preview">
                        {unlockedRewards.slice(0, 4).map(reward => (
                          <div 
                            key={reward.id} 
                            className="reward-preview-item"
                            onClick={() => {
                              setActiveReward(reward);
                              setShowRewardModal(true);
                            }}
                          >
                            <div className="reward-preview-icon">{reward.icon}</div>
                            <div className="reward-preview-name">{reward.name}</div>
                          </div>
                        ))}
                        {unlockedRewards.length > 4 && (
                          <div 
                            className="more-rewards"
                            onClick={() => setActiveTab('rewards')}
                          >
                            +{unlockedRewards.length - 4} 更多
                          </div>
                        )}
                        {unlockedRewards.length === 0 && (
                          <div className="no-rewards">
                            暂无已解锁奖励
                          </div>
                        )}
                      </div>
                      <button 
                        className="view-all-button"
                        onClick={() => setActiveTab('rewards')}
                      >
                        查看全部奖励
                      </button>
                    </div>
                  </div>
                )}
                
                {activeTab === 'history' && (
                  <div className="history-tab">
                    <h3>声誉历史记录</h3>
                    {renderReputationHistory()}
                  </div>
                )}
                
                {activeTab === 'stats' && (
                  <div className="stats-tab">
                    <h3>贡献统计</h3>
                    {renderContributionStats()}
                    {renderReputationGrowth()}
                  </div>
                )}
                
                {activeTab === 'rewards' && (
                  <div className="rewards-tab">
                    <h3>奖励与特权</h3>
                    {renderRewards()}
                  </div>
                )}
                
                {activeTab === 'endorse' && (
                  <div className="endorse-tab">
                    <h3>为他人背书</h3>
                    <p className="endorse-description">
                      通过背书，您可以认可其他用户的文化贡献，帮助建立更可信的社区。
                      每次背书将消耗您的背书点数，并为被背书用户增加声誉值。
                    </p>
                    {renderEndorseForm()}
                  </div>
                )}
                
                {activeTab === 'leaderboard' && (
                  <div className="leaderboard-tab">
                    <h3>声誉排行榜</h3>
                    {renderLeaderboard()}
                  </div>
                )}
                
                {activeTab === 'info' && (
                  <div className="info-tab">
                    {renderReputationInfo()}
                  </div>
                )}
              </>
            )}
          </div>
          
          {renderRewardModal()}
        </>
      )}
    </div>
  );
};

export default CulturalReputationSystem;
