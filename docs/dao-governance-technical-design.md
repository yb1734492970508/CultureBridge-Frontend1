# CultureBridge DAO治理系统技术方案

## 1. 系统架构

### 1.1 整体架构
```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  前端用户界面     |<--->|  区块链交互层    |<--->|  智能合约        |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        ^                        ^                        ^
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  身份声誉系统     |<--->|  文化通证系统    |<--->|  数据存储与索引  |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
```

### 1.2 模块划分
- **前端模块**：提案列表、提案详情、提案创建、投票界面、治理仪表盘
- **区块链交互模块**：合约调用、事件监听、交易处理
- **智能合约模块**：Governor合约、Timelock合约、投票模块
- **集成模块**：身份系统集成、通证系统集成
- **数据模块**：链上数据索引、统计分析、缓存管理

## 2. 智能合约设计

### 2.1 合约结构
```
CultureGovernor
  ├── CultureGovernorSettings (参数配置)
  ├── CultureGovernorVotes (投票逻辑)
  ├── CultureGovernorCountingSimple (计票逻辑)
  ├── CultureGovernorTimelockControl (时间锁控制)
  └── CultureGovernorReputationWeighted (声誉权重)

CultureTimelock
  └── 实现提案执行的时间锁定机制

CultureVotingToken
  └── 实现投票权重和委托功能
```

### 2.2 核心接口定义

#### Governor合约接口
```solidity
// 提案相关
function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
) public returns (uint256);

function execute(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
) public payable returns (uint256);

function cancel(uint256 proposalId) public;

// 投票相关
function castVote(uint256 proposalId, uint8 support) public returns (uint256);
function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason) public returns (uint256);
function castVoteWithReputationWeight(uint256 proposalId, uint8 support, uint256 reputationBoost) public returns (uint256);

// 查询相关
function state(uint256 proposalId) public view returns (ProposalState);
function proposalSnapshot(uint256 proposalId) public view returns (uint256);
function proposalDeadline(uint256 proposalId) public view returns (uint256);
function getVotes(address account, uint256 blockNumber) public view returns (uint256);
function getVotesWithReputationBoost(address account, uint256 blockNumber) public view returns (uint256);
function hasVoted(uint256 proposalId, address account) public view returns (bool);
```

#### Timelock合约接口
```solidity
function schedule(
    address target,
    uint256 value,
    bytes calldata data,
    bytes32 predecessor,
    bytes32 salt,
    uint256 delay
) public;

function execute(
    address target,
    uint256 value,
    bytes calldata data,
    bytes32 predecessor,
    bytes32 salt
) public payable;

function cancel(bytes32 id) public;
```

### 2.3 事件定义
```solidity
// 提案事件
event ProposalCreated(
    uint256 proposalId,
    address proposer,
    address[] targets,
    uint256[] values,
    string[] signatures,
    bytes[] calldatas,
    uint256 startBlock,
    uint256 endBlock,
    string description
);

event ProposalCanceled(uint256 proposalId);
event ProposalExecuted(uint256 proposalId);
event ProposalQueued(uint256 proposalId, uint256 eta);

// 投票事件
event VoteCast(
    address indexed voter,
    uint256 proposalId,
    uint8 support,
    uint256 weight,
    string reason
);

event VoteCastWithReputationBoost(
    address indexed voter,
    uint256 proposalId,
    uint8 support,
    uint256 weight,
    uint256 reputationBoost,
    string reason
);
```

## 3. 前端实现方案

### 3.1 组件结构
```
src/
├── components/
│   └── dao/
│       ├── ProposalList.js (已有)
│       ├── ProposalCard.js (已有)
│       ├── ProposalDetail.js (待开发)
│       ├── ProposalCreation.js (待开发)
│       ├── VotingInterface.js (待开发)
│       ├── GovernanceDashboard.js (待开发)
│       ├── ExecutionQueue.js (待开发)
│       └── UserGovernanceProfile.js (待开发)
├── context/
│   └── dao/
│       └── DAOContext.js (已有，需扩展)
└── contracts/
    └── dao/
        ├── CultureDAO.js (已有，需扩展)
        ├── CultureGovernor.js (待开发)
        └── CultureTimelock.js (待开发)
```

### 3.2 页面路由
```
/dao                       - DAO主页面，展示治理仪表盘和提案列表
/dao/proposal/:id          - 提案详情页面
/dao/create-proposal       - 创建提案页面
/dao/governance-profile    - 用户治理档案页面
/dao/execution-queue       - 提案执行队列页面
```

### 3.3 状态管理
扩展现有DAOContext，增加以下功能：
- 提案创建与验证
- 投票权重计算（包含声誉加成）
- 提案执行队列管理
- 用户治理档案
- 治理统计数据

## 4. 与其他系统集成

### 4.1 身份声誉系统集成
```javascript
// 在DAOContext中集成
import { useIdentity } from '../../context/identity/IdentityContext';

// 在组件内部
const { userReputation, verifyIdentity } = useIdentity();

// 计算包含声誉加成的投票权重
const calculateVotingPower = (tokenAmount, reputation) => {
  const reputationBoost = reputation > 80 ? 1.2 : 
                          reputation > 60 ? 1.1 : 
                          reputation > 40 ? 1.0 : 0.9;
  return tokenAmount * reputationBoost;
};

// 提案创建资格检查
const checkProposalEligibility = async (account) => {
  const tokenBalance = await getTokenBalance(account);
  const reputation = await getUserReputation(account);
  
  return {
    eligible: tokenBalance >= minProposalTokens && reputation >= minProposalReputation,
    reason: tokenBalance < minProposalTokens 
      ? '代币余额不足' 
      : reputation < minProposalReputation 
        ? '声誉评分不足' 
        : ''
  };
};
```

### 4.2 文化通证系统集成
```javascript
// 在DAOContext中集成
import { useToken } from '../../context/token/TokenContext';

// 在组件内部
const { tokenBalance, stakedTokens, stakeTokens, unstakeTokens } = useToken();

// 质押代币增加治理权重
const stakeForGovernance = async (amount) => {
  try {
    await stakeTokens(amount, 'governance');
    // 更新用户治理权重
    await updateUserVotingPower();
  } catch (error) {
    console.error('质押失败:', error);
    throw error;
  }
};

// 提案保证金处理
const handleProposalDeposit = async (proposalId, amount) => {
  try {
    const result = await lockTokens(account, amount, 'proposal', proposalId);
    return result;
  } catch (error) {
    console.error('锁定保证金失败:', error);
    throw error;
  }
};
```

## 5. 数据流设计

### 5.1 提案创建流程
```
用户输入 -> 前端验证 -> 资格检查 -> 保证金锁定 -> 合约调用 -> 事件监听 -> UI更新
```

### 5.2 投票流程
```
用户选择 -> 权重计算 -> 声誉加成 -> 合约调用 -> 事件监听 -> 提案状态更新 -> UI更新
```

### 5.3 提案执行流程
```
提案通过 -> 进入队列 -> 时间锁定 -> 执行条件检查 -> 合约调用 -> 执行结果处理 -> UI更新
```

## 6. 安全性设计

### 6.1 投票权重上限
为防止大户操控，设置单个账户最大投票权重占比为总投票权的20%。

### 6.2 提案创建门槛
- 最低持有代币数量：总供应量的1%
- 最低声誉评分：60分（满分100分）
- 保证金：创建提案时锁定一定数量代币，提案结束后返还

### 6.3 时间锁定机制
- 投票期：3天
- 时间锁定期：48小时
- 执行窗口：7天

## 7. 用户体验优化

### 7.1 提案创建向导
分步引导用户完成提案创建，包括：
1. 提案类型选择
2. 提案内容编辑
3. 执行内容配置
4. 预览和确认

### 7.2 投票体验优化
- 实时显示当前投票结果和趋势
- 可视化展示个人投票权重和影响
- 投票后即时反馈和确认

### 7.3 通知系统
- 新提案通知
- 投票期即将结束提醒
- 提案状态变更通知
- 个人参与的提案更新

## 8. 开发计划

### 8.1 第一阶段：基础功能（1-2周）
- [x] 分析需求和设计技术方案
- [ ] 开发ProposalDetail组件
- [ ] 开发VotingInterface组件
- [ ] 扩展DAOContext功能
- [ ] 实现基本投票功能

### 8.2 第二阶段：集成与增强（2-3周）
- [ ] 开发ProposalCreation组件
- [ ] 开发ExecutionQueue组件
- [ ] 与身份系统集成
- [ ] 与通证系统集成
- [ ] 实现投票权重和委托功能

### 8.3 第三阶段：高级功能（3-4周）
- [ ] 开发GovernanceDashboard组件
- [ ] 开发UserGovernanceProfile组件
- [ ] 实现数据分析和可视化
- [ ] 优化移动端体验
- [ ] 全面测试和性能优化
