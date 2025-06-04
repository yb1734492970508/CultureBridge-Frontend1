# CultureBridge 治理流程系统设计规范

## 1. 概述

本文档定义了CultureBridge平台DAO治理流程系统的设计规范，为CB-FEATURES团队提供治理流程系统开发的技术指导。文档详细描述了提案生命周期管理、投票机制、执行流程、与NFT成就系统的集成、以及与代币经济模型的联动，确保治理流程的透明、高效和安全。

## 2. 治理流程架构

```
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  前端用户界面          |---->|  治理流程服务          |---->|  智能合约层            |
|  (Proposal/Voting UI)  |     |  (Governance Flow Svc) |     |  (Governor/Timelock)   |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
        ^                                ^                               ^
        |                                |                               |
        v                                v                               v
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  状态管理/缓存         |<----|  提案数据库            |<----|  区块链事件监听器      |
|  (Redux/Cache)         |     |  (Proposal DB)         |     |  (Blockchain Listener) |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
        ^                                ^
        |                                |
        v                                v
+------------------------+     +------------------------+
|                        |     |                        |
|  通知服务              |     |  NFT成就触发系统       |
|  (Notification Svc)    |     |  (Achievement Trigger) |
|                        |     |                        |
+------------------------+     +------------------------+
```

## 3. 提案生命周期管理

### 3.1 提案状态

| 状态 (State) | 描述 | 触发条件 | 下一状态 |
|--------------|------|---------|---------|
| `Pending`    | 待审核/等待开始 | 提案创建成功 | `Active` |
| `Active`     | 投票进行中 | 投票期开始 | `Succeeded`, `Defeated`, `Canceled` |
| `Canceled`   | 已取消 | 提案者或治理机制取消 | 终态 |
| `Defeated`   | 已失败 | 投票期结束，未达法定人数或反对票占优 | 终态 |
| `Succeeded`  | 已成功 | 投票期结束，达到法定人数且赞成票占优 | `Queued` |
| `Queued`     | 已排队等待执行 | 提案成功，进入时间锁 | `Expired`, `Executed` |
| `Expired`    | 已过期 | 超过执行时间窗口 | 终态 |
| `Executed`   | 已执行 | 提案成功执行 | 终态 |

### 3.2 提案创建流程

1.  **用户发起 (Frontend)**: 用户通过前端界面填写提案表单（标题、描述、目标合约、调用数据、提案类型等）。
2.  **前端验证**: 前端校验表单数据完整性和基本格式。
3.  **资格检查 (Governance Flow Svc)**: 服务端检查用户是否满足提案阈值（持有足够代币或特定NFT）。调用`CBVotingManager.getVotes`和`CBAchievementManager`相关接口。
4.  **提案费用支付 (可选, Governance Flow Svc -> Blockchain)**: 如果需要支付提案费，服务端构造交易，用户通过钱包签名发送。监听`ProposalFeePaid`事件。
5.  **提案提交 (Governance Flow Svc -> Blockchain)**: 服务端构造`CBGovernorCore.propose`调用参数，用户通过钱包签名发送交易。
6.  **元数据存储 (Governance Flow Svc -> Metadata Storage/IPFS)**: 将提案的详细描述等元数据存储到IPFS或中心化数据库，并将URI/哈希与链上提案关联（可能通过`CBProposalManager.setProposalMetadata`）。
7.  **事件监听与状态更新 (Blockchain Listener -> Governance Flow Svc -> Proposal DB)**: 监听`ProposalCreated`事件，解析事件数据，更新提案数据库状态为`Pending`或`Active`（取决于投票延迟）。
8.  **通知 (Governance Flow Svc -> Notification Svc)**: 通知提案者提案创建成功，并通知社区有新提案。
9.  **成就触发 (Governance Flow Svc -> Achievement Trigger)**: 发送`GOVERNANCE_PROPOSE`事件到成就触发系统。

### 3.3 提案取消流程

1.  **用户发起 (Frontend)**: 提案者或符合条件的治理者通过前端发起取消操作。
2.  **资格检查 (Governance Flow Svc)**: 验证发起者是否有权取消该提案。
3.  **取消提交 (Governance Flow Svc -> Blockchain)**: 服务端构造`CBGovernorCore.cancel`调用参数，用户通过钱包签名发送交易。
4.  **事件监听与状态更新 (Blockchain Listener -> Governance Flow Svc -> Proposal DB)**: 监听`ProposalCanceled`事件，更新提案数据库状态为`Canceled`。
5.  **通知 (Governance Flow Svc -> Notification Svc)**: 通知相关方提案已取消。

### 3.4 提案执行流程

1.  **状态检查 (Governance Flow Svc)**: 定期检查或在用户请求时检查状态为`Succeeded`的提案。
2.  **排队执行 (Governance Flow Svc -> Blockchain)**: 对于状态为`Succeeded`的提案，服务端构造`CBGovernorCore.queue`调用参数（如果使用了时间锁），用户通过钱包签名发送交易。
3.  **事件监听与状态更新 (Blockchain Listener -> Governance Flow Svc -> Proposal DB)**: 监听`ProposalQueued`事件，更新提案数据库状态为`Queued`，记录可执行时间。
4.  **等待时间锁 (Governance Flow Svc)**: 等待时间锁周期结束。
5.  **执行提交 (Governance Flow Svc -> Blockchain)**: 时间锁结束后，服务端构造`CBGovernorCore.execute`调用参数，用户通过钱包签名发送交易。
6.  **事件监听与状态更新 (Blockchain Listener -> Governance Flow Svc -> Proposal DB)**: 监听`ProposalExecuted`事件，更新提案数据库状态为`Executed`。
7.  **通知 (Governance Flow Svc -> Notification Svc)**: 通知相关方提案已执行。
8.  **成就触发 (Governance Flow Svc -> Achievement Trigger)**: 如果提案执行成功且与特定成就相关（如提案通过成就），发送相应事件到成就触发系统。

## 4. 投票机制

### 4.1 投票权重计算

-   **基础权重**: 基于用户持有的治理代币数量。
-   **NFT加成**: 基于用户持有的特定治理相关NFT（通过`CBBenefitExecutor.getGovernanceWeightBonus`获取加成）。
-   **委托权重**: 用户可以将投票权委托给其他地址。
-   **快照机制**: 在提案投票期开始时（或特定区块高度）进行快照，确定投票权重。
-   **实现**: 主要由`CBVotingManager`和`CBGovernorCore`（继承`GovernorVotes`）处理。

### 4.2 投票流程

1.  **用户选择 (Frontend)**: 用户在提案详情页选择投票选项（赞成/反对/弃权）。
2.  **获取投票权重 (Frontend -> Governance Flow Svc)**: 前端请求服务端获取用户在提案快照时的投票权重。
3.  **投票提交 (Frontend -> Governance Flow Svc -> Blockchain)**: 用户确认投票，服务端构造`CBGovernorCore.castVote`或`castVoteWithReason`调用参数，用户通过钱包签名发送交易。
4.  **事件监听与状态更新 (Blockchain Listener -> Governance Flow Svc -> Proposal DB)**: 监听`VoteCast`事件，更新提案的投票统计数据和用户的投票记录。
5.  **前端反馈 (Governance Flow Svc -> Frontend)**: 更新前端界面，显示用户的投票状态和最新的投票结果。
6.  **成就触发 (Governance Flow Svc -> Achievement Trigger)**: 发送`GOVERNANCE_VOTE`事件到成就触发系统。

### 4.3 投票结果计算

-   **计票**: 在投票期结束后，任何人可以触发计票（通常是隐式的，通过检查状态）。
-   **法定人数**: 检查总投票数是否达到`CBGovernorCore`设定的法定人数（Quorum）。
-   **结果判定**: 如果达到法定人数，比较赞成票和反对票数量，确定提案是否成功。
-   **状态更新**: `CBGovernorCore`合约内部更新提案状态为`Succeeded`或`Defeated`。
-   **事件触发**: 触发`ProposalSucceeded`或`ProposalDefeated`事件（如果合约中有定义）。

## 5. 与NFT成就系统集成

### 5.1 治理行为触发成就

| 治理行为 | 触发事件 (-> Achievement Trigger) | 相关成就 |
|------------|-----------------------------------|---------|
| 首次投票 | `GOVERNANCE_VOTE` (首次) | 社区参与者 |
| 累计投票次数 | `GOVERNANCE_VOTE` | 积极投票者、治理常客 |
| 首次创建提案 | `GOVERNANCE_PROPOSE` (首次) | 提案发起人 |
| 累计创建提案 | `GOVERNANCE_PROPOSE` | 社区建设者 |
| 提案获得通过 | `GOVERNANCE_PROPOSAL_PASSED` | 成功提案者 |
| 参与关键提案投票 | `GOVERNANCE_VOTE` (特定提案) | 关键决策者 |
| 委托投票权 | `GOVERNANCE_DELEGATE` | 信任代理人 |
| 成为高票数代理 | `GOVERNANCE_DELEGATE_RECEIVED` | 社区代表 |

### 5.2 NFT影响治理流程

| NFT类型 | 影响点 | 实现合约/服务 |
|---------|-------|--------------|
| 治理权重NFT | 增加投票权重 | `CBVotingManager`, `CBBenefitExecutor` |
| 提案特权NFT | 降低提案阈值/费用 | `CBProposalManager`, `Governance Flow Svc` |
| 快速通道NFT | 缩短提案时间锁 | `CBTimelock`, `CBGovernorCore` |
| 否决权NFT (稀有) | 特定条件下否决提案 | `CBGovernorCore` (需特殊逻辑) |
| 成就等级 | 影响可参与的治理范围 | `Governance Flow Svc` (根据成就等级过滤提案/投票资格) |

## 6. 与代币经济模型联动

### 6.1 治理激励

-   **投票奖励**: 参与投票的用户可以获得少量治理代币奖励（通过监听`VoteCast`事件，由`Governance Flow Svc`或专门的奖励合约发放）。
-   **提案奖励**: 成功执行的提案，其发起者可以获得代币奖励。
-   **治理质押**: 用户可以质押治理代币以获得投票权或参与治理，同时获得质押收益。

### 6.2 治理成本

-   **提案费用**: 创建提案可能需要支付少量代币作为费用，防止垃圾提案。
-   **挑战机制**: 可以设计机制，允许用户支付代币挑战提案结果，触发重新计票或审查。

## 7. 技术实现细节

### 7.1 服务端 (Governance Flow Svc)

-   **语言/框架**: Node.js/Express, Python/Flask/Django, Go/Gin
-   **数据库**: PostgreSQL, MongoDB (存储提案详情、投票记录、用户治理状态)
-   **缓存**: Redis (缓存常用数据，如提案列表、用户投票权)
-   **区块链交互**: Web3.js, Ethers.js, Web3.py
-   **事件监听**: 使用WebSocket或轮询订阅智能合约事件。
-   **任务队列**: Celery, BullMQ (处理异步任务，如通知、批量处理)

### 7.2 数据库设计 (示例)

**Proposals Collection/Table:**

```json
{
  "_id": "proposal_db_id",
  "proposalIdChain": "chain_proposal_id", // 链上提案ID
  "proposer": "user_address",
  "title": "Proposal Title",
  "description": "Detailed description...",
  "metadataUri": "ipfs://...",
  "proposalType": "general/treasury/upgrade",
  "targets": ["contract_address"],
  "values": ["0"],
  "calldatas": ["0x..."],
  "creationTimestamp": 1678886400,
  "startBlock": 1234567,
  "endBlock": 1234667,
  "snapshotBlock": 1234560,
  "status": "Active", // Pending, Active, Succeeded, Defeated, ...
  "votes": {
    "for": "1500000000000000000000", // Wei
    "against": "500000000000000000000",
    "abstain": "100000000000000000000"
  },
  "quorumReached": true,
  "executionEta": 1678972800, // 时间锁执行时间
  "lastUpdated": 1678890000
}
```

**Votes Collection/Table:**

```json
{
  "_id": "vote_db_id",
  "proposalIdChain": "chain_proposal_id",
  "voter": "user_address",
  "support": 1, // 0=Against, 1=For, 2=Abstain
  "weight": "100000000000000000000", // Wei
  "reason": "Optional reason text",
  "timestamp": 1678890000,
  "transactionHash": "0x..."
}
```

### 7.3 API设计

-   `/api/governance/proposals`: GET (列表), POST (创建)
-   `/api/governance/proposals/{id}`: GET (详情)
-   `/api/governance/proposals/{id}/votes`: GET (投票列表), POST (投票)
-   `/api/governance/proposals/{id}/cancel`: POST (取消)
-   `/api/governance/proposals/{id}/queue`: POST (排队)
-   `/api/governance/proposals/{id}/execute`: POST (执行)
-   `/api/governance/user/{address}/voting-power`: GET (查询投票权)
-   `/api/governance/user/{address}/proposals`: GET (用户创建的提案)
-   `/api/governance/user/{address}/votes`: GET (用户投过的票)

## 8. 安全考量

-   **重入攻击防护**: 遵循Checks-Effects-Interactions模式。
-   **访问控制**: 严格控制合约函数的调用权限。
-   **输入验证**: 对所有用户输入和API参数进行严格验证。
-   **时间锁**: 对敏感操作强制执行时间延迟。
-   **前端安全**: 防止XSS、CSRF攻击。
-   **API认证/授权**: 保护服务端API不被未授权访问。
-   **事件监听可靠性**: 处理区块重组，确保事件不错过、不重复处理。
-   **快照准确性**: 确保投票权快照逻辑正确无误。

## 9. 结论

本文档为CultureBridge治理流程系统的设计与实现提供了详细规范。CB-FEATURES团队应基于此规范进行开发，并与CB-DESIGN、CB-BACKEND、CB-FRONTEND等团队紧密协作，确保治理系统与平台其他模块（特别是NFT成就系统和代币经济模型）的无缝集成和稳定运行，共同构建一个透明、高效、安全的去中心化治理体系。
