# CultureBridge Governance Flow System Design Specification
# CultureBridge 治理流程系统设计规范

## 1. Overview
## 1. 概述

This document defines the design specification for the CultureBridge platform's DAO governance process system, providing technical guidance for the CB-FEATURES team on the development of the governance process system. The document details proposal lifecycle management, voting mechanisms, execution processes, integration with the NFT achievement system, and linkage with the token economic model, ensuring transparency, efficiency, and security of the governance process.
本文档定义了CultureBridge平台DAO治理流程系统的设计规范，为CB-FEATURES团队提供治理流程系统开发的技术指导。文档详细描述了提案生命周期管理、投票机制、执行流程、与NFT成就系统的集成、以及与代币经济模型的联动，确保治理流程的透明、高效和安全。

## 2. Governance Flow Architecture
## 2. 治理流程架构

```
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  Frontend User Interface |---->|  Governance Flow Service |---->|  Smart Contract Layer  |
|  (Proposal/Voting UI)  |     |  (Governance Flow Svc) |     |  (Governor/Timelock)   |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
        ^                                ^                               ^
        |                                |                               |
        v                                v                               v
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  State Management/Cache |<----|  Proposal Database     |<----|  Blockchain Event Listener |
|  (Redux/Cache)         |     |  (Proposal DB)         |     |  (Blockchain Listener) |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
        ^                                ^
        |                                |
        v                                v
+------------------------+     +------------------------+
|                        |     |                        |
|  Notification Service  |     |  NFT Achievement Trigger System |
|  (Notification Svc)    |     |  (Achievement Trigger) |
|                        |     |                        |
+------------------------+     +------------------------+
```

## 3. Proposal Lifecycle Management
## 3. 提案生命周期管理

### 3.1 Proposal States
### 3.1 提案状态

| State | Description | Trigger Condition | Next State |
|--------------|------|---------|---------|
| `Pending`    | Pending review/waiting to start | Proposal created successfully | `Active` |
| `Active`     | Voting in progress | Voting period starts | `Succeeded`, `Defeated`, `Canceled` |
| `Canceled`   | Canceled | Proposer or governance mechanism cancels | Final State |
| `Defeated`   | Defeated | Voting period ends, quorum not met or against votes dominate | Final State |
| `Succeeded`  | Succeeded | Voting period ends, quorum met and for votes dominate | `Queued` |
| `Queued`     | Queued for execution | Proposal succeeded, enters timelock | `Expired`, `Executed` |
| `Expired`    | Expired | Exceeded execution time window | Final State |
| `Executed`   | Executed | Proposal successfully executed | Final State |

### 3.2 Proposal Creation Process
### 3.2 提案创建流程

1.  **User Initiation (Frontend)**: User fills out the proposal form (title, description, target contract, call data, proposal type, etc.) through the frontend interface.
2.  **Frontend Validation**: Frontend validates form data completeness and basic format.
3.  **Eligibility Check (Governance Flow Svc)**: Server-side checks if the user meets the proposal threshold (holds enough tokens or specific NFTs). Calls `CBVotingManager.getVotes` and `CBAchievementManager` related interfaces.
4.  **Proposal Fee Payment (Optional, Governance Flow Svc -> Blockchain)**: If a proposal fee is required, the server constructs the transaction, and the user signs and sends it via wallet. Listens for `ProposalFeePaid` event.
5.  **Proposal Submission (Governance Flow Svc -> Blockchain)**: The server constructs `CBGovernorCore.propose` call parameters, and the user signs and sends the transaction via wallet.
6.  **Metadata Storage (Governance Flow Svc -> Metadata Storage/IPFS)**: Stores detailed proposal descriptions and other metadata to IPFS or a centralized database, and associates the URI/hash with the on-chain proposal (possibly via `CBProposalManager.setProposalMetadata`).
7.  **Event Listening and Status Update (Blockchain Listener -> Governance Flow Svc -> Proposal DB)**: Listens for `ProposalCreated` events, parses event data, and updates the proposal database status to `Pending` or `Active` (depending on voting delay).
8.  **Notification (Governance Flow Svc -> Notification Svc)**: Notifies the proposer of successful proposal creation and notifies the community of new proposals.
9.  **Achievement Trigger (Governance Flow Svc -> Achievement Trigger)**: Sends `GOVERNANCE_PROPOSE` event to the achievement trigger system.

### 3.3 Proposal Cancellation Process
### 3.3 提案取消流程

1.  **User Initiation (Frontend)**: The proposer or eligible governors initiate the cancellation operation through the frontend.
2.  **Eligibility Check (Governance Flow Svc)**: Verifies if the initiator has the right to cancel the proposal.
3.  **Cancellation Submission (Governance Flow Svc -> Blockchain)**: The server constructs `CBGovernorCore.cancel` call parameters, and the user signs and sends the transaction via wallet.
4.  **Event Listening and Status Update (Blockchain Listener -> Governance Flow Svc -> Proposal DB)**: Listens for `ProposalCanceled` events and updates the proposal database status to `Canceled`.
5.  **Notification (Governance Flow Svc -> Notification Svc)**: Notifies relevant parties that the proposal has been canceled.

### 3.4 Proposal Execution Process
### 3.4 提案执行流程

1.  **Status Check (Governance Flow Svc)**: Periodically checks or checks upon user request for proposals with `Succeeded` status.
2.  **Queued for Execution (Governance Flow Svc -> Blockchain)**: For proposals with `Succeeded` status, the server constructs `CBGovernorCore.queue` call parameters (if a timelock is used), and the user signs and sends the transaction via wallet.
3.  **Event Listening and Status Update (Blockchain Listener -> Governance Flow Svc -> Proposal DB)**: Listens for `ProposalQueued` events, updates the proposal database status to `Queued`, and records the executable time.
4.  **Wait for Timelock (Governance Flow Svc)**: Waits for the timelock period to end.
5.  **Execution Submission (Governance Flow Svc -> Blockchain)**: After the timelock ends, the server constructs `CBGovernorCore.execute` call parameters, and the user signs and sends the transaction via wallet.
6.  **Event Listening and Status Update (Blockchain Listener -> Governance Flow Svc -> Proposal DB)**: Listens for `ProposalExecuted` events and updates the proposal database status to `Executed`.
7.  **Notification (Governance Flow Svc -> Notification Svc)**: Notifies relevant parties that the proposal has been executed.
8.  **Achievement Trigger (Governance Flow Svc -> Achievement Trigger)**: If the proposal is successfully executed and related to a specific achievement (e.g., proposal passed achievement), sends the corresponding event to the achievement trigger system.

## 4. Voting Mechanism
## 4. 投票机制

### 4.1 Voting Power Calculation
### 4.1 投票权重计算

-   **Base Weight**: Based on the number of governance tokens held by the user.
-   **NFT Bonus**: Based on specific governance-related NFTs held by the user (bonus obtained via `CBBenefitExecutor.getGovernanceWeightBonus`).
-   **Delegated Weight**: Users can delegate voting power to other addresses.
-   **Snapshot Mechanism**: A snapshot is taken at the beginning of the proposal voting period (or at a specific block height) to determine voting power.
-   **Implementation**: Primarily handled by `CBVotingManager` and `CBGovernorCore` (inheriting `GovernorVotes`).

### 4.2 Voting Process
### 4.2 投票流程

1.  **User Selection (Frontend)**: User selects voting option (for/against/abstain) on the proposal details page.
2.  **Get Voting Power (Frontend -> Governance Flow Svc)**: Frontend requests the server to get the user's voting power at the time of the proposal snapshot.
3.  **Vote Submission (Frontend -> Governance Flow Svc -> Blockchain)**: User confirms the vote, the server constructs `CBGovernorCore.castVote` or `castVoteWithReason` call parameters, and the user signs and sends the transaction via wallet.
4.  **Event Listening and Status Update (Blockchain Listener -> Governance Flow Svc -> Proposal DB)**: Listens for `VoteCast` events and updates the proposal's voting statistics and the user's voting record.
5.  **Frontend Feedback (Governance Flow Svc -> Frontend)**: Updates the frontend interface to display the user's voting status and the latest voting results.
6.  **Achievement Trigger (Governance Flow Svc -> Achievement Trigger)**: Sends `GOVERNANCE_VOTE` event to the achievement trigger system.

### 4.3 Vote Result Calculation
### 4.3 投票结果计算

-   **Vote Counting**: After the voting period ends, anyone can trigger vote counting (usually implicitly, by checking the status).
-   **Quorum Check**: Checks if the total votes reach the quorum set by `CBGovernorCore`.
-   **Result Determination**: If the quorum is met, compares the number of for votes and against votes to determine if the proposal is successful.
-   **Status Update**: The `CBGovernorCore` contract internally updates the proposal status to `Succeeded` or `Defeated`.
-   **Event Trigger**: Triggers `ProposalSucceeded` or `ProposalDefeated` events (if defined in the contract).

## 5. Integration with NFT Achievement System
## 5. 与NFT成就系统集成

### 5.1 Governance Actions Triggering Achievements
### 5.1 治理行为触发成就

| Governance Action | Trigger Event (-> Achievement Trigger) | Related Achievement |
|------------|-----------------------------------|---------|
| First Vote | `GOVERNANCE_VOTE` (First time) | Community Participant |
| Cumulative Votes | `GOVERNANCE_VOTE` | Active Voter, Governance Regular |
| First Proposal Creation | `GOVERNANCE_PROPOSE` (First time) | Proposal Initiator |
| Cumulative Proposals Created | `GOVERNANCE_PROPOSE` | Community Builder |
| Proposal Passed | `GOVERNANCE_PROPOSAL_PASSED` | Successful Proposer |
| Participate in Key Proposal Voting | `GOVERNANCE_VOTE` (Specific proposal) | Key Decision Maker |
| Delegate Voting Power | `GOVERNANCE_DELEGATE` | Trusted Agent |
| Become High-Vote Delegate | `GOVERNANCE_DELEGATE_RECEIVED` | Community Representative |

### 5.2 NFT Impact on Governance Process
### 5.2 NFT影响治理流程

| NFT Type | Impact Point | Implementation Contract/Service |
|---------|-------|--------------|
| Governance Weight NFT | Increases voting power | `CBVotingManager`, `CBBenefitExecutor` |
| Proposal Privilege NFT | Lowers proposal threshold/fees | `CBProposalManager`, `Governance Flow Svc` |
| Fast Track NFT | Shortens proposal timelock | `CBTimelock`, `CBGovernorCore` |
| Veto Power NFT (Rare) | Vetoes proposals under specific conditions | `CBGovernorCore` (requires special logic) |
| Achievement Level | Affects scope of governance participation | `Governance Flow Svc` (filters proposals/voting eligibility based on achievement level) |

## 6. Linkage with Token Economic Model
## 6. 与代币经济模型联动

### 6.1 Governance Incentives
### 6.1 治理激励

-   **Voting Rewards**: Users who participate in voting can receive small governance token rewards (issued by `Governance Flow Svc` or a dedicated reward contract by listening for `VoteCast` events).
-   **Proposal Rewards**: Proposers of successfully executed proposals can receive token rewards.
-   **Governance Staking**: Users can stake governance tokens to gain voting rights or participate in governance, while also earning staking rewards.

### 6.2 Governance Costs
### 6.2 治理成本

-   **Proposal Fees**: Creating proposals may require paying a small amount of tokens as a fee to prevent spam proposals.
-   **Challenge Mechanism**: A mechanism can be designed to allow users to pay tokens to challenge proposal results, triggering a recount or review.

## 7. Technical Implementation Details
## 7. 技术实现细节

### 7.1 Server-side (Governance Flow Svc)
### 7.1 服务端 (Governance Flow Svc)

-   **Language/Framework**: Node.js/Express, Python/Flask/Django, Go/Gin
-   **Database**: PostgreSQL, MongoDB (stores proposal details, vote records, user governance status)
-   **Cache**: Redis (caches frequently used data, such as proposal lists, user voting power)
-   **Blockchain Interaction**: Web3.js, Ethers.js, Web3.py
-   **Event Listening**: Uses WebSocket or polling to subscribe to smart contract events.
-   **Task Queue**: Celery, BullMQ (handles asynchronous tasks, such as notifications, batch processing)

### 7.2 Database Design (Example)
### 7.2 数据库设计 (示例)

**Proposals Collection/Table:**

```json
{
  "_id": "proposal_db_id",
  "proposalIdChain": "chain_proposal_id", // On-chain proposal ID
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
  "executionEta": 1678972800, // Timelock execution time
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

### 7.3 API Design
### 7.3 API设计

-   `/api/governance/proposals`: GET (List), POST (Create)
-   `/api/governance/proposals/{id}`: GET (Details)
-   `/api/governance/proposals/{id}/votes`: GET (Vote List), POST (Vote)
-   `/api/governance/proposals/{id}/cancel`: POST (Cancel)
-   `/api/governance/proposals/{id}/queue`: POST (Queue)
-   `/api/governance/proposals/{id}/execute`: POST (Execute)
-   `/api/governance/user/{address}/voting-power`: GET (Query voting power)
-   `/api/governance/user/{address}/proposals`: GET (User created proposals)
-   `/api/governance/user/{address}/votes`: GET (User voted proposals)

## 8. Security Considerations
## 8. 安全考量

-   **Reentrancy Attack Protection**: Follows Checks-Effects-Interactions pattern.
-   **Access Control**: Strictly controls call permissions for contract functions.
-   **Input Validation**: Strictly validates all user inputs and API parameters.
-   **Timelock**: Enforces time delays for sensitive operations.
-   **Frontend Security**: Prevents XSS, CSRF attacks.
-   **API Authentication/Authorization**: Protects server-side APIs from unauthorized access.
-   **Event Listening Reliability**: Handles block reorgs to ensure events are not missed or duplicated.
-   **Snapshot Accuracy**: Ensures correct voting power snapshot logic.

## 9. Conclusion
## 9. 结论

This document provides detailed specifications for the design and implementation of the CultureBridge governance process system. The CB-FEATURES team should develop based on this specification and collaborate closely with the CB-DESIGN, CB-BACKEND, CB-FRONTEND, and other teams to ensure seamless integration and stable operation of the governance system with other platform modules (especially the NFT achievement system and token economic model), jointly building a transparent, efficient, and secure decentralized governance system.
本文档为CultureBridge治理流程系统的设计与实现提供了详细规范。CB-FEATURES团队应基于此规范进行开发，并与CB-DESIGN、CB-BACKEND、CB-FRONTEND等团队紧密协作，确保治理系统与平台其他模块（特别是NFT成就系统和代币经济模型）的无缝集成和稳定运行，共同构建一个透明、高效、安全的去中心化治理体系。


