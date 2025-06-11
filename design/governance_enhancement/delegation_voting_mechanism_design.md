# 委托投票机制设计规范

## 设计概述

委托投票机制是CultureBridge DAO治理系统的核心功能之一，允许代币持有者将其投票权委托给信任的代表，从而提高治理参与度和决策效率。该机制旨在解决传统DAO治理中的低参与率问题，同时保持去中心化的治理原则。

## 设计原则

### 1. 信任与透明
- 提供详细的代表信息和历史记录
- 实时显示委托状态和投票行为
- 确保委托过程的透明度和可追溯性
- 支持委托权限的精细化控制

### 2. 灵活性与控制
- 支持部分委托和全权委托
- 允许随时撤销或修改委托
- 提供委托期限设置
- 支持按提案类型的差异化委托

### 3. 用户体验优化
- 简化委托流程和界面
- 提供智能推荐和匹配
- 实时反馈和状态更新
- 移动端友好的交互设计

## 核心功能架构

### 1. 委托类型定义

#### 全权委托 (Full Delegation)
```javascript
const fullDelegation = {
  type: 'full',
  delegator: '0x...', // 委托人地址
  delegate: '0x...', // 代表地址
  votingPower: 1000, // 委托的投票权重
  startTime: 1640995200, // 委托开始时间
  endTime: null, // 永久委托
  scope: 'all', // 适用于所有提案
  status: 'active',
  transactionHash: '0x...',
  createdAt: '2024-01-01T00:00:00Z'
};
```

#### 部分委托 (Partial Delegation)
```javascript
const partialDelegation = {
  type: 'partial',
  delegator: '0x...',
  delegate: '0x...',
  votingPower: 500, // 委托部分投票权
  percentage: 50, // 委托50%的投票权
  startTime: 1640995200,
  endTime: 1672531200, // 有期限委托
  scope: ['funding', 'technical'], // 仅适用于特定类型提案
  conditions: {
    maxProposalValue: 10000, // 最大提案金额限制
    requiresApproval: true, // 需要委托人确认
    autoRevoke: false
  },
  status: 'active'
};
```

#### 条件委托 (Conditional Delegation)
```javascript
const conditionalDelegation = {
  type: 'conditional',
  delegator: '0x...',
  delegate: '0x...',
  votingPower: 750,
  conditions: {
    proposalTypes: ['governance', 'partnership'],
    maxDuration: 30 * 24 * 60 * 60, // 30天
    minQuorum: 0.1, // 最小参与率要求
    delegatePerformance: {
      minParticipationRate: 0.8, // 最低参与率80%
      maxOppositionRate: 0.3 // 最大反对率30%
    }
  },
  autoRevoke: {
    enabled: true,
    triggers: ['performance_below_threshold', 'inactivity_30_days']
  },
  status: 'active'
};
```

### 2. 代表评级系统

#### 代表档案结构
```javascript
const delegateProfile = {
  address: '0x...',
  identity: {
    name: 'Alice Chen',
    avatar: 'https://...',
    bio: '区块链技术专家，专注于DeFi和NFT领域...',
    website: 'https://alice.dev',
    twitter: '@alice_chen',
    github: 'alice-chen',
    linkedin: 'alice-chen-dev'
  },
  expertise: [
    { area: 'technical', level: 'expert', verified: true },
    { area: 'defi', level: 'advanced', verified: true },
    { area: 'nft', level: 'intermediate', verified: false }
  ],
  statistics: {
    totalDelegations: 150,
    totalVotingPower: 50000,
    participationRate: 0.92,
    averageResponseTime: 2.5, // hours
    agreementRate: 0.78, // 与社区共识的一致性
    performanceScore: 8.7 // 综合评分
  },
  votingHistory: [
    {
      proposalId: 'prop-001',
      vote: 'for',
      timestamp: 1640995200,
      reasoning: '支持该提案的技术架构设计...'
    }
  ],
  delegationHistory: {
    totalReceived: 200,
    currentActive: 150,
    averageDuration: 45, // days
    retentionRate: 0.85
  },
  verification: {
    identity: true,
    expertise: true,
    reputation: 'high',
    badges: ['early_adopter', 'technical_expert', 'active_participant']
  }
};
```

#### 评级算法
```javascript
const delegateRatingSystem = {
  // 计算综合评分
  calculateOverallRating: (delegate) => {
    const weights = {
      participation: 0.3,
      performance: 0.25,
      expertise: 0.2,
      community: 0.15,
      reliability: 0.1
    };
    
    const scores = {
      participation: calculateParticipationScore(delegate),
      performance: calculatePerformanceScore(delegate),
      expertise: calculateExpertiseScore(delegate),
      community: calculateCommunityScore(delegate),
      reliability: calculateReliabilityScore(delegate)
    };
    
    return Object.keys(weights).reduce((total, key) => {
      return total + (scores[key] * weights[key]);
    }, 0);
  },
  
  // 参与度评分
  calculateParticipationScore: (delegate) => {
    const { participationRate, averageResponseTime } = delegate.statistics;
    const timeScore = Math.max(0, 10 - (averageResponseTime / 24) * 2);
    return (participationRate * 7 + timeScore * 0.3) * 10;
  },
  
  // 表现评分
  calculatePerformanceScore: (delegate) => {
    const { agreementRate, performanceScore } = delegate.statistics;
    const consistencyBonus = agreementRate > 0.7 ? 1 : 0.8;
    return performanceScore * consistencyBonus;
  },
  
  // 专业度评分
  calculateExpertiseScore: (delegate) => {
    const expertisePoints = delegate.expertise.reduce((total, exp) => {
      const levelPoints = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
      const verificationBonus = exp.verified ? 1.2 : 1;
      return total + (levelPoints[exp.level] * verificationBonus);
    }, 0);
    
    return Math.min(10, expertisePoints);
  }
};
```

### 3. 智能匹配系统

#### 匹配算法
```javascript
const delegateMatchingSystem = {
  // 为用户推荐合适的代表
  findMatchingDelegates: (userProfile, preferences) => {
    const allDelegates = getAllDelegates();
    
    return allDelegates
      .map(delegate => ({
        delegate,
        score: calculateMatchScore(userProfile, preferences, delegate)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  },
  
  // 计算匹配分数
  calculateMatchScore: (userProfile, preferences, delegate) => {
    let score = 0;
    
    // 专业领域匹配
    const expertiseMatch = calculateExpertiseMatch(
      userProfile.interests,
      delegate.expertise
    );
    score += expertiseMatch * 0.3;
    
    // 投票历史匹配
    const votingMatch = calculateVotingAlignment(
      userProfile.votingHistory,
      delegate.votingHistory
    );
    score += votingMatch * 0.25;
    
    // 性能指标匹配
    const performanceMatch = evaluatePerformance(
      preferences.performance,
      delegate.statistics
    );
    score += performanceMatch * 0.2;
    
    // 地理和时区匹配
    const locationMatch = calculateLocationMatch(
      userProfile.timezone,
      delegate.timezone
    );
    score += locationMatch * 0.1;
    
    // 社区声誉匹配
    const reputationMatch = evaluateReputation(
      preferences.reputation,
      delegate.verification
    );
    score += reputationMatch * 0.15;
    
    return Math.min(100, score);
  },
  
  // 专业领域匹配度计算
  calculateExpertiseMatch: (userInterests, delegateExpertise) => {
    const matches = userInterests.filter(interest =>
      delegateExpertise.some(exp => 
        exp.area === interest && exp.level !== 'beginner'
      )
    );
    
    return (matches.length / userInterests.length) * 100;
  }
};
```

## UI/UX设计规范

### 1. 委托仪表板 (Delegation Dashboard)

#### 视觉设计
```css
.delegation-dashboard {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.dashboard-header {
  background: white;
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dashboard-title {
  font-size: 36px;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dashboard-subtitle {
  font-size: 18px;
  color: #718096;
  margin-bottom: 24px;
}

.voting-power-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.power-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.power-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.power-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.power-card:hover::before {
  opacity: 1;
}

.power-value {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.power-label {
  font-size: 14px;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.power-change {
  font-size: 12px;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 600;
}

.power-change.positive {
  color: #38a169;
  background: #f0fff4;
}

.power-change.negative {
  color: #e53e3e;
  background: #fff5f5;
}

.delegation-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.action-button {
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.action-button.secondary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.action-button.secondary:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.action-button:hover::before {
  left: 100%;
}
```

#### 功能特性
- 投票权概览和分配状态
- 当前委托列表和管理
- 快速委托和撤销操作
- 委托历史和统计分析

### 2. 代表发现页面 (Delegate Discovery)

#### 视觉设计
```css
.delegate-discovery {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.discovery-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.discovery-title {
  font-size: 42px;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.discovery-subtitle {
  font-size: 20px;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.discovery-filters {
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-label {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-option {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.filter-option:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.filter-option.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.delegate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.delegate-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.delegate-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.delegate-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.delegate-card:hover::before {
  opacity: 1;
}

.delegate-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.delegate-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e2e8f0;
  transition: all 0.3s ease;
}

.delegate-card:hover .delegate-avatar {
  border-color: #667eea;
  transform: scale(1.05);
}

.delegate-info {
  flex: 1;
}

.delegate-name {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.delegate-card:hover .delegate-name {
  color: #667eea;
}

.delegate-title {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.delegate-badges {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.delegate-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-verified {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.badge-expert {
  background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
  color: white;
}

.badge-active {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
}

.delegate-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.delegate-card:hover .stat-item {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.2);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.delegate-expertise {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.expertise-title {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 12px;
}

.expertise-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.expertise-tag {
  padding: 6px 12px;
  background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
  color: #4a5568;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.delegate-card:hover .expertise-tag {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  border-color: rgba(102, 126, 234, 0.3);
}

.delegate-actions {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.delegate-button {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.delegate-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.delegate-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.delegate-button.secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.delegate-button.secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}
```

#### 功能特性
- 智能推荐和匹配算法
- 多维度筛选和排序
- 代表详细档案查看
- 一键委托和比较功能

### 3. 委托配置向导 (Delegation Wizard)

#### 视觉设计
```css
.delegation-wizard {
  max-width: 700px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  position: relative;
}

.wizard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.wizard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
  opacity: 0.3;
}

.wizard-content {
  position: relative;
  z-index: 1;
}

.wizard-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.wizard-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 24px;
}

.wizard-progress {
  background: rgba(255, 255, 255, 0.2);
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 16px;
}

.wizard-progress-bar {
  background: white;
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.wizard-steps {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.wizard-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.wizard-step.active,
.wizard-step.completed {
  opacity: 1;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  transition: all 0.3s ease;
}

.wizard-step.active .step-circle {
  background: white;
  color: #667eea;
  transform: scale(1.1);
}

.wizard-step.completed .step-circle {
  background: #48bb78;
  color: white;
}

.step-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.wizard-body {
  padding: 40px;
}

.wizard-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-description {
  font-size: 14px;
  color: #718096;
  margin-bottom: 24px;
  line-height: 1.6;
}

.delegation-type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.delegation-type {
  padding: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  background: white;
  position: relative;
  overflow: hidden;
}

.delegation-type:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.delegation-type.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.delegation-type::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.delegation-type.selected::before {
  opacity: 1;
}

.type-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.type-name {
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 6px;
}

.type-description {
  font-size: 13px;
  color: #718096;
  line-height: 1.4;
}

.power-allocation {
  background: #f7fafc;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
}

.allocation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.allocation-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.allocation-value {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.power-slider {
  margin-bottom: 16px;
}

.slider-track {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.2s ease;
}

.slider-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border: 3px solid #667eea;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.slider-thumb:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.slider-thumb:active {
  cursor: grabbing;
  transform: translateY(-50%) scale(1.2);
}

.allocation-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #718096;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
}

.wizard-nav-button {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wizard-nav-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.wizard-nav-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.wizard-nav-button.secondary {
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.wizard-nav-button.secondary:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.wizard-nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

#### 功能特性
- 分步骤的委托配置流程
- 投票权分配可视化
- 委托条件和限制设置
- 实时预览和确认

## 智能合约集成

### 1. 委托合约接口
```solidity
interface IDelegationManager {
    struct Delegation {
        address delegator;
        address delegate;
        uint256 votingPower;
        uint256 startTime;
        uint256 endTime;
        DelegationType delegationType;
        bytes32[] proposalTypes;
        bool isActive;
    }
    
    enum DelegationType {
        FULL,
        PARTIAL,
        CONDITIONAL
    }
    
    function delegate(
        address _delegate,
        uint256 _votingPower,
        uint256 _duration,
        DelegationType _type,
        bytes32[] calldata _proposalTypes
    ) external;
    
    function revokeDelegation(address _delegate) external;
    
    function getDelegatedVotingPower(address _delegate) external view returns (uint256);
    
    function getDelegations(address _delegator) external view returns (Delegation[] memory);
    
    function canVoteOnProposal(address _voter, bytes32 _proposalId) external view returns (bool, uint256);
}
```

### 2. 前端集成示例
```javascript
const delegationService = {
  // 创建委托
  createDelegation: async (delegateAddress, config) => {
    const contract = getDelegationContract();
    const tx = await contract.delegate(
      delegateAddress,
      config.votingPower,
      config.duration,
      config.type,
      config.proposalTypes
    );
    
    return await tx.wait();
  },
  
  // 撤销委托
  revokeDelegation: async (delegateAddress) => {
    const contract = getDelegationContract();
    const tx = await contract.revokeDelegation(delegateAddress);
    
    return await tx.wait();
  },
  
  // 获取委托状态
  getDelegationStatus: async (userAddress) => {
    const contract = getDelegationContract();
    const delegations = await contract.getDelegations(userAddress);
    
    return delegations.map(delegation => ({
      delegate: delegation.delegate,
      votingPower: delegation.votingPower.toString(),
      startTime: new Date(delegation.startTime * 1000),
      endTime: delegation.endTime > 0 ? new Date(delegation.endTime * 1000) : null,
      type: delegation.delegationType,
      isActive: delegation.isActive
    }));
  }
};
```

## 响应式设计

### 桌面端 (≥1024px)
- 三列布局：侧边栏、主内容、信息面板
- 完整的代表卡片网格显示
- 详细的统计图表和分析

### 平板端 (768px - 1023px)
- 两列布局：主内容和侧边栏
- 代表卡片两列显示
- 简化的统计信息

### 移动端 (<768px)
- 单列布局，垂直滚动
- 代表卡片单列显示
- 底部导航和快速操作

## 性能优化

### 数据加载
- 实现代表信息的懒加载
- 使用虚拟滚动处理大量代表
- 缓存常用的代表数据

### 交互优化
- 使用乐观更新提升响应速度
- 实现离线状态的本地缓存
- 优化动画和过渡效果

### 区块链交互
- 批量处理多个委托操作
- 使用元交易减少Gas费用
- 实现交易状态的实时跟踪

这个设计规范为委托投票机制提供了完整的架构和UI指导，确保能够为DAO成员提供直观、高效的委托投票体验，同时保持系统的安全性和去中心化特性。

