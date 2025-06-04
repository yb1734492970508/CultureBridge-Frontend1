# NFT成就与治理系统前端-合约集成规范

## 1. 概述

本文档定义了CultureBridge平台NFT成就系统与DAO治理系统前端组件与智能合约的集成规范，确保前端界面与区块链后端的无缝对接。文档包含数据流设计、事件监听机制、错误处理策略、性能优化方案以及测试验证流程，为开发团队提供全面的集成指导。

## 2. 数据流设计

### 2.1 前端-合约数据流图

```
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  前端用户界面          |<--->|  Web3集成层            |<--->|  智能合约              |
|  (React组件)           |     |  (Provider/Context)    |     |  (Solidity)            |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
        ^                                ^                               ^
        |                                |                               |
        v                                v                               v
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  状态管理              |<--->|  缓存层                |<--->|  事件监听器            |
|  (Redux/Context)       |     |  (LocalStorage/IndexDB)|     |  (Web3 Events)         |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
```

### 2.2 关键数据流程

#### 2.2.1 NFT成就数据流

1. **成就列表获取**
   - 前端调用`CBAchievementManager.getUserInProgressAchievements`获取进行中成就
   - 前端调用`CBNFTCore.getOwnedAchievements`获取已解锁成就
   - 数据通过Web3集成层处理后存入Redux状态
   - UI组件从Redux读取数据并渲染

2. **成就解锁流程**
   - 用户触发解锁操作
   - 前端调用`CBAchievementManager.unlockAchievement`
   - 监听`AchievementUnlocked`事件
   - 收到事件后更新Redux状态并触发UI更新
   - 显示解锁成功动画

3. **成就进度更新**
   - 后端通过`CBAchievementManager.recordUserProgress`记录进度
   - 前端定期轮询或监听事件获取最新进度
   - 更新Redux状态并刷新进度条UI

#### 2.2.2 治理数据流

1. **提案列表获取**
   - 前端调用`CBProposalManager.getActiveProposals`获取活跃提案
   - 数据通过Web3集成层处理后存入Redux状态
   - UI组件从Redux读取数据并渲染提案列表

2. **投票流程**
   - 用户选择投票选项
   - 前端调用`CBGovernorCore.castVote`或`castVoteWithReason`
   - 监听`VoteCast`事件
   - 收到事件后更新Redux状态并触发UI更新
   - 显示投票成功反馈

3. **提案创建流程**
   - 用户填写提案表单
   - 前端调用`CBProposalManager.payProposalFee`支付提案费用
   - 前端调用`CBGovernorCore.propose`创建提案
   - 前端调用`CBProposalManager.setProposalMetadata`设置元数据
   - 监听`ProposalCreated`事件
   - 收到事件后更新Redux状态并触发UI更新
   - 显示提案创建成功页面

### 2.3 数据模型映射

| 合约数据结构 | 前端数据模型 | 转换逻辑 |
|------------|------------|---------|
| `AchievementDetails` | `Achievement` | 合并NFT元数据与链上数据 |
| `ProposalDetails` | `Proposal` | 合并IPFS元数据与链上数据 |
| `UserProgress` | `AchievementProgress` | 计算百分比进度 |
| `VotingPower` | `UserVotingPower` | 分解不同来源的投票权重 |
| `BenefitValue` | `UserBenefit` | 格式化为用户友好的显示 |

## 3. 事件监听机制

### 3.1 核心事件列表

| 事件名称 | 来源合约 | 监听目的 | 处理逻辑 |
|---------|---------|---------|---------|
| `AchievementMinted` | CBNFTCore | 检测新NFT铸造 | 更新用户NFT列表，触发成功动画 |
| `AchievementUnlocked` | CBAchievementManager | 检测成就解锁 | 更新成就状态，触发解锁动画 |
| `UserProgressRecorded` | CBAchievementManager | 跟踪进度更新 | 更新进度条，检查是否可解锁 |
| `ProposalCreated` | CBGovernorCore | 检测新提案 | 添加到提案列表，通知用户 |
| `VoteCast` | CBGovernorCore | 跟踪投票活动 | 更新投票统计，反馈用户操作 |
| `ProposalExecuted` | CBGovernorCore | 检测提案执行 | 更新提案状态，通知相关用户 |
| `BenefitExecuted` | CBBenefitExecutor | 跟踪权益执行 | 更新用户权益显示，通知用户 |

### 3.2 事件订阅实现

```javascript
// 事件监听服务示例
class EventListenerService {
  constructor(web3Provider, contracts, store) {
    this.provider = web3Provider;
    this.contracts = contracts;
    this.store = store;
    this.listeners = [];
  }
  
  // 初始化所有事件监听器
  initializeListeners() {
    this.listenForAchievementEvents();
    this.listenForProposalEvents();
    this.listenForVotingEvents();
    this.listenForBenefitEvents();
  }
  
  // 监听成就相关事件
  listenForAchievementEvents() {
    const nftCore = this.contracts.CBNFTCore;
    const achievementManager = this.contracts.CBAchievementManager;
    
    // 监听成就铸造事件
    const mintListener = nftCore.events.AchievementMinted({})
      .on('data', (event) => {
        const { to, tokenId, achievementId, achievementType } = event.returnValues;
        this.store.dispatch(actions.achievementMinted({
          owner: to,
          tokenId,
          achievementId,
          achievementType
        }));
        
        // 如果是当前用户，触发通知
        const currentUser = this.store.getState().user.address;
        if (to.toLowerCase() === currentUser.toLowerCase()) {
          this.store.dispatch(actions.showNotification({
            type: 'success',
            message: '恭喜！您解锁了新成就',
            achievementId
          }));
        }
      })
      .on('error', this.handleError);
      
    this.listeners.push(mintListener);
    
    // 监听成就解锁事件
    // 监听进度记录事件
    // ...其他事件监听器
  }
  
  // 监听提案相关事件
  listenForProposalEvents() {
    // 实现提案事件监听逻辑
  }
  
  // 监听投票相关事件
  listenForVotingEvents() {
    // 实现投票事件监听逻辑
  }
  
  // 监听权益相关事件
  listenForBenefitEvents() {
    // 实现权益事件监听逻辑
  }
  
  // 统一错误处理
  handleError(error) {
    console.error('Event listener error:', error);
    this.store.dispatch(actions.setError({
      source: 'event',
      message: error.message,
      details: error
    }));
  }
  
  // 清理所有监听器
  cleanup() {
    this.listeners.forEach(listener => {
      listener.unsubscribe();
    });
    this.listeners = [];
  }
}
```

### 3.3 事件过滤与批处理

- 使用合约事件过滤器减少不必要的事件处理
- 实现事件批处理机制，减少UI更新频率
- 设置事件优先级，确保重要事件优先处理
- 实现事件队列，防止事件处理阻塞UI线程

## 4. 错误处理策略

### 4.1 错误类型分类

| 错误类型 | 描述 | 处理策略 |
|---------|------|---------|
| 网络错误 | 与区块链网络连接问题 | 自动重试，提示用户检查网络 |
| 交易错误 | 交易被拒绝或失败 | 显示详细错误信息，提供解决建议 |
| 合约错误 | 合约函数调用失败 | 解析错误原因，提供用户友好提示 |
| 数据错误 | 数据格式或完整性问题 | 尝试修复或重新获取数据 |
| 用户错误 | 用户操作不当 | 提供明确指导和纠正建议 |

### 4.2 错误处理流程

```javascript
// 错误处理服务示例
class ErrorHandlingService {
  constructor(store) {
    this.store = store;
  }
  
  // 处理Web3交易错误
  handleTransactionError(error, operation) {
    console.error(`Transaction error during ${operation}:`, error);
    
    // 解析常见错误类型
    if (error.code === 4001) {
      // 用户拒绝交易
      return this.handleUserRejection(operation);
    } else if (error.message && error.message.includes('gas')) {
      // Gas相关错误
      return this.handleGasError(error, operation);
    } else if (error.message && error.message.includes('nonce')) {
      // Nonce错误
      return this.handleNonceError(error, operation);
    }
    
    // 通用错误处理
    this.store.dispatch(actions.setError({
      source: 'transaction',
      operation,
      message: this.getUserFriendlyMessage(error),
      details: error,
      recoverable: this.isRecoverable(error)
    }));
    
    return false;
  }
  
  // 处理合约调用错误
  handleContractError(error, contract, method, params) {
    console.error(`Contract error in ${contract}.${method}:`, error);
    
    // 解析合约特定错误
    const errorMessage = this.parseContractError(error, contract, method);
    
    this.store.dispatch(actions.setError({
      source: 'contract',
      contract,
      method,
      params,
      message: errorMessage,
      details: error,
      recoverable: this.isContractErrorRecoverable(error, contract, method)
    }));
    
    return false;
  }
  
  // 解析合约错误为用户友好消息
  parseContractError(error, contract, method) {
    // 合约特定错误映射
    const errorMappings = {
      'CBNFTCore': {
        'mintAchievement': {
          'revert: MaxSupplyReached': '该成就已达到最大铸造数量',
          'revert: NotEligible': '您尚未满足解锁该成就的条件',
          // 其他错误映射
        },
        // 其他方法错误映射
      },
      'CBGovernorCore': {
        'propose': {
          'revert: ProposalThresholdNotMet': '您的投票权重不足以创建提案',
          'revert: InvalidProposalType': '提案类型无效',
          // 其他错误映射
        },
        // 其他方法错误映射
      },
      // 其他合约错误映射
    };
    
    // 尝试匹配具体错误
    if (errorMappings[contract] && 
        errorMappings[contract][method] && 
        error.message) {
      for (const [errorPattern, userMessage] of Object.entries(errorMappings[contract][method])) {
        if (error.message.includes(errorPattern)) {
          return userMessage;
        }
      }
    }
    
    // 默认错误消息
    return `操作失败，请稍后重试。如果问题持续存在，请联系支持团队。`;
  }
  
  // 其他错误处理方法
  // ...
}
```

### 4.3 用户反馈机制

- **错误通知**：使用模态框、轻提示或内联消息显示错误
- **恢复建议**：为常见错误提供具体的恢复步骤
- **自动恢复**：对于可恢复的错误，提供自动重试选项
- **错误日志**：记录详细错误信息，便于用户报告问题
- **帮助资源**：提供链接指向常见问题解答或支持渠道

## 5. 性能优化方案

### 5.1 数据加载优化

#### 5.1.1 批量数据获取

```javascript
// 批量获取NFT数据示例
async function batchLoadNFTData(tokenIds, contracts) {
  // 将tokenIds分批，每批最多50个
  const batches = [];
  for (let i = 0; i < tokenIds.length; i += 50) {
    batches.push(tokenIds.slice(i, i + 50));
  }
  
  // 并行处理每批数据
  const results = await Promise.all(batches.map(async (batchIds) => {
    // 使用multicall合约批量调用
    const multicall = new Multicall({ web3Instance, tryAggregate: true });
    
    const calls = batchIds.map(id => ({
      reference: `token-${id}`,
      methodName: 'getAchievementDetails',
      methodParameters: [id]
    }));
    
    const { results } = await multicall.call({
      reference: 'nftBatch',
      contractAddress: contracts.CBNFTCore.options.address,
      abi: contracts.CBNFTCore.options.jsonInterface,
      calls
    });
    
    return results;
  }));
  
  // 合并结果
  return results.flat().reduce((acc, result) => {
    const tokenId = result.reference.split('-')[1];
    acc[tokenId] = result.returnValues;
    return acc;
  }, {});
}
```

#### 5.1.2 数据预加载策略

- 预测用户可能需要的数据并提前加载
- 实现智能缓存策略，优先加载高频访问数据
- 使用懒加载技术，仅在需要时加载详细数据
- 实现数据预取，在用户空闲时加载可能需要的数据

### 5.2 区块链交互优化

#### 5.2.1 交易批处理

```javascript
// 批量处理交易示例
async function batchProcessTransactions(transactions, web3, account) {
  // 准备批量交易
  const batch = new web3.BatchRequest();
  
  // 添加交易到批处理
  const promises = transactions.map(tx => {
    return new Promise((resolve, reject) => {
      const request = tx.method.request(
        ...tx.params,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      batch.add(request);
    });
  });
  
  // 执行批处理
  batch.execute();
  
  // 等待所有交易完成
  return Promise.all(promises);
}
```

#### 5.2.2 Gas优化策略

- 实现动态Gas价格估算，确保交易及时确认
- 提供Gas费用预估，让用户了解操作成本
- 实现交易批处理，减少单独交易次数
- 优化合约调用参数，减少Gas消耗

### 5.3 UI渲染优化

#### 5.3.1 虚拟列表

```jsx
// 虚拟列表组件示例
import { FixedSizeGrid } from 'react-window';

const NFTVirtualGrid = ({ items, itemSize, width, height, columns }) => {
  const rowCount = Math.ceil(items.length / columns);
  
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columns + columnIndex;
    if (index >= items.length) return null;
    
    const item = items[index];
    return (
      <div style={style}>
        <NFTCard 
          id={item.id}
          name={item.name}
          description={item.description}
          imageUrl={item.imageUrl}
          rarity={item.rarity}
          unlockDate={item.unlockDate}
          benefits={item.benefits}
          unlocked={item.unlocked}
        />
      </div>
    );
  };
  
  return (
    <FixedSizeGrid
      columnCount={columns}
      columnWidth={itemSize}
      height={height}
      rowCount={rowCount}
      rowHeight={itemSize}
      width={width}
    >
      {Cell}
    </FixedSizeGrid>
  );
};
```

#### 5.3.2 组件优化

- 使用React.memo避免不必要的重渲染
- 实现shouldComponentUpdate或使用PureComponent
- 使用useCallback和useMemo优化函数和计算值
- 拆分大型组件为更小的可复用组件
- 使用CSS动画代替JavaScript动画，减少主线程负担

### 5.4 缓存策略

#### 5.4.1 多层缓存设计

```javascript
// 多层缓存服务示例
class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.expiryTimes = new Map();
    this.persistentCache = window.localStorage;
    this.indexedDB = null;
    this.initIndexedDB();
  }
  
  // 初始化IndexedDB
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CultureBridgeCache', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('nftData', { keyPath: 'id' });
        db.createObjectStore('proposalData', { keyPath: 'id' });
        db.createObjectStore('userData', { keyPath: 'address' });
      };
      
      request.onsuccess = (event) => {
        this.indexedDB = event.target.result;
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('IndexedDB初始化失败:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  // 获取数据，按内存缓存 -> localStorage -> IndexedDB -> 网络请求的顺序
  async get(key, category, fetchCallback, ttl = 300000) {
    // 检查内存缓存
    const cacheKey = `${category}:${key}`;
    if (this.memoryCache.has(cacheKey)) {
      const expiryTime = this.expiryTimes.get(cacheKey);
      if (expiryTime > Date.now()) {
        return this.memoryCache.get(cacheKey);
      }
      // 过期则删除
      this.memoryCache.delete(cacheKey);
      this.expiryTimes.delete(cacheKey);
    }
    
    // 检查localStorage
    const localData = this.persistentCache.getItem(cacheKey);
    if (localData) {
      try {
        const { data, expiry } = JSON.parse(localData);
        if (expiry > Date.now()) {
          // 更新内存缓存
          this.memoryCache.set(cacheKey, data);
          this.expiryTimes.set(cacheKey, expiry);
          return data;
        }
        // 过期则删除
        this.persistentCache.removeItem(cacheKey);
      } catch (e) {
        console.error('解析localStorage缓存失败:', e);
      }
    }
    
    // 检查IndexedDB
    if (this.indexedDB) {
      try {
        const data = await this.getFromIndexedDB(key, category);
        if (data && data.expiry > Date.now()) {
          // 更新内存缓存和localStorage
          this.memoryCache.set(cacheKey, data.value);
          this.expiryTimes.set(cacheKey, data.expiry);
          this.persistentCache.setItem(cacheKey, JSON.stringify({
            data: data.value,
            expiry: data.expiry
          }));
          return data.value;
        }
      } catch (e) {
        console.error('从IndexedDB获取缓存失败:', e);
      }
    }
    
    // 从网络获取
    if (fetchCallback) {
      try {
        const data = await fetchCallback();
        const expiry = Date.now() + ttl;
        
        // 更新所有缓存层
        this.memoryCache.set(cacheKey, data);
        this.expiryTimes.set(cacheKey, expiry);
        
        this.persistentCache.setItem(cacheKey, JSON.stringify({
          data,
          expiry
        }));
        
        if (this.indexedDB) {
          this.saveToIndexedDB(key, category, data, expiry);
        }
        
        return data;
      } catch (e) {
        console.error('从网络获取数据失败:', e);
        throw e;
      }
    }
    
    return null;
  }
  
  // 从IndexedDB获取数据
  getFromIndexedDB(key, category) {
    return new Promise((resolve, reject) => {
      if (!this.indexedDB) {
        return reject(new Error('IndexedDB未初始化'));
      }
      
      const transaction = this.indexedDB.transaction([category], 'readonly');
      const store = transaction.objectStore(category);
      const request = store.get(key);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // 保存数据到IndexedDB
  saveToIndexedDB(key, category, value, expiry) {
    return new Promise((resolve, reject) => {
      if (!this.indexedDB) {
        return reject(new Error('IndexedDB未初始化'));
      }
      
      const transaction = this.indexedDB.transaction([category], 'readwrite');
      const store = transaction.objectStore(category);
      const request = store.put({
        id: key,
        value,
        expiry
      });
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // 清除特定缓存
  clear(key, category) {
    const cacheKey = `${category}:${key}`;
    this.memoryCache.delete(cacheKey);
    this.expiryTimes.delete(cacheKey);
    this.persistentCache.removeItem(cacheKey);
    
    if (this.indexedDB) {
      const transaction = this.indexedDB.transaction([category], 'readwrite');
      const store = transaction.objectStore(category);
      store.delete(key);
    }
  }
  
  // 清除所有缓存
  clearAll() {
    this.memoryCache.clear();
    this.expiryTimes.clear();
    
    // 清除localStorage中的缓存
    Object.keys(this.persistentCache).forEach(key => {
      if (key.includes(':')) {
        this.persistentCache.removeItem(key);
      }
    });
    
    // 清除IndexedDB
    if (this.indexedDB) {
      const categories = ['nftData', 'proposalData', 'userData'];
      categories.forEach(category => {
        const transaction = this.indexedDB.transaction([category], 'readwrite');
        const store = transaction.objectStore(category);
        store.clear();
      });
    }
  }
}
```

#### 5.4.2 缓存失效策略

- **时间基础**：设置合理的TTL，不同数据类型有不同过期时间
- **事件驱动**：监听区块链事件，在相关数据变更时清除缓存
- **用户操作**：用户执行写操作后立即清除相关缓存
- **版本标记**：使用版本号标记缓存，在合约升级时清除旧版本缓存

## 6. 测试验证流程

### 6.1 集成测试策略

#### 6.1.1 测试环境设置

```javascript
// 测试环境配置示例
const setupTestEnvironment = async () => {
  // 设置本地区块链测试网络
  const ganache = require('ganache');
  const server = ganache.server({
    accounts: [
      {
        secretKey: '0x...',
        balance: web3.utils.toWei('100', 'ether')
      },
      // 其他测试账户
    ],
    logging: {
      quiet: true
    }
  });
  
  await server.listen(8545);
  
  // 连接到测试网络
  const web3 = new Web3('http://localhost:8545');
  
  // 部署测试合约
  const nftCore = await deployContract(web3, 'CBNFTCore', [...构造函数参数]);
  const governorCore = await deployContract(web3, 'CBGovernorCore', [...构造函数参数]);
  // 部署其他合约
  
  // 设置合约之间的关系
  await nftCore.methods.setAchievementManager(achievementManager.options.address).send({
    from: accounts[0]
  });
  // 设置其他合约关系
  
  // 创建测试数据
  await createTestNFTs(web3, nftCore, accounts);
  await createTestProposals(web3, governorCore, accounts);
  
  return {
    web3,
    server,
    contracts: {
      nftCore,
      governorCore,
      // 其他合约
    },
    accounts
  };
};

// 清理测试环境
const cleanupTestEnvironment = async (server) => {
  await server.close();
};
```

#### 6.1.2 前端-合约集成测试

```javascript
// 前端-合约集成测试示例
describe('NFT成就系统集成测试', () => {
  let testEnv;
  let store;
  let wrapper;
  
  beforeAll(async () => {
    // 设置测试环境
    testEnv = await setupTestEnvironment();
    
    // 创建Redux store
    store = configureStore({
      reducer: rootReducer,
      middleware: [...默认中间件, web3Middleware(testEnv.web3)]
    });
    
    // 设置React组件
    wrapper = mount(
      <Provider store={store}>
        <Web3Provider web3={testEnv.web3} contracts={testEnv.contracts}>
          <NFTAchievementGallery />
        </Web3Provider>
      </Provider>
    );
  });
  
  afterAll(async () => {
    // 清理测试环境
    await cleanupTestEnvironment(testEnv.server);
  });
  
  test('应该正确显示用户拥有的NFT成就', async () => {
    // 触发加载NFT数据的action
    await store.dispatch(actions.loadUserNFTs(testEnv.accounts[0]));
    
    // 等待异步操作完成
    await waitFor(() => {
      const state = store.getState();
      return state.nft.userNFTs.length > 0;
    });
    
    // 更新组件
    wrapper.update();
    
    // 验证NFT卡片是否正确渲染
    const nftCards = wrapper.find('NFTCard');
    expect(nftCards.length).toBe(store.getState().nft.userNFTs.length);
    
    // 验证第一个NFT卡片的内容
    const firstCard = nftCards.first();
    const firstNFT = store.getState().nft.userNFTs[0];
    expect(firstCard.prop('name')).toBe(firstNFT.name);
    expect(firstCard.prop('rarity')).toBe(firstNFT.rarity);
  });
  
  test('应该能够解锁符合条件的成就', async () => {
    // 模拟用户满足解锁条件
    await testEnv.contracts.achievementManager.methods.recordUserProgress(
      testEnv.accounts[0],
      web3.utils.asciiToHex('learning_complete'),
      100
    ).send({ from: testEnv.accounts[0] });
    
    // 获取可解锁的成就
    const eligibleAchievements = await testEnv.contracts.achievementManager.methods.getUserInProgressAchievements(
      testEnv.accounts[0]
    ).call();
    
    const achievementId = eligibleAchievements.achievementIds[0];
    
    // 触发解锁操作
    const unlockButton = wrapper.find(`button[data-achievement-id="${achievementId}"]`);
    unlockButton.simulate('click');
    
    // 等待解锁操作完成
    await waitFor(() => {
      const state = store.getState();
      return state.nft.unlockedAchievements.includes(achievementId);
    });
    
    // 验证解锁成功通知是否显示
    const notifications = wrapper.find('Notification');
    expect(notifications.exists()).toBe(true);
    expect(notifications.text()).toContain('恭喜！您解锁了新成就');
    
    // 验证NFT是否已添加到用户NFT列表
    const state = store.getState();
    const newNFT = state.nft.userNFTs.find(nft => nft.achievementId === achievementId);
    expect(newNFT).toBeDefined();
  });
  
  // 其他测试用例
});

describe('治理系统集成测试', () => {
  // 类似的测试设置和用例
});
```

### 6.2 性能测试

#### 6.2.1 加载性能测试

```javascript
// 加载性能测试示例
describe('NFT成就系统加载性能', () => {
  let testEnv;
  let store;
  
  beforeAll(async () => {
    // 设置测试环境
    testEnv = await setupTestEnvironment();
    
    // 创建大量测试NFT数据
    await createLargeTestDataset(testEnv, 1000); // 创建1000个NFT
    
    // 创建Redux store
    store = configureStore({
      reducer: rootReducer,
      middleware: [...默认中间件, web3Middleware(testEnv.web3)]
    });
  });
  
  afterAll(async () => {
    await cleanupTestEnvironment(testEnv.server);
  });
  
  test('应该在可接受的时间内加载大量NFT', async () => {
    const startTime = performance.now();
    
    // 触发加载NFT数据的action
    await store.dispatch(actions.loadUserNFTs(testEnv.accounts[0]));
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // 验证加载时间在可接受范围内（例如小于3秒）
    expect(loadTime).toBeLessThan(3000);
    
    // 验证所有NFT都已加载
    const state = store.getState();
    expect(state.nft.userNFTs.length).toBe(1000);
  });
  
  test('应该使用虚拟列表高效渲染大量NFT', async () => {
    // 渲染组件
    const wrapper = mount(
      <Provider store={store}>
        <Web3Provider web3={testEnv.web3} contracts={testEnv.contracts}>
          <NFTAchievementGallery />
        </Web3Provider>
      </Provider>
    );
    
    // 验证是否使用了虚拟列表
    expect(wrapper.find('FixedSizeGrid').exists()).toBe(true);
    
    // 验证初始渲染的NFT卡片数量是否合理（而不是全部1000个）
    const initialCards = wrapper.find('NFTCard');
    expect(initialCards.length).toBeLessThan(100); // 假设视口只能显示少于100个卡片
  });
  
  // 其他性能测试用例
});
```

#### 6.2.2 交互性能测试

- 测量用户操作响应时间
- 验证动画流畅度
- 测试在高负载下的UI响应性
- 验证长列表滚动性能

### 6.3 兼容性测试

- 测试不同浏览器兼容性
- 验证移动设备适配效果
- 测试不同网络条件下的性能
- 验证不同钱包提供商的兼容性

## 7. 部署与监控

### 7.1 部署检查清单

- [ ] 前端代码与最新合约ABI同步
- [ ] 环境变量配置正确
- [ ] 静态资源优化（压缩、CDN）
- [ ] 缓存策略配置
- [ ] 错误监控集成
- [ ] 性能监控集成
- [ ] 安全检查完成
- [ ] 跨浏览器兼容性验证
- [ ] 移动设备适配验证
- [ ] 可访问性合规检查

### 7.2 监控策略

- 实现用户操作跟踪，收集交互数据
- 监控合约调用成功率和响应时间
- 跟踪前端性能指标（FCP, LCP, CLS等）
- 设置关键指标告警阈值
- 实现用户反馈收集机制

## 8. 结论

本文档详细规定了CultureBridge平台NFT成就系统与DAO治理系统前端组件与智能合约的集成规范，为开发团队提供了全面的技术指导。通过遵循这些规范，可以确保前端界面与区块链后端的无缝对接，提供流畅、高效、可靠的用户体验。

随着项目的发展，本规范将持续更新，以适应新的需求和技术变化。开发团队应定期参考最新版本的集成规范，确保实现的组件与设计意图保持一致。
