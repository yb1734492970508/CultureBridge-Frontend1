# NFT批量操作功能UI/UX设计规范

## 设计概述

NFT批量操作功能旨在提升用户在NFT市场中的操作效率，允许用户同时对多个NFT执行相同操作，如批量收藏、批量购买、批量出价等。本设计规范将确保批量操作功能具有直观的用户界面、流畅的交互体验和清晰的反馈机制。

## 设计原则

### 1. 效率优先
- 减少用户操作步骤，提高批量操作效率
- 提供快速选择和批量确认机制
- 优化大量数据的加载和渲染性能

### 2. 清晰反馈
- 明确显示选中状态和操作进度
- 提供详细的操作结果反馈
- 实时显示Gas费用估算和交易状态

### 3. 安全可控
- 提供操作预览和确认机制
- 支持操作撤销和错误恢复
- 明确显示操作风险和成本

## 核心组件设计

### 1. NFT选择器组件 (NFTBatchSelector)

#### 视觉设计
```css
.nft-batch-selector {
  position: relative;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nft-batch-selector:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.nft-selector-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid #e1e5e9;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  z-index: 2;
}

.nft-selector-checkbox.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  transform: scale(1.1);
}

.nft-selector-checkbox::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nft-selector-checkbox.selected::after {
  opacity: 1;
}

.nft-selector-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid #667eea;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nft-batch-selector.selected .nft-selector-overlay {
  opacity: 1;
}
```

#### 交互行为
- 点击NFT卡片任意位置切换选中状态
- 悬停时显示选择提示
- 支持Shift+点击进行范围选择
- 支持Ctrl/Cmd+点击进行多选

### 2. 批量操作工具栏 (BatchOperationToolbar)

#### 视觉设计
```css
.batch-operation-toolbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 16px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  transition: all 0.3s ease;
}

.batch-operation-toolbar.hidden {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
  pointer-events: none;
}

.toolbar-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-count {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-weight: 500;
}

.selected-count-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
}

.batch-action-button {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.batch-action-button.secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.batch-action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.clear-selection-button {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.clear-selection-button:hover {
  background: #f7fafc;
  color: #4a5568;
}
```

#### 功能按钮
- **批量收藏**: 将选中的NFT添加到收藏夹
- **批量购买**: 对选中的固定价格NFT进行批量购买
- **批量出价**: 对选中的拍卖NFT进行批量出价
- **添加到收藏集**: 将选中的NFT添加到自定义收藏集
- **清除选择**: 取消所有选中状态

### 3. 批量操作确认弹窗 (BatchOperationModal)

#### 视觉设计
```css
.batch-operation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #a0aec0;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f7fafc;
  color: #4a5568;
}

.operation-summary {
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-item:last-child {
  margin-bottom: 0;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  font-weight: 600;
}

.selected-nfts-preview {
  margin-bottom: 24px;
}

.nfts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.nft-preview-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.nft-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 4px;
  font-size: 10px;
  text-align: center;
}

.gas-estimation {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.gas-estimation.loading {
  background: #f0fff4;
  border-color: #c6f6d5;
}

.gas-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.gas-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 14px;
}

.gas-item {
  display: flex;
  justify-content: space-between;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-button {
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-button.secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.modal-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### 功能特性
- 显示选中NFT的预览网格
- 实时计算和显示Gas费用估算
- 提供操作摘要和总成本
- 支持操作确认和取消

### 4. 批量操作进度指示器 (BatchOperationProgress)

#### 视觉设计
```css
.batch-operation-progress {
  position: fixed;
  top: 24px;
  right: 24px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e2e8f0;
  min-width: 320px;
  z-index: 1500;
  animation: slideInRight 0.3s ease;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.progress-title {
  font-weight: 600;
  color: #2d3748;
}

.progress-status {
  font-size: 14px;
  color: #4a5568;
}

.progress-bar-container {
  background: #f7fafc;
  border-radius: 8px;
  height: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  transition: width 0.3s ease;
}

.progress-details {
  font-size: 14px;
  color: #4a5568;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
}

.progress-icon.pending {
  background: #a0aec0;
}

.progress-icon.processing {
  background: #667eea;
  animation: pulse 1.5s infinite;
}

.progress-icon.completed {
  background: #48bb78;
}

.progress-icon.failed {
  background: #f56565;
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

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

#### 功能特性
- 实时显示批量操作进度
- 显示每个NFT的处理状态
- 提供操作成功/失败的详细反馈
- 支持操作取消和重试

## 交互流程设计

### 1. NFT选择流程
1. 用户浏览NFT市场页面
2. 点击NFT卡片左上角的复选框或卡片本身进行选择
3. 选中的NFT显示蓝色边框和选中标识
4. 底部工具栏显示选中数量和可用操作

### 2. 批量操作流程
1. 用户在工具栏中选择操作类型（收藏、购买、出价等）
2. 系统打开确认弹窗，显示操作摘要和Gas估算
3. 用户确认操作后，系统开始执行批量操作
4. 显示进度指示器，实时更新操作状态
5. 操作完成后显示结果摘要

### 3. 错误处理流程
1. 如果部分操作失败，显示详细的错误信息
2. 提供重试失败操作的选项
3. 允许用户查看成功和失败的操作详情
4. 提供操作日志和交易哈希

## 响应式设计

### 桌面端 (≥1024px)
- 显示完整的工具栏和所有操作按钮
- 支持悬停效果和快捷键操作
- 确认弹窗使用较大的尺寸和网格布局

### 平板端 (768px - 1023px)
- 工具栏按钮适当缩小，保持核心功能
- 确认弹窗调整为单列布局
- 进度指示器位置调整到屏幕中央

### 移动端 (<768px)
- 工具栏固定在底部，使用图标+文字的紧凑布局
- 确认弹窗全屏显示，优化触摸操作
- 简化NFT预览网格，每行显示4-5个

## 可访问性考虑

### 键盘导航
- 支持Tab键在可选择的NFT之间导航
- 支持空格键切换选中状态
- 支持Enter键确认操作

### 屏幕阅读器
- 为所有交互元素提供适当的aria-label
- 使用语义化的HTML结构
- 提供操作状态的文字描述

### 视觉辅助
- 确保足够的颜色对比度
- 不仅依赖颜色传达信息
- 提供清晰的焦点指示器

## 性能优化

### 虚拟滚动
- 对于大量NFT的页面，使用虚拟滚动技术
- 只渲染可见区域的NFT卡片
- 优化选择状态的管理和更新

### 批量操作优化
- 使用Web Workers处理大量数据计算
- 实现操作队列和并发控制
- 提供操作取消和暂停功能

### 缓存策略
- 缓存NFT元数据和图片
- 缓存Gas价格和网络状态
- 使用本地存储保存用户选择偏好

## 动画和过渡效果

### 选择动画
- NFT选中时的缩放和边框动画
- 工具栏出现和消失的滑动动画
- 复选框的勾选动画

### 加载动画
- Gas估算时的加载指示器
- 批量操作的进度动画
- 网络请求的骨架屏

### 反馈动画
- 操作成功的绿色闪烁效果
- 操作失败的红色抖动效果
- 悬停时的微妙提升效果

## 实现建议

### React组件结构
```javascript
// 主要组件层次结构
NFTMarketplace
├── NFTBatchSelector (包装每个NFT卡片)
├── BatchOperationToolbar (底部工具栏)
├── BatchOperationModal (确认弹窗)
├── BatchOperationProgress (进度指示器)
└── BatchOperationResult (结果展示)
```

### 状态管理
```javascript
// 使用Context或Redux管理批量操作状态
const batchOperationState = {
  selectedNFTs: [],
  operationType: null,
  isOperating: false,
  progress: {
    total: 0,
    completed: 0,
    failed: 0
  },
  gasEstimation: null,
  results: []
};
```

### 事件处理
```javascript
// 主要事件处理函数
const handleNFTSelect = (nftId, isSelected) => {
  // 更新选中状态
};

const handleBatchOperation = (operationType) => {
  // 执行批量操作
};

const handleOperationConfirm = () => {
  // 确认并开始操作
};
```

这个设计规范为NFT批量操作功能提供了完整的UI/UX指导，确保用户能够高效、安全地进行批量操作，同时保持良好的用户体验和视觉一致性。

