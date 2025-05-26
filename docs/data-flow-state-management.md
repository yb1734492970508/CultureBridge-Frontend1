# CultureBridge 数据流与状态管理技术方案

## 1. 概述

本文档详细描述CultureBridge平台的数据流与状态管理技术方案，包括数据流架构、状态管理策略、数据持久化方案和事件监听机制。通过合理的数据流设计和状态管理，确保平台各功能模块之间的数据交互高效、一致，提升用户体验和开发效率。

## 2. 数据流架构

### 2.1 整体数据流架构

CultureBridge平台采用单向数据流架构，结合Context API和React Hooks实现状态管理。整体数据流如下：

```
用户操作 → 前端组件 → 上下文API → 合约接口/服务 → 区块链网络/后端服务
                                 → 本地状态更新

区块链网络/后端服务 → 合约接口/服务 → 上下文API → 前端组件 → 用户界面
```

这种架构确保了数据流的清晰性和可预测性，便于追踪状态变化和调试问题。

### 2.2 模块间数据流

#### 2.2.1 区块链基础模块与其他模块的数据流

```
BlockchainContext
    ↓
    ├→ NFT模块 (获取钱包地址、Provider等)
    ├→ 市场模块 (获取钱包地址、Provider等)
    ├→ 通证模块 (获取钱包地址、Provider等)
    ├→ 身份模块 (获取钱包地址、Provider等)
    └→ DAO模块 (获取钱包地址、Provider等)
```

#### 2.2.2 NFT与市场模块数据流

```
NFT创建 → NFT元数据存储(IPFS) → NFT铸造(区块链) → NFT展示
                                              ↓
                                          NFT上架 → 市场列表展示
                                              ↓
                                          NFT交易 → 所有权转移
```

#### 2.2.3 通证与其他模块数据流

```
通证模块
    ↓
    ├→ 市场模块 (支付手续费、购买NFT)
    ├→ 身份模块 (声誉奖励、身份验证)
    └→ DAO模块 (投票权重、提案门槛)
```

#### 2.2.4 身份与声誉系统数据流

```
用户操作 → 声誉计算 → 声誉更新 → 等级提升
    ↓
身份验证 → 声誉提升 → 权限变更
```

#### 2.2.5 DAO治理数据流

```
代币持有 → 投票权重计算 → 提案投票 → 提案执行
    ↓
声誉等级 → 特殊权限 → 特定提案类型
```

## 3. 状态管理策略

### 3.1 全局状态管理

CultureBridge平台使用React Context API结合自定义Hooks实现全局状态管理，避免了props drilling问题，同时保持了代码的可维护性。

#### 3.1.1 上下文设计原则

1. **职责单一**：每个上下文负责管理特定领域的状态
2. **最小化状态**：只在上下文中存储必要的共享状态
3. **封装复杂性**：在上下文内部处理复杂的状态逻辑
4. **提供便捷API**：通过自定义Hooks提供简洁的API

#### 3.1.2 主要上下文模块

1. **BlockchainContext**：管理区块链连接状态、账户信息等
2. **NFTContext**：管理NFT相关状态，如用户NFT、创建状态等
3. **MarketplaceContext**：管理市场相关状态，如市场列表、交易状态等
4. **TokenContext**：管理通证相关状态，如余额、交易历史等
5. **IdentityContext**：管理身份相关状态，如用户资料、声誉等
6. **DAOContext**：管理DAO相关状态，如提案列表、投票状态等

### 3.2 组件状态管理

对于组件内部状态，根据复杂度采用不同的管理策略：

1. **简单状态**：使用`useState`Hook管理简单的组件状态
2. **复杂状态**：使用`useReducer`Hook管理复杂的组件状态
3. **派生状态**：使用`useMemo`和`useCallback`计算派生状态，避免不必要的重新计算

### 3.3 状态更新策略

为确保状态更新的一致性和可预测性，采用以下策略：

1. **批量更新**：使用批量更新减少渲染次数
2. **不可变更新**：使用不可变数据结构进行状态更新
3. **乐观更新**：在等待区块链确认时先乐观更新UI，提升用户体验
4. **回滚机制**：在操作失败时提供状态回滚机制

### 3.4 性能优化策略

为提高状态管理的性能，采用以下优化策略：

1. **状态分割**：将大型状态分割为多个小型状态，减少不必要的重新渲染
2. **记忆化**：使用`React.memo`、`useMemo`和`useCallback`减少不必要的重新计算和渲染
3. **懒加载**：使用懒加载和分页加载大量数据
4. **虚拟列表**：对长列表使用虚拟列表技术，只渲染可见区域的项目

## 4. 数据持久化方案

### 4.1 本地存储策略

根据数据的敏感性和使用频率，采用不同的本地存储策略：

1. **localStorage**：存储非敏感的用户偏好设置、主题选择等
2. **sessionStorage**：存储会话期间需要的临时数据
3. **IndexedDB**：存储大量结构化数据，如NFT元数据缓存、交易历史等

### 4.2 缓存策略

为减少区块链网络请求和提高响应速度，采用多级缓存策略：

1. **内存缓存**：使用React状态作为第一级缓存
2. **持久化缓存**：使用本地存储作为第二级缓存
3. **缓存失效策略**：基于时间和事件的缓存失效策略
4. **预加载**：预测用户行为，提前加载可能需要的数据

### 4.3 离线支持

为提供更好的用户体验，实现基本的离线支持：

1. **离线状态检测**：监测网络状态，在离线时提供适当的UI反馈
2. **离线操作队列**：将离线操作存储在队列中，在恢复连接时执行
3. **冲突解决策略**：处理离线操作可能导致的数据冲突

## 5. 事件监听机制

### 5.1 区块链事件监听

监听区块链事件，实时更新应用状态：

```javascript
// 示例：监听NFT转移事件
useEffect(() => {
  if (active && library && chainId) {
    const nftContract = getNFTContract(library, chainId);
    
    // 监听Transfer事件
    const filter = nftContract.filters.Transfer(null, account);
    
    const handleTransfer = (from, to, tokenId) => {
      console.log(`NFT转移: 从${from}到${to}，TokenID: ${tokenId}`);
      // 更新状态
      refreshNFTs();
    };
    
    nftContract.on(filter, handleTransfer);
    
    return () => {
      nftContract.off(filter, handleTransfer);
    };
  }
}, [active, library, chainId, account]);
```

### 5.2 主要监听事件类型

#### 5.2.1 NFT相关事件

- **Transfer**：NFT转移事件，监听所有权变更
- **Approval**：NFT授权事件，监听授权变更
- **ApprovalForAll**：NFT批量授权事件，监听授权变更
- **URI**：NFT元数据URI变更事件，监听元数据更新

#### 5.2.2 市场相关事件

- **MarketItemCreated**：市场项目创建事件，监听新上架
- **MarketItemSold**：市场项目售出事件，监听交易完成
- **MarketItemCanceled**：市场项目取消事件，监听下架
- **AuctionBid**：拍卖出价事件，监听新出价
- **AuctionEnded**：拍卖结束事件，监听拍卖完成

#### 5.2.3 通证相关事件

- **Transfer**：代币转移事件，监听余额变更
- **Approval**：代币授权事件，监听授权变更
- **Staked**：代币质押事件，监听质押操作
- **Unstaked**：代币解质押事件，监听解质押操作
- **RewardPaid**：奖励发放事件，监听奖励领取

#### 5.2.4 身份相关事件

- **IdentityCreated**：身份创建事件，监听新用户
- **IdentityUpdated**：身份更新事件，监听资料变更
- **IdentityVerified**：身份验证事件，监听验证状态
- **ReputationChanged**：声誉变更事件，监听声誉更新

#### 5.2.5 DAO相关事件

- **ProposalCreated**：提案创建事件，监听新提案
- **VoteCast**：投票事件，监听投票活动
- **ProposalExecuted**：提案执行事件，监听提案结果
- **DelegateChanged**：委托变更事件，监听投票权委托

### 5.3 事件处理策略

为确保事件处理的可靠性和效率，采用以下策略：

1. **去抖动**：对频繁触发的事件进行去抖动处理
2. **批量处理**：将多个相关事件批量处理，减少状态更新次数
3. **错误处理**：为事件处理添加错误捕获和恢复机制
4. **重试机制**：对失败的事件处理实现自动重试

## 6. 具体实现示例

### 6.1 数据流实现示例

#### 6.1.1 NFT创建与上架流程

```javascript
// NFTMinter.js
import React, { useState } from 'react';
import { useNFT } from '../../context/nft';
import { useMarketplace } from '../../context/marketplace';
import { useBlockchain } from '../../context/blockchain';

const NFTMinter = () => {
  const { active, account } = useBlockchain();
  const { mintNFT, uploadMetadata } = useNFT();
  const { listItem } = useMarketplace();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState('');
  const [listForSale, setListForSale] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleMint = async (e) => {
    e.preventDefault();
    
    if (!active || !account) {
      setError('请先连接钱包');
      return;
    }
    
    if (!name || !description || !file) {
      setError('请填写所有必填字段');
      return;
    }
    
    if (listForSale && (!price || parseFloat(price) <= 0)) {
      setError('请输入有效的价格');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // 1. 上传元数据到IPFS
      const metadata = {
        name,
        description,
        image: file,
        attributes: [
          {
            trait_type: 'Creator',
            value: account
          }
        ]
      };
      
      const metadataURI = await uploadMetadata(metadata);
      
      // 2. 铸造NFT
      const result = await mintNFT(metadataURI);
      
      if (result.success) {
        setSuccess(`NFT铸造成功！TokenID: ${result.tokenId}`);
        
        // 3. 如果选择上架，则上架到市场
        if (listForSale) {
          const listResult = await listItem(
            result.contractAddress,
            result.tokenId,
            price
          );
          
          if (listResult.success) {
            setSuccess(`NFT铸造并上架成功！TokenID: ${result.tokenId}, ItemID: ${listResult.itemId}`);
          } else {
            setSuccess(`NFT铸造成功，但上架失败: ${listResult.error}`);
          }
        }
        
        // 重置表单
        setName('');
        setDescription('');
        setFile(null);
        setPrice('');
        setListForSale(false);
      } else {
        setError(`铸造失败: ${result.error}`);
      }
    } catch (error) {
      console.error('铸造NFT失败:', error);
      setError(error.message || '铸造NFT时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="nft-minter">
      <h2>创建NFT</h2>
      
      {/* 表单内容 */}
    </div>
  );
};

export default NFTMinter;
```

#### 6.1.2 NFT购买流程

```javascript
// NFTMarketDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { useMarketplace } from '../../context/marketplace';
import TransactionStatus from '../blockchain/TransactionStatus';

const NFTMarketDetail = () => {
  const { contractAddress, tokenId } = useParams();
  const { active, account } = useBlockchain();
  const { fetchItemDetails, buyItem, placeBid } = useMarketplace();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState('');
  
  useEffect(() => {
    const loadItemDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const itemDetails = await fetchItemDetails(contractAddress, tokenId);
        setItem(itemDetails);
      } catch (error) {
        console.error('加载项目详情失败:', error);
        setError('加载项目详情时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadItemDetails();
  }, [contractAddress, tokenId, fetchItemDetails]);
  
  const handleBuy = async () => {
    if (!active || !account) {
      setError('请先连接钱包');
      return;
    }
    
    try {
      setTxStatus('pending');
      setError('');
      
      const result = await buyItem(item.itemId, item.price);
      
      if (result.success) {
        setTxStatus('success');
        setTxHash(result.transactionHash);
        
        // 更新项目状态
        const updatedItem = await fetchItemDetails(contractAddress, tokenId);
        setItem(updatedItem);
      } else {
        setTxStatus('error');
        setError(result.error);
      }
    } catch (error) {
      console.error('购买NFT失败:', error);
      setTxStatus('error');
      setError(error.message || '购买NFT时出错，请稍后再试');
    }
  };
  
  const handleBid = async () => {
    if (!active || !account) {
      setError('请先连接钱包');
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('请输入有效的出价金额');
      return;
    }
    
    const minBid = item.highestBid 
      ? (parseFloat(item.highestBid) * 1.05).toFixed(4) // 最低加价5%
      : item.price;
    
    if (parseFloat(bidAmount) < parseFloat(minBid)) {
      setError(`出价必须高于当前最高出价的5%，最低出价: ${minBid} ETH`);
      return;
    }
    
    try {
      setTxStatus('pending');
      setError('');
      
      const result = await placeBid(item.itemId, bidAmount);
      
      if (result.success) {
        setTxStatus('success');
        setTxHash(result.transactionHash);
        setBidAmount('');
        
        // 更新项目状态
        const updatedItem = await fetchItemDetails(contractAddress, tokenId);
        setItem(updatedItem);
      } else {
        setTxStatus('error');
        setError(result.error);
      }
    } catch (error) {
      console.error('出价失败:', error);
      setTxStatus('error');
      setError(error.message || '出价时出错，请稍后再试');
    }
  };
  
  const resetStatus = () => {
    setTxStatus(null);
    setTxHash('');
    setError('');
  };
  
  // 渲染逻辑...
  
  return (
    <div className="nft-market-detail">
      {/* 详情内容 */}
      
      <TransactionStatus 
        status={txStatus}
        txHash={txHash}
        errorMessage={error}
        resetStatus={resetStatus}
      />
    </div>
  );
};

export default NFTMarketDetail;
```

### 6.2 状态管理实现示例

#### 6.2.1 通证上下文实现

```javascript
// TokenContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useBlockchain } from './blockchain';
import { getTokenContract, getSignedTokenContract } from '../contracts/token/CultureToken';
import { ethers } from 'ethers';

// 创建通证上下文
export const TokenContext = createContext({
  tokenName: '',
  tokenSymbol: '',
  totalSupply: '0',
  balance: '0',
  transactions: [],
  stakingInfo: null,
  rewards: '0',
  loading: false,
  error: null,
  getBalance: () => {},
  transfer: () => {},
  stake: () => {},
  unstake: () => {},
  claimRewards: () => {},
  fetchTransactions: () => {}
});

// 通证上下文提供者组件
export const TokenProvider = ({ children }) => {
  const { active, account, library, chainId } = useBlockchain();
  
  const [tokenName, setTokenName] = useState('Culture Token');
  const [tokenSymbol, setTokenSymbol] = useState('CULT');
  const [totalSupply, setTotalSupply] = useState('0');
  const [balance, setBalance] = useState('0');
  const [transactions, setTransactions] = useState([]);
  const [stakingInfo, setStakingInfo] = useState(null);
  const [rewards, setRewards] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 初始化代币信息
  useEffect(() => {
    const initTokenInfo = async () => {
      if (!active || !library || !chainId) return;
      
      try {
        const contract = getTokenContract(library, chainId);
        
        const name = await contract.name();
        const symbol = await contract.symbol();
        const supply = await contract.totalSupply();
        
        setTokenName(name);
        setTokenSymbol(symbol);
        setTotalSupply(ethers.utils.formatUnits(supply, 18));
      } catch (error) {
        console.error('初始化代币信息失败:', error);
      }
    };
    
    initTokenInfo();
  }, [active, library, chainId]);
  
  // 获取用户余额
  useEffect(() => {
    const fetchBalance = async () => {
      if (!active || !account || !library || !chainId) return;
      
      try {
        const balance = await getBalance(account);
        setBalance(balance);
      } catch (error) {
        console.error('获取余额失败:', error);
      }
    };
    
    fetchBalance();
    
    // 设置定时刷新
    const intervalId = setInterval(fetchBalance, 30000); // 每30秒刷新一次
    
    return () => clearInterval(intervalId);
  }, [active, account, library, chainId]);
  
  // 监听Transfer事件
  useEffect(() => {
    if (!active || !account || !library || !chainId) return;
    
    const contract = getTokenContract(library, chainId);
    
    // 监听发送给用户的转账
    const filterTo = contract.filters.Transfer(null, account);
    // 监听用户发送的转账
    const filterFrom = contract.filters.Transfer(account);
    
    const handleTransfer = async (from, to, amount) => {
      console.log(`转账: 从${from}到${to}，金额: ${ethers.utils.formatUnits(amount, 18)} ${tokenSymbol}`);
      
      // 更新余额
      const newBalance = await getBalance(account);
      setBalance(newBalance);
      
      // 更新交易历史
      fetchTransactions();
    };
    
    contract.on(filterTo, handleTransfer);
    contract.on(filterFrom, handleTransfer);
    
    return () => {
      contract.off(filterTo, handleTransfer);
      contract.off(filterFrom, handleTransfer);
    };
  }, [active, account, library, chainId, tokenSymbol]);
  
  // 获取余额
  const getBalance = async (address) => {
    if (!library || !chainId) return '0';
    
    try {
      const contract = getTokenContract(library, chainId);
      const balance = await contract.balanceOf(address);
      return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error('获取余额失败:', error);
      return '0';
    }
  };
  
  // 转账
  const transfer = async (recipient, amount) => {
    if (!active || !account || !library || !chainId) {
      throw new Error('请先连接钱包');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const contract = await getSignedTokenContract(library, chainId);
      const amountInWei = ethers.utils.parseUnits(amount, 18);
      
      const tx = await contract.transfer(recipient, amountInWei);
      const receipt = await tx.wait();
      
      // 更新余额
      const newBalance = await getBalance(account);
      setBalance(newBalance);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('转账失败:', error);
      setError('转账失败，请稍后再试');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // 质押代币
  const stake = async (amount) => {
    // 实现质押逻辑
  };
  
  // 解除质押
  const unstake = async (amount) => {
    // 实现解除质押逻辑
  };
  
  // 领取奖励
  const claimRewards = async () => {
    // 实现领取奖励逻辑
  };
  
  // 获取交易历史
  const fetchTransactions = async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setLoading(true);
      
      const contract = getTokenContract(library, chainId);
      
      // 获取发送给用户的转账
      const filterTo = contract.filters.Transfer(null, account);
      const eventsTo = await contract.queryFilter(filterTo, 0, 'latest');
      
      // 获取用户发送的转账
      const filterFrom = contract.filters.Transfer(account);
      const eventsFrom = await contract.queryFilter(filterFrom, 0, 'latest');
      
      // 合并并排序事件
      const allEvents = [...eventsTo, ...eventsFrom];
      allEvents.sort((a, b) => b.blockNumber - a.blockNumber);
      
      // 处理事件数据
      const txs = await Promise.all(allEvents.map(async (event) => {
        const block = await library.getBlock(event.blockNumber);
        
        return {
          hash: event.transactionHash,
          from: event.args.from,
          to: event.args.to,
          amount: ethers.utils.formatUnits(event.args.value, 18),
          timestamp: block.timestamp * 1000, // 转换为毫秒
          type: event.args.from === account ? 'out' : 'in'
        };
      }));
      
      setTransactions(txs);
    } catch (error) {
      console.error('获取交易历史失败:', error);
      setError('获取交易历史失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 上下文值
  const contextValue = {
    tokenName,
    tokenSymbol,
    totalSupply,
    balance,
    transactions,
    stakingInfo,
    rewards,
    loading,
    error,
    getBalance,
    transfer,
    stake,
    unstake,
    claimRewards,
    fetchTransactions
  };
  
  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

// 自定义Hook，方便在组件中使用通证上下文
export const useToken = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken必须在TokenProvider内部使用');
  }
  return context;
};
```

#### 6.2.2 身份上下文实现

```javascript
// IdentityContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useBlockchain } from './blockchain';
import { getIdentityContract, getSignedIdentityContract } from '../contracts/identity/Identity';
import { ethers } from 'ethers';

// 创建身份上下文
export const IdentityContext = createContext({
  myIdentity: null,
  featuredIdentities: [],
  loading: false,
  error: null,
  getIdentity: () => {},
  createIdentity: () => {},
  updateIdentity: () => {},
  verifyIdentity: () => {},
  getUserNFTs: () => {},
  isCurrentUser: () => {}
});

// 身份上下文提供者组件
export const IdentityProvider = ({ children }) => {
  const { active, account, library, chainId } = useBlockchain();
  
  const [myIdentity, setMyIdentity] = useState(null);
  const [featuredIdentities, setFeaturedIdentities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 初始化用户身份
  useEffect(() => {
    const initUserIdentity = async () => {
      if (!active || !account || !library || !chainId) {
        setMyIdentity(null);
        return;
      }
      
      try {
        const identity = await getIdentity(account);
        setMyIdentity(identity);
      } catch (error) {
        console.error('初始化用户身份失败:', error);
        setMyIdentity(null);
      }
    };
    
    initUserIdentity();
  }, [active, account, library, chainId]);
  
  // 获取精选身份
  useEffect(() => {
    const fetchFeaturedIdentities = async () => {
      if (!library || !chainId) return;
      
      try {
        setLoading(true);
        
        const contract = getIdentityContract(library, chainId);
        
        // 获取最近创建的身份
        const filter = contract.filters.IdentityCreated();
        const events = await contract.queryFilter(filter, 0, 'latest');
        
        // 按时间倒序排序
        events.sort((a, b) => b.blockNumber - a.blockNumber);
        
        // 获取前10个身份
        const recentIdentities = events.slice(0, 10);
        
        // 获取身份详情
        const identities = await Promise.all(recentIdentities.map(async (event) => {
          const address = event.args.user;
          return await getIdentity(address);
        }));
        
        // 按声誉排序
        identities.sort((a, b) => b.reputation - a.reputation);
        
        setFeaturedIdentities(identities);
      } catch (error) {
        console.error('获取精选身份失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedIdentities();
  }, [library, chainId]);
  
  // 获取身份信息
  const getIdentity = async (address) => {
    if (!library || !chainId) return null;
    
    try {
      const contract = getIdentityContract(library, chainId);
      
      // 检查身份是否存在
      const exists = await contract.identityExists(address);
      
      if (!exists) {
        return null;
      }
      
      // 获取身份信息
      const identity = await contract.getIdentity(address);
      
      // 获取声誉信息
      const reputation = await contract.getReputation(address);
      
      // 获取徽章
      const badgeCount = await contract.getBadgeCount(address);
      const badges = [];
      
      for (let i = 0; i < badgeCount; i++) {
        const badge = await contract.getBadge(address, i);
        badges.push({
          id: badge.id.toString(),
          name: badge.name,
          description: badge.description,
          icon: badge.icon
        });
      }
      
      // 计算等级（假设每100点声誉提升一级）
      const level = Math.floor(reputation / 100) + 1;
      const levelNames = ['新手', '初级', '中级', '高级', '专家', '大师'];
      const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];
      
      return {
        id: address,
        address,
        name: identity.name,
        bio: identity.bio,
        avatar: identity.avatar,
        website: identity.website,
        social: identity.social,
        verified: identity.verified,
        createdAt: new Date(identity.createdAt.toNumber() * 1000),
        updatedAt: new Date(identity.updatedAt.toNumber() * 1000),
        reputation: reputation.toNumber(),
        level,
        levelName,
        badges
      };
    } catch (error) {
      console.error('获取身份信息失败:', error);
      return null;
    }
  };
  
  // 创建身份
  const createIdentity = async (name, bio, avatar, website, social) => {
    if (!active || !account || !library || !chainId) {
      throw new Error('请先连接钱包');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const contract = await getSignedIdentityContract(library, chainId);
      
      const tx = await contract.createIdentity(
        name,
        bio,
        avatar,
        website,
        social
      );
      
      const receipt = await tx.wait();
      
      // 更新用户身份
      const identity = await getIdentity(account);
      setMyIdentity(identity);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('创建身份失败:', error);
      setError('创建身份失败，请稍后再试');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // 更新身份
  const updateIdentity = async (name, bio, avatar, website, social) => {
    if (!active || !account || !library || !chainId) {
      throw new Error('请先连接钱包');
    }
    
    if (!myIdentity) {
      throw new Error('您还没有创建身份');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const contract = await getSignedIdentityContract(library, chainId);
      
      const tx = await contract.updateIdentity(
        name,
        bio,
        avatar,
        website,
        social
      );
      
      const receipt = await tx.wait();
      
      // 更新用户身份
      const identity = await getIdentity(account);
      setMyIdentity(identity);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('更新身份失败:', error);
      setError('更新身份失败，请稍后再试');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // 验证身份
  const verifyIdentity = async (proofType, proofData) => {
    if (!active || !account || !library || !chainId) {
      throw new Error('请先连接钱包');
    }
    
    if (!myIdentity) {
      throw new Error('您还没有创建身份');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const contract = await getSignedIdentityContract(library, chainId);
      
      const tx = await contract.verifyIdentity(proofType, proofData);
      
      const receipt = await tx.wait();
      
      // 更新用户身份
      const identity = await getIdentity(account);
      setMyIdentity(identity);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('验证身份失败:', error);
      setError('验证身份失败，请稍后再试');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // 获取用户NFT
  const getUserNFTs = async (address) => {
    // 实现获取用户NFT的逻辑
    return [];
  };
  
  // 检查是否当前用户
  const isCurrentUser = (address) => {
    return active && account && address && address.toLowerCase() === account.toLowerCase();
  };
  
  // 上下文值
  const contextValue = {
    myIdentity,
    featuredIdentities,
    loading,
    error,
    getIdentity,
    createIdentity,
    updateIdentity,
    verifyIdentity,
    getUserNFTs,
    isCurrentUser
  };
  
  return (
    <IdentityContext.Provider value={contextValue}>
      {children}
    </IdentityContext.Provider>
  );
};

// 自定义Hook，方便在组件中使用身份上下文
export const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error('useIdentity必须在IdentityProvider内部使用');
  }
  return context;
};
```

### 6.3 数据持久化实现示例

```javascript
// utils/storage.js

// 本地存储键前缀
const STORAGE_PREFIX = 'culturebridge_';

// 设置项目
export const setItem = (key, value, storage = localStorage) => {
  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    const serializedValue = JSON.stringify(value);
    storage.setItem(prefixedKey, serializedValue);
    return true;
  } catch (error) {
    console.error(`存储项目失败: ${key}`, error);
    return false;
  }
};

// 获取项目
export const getItem = (key, defaultValue = null, storage = localStorage) => {
  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    const serializedValue = storage.getItem(prefixedKey);
    
    if (serializedValue === null) {
      return defaultValue;
    }
    
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error(`获取项目失败: ${key}`, error);
    return defaultValue;
  }
};

// 移除项目
export const removeItem = (key, storage = localStorage) => {
  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    storage.removeItem(prefixedKey);
    return true;
  } catch (error) {
    console.error(`移除项目失败: ${key}`, error);
    return false;
  }
};

// 清除所有项目
export const clearItems = (storage = localStorage) => {
  try {
    // 只清除我们的前缀项目
    const keys = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key.startsWith(STORAGE_PREFIX)) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => storage.removeItem(key));
    return true;
  } catch (error) {
    console.error('清除项目失败', error);
    return false;
  }
};

// 带过期时间的存储
export const setItemWithExpiry = (key, value, ttl, storage = localStorage) => {
  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    const now = new Date();
    const item = {
      value,
      expiry: now.getTime() + ttl
    };
    const serializedValue = JSON.stringify(item);
    storage.setItem(prefixedKey, serializedValue);
    return true;
  } catch (error) {
    console.error(`存储项目失败: ${key}`, error);
    return false;
  }
};

// 获取带过期时间的项目
export const getItemWithExpiry = (key, defaultValue = null, storage = localStorage) => {
  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    const serializedValue = storage.getItem(prefixedKey);
    
    if (serializedValue === null) {
      return defaultValue;
    }
    
    const item = JSON.parse(serializedValue);
    const now = new Date();
    
    // 检查是否过期
    if (now.getTime() > item.expiry) {
      // 已过期，删除项目
      storage.removeItem(prefixedKey);
      return defaultValue;
    }
    
    return item.value;
  } catch (error) {
    console.error(`获取项目失败: ${key}`, error);
    return defaultValue;
  }
};

// IndexedDB操作
export const idb = {
  // 打开数据库
  openDB: (dbName, version, upgradeCallback) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(`${STORAGE_PREFIX}${dbName}`, version);
      
      request.onerror = (event) => {
        reject(`打开数据库失败: ${event.target.error}`);
      };
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (upgradeCallback) {
          upgradeCallback(db, event.oldVersion, event.newVersion);
        }
      };
    });
  },
  
  // 存储数据
  putItem: (db, storeName, item, key = null) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      let request;
      if (key !== null) {
        request = store.put(item, key);
      } else {
        request = store.put(item);
      }
      
      request.onerror = (event) => {
        reject(`存储数据失败: ${event.target.error}`);
      };
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  },
  
  // 获取数据
  getItem: (db, storeName, key) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onerror = (event) => {
        reject(`获取数据失败: ${event.target.error}`);
      };
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  },
  
  // 删除数据
  deleteItem: (db, storeName, key) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onerror = (event) => {
        reject(`删除数据失败: ${event.target.error}`);
      };
      
      request.onsuccess = (event) => {
        resolve();
      };
    });
  },
  
  // 获取所有数据
  getAllItems: (db, storeName) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onerror = (event) => {
        reject(`获取所有数据失败: ${event.target.error}`);
      };
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  },
  
  // 清除存储
  clearStore: (db, storeName) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onerror = (event) => {
        reject(`清除存储失败: ${event.target.error}`);
      };
      
      request.onsuccess = (event) => {
        resolve();
      };
    });
  }
};

// 缓存管理
export const cache = {
  // 设置缓存
  set: (key, value, ttl = 3600000) => { // 默认1小时
    return setItemWithExpiry(key, value, ttl);
  },
  
  // 获取缓存
  get: (key, defaultValue = null) => {
    return getItemWithExpiry(key, defaultValue);
  },
  
  // 移除缓存
  remove: (key) => {
    return removeItem(key);
  },
  
  // 清除所有缓存
  clear: () => {
    return clearItems();
  }
};

// 用户偏好设置
export const userPreferences = {
  // 获取主题
  getTheme: () => {
    return getItem('theme', 'light');
  },
  
  // 设置主题
  setTheme: (theme) => {
    return setItem('theme', theme);
  },
  
  // 获取语言
  getLanguage: () => {
    return getItem('language', 'zh-CN');
  },
  
  // 设置语言
  setLanguage: (language) => {
    return setItem('language', language);
  },
  
  // 获取所有偏好设置
  getAll: () => {
    return {
      theme: getItem('theme', 'light'),
      language: getItem('language', 'zh-CN'),
      notifications: getItem('notifications', true),
      autoConnect: getItem('autoConnect', false)
    };
  },
  
  // 设置偏好设置
  set: (key, value) => {
    return setItem(key, value);
  }
};

// 离线操作队列
export const offlineQueue = {
  // 添加操作
  addOperation: (operation) => {
    const queue = getItem('offlineQueue', []);
    queue.push({
      ...operation,
      timestamp: Date.now()
    });
    return setItem('offlineQueue', queue);
  },
  
  // 获取所有操作
  getOperations: () => {
    return getItem('offlineQueue', []);
  },
  
  // 移除操作
  removeOperation: (index) => {
    const queue = getItem('offlineQueue', []);
    if (index >= 0 && index < queue.length) {
      queue.splice(index, 1);
      return setItem('offlineQueue', queue);
    }
    return false;
  },
  
  // 清空队列
  clearQueue: () => {
    return setItem('offlineQueue', []);
  }
};

export default {
  setItem,
  getItem,
  removeItem,
  clearItems,
  setItemWithExpiry,
  getItemWithExpiry,
  idb,
  cache,
  userPreferences,
  offlineQueue
};
```

### 6.4 事件监听实现示例

```javascript
// hooks/useContractEvents.js
import { useState, useEffect } from 'react';
import { useBlockchain } from '../context/blockchain';

/**
 * 自定义Hook，用于监听合约事件
 * @param {Object} contract - 合约实例
 * @param {string} eventName - 事件名称
 * @param {Object} filter - 事件过滤器
 * @param {Function} callback - 事件回调函数
 * @returns {Object} 事件状态
 */
export const useContractEvent = (contract, eventName, filter = null, callback = null) => {
  const { active } = useBlockchain();
  const [lastEvent, setLastEvent] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!active || !contract || !eventName) return;
    
    let eventFilter;
    if (filter) {
      eventFilter = contract.filters[eventName](...filter);
    } else {
      eventFilter = contract.filters[eventName]();
    }
    
    const handleEvent = (...args) => {
      const eventData = {
        name: eventName,
        args,
        timestamp: Date.now()
      };
      
      setLastEvent(eventData);
      
      if (callback) {
        try {
          callback(...args);
        } catch (error) {
          console.error(`事件回调执行失败: ${eventName}`, error);
          setError(error.message);
        }
      }
    };
    
    try {
      contract.on(eventFilter, handleEvent);
    } catch (error) {
      console.error(`监听事件失败: ${eventName}`, error);
      setError(error.message);
    }
    
    return () => {
      try {
        contract.off(eventFilter, handleEvent);
      } catch (error) {
        console.error(`取消监听事件失败: ${eventName}`, error);
      }
    };
  }, [active, contract, eventName, filter, callback]);
  
  return { lastEvent, error };
};

/**
 * 自定义Hook，用于监听多个合约事件
 * @param {Object} contract - 合约实例
 * @param {Array} events - 事件配置数组，每项包含 { name, filter, callback }
 * @returns {Object} 事件状态
 */
export const useContractEvents = (contract, events) => {
  const { active } = useBlockchain();
  const [lastEvents, setLastEvents] = useState({});
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (!active || !contract || !events || events.length === 0) return;
    
    const listeners = [];
    
    events.forEach(event => {
      const { name, filter = null, callback = null } = event;
      
      let eventFilter;
      if (filter) {
        eventFilter = contract.filters[name](...filter);
      } else {
        eventFilter = contract.filters[name]();
      }
      
      const handleEvent = (...args) => {
        const eventData = {
          name,
          args,
          timestamp: Date.now()
        };
        
        setLastEvents(prev => ({
          ...prev,
          [name]: eventData
        }));
        
        if (callback) {
          try {
            callback(...args);
          } catch (error) {
            console.error(`事件回调执行失败: ${name}`, error);
            setErrors(prev => ({
              ...prev,
              [name]: error.message
            }));
          }
        }
      };
      
      try {
        contract.on(eventFilter, handleEvent);
        listeners.push({ name, filter: eventFilter, handler: handleEvent });
      } catch (error) {
        console.error(`监听事件失败: ${name}`, error);
        setErrors(prev => ({
          ...prev,
          [name]: error.message
        }));
      }
    });
    
    return () => {
      listeners.forEach(listener => {
        try {
          contract.off(listener.filter, listener.handler);
        } catch (error) {
          console.error(`取消监听事件失败: ${listener.name}`, error);
        }
      });
    };
  }, [active, contract, events]);
  
  return { lastEvents, errors };
};

/**
 * 自定义Hook，用于查询历史事件
 * @param {Object} contract - 合约实例
 * @param {string} eventName - 事件名称
 * @param {Object} filter - 事件过滤器
 * @param {number} fromBlock - 起始区块
 * @param {number|string} toBlock - 结束区块，默认为'latest'
 * @returns {Object} 查询状态和结果
 */
export const useEventHistory = (contract, eventName, filter = null, fromBlock = 0, toBlock = 'latest') => {
  const { active, library } = useBlockchain();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchEvents = async () => {
    if (!active || !contract || !eventName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let eventFilter;
      if (filter) {
        eventFilter = contract.filters[eventName](...filter);
      } else {
        eventFilter = contract.filters[eventName]();
      }
      
      const logs = await contract.queryFilter(eventFilter, fromBlock, toBlock);
      
      // 处理事件数据
      const processedEvents = await Promise.all(logs.map(async (log) => {
        const block = await library.getBlock(log.blockNumber);
        
        return {
          name: eventName,
          args: log.args,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          timestamp: block.timestamp * 1000, // 转换为毫秒
          logIndex: log.logIndex
        };
      }));
      
      // 按区块号和日志索引排序
      processedEvents.sort((a, b) => {
        if (a.blockNumber !== b.blockNumber) {
          return b.blockNumber - a.blockNumber; // 降序
        }
        return b.logIndex - a.logIndex; // 降序
      });
      
      setEvents(processedEvents);
    } catch (error) {
      console.error(`查询事件历史失败: ${eventName}`, error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, [active, contract, eventName, filter, fromBlock, toBlock]);
  
  return { events, loading, error, refetch: fetchEvents };
};

export default {
  useContractEvent,
  useContractEvents,
  useEventHistory
};
```

## 7. 总结

本文档详细描述了CultureBridge平台的数据流与状态管理技术方案，包括数据流架构、状态管理策略、数据持久化方案和事件监听机制。通过合理的数据流设计和状态管理，确保平台各功能模块之间的数据交互高效、一致，提升用户体验和开发效率。

主要技术亮点包括：

1. **单向数据流架构**：采用清晰的单向数据流，确保状态变化的可预测性和可追踪性
2. **基于Context的状态管理**：使用React Context API和自定义Hooks实现模块化的状态管理
3. **多级缓存策略**：结合内存缓存和本地存储，提高应用响应速度
4. **完善的事件监听机制**：实时监听区块链事件，保持UI与链上数据的同步
5. **离线支持**：提供基本的离线操作队列，提升用户体验

通过这些技术方案的实施，CultureBridge平台将实现高效、可靠的数据流和状态管理，为用户提供流畅的区块链文化交流体验。
