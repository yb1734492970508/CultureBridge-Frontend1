# CultureBridge DAO治理机制技术方案设计

## 1. 概述

本文档详细描述CultureBridge平台DAO（去中心化自治组织）治理机制的技术实现方案，包括智能合约接口设计、前端组件结构和数据流设计。DAO治理机制将允许平台代币持有者和高声誉用户参与平台决策，实现社区驱动的平台发展。

## 2. 智能合约接口设计

### 2.1 DAO治理合约接口

我们将采用OpenZeppelin Governor合约框架作为基础，并进行定制。

```javascript
// CultureDAO.js - DAO治理合约接口（基于Governor）

import { ethers } from 'ethers';

// DAO治理合约ABI（基于OpenZeppelin Governor）
const CultureDAOABI = [
  // Governor核心接口
  "function name() view returns (string)",
  "function version() view returns (string)",
  "function proposalThreshold() view returns (uint256)",
  "function votingDelay() view returns (uint256)",
  "function votingPeriod() view returns (uint256)",
  "function quorum(uint256 blockNumber) view returns (uint256)",
  "function getVotes(address account, uint256 blockNumber) view returns (uint256)",
  "function state(uint256 proposalId) view returns (uint8)", // ProposalState: Pending, Active, Canceled, Defeated, Succeeded, Queued, Expired, Executed
  "function proposalSnapshot(uint256 proposalId) view returns (uint256)",
  "function proposalDeadline(uint256 proposalId) view returns (uint256)",
  "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256 proposalId)",
  "function castVote(uint256 proposalId, uint8 support) returns (uint256 balance)", // Support: 0 = Against, 1 = For, 2 = Abstain
  "function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256 balance)",
  "function castVoteBySig(uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s) returns (uint256 balance)",
  "function queue(uint256 proposalId) returns (bool)",
  "function execute(uint256 proposalId) payable returns (bool)",
  "function cancel(uint256 proposalId) returns (bool)",
  "function hasVoted(uint256 proposalId, address account) view returns (bool)",
  "function getReceipt(uint256 proposalId, address voter) view returns (tuple(bool hasVoted, uint8 support, uint256 votes) memory)",
  
  // Timelock控制器接口（如果使用）
  "function timelock() view returns (address)",
  "function proposalEta(uint256 proposalId) view returns (uint256)",
  
  // 扩展功能
  "function getProposalDetails(uint256 proposalId) view returns (tuple(uint256 id, address proposer, uint256 eta, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool canceled, bool executed) memory)",
  "function getProposalActions(uint256 proposalId) view returns (address[] targets, uint256[] values, string[] signatures, bytes[] calldatas)",
  "function getProposalDescription(uint256 proposalId) view returns (string memory)",
  
  // 事件
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)",
  "event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)",
  "event ProposalCanceled(uint256 proposalId)",
  "event ProposalQueued(uint256 proposalId, uint256 eta)",
  "event ProposalExecuted(uint256 proposalId)"
];

// 测试网络合约地址
const CULTURE_DAO_CONTRACT_ADDRESS = {
  1: "0x0000000000000000000000000000000000000000", // 以太坊主网（待部署）
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia测试网（待部署）
  80001: "0x0000000000000000000000000000000000000000" // Polygon Mumbai测试网（待部署）
};

/**
 * 获取DAO治理合约实例
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 合约实例
 */
export const getCultureDAOContract = (provider, chainId) => {
  const address = CULTURE_DAO_CONTRACT_ADDRESS[chainId];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`当前网络(chainId: ${chainId})不支持CultureDAO合约`);
  }
  
  return new ethers.Contract(address, CultureDAOABI, provider);
};

/**
 * 获取带签名的DAO治理合约实例（用于写操作）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 带签名的合约实例
 */
export const getSignedCultureDAOContract = async (provider, chainId) => {
  const signer = provider.getSigner();
  const contract = getCultureDAOContract(provider, chainId);
  return contract.connect(signer);
};

/**
 * 获取提案列表（需要结合事件查询或后端服务）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise<Array>} 提案列表
 */
export const getProposals = async (provider, chainId, page = 1, limit = 10) => {
  try {
    const contract = getCultureDAOContract(provider, chainId);
    
    // 获取ProposalCreated事件
    const filter = contract.filters.ProposalCreated();
    const events = await contract.queryFilter(filter, 0, 'latest');
    
    // 按时间倒序排序
    events.sort((a, b) => b.blockNumber - a.blockNumber);
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = events.slice(startIndex, endIndex);
    
    // 获取提案详情
    const proposals = await Promise.all(paginatedEvents.map(async (event) => {
      const proposalId = event.args.proposalId;
      const state = await contract.state(proposalId);
      const details = await contract.getProposalDetails(proposalId);
      
      return {
        id: proposalId.toString(),
        proposer: event.args.proposer,
        description: event.args.description,
        startBlock: event.args.startBlock.toString(),
        endBlock: event.args.endBlock.toString(),
        state: state, // ProposalState enum
        forVotes: ethers.utils.formatUnits(details.forVotes, 18), // 假设投票权重基于18位小数的代币
        againstVotes: ethers.utils.formatUnits(details.againstVotes, 18),
        abstainVotes: ethers.utils.formatUnits(details.abstainVotes, 18),
        canceled: details.canceled,
        executed: details.executed
      };
    }));
    
    return proposals;
  } catch (error) {
    console.error("获取提案列表失败:", error);
    return [];
  }
};

/**
 * 获取提案详情
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} proposalId - 提案ID
 * @returns {Promise<Object>} 提案详情
 */
export const getProposalDetails = async (provider, chainId, proposalId) => {
  try {
    const contract = getCultureDAOContract(provider, chainId);
    
    const state = await contract.state(proposalId);
    const details = await contract.getProposalDetails(proposalId);
    const actions = await contract.getProposalActions(proposalId);
    const description = await contract.getProposalDescription(proposalId);
    
    return {
      id: proposalId,
      proposer: details.proposer,
      eta: details.eta.toString() !== '0' ? new Date(details.eta.toNumber() * 1000) : null,
      startBlock: details.startBlock.toString(),
      endBlock: details.endBlock.toString(),
      forVotes: ethers.utils.formatUnits(details.forVotes, 18),
      againstVotes: ethers.utils.formatUnits(details.againstVotes, 18),
      abstainVotes: ethers.utils.formatUnits(details.abstainVotes, 18),
      canceled: details.canceled,
      executed: details.executed,
      state: state,
      description: description,
      actions: actions.targets.map((target, index) => ({
        target: target,
        value: ethers.utils.formatEther(actions.values[index]),
        signature: actions.signatures[index],
        calldata: actions.calldatas[index]
      }))
    };
  } catch (error) {
    console.error("获取提案详情失败:", error);
    return null;
  }
};

/**
 * 创建提案
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {Array<string>} targets - 目标合约地址数组
 * @param {Array<string>} values - 发送的ETH数量数组（字符串形式）
 * @param {Array<string>} calldatas - 调用数据的字节码数组
 * @param {string} description - 提案描述
 * @returns {Promise<Object>} 交易结果
 */
export const createProposal = async (provider, chainId, targets, values, calldatas, description) => {
  try {
    const contract = await getSignedCultureDAOContract(provider, chainId);
    
    // 将ETH金额转换为Wei
    const valuesInWei = values.map(v => ethers.utils.parseEther(v));
    
    // 发送创建提案交易
    const tx = await contract.propose(targets, valuesInWei, calldatas, description);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    // 从事件中获取提案ID
    const event = receipt.events.find(e => e.event === 'ProposalCreated');
    const proposalId = event.args.proposalId.toString();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      proposalId
    };
  } catch (error) {
    console.error("创建提案失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 投票
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} proposalId - 提案ID
 * @param {number} support - 支持选项 (0: 反对, 1: 支持, 2: 弃权)
 * @param {string} reason - 投票理由（可选）
 * @returns {Promise<Object>} 交易结果
 */
export const castVote = async (provider, chainId, proposalId, support, reason = '') => {
  try {
    const contract = await getSignedCultureDAOContract(provider, chainId);
    
    let tx;
    if (reason) {
      tx = await contract.castVoteWithReason(proposalId, support, reason);
    } else {
      tx = await contract.castVote(proposalId, support);
    }
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("投票失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 将提案加入队列（提案通过后）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} proposalId - 提案ID
 * @returns {Promise<Object>} 交易结果
 */
export const queueProposal = async (provider, chainId, proposalId) => {
  try {
    const contract = await getSignedCultureDAOContract(provider, chainId);
    
    // 发送加入队列交易
    const tx = await contract.queue(proposalId);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("加入队列失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 执行提案（提案在队列中等待时间结束后）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} proposalId - 提案ID
 * @returns {Promise<Object>} 交易结果
 */
export const executeProposal = async (provider, chainId, proposalId) => {
  try {
    const contract = await getSignedCultureDAOContract(provider, chainId);
    
    // 发送执行提案交易
    const tx = await contract.execute(proposalId);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("执行提案失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取用户对提案的投票信息
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} proposalId - 提案ID
 * @param {string} account - 用户地址
 * @returns {Promise<Object>} 投票信息
 */
export const getVoteReceipt = async (provider, chainId, proposalId, account) => {
  try {
    const contract = getCultureDAOContract(provider, chainId);
    const receipt = await contract.getReceipt(proposalId, account);
    
    return {
      hasVoted: receipt.hasVoted,
      support: receipt.support, // 0: Against, 1: For, 2: Abstain
      votes: ethers.utils.formatUnits(receipt.votes, 18)
    };
  } catch (error) {
    console.error("获取投票信息失败:", error);
    return null;
  }
};

export default {
  getCultureDAOContract,
  getSignedCultureDAOContract,
  getProposals,
  getProposalDetails,
  createProposal,
  castVote,
  queueProposal,
  executeProposal,
  getVoteReceipt
};
```

### 2.2 与其他合约的集成

DAO治理合约将与文化通证合约和声誉系统合约集成，实现基于代币和声誉的投票权重、提案门槛和权限控制。

- **投票权重**：DAO合约的`getVotes`方法将调用文化通证合约的`getPastVotes`方法（如果使用ERC20Votes）或结合声誉系统合约的`getReputation`方法来计算用户的投票权重。
- **提案门槛**：DAO合约的`proposalThreshold`方法将基于文化通证或声誉值设定。
- **权限控制**：DAO可以控制其他合约（如NFT市场、通证合约）的关键参数和功能，例如设置平台费用、调整奖励规则等。

## 3. 前端组件设计

### 3.1 组件结构

DAO治理功能将包含以下主要组件：

```
src/
  ├── components/
  │   ├── dao/
  │   │   ├── ProposalList.js           # 提案列表组件
  │   │   ├── ProposalCard.js           # 提案卡片组件
  │   │   ├── ProposalDetail.js         # 提案详情组件
  │   │   ├── CreateProposalForm.js     # 创建提案表单
  │   │   ├── VoteComponent.js          # 投票组件
  │   │   ├── ProposalActions.js        # 提案操作展示组件
  │   │   ├── ProposalTimeline.js       # 提案时间线组件
  │   │   ├── DAOStats.js               # DAO统计信息组件
  │   │   └── DelegateVote.js           # 投票权委托组件
  ├── contracts/
  │   ├── dao/
  │   │   └── CultureDAO.js             # DAO治理合约接口
  ├── context/
  │   ├── dao/
  │   │   └── DAOContext.js             # DAO上下文
  ├── styles/
  │   └── dao.css                     # DAO相关样式
```

### 3.2 主要组件详细设计

#### 3.2.1 ProposalList.js

提案列表组件，展示平台上的治理提案。

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { getProposals } from '../../contracts/dao/CultureDAO';
import ProposalCard from './ProposalCard';
import DAOStats from './DAOStats';

const ProposalList = () => {
  const navigate = useNavigate();
  const { active, library, chainId } = useBlockchain();
  
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // 加载提案
  const loadProposals = async (currentPage) => {
    if (!active || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const newProposals = await getProposals(library, chainId, currentPage, 10);
      
      if (newProposals.length === 0) {
        setHasMore(false);
      } else {
        setProposals(prev => currentPage === 1 ? newProposals : [...prev, ...newProposals]);
        setHasMore(newProposals.length === 10);
      }
    } catch (error) {
      console.error('加载提案失败:', error);
      setError('加载提案时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    loadProposals(1);
  }, [active, library, chainId]);
  
  // 加载更多
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProposals(nextPage);
  };
  
  return (
    <div className="proposal-list-page">
      <div className="dao-header">
        <h1>CultureBridge DAO 治理</h1>
        <p>参与平台决策，共建文化未来</p>
        <button 
          onClick={() => navigate('/dao/create-proposal')} 
          className="create-proposal-btn"
          disabled={!active}
        >
          创建提案
        </button>
      </div>
      
      <div className="dao-stats-container">
        <DAOStats />
      </div>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以查看和参与治理</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      <div className="proposals-container">
        <h2>提案列表</h2>
        {proposals.length === 0 && !loading && (
          <div className="empty-proposals">
            <p>当前没有提案</p>
          </div>
        )}
        
        <div className="proposals-grid">
          {proposals.map(proposal => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
        
        {loading && (
          <div className="loading-container">
            <p>加载提案中...</p>
          </div>
        )}
        
        {!loading && hasMore && (
          <div className="load-more-container">
            <button onClick={loadMore} className="load-more-btn">
              加载更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalList;
```

#### 3.2.2 ProposalDetail.js

提案详情组件，展示提案的详细信息、状态、投票结果和操作。

```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { getProposalDetails, queueProposal, executeProposal, getVoteReceipt } from '../../contracts/dao/CultureDAO';
import VoteComponent from './VoteComponent';
import ProposalActions from './ProposalActions';
import ProposalTimeline from './ProposalTimeline';

const ProposalDetail = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const { active, library, chainId, account } = useBlockchain();
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [voteReceipt, setVoteReceipt] = useState(null);
  
  // 加载提案详情
  const loadProposal = async () => {
    if (!active || !library || !chainId || !proposalId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const details = await getProposalDetails(library, chainId, proposalId);
      setProposal(details);
      
      // 获取用户投票信息
      if (account) {
        const receipt = await getVoteReceipt(library, chainId, proposalId, account);
        setVoteReceipt(receipt);
      }
    } catch (error) {
      console.error('加载提案详情失败:', error);
      setError('加载提案详情时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    loadProposal();
  }, [active, library, chainId, proposalId, account]);
  
  // 处理加入队列
  const handleQueue = async () => {
    if (!active || !library || !chainId || !proposalId) return;
    
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      const result = await queueProposal(library, chainId, proposalId);
      
      if (result.success) {
        setSuccess(`提案成功加入队列！交易哈希: ${result.transactionHash}`);
        loadProposal(); // 重新加载提案状态
      } else {
        setError(`加入队列失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };
  
  // 处理执行提案
  const handleExecute = async () => {
    if (!active || !library || !chainId || !proposalId) return;
    
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      const result = await executeProposal(library, chainId, proposalId);
      
      if (result.success) {
        setSuccess(`提案成功执行！交易哈希: ${result.transactionHash}`);
        loadProposal(); // 重新加载提案状态
      } else {
        setError(`执行提案失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };
  
  // 获取提案状态文本
  const getProposalStateText = (state) => {
    const states = [
      '待定', '活跃', '已取消', '已失败', 
      '已成功', '队列中', '已过期', '已执行'
    ];
    return states[state] || '未知';
  };
  
  if (loading) {
    return (
      <div className="proposal-detail loading">
        <p>加载提案详情中...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="proposal-detail error">
        <h2>加载失败</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dao')} className="back-btn">
          返回提案列表
        </button>
      </div>
    );
  }
  
  if (!proposal) {
    return (
      <div className="proposal-detail not-found">
        <h2>提案不存在</h2>
        <button onClick={() => navigate('/dao')} className="back-btn">
          返回提案列表
        </button>
      </div>
    );
  }
  
  const canQueue = proposal.state === 4; // Succeeded
  const canExecute = proposal.state === 5 && proposal.eta && new Date() >= proposal.eta; // Queued and ETA passed
  
  return (
    <div className="proposal-detail">
      <div className="detail-header">
        <h2>提案 #{proposal.id}</h2>
        <button onClick={() => navigate('/dao')} className="back-btn">
          返回提案列表
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}
      
      <div className="proposal-content">
        <div className="proposal-main-info">
          <div className="info-section">
            <h3>提案描述</h3>
            <p>{proposal.description}</p>
          </div>
          
          <div className="info-section">
            <h3>提案人</h3>
            <p className="proposer-address">{proposal.proposer}</p>
          </div>
          
          <div className="info-section">
            <h3>状态</h3>
            <p className={`proposal-status status-${proposal.state}`}>
              {getProposalStateText(proposal.state)}
            </p>
          </div>
          
          <div className="info-section">
            <h3>投票结果</h3>
            <div className="vote-results">
              <div className="result-item for">
                <span className="result-label">支持:</span>
                <span className="result-value">{proposal.forVotes}</span>
              </div>
              <div className="result-item against">
                <span className="result-label">反对:</span>
                <span className="result-value">{proposal.againstVotes}</span>
              </div>
              <div className="result-item abstain">
                <span className="result-label">弃权:</span>
                <span className="result-value">{proposal.abstainVotes}</span>
              </div>
            </div>
          </div>
          
          <div className="info-section">
            <h3>提案操作</h3>
            <ProposalActions actions={proposal.actions} />
          </div>
        </div>
        
        <div className="proposal-sidebar">
          <div className="sidebar-section">
            <h3>投票</h3>
            <VoteComponent 
              proposalId={proposal.id} 
              proposalState={proposal.state} 
              voteReceipt={voteReceipt}
              onVoteComplete={loadProposal} 
            />
          </div>
          
          <div className="sidebar-section">
            <h3>提案时间线</h3>
            <ProposalTimeline proposal={proposal} />
          </div>
          
          <div className="sidebar-section proposal-execution">
            <h3>提案执行</h3>
            {canQueue && (
              <button 
                onClick={handleQueue} 
                disabled={processing}
                className="queue-btn"
              >
                {processing ? '处理中...' : '加入队列'}
              </button>
            )}
            {canExecute && (
              <button 
                onClick={handleExecute} 
                disabled={processing}
                className="execute-btn"
              >
                {processing ? '处理中...' : '执行提案'}
              </button>
            )}
            {proposal.state === 7 && (
              <p className="executed-message">提案已执行</p>
            )}
            {proposal.state === 2 && (
              <p className="canceled-message">提案已取消</p>
            )}
            {proposal.state === 3 && (
              <p className="defeated-message">提案已失败</p>
            )}
            {proposal.state === 6 && (
              <p className="expired-message">提案已过期</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;
```

#### 3.2.3 CreateProposalForm.js

创建提案表单组件，允许符合条件的用户提交治理提案。

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { getCultureDAOContract, createProposal } from '../../contracts/dao/CultureDAO';
import { getVotingPower } from '../../contracts/token/CultureToken'; // 假设投票权基于代币

const CreateProposalForm = () => {
  const navigate = useNavigate();
  const { active, library, chainId, account } = useBlockchain();
  
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState([{ target: '', value: '0', calldata: '' }]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [proposalThreshold, setProposalThreshold] = useState('0');
  const [userVotingPower, setUserVotingPower] = useState('0');
  const [canPropose, setCanPropose] = useState(false);
  
  // 加载提案门槛和用户投票权
  useEffect(() => {
    const loadData = async () => {
      if (!active || !library || !chainId || !account) return;
      
      try {
        setLoading(true);
        setError('');
        
        const contract = getCultureDAOContract(library, chainId);
        
        // 获取提案门槛
        const threshold = await contract.proposalThreshold();
        const thresholdFormatted = ethers.utils.formatUnits(threshold, 18);
        setProposalThreshold(thresholdFormatted);
        
        // 获取用户投票权
        const power = await getVotingPower(library, chainId, account);
        setUserVotingPower(power);
        
        // 检查用户是否有足够投票权创建提案
        setCanPropose(parseFloat(power) >= parseFloat(thresholdFormatted));
      } catch (error) {
        console.error('加载数据失败:', error);
        setError('加载提案所需信息时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [active, library, chainId, account]);
  
  // 添加操作
  const addAction = () => {
    setActions([...actions, { target: '', value: '0', calldata: '' }]);
  };
  
  // 更新操作
  const updateAction = (index, field, value) => {
    const newActions = [...actions];
    newActions[index][field] = value;
    setActions(newActions);
  };
  
  // 移除操作
  const removeAction = (index) => {
    const newActions = actions.filter((_, i) => i !== index);
    setActions(newActions);
  };
  
  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (!canPropose) {
      setError(`您的投票权不足以创建提案，需要至少 ${proposalThreshold} CULT`);
      return;
    }
    
    if (!description.trim()) {
      setError('请输入提案描述');
      return;
    }
    
    if (actions.length === 0) {
      setError('请至少添加一个提案操作');
      return;
    }
    
    // 验证操作数据
    for (const action of actions) {
      if (!ethers.utils.isAddress(action.target)) {
        setError(`无效的目标地址: ${action.target}`);
        return;
      }
      if (isNaN(parseFloat(action.value)) || parseFloat(action.value) < 0) {
        setError(`无效的ETH数值: ${action.value}`);
        return;
      }
      if (!action.calldata.startsWith('0x')) {
        setError(`无效的调用数据 (必须以0x开头): ${action.calldata}`);
        return;
      }
    }
    
    try {
      setCreating(true);
      setError('');
      setSuccess('');
      
      const targets = actions.map(a => a.target);
      const values = actions.map(a => a.value);
      const calldatas = actions.map(a => a.calldata);
      
      const result = await createProposal(
        library,
        chainId,
        targets,
        values,
        calldatas,
        description
      );
      
      if (result.success) {
        setSuccess(`提案创建成功！提案ID: ${result.proposalId}`);
        
        // 延迟后跳转到提案详情页面
        setTimeout(() => {
          navigate(`/dao/proposal/${result.proposalId}`);
        }, 3000);
      } else {
        setError(`创建提案失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setCreating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="create-proposal-form loading">
        <p>加载中...</p>
      </div>
    );
  }
  
  return (
    <div className="create-proposal-form">
      <h2>创建提案</h2>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以创建提案</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}
      
      {active && (
        <div className="proposal-requirements">
          <p>创建提案需要至少 {proposalThreshold} CULT 的投票权。</p>
          <p>您当前的投票权: {userVotingPower} CULT</p>
          {!canPropose && (
            <p className="cannot-propose">您的投票权不足，无法创建提案。</p>
          )}
        </div>
      )}
      
      {active && canPropose && (
        <form onSubmit={handleSubmit} className="proposal-form">
          <div className="form-group">
            <label htmlFor="description">提案描述 *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={creating}
              rows={6}
              required
            />
          </div>
          
          <div className="form-group">
            <h3>提案操作 *</h3>
            {actions.map((action, index) => (
              <div key={index} className="action-item">
                <h4>操作 #{index + 1}</h4>
                <div className="action-fields">
                  <div className="field">
                    <label htmlFor={`target-${index}`}>目标合约地址</label>
                    <input
                      type="text"
                      id={`target-${index}`}
                      value={action.target}
                      onChange={(e) => updateAction(index, 'target', e.target.value)}
                      disabled={creating}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`value-${index}`}>发送ETH数量</label>
                    <input
                      type="number"
                      id={`value-${index}`}
                      value={action.value}
                      onChange={(e) => updateAction(index, 'value', e.target.value)}
                      min="0"
                      step="any"
                      disabled={creating}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`calldata-${index}`}>调用数据 (0x...)</label>
                    <textarea
                      id={`calldata-${index}`}
                      value={action.calldata}
                      onChange={(e) => updateAction(index, 'calldata', e.target.value)}
                      disabled={creating}
                      rows={3}
                      required
                    />
                  </div>
                </div>
                {actions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    disabled={creating}
                    className="remove-action-btn"
                  >
                    移除操作
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAction}
              disabled={creating}
              className="add-action-btn"
            >
              添加操作
            </button>
          </div>
          
          <button
            type="submit"
            disabled={creating || !canPropose || !description.trim() || actions.length === 0}
            className="submit-proposal-btn"
          >
            {creating ? '提交中...' : '提交提案'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateProposalForm;
```

#### 3.2.4 VoteComponent.js

投票组件，允许用户对活跃的提案进行投票。

```jsx
import React, { useState } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { castVote } from '../../contracts/dao/CultureDAO';

const VoteComponent = ({ proposalId, proposalState, voteReceipt, onVoteComplete }) => {
  const { active, library, chainId, account } = useBlockchain();
  
  const [selectedSupport, setSelectedSupport] = useState(null); // 0: Against, 1: For, 2: Abstain
  const [reason, setReason] = useState('');
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  
  // 检查是否可以投票
  const canVote = active && proposalState === 1 && voteReceipt && !voteReceipt.hasVoted;
  
  // 处理投票
  const handleVote = async () => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (selectedSupport === null) {
      setError('请选择您的投票选项');
      return;
    }
    
    try {
      setVoting(true);
      setError('');
      
      const result = await castVote(
        library,
        chainId,
        proposalId,
        selectedSupport,
        reason
      );
      
      if (result.success) {
        // 投票成功后调用回调函数刷新提案详情
        if (onVoteComplete) {
          onVoteComplete();
        }
      } else {
        setError(`投票失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setVoting(false);
    }
  };
  
  return (
    <div className="vote-component">
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以投票</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {active && voteReceipt && voteReceipt.hasVoted && (
        <div className="already-voted">
          <p>您已投票: 
            {voteReceipt.support === 1 ? '支持' : voteReceipt.support === 0 ? '反对' : '弃权'}
          </p>
        </div>
      )}
      
      {canVote && (
        <div className="vote-form">
          <div className="vote-options">
            <button 
              className={`vote-option for ${selectedSupport === 1 ? 'selected' : ''}`}
              onClick={() => setSelectedSupport(1)}
              disabled={voting}
            >
              支持
            </button>
            <button 
              className={`vote-option against ${selectedSupport === 0 ? 'selected' : ''}`}
              onClick={() => setSelectedSupport(0)}
              disabled={voting}
            >
              反对
            </button>
            <button 
              className={`vote-option abstain ${selectedSupport === 2 ? 'selected' : ''}`}
              onClick={() => setSelectedSupport(2)}
              disabled={voting}
            >
              弃权
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="reason">投票理由 (可选)</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={voting}
              rows={3}
            />
          </div>
          
          <button 
            onClick={handleVote} 
            disabled={voting || selectedSupport === null}
            className="submit-vote-btn"
          >
            {voting ? '投票中...' : '提交投票'}
          </button>
        </div>
      )}
      
      {active && proposalState !== 1 && (
        <div className="voting-closed">
          <p>投票已结束</p>
        </div>
      )}
    </div>
  );
};

export default VoteComponent;
```

### 3.3 DAO上下文设计

创建DAO上下文，管理DAO状态和数据。

```jsx
// DAOContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useBlockchain } from '../blockchain';
import { getCultureDAOContract } from '../../contracts/dao/CultureDAO';
import { getVotingPower } from '../../contracts/token/CultureToken';

// 创建DAO上下文
export const DAOContext = createContext({
  proposalThreshold: '0',
  userVotingPower: '0',
  canPropose: false,
  loading: false,
  error: null,
  refreshDAOStats: () => {}
});

// DAO上下文提供者组件
export const DAOProvider = ({ children }) => {
  const { active, account, library, chainId } = useBlockchain();
  
  const [proposalThreshold, setProposalThreshold] = useState('0');
  const [userVotingPower, setUserVotingPower] = useState('0');
  const [canPropose, setCanPropose] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 刷新DAO统计信息
  const refreshDAOStats = async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const contract = getCultureDAOContract(library, chainId);
      
      // 获取提案门槛
      const threshold = await contract.proposalThreshold();
      const thresholdFormatted = ethers.utils.formatUnits(threshold, 18);
      setProposalThreshold(thresholdFormatted);
      
      // 获取用户投票权
      const power = await getVotingPower(library, chainId, account);
      setUserVotingPower(power);
      
      // 检查用户是否有足够投票权创建提案
      setCanPropose(parseFloat(power) >= parseFloat(thresholdFormatted));
    } catch (error) {
      console.error('刷新DAO统计信息失败:', error);
      setError('刷新DAO统计信息时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    refreshDAOStats();
  }, [active, account, library, chainId]);
  
  // 上下文值
  const contextValue = {
    proposalThreshold,
    userVotingPower,
    canPropose,
    loading,
    error,
    refreshDAOStats
  };
  
  return (
    <DAOContext.Provider value={contextValue}>
      {children}
    </DAOContext.Provider>
  );
};

// 自定义Hook，方便在组件中使用DAO上下文
export const useDAO = () => {
  const context = useContext(DAOContext);
  if (context === undefined) {
    throw new Error('useDAO必须在DAOProvider内部使用');
  }
  return context;
};
```

## 4. 路由与应用集成

### 4.1 路由设计

在App.js中添加DAO治理相关路由。

```jsx
// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WalletConnector from './components/blockchain/WalletConnector';
import NFTMinter from './components/blockchain/NFTMinter';
import NFTGallery from './components/blockchain/NFTGallery';
import NFTDetail from './components/blockchain/NFTDetail';
import MarketplaceHome from './components/marketplace/MarketplaceHome';
import NFTListingForm from './components/marketplace/NFTListingForm';
import NFTAuctionForm from './components/marketplace/NFTAuctionForm';
import NFTMarketDetail from './components/marketplace/NFTMarketDetail';
import MyListings from './components/marketplace/MyListings';
import MyPurchases from './components/marketplace/MyPurchases';
import TokenWallet from './components/token/TokenWallet';
import TokenStaking from './components/token/TokenStaking';
import RewardCenter from './components/token/RewardCenter';
import IdentityProfile from './components/identity/IdentityProfile';
import IdentityCreator from './components/identity/IdentityCreator';
import IdentityEditor from './components/identity/IdentityEditor';
import IdentityVerifier from './components/identity/IdentityVerifier';
import ExternalAccountLinker from './components/identity/ExternalAccountLinker';
import ProposalList from './components/dao/ProposalList';
import ProposalDetail from './components/dao/ProposalDetail';
import CreateProposalForm from './components/dao/CreateProposalForm';
import DelegateVote from './components/dao/DelegateVote';
import { MarketplaceProvider } from './context/marketplace/MarketplaceContext';
import { TokenProvider } from './context/token/TokenContext';
import { IdentityProvider } from './context/identity/IdentityContext';
import { DAOProvider } from './context/dao/DAOContext';
import './App.css';
import './styles/blockchain.css';
import './styles/marketplace.css';
import './styles/token.css';
import './styles/identity.css';
import './styles/dao.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>CultureBridge</h1>
        <div className="wallet-section">
          <WalletConnector />
        </div>
      </header>
      
      <main className="App-main">
        <IdentityProvider>
          <TokenProvider>
            <MarketplaceProvider>
              <DAOProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/mint" element={<NFTMinter />} />
                  <Route path="/gallery" element={<NFTGallery />} />
                  <Route path="/nft/:tokenId" element={<NFTDetailWrapper />} />
                  <Route path="/marketplace" element={<MarketplaceHome />} />
                  <Route path="/list-nft" element={<NFTListingForm />} />
                  <Route path="/list-auction" element={<NFTAuctionForm />} />
                  <Route path="/market-item/:nftContract/:tokenId" element={<NFTMarketDetail />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/my-purchases" element={<MyPurchases />} />
                  <Route path="/token/wallet" element={<TokenWallet />} />
                  <Route path="/token/staking" element={<TokenStaking />} />
                  <Route path="/token/rewards" element={<RewardCenter />} />
                  <Route path="/identity/profile" element={<IdentityProfile />} />
                  <Route path="/identity/profile/:identityId" element={<IdentityProfile />} />
                  <Route path="/identity/create" element={<IdentityCreator />} />
                  <Route path="/identity/edit/:identityId" element={<IdentityEditor />} />
                  <Route path="/identity/verify/:identityId" element={<IdentityVerifier />} />
                  <Route path="/identity/link/:identityId" element={<ExternalAccountLinker />} />
                  <Route path="/dao" element={<ProposalList />} />
                  <Route path="/dao/proposal/:proposalId" element={<ProposalDetail />} />
                  <Route path="/dao/create-proposal" element={<CreateProposalForm />} />
                  <Route path="/dao/delegate" element={<DelegateVote />} />
                </Routes>
              </DAOProvider>
            </MarketplaceProvider>
          </TokenProvider>
        </IdentityProvider>
      </main>
      
      <footer className="App-footer">
        <p>CultureBridge - 基于区块链的跨文化交流平台</p>
      </footer>
    </div>
  );
}

// 首页组件
function Home() {
  return (
    <div className="home-container">
      <h2>欢迎来到CultureBridge</h2>
      <p>探索基于区块链的跨文化交流新体验</p>
      
      <div className="feature-cards">
        <div className="feature-card">
          <h3>创建文化NFT</h3>
          <p>将您的文化作品铸造为NFT，确保数字所有权</p>
          <a href="/mint" className="feature-link">开始创建</a>
        </div>
        
        <div className="feature-card">
          <h3>浏览NFT画廊</h3>
          <p>探索来自世界各地的文化艺术品</p>
          <a href="/gallery" className="feature-link">查看画廊</a>
        </div>
        
        <div className="feature-card">
          <h3>NFT市场</h3>
          <p>交易独特的文化NFT资产</p>
          <a href="/marketplace" className="feature-link">进入市场</a>
        </div>
        
        <div className="feature-card">
          <h3>文化通证</h3>
          <p>获取和使用CULT代币，参与平台生态</p>
          <a href="/token/wallet" className="feature-link">管理代币</a>
        </div>
        
        <div className="feature-card">
          <h3>身份与声誉</h3>
          <p>创建您的去中心化身份，建立声誉</p>
          <a href="/identity/profile" className="feature-link">查看身份</a>
        </div>
        
        <div className="feature-card">
          <h3>DAO治理</h3>
          <p>参与平台决策，共建社区未来</p>
          <a href="/dao" className="feature-link">参与治理</a>
        </div>
      </div>
    </div>
  );
}

// NFT详情包装组件，用于获取路由参数
function NFTDetailWrapper() {
  const tokenId = window.location.pathname.split('/').pop();
  return <NFTDetail tokenId={tokenId} />;
}

export default App;
```

### 4.2 样式设计

创建dao.css样式文件，为DAO治理组件提供样式。

```css
/* dao.css */

/* DAO治理页面通用样式 */
.dao-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.dao-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.dao-header p {
  color: #666;
  font-size: 18px;
  margin-bottom: 20px;
}

.create-proposal-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.create-proposal-btn:hover {
  background-color: #0069d9;
}

.create-proposal-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.dao-stats-container {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.proposals-container {
  margin-top: 30px;
}

.proposals-container h2 {
  margin-bottom: 20px;
  color: #333;
}

.empty-proposals {
  text-align: center;
  color: #666;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.proposals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.load-more-container {
  text-align: center;
  margin-top: 30px;
}

.load-more-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

/* 提案卡片样式 */
.proposal-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.proposal-card:hover {
  transform: translateY(-5px);
}

.proposal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.proposal-card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.proposal-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-0 { background-color: #ffc107; color: #333; } /* Pending */
.status-1 { background-color: #17a2b8; color: white; } /* Active */
.status-2 { background-color: #6c757d; color: white; } /* Canceled */
.status-3 { background-color: #dc3545; color: white; } /* Defeated */
.status-4 { background-color: #28a745; color: white; } /* Succeeded */
.status-5 { background-color: #fd7e14; color: white; } /* Queued */
.status-6 { background-color: #6c757d; color: white; } /* Expired */
.status-7 { background-color: #6f42c1; color: white; } /* Executed */

.proposal-card-description {
  color: #666;
  margin-bottom: 15px;
  height: 60px; /* Limit height */
  overflow: hidden;
  text-overflow: ellipsis;
}

.proposal-card-votes {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 15px;
}

.vote-count.for { color: #28a745; }
.vote-count.against { color: #dc3545; }
.vote-count.abstain { color: #6c757d; }

.proposal-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.proposal-card-proposer {
  font-size: 14px;
  color: #666;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-proposal-btn {
  background-color: #007bff;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
}

/* 提案详情页样式 */
.proposal-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.detail-header h2 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.back-btn {
  background-color: #6c757d;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.proposal-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.proposal-main-info {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-section {
  margin-bottom: 20px;
}

.info-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 18px;
}

.proposer-address {
  color: #666;
  font-size: 14px;
  word-break: break-all;
}

.vote-results {
  display: flex;
  gap: 20px;
}

.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.result-value {
  font-size: 18px;
  font-weight: 500;
}

.result-item.for .result-value { color: #28a745; }
.result-item.against .result-value { color: #dc3545; }
.result-item.abstain .result-value { color: #6c757d; }

.proposal-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sidebar-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.proposal-execution button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 10px;
}

.queue-btn {
  background-color: #fd7e14;
  color: white;
}

.execute-btn {
  background-color: #6f42c1;
  color: white;
}

.proposal-execution button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.executed-message,
.canceled-message,
.defeated-message,
.expired-message {
  text-align: center;
  font-weight: 500;
  padding: 10px;
  border-radius: 4px;
}

.executed-message { background-color: #e9d8fd; color: #6f42c1; }
.canceled-message { background-color: #e9ecef; color: #6c757d; }
.defeated-message { background-color: #f8d7da; color: #721c24; }
.expired-message { background-color: #e9ecef; color: #6c757d; }

/* 投票组件样式 */
.vote-component {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.already-voted p {
  margin: 0;
  font-weight: 500;
  color: #333;
}

.vote-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.vote-options {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.vote-option {
  flex: 1;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
}

.vote-option.selected {
  border-width: 3px;
  font-weight: 500;
}

.vote-option.for.selected { border-color: #28a745; color: #28a745; }
.vote-option.against.selected { border-color: #dc3545; color: #dc3545; }
.vote-option.abstain.selected { border-color: #6c757d; color: #6c757d; }

.vote-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-vote-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
}

.submit-vote-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.voting-closed p {
  margin: 0;
  text-align: center;
  font-weight: 500;
  color: #666;
}

/* 创建提案表单样式 */
.create-proposal-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.create-proposal-form h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
  font-size: 28px;
}

.proposal-requirements {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #333;
}

.cannot-propose {
  color: #dc3545;
  font-weight: 500;
}

.proposal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-item {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.action-item h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.action-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.remove-action-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 10px;
}

.add-action-btn {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  align-self: flex-start;
}

.submit-proposal-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 18px;
  cursor: pointer;
}

.submit-proposal-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .proposal-content {
    grid-template-columns: 1fr;
  }
  
  .proposals-grid {
    grid-template-columns: 1fr;
  }
}
```

## 5. 数据流设计

### 5.1 DAO治理数据流

```
用户操作 -> 前端组件 -> DAO上下文 -> 合约接口 -> 区块链网络
                                  -> 本地状态管理

区块链网络 -> 合约接口 -> DAO上下文 -> 前端组件 -> 用户界面
```

### 5.2 状态管理

- **全局状态**：通过DAOContext管理DAO全局状态（如提案门槛、用户投票权）
- **组件状态**：各组件通过useState管理本地状态（如提案列表、提案详情、表单数据）
- **区块链状态**：通过BlockchainContext管理钱包连接和网络状态

### 5.3 事件监听

监听区块链事件，实时更新提案列表和状态。

```javascript
// 在ProposalList组件或DAOContext中添加事件监听
useEffect(() => {
  if (active && library && chainId) {
    const contract = getCultureDAOContract(library, chainId);
    
    // 监听提案创建事件
    const proposalCreatedFilter = contract.filters.ProposalCreated();
    const voteCastFilter = contract.filters.VoteCast();
    const proposalCanceledFilter = contract.filters.ProposalCanceled();
    const proposalQueuedFilter = contract.filters.ProposalQueued();
    const proposalExecutedFilter = contract.filters.ProposalExecuted();
    
    const handleProposalEvent = () => {
      // 重新加载提案列表或更新相关状态
      // 例如，在ProposalList中调用 loadProposals(1)
      // 在ProposalDetail中调用 loadProposal()
      // 在DAOContext中调用 refreshDAOStats()
    };
    
    contract.on(proposalCreatedFilter, handleProposalEvent);
    contract.on(voteCastFilter, handleProposalEvent);
    contract.on(proposalCanceledFilter, handleProposalEvent);
    contract.on(proposalQueuedFilter, handleProposalEvent);
    contract.on(proposalExecutedFilter, handleProposalEvent);
    
    return () => {
      contract.off(proposalCreatedFilter, handleProposalEvent);
      contract.off(voteCastFilter, handleProposalEvent);
      contract.off(proposalCanceledFilter, handleProposalEvent);
      contract.off(proposalQueuedFilter, handleProposalEvent);
      contract.off(proposalExecutedFilter, handleProposalEvent);
    };
  }
}, [active, library, chainId]);
```

## 6. 实施计划

### 6.1 开发阶段

1. **第一阶段**：实现DAO治理合约接口和基础组件
   - 开发CultureDAO.js合约接口（基于Governor）
   - 实现DAOContext上下文
   - 开发ProposalList和ProposalCard组件

2. **第二阶段**：实现提案详情和投票功能
   - 开发ProposalDetail组件
   - 开发VoteComponent组件
   - 实现投票流程

3. **第三阶段**：实现提案创建和执行功能
   - 开发CreateProposalForm组件
   - 实现提案创建流程
   - 实现提案队列和执行功能

4. **第四阶段**：集成与优化
   - 集成投票权委托功能（DelegateVote组件）
   - 完善DAO统计信息展示（DAOStats组件）
   - 优化用户界面和交互体验
   - 全面测试各功能模块

### 6.2 测试计划

- **单元测试**：测试各合约接口函数
- **集成测试**：测试组件与合约的交互
- **用户流程测试**：测试完整的提案创建、投票、执行流程
- **兼容性测试**：测试不同浏览器和设备的兼容性

## 7. 总结

本技术方案详细设计了CultureBridge平台DAO治理机制的实现方案，包括智能合约接口、前端组件结构和数据流设计。通过实现提案创建、投票、执行等功能，将允许平台代币持有者和高声誉用户参与平台决策，实现社区驱动的平台发展。

后续将按照实施计划逐步开发和测试各功能模块，确保DAO治理机制的稳定性和用户体验。同时，将与文化通证、身份与声誉系统集成，实现基于代币和声誉的投票权重、提案门槛和权限控制，为平台提供更完善的社区治理模型。
