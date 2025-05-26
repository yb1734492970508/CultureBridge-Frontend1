# NFT市场交易功能设计方案

## 1. 功能架构概述

NFT市场交易功能将作为CultureBridge平台的核心区块链应用，为用户提供完整的文化NFT交易体验。整体架构分为智能合约层、服务层和用户界面层三个主要部分。

### 1.1 系统架构图

```
+---------------------------+
|      用户界面层           |
|  +---------------------+  |
|  |   市场浏览组件      |  |
|  +---------------------+  |
|  |   NFT详情组件       |  |
|  +---------------------+  |
|  |   上架/购买组件     |  |
|  +---------------------+  |
|  |   竞价/拍卖组件     |  |
|  +---------------------+  |
|  |   收藏/筛选组件     |  |
+---------------------------+
            ↑↓
+---------------------------+
|        服务层             |
|  +---------------------+  |
|  |   市场合约服务      |  |
|  +---------------------+  |
|  |   NFT元数据服务     |  |
|  +---------------------+  |
|  |   用户钱包服务      |  |
|  +---------------------+  |
|  |   交易历史服务      |  |
+---------------------------+
            ↑↓
+---------------------------+
|      智能合约层           |
|  +---------------------+  |
|  |   NFT市场合约       |  |
|  +---------------------+  |
|  |   NFT基础合约       |  |
|  +---------------------+  |
|  |   版税分配合约      |  |
+---------------------------+
```

### 1.2 核心业务流程

1. **NFT上架流程**：创作者将NFT上架到市场，设置价格或拍卖参数
2. **NFT购买流程**：买家浏览市场，购买固定价格NFT
3. **NFT竞价流程**：买家对拍卖类NFT进行出价，到期结算
4. **收藏管理流程**：用户收藏感兴趣的NFT，管理收藏夹
5. **搜索筛选流程**：用户按多种条件搜索和筛选NFT

## 2. 组件设计

### 2.1 前端组件结构

#### NFTMarketplace.js (主容器组件)
- 市场主页面，整合所有子组件
- 管理全局市场状态
- 处理路由和页面切换

#### NFTMarketplaceList.js
- 展示所有上架NFT的列表视图
- 支持分页、排序和筛选
- 每个NFT项显示缩略图、名称、价格和类型

#### NFTMarketplaceFilters.js
- 提供多维度筛选控件
- 支持按文化类别、价格范围、创作者等筛选
- 包含搜索框和高级筛选选项

#### NFTMarketplaceDetail.js
- 展示单个NFT的详细信息
- 显示NFT图像、描述、属性、创作者信息
- 包含购买/出价按钮和交易历史

#### NFTListingForm.js
- NFT上架表单
- 支持设置固定价格或拍卖参数
- 包含版税设置和上架时间选择

#### NFTPurchaseModal.js
- NFT购买确认模态框
- 显示交易详情和费用明细
- 提供确认和取消选项

#### NFTBidForm.js
- 拍卖NFT的出价表单
- 显示当前最高价和出价历史
- 包含出价金额输入和确认

#### NFTFavorites.js
- 用户收藏的NFT列表
- 支持添加/移除收藏
- 显示收藏夹管理选项

### 2.2 样式设计

#### NFTMarketplace.css
- 市场整体布局和响应式设计
- 颜色主题和排版规范
- 网格和列表视图切换样式

#### NFTCard.css
- NFT卡片组件样式
- 悬停效果和交互动画
- 价格标签和状态指示器样式

#### MarketplaceFilters.css
- 筛选控件样式
- 下拉菜单和滑块组件
- 移动端适配的筛选面板

#### BidAuction.css
- 拍卖界面专用样式
- 倒计时组件和出价历史
- 竞价按钮和状态指示器

## 3. 智能合约接口设计

### 3.1 NFT市场合约接口

```solidity
interface INFTMarketplace {
    // 上架NFT
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        bool isAuction,
        uint256 auctionEndTime
    ) external;
    
    // 购买固定价格NFT
    function buyItem(
        address nftContract,
        uint256 tokenId
    ) external payable;
    
    // 对拍卖NFT出价
    function placeBid(
        address nftContract,
        uint256 tokenId
    ) external payable;
    
    // 结束拍卖并结算
    function endAuction(
        address nftContract,
        uint256 tokenId
    ) external;
    
    // 取消上架
    function cancelListing(
        address nftContract,
        uint256 tokenId
    ) external;
    
    // 查询NFT上架信息
    function getListingInfo(
        address nftContract,
        uint256 tokenId
    ) external view returns (
        address seller,
        uint256 price,
        bool isAuction,
        uint256 auctionEndTime,
        address highestBidder,
        uint256 highestBid
    );
    
    // 查询用户上架的所有NFT
    function getUserListings(
        address user
    ) external view returns (
        address[] memory nftContracts,
        uint256[] memory tokenIds
    );
}
```

### 3.2 前端与合约交互服务

```javascript
// 市场合约服务
class MarketplaceService {
    // 上架NFT
    async listNFT(nftContract, tokenId, price, isAuction, auctionEndTime) {
        // 实现与合约交互逻辑
    }
    
    // 购买NFT
    async purchaseNFT(nftContract, tokenId, price) {
        // 实现与合约交互逻辑
    }
    
    // 出价
    async placeBid(nftContract, tokenId, bidAmount) {
        // 实现与合约交互逻辑
    }
    
    // 获取市场上所有NFT
    async getAllListedNFTs(filters) {
        // 实现与合约交互逻辑
    }
    
    // 获取用户收藏的NFT
    async getUserFavorites(userAddress) {
        // 实现与本地存储或链上数据交互
    }
    
    // 添加/移除收藏
    async toggleFavorite(nftContract, tokenId) {
        // 实现收藏功能
    }
}
```

## 4. 数据模型

### 4.1 NFT上架信息

```typescript
interface NFTListing {
    nftContract: string;       // NFT合约地址
    tokenId: number;           // NFT的唯一ID
    seller: string;            // 卖家地址
    price: BigNumber;          // 价格（固定价格或起拍价）
    isAuction: boolean;        // 是否为拍卖
    auctionEndTime: number;    // 拍卖结束时间戳
    highestBidder: string;     // 当前最高出价者
    highestBid: BigNumber;     // 当前最高出价
    currency: string;          // 支付货币（ETH或ERC20代币）
    status: 'active' | 'sold' | 'cancelled'; // 上架状态
}
```

### 4.2 NFT元数据

```typescript
interface NFTMetadata {
    name: string;              // NFT名称
    description: string;       // NFT描述
    image: string;             // NFT图像URI
    attributes: {              // NFT属性
        trait_type: string;    // 属性类型
        value: string;         // 属性值
    }[];
    culturalCategory: string;  // 文化类别
    creator: string;           // 创作者信息
    creationDate: string;      // 创作日期
    royaltyPercentage: number; // 版税百分比
}
```

### 4.3 交易历史记录

```typescript
interface TransactionRecord {
    transactionType: 'listing' | 'sale' | 'bid' | 'cancel'; // 交易类型
    nftContract: string;       // NFT合约地址
    tokenId: number;           // NFT的唯一ID
    fromAddress: string;       // 交易发起方
    toAddress: string;         // 交易接收方
    price: BigNumber;          // 交易金额
    timestamp: number;         // 交易时间戳
    transactionHash: string;   // 交易哈希
}
```

## 5. 用户交互流程

### 5.1 NFT上架流程

1. 用户连接钱包并导航至"我的NFT"页面
2. 选择要上架的NFT，点击"上架到市场"按钮
3. 在上架表单中选择定价方式（固定价格/拍卖）
4. 设置价格或拍卖参数（起拍价、拍卖时长）
5. 确认上架，签名交易
6. 显示上架成功确认和市场链接

### 5.2 NFT购买流程

1. 用户浏览NFT市场，可应用筛选条件
2. 点击感兴趣的NFT查看详情
3. 对于固定价格NFT，点击"购买"按钮
4. 在购买确认模态框中查看交易详情
5. 确认购买，签名交易
6. 显示购买成功确认和NFT详情

### 5.3 NFT竞价流程

1. 用户浏览拍卖类NFT
2. 点击NFT查看详情和当前竞价情况
3. 输入出价金额（需高于当前最高价）
4. 确认出价，签名交易
5. 显示出价成功确认
6. 拍卖结束时，最高出价者自动获得NFT

### 5.4 收藏管理流程

1. 用户浏览市场时，可点击"收藏"图标
2. 系统记录用户收藏的NFT
3. 用户可在"我的收藏"页面查看所有收藏的NFT
4. 可从收藏夹中移除不再感兴趣的NFT

## 6. 与现有系统集成

### 6.1 与NFT模块集成

- 利用现有NFT铸造和展示功能
- 扩展NFT详情页面，添加市场相关功能
- 共享NFT元数据和图像处理逻辑

### 6.2 与钱包模块集成

- 使用现有钱包连接功能进行身份验证
- 在交易前检查钱包余额
- 利用钱包签名功能确认交易

### 6.3 与区块链上下文集成

- 使用现有BlockchainContext管理市场状态
- 添加市场专用hooks和上下文提供者
- 共享交易历史和事件监听机制

## 7. 响应式设计与移动适配

### 7.1 桌面端布局

- 网格视图：每行3-4个NFT卡片
- 侧边栏筛选面板
- 详情页面双栏布局（图像+信息）

### 7.2 移动端适配

- 单列NFT卡片布局
- 可折叠筛选面板
- 详情页面单栏布局（垂直排列）
- 触摸友好的按钮和交互元素

## 8. 性能优化考虑

### 8.1 数据加载优化

- 实现分页加载和无限滚动
- 缓存已加载的NFT数据
- 优先加载可见区域内的NFT图像

### 8.2 交易体验优化

- 提供交易状态实时反馈
- 实现交易确认通知
- 优化Gas费用估算和显示

## 9. 安全考虑

### 9.1 合约安全

- 实现重入攻击防护
- 添加交易超时机制
- 实现紧急暂停功能

### 9.2 前端安全

- 验证所有用户输入
- 防止价格操纵攻击
- 确保钱包连接安全

## 10. 测试策略

### 10.1 合约测试

- 单元测试：验证每个合约函数
- 集成测试：验证合约间交互
- 安全测试：模拟攻击场景

### 10.2 前端测试

- 组件测试：验证UI渲染和交互
- 集成测试：验证与区块链交互
- 用户流程测试：验证完整业务流程

## 11. 实施计划

### 11.1 开发阶段

1. 基础市场组件开发（列表、详情、筛选）
2. NFT上架和购买功能实现
3. 拍卖和竞价系统开发
4. 收藏和搜索功能实现
5. 与现有系统集成

### 11.2 测试阶段

1. 组件单元测试
2. 合约功能测试
3. 用户流程测试
4. 性能和安全测试

### 11.3 部署阶段

1. 合约部署到测试网
2. 前端集成与验证
3. 文档编写
4. 用户反馈收集与优化
