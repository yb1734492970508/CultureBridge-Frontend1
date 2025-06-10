# NFT推荐系统架构和UI设计规范

## 设计概述

NFT推荐系统是提升用户发现体验和平台参与度的核心功能，通过智能算法分析用户行为、偏好和市场趋势，为用户推荐个性化的NFT内容。本设计规范旨在创建一个智能、精准、用户友好的推荐系统，支持多种推荐策略、实时更新和个性化定制。

## 设计原则

### 1. 个性化精准
- 基于用户行为和偏好的深度学习
- 多维度数据分析和模式识别
- 实时调整和优化推荐算法
- 支持用户反馈和偏好设置

### 2. 多样化推荐
- 提供多种推荐类型和场景
- 平衡热门内容和长尾发现
- 避免信息茧房和推荐单一化
- 支持探索性和发现性推荐

### 3. 透明可控
- 清晰展示推荐理由和依据
- 支持用户自定义推荐偏好
- 提供推荐反馈和调整机制
- 保护用户隐私和数据安全

## 推荐算法架构

### 1. 数据收集层
```javascript
// 用户行为数据
const userBehaviorData = {
  // 浏览行为
  views: {
    nftId: string,
    timestamp: number,
    duration: number,
    source: string
  },
  
  // 交互行为
  interactions: {
    type: 'like' | 'favorite' | 'share' | 'comment',
    nftId: string,
    timestamp: number
  },
  
  // 交易行为
  transactions: {
    type: 'purchase' | 'bid' | 'sell',
    nftId: string,
    price: number,
    timestamp: number
  },
  
  // 搜索行为
  searches: {
    query: string,
    filters: object,
    results: string[],
    timestamp: number
  }
};

// NFT特征数据
const nftFeatureData = {
  // 基础属性
  metadata: {
    category: string,
    style: string,
    color: string[],
    tags: string[]
  },
  
  // 市场数据
  market: {
    price: number,
    volume: number,
    popularity: number,
    trend: number
  },
  
  // 社交数据
  social: {
    likes: number,
    shares: number,
    comments: number,
    views: number
  }
};
```

### 2. 特征工程层
```javascript
// 用户画像构建
const userProfile = {
  // 偏好特征
  preferences: {
    categories: Map<string, number>,
    priceRange: [number, number],
    styles: Map<string, number>,
    artists: Map<string, number>
  },
  
  // 行为特征
  behavior: {
    activityLevel: number,
    browsingPattern: string,
    purchasingPower: number,
    socialEngagement: number
  },
  
  // 时间特征
  temporal: {
    activeHours: number[],
    seasonality: Map<string, number>,
    recency: number
  }
};

// NFT相似度计算
const similarityMetrics = {
  // 内容相似度
  content: {
    visual: number,      // 视觉相似度
    semantic: number,    // 语义相似度
    style: number        // 风格相似度
  },
  
  // 协同过滤相似度
  collaborative: {
    userBased: number,   // 基于用户的相似度
    itemBased: number    // 基于物品的相似度
  },
  
  // 市场相似度
  market: {
    price: number,       // 价格相似度
    trend: number        // 趋势相似度
  }
};
```

### 3. 推荐算法层
```javascript
// 推荐策略配置
const recommendationStrategies = {
  // 协同过滤
  collaborativeFiltering: {
    weight: 0.3,
    userBased: true,
    itemBased: true,
    minSimilarity: 0.1
  },
  
  // 内容推荐
  contentBased: {
    weight: 0.25,
    visualSimilarity: true,
    semanticSimilarity: true,
    styleMatching: true
  },
  
  // 热门推荐
  trending: {
    weight: 0.2,
    timeWindow: '24h',
    categoryBased: true,
    globalTrending: true
  },
  
  // 个性化推荐
  personalized: {
    weight: 0.25,
    behaviorBased: true,
    preferenceMatching: true,
    diversityFactor: 0.3
  }
};
```

## 核心组件设计

### 1. 推荐首页组件 (RecommendationHome)

#### 视觉设计
```css
.recommendation-home {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.recommendation-header {
  margin-bottom: 32px;
  text-align: center;
}

.recommendation-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.recommendation-subtitle {
  font-size: 18px;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.recommendation-sections {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.recommendation-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 28px;
  height: 28px;
  color: #667eea;
}

.section-description {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.refresh-button,
.customize-button,
.view-all-button {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f7fafc;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-button:hover,
.customize-button:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.view-all-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.view-all-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.recommendation-carousel {
  position: relative;
  overflow: hidden;
}

.carousel-container {
  display: flex;
  gap: 20px;
  transition: transform 0.3s ease;
}

.carousel-controls {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.carousel-controls:hover {
  background: white;
  color: #667eea;
  transform: translateY(-50%) scale(1.05);
}

.carousel-prev {
  left: -20px;
}

.carousel-next {
  right: -20px;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.carousel-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.carousel-indicator.active {
  background: #667eea;
  transform: scale(1.2);
}
```

#### 功能特性
- 多个推荐板块的展示
- 轮播和网格两种展示模式
- 推荐刷新和个性化设置
- 推荐理由的透明展示

### 2. 推荐卡片组件 (RecommendationCard)

#### 视觉设计
```css
.recommendation-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #cbd5e0;
}

.recommendation-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.recommendation-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recommendation-card:hover .recommendation-image {
  transform: scale(1.05);
}

.recommendation-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  backdrop-filter: blur(10px);
}

.recommendation-badge.trending {
  background: rgba(245, 87, 108, 0.9);
}

.recommendation-badge.similar {
  background: rgba(56, 178, 172, 0.9);
}

.recommendation-badge.personalized {
  background: rgba(139, 92, 246, 0.9);
}

.recommendation-badge.new {
  background: rgba(72, 187, 120, 0.9);
}

.recommendation-score {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.score-icon {
  width: 12px;
  height: 12px;
}

.recommendation-actions {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.recommendation-card:hover .recommendation-actions {
  opacity: 1;
}

.recommendation-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.recommendation-action:hover {
  background: white;
  transform: scale(1.1);
}

.recommendation-action.favorite {
  color: #e53e3e;
}

.recommendation-action.share {
  color: #667eea;
}

.recommendation-info {
  padding: 16px;
}

.recommendation-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  line-height: 1.2;
}

.recommendation-creator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.creator-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.creator-name {
  font-size: 13px;
  color: #4a5568;
  font-weight: 500;
}

.recommendation-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.price-value {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #2d3748;
}

.eth-icon {
  width: 14px;
  height: 14px;
  color: #667eea;
}

.price-change {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

.price-change.positive {
  color: #38a169;
}

.price-change.negative {
  color: #e53e3e;
}

.recommendation-reason {
  background: #f7fafc;
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 12px;
}

.reason-text {
  font-size: 12px;
  color: #4a5568;
  line-height: 1.3;
}

.reason-icon {
  width: 14px;
  height: 14px;
  color: #667eea;
  margin-right: 6px;
}

.recommendation-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 11px;
  color: #718096;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  width: 12px;
  height: 12px;
}
```

#### 功能特性
- 推荐类型标识和评分显示
- 推荐理由的清晰说明
- 快速操作按钮（收藏、分享等）
- 价格变化和市场数据展示

### 3. 个性化设置组件 (PersonalizationSettings)

#### 视觉设计
```css
.personalization-settings {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.settings-header {
  margin-bottom: 32px;
  text-align: center;
}

.settings-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.settings-description {
  font-size: 16px;
  color: #718096;
  max-width: 500px;
  margin: 0 auto;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 24px;
}

.settings-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  width: 20px;
  height: 20px;
  color: #667eea;
}

.preference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.preference-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preference-label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.preference-slider {
  position: relative;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  cursor: pointer;
}

.slider-track {
  position: absolute;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.2s ease;
}

.slider-thumb {
  position: absolute;
  width: 18px;
  height: 18px;
  background: white;
  border: 3px solid #667eea;
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider-thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.preference-value {
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
  text-align: center;
}

.category-preferences {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.category-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-toggle:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.category-toggle.selected {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.category-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid #e2e8f0;
  position: relative;
  transition: all 0.2s ease;
}

.category-checkbox.checked {
  background: #667eea;
  border-color: #667eea;
}

.category-checkbox.checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.category-description {
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

.algorithm-weights {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weight-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.weight-info {
  flex: 1;
}

.weight-name {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.weight-description {
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

.weight-control {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.weight-slider {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.weight-value {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  min-width: 30px;
  text-align: center;
}

.settings-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.save-settings-button,
.reset-settings-button {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-settings-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.save-settings-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.reset-settings-button {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.reset-settings-button:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}
```

#### 功能特性
- 推荐偏好的详细设置
- 算法权重的自定义调整
- 分类偏好的选择和排序
- 设置的保存和重置功能

### 4. 推荐反馈组件 (RecommendationFeedback)

#### 视觉设计
```css
.recommendation-feedback {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e2e8f0;
  max-width: 320px;
  z-index: 1000;
  animation: slideInRight 0.3s ease;
}

.feedback-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.feedback-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.close-feedback-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #f7fafc;
  color: #a0aec0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.close-feedback-button:hover {
  background: #edf2f7;
  color: #4a5568;
}

.feedback-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feedback-question {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 8px;
}

.feedback-options {
  display: flex;
  gap: 8px;
}

.feedback-option {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f7fafc;
  color: #4a5568;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.feedback-option:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.feedback-option.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.feedback-textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  resize: vertical;
  font-family: inherit;
}

.feedback-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.feedback-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.submit-feedback-button,
.skip-feedback-button {
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-feedback-button {
  background: #667eea;
  color: white;
  border: none;
}

.submit-feedback-button:hover {
  background: #5a67d8;
}

.skip-feedback-button {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.skip-feedback-button:hover {
  background: #edf2f7;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

#### 功能特性
- 推荐质量的快速评价
- 详细反馈意见的收集
- 推荐改进建议的提交
- 用户体验的持续优化

## 推荐场景设计

### 1. 首页推荐
- **为你推荐**：基于用户历史行为的个性化推荐
- **热门趋势**：当前市场热门和趋势NFT
- **新品上架**：最新发布的优质NFT
- **相似推荐**：与用户收藏相似的NFT

### 2. 详情页推荐
- **相关作品**：同一创作者或系列的其他作品
- **风格相似**：视觉风格和主题相似的NFT
- **价格相近**：价格区间相似的替代选择
- **用户也喜欢**：浏览过此NFT的用户还喜欢的作品

### 3. 搜索推荐
- **搜索建议**：基于搜索历史的智能建议
- **相关搜索**：与当前搜索相关的其他查询
- **热门搜索**：当前热门的搜索关键词
- **发现更多**：扩展搜索范围的推荐

### 4. 收藏推荐
- **完善收藏**：补充收藏夹的推荐NFT
- **系列收集**：完整系列的其他作品
- **投资建议**：具有投资潜力的NFT
- **社区推荐**：社区用户的热门收藏

## 响应式设计

### 桌面端 (≥1024px)
- 推荐卡片4-5列网格布局
- 显示完整的推荐理由和详细信息
- 支持悬停效果和快速预览

### 平板端 (768px - 1023px)
- 推荐卡片2-3列网格布局
- 适当简化推荐信息显示
- 保持核心功能的完整性

### 移动端 (<768px)
- 推荐卡片1-2列布局
- 简化推荐理由显示
- 优化触摸操作和滑动体验

## 性能优化

### 算法优化
- 使用机器学习模型进行实时推荐
- 实现推荐结果的缓存和预计算
- 优化推荐算法的执行效率

### 数据优化
- 实现用户行为数据的实时收集
- 使用增量学习更新推荐模型
- 优化推荐数据的存储和检索

### 界面优化
- 实现推荐内容的懒加载
- 使用虚拟滚动处理大量推荐
- 优化推荐卡片的渲染性能

## 隐私和安全

### 数据保护
- 用户行为数据的匿名化处理
- 推荐算法的透明度和可解释性
- 用户数据的安全存储和传输

### 用户控制
- 推荐偏好的完全自定义
- 数据使用的明确授权
- 推荐历史的查看和删除

### 算法公平
- 避免推荐算法的偏见和歧视
- 确保推荐内容的多样性
- 保护用户的选择自由

## 实现建议

### React组件结构
```javascript
// 主要组件层次结构
RecommendationSystem
├── RecommendationHome (推荐首页)
├── RecommendationCard (推荐卡片)
├── PersonalizationSettings (个性化设置)
├── RecommendationFeedback (推荐反馈)
└── RecommendationAnalytics (推荐分析)
```

### 状态管理
```javascript
// 推荐系统状态
const recommendationState = {
  recommendations: {
    personalized: [],
    trending: [],
    similar: [],
    new: []
  },
  userProfile: {
    preferences: {},
    behavior: {},
    feedback: []
  },
  settings: {
    algorithmWeights: {},
    categoryPreferences: {},
    privacySettings: {}
  },
  ui: {
    currentSection: 'home',
    showSettings: false,
    showFeedback: false
  }
};
```

### API设计
```javascript
// 主要API接口
const recommendationAPI = {
  getRecommendations: (userId, type, limit) => Promise,
  updateUserProfile: (userId, profileData) => Promise,
  submitFeedback: (userId, recommendationId, feedback) => Promise,
  getPersonalizationSettings: (userId) => Promise,
  updatePersonalizationSettings: (userId, settings) => Promise,
  getRecommendationAnalytics: (userId) => Promise
};
```

这个设计规范为NFT推荐系统提供了完整的架构和UI指导，确保能够为用户提供精准、个性化的NFT推荐体验，同时保护用户隐私和提供透明的推荐机制。

