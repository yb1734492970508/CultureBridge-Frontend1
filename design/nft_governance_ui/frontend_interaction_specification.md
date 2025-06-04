# 成就触发与治理流程系统前端交互规范 (CB-DESIGN for CB-FEATURES & CB-FRONTEND - Day 14)

## 1. 概述

本文档为CB-FEATURES和CB-FRONTEND团队提供成就触发系统与治理流程系统的前端交互规范，确保两个团队在开发过程中能够无缝协作，提供一致的用户体验。本规范详细定义了API交互模式、数据结构、状态管理、错误处理和用户体验设计等方面的标准，是对前期设计文档的补充和细化。

## 2. API交互规范

### 2.1 RESTful API端点标准

所有API端点应遵循以下命名和设计规范：

| 资源类型 | HTTP方法 | 端点格式 | 示例 | 说明 |
|---------|---------|---------|------|------|
| 集合资源 | GET | `/api/v1/{resources}` | `/api/v1/achievements` | 获取资源列表 |
| 单一资源 | GET | `/api/v1/{resources}/{id}` | `/api/v1/achievements/123` | 获取单个资源 |
| 子资源集合 | GET | `/api/v1/{resources}/{id}/{subresources}` | `/api/v1/users/456/achievements` | 获取关联子资源列表 |
| 创建资源 | POST | `/api/v1/{resources}` | `/api/v1/proposals` | 创建新资源 |
| 更新资源 | PUT/PATCH | `/api/v1/{resources}/{id}` | `/api/v1/proposals/789` | 更新资源 |
| 删除资源 | DELETE | `/api/v1/{resources}/{id}` | `/api/v1/votes/101` | 删除资源 |
| 操作资源 | POST | `/api/v1/{resources}/{id}/{action}` | `/api/v1/proposals/789/execute` | 对资源执行操作 |

### 2.2 成就系统API端点

成就触发系统应提供以下核心API端点：

```
GET /api/v1/achievements                  # 获取成就列表
GET /api/v1/achievements/{id}             # 获取单个成就详情
GET /api/v1/users/{userId}/achievements   # 获取用户已解锁的成就
GET /api/v1/users/{userId}/progress       # 获取用户成就进度
POST /api/v1/achievements/unlock          # 手动触发成就解锁（需权限）
GET /api/v1/achievements/categories       # 获取成就分类
GET /api/v1/achievements/leaderboard      # 获取成就排行榜
```

### 2.3 治理系统API端点

治理流程系统应提供以下核心API端点：

```
GET /api/v1/proposals                     # 获取提案列表
GET /api/v1/proposals/{id}                # 获取单个提案详情
POST /api/v1/proposals                    # 创建新提案
GET /api/v1/proposals/{id}/votes          # 获取提案投票记录
POST /api/v1/proposals/{id}/votes         # 对提案投票
GET /api/v1/users/{userId}/votes          # 获取用户投票历史
GET /api/v1/users/{userId}/voting-power   # 获取用户投票权重
POST /api/v1/proposals/{id}/execute       # 执行提案（需权限）
GET /api/v1/governance/stats              # 获取治理统计数据
```

### 2.4 请求参数标准

#### 查询参数

列表查询应支持以下标准查询参数：

- `page`: 页码，从1开始
- `limit`: 每页记录数，默认20
- `sort`: 排序字段，格式为`field:direction`，如`createdAt:desc`
- `filter`: 过滤条件，格式为`field:value`，如`type:rare`
- `search`: 搜索关键词
- `include`: 包含的关联资源，如`include=creator,votes`

#### 请求体格式

POST和PUT请求的请求体应使用JSON格式，遵循以下命名规范：

- 使用camelCase命名属性
- 日期时间使用ISO 8601格式
- 布尔值使用`true`/`false`
- 数字不使用引号
- 枚举值使用字符串

示例：
```json
{
  "title": "提案标题",
  "description": "提案详细描述...",
  "startDate": "2025-06-10T00:00:00Z",
  "endDate": "2025-06-17T00:00:00Z",
  "type": "governance",
  "targets": ["0x1234..."],
  "values": [0],
  "calldatas": ["0x..."],
  "isUrgent": false
}
```

### 2.5 响应格式标准

所有API响应应遵循以下格式：

```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

错误响应：

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "提案标题不能为空",
    "details": {
      "field": "title",
      "constraint": "required"
    }
  }
}
```

### 2.6 WebSocket事件规范

实时更新应通过WebSocket提供，遵循以下事件格式：

```json
{
  "event": "achievement.unlocked",
  "data": {
    "userId": "123",
    "achievementId": "456",
    "timestamp": "2025-06-04T12:34:56Z"
  }
}
```

核心事件类型：

- `achievement.unlocked`: 成就解锁
- `achievement.progress`: 成就进度更新
- `proposal.created`: 新提案创建
- `proposal.statusChanged`: 提案状态变更
- `vote.cast`: 投票记录
- `voting-power.changed`: 投票权重变更

## 3. 数据结构规范

### 3.1 成就数据结构

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'creation' | 'community' | 'governance' | 'token';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
  criteria: AchievementCriteria[];
  benefits: AchievementBenefit[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface AchievementCriteria {
  id: string;
  type: 'instant' | 'cumulative' | 'combo' | 'time' | 'social' | 'onchain';
  description: string;
  threshold: number;
  operator: '=' | '>' | '>=' | '<' | '<=' | 'contains';
  timeframe?: number; // 秒数
}

interface AchievementBenefit {
  id: string;
  type: 'governance_weight' | 'token_reward' | 'fee_discount' | 'royalty_boost';
  value: number;
  description: string;
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  tokenId: string; // NFT令牌ID
  unlockedAt: string;
  transactionHash?: string;
}

interface UserProgress {
  userId: string;
  criteriaId: string;
  currentValue: number;
  targetValue: number;
  lastUpdated: string;
  percentComplete: number;
}
```

### 3.2 治理数据结构

```typescript
interface Proposal {
  id: string;
  proposalId: string; // 链上提案ID
  title: string;
  description: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
  status: 'pending' | 'active' | 'canceled' | 'defeated' | 'succeeded' | 'queued' | 'expired' | 'executed';
  forVotes: string; // 大数字，使用字符串表示
  againstVotes: string;
  abstainVotes: string;
  quorum: string;
  targets: string[];
  values: string[];
  calldatas: string[];
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  metadataURI: string;
}

interface Vote {
  id: string;
  proposalId: string;
  voter: string;
  support: 0 | 1 | 2; // 0=反对, 1=赞成, 2=弃权
  weight: string; // 大数字，使用字符串表示
  reason?: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: string;
}

interface VotingPower {
  userId: string;
  proposalId?: string; // 如果为空，表示当前权重
  baseWeight: string;
  nftBonus: string;
  delegatedWeight: string;
  totalWeight: string;
  blockNumber: number;
  timestamp: string;
}

interface ProposalHistory {
  id: string;
  proposalId: string;
  status: string;
  timestamp: string;
  blockNumber: number;
  transactionHash?: string;
}
```

## 4. 前端状态管理规范

### 4.1 状态管理架构

前端应采用分层状态管理架构：

```
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  UI组件状态            |<--->|  领域状态              |<--->|  API/合约状态          |
|  (Component State)     |     |  (Domain State)        |     |  (API/Contract State)  |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
```

- **UI组件状态**：管理UI相关的临时状态，如表单输入、模态框显示等
- **领域状态**：管理业务领域数据，如成就列表、提案详情等
- **API/合约状态**：管理与API和智能合约的交互状态，如加载状态、错误信息等

### 4.2 状态管理模式

使用Redux或Context API实现状态管理，遵循以下模式：

```typescript
// 成就状态切片示例
interface AchievementState {
  achievements: {
    data: Achievement[];
    loading: boolean;
    error: Error | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
  userAchievements: {
    data: UserAchievement[];
    loading: boolean;
    error: Error | null;
  };
  userProgress: {
    data: Record<string, UserProgress>;
    loading: boolean;
    error: Error | null;
  };
  selectedAchievement: {
    data: Achievement | null;
    loading: boolean;
    error: Error | null;
  };
}

// 治理状态切片示例
interface GovernanceState {
  proposals: {
    data: Proposal[];
    loading: boolean;
    error: Error | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
  selectedProposal: {
    data: Proposal | null;
    loading: boolean;
    error: Error | null;
  };
  votes: {
    data: Vote[];
    loading: boolean;
    error: Error | null;
  };
  userVotingPower: {
    data: VotingPower | null;
    loading: boolean;
    error: Error | null;
  };
}
```

### 4.3 异步操作处理

使用Redux Thunk或Redux Saga处理异步操作，遵循以下模式：

```typescript
// 异步操作示例
const fetchUserAchievements = (userId: string) => async (dispatch: Dispatch) => {
  dispatch({ type: 'FETCH_USER_ACHIEVEMENTS_REQUEST' });
  
  try {
    const response = await api.get(`/api/v1/users/${userId}/achievements`);
    
    if (response.data.success) {
      dispatch({
        type: 'FETCH_USER_ACHIEVEMENTS_SUCCESS',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.error.message);
    }
  } catch (error) {
    dispatch({
      type: 'FETCH_USER_ACHIEVEMENTS_FAILURE',
      payload: error.message
    });
  }
};
```

### 4.4 缓存策略

实现前端缓存策略，减少不必要的API请求：

- **内存缓存**：短期缓存（如当前会话）
- **localStorage**：中期缓存（如用户偏好）
- **IndexedDB**：长期缓存（如成就图片、提案详情）

缓存键命名规范：`{app_prefix}:{entity_type}:{id|list}:{params_hash}`

示例：`cb:achievements:list:{"page":1,"limit":20}`

## 5. 错误处理规范

### 5.1 错误类型分类

将错误分为以下几类，并统一处理：

- **网络错误**：如连接超时、服务不可达
- **API错误**：如400/500响应、格式错误
- **合约错误**：如交易失败、Gas不足
- **业务错误**：如权限不足、条件不满足
- **客户端错误**：如数据解析错误、渲染错误

### 5.2 错误处理流程

实现统一的错误处理流程：

1. **捕获错误**：在适当的层级捕获错误
2. **分类错误**：根据错误特征分类
3. **记录错误**：记录错误日志，必要时发送到监控系统
4. **转换错误**：将技术错误转换为用户友好的消息
5. **显示错误**：以适当的方式向用户展示错误
6. **恢复建议**：提供恢复或解决建议

### 5.3 错误展示组件

设计统一的错误展示组件：

- **轻量级通知**：用于非阻塞性错误，如后台操作失败
- **内联错误**：用于表单验证错误
- **错误页面**：用于致命错误或页面加载失败
- **模态错误**：用于需要用户立即注意的错误

## 6. 用户体验设计规范

### 6.1 加载状态展示

实现一致的加载状态展示：

- **全页加载**：首次加载页面时
- **部分加载**：加载页面的特定部分时
- **按钮加载**：执行操作时
- **无限滚动加载**：加载更多内容时
- **骨架屏**：加载复杂内容时

### 6.2 成功反馈

实现一致的成功反馈：

- **轻量级通知**：用于后台操作成功
- **动画效果**：用于重要操作成功（如成就解锁）
- **状态更新**：用于操作导致状态变化
- **引导下一步**：成功后引导用户进行下一步操作

### 6.3 交互设计模式

实现一致的交互设计模式：

- **拖放操作**：用于重排或组织内容
- **手势操作**：用于移动设备上的导航和操作
- **悬停效果**：用于显示额外信息或操作选项
- **渐进式披露**：逐步展示复杂信息或操作
- **引导式流程**：引导用户完成多步骤操作

### 6.4 响应式设计

实现一致的响应式设计：

- **断点定义**：
  - 移动设备：< 768px
  - 平板设备：768px - 1024px
  - 桌面设备：> 1024px
  - 大屏设备：> 1440px

- **布局策略**：
  - 移动设备：单列布局，堆叠内容
  - 平板设备：双列布局，侧边导航可折叠
  - 桌面设备：多列布局，固定侧边导航
  - 大屏设备：宽屏布局，内容居中限宽

## 7. 集成测试规范

### 7.1 前端集成测试

前端与API的集成测试应覆盖以下场景：

- **成就列表加载**：验证成就列表正确加载和分页
- **成就详情查看**：验证成就详情正确显示
- **成就进度追踪**：验证用户进度正确显示和更新
- **提案列表加载**：验证提案列表正确加载和过滤
- **提案详情查看**：验证提案详情和投票数据正确显示
- **投票操作**：验证投票操作正确执行和反馈
- **投票权重计算**：验证投票权重正确计算和显示

### 7.2 端到端测试

端到端测试应覆盖完整的用户流程：

- **成就解锁流程**：用户完成条件 -> 触发成就解锁 -> 显示成就卡片 -> 应用权益
- **提案创建流程**：创建提案 -> 提案审核 -> 提案发布 -> 开始投票
- **投票参与流程**：查看提案 -> 计算投票权重 -> 投票 -> 查看结果
- **提案执行流程**：提案通过 -> 进入队列 -> 执行 -> 显示结果

## 8. 文档与沟通规范

### 8.1 API文档

API文档应包含以下内容：

- **端点描述**：端点的功能和用途
- **请求参数**：所有可能的请求参数及其类型、格式和约束
- **响应格式**：成功和失败响应的格式和示例
- **错误码**：所有可能的错误码及其含义
- **权限要求**：访问端点所需的权限
- **使用示例**：常见使用场景的代码示例

### 8.2 组件文档

组件文档应包含以下内容：

- **组件描述**：组件的功能和用途
- **属性列表**：所有可配置的属性及其类型、默认值和约束
- **事件列表**：组件触发的所有事件
- **使用示例**：常见使用场景的代码示例
- **依赖关系**：组件的依赖项
- **注意事项**：使用组件时需要注意的事项

### 8.3 团队沟通

团队间沟通应遵循以下规范：

- **API变更通知**：任何API变更都应提前通知所有消费者
- **组件变更通知**：任何组件变更都应提前通知所有使用者
- **问题报告格式**：问题报告应包含复现步骤、预期行为和实际行为
- **代码审查标准**：代码审查应关注功能正确性、性能影响和API一致性

## 9. 结论

本文档为CB-FEATURES和CB-FRONTEND团队提供了成就触发系统与治理流程系统的前端交互规范，涵盖了API交互、数据结构、状态管理、错误处理和用户体验设计等多个方面。通过遵循这些规范，两个团队可以确保开发出一致、高效且用户友好的系统。

在实施过程中，应定期审查和更新本规范，确保其与项目需求和技术发展保持一致。同时，应建立有效的沟通渠道，及时解决集成过程中的问题和挑战。
