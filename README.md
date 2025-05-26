# CultureBridge 区块链后端

CultureBridge 区块链后端是一个基于 BNB Chain (Binance Smart Chain) 的区块链应用，为文化交流平台提供去中心化的基础设施。

## 功能概述

- **用户认证系统**：基于区块链的身份验证和管理
- **NFT管理系统**：文化资产的数字化和交易
- **智能合约文化交流**：活动组织、参与和奖励分配
- **跨文化交易/积分系统**：文化交流激励和价值转移

## 技术栈

- Solidity: 智能合约开发语言
- Hardhat: 以太坊开发环境
- OpenZeppelin: 安全智能合约库
- Ethers.js: 与区块链交互的JavaScript库
- BNB Chain: 底层区块链平台

## 项目结构

```
CultureBridge-Backend/
├── contracts/              # 智能合约源代码
│   ├── IdentityContract.sol       # 用户身份管理合约
│   ├── CultureNFTContract.sol     # 文化NFT管理合约
│   ├── CultureEventContract.sol   # 文化活动管理合约
│   ├── CultureTokenContract.sol   # 文化代币合约
│   └── PointSystemContract.sol    # 积分系统合约
├── test/                  # 测试文件
├── scripts/               # 部署和交互脚本
├── hardhat.config.js      # Hardhat配置文件
└── README.md              # 项目说明文档
```

## 合约说明

### IdentityContract

用户身份管理合约，负责用户注册、身份验证和信任关系建立。

主要功能：
- 用户身份注册与更新
- 身份验证与认证
- 信任关系管理
- 文化背景与偏好记录

### CultureNFTContract

文化资产NFT管理合约，支持文化作品的铸造、交易和展示。

主要功能：
- NFT铸造与管理
- 文化资产上架与交易
- 创作者版税分配
- 文化分类与检索

### CultureEventContract

文化活动管理合约，支持活动创建、参与和奖励分配。

主要功能：
- 活动创建与管理
- 用户参与与贡献
- 贡献投票与评价
- 奖励池与分配机制

### CultureTokenContract

文化代币合约，提供平台通证经济基础。

主要功能：
- 代币铸造与分发
- 代币锁定与释放
- 流动性管理
- 通证经济激励

### PointSystemContract

积分系统合约，管理用户积分和等级。

主要功能：
- 积分获取与消费
- 用户等级管理
- 积分历史记录
- 等级特权与激励

## 开发与部署

### 本地开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/yourusername/CultureBridge-Backend.git
cd CultureBridge-Backend
```

2. 安装依赖
```bash
npm install
```

3. 编译合约
```bash
npx hardhat compile
```

4. 运行测试
```bash
npx hardhat test
```

### 部署到测试网

1. 配置环境变量
创建`.env`文件并添加以下内容：
```
PRIVATE_KEY=your_private_key
BSC_TESTNET_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

2. 部署合约
```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

## 前端集成

前端应用可以通过Web3.js或Ethers.js与智能合约交互。主要集成点包括：

1. 钱包连接（如MetaMask）
2. 合约ABI导入
3. 合约方法调用
4. 事件监听与处理

## 安全考虑

- 所有合约均基于OpenZeppelin标准实现，确保基础安全
- 实现了角色访问控制，限制关键功能的调用权限
- 使用ReentrancyGuard防止重入攻击
- 所有外部调用均进行了严格的参数验证

## 未来计划

- 实现跨链功能，支持多链资产互操作
- 优化Gas费用，提高合约执行效率
- 增强隐私保护功能
- 集成去中心化存储解决方案

## 许可证

MIT
