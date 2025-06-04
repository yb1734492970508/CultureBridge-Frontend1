# NFT成就与治理系统前端组件设计规范

## 1. 设计理念

CultureBridge的NFT成就与治理系统前端设计遵循以下核心理念：

- **一致性**：保持与平台整体设计语言的一致性，同时突出NFT与治理的独特视觉特征
- **可访问性**：确保所有用户，包括不同设备和能力的用户，都能轻松使用系统功能
- **直观性**：通过清晰的视觉层次和交互反馈，使复杂的治理概念变得易于理解
- **沉浸感**：为NFT成就提供视觉上令人印象深刻的展示，增强用户成就感
- **响应式**：设计同时适应桌面和移动设备，提供一致的用户体验

## 2. 色彩系统

### 2.1 主色调

| 颜色名称 | 十六进制值 | 使用场景 |
|---------|-----------|---------|
| 主要蓝色 | #3366FF | 主按钮、重点元素、活跃状态 |
| 深蓝色 | #1A3A8F | 标题、重要文本、边框 |
| 亮蓝色 | #66A3FF | 次要按钮、高亮元素、链接 |

### 2.2 辅助色调

| 颜色名称 | 十六进制值 | 使用场景 |
|---------|-----------|---------|
| 成功绿色 | #2ECC71 | 成功状态、通过提案、解锁成就 |
| 警告黄色 | #F1C40F | 警告、需要注意的信息、投票中提案 |
| 错误红色 | #E74C3C | 错误信息、被拒绝的提案、危险操作 |
| 中性灰色 | #95A5A6 | 禁用状态、次要信息、分隔线 |

### 2.3 NFT稀有度色彩

| 稀有度 | 十六进制值 | 渐变效果 |
|-------|-----------|---------|
| 普通 | #B0BEC5 | 线性渐变 #B0BEC5 → #90A4AE |
| 稀有 | #29B6F6 | 线性渐变 #29B6F6 → #0288D1 |
| 史诗 | #AB47BC | 线性渐变 #AB47BC → #7B1FA2 |
| 传奇 | #FFA000 | 线性渐变 #FFA000 → #FF6F00 |
| 神话 | #F44336 | 线性渐变 #F44336 → #C62828 |

## 3. 排版系统

### 3.1 字体家族

- **主要字体**：'Roboto', sans-serif
- **标题字体**：'Montserrat', sans-serif
- **代码字体**：'Roboto Mono', monospace

### 3.2 字体大小

| 用途 | 桌面尺寸 | 移动尺寸 | 字重 |
|------|---------|---------|------|
| 大标题 | 32px | 24px | 700 |
| 中标题 | 24px | 20px | 600 |
| 小标题 | 20px | 18px | 600 |
| 正文 | 16px | 14px | 400 |
| 小文本 | 14px | 12px | 400 |
| 微文本 | 12px | 10px | 400 |

### 3.3 行高与间距

- **标题行高**：1.2
- **正文行高**：1.5
- **段落间距**：正文字体大小的1.5倍
- **组件间距**：8px的倍数（8px, 16px, 24px, 32px等）

## 4. 核心UI组件

### 4.1 NFT成就卡片

#### 设计规范

- **尺寸**：桌面版320px×420px，移动版280px×380px
- **圆角**：12px
- **阴影**：根据稀有度不同，阴影深度和颜色有所区别
- **边框**：2px，颜色对应稀有度
- **布局**：上部70%为NFT图像，下部30%为信息区

#### 组件结构

```
+----------------------------------+
|                                  |
|                                  |
|           NFT图像区域            |
|                                  |
|                                  |
|                                  |
+----------------------------------+
|  成就名称         稀有度标签     |
+----------------------------------+
|  成就描述                        |
+----------------------------------+
|  解锁日期         权益图标       |
+----------------------------------+
```

#### 交互状态

- **默认状态**：显示基本信息
- **悬停状态**：轻微放大（1.05倍），阴影加深
- **点击状态**：打开详情模态框
- **未解锁状态**：灰度滤镜，锁定图标覆盖

### 4.2 成就进度追踪器

#### 设计规范

- **高度**：桌面版8px，移动版6px
- **圆角**：4px
- **颜色**：背景色#E0E0E0，进度色对应成就类型

#### 组件结构

```
进度文本 [███████████░░░░░░░░] 百分比
```

#### 交互状态

- **悬停状态**：显示详细进度信息工具提示
- **完成状态**：进度条填满，显示完成动画

### 4.3 治理提案卡片

#### 设计规范

- **尺寸**：宽度100%，高度自适应
- **圆角**：8px
- **边框**：1px，颜色#E0E0E0
- **阴影**：轻微阴影，提升层次感

#### 组件结构

```
+----------------------------------+
| 提案类型标签       提案状态标签  |
+----------------------------------+
| 提案标题                         |
+----------------------------------+
| 提案摘要                         |
+----------------------------------+
| 提案人 | 创建时间 | 投票截止时间 |
+----------------------------------+
| 投票进度条                       |
+----------------------------------+
| 赞成: XX% | 反对: XX% | 弃权: XX% |
+----------------------------------+
| [查看详情]        [投票按钮]     |
+----------------------------------+
```

#### 交互状态

- **悬停状态**：轻微阴影加深
- **点击状态**：打开提案详情页
- **已投票状态**：显示用户投票选择
- **已结束状态**：显示最终结果和执行状态

### 4.4 投票权重计算器

#### 设计规范

- **尺寸**：宽度100%，高度自适应
- **圆角**：8px
- **背景**：浅色背景，突出显示

#### 组件结构

```
+----------------------------------+
| 您的总投票权重: XXX              |
+----------------------------------+
| 基础权重(代币): XXX    XX%       |
| NFT加成权重:    XXX    XX%       |
| 声誉加成权重:   XXX    XX%       |
| 质押加成权重:   XXX    XX%       |
+----------------------------------+
| [详细说明]                       |
+----------------------------------+
```

#### 交互状态

- **悬停状态**：显示每项权重的计算方式
- **点击详细说明**：展开更多权重信息和优化建议

### 4.5 权益汇总面板

#### 设计规范

- **尺寸**：宽度100%，高度自适应
- **分区**：清晰的视觉分隔，便于理解不同类型的权益

#### 组件结构

```
+----------------------------------+
| 您的NFT与治理权益                |
+----------------------------------+
| 投票权益                         |
| - 投票权重加成: +XX%             |
| - 提案优先级: 提升X级            |
+----------------------------------+
| 经济权益                         |
| - 学习奖励加成: +XX%             |
| - 创作奖励加成: +XX%             |
| - 提案费用折扣: -XX%             |
+----------------------------------+
| 特殊权益                         |
| - 专属功能访问权                 |
| - 社区角色标识                   |
+----------------------------------+
```

#### 交互状态

- **折叠/展开**：各权益类别可折叠展开
- **权益来源**：悬停显示权益来源（哪些NFT提供）

## 5. 页面布局

### 5.1 NFT成就展示页

#### 桌面布局

```
+----------------------------------+
| 导航栏                           |
+----------------------------------+
| 用户NFT统计 | 筛选器 | 排序选项  |
+----------------------------------+
| [NFT卡片] [NFT卡片] [NFT卡片]    |
| [NFT卡片] [NFT卡片] [NFT卡片]    |
+----------------------------------+
| 分页控件                         |
+----------------------------------+
```

#### 移动布局

```
+----------------------------------+
| 导航栏                           |
+----------------------------------+
| 用户NFT统计                      |
+----------------------------------+
| 筛选器 | 排序选项                |
+----------------------------------+
| [NFT卡片]                        |
| [NFT卡片]                        |
| [NFT卡片]                        |
+----------------------------------+
| 分页控件                         |
+----------------------------------+
```

### 5.2 治理提案列表页

#### 桌面布局

```
+----------------------------------+
| 导航栏                           |
+----------------------------------+
| 治理统计数据                     |
+----------------------------------+
| 提案类型筛选 | 状态筛选 | 搜索框 |
+----------------------------------+
| [提案卡片]                       |
| [提案卡片]                       |
| [提案卡片]                       |
+----------------------------------+
| 分页控件                         |
+----------------------------------+
| [创建提案按钮]                   |
+----------------------------------+
```

#### 移动布局

```
+----------------------------------+
| 导航栏                           |
+----------------------------------+
| 治理统计数据                     |
+----------------------------------+
| 筛选器 | 搜索框                  |
+----------------------------------+
| [提案卡片]                       |
| [提案卡片]                       |
| [提案卡片]                       |
+----------------------------------+
| 分页控件                         |
+----------------------------------+
| [创建提案按钮]                   |
+----------------------------------+
```

### 5.3 提案详情页

#### 桌面布局

```
+----------------------------------+
| 导航栏                           |
+----------------------------------+
| 返回按钮 | 提案ID | 提案状态     |
+----------------------------------+
| 提案标题                         |
+----------------------------------+
| 提案人 | 创建时间 | 投票截止时间 |
+----------------------------------+
+----------------------------------+
| 提案详情 | 投票情况 | 执行内容   |
| (标签切换)                       |
+----------------------------------+
| 标签内容区域                     |
|                                  |
|                                  |
+----------------------------------+
| 投票区域                         |
| [赞成] [反对] [弃权]             |
+----------------------------------+
| 评论区域                         |
+----------------------------------+
```

#### 移动布局

```
+----------------------------------+
| 导航栏                           |
+----------------------------------+
| 返回按钮 | 提案状态              |
+----------------------------------+
| 提案标题                         |
+----------------------------------+
| 提案人 | 创建时间                |
| 投票截止时间                     |
+----------------------------------+
| 提案详情 | 投票情况 | 执行内容   |
| (标签切换)                       |
+----------------------------------+
| 标签内容区域                     |
|                                  |
|                                  |
+----------------------------------+
| 投票区域                         |
| [赞成] [反对] [弃权]             |
+----------------------------------+
| 评论区域                         |
+----------------------------------+
```

### 5.4 用户仪表盘

#### 桌面布局

```
+----------------------------------+
| 导航栏                           |
+----------------------------------+
| 用户信息 | 总体统计              |
+----------------------------------+
| NFT成就概览 | 治理参与概览       |
+----------------------------------+
| 最近解锁的NFT | 活跃中的提案     |
+----------------------------------+
| 权益汇总面板                     |
+----------------------------------+
| 下一个可解锁成就 | 推荐治理活动  |
+----------------------------------+
```

#### 移动布局

```
+----------------------------------+
| 导航栏                           |
+----------------------------------+
| 用户信息                         |
+----------------------------------+
| 总体统计                         |
+----------------------------------+
| NFT成就概览                      |
+----------------------------------+
| 治理参与概览                     |
+----------------------------------+
| 最近解锁的NFT                    |
+----------------------------------+
| 活跃中的提案                     |
+----------------------------------+
| 权益汇总面板                     |
+----------------------------------+
| 下一个可解锁成就                 |
+----------------------------------+
| 推荐治理活动                     |
+----------------------------------+
```

## 6. 动画与过渡效果

### 6.1 NFT成就动画

- **解锁动画**：光芒四射效果，从中心向外扩散
- **稀有度展示**：根据稀有度不同，有不同的粒子效果和光晕
- **卡片翻转**：3D翻转效果，正面显示图像，背面显示详细信息
- **收集动画**：新NFT飞入收藏夹的动画效果

### 6.2 治理交互动画

- **投票提交**：投票选项选中后的确认动画
- **提案状态变更**：状态标签平滑过渡效果
- **投票进度更新**：进度条平滑增长动画
- **提案创建成功**：成功提示与跳转动画

### 6.3 页面过渡效果

- **页面加载**：内容块依次淡入
- **列表滚动**：平滑滚动，元素进入视口时的淡入效果
- **模态框**：平滑的缩放和淡入淡出效果
- **标签切换**：内容滑动过渡效果

## 7. 响应式设计策略

### 7.1 断点设置

- **移动端**：< 768px
- **平板端**：768px - 1024px
- **桌面端**：> 1024px

### 7.2 布局调整策略

- **卡片网格**：桌面3列，平板2列，移动1列
- **信息密度**：移动端减少非核心信息显示
- **交互调整**：移动端增大点击区域，优化触摸操作
- **导航转换**：桌面顶部导航栏在移动端转为底部标签栏或汉堡菜单

### 7.3 触摸优化

- **滑动操作**：支持左右滑动切换NFT卡片
- **下拉刷新**：支持下拉刷新最新数据
- **长按操作**：长按NFT卡片显示快捷操作菜单
- **双指缩放**：支持NFT图像的缩放查看

## 8. 可访问性考量

### 8.1 色彩对比

- 所有文本与背景的对比度符合WCAG 2.1 AA标准
- 提供高对比度模式选项
- 不仅依靠颜色传达信息，同时使用图标和文本

### 8.2 键盘导航

- 所有交互元素可通过键盘访问
- 清晰的焦点状态指示
- 逻辑的标签顺序

### 8.3 屏幕阅读器支持

- 所有图像提供替代文本
- 复杂组件使用适当的ARIA标签
- 动态内容变化时提供适当的通知

## 9. 前端集成指南

### 9.1 组件库集成

- 基于React组件库实现
- 使用Styled Components或Emotion进行样式管理
- 组件结构遵循原子设计原则

### 9.2 状态管理

- 使用Redux存储全局状态
- NFT和治理数据使用规范化存储
- 使用Redux Thunk或Saga处理异步操作

### 9.3 合约交互

- 使用ethers.js或web3.js与智能合约交互
- 实现合约事件监听机制
- 本地缓存策略减少区块链查询

### 9.4 性能优化

- 组件懒加载
- 虚拟列表渲染大量NFT或提案
- 图像优化与渐进式加载
- 合理的数据预取与缓存策略

## 10. 实现示例

### 10.1 NFT成就卡片React组件

```jsx
import React from 'react';
import styled from 'styled-components';

const rarityColors = {
  common: { main: '#B0BEC5', gradient: 'linear-gradient(135deg, #B0BEC5 0%, #90A4AE 100%)' },
  rare: { main: '#29B6F6', gradient: 'linear-gradient(135deg, #29B6F6 0%, #0288D1 100%)' },
  epic: { main: '#AB47BC', gradient: 'linear-gradient(135deg, #AB47BC 0%, #7B1FA2 100%)' },
  legendary: { main: '#FFA000', gradient: 'linear-gradient(135deg, #FFA000 0%, #FF6F00 100%)' },
  mythic: { main: '#F44336', gradient: 'linear-gradient(135deg, #F44336 0%, #C62828 100%)' },
};

const Card = styled.div`
  width: ${props => props.isMobile ? '280px' : '320px'};
  height: ${props => props.isMobile ? '380px' : '420px'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 2px solid ${props => rarityColors[props.rarity].main};
  background-color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  }
`;

const ImageContainer = styled.div`
  height: 70%;
  background: ${props => rarityColors[props.rarity].gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  
  ${props => props.unlocked ? '' : `
    filter: grayscale(100%);
    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: white;
    }
  `}
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoContainer = styled.div`
  padding: 12px;
  height: 30%;
  display: flex;
  flex-direction: column;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.h3`
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: ${props => props.isMobile ? '16px' : '18px'};
  color: #1A3A8F;
`;

const RarityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background: ${props => rarityColors[props.rarity].gradient};
`;

const Description = styled.p`
  margin: 0 0 8px 0;
  font-size: ${props => props.isMobile ? '12px' : '14px'};
  color: #4A4A4A;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UnlockDate = styled.span`
  font-size: 12px;
  color: #95A5A6;
`;

const BenefitIcons = styled.div`
  display: flex;
  gap: 4px;
`;

const BenefitIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
`;

const AchievementCard = ({ 
  id, 
  name, 
  description, 
  imageUrl, 
  rarity, 
  unlockDate, 
  benefits, 
  unlocked, 
  isMobile,
  onClick 
}) => {
  return (
    <Card rarity={rarity} isMobile={isMobile} onClick={onClick}>
      <ImageContainer rarity={rarity} unlocked={unlocked}>
        <Image src={imageUrl} alt={name} />
      </ImageContainer>
      <InfoContainer>
        <TitleRow>
          <Title isMobile={isMobile}>{name}</Title>
          <RarityBadge rarity={rarity}>
            {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </RarityBadge>
        </TitleRow>
        <Description isMobile={isMobile}>{description}</Description>
        <BottomRow>
          <UnlockDate>{unlocked ? `解锁于 ${unlockDate}` : '未解锁'}</UnlockDate>
          <BenefitIcons>
            {benefits.map((benefit, index) => (
              <BenefitIcon key={index} color={benefit.color} title={benefit.name}>
                {benefit.icon}
              </BenefitIcon>
            ))}
          </BenefitIcons>
        </BottomRow>
      </InfoContainer>
    </Card>
  );
};

export default AchievementCard;
```

### 10.2 投票权重计算器React组件

```jsx
import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  border-radius: 8px;
  background-color: #F8F9FA;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const TotalWeight = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1A3A8F;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E0E0E0;
`;

const WeightItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const WeightLabel = styled.div`
  font-size: 14px;
  color: #4A4A4A;
`;

const WeightValue = styled.div`
  display: flex;
  align-items: center;
`;

const WeightNumber = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1A3A8F;
  margin-right: 8px;
`;

const WeightPercentage = styled.span`
  font-size: 12px;
  color: #95A5A6;
`;

const DetailButton = styled.button`
  background: none;
  border: none;
  color: #3366FF;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  text-align: left;
  margin-top: 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DetailPanel = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #E0E0E0;
  font-size: 13px;
  color: #4A4A4A;
  line-height: 1.5;
`;

const VotingWeightCalculator = ({ 
  totalWeight, 
  tokenWeight, 
  nftBonus, 
  reputationBonus, 
  stakingBonus 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const tokenPercentage = Math.round((tokenWeight / totalWeight) * 100);
  const nftPercentage = Math.round((nftBonus / totalWeight) * 100);
  const reputationPercentage = Math.round((reputationBonus / totalWeight) * 100);
  const stakingPercentage = Math.round((stakingBonus / totalWeight) * 100);
  
  return (
    <Container>
      <TotalWeight>您的总投票权重: {totalWeight}</TotalWeight>
      
      <WeightItem>
        <WeightLabel>基础权重(代币):</WeightLabel>
        <WeightValue>
          <WeightNumber>{tokenWeight}</WeightNumber>
          <WeightPercentage>{tokenPercentage}%</WeightPercentage>
        </WeightValue>
      </WeightItem>
      
      <WeightItem>
        <WeightLabel>NFT加成权重:</WeightLabel>
        <WeightValue>
          <WeightNumber>{nftBonus}</WeightNumber>
          <WeightPercentage>{nftPercentage}%</WeightPercentage>
        </WeightValue>
      </WeightItem>
      
      <WeightItem>
        <WeightLabel>声誉加成权重:</WeightLabel>
        <WeightValue>
          <WeightNumber>{reputationBonus}</WeightNumber>
          <WeightPercentage>{reputationPercentage}%</WeightPercentage>
        </WeightValue>
      </WeightItem>
      
      <WeightItem>
        <WeightLabel>质押加成权重:</WeightLabel>
        <WeightValue>
          <WeightNumber>{stakingBonus}</WeightNumber>
          <WeightPercentage>{stakingPercentage}%</WeightPercentage>
        </WeightValue>
      </WeightItem>
      
      <DetailButton onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? '隐藏详细说明' : '查看详细说明'}
      </DetailButton>
      
      {showDetails && (
        <DetailPanel>
          <p><strong>基础权重</strong>: 基于您持有的CBT代币数量，每1个CBT提供1个基础投票权重。</p>
          <p><strong>NFT加成</strong>: 来自您持有的成就NFT，不同稀有度和类型提供不同加成。</p>
          <p><strong>声誉加成</strong>: 基于您的平台声誉评分，每10点声誉提供1%的权重加成。</p>
          <p><strong>质押加成</strong>: 基于您质押的CBT数量，质押时间越长加成越高。</p>
          <p><strong>提升投票权重的建议</strong>: 解锁更多治理相关NFT成就，增加代币质押时间，积极参与平台活动提升声誉。</p>
        </DetailPanel>
      )}
    </Container>
  );
};

export default VotingWeightCalculator;
```

### 10.3 提案卡片React组件

```jsx
import React from 'react';
import styled from 'styled-components';

const proposalStatusColors = {
  pending: { bg: '#F8F9FA', text: '#4A4A4A' },
  active: { bg: '#E3F2FD', text: '#1976D2' },
  passed: { bg: '#E8F5E9', text: '#2E7D32' },
  rejected: { bg: '#FFEBEE', text: '#C62828' },
  executed: { bg: '#E8F5E9', text: '#2E7D32' },
  canceled: { bg: '#FAFAFA', text: '#757575' },
  expired: { bg: '#EEEEEE', text: '#616161' },
};

const proposalTypeColors = {
  parameter: { bg: '#E0F7FA', text: '#00838F' },
  funding: { bg: '#FFF3E0', text: '#E65100' },
  feature: { bg: '#F3E5F5', text: '#6A1B9A' },
  community: { bg: '#E8F5E9', text: '#2E7D32' },
  emergency: { bg: '#FFEBEE', text: '#C62828' },
};

const Card = styled.div`
  width: 100%;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #E0E0E0;
  padding: 16px;
  margin-bottom: 16px;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const TypeBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => proposalTypeColors[props.type].bg};
  color: ${props => proposalTypeColors[props.type].text};
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => proposalStatusColors[props.status].bg};
  color: ${props => proposalStatusColors[props.status].text};
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #1A3A8F;
`;

const Summary = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #4A4A4A;
  line-height: 1.5;
`;

const MetaInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #95A5A6;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
`;

const ProgressContainer = styled.div`
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  height: 6px;
  background-color: #E0E0E0;
  border-radius: 3px;
  margin-bottom: 8px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: ${props => {
    if (props.percentage >= 50) return '#2ECC71';
    if (props.percentage >= 30) return '#F1C40F';
    return '#E74C3C';
  }};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const VoteStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #4A4A4A;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;

const DetailButton = styled.button`
  background: none;
  border: 1px solid #3366FF;
  color: #3366FF;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  
  &:hover {
    background-color: #3366FF;
    color: white;
  }
`;

const VoteButton = styled.button`
  background-color: #3366FF;
  border: none;
  color: white;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #2952CC;
  }
  
  ${props => props.disabled && `
    background-color: #95A5A6;
    cursor: not-allowed;
    
    &:hover {
      background-color: #95A5A6;
    }
  `}
`;

const ProposalCard = ({
  id,
  title,
  summary,
  type,
  status,
  proposer,
  createdAt,
  endTime,
  forVotes,
  againstVotes,
  abstainVotes,
  onViewDetails,
  onVote,
  userVoted,
  isMobile
}) => {
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const forPercentage = totalVotes > 0 ? Math.round((forVotes / totalVotes) * 100) : 0;
  const againstPercentage = totalVotes > 0 ? Math.round((againstVotes / totalVotes) * 100) : 0;
  const abstainPercentage = totalVotes > 0 ? Math.round((abstainVotes / totalVotes) * 100) : 0;
  
  const isActive = status === 'active';
  
  return (
    <Card>
      <Header>
        <TypeBadge type={type}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </TypeBadge>
        <StatusBadge status={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </StatusBadge>
      </Header>
      
      <Title>{title}</Title>
      <Summary>{summary}</Summary>
      
      <MetaInfo>
        <MetaItem>提案人: {proposer}</MetaItem>
        <MetaItem>创建时间: {createdAt}</MetaItem>
        <MetaItem>投票截止: {endTime}</MetaItem>
      </MetaInfo>
      
      <ProgressContainer>
        <ProgressBar>
          <Progress percentage={forPercentage} />
        </ProgressBar>
        <VoteStats>
          <span>赞成: {forPercentage}%</span>
          <span>反对: {againstPercentage}%</span>
          <span>弃权: {abstainPercentage}%</span>
        </VoteStats>
      </ProgressContainer>
      
      <Footer>
        <DetailButton onClick={() => onViewDetails(id)}>
          查看详情
        </DetailButton>
        
        <VoteButton 
          disabled={!isActive || userVoted} 
          onClick={() => onVote(id)}
        >
          {userVoted ? '已投票' : '投票'}
        </VoteButton>
      </Footer>
    </Card>
  );
};

export default ProposalCard;
```

## 11. 结论

本设计规范为CultureBridge的NFT成就与治理系统前端组件提供了全面的设计指导，包括设计理念、色彩系统、排版系统、核心UI组件、页面布局、动画效果、响应式设计策略、可访问性考量和前端集成指南。通过遵循这些规范，开发团队可以创建一个视觉一致、用户友好且功能强大的NFT成就与治理系统前端界面，为用户提供优质的使用体验。

设计规范将随着项目的发展不断更新和完善，以适应新的需求和技术变化。前端开发团队应定期参考最新版本的设计规范，确保实现的组件与设计意图保持一致。
