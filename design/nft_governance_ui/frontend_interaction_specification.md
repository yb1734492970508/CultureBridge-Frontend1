# Achievement Trigger and Governance Process System Frontend Interaction Specification (CB-DESIGN for CB-FEATURES & CB-FRONTEND - Day 14)
# 成就触发与治理流程系统前端交互规范 (CB-DESIGN for CB-FEATURES & CB-FRONTEND - Day 14)

## 1. Overview
## 1. 概述

This document provides the CB-FEATURES and CB-FRONTEND teams with frontend interaction specifications for the achievement trigger system and governance process system, ensuring seamless collaboration between the two teams during development and providing a consistent user experience. This specification details standards for API interaction patterns, data structures, state management, error handling, and user experience design, supplementing and refining previous design documents.
本文档为CB-FEATURES和CB-FRONTEND团队提供成就触发系统与治理流程系统的前端交互规范，确保两个团队在开发过程中能够无缝协作，提供一致的用户体验。本规范详细定义了API交互模式、数据结构、状态管理、错误处理和用户体验设计等方面的标准，是对前期设计文档的补充和细化。

## 2. API Interaction Specification
## 2. API交互规范

### 2.1 RESTful API Endpoint Standards
### 2.1 RESTful API端点标准

All API endpoints should follow the following naming and design specifications:
所有API端点应遵循以下命名和设计规范：

| Resource Type | HTTP Method | Endpoint Format | Example | Description |
| 资源类型 | HTTP方法 | 端点格式 | 示例 | 说明 |
|---------|---------|---------|------|------|
| Collection Resource | GET | `/api/v1/{resources}` | `/api/v1/achievements` | Get resource list |
| 集合资源 | GET | `/api/v1/{resources}` | `/api/v1/achievements` | 获取资源列表 |
| Single Resource | GET | `/api/v1/{resources}/{id}` | `/api/v1/achievements/123` | Get single resource |
| 单一资源 | GET | `/api/v1/{resources}/{id}` | `/api/v1/achievements/123` | 获取单个资源 |
| Sub-resource Collection | GET | `/api/v1/{resources}/{id}/{subresources}` | `/api/v1/users/456/achievements` | Get associated sub-resource list |
| 子资源集合 | GET | `/api/v1/{resources}/{id}/{subresources}` | `/api/v1/users/456/achievements` | 获取关联子资源列表 |
| Create Resource | POST | `/api/v1/{resources}` | `/api/v1/proposals` | Create new resource |
| 创建资源 | POST | `/api/v1/{resources}` | `/api/v1/proposals` | 创建新资源 |
| Update Resource | PUT/PATCH | `/api/v1/{resources}/{id}` | `/api/v1/proposals/789` | Update resource |
| 更新资源 | PUT/PATCH | `/api/v1/{resources}/{id}` | `/api/v1/proposals/789` | 更新资源 |
| Delete Resource | DELETE | `/api/v1/{resources}/{id}` | `/api/v1/votes/101` | Delete resource |
| 删除资源 | DELETE | `/api/v1/{resources}/{id}` | `/api/v1/votes/101` | 删除资源 |
| Operate Resource | POST | `/api/v1/{resources}/{id}/{action}` | `/api/v1/proposals/789/execute` | Perform operation on resource |
| 操作资源 | POST | `/api/v1/{resources}/{id}/{action}` | `/api/v1/proposals/789/execute` | 对资源执行操作 |

### 2.2 Achievement System API Endpoints
### 2.2 成就系统API端点

The achievement trigger system should provide the following core API endpoints:
成就触发系统应提供以下核心API端点：

```
GET /api/v1/achievements                  # Get achievement list / 获取成就列表
GET /api/v1/achievements/{id}             # Get single achievement details / 获取单个成就详情
GET /api/v1/users/{userId}/achievements   # Get user unlocked achievements / 获取用户已解锁的成就
GET /api/v1/users/{userId}/progress       # Get user achievement progress / 获取用户成就进度
POST /api/v1/achievements/unlock          # Manually trigger achievement unlock (requires permission) / 手动触发成就解锁（需权限）
GET /api/v1/achievements/categories       # Get achievement categories / 获取成就分类
GET /api/v1/achievements/leaderboard      # Get achievement leaderboard / 获取成就排行榜
```

### 2.3 Governance System API Endpoints
### 2.3 治理系统API端点

The governance process system should provide the following core API endpoints:
治理流程系统应提供以下核心API端点：

```
GET /api/v1/proposals                     # Get proposal list / 获取提案列表
GET /api/v1/proposals/{id}                # Get single proposal details / 获取单个提案详情
POST /api/v1/proposals                    # Create new proposal / 创建新提案
GET /api/v1/proposals/{id}/votes          # Get proposal voting records / 获取提案投票记录
POST /api/v1/proposals/{id}/votes         # Vote on proposal / 对提案投票
GET /api/v1/users/{userId}/votes          # Get user voting history / 获取用户投票历史
GET /api/v1/users/{userId}/voting-power   # Get user voting power / 获取用户投票权重
POST /api/v1/proposals/{id}/execute       # Execute proposal (requires permission) / 执行提案（需权限）
GET /api/v1/governance/stats              # Get governance statistics / 获取治理统计数据
```

### 2.4 Request Parameter Standards
### 2.4 请求参数标准

#### Query Parameters
#### 查询参数

List queries should support the following standard query parameters:
列表查询应支持以下标准查询参数：

- `page`: Page number, starting from 1 / 页码，从1开始
- `limit`: Number of records per page, default 20 / 每页记录数，默认20
- `sort`: Sort field, format `field:direction`, e.g., `createdAt:desc` / 排序字段，格式为`field:direction`，如`createdAt:desc`
- `filter`: Filter condition, format `field:value`, e.g., `type:rare` / 过滤条件，格式为`field:value`，如`type:rare`
- `search`: Search keyword / 搜索关键词
- `include`: Included associated resources, e.g., `include=creator,votes` / 包含的关联资源，如`include=creator,votes`

#### Request Body Format
#### 请求体格式

POST and PUT request bodies should use JSON format and follow these naming conventions:
POST和PUT请求的请求体应使用JSON格式，遵循以下命名规范：

- Use camelCase for property names / 使用camelCase命名属性
- Date and time use ISO 8601 format / 日期时间使用ISO 8601格式
- Booleans use `true`/`false` / 布尔值使用`true`/`false`
- Numbers do not use quotes / 数字不使用引号
- Enum values use strings / 枚举值使用字符串

Example:
示例：
```json
{
  "title": "Proposal Title",
  "description": "Detailed proposal description...",
  "startDate": "2025-06-10T00:00:00Z",
  "endDate": "2025-06-17T00:00:00Z",
  "type": "governance",
  "targets": ["0x1234..."],
  "values": [0],
  "calldatas": ["0x..."],
  "isUrgent": false
}
```

### 2.5 Response Format Standards
### 2.5 响应格式标准

All API responses should follow this format:
所有API响应应遵循以下格式：

```json
{
  "success": true,
  "data": {
    // Response data / 响应数据
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

Error Response:
错误响应：

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Proposal title cannot be empty",
    "details": {
      "field": "title",
      "constraint": "required"
    }
  }
}
```

### 2.6 WebSocket Event Specification
### 2.6 WebSocket事件规范

Real-time updates should be provided via WebSocket, following this event format:
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

Core Event Types:
核心事件类型：

- `achievement.unlocked`: Achievement unlocked / 成就解锁
- `achievement.progress`: Achievement progress update / 成就进度更新
- `proposal.created`: New proposal created / 新提案创建
- `proposal.statusChanged`: Proposal status changed / 提案状态变更
- `vote.cast`: Vote recorded / 投票记录
- `voting-power.changed`: Voting power changed / 投票权重变更

## 3. Data Structure Specification
## 3. 数据结构规范

### 3.1 Achievement Data Structure
### 3.1 成就数据结构

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  type: \'learning\' | \'creation\' | \'community\' | \'governance\' | \'token\';
  rarity: \'common\' | \'uncommon\' | \'rare\' | \'epic\' | \'legendary\';
  imageUrl: string;
  criteria: AchievementCriteria[];
  benefits: AchievementBenefit[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface AchievementCriteria {
  id: string;
  type: \'instant\' | \'cumulative\' | \'combo\' | \'time\' | \'social\' | \'onchain\';
  description: string;
  threshold: number;
  operator: \'=\' | \'>\' | \'>=\' | \'<\' | \'<=\' | \'contains\';
  timeframe?: number; // seconds / 秒数
}

interface AchievementBenefit {
  id: string;
  type: \'governance_weight\' | \'token_reward\' | \'fee_discount\' | \'royalty_boost\';
  value: number;
  description: string;
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  tokenId: string; // NFT token ID / NFT令牌ID
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

### 3.2 Governance Data Structure
### 3.2 治理数据结构

```typescript
interface Proposal {
  id: string;
  proposalId: string; // On-chain proposal ID / 链上提案ID
  title: string;
  description: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
  status: \'pending\' | \'active\' | \'canceled\' | \'defeated\' | \'succeeded\' | \'queued\' | \'expired\' | \'executed\';
  forVotes: string; // Large number, represented as string / 大数字，使用字符串表示
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
  support: 0 | 1 | 2; // 0=Against, 1=For, 2=Abstain / 0=反对, 1=赞成, 2=弃权
  weight: string; // Large number, represented as string / 大数字，使用字符串表示
  reason?: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: string;
}

interface VotingPower {
  userId: string;
  proposalId?: string; // If empty, represents current weight / 如果为空，表示当前权重
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

## 4. Frontend State Management Specification
## 4. 前端状态管理规范

### 4.1 State Management Architecture
### 4.1 状态管理架构

The frontend should adopt a layered state management architecture:
前端应采用分层状态管理架构：

```
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  UI Component State    |<--->|  Domain State          |<--->|  API/Contract State    |
|  (Component State)     |     |  (Domain State)        |     |  (API/Contract State)  |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
```

- **UI Component State**: Manages UI-related temporary states, such as form input, modal display, etc. / 管理UI相关的临时状态，如表单输入、模态框显示等
- **Domain State**: Manages business domain data, such as achievement lists, proposal details, etc. / 管理业务领域数据，如成就列表、提案详情等
- **API/Contract State**: Manages interaction states with APIs and smart contracts, such as loading states, error messages, etc. / 管理与API和智能合约的交互状态，如加载状态、错误信息等

### 4.2 State Management Patterns
### 4.2 状态管理模式

Use Redux or Context API to implement state management, following these patterns:
使用Redux或Context API实现状态管理，遵循以下模式：

```typescript
// Achievement State Slice Example / 成就状态切片示例
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

// Governance State Slice Example / 治理状态切片示例
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

### 4.3 Asynchronous Operation Handling
### 4.3 异步操作处理

Use Redux Thunk or Redux Saga to handle asynchronous operations, following these patterns:
使用Redux Thunk或Redux Saga处理异步操作，遵循以下模式：

```typescript
// Asynchronous Operation Example / 异步操作示例
const fetchUserAchievements = (userId: string) => async (dispatch: Dispatch) => {
  dispatch({ type: \'FETCH_USER_ACHIEVEMENTS_REQUEST\' });
  
  try {
    const response = await api.get(`/api/v1/users/${userId}/achievements`);
    
    if (response.data.success) {
      dispatch({
        type: \'FETCH_USER_ACHIEVEMENTS_SUCCESS\',
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.error.message);
    }
  } catch (error) {
    dispatch({
      type: \'FETCH_USER_ACHIEVEMENTS_FAILURE\',
      payload: error.message
    });
  }
};
```

### 4.4 Caching Strategy
### 4.4 缓存策略

Implement frontend caching strategies to reduce unnecessary API requests:
实现前端缓存策略，减少不必要的API请求：

- **Memory Cache**: Short-term caching (e.g., current session) / 内存缓存：短期缓存（如当前会话）
- **localStorage**: Medium-term caching (e.g., user preferences) / localStorage：中期缓存（如用户偏好）
- **IndexedDB**: Long-term caching (e.g., achievement images, proposal details) / IndexedDB：长期缓存（如成就图片、提案详情）

Cache key naming convention: `{app_prefix}:{entity_type}:{id|list}:{params_hash}`
缓存键命名规范：`{app_prefix}:{entity_type}:{id|list}:{params_hash}`

Example: `cb:achievements:list:{\

