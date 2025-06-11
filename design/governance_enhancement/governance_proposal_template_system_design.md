# 治理提案模板系统设计规范

## 设计概述

治理提案模板系统是CultureBridge DAO治理功能的重要组成部分，旨在为社区成员提供标准化、结构化的提案创建工具。通过预定义的模板和智能引导，帮助用户创建高质量的治理提案，提升治理参与度和决策效率。

## 设计原则

### 1. 标准化流程
- 提供多种类型的提案模板
- 确保提案格式的一致性和完整性
- 简化提案创建流程
- 提供智能验证和建议

### 2. 用户友好
- 直观的模板选择界面
- 分步骤的提案创建向导
- 实时预览和编辑功能
- 丰富的帮助和指导信息

### 3. 灵活可扩展
- 支持自定义模板创建
- 模板版本管理和更新
- 多语言支持
- 与区块链治理合约的无缝集成

## 提案模板类型

### 1. 资金申请提案 (Funding Proposal)
```javascript
const fundingProposalTemplate = {
  id: 'funding-proposal',
  name: '资金申请提案',
  description: '申请DAO资金支持项目或活动',
  category: 'funding',
  icon: '💰',
  fields: [
    {
      id: 'project_title',
      type: 'text',
      label: '项目标题',
      required: true,
      maxLength: 100,
      placeholder: '请输入项目的简洁标题'
    },
    {
      id: 'project_summary',
      type: 'textarea',
      label: '项目摘要',
      required: true,
      maxLength: 500,
      placeholder: '简要描述项目的核心内容和目标'
    },
    {
      id: 'funding_amount',
      type: 'number',
      label: '申请金额 (ETH)',
      required: true,
      min: 0.1,
      max: 1000,
      step: 0.1
    },
    {
      id: 'project_description',
      type: 'richtext',
      label: '详细描述',
      required: true,
      placeholder: '详细描述项目背景、目标、实施计划等'
    },
    {
      id: 'team_info',
      type: 'team',
      label: '团队信息',
      required: true
    },
    {
      id: 'timeline',
      type: 'timeline',
      label: '项目时间线',
      required: true
    },
    {
      id: 'budget_breakdown',
      type: 'budget',
      label: '预算明细',
      required: true
    },
    {
      id: 'success_metrics',
      type: 'metrics',
      label: '成功指标',
      required: true
    },
    {
      id: 'risks_mitigation',
      type: 'textarea',
      label: '风险评估与缓解措施',
      required: true,
      maxLength: 1000
    }
  ],
  validation: {
    minVotingPower: 1000,
    requiredStake: 10,
    votingPeriod: 7 * 24 * 60 * 60, // 7 days
    executionDelay: 2 * 24 * 60 * 60 // 2 days
  }
};
```

### 2. 协议升级提案 (Protocol Upgrade)
```javascript
const protocolUpgradeTemplate = {
  id: 'protocol-upgrade',
  name: '协议升级提案',
  description: '提议对平台协议进行技术升级',
  category: 'technical',
  icon: '⚙️',
  fields: [
    {
      id: 'upgrade_title',
      type: 'text',
      label: '升级标题',
      required: true,
      maxLength: 100
    },
    {
      id: 'current_version',
      type: 'text',
      label: '当前版本',
      required: true,
      pattern: '^v\\d+\\.\\d+\\.\\d+$'
    },
    {
      id: 'target_version',
      type: 'text',
      label: '目标版本',
      required: true,
      pattern: '^v\\d+\\.\\d+\\.\\d+$'
    },
    {
      id: 'upgrade_rationale',
      type: 'richtext',
      label: '升级理由',
      required: true,
      placeholder: '详细说明为什么需要进行此次升级'
    },
    {
      id: 'technical_changes',
      type: 'code',
      label: '技术变更',
      required: true,
      language: 'solidity'
    },
    {
      id: 'security_audit',
      type: 'file',
      label: '安全审计报告',
      required: true,
      accept: '.pdf,.doc,.docx'
    },
    {
      id: 'testing_results',
      type: 'richtext',
      label: '测试结果',
      required: true
    },
    {
      id: 'migration_plan',
      type: 'richtext',
      label: '迁移计划',
      required: true
    },
    {
      id: 'rollback_plan',
      type: 'richtext',
      label: '回滚计划',
      required: true
    }
  ],
  validation: {
    minVotingPower: 5000,
    requiredStake: 50,
    votingPeriod: 14 * 24 * 60 * 60, // 14 days
    executionDelay: 7 * 24 * 60 * 60, // 7 days
    requiredApproval: 0.75 // 75% approval required
  }
};
```

### 3. 社区治理提案 (Governance Proposal)
```javascript
const governanceProposalTemplate = {
  id: 'governance-proposal',
  name: '社区治理提案',
  description: '提议修改DAO治理规则或流程',
  category: 'governance',
  icon: '🏛️',
  fields: [
    {
      id: 'governance_title',
      type: 'text',
      label: '治理提案标题',
      required: true,
      maxLength: 100
    },
    {
      id: 'current_rule',
      type: 'richtext',
      label: '当前规则/流程',
      required: true,
      placeholder: '描述当前的治理规则或流程'
    },
    {
      id: 'proposed_changes',
      type: 'richtext',
      label: '提议的变更',
      required: true,
      placeholder: '详细描述提议的变更内容'
    },
    {
      id: 'change_rationale',
      type: 'richtext',
      label: '变更理由',
      required: true,
      placeholder: '说明为什么需要进行这些变更'
    },
    {
      id: 'impact_analysis',
      type: 'richtext',
      label: '影响分析',
      required: true,
      placeholder: '分析变更对社区的潜在影响'
    },
    {
      id: 'implementation_plan',
      type: 'richtext',
      label: '实施计划',
      required: true
    },
    {
      id: 'community_feedback',
      type: 'textarea',
      label: '社区反馈收集',
      required: false,
      placeholder: '记录社区成员的反馈和建议'
    }
  ],
  validation: {
    minVotingPower: 2000,
    requiredStake: 25,
    votingPeriod: 10 * 24 * 60 * 60, // 10 days
    executionDelay: 3 * 24 * 60 * 60, // 3 days
    requiredApproval: 0.6 // 60% approval required
  }
};
```

### 4. 合作伙伴提案 (Partnership Proposal)
```javascript
const partnershipProposalTemplate = {
  id: 'partnership-proposal',
  name: '合作伙伴提案',
  description: '提议与外部组织建立合作关系',
  category: 'partnership',
  icon: '🤝',
  fields: [
    {
      id: 'partnership_title',
      type: 'text',
      label: '合作提案标题',
      required: true,
      maxLength: 100
    },
    {
      id: 'partner_info',
      type: 'organization',
      label: '合作伙伴信息',
      required: true
    },
    {
      id: 'partnership_type',
      type: 'select',
      label: '合作类型',
      required: true,
      options: [
        { value: 'strategic', label: '战略合作' },
        { value: 'technical', label: '技术合作' },
        { value: 'marketing', label: '市场合作' },
        { value: 'investment', label: '投资合作' },
        { value: 'other', label: '其他' }
      ]
    },
    {
      id: 'partnership_goals',
      type: 'richtext',
      label: '合作目标',
      required: true,
      placeholder: '描述通过合作希望达成的目标'
    },
    {
      id: 'mutual_benefits',
      type: 'richtext',
      label: '互惠利益',
      required: true,
      placeholder: '说明双方能够获得的利益'
    },
    {
      id: 'partnership_terms',
      type: 'richtext',
      label: '合作条款',
      required: true
    },
    {
      id: 'duration',
      type: 'duration',
      label: '合作期限',
      required: true
    },
    {
      id: 'success_metrics',
      type: 'metrics',
      label: '成功指标',
      required: true
    },
    {
      id: 'legal_considerations',
      type: 'textarea',
      label: '法律考虑',
      required: false,
      maxLength: 1000
    }
  ],
  validation: {
    minVotingPower: 1500,
    requiredStake: 20,
    votingPeriod: 7 * 24 * 60 * 60, // 7 days
    executionDelay: 1 * 24 * 60 * 60 // 1 day
  }
};
```

## 核心组件设计

### 1. 模板选择器组件 (TemplateSelector)

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

#### 功能特性
- 按类别筛选模板
- 模板预览和详细信息
- 使用统计和难度指示
- 自定义模板创建入口

### 2. 提案创建向导组件 (ProposalWizard)

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

#### 功能特性
- 分步骤的提案创建流程
- 实时表单验证和提示
- 自动保存草稿功能
- 进度跟踪和导航

### 3. 字段组件库 (Field Components)

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
  content: '';
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
  content: '';
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

## 模板验证系统

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !value || emailRegex.test(value);
  },
  
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return !value;
    }
  },
  
  ethereum_address: (value) => {
    const ethRegex = /^0x[a-fA-F0-9]{40}$/;
    return !value || ethRegex.test(value);
  }
};
```

### 2. 智能建议系统
```javascript
const suggestionEngine = {
  // 基于历史数据的建议
  getHistoricalSuggestions: (fieldId, userHistory) => {
    const suggestions = userHistory
      .filter(proposal => proposal.fields[fieldId])
      .map(proposal => proposal.fields[fieldId])
      .slice(0, 5);
    
    return suggestions;
  },
  
  // 基于成功提案的建议
  getSuccessPatterns: (templateId, fieldId) => {
    const successfulProposals = getSuccessfulProposals(templateId);
    const patterns = analyzeFieldPatterns(successfulProposals, fieldId);
    
    return patterns.map(pattern => ({
      suggestion: pattern.value,
      reason: `成功率 ${pattern.successRate}% 的提案使用了类似内容`,
      confidence: pattern.confidence
    }));
  },
  
  // 实时内容分析建议
  getContentSuggestions: (content, fieldType) => {
    const suggestions = [];
    
    if (fieldType === 'richtext') {
      // 检查内容结构
      if (!content.includes('##')) {
        suggestions.push({
          type: 'structure',
          message: '建议使用标题来组织内容结构',
          action: 'add_headings'
        });
      }
      
      // 检查内容长度
      if (content.length < 200) {
        suggestions.push({
          type: 'length',
          message: '内容可能过于简短，建议提供更多详细信息',
          action: 'expand_content'
        });
      }
    }
    
    return suggestions;
  }
};
```

## 模板管理系统

### 1. 模板版本控制
```javascript
const templateVersioning = {
  // 创建新版本
  createVersion: (templateId, changes, author) => {
    const currentTemplate = getTemplate(templateId);
    const newVersion = {
      ...currentTemplate,
      version: incrementVersion(currentTemplate.version),
      changes,
      author,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    
    return saveTemplateVersion(newVersion);
  },
  
  // 发布版本
  publishVersion: (templateId, version) => {
    const template = getTemplateVersion(templateId, version);
    template.status = 'published';
    template.publishedAt = new Date().toISOString();
    
    // 更新活跃版本
    updateActiveVersion(templateId, version);
    
    return saveTemplateVersion(template);
  },
  
  // 版本比较
  compareVersions: (templateId, version1, version2) => {
    const v1 = getTemplateVersion(templateId, version1);
    const v2 = getTemplateVersion(templateId, version2);
    
    return {
      fieldsAdded: findAddedFields(v1, v2),
      fieldsRemoved: findRemovedFields(v1, v2),
      fieldsModified: findModifiedFields(v1, v2),
      validationChanges: compareValidation(v1, v2)
    };
  }
};
```

### 2. 自定义模板创建
```javascript
const customTemplateBuilder = {
  // 创建空白模板
  createBlankTemplate: (name, category, description) => {
    return {
      id: generateTemplateId(),
      name,
      category,
      description,
      icon: '📝',
      fields: [],
      validation: getDefaultValidation(),
      isCustom: true,
      createdBy: getCurrentUser().id,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
  },
  
  // 基于现有模板创建
  createFromTemplate: (baseTemplateId, modifications) => {
    const baseTemplate = getTemplate(baseTemplateId);
    const newTemplate = {
      ...baseTemplate,
      id: generateTemplateId(),
      name: `${baseTemplate.name} (自定义)`,
      isCustom: true,
      basedOn: baseTemplateId,
      createdBy: getCurrentUser().id,
      createdAt: new Date().toISOString(),
      ...modifications
    };
    
    return newTemplate;
  },
  
  // 添加字段
  addField: (templateId, field, position) => {
    const template = getTemplate(templateId);
    const newFields = [...template.fields];
    
    if (position !== undefined) {
      newFields.splice(position, 0, field);
    } else {
      newFields.push(field);
    }
    
    template.fields = newFields;
    return saveTemplate(template);
  },
  
  // 字段拖拽排序
  reorderFields: (templateId, fromIndex, toIndex) => {
    const template = getTemplate(templateId);
    const newFields = [...template.fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    
    template.fields = newFields;
    return saveTemplate(template);
  }
};
```

## 响应式设计

### 桌面端 (≥1024px)
- 模板卡片3列网格布局
- 完整的向导步骤显示
- 侧边栏显示进度和帮助信息

### 平板端 (768px - 1023px)
- 模板卡片2列网格布局
- 简化的向导步骤显示
- 折叠式帮助信息

### 移动端 (<768px)
- 模板卡片单列布局
- 底部导航的向导步骤
- 全屏模式的字段编辑

## 可访问性考虑

### 键盘导航
- 支持Tab键在模板和字段间导航
- 支持方向键在模板网格中移动
- 支持Enter键选择模板和确认操作

### 屏幕阅读器
- 为所有交互元素提供适当的aria-label
- 使用语义化的HTML结构
- 提供表单验证的文字描述

### 视觉辅助
- 确保足够的颜色对比度
- 提供清晰的焦点指示器
- 支持高对比度和大字体模式

## 性能优化

### 模板加载
- 实现模板的懒加载和缓存
- 使用虚拟滚动处理大量模板
- 优化模板预览的渲染性能

### 表单处理
- 实现表单数据的增量保存
- 使用防抖优化实时验证
- 优化富文本编辑器的性能

### 数据管理
- 使用本地存储缓存草稿
- 实现离线编辑功能
- 优化模板数据的传输

## 实现建议

### React组件结构
```javascript
// 主要组件层次结构
ProposalTemplateSystem
├── TemplateSelector (模板选择器)
├── ProposalWizard (提案创建向导)
├── FieldComponents (字段组件库)
│   ├── RichTextEditor
│   ├── TeamInfoField
│   ├── TimelineField
│   ├── BudgetField
│   └── MetricsField
├── TemplateBuilder (自定义模板构建器)
└── TemplateManager (模板管理)
```

### 状态管理
```javascript
// 模板系统状态
const templateState = {
  templates: [],
  currentTemplate: null,
  proposalData: {},
  validationErrors: {},
  suggestions: {},
  ui: {
    currentStep: 0,
    showPreview: false,
    isLoading: false
  }
};
```

### API设计
```javascript
// 主要API接口
const templateAPI = {
  getTemplates: (category) => Promise,
  getTemplate: (templateId) => Promise,
  createProposal: (templateId, data) => Promise,
  saveDraft: (proposalId, data) => Promise,
  validateField: (fieldId, value, rules) => Promise,
  getSuggestions: (fieldId, context) => Promise
};
```

这个设计规范为治理提案模板系统提供了完整的架构和UI指导，确保能够为DAO成员提供标准化、用户友好的提案创建体验，同时保持系统的灵活性和可扩展性。

