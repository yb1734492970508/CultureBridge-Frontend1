# Delegation Voting Mechanism Design Specification
# 委托投票机制设计规范

## Design Overview
## 设计概述

The delegation voting mechanism is one of the core functions of the CultureBridge DAO governance system, allowing token holders to delegate their voting rights to trusted representatives, thereby increasing governance participation and decision-making efficiency. This mechanism aims to solve the problem of low participation rates in traditional DAO governance while maintaining decentralized governance principles.
委托投票机制是CultureBridge DAO治理系统的核心功能之一，允许代币持有者将其投票权委托给信任的代表，从而提高治理参与度和决策效率。该机制旨在解决传统DAO治理中的低参与率问题，同时保持去中心化的治理原则。

## Design Principles
## 设计原则

### 1. Trust and Transparency
### 1. 信任与透明
- Provide detailed representative information and historical records
- 提供详细的代表信息和历史记录
- Real-time display of delegation status and voting behavior
- 实时显示委托状态和投票行为
- Ensure transparency and traceability of the delegation process
- 确保委托过程的透明度和可追溯性
- Support fine-grained control of delegation permissions
- 支持委托权限的精细化控制

### 2. Flexibility and Control
### 2. 灵活性与控制
- Support partial delegation and full delegation
- 支持部分委托和全权委托
- Allow revocation or modification of delegation at any time
- 允许随时撤销或修改委托
- Provide delegation period settings
- 提供委托期限设置
- Support differentiated delegation by proposal type
- 支持按提案类型的差异化委托

### 3. User Experience Optimization
### 3. 用户体验优化
- Simplify delegation process and interface
- 简化委托流程和界面
- Provide intelligent recommendations and matching
- 提供智能推荐和匹配
- Real-time feedback and status updates
- 实时反馈和状态更新
- Mobile-friendly interactive design
- 移动端友好的交互设计

## Core Function Architecture
## 核心功能架构

### 1. Delegation Type Definition
### 1. 委托类型定义

#### Full Delegation
#### 全权委托
```javascript
const fullDelegation = {
  type: 'full',
  delegator: '0x...', // Delegator address
  delegator: '0x...', // 委托人地址
  delegate: '0x...', // Delegate address
  delegate: '0x...', // 代表地址
  votingPower: 1000, // Delegated voting weight
  votingPower: 1000, // 委托的投票权重
  startTime: 1640995200, // Delegation start time
  startTime: 1640995200, // 委托开始时间
  endTime: null, // Permanent delegation
  endTime: null, // 永久委托
  scope: 'all', // Applies to all proposals
  scope: 'all', // 适用于所有提案
  status: 'active',
  transactionHash: '0x...', // Transaction hash
  transactionHash: '0x...', // 交易哈希
  createdAt: '2024-01-01T00:00:00Z' // Creation time
  createdAt: '2024-01-01T00:00:00Z' // 创建时间
};
```

#### Partial Delegation
#### 部分委托
```javascript
const partialDelegation = {
  type: 'partial',
  delegator: '0x...', // Delegator address
  delegator: '0x...', // 委托人地址
  delegate: '0x...', // Delegate address
  delegate: '0x...', // 代表地址
  votingPower: 500, // Delegate partial voting power
  votingPower: 500, // 委托部分投票权
  percentage: 50, // Delegate 50% of voting power
  percentage: 50, // 委托50%的投票权
  startTime: 1640995200, // Delegation start time
  startTime: 1640995200, // 委托开始时间
  endTime: 1672531200, // Time-limited delegation
  endTime: 1672531200, // 有期限委托
  scope: ['funding', 'technical'], // Applies only to specific proposal types
  scope: ['funding', 'technical'], // 仅适用于特定类型提案
  conditions: {
    maxProposalValue: 10000, // Maximum proposal amount limit
    maxProposalValue: 10000, // 最大提案金额限制
    requiresApproval: true, // Requires delegator confirmation
    requiresApproval: true, // 需要委托人确认
    autoRevoke: false // Auto revoke
    autoRevoke: false // 自动撤销
  },
  status: 'active'
};
```

#### Conditional Delegation
#### 条件委托
```javascript
const conditionalDelegation = {
  type: 'conditional',
  delegator: '0x...', // Delegator address
  delegator: '0x...', // 委托人地址
  delegate: '0x...', // Delegate address
  delegate: '0x...', // 代表地址
  votingPower: 750, // Delegated voting power
  votingPower: 750, // 委托的投票权重
  conditions: {
    proposalTypes: ['governance', 'partnership'], // Applicable proposal types
    proposalTypes: ['governance', 'partnership'], // 提案类型
    maxDuration: 30 * 24 * 60 * 60, // 30 days
    maxDuration: 30 * 24 * 60 * 60, // 30天
    minQuorum: 0.1, // Minimum participation rate requirement
    minQuorum: 0.1, // 最小参与率要求
    delegatePerformance: {
      minParticipationRate: 0.8, // Minimum participation rate 80%
      minParticipationRate: 0.8, // 最低参与率80%
      maxOppositionRate: 0.3 // Maximum opposition rate 30%
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

### 2. Delegate Rating System
### 2. 代表评级系统

#### Delegate Profile Structure
#### 代表档案结构
```javascript
const delegateProfile = {
  address: '0x...', // Delegate address
  address: '0x...', // 代表地址
  identity: {
    name: 'Alice Chen',
    avatar: 'https://...', // Avatar URL
    avatar: 'https://...', // 头像URL
    bio: 'Blockchain technology expert, focusing on DeFi and NFT fields...', // Bio
    bio: '区块链技术专家，专注于DeFi和NFT领域...', // 个人简介
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
    averageResponseTime: 2.5, // 小时
    agreementRate: 0.78, // Consistency with community consensus
    agreementRate: 0.78, // 与社区共识的一致性
    performanceScore: 8.7 // Composite score
    performanceScore: 8.7 // 综合评分
  },
  votingHistory: [
    {
      proposalId: 'prop-001',
      vote: 'for',
      timestamp: 1640995200,
      reasoning: 'Supporting the technical architecture design of this proposal...'
      reasoning: '支持该提案的技术架构设计...'
    }
  ],
  delegationHistory: {
    totalReceived: 200,
    currentActive: 150,
    averageDuration: 45, // days
    averageDuration: 45, // 天
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

#### Rating Algorithm
#### 评级算法
```javascript
const delegateRatingSystem = {
  // Calculate overall score
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
  
  // Participation score
  // 参与度评分
  calculateParticipationScore: (delegate) => {
    const { participationRate, averageResponseTime } = delegate.statistics;
    const timeScore = Math.max(0, 10 - (averageResponseTime / 24) * 2);
    return (participationRate * 7 + timeScore * 0.3) * 10;
  },
  
  // Performance score
  // 表现评分
  calculatePerformanceScore: (delegate) => {
    const { agreementRate, performanceScore } = delegate.statistics;
    const consistencyBonus = agreementRate > 0.7 ? 1 : 0.8;
    return performanceScore * consistencyBonus;
  },
  
  // Expertise score
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

### 3. Smart Matching System
### 3. 智能匹配系统

#### Matching Algorithm
#### 匹配算法
```javascript
const delegateMatchingSystem = {
  // Recommend suitable delegates for users
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
  
  // Calculate match score
  // 计算匹配分数
  calculateMatchScore: (userProfile, preferences, delegate) => {
    let score = 0;
    
    // Expertise matching
    // 专业领域匹配
    const expertiseMatch = calculateExpertiseMatch(
      userProfile.interests,
      delegate.expertise
    );
    score += expertiseMatch * 0.3;
    
    // Voting history matching
    // 投票历史匹配
    const votingMatch = calculateVotingAlignment(
      userProfile.votingHistory,
      delegate.votingHistory
    );
    score += votingMatch * 0.25;
    
    // Performance indicator matching
    // 性能指标匹配
    const performanceMatch = evaluatePerformance(
      preferences.performance,
      delegate.statistics
    );
    score += performanceMatch * 0.2;
    
    // Geographic and timezone matching
    // 地理和时区匹配
    const locationMatch = calculateLocationMatch(
      userProfile.timezone,
      delegate.timezone
    );
    score += locationMatch * 0.1;
    
    // Community reputation matching
    // 社区声誉匹配
    const reputationMatch = evaluateReputation(
      preferences.reputation,
      delegate.verification
    );
    score += reputationMatch * 0.15;
    
    return Math.min(100, score);
  },
  
  // Expertise match calculation
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

## UI/UX Design Specifications
## UI/UX设计规范

### 1. Delegation Dashboard
### 1. 委托仪表板

#### Visual Design
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

#### Functional Features
#### 功能特性
- Overview of voting power and allocation status
- 投票权概览和分配状态
- List and management of current delegations
- 当前委托列表和管理
- Quick delegation and revocation operations
- 快速委托和撤销操作
- Delegation history and statistical analysis
- 委托历史和统计分析

### 2. Delegate Discovery Page
### 2. 代表发现页面

#### Visual Design
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

#### Functional Features
#### 功能特性
- Intelligent recommendation and matching algorithms
- 智能推荐和匹配算法
- Multi-dimensional filtering and sorting
- 多维度筛选和排序
- Detailed delegate profile viewing
- 代表详细档案查看
- One-click delegation and comparison functions
- 一键委托和比较功能

### 3. Delegation Wizard
### 3. 委托配置向导

#### Visual Design
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
  padding: 32px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.wizard-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.wizard-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.wizard-subtitle {
  font-size: 16px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.wizard-steps {
  display: flex;
  justify-content: space-between;
  padding: 24px 32px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  border: 2px solid #e2e8f0;
}

.step-item.active .step-number {
  background: #667eea;
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.step-item.completed .step-number {
  background: #48bb78;
  color: white;
  border-color: #48bb78;
}

.step-name {
  font-size: 14px;
  color: #718096;
  text-align: center;
  transition: color 0.3s ease;
}

.step-item.active .step-name {
  color: #2d3748;
  font-weight: 600;
}

.wizard-content {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  display: block;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  color: #2d3748;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.wizard-navigation {
  display: flex;
  justify-content: space-between;
  padding: 24px 32px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
}

.nav-button {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.nav-button.prev {
  background: #e2e8f0;
  color: #4a5568;
}

.nav-button.prev:hover {
  background: #cbd5e0;
}

.nav-button.next {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.nav-button.next:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.nav-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

#### Functional Features
#### 功能特性
- Step-by-step delegation configuration
- 逐步委托配置
- Support for different delegation types
- 支持不同委托类型
- Real-time preview of delegation effects
- 实时预览委托效果
- Error handling and validation
- 错误处理和验证

## Smart Contract Interaction
## 智能合约交互

### 1. Delegation Contract Interface
### 1. 委托合约接口

```solidity
interface IDelegation {
  function delegate(address delegatee) external;
  function delegateBySig(
    address delegatee,
    uint256 nonce,
    uint256 expiry,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;
  function undelegate() external;
  function getDelegatedVotes(address delegator) external view returns (uint256);
  function getDelegatee(address delegator) external view returns (address);
  event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
  event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);
}
```

### 2. Frontend Interaction Flow
### 2. 前端交互流程

1. **Connect Wallet**: User connects their Web3 wallet (e.g., MetaMask).
1. **连接钱包**：用户连接其Web3钱包（如MetaMask）。
2. **Fetch Voting Power**: Frontend queries the smart contract to get the user's current voting power.
2. **获取投票权**：前端查询智能合约获取用户当前投票权。
3. **Discover Delegates**: User browses or searches for delegates on the discovery page.
3. **发现代表**：用户在发现页面浏览或搜索代表。
4. **Select Delegate**: User selects a delegate and initiates the delegation wizard.
4. **选择代表**：用户选择一个代表并启动委托向导。
5. **Configure Delegation**: User sets delegation type, amount, duration, and conditions.
5. **配置委托**：用户设置委托类型、数量、期限和条件。
6. **Sign Transaction**: Frontend prompts the user to sign the delegation transaction (e.g., `delegate` or `delegateBySig`).
6. **签署交易**：前端提示用户签署委托交易（如`delegate`或`delegateBySig`）。
7. **Transaction Confirmation**: Frontend monitors transaction status and provides feedback to the user.
7. **交易确认**：前端监控交易状态并向用户提供反馈。
8. **Update Dashboard**: After successful transaction, frontend updates the delegation dashboard.
8. **更新仪表板**：交易成功后，前端更新委托仪表板。

### 3. Error Handling
### 3. 错误处理

- **Insufficient Funds**: Prompt user to add more tokens.
- **资金不足**：提示用户添加更多代币。
- **Transaction Failed**: Display specific error message from blockchain.
- **交易失败**：显示来自区块链的特定错误消息。
- **Network Issues**: Prompt user to check network connection.
- **网络问题**：提示用户检查网络连接。
- **Smart Contract Errors**: Parse and display relevant error messages from contract reverts.
- **智能合约错误**：解析并显示来自合约回滚的相关错误消息。

## Security Considerations
## 安全考量

- **Smart Contract Audit**: Ensure the delegation smart contract is thoroughly audited by reputable firms.
- **智能合约审计**：确保委托智能合约经过信誉良好的公司彻底审计。
- **Input Validation**: All user inputs must be validated on both frontend and backend.
- **输入验证**：所有用户输入必须在前端和后端进行验证。
- **Secure Key Management**: Advise users on best practices for managing their private keys.
- **安全密钥管理**：建议用户管理私钥的最佳实践。
- **Phishing Prevention**: Implement measures to prevent phishing attacks (e.g., clear domain display, security warnings).
- **钓鱼攻击预防**：实施措施防止钓鱼攻击（例如，清晰的域名显示，安全警告）。
- **Rate Limiting**: Implement rate limiting for API calls to prevent abuse.
- **速率限制**：对API调用实施速率限制以防止滥用。

## Future Enhancements
## 未来增强

- **Gas Fee Optimization**: Explore meta-transactions or gasless transactions.
- **Gas费优化**：探索元交易或无Gas交易。
- **Off-chain Voting**: Integrate with off-chain voting solutions (e.g., Snapshot) for gas-free voting.
- **链下投票**：与链下投票解决方案（如Snapshot）集成，实现无Gas投票。
- **Liquid Democracy**: Allow delegates to further delegate their voting power.
- **流动民主**：允许代表进一步委托其投票权。
- **Advanced Analytics**: Provide more in-depth analytics on delegate performance and community voting trends.
- **高级分析**：提供更深入的代表表现和社区投票趋势分析。
- **Mobile App Integration**: Seamless delegation experience within the mobile application.
- **移动应用集成**：在移动应用中实现无缝委托体验。

## Version Control
## 版本控制

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0     | 2024-06-14 | Manus AI | Initial bilingual version |
| 1.0     | 2024-06-14 | Manus AI | 初始双语版本 |


