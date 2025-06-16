# NFT and Governance System Frontend Integration Optimization Guide (CB-DESIGN for CB-FRONTEND)
# NFT与治理系统前端集成优化指南 (CB-DESIGN for CB-FRONTEND)

## 1. Overview
## 1. 概述

This document provides the CB-FRONTEND team with an optimization guide for the frontend integration of the CultureBridge platform's NFT achievement and governance systems, serving as a supplement and update to previous frontend component design specifications. With the development progress of the CB-BACKEND and CB-FEATURES teams, this document focuses on optimizing the frontend integration with backend services and smart contracts, ensuring that the user interface can seamlessly connect with the latest contract functions and service APIs, providing a smooth user experience.
本文档为CB-FRONTEND团队提供CultureBridge平台NFT成就与治理系统前端集成的优化指南，是对之前前端组件设计规范的补充和更新。随着CB-BACKEND和CB-FEATURES团队的开发进展，本文档重点关注前端与后端服务和智能合约的集成优化，确保用户界面能够无缝对接最新的合约功能和服务API，提供流畅的用户体验。

## 2. Frontend Architecture Optimization
## 2. 前端架构优化

### 2.1 Data Flow Architecture Update
### 2.1 数据流架构更新

Based on the latest contract interfaces and service APIs, the frontend data flow architecture should be optimized as follows:
基于最新的合约接口和服务API，前端数据流架构应进行以下优化：

```
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  User Interface Components |<--->|  State Management Layer |<--->|  API/Contract Service Layer |
|  (React Components)    |     |  (Redux/Context)       |     |  (Service Adapters)    |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
                                        ^                               ^
                                        |                               |
                                        v                               v
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  Routing and Navigation |<--->|  Cache Management      |<--->|  Web3 Connection Management |
|  (Router)              |     |  (Cache Strategy)      |     |  (Wallet Connection)   |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
```

### 2.2 Service Adapter Layer Optimization
### 2.2 服务适配层优化

Create a dedicated service adapter layer to uniformly handle interactions with backend APIs and smart contracts:
创建专门的服务适配层，统一处理与后端API和智能合约的交互：

- **API Service Adapter**: Encapsulate all REST API interactions with the achievement trigger system and governance process system.
- **API服务适配器**：封装所有与成就触发系统和治理流程系统的REST API交互。
- **Contract Service Adapter**: Encapsulate all direct interactions with NFT and governance smart contracts.
- **合约服务适配器**：封装所有与NFT和治理智能合约的直接交互。
- **Data Converter**: Handle the conversion of API/contract data to frontend component data formats.
- **数据转换器**：处理API/合约数据与前端组件数据格式的转换。

### 2.3 State Management Optimization
### 2.3 状态管理优化

Based on the latest functional requirements, state management should be optimized as follows:
基于最新的功能需求，状态管理应进行以下优化：

- **Modular State**: Separate NFT achievement and governance-related states into independent modules.
- **模块化状态**：将NFT成就和治理相关状态分离为独立模块。
- **Asynchronous State Handling**: Optimize state management for asynchronous operations (API requests, contract calls).
- **异步状态处理**：优化异步操作（API请求、合约调用）的状态管理。
- **Persistence Strategy**: Implement a reasonable state persistence strategy to reduce unnecessary API/contract calls.
- **持久化策略**：实现合理的状态持久化策略，减少不必要的API/合约调用。
- **Real-time Updates**: Implement real-time updates for key data through WebSocket or polling mechanisms.
- **实时更新**：通过WebSocket或轮询机制实现关键数据的实时更新。

## 3. Component Integration Optimization
## 3. 组件集成优化

### 3.1 NFT Achievement Card Component Optimization
### 3.1 NFT成就卡片组件优化

Based on the latest contract functions and APIs, the NFT achievement card component should be optimized as follows:
基于最新的合约功能和API，NFT成就卡片组件应进行以下优化：

- **Dynamic Benefit Display**: Dynamically display the benefits provided by NFTs based on the actual benefit data returned by `CBBenefitExecutor`.
- **动态权益显示**：根据`CBBenefitExecutor`返回的实际权益数据，动态显示NFT提供的权益。
- **Progress Tracking Enhancement**: Integrate the progress API of the achievement trigger system to display more accurate progress information.
- **进度追踪增强**：集成成就触发系统的进度API，显示更精确的进度信息。
- **Interaction Optimization**: Add quick access to relevant governance functions directly from the card.
- **交互优化**：添加直接从卡片访问相关治理功能的快捷入口。
- **Performance Optimization**: Implement virtual lists and lazy loading to optimize the display performance of a large number of NFTs.
- **性能优化**：实现虚拟列表和延迟加载，优化大量NFT的显示性能。

**Code Example (Updated)**:
**代码示例（更新）**：

```jsx
import React, { useEffect, useState } from \'react\';
import styled from \'styled-components\';
import { useAchievementService } from \'../services/achievementService\';
import { useBenefitService } from \'../services/benefitService\';

const AchievementCard = ({ 
  tokenId, 
  achievementId,
  isMobile,
  onClick 
}) => {
  const [details, setDetails] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const achievementService = useAchievementService();
  const benefitService = useBenefitService();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Request data in parallel
        // 并行请求数据
        const [detailsData, benefitsData, progressData] = await Promise.all([
          achievementService.getAchievementDetails(tokenId),
          benefitService.getAchievementBenefits(achievementId),
          achievementService.getAchievementProgress(achievementId)
        ]);
        
        setDetails(detailsData);
        setBenefits(benefitsData);
        setProgress(progressData);
      } catch (error) {
        console.error(\'Error fetching achievement data:\', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tokenId, achievementId]);
  
  if (loading) {
    return <CardSkeleton />;
  }
  
  // Component rendering logic...
  // 组件渲染逻辑...
};
```

### 3.2 Governance Proposal Card Component Optimization
### 3.2 治理提案卡片组件优化

Based on the latest contract functions and APIs, the governance proposal card component should be optimized as follows:
基于最新的合约功能和API，治理提案卡片组件应进行以下优化：

- **State Transition Visualization**: Optimize the display and transition of proposal states based on `CBGovernorCore`'s state definitions.
- **状态流转可视化**：根据`CBGovernorCore`的状态定义，优化提案状态的显示和流转。
- **Voting Weight Calculation**: Integrate `CBVotingManager`'s weight calculation to display the user's actual voting weight.
- **投票权重计算**：集成`CBVotingManager`的权重计算，显示用户实际投票权重。
- **Execution Countdown**: Display a countdown for queued proposals.
- **执行倒计时**：对于已排队的提案，显示执行倒计时。
- **NFT Bonus Indicator**: Display the voting weight bonus obtained by the user due to holding NFTs.
- **NFT加成标识**：显示用户因持有NFT获得的投票权重加成。

**Code Example (Updated)**:
**代码示例（更新）**：

```jsx
import React, { useEffect, useState } from \'react\';
import styled from \'styled-components\';
import { useProposalService } from \'../services/proposalService\';
import { useVotingService } from \'../services/votingService\';
import { useWallet } from \'../hooks/useWallet\';
import { ProposalStatus, formatVotes } from \'../utils/governanceUtils\';

const ProposalCard = ({ 
  proposalId,
  onClick 
}) => {
  const [proposal, setProposal] = useState(null);
  const [userVotingPower, setUserVotingPower] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const proposalService = useProposalService();
  const votingService = useVotingService();
  const { account } = useWallet();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get proposal details
        // 获取提案详情
        const proposalData = await proposalService.getProposal(proposalId);
        setProposal(proposalData);
        
        if (account) {
          // Get user voting weight
          // 获取用户投票权重
          const votingPower = await votingService.getUserVotingPower(account, proposalId);
          setUserVotingPower(votingPower);
          
          // Get user voting record
          // 获取用户投票记录
          const voteData = await votingService.getUserVote(account, proposalId);
          setUserVote(voteData);
        }
      } catch (error) {
        console.error(\'Error fetching proposal data:\', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [proposalId, account]);
  
  // Render proposal status badge
  // 渲染提案状态标签
  const renderStatusBadge = () => {
    const { status } = proposal;
    
    switch (status) {
      case ProposalStatus.PENDING:
        return <StatusBadge color=\

