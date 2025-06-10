# NFT搜索和筛选功能增强设计规范

## 设计概述

NFT搜索和筛选功能是用户发现和浏览NFT的核心入口，直接影响用户体验和平台的使用效率。本设计规范旨在创建一个智能、高效、用户友好的搜索和筛选系统，支持多维度搜索、智能提示、个性化筛选和高性能的数据处理。

## 设计原则

### 1. 智能化搜索
- 支持自然语言搜索和语义理解
- 提供智能搜索建议和自动补全
- 实现容错搜索和拼写纠正
- 支持搜索历史和热门搜索

### 2. 多维度筛选
- 提供丰富的筛选维度和选项
- 支持多选筛选和组合条件
- 实现筛选条件的保存和快速应用
- 提供筛选结果的实时预览

### 3. 高性能体验
- 实现搜索和筛选的实时响应
- 优化大数据量的处理和渲染
- 提供加载状态和进度指示
- 支持分页和虚拟滚动

## 核心组件设计

### 1. 智能搜索框组件 (SmartSearchBox)

#### 视觉设计
```css
.smart-search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.smart-search-box {
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.smart-search-box.focused {
  border-color: #667eea;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.search-input-container {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
}

.search-icon {
  font-size: 20px;
  color: #667eea;
  transition: all 0.2s ease;
}

.smart-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #2d3748;
  background: transparent;
  font-weight: 500;
}

.smart-search-input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.voice-search-button,
.camera-search-button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f7fafc;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-search-button:hover,
.camera-search-button:hover {
  background: #edf2f7;
  color: #667eea;
  transform: scale(1.05);
}

.voice-search-button.recording {
  background: #fed7d7;
  color: #e53e3e;
  animation: pulse 1.5s infinite;
}

.clear-search-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #cbd5e0;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search-button:hover {
  background: #a0aec0;
  transform: scale(1.1);
}

/* 搜索建议下拉框 */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 2px solid #667eea;
  border-top: none;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

.suggestions-header {
  padding: 16px 20px 8px;
  border-bottom: 1px solid #e2e8f0;
}

.suggestions-section {
  padding: 8px 0;
}

.suggestions-section-title {
  padding: 8px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestion-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.suggestion-item:hover {
  background: #f7fafc;
}

.suggestion-item.highlighted {
  background: #edf2f7;
}

.suggestion-icon {
  width: 20px;
  height: 20px;
  color: #a0aec0;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-text {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.suggestion-description {
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

.suggestion-meta {
  font-size: 12px;
  color: #a0aec0;
  flex-shrink: 0;
}

/* 热门搜索标签 */
.popular-searches {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}

.popular-searches-title {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.popular-tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.popular-tag:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

/* 搜索历史 */
.search-history {
  padding: 8px 0;
}

.history-item {
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.history-item:hover {
  background: #f7fafc;
}

.history-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.history-icon {
  width: 16px;
  height: 16px;
  color: #a0aec0;
}

.history-text {
  font-size: 14px;
  color: #4a5568;
  truncate: true;
}

.history-time {
  font-size: 11px;
  color: #a0aec0;
}

.remove-history-button {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: none;
  color: #a0aec0;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  font-size: 12px;
}

.history-item:hover .remove-history-button {
  opacity: 1;
}

.remove-history-button:hover {
  background: #fed7d7;
  color: #e53e3e;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

#### 功能特性
- 智能搜索建议和自动补全
- 语音搜索和图像搜索支持
- 搜索历史记录和热门搜索
- 实时搜索结果预览
- 容错搜索和拼写纠正

### 2. 高级筛选器组件 (AdvancedFilters)

#### 视觉设计
```css
.advanced-filters {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.filters-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filters-title {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters-actions {
  display: flex;
  gap: 12px;
}

.filter-preset-button,
.save-filter-button,
.reset-filters-button {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f7fafc;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-preset-button:hover,
.save-filter-button:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.reset-filters-button:hover {
  background: #fed7d7;
  border-color: #feb2b2;
  color: #e53e3e;
}

.filters-content {
  padding: 24px;
}

.filter-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-group-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group-icon {
  width: 20px;
  height: 20px;
  color: #667eea;
}

/* 分类筛选 */
.category-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.category-option:hover {
  background: #f7fafc;
  border-color: #e2e8f0;
}

.category-option.selected {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.category-checkbox {
  width: 18px;
  height: 18px;
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
  font-size: 12px;
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

.category-count {
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

.category-icon {
  width: 24px;
  height: 24px;
  color: #a0aec0;
}

/* 价格范围筛选 */
.price-range-filter {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price-range-inputs {
  display: flex;
  gap: 12px;
  align-items: center;
}

.price-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.price-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.price-separator {
  color: #a0aec0;
  font-weight: 500;
}

.price-range-slider {
  position: relative;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  margin: 8px 0;
}

.price-range-track {
  position: absolute;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.price-range-thumb {
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border: 3px solid #667eea;
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.2s ease;
}

.price-range-thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.price-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.price-preset {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #f7fafc;
  color: #4a5568;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.price-preset:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.price-preset.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 稀有度筛选 */
.rarity-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rarity-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.rarity-option:hover {
  background: #f7fafc;
  border-color: #e2e8f0;
}

.rarity-option.selected {
  border-color: #667eea;
}

.rarity-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rarity-badge.common {
  background: #edf2f7;
  color: #4a5568;
}

.rarity-badge.rare {
  background: #e6fffa;
  color: #38b2ac;
}

.rarity-badge.epic {
  background: #faf5ff;
  color: #805ad5;
}

.rarity-badge.legendary {
  background: #fffbeb;
  color: #d69e2e;
}

.rarity-info {
  flex: 1;
}

.rarity-name {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.rarity-percentage {
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

/* 状态筛选 */
.status-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-toggle {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-toggle:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.status-toggle.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.status-icon {
  width: 16px;
  height: 16px;
}

/* 筛选结果预览 */
.filter-results-preview {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.results-count {
  font-size: 14px;
  color: #4a5568;
}

.results-count-number {
  font-weight: 700;
  color: #667eea;
}

.apply-filters-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.apply-filters-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.apply-filters-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

#### 功能特性
- 多维度筛选条件组合
- 实时筛选结果预览
- 筛选条件的保存和快速应用
- 智能筛选建议
- 筛选历史和预设模板

### 3. 搜索结果排序组件 (SearchResultsSorting)

#### 视觉设计
```css
.search-results-sorting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 24px;
}

.sorting-options {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sort-label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.sort-dropdown {
  position: relative;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
  justify-content: space-between;
}

.sort-button:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.sort-button.active {
  border-color: #667eea;
  color: #667eea;
}

.sort-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  z-index: 100;
  margin-top: 4px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.sort-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.sort-option:hover {
  background: #f7fafc;
}

.sort-option.selected {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 600;
}

.sort-option-icon {
  width: 16px;
  height: 16px;
}

.view-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle {
  display: flex;
  background: #f7fafc;
  border-radius: 8px;
  padding: 2px;
  border: 1px solid #e2e8f0;
}

.view-toggle-button {
  padding: 8px 12px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #4a5568;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-toggle-button.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #718096;
}

.results-count-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.results-count-number {
  font-weight: 600;
  color: #2d3748;
}

.search-time {
  font-size: 12px;
  color: #a0aec0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

#### 功能特性
- 多种排序选项（价格、时间、热度、相关性等）
- 视图模式切换（网格、列表、大图）
- 搜索结果统计信息
- 排序偏好记忆

### 4. 搜索结果高亮组件 (SearchResultsHighlight)

#### 视觉设计
```css
.search-results-highlight {
  position: relative;
}

.highlight-text {
  background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
  color: #c05621;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
  position: relative;
}

.highlight-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.highlight-text:hover::before {
  opacity: 0.1;
}

.search-match-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 6px;
}

.match-score {
  font-size: 10px;
  opacity: 0.8;
}
```

#### 功能特性
- 搜索关键词高亮显示
- 匹配度评分显示
- 相关性指示器
- 搜索上下文预览

## 交互流程设计

### 1. 智能搜索流程
1. 用户在搜索框中输入关键词
2. 系统实时提供搜索建议和自动补全
3. 显示搜索历史和热门搜索
4. 用户选择建议或继续输入
5. 系统执行搜索并高亮显示结果

### 2. 高级筛选流程
1. 用户点击筛选器展开筛选选项
2. 选择多个筛选条件和参数
3. 系统实时预览筛选结果数量
4. 用户确认应用筛选条件
5. 系统更新搜索结果并保存筛选偏好

### 3. 搜索结果浏览流程
1. 系统显示搜索结果和统计信息
2. 用户可以切换排序方式和视图模式
3. 支持无限滚动或分页浏览
4. 提供搜索结果的快速预览
5. 支持搜索结果的收藏和分享

## 响应式设计

### 桌面端 (≥1024px)
- 搜索框和筛选器并排显示
- 支持悬停效果和快捷键操作
- 显示完整的筛选选项和排序功能

### 平板端 (768px - 1023px)
- 筛选器可折叠显示
- 搜索框适当缩小但保持功能完整
- 简化部分筛选选项的显示

### 移动端 (<768px)
- 搜索框全宽显示
- 筛选器以底部抽屉形式展示
- 简化排序选项，优化触摸操作

## 可访问性考虑

### 键盘导航
- 支持Tab键在搜索和筛选元素间导航
- 支持方向键在搜索建议中移动
- 支持Enter键确认选择和搜索

### 屏幕阅读器
- 为所有交互元素提供适当的aria-label
- 使用语义化的HTML结构
- 提供搜索状态和结果的文字描述

### 视觉辅助
- 确保足够的颜色对比度
- 提供清晰的焦点指示器
- 支持高对比度和大字体模式

## 性能优化

### 搜索优化
- 实现搜索防抖，减少不必要的请求
- 使用搜索结果缓存，提高响应速度
- 支持搜索建议的预加载

### 筛选优化
- 使用虚拟滚动处理大量筛选选项
- 实现筛选条件的本地缓存
- 优化筛选算法的执行效率

### 数据加载
- 实现搜索结果的分页加载
- 使用骨架屏提升加载体验
- 支持搜索结果的预取

## 智能功能设计

### 搜索建议算法
- 基于用户历史搜索的个性化建议
- 热门搜索和趋势关键词推荐
- 语义相似度匹配和同义词扩展

### 容错搜索
- 拼写错误自动纠正
- 模糊匹配和近似搜索
- 多语言搜索支持

### 搜索分析
- 搜索行为数据收集和分析
- 搜索效果评估和优化
- 个性化搜索结果排序

## 实现建议

### React组件结构
```javascript
// 主要组件层次结构
SearchAndFilter
├── SmartSearchBox (智能搜索框)
├── AdvancedFilters (高级筛选器)
├── SearchResultsSorting (结果排序)
├── SearchResultsHighlight (结果高亮)
└── SearchAnalytics (搜索分析)
```

### 状态管理
```javascript
// 搜索和筛选状态
const searchState = {
  query: '',
  suggestions: [],
  history: [],
  filters: {
    category: [],
    priceRange: [0, 1000],
    rarity: [],
    status: []
  },
  sorting: {
    field: 'relevance',
    order: 'desc'
  },
  results: [],
  pagination: {
    page: 1,
    total: 0,
    hasMore: true
  },
  ui: {
    showSuggestions: false,
    showFilters: false,
    viewMode: 'grid'
  }
};
```

### API设计
```javascript
// 主要API接口
const searchAPI = {
  search: (query, filters, sorting, pagination) => Promise,
  getSuggestions: (query) => Promise,
  getPopularSearches: () => Promise,
  saveSearchHistory: (query) => Promise,
  getFilterOptions: () => Promise,
  saveFilterPreset: (name, filters) => Promise
};
```

这个设计规范为NFT搜索和筛选功能提供了完整的UI/UX指导，确保用户能够快速、准确地找到所需的NFT，同时提供智能化的搜索体验和个性化的筛选功能。

