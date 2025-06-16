# Governance Proposal Template System Design Specification
# 治理提案模板系统设计规范

## Design Overview
## 设计概述

The governance proposal template system is an important component of the CultureBridge DAO governance function, aiming to provide community members with standardized, structured proposal creation tools. Through predefined templates and intelligent guidance, it helps users create high-quality governance proposals, enhancing governance participation and decision-making efficiency.
治理提案模板系统是CultureBridge DAO治理功能的重要组成部分，旨在为社区成员提供标准化、结构化的提案创建工具。通过预定义的模板和智能引导，帮助用户创建高质量的治理提案，提升治理参与度和决策效率。

## Design Principles
## 设计原则

### 1. Standardized Process
### 1. 标准化流程
- Provide various types of proposal templates
- 提供多种类型的提案模板
- Ensure consistency and completeness of proposal format
- 确保提案格式的一致性和完整性
- Simplify the proposal creation process
- 简化提案创建流程
- Provide intelligent validation and suggestions
- 提供智能验证和建议

### 2. User-Friendly
### 2. 用户友好
- Intuitive template selection interface
- 直观的模板选择界面
- Step-by-step proposal creation wizard
- 分步骤的提案创建向导
- Real-time preview and editing functions
- 实时预览和编辑功能
- Rich help and guidance information
- 丰富的帮助和指导信息

### 3. Flexible and Extensible
### 3. 灵活可扩展
- Support custom template creation
- 支持自定义模板创建
- Template version management and updates
- 模板版本管理和更新
- Multi-language support
- 多语言支持
- Seamless integration with blockchain governance contracts
- 与区块链治理合约的无缝集成

## Proposal Template Types
## 提案模板类型

### 1. Funding Proposal
### 1. 资金申请提案
```javascript
const fundingProposalTemplate = {
  id: 'funding-proposal',
  name: 'Funding Proposal',
  name: '资金申请提案',
  description: 'Apply for DAO funding to support projects or activities',
  description: '申请DAO资金支持项目或活动',
  category: 'funding',
  icon: '💰',
  fields: [
    {
      id: 'project_title',
      type: 'text',
      label: 'Project Title',
      label: '项目标题',
      required: true,
      maxLength: 100,
      placeholder: 'Enter a concise title for the project'
      placeholder: '请输入项目的简洁标题'
    },
    {
      id: 'project_summary',
      type: 'textarea',
      label: 'Project Summary',
      label: '项目摘要',
      required: true,
      maxLength: 500,
      placeholder: 'Briefly describe the core content and goals of the project'
      placeholder: '简要描述项目的核心内容和目标'
    },
    {
      id: 'funding_amount',
      type: 'number',
      label: 'Requested Amount (ETH)',
      label: '申请金额 (ETH)',
      required: true,
      min: 0.1,
      max: 1000,
      step: 0.1
    },
    {
      id: 'project_description',
      type: 'richtext',
      label: 'Detailed Description',
      label: '详细描述',
      required: true,
      placeholder: 'Detailed description of project background, goals, implementation plan, etc.'
      placeholder: '详细描述项目背景、目标、实施计划等'
    },
    {
      id: 'team_info',
      type: 'team',
      label: 'Team Information',
      label: '团队信息',
      required: true
    },
    {
      id: 'timeline',
      type: 'timeline',
      label: 'Project Timeline',
      label: '项目时间线',
      required: true
    },
    {
      id: 'budget_breakdown',
      type: 'budget',
      label: 'Budget Breakdown',
      label: '预算明细',
      required: true
    },
    {
      id: 'success_metrics',
      type: 'metrics',
      label: 'Success Metrics',
      label: '成功指标',
      required: true
    },
    {
      id: 'risks_mitigation',
      type: 'textarea',
      label: 'Risk Assessment and Mitigation Measures',
      label: '风险评估与缓解措施',
      required: true,
      maxLength: 1000
    }
  ],
  validation: {
    minVotingPower: 1000,
    requiredStake: 10,
    votingPeriod: 7 * 24 * 60 * 60, // 7 days
    votingPeriod: 7 * 24 * 60 * 60, // 7 天
    executionDelay: 2 * 24 * 60 * 60 // 2 days
    executionDelay: 2 * 24 * 60 * 60 // 2 天
  }
};
```

### 2. Protocol Upgrade Proposal
### 2. 协议升级提案
```javascript
const protocolUpgradeTemplate = {
  id: 'protocol-upgrade',
  name: 'Protocol Upgrade Proposal',
  name: '协议升级提案',
  description: 'Propose technical upgrades to the platform protocol',
  description: '提议对平台协议进行技术升级',
  category: 'technical',
  icon: '⚙️',
  fields: [
    {
      id: 'upgrade_title',
      type: 'text',
      label: 'Upgrade Title',
      label: '升级标题',
      required: true,
      maxLength: 100
    },
    {
      id: 'current_version',
      type: 'text',
      label: 'Current Version',
      label: '当前版本',
      required: true,
      pattern: '^v\\d+\\.\\d+\\.\\d+$'
    },
    {
      id: 'target_version',
      type: 'text',
      label: 'Target Version',
      label: '目标版本',
      required: true,
      pattern: '^v\\d+\\.\\d+\\.\\d+$'
    },
    {
      id: 'upgrade_rationale',
      type: 'richtext',
      label: 'Upgrade Rationale',
      label: '升级理由',
      required: true,
      placeholder: 'Detailed explanation of why this upgrade is needed'
      placeholder: '详细说明为什么需要进行此次升级'
    },
    {
      id: 'technical_changes',
      type: 'code',
      label: 'Technical Changes',
      label: '技术变更',
      required: true,
      language: 'solidity'
    },
    {
      id: 'security_audit',
      type: 'file',
      label: 'Security Audit Report',
      label: '安全审计报告',
      required: true,
      accept: '.pdf,.doc,.docx'
    },
    {
      id: 'testing_results',
      type: 'richtext',
      label: 'Testing Results',
      label: '测试结果',
      required: true
    },
    {
      id: 'migration_plan',
      type: 'richtext',
      label: 'Migration Plan',
      label: '迁移计划',
      required: true
    },
    {
      id: 'rollback_plan',
      type: 'richtext',
      label: 'Rollback Plan',
      label: '回滚计划',
      required: true
    }
  ],
  validation: {
    minVotingPower: 5000,
    requiredStake: 50,
    votingPeriod: 14 * 24 * 60 * 60, // 14 days
    votingPeriod: 14 * 24 * 60 * 60, // 14 天
    executionDelay: 7 * 24 * 60 * 60, // 7 days
    executionDelay: 7 * 24 * 60 * 60, // 7 天
    requiredApproval: 0.75 // 75% approval required
    requiredApproval: 0.75 // 需要75%的批准
  }
};
```

### 3. Community Governance Proposal
### 3. 社区治理提案
```javascript
const governanceProposalTemplate = {
  id: 'governance-proposal',
  name: 'Community Governance Proposal',
  name: '社区治理提案',
  description: 'Propose changes to DAO governance rules or processes',
  description: '提议修改DAO治理规则或流程',
  category: 'governance',
  icon: '🏛️',
  fields: [
    {
      id: 'governance_title',
      type: 'text',
      label: 'Governance Proposal Title',
      label: '治理提案标题',
      required: true,
      maxLength: 100
    },
    {
      id: 'current_rule',
      type: 'richtext',
      label: 'Current Rule/Process',
      label: '当前规则/流程',
      required: true,
      placeholder: 'Describe the current governance rules or processes'
      placeholder: '描述当前的治理规则或流程'
    },
    {
      id: 'proposed_changes',
      type: 'richtext',
      label: 'Proposed Changes',
      label: '提议的变更',
      required: true,
      placeholder: 'Detailed description of the proposed changes'
      placeholder: '详细描述提议的变更内容'
    },
    {
      id: 'change_rationale',
      type: 'richtext',
      label: 'Rationale for Change',
      label: '变更理由',
      required: true,
      placeholder: 'Explain why these changes are needed'
      placeholder: '说明为什么需要进行这些变更'
    },
    {
      id: 'impact_analysis',
      type: 'richtext',
      label: 'Impact Analysis',
      label: '影响分析',
      required: true,
      placeholder: 'Analyze the potential impact of changes on the community'
      placeholder: '分析变更对社区的潜在影响'
    },
    {
      id: 'implementation_plan',
      type: 'richtext',
      label: 'Implementation Plan',
      label: '实施计划',
      required: true
    },
    {
      id: 'community_feedback',
      type: 'textarea',
      label: 'Community Feedback Collection',
      label: '社区反馈收集',
      required: false,
      placeholder: 'Record feedback and suggestions from community members'
      placeholder: '记录社区成员的反馈和建议'
    }
  ],
  validation: {
    minVotingPower: 2000,
    requiredStake: 25,
    votingPeriod: 10 * 24 * 60 * 60, // 10 days
    votingPeriod: 10 * 24 * 60 * 60, // 10 天
    executionDelay: 3 * 24 * 60 * 60, // 3 days
    executionDelay: 3 * 24 * 60 * 60, // 3 天
    requiredApproval: 0.6 // 60% approval required
    requiredApproval: 0.6 // 需要60%的批准
  }
};
```

### 4. Partnership Proposal
### 4. 合作伙伴提案
```javascript
const partnershipProposalTemplate = {
  id: 'partnership-proposal',
  name: 'Partnership Proposal',
  name: '合作伙伴提案',
  description: 'Propose establishing a partnership with an external organization',
  description: '提议与外部组织建立合作关系',
  category: 'partnership',
  icon: '🤝',
  fields: [
    {
      id: 'partnership_title',
      type: 'text',
      label: 'Partnership Proposal Title',
      label: '合作提案标题',
      required: true,
      maxLength: 100
    },
    {
      id: 'partner_info',
      type: 'organization',
      label: 'Partner Information',
      label: '合作伙伴信息',
      required: true
    },
    {
      id: 'partnership_type',
      type: 'select',
      label: 'Partnership Type',
      label: '合作类型',
      required: true,
      options: [
        { value: 'strategic', label: 'Strategic Partnership' },
        { value: 'strategic', label: '战略合作' },
        { value: 'technical', label: 'Technical Cooperation' },
        { value: 'technical', label: '技术合作' },
        { value: 'marketing', label: 'Marketing Cooperation' },
        { value: 'marketing', label: '市场合作' },
        { value: 'investment', label: 'Investment Cooperation' },
        { value: 'investment', label: '投资合作' },
        { value: 'other', label: 'Other' }
        { value: 'other', label: '其他' }
      ]
    },
    {
      id: 'partnership_goals',
      type: 'richtext',
      label: 'Partnership Goals',
      label: '合作目标',
      required: true,
      placeholder: 'Describe the goals to be achieved through cooperation'
      placeholder: '描述通过合作希望达成的目标'
    },
    {
      id: 'mutual_benefits',
      type: 'richtext',
      label: 'Mutual Benefits',
      label: '互惠利益',
      required: true,
      placeholder: 'Explain the benefits both parties can gain'
      placeholder: '说明双方能够获得的利益'
    },
    {
      id: 'partnership_terms',
      type: 'richtext',
      label: 'Partnership Terms',
      label: '合作条款',
      required: true
    },
    {
      id: 'duration',
      type: 'duration',
      label: 'Partnership Duration',
      label: '合作期限',
      required: true
    },
    {
      id: 'success_metrics',
      type: 'metrics',
      label: 'Success Metrics',
      label: '成功指标',
      required: true
    },
    {
      id: 'legal_considerations',
      type: 'textarea',
      label: 'Legal Considerations',
      label: '法律考虑',
      required: false,
      maxLength: 1000
    }
  ],
  validation: {
    minVotingPower: 1500,
    requiredStake: 20,
    votingPeriod: 7 * 24 * 60 * 60, // 7 days
    votingPeriod: 7 * 24 * 60 * 60, // 7 天
    executionDelay: 1 * 24 * 60 * 60 // 1 day
    executionDelay: 1 * 24 * 60 * 60 // 1 天
  }
};
```

## Core Component Design
## 核心组件设计

### 1. Template Selector Component
### 1. 模板选择器组件

#### Visual Design
#### 视觉设计
```css
.template-selector {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.template-selector-header {
  text-align: center;
  margin-bottom: 40px;
}

.template-selector-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.template-selector-subtitle {
  font-size: 18px;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.template-categories {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.category-filter {
  padding: 12px 24px;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-filter:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.category-filter.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.template-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.template-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
}

.template-card.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.template-icon {
  width: 48px;
  height: 48px;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  margin-bottom: 16px;
}

.template-name {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.template-description {
  font-size: 14px;
  color: #718096;
  line-height: 1.5;
  margin-bottom: 16px;
}

.template-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #a0aec0;
}

.template-usage {
  display: flex;
  align-items: center;
  gap: 4px;
}

.template-difficulty {
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.template-difficulty.easy {
  background: #f0fff4;
  color: #38a169;
}

.template-difficulty.medium {
  background: #fffbeb;
  color: #d69e2e;
}

.template-difficulty.hard {
  background: #fff5f5;
  color: #e53e3e;
}
```

#### Functional Features
#### 功能特性
- Filter templates by category
- 按类别筛选模板
- Template preview and details
- 模板预览和详细信息
- Usage statistics and difficulty indicators
- 使用统计和难度指示
- Custom template creation entry
- 自定义模板创建入口

### 2. Proposal Creation Wizard Component
### 2. 提案创建向导组件

#### Visual Design
#### 视觉设计
```css
.proposal-wizard {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.wizard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  text-align: center;
}

.wizard-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.wizard-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.wizard-progress {
  background: rgba(255, 255, 255, 0.2);
  height: 6px;
  border-radius: 3px;
  margin-top: 24px;
  overflow: hidden;
}

.wizard-progress-bar {
  background: white;
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.wizard-steps {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 24px;
}

.wizard-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.wizard-step.active,
.wizard-step.completed {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.wizard-step.active .step-number {
  background: white;
  color: #667eea;
}

.wizard-step.completed .step-number {
  background: #48bb78;
  color: white;
}

.step-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.wizard-content {
  padding: 40px;
}

.wizard-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
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

.wizard-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
}

.wizard-button {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.wizard-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.wizard-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.wizard-button.secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.wizard-button.secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.wizard-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

#### Functional Features
#### 功能特性
- Step-by-step proposal creation process
- 分步骤的提案创建流程
- Real-time form validation and hints
- 实时表单验证和提示
- Auto-save draft function
- 自动保存草稿功能
- Progress tracking and navigation
- 进度跟踪和导航

### 3. Field Component Library
### 3. 字段组件库

#### Rich Text Editor
#### 富文本编辑器
```css
.richtext-editor {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.richtext-editor.focused {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.richtext-toolbar {
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-button:hover {
  background: #edf2f7;
  color: #2d3748;
}

.toolbar-button.active {
  background: #667eea;
  color: white;
}

.richtext-content {
  min-height: 200px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #2d3748;
}
```

#### Team Information Component
#### 团队信息组件
```css
.team-info-field {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.team-member {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #cbd5e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #4a5568;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.member-role {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.member-bio {
  font-size: 13px;
  color: #4a5568;
  line-height: 1.4;
}

.add-member-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  background: transparent;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-member-button:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}
```

#### Timeline Component
#### 时间线组件
```css
.timeline-field {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.timeline-items {
  position: relative;
}

.timeline-items::before {
  content: "";
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item {
  position: relative;
  padding-left: 60px;
  margin-bottom: 24px;
}

.timeline-item::before {
  content: "";
  position: absolute;
  left: 12px;
  top: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #667eea;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #e2e8f0;
}

.timeline-content {
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.timeline-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.timeline-description {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.5;
  margin-bottom: 8px;
}

.timeline-date {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}
```

## Template Validation System
## 模板验证系统

### 1. Field Validation Rules
### 1. 字段验证规则
```javascript
const validationRules = {
  required: (value) => {
    return value && value.toString().trim().length > 0;
  },
  
  minLength: (value, min) => {
    return value && value.toString().length >= min;
  },
  
  maxLength: (value, max) => {
    return !value || value.toString().length <= max;
  },
  
  pattern: (value, regex) => {
    return !value || new RegExp(regex).test(value);
  },
  
  min: (value, min) => {
    return !value || parseFloat(value) >= min;
  },
  
  max: (value, max) => {
    return !value || parseFloat(value) <= max;
  },
  
  email: (value) => {
    const emailRegex = /^[^
(Content truncated due to size limit. Use line ranges to read in chunks)

