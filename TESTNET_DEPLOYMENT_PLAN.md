# CultureBridge BNB链测试网部署计划

## 概述

本文档详细说明CultureBridge项目在BNB链测试网上的部署计划，包括合约部署顺序、配置参数、验证步骤和测试方案。通过测试网部署，我们将验证所有区块链功能在真实环境中的表现，为后续主网部署做好充分准备。

## 部署环境

- **网络**: BNB Smart Chain Testnet
- **ChainID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **区块浏览器**: https://testnet.bscscan.com
- **测试币获取**: [BNB Chain Faucet](https://testnet.bnbchain.org/faucet-smart)

## 部署前准备

### 1. 开发环境配置

```bash
# 安装Hardhat
npm install --save-dev hardhat

# 创建Hardhat配置
npx hardhat init

# 安装必要依赖
npm install --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-etherscan dotenv
```

### 2. Hardhat配置文件

创建`hardhat.config.js`文件，配置BNB测试网：

```javascript
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY
  }
};
```

### 3. 环境变量配置

创建`.env`文件，配置私钥和API密钥：

```
PRIVATE_KEY=your_wallet_private_key
BSCSCAN_API_KEY=your_bscscan_api_key
```

### 4. 测试账户准备

为不同角色准备测试账户：

- 管理员账户
- 服务提供商账户
- 普通用户账户
- 审核员账户

每个账户需从测试网水龙头获取测试BNB。

## 合约部署顺序

### 1. CultureToken (CULT)

首先部署代币合约，作为生态系统的基础：

```javascript
// 部署脚本: scripts/deploy_token.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const CultureToken = await ethers.getContractFactory("CultureToken");
  const token = await CultureToken.deploy("CultureToken", "CULT", ethers.utils.parseEther("1000000"));
  
  await token.deployed();
  console.log("CultureToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 2. AIRegistry

部署AI服务注册中心合约：

```javascript
// 部署脚本: scripts/deploy_registry.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // 获取已部署的CultureToken地址
  const tokenAddress = "已部署的CultureToken地址";
  
  const AIRegistry = await ethers.getContractFactory("AIRegistry");
  const registry = await AIRegistry.deploy(tokenAddress);
  
  await registry.deployed();
  console.log("AIRegistry deployed to:", registry.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 3. CulturalNFT

部署文化NFT合约：

```javascript
// 部署脚本: scripts/deploy_nft.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const CulturalNFT = await ethers.getContractFactory("CulturalNFT");
  const nft = await CulturalNFT.deploy("CulturalNFT", "CNFT");
  
  await nft.deployed();
  console.log("CulturalNFT deployed to:", nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 4. TranslationMarket

最后部署翻译市场合约：

```javascript
// 部署脚本: scripts/deploy_market.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // 获取已部署的合约地址
  const tokenAddress = "已部署的CultureToken地址";
  const nftAddress = "已部署的CulturalNFT地址";
  const registryAddress = "已部署的AIRegistry地址";
  
  const TranslationMarket = await ethers.getContractFactory("TranslationMarket");
  const market = await TranslationMarket.deploy(tokenAddress, nftAddress, registryAddress);
  
  await market.deployed();
  console.log("TranslationMarket deployed to:", market.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## 合约验证

部署后，使用Hardhat验证合约源代码：

```bash
# 验证CultureToken
npx hardhat verify --network bscTestnet 已部署的CultureToken地址 "CultureToken" "CULT" "1000000000000000000000000"

# 验证AIRegistry
npx hardhat verify --network bscTestnet 已部署的AIRegistry地址 已部署的CultureToken地址

# 验证CulturalNFT
npx hardhat verify --network bscTestnet 已部署的CulturalNFT地址 "CulturalNFT" "CNFT"

# 验证TranslationMarket
npx hardhat verify --network bscTestnet 已部署的TranslationMarket地址 已部署的CultureToken地址 已部署的CulturalNFT地址 已部署的AIRegistry地址
```

## 前端配置更新

部署完成后，更新前端配置文件，连接测试网合约：

```javascript
// src/config/contracts.js
export const NETWORK_ID = 97; // BNB测试网

export const CONTRACT_ADDRESSES = {
  CultureToken: "已部署的CultureToken地址",
  AIRegistry: "已部署的AIRegistry地址",
  CulturalNFT: "已部署的CulturalNFT地址",
  TranslationMarket: "已部署的TranslationMarket地址"
};
```

## 功能验证计划

### 1. 基础连接测试

- 钱包连接与网络检测
- 账户余额显示
- 合约读取功能

### 2. AIRegistry功能测试

- 服务注册
- 服务查询与筛选
- 服务状态管理
- 性能评分更新
- 多语言支持
- 事件监听与通知

### 3. 角色权限测试

- 管理员功能
- 审核员功能
- 服务提供商功能
- 普通用户功能

### 4. 批量操作测试

- 批量服务选择
- 批量状态更新
- 批量评分

### 5. 高级功能测试

- 黑白名单管理
- 审核流程
- 紧急暂停

## 性能测试计划

### 1. 数据加载性能

- 大量服务数据分页加载
- 无限滚动性能
- 筛选性能

### 2. 交易响应性能

- 交易确认时间
- 事件监听响应时间
- 状态更新延迟

### 3. 多用户并发测试

- 多账户同时操作
- 事件广播与同步

## 测试网部署日志模板

```
# CultureBridge测试网部署日志

## 部署信息
- 部署日期: YYYY-MM-DD
- 部署网络: BNB Chain Testnet
- 部署账户: 0x...

## 合约地址
- CultureToken: 0x...
- AIRegistry: 0x...
- CulturalNFT: 0x...
- TranslationMarket: 0x...

## 初始配置
- 管理员账户: 0x...
- 审核员账户: 0x...
- 初始服务费率: ...%

## 验证状态
- CultureToken: [已验证/未验证]
- AIRegistry: [已验证/未验证]
- CulturalNFT: [已验证/未验证]
- TranslationMarket: [已验证/未验证]

## 功能测试结果
- 基础连接: [通过/失败]
- 服务注册: [通过/失败]
- 服务查询: [通过/失败]
- ...

## 问题记录
1. [问题描述]
   - 原因: ...
   - 解决方案: ...

2. [问题描述]
   - 原因: ...
   - 解决方案: ...

## 后续优化建议
1. ...
2. ...
```

## 安全注意事项

1. 测试网部署使用的私钥不应与主网钱包相同
2. `.env`文件不应提交到代码仓库
3. 测试网合约应包含紧急暂停功能，以应对潜在漏洞
4. 定期备份测试数据和部署记录

## 主网部署准备

测试网验证完成后，准备主网部署：

1. 完整审计所有智能合约
2. 准备多重签名钱包管理主网合约
3. 制定详细的主网部署计划
4. 准备应急响应方案

## 结论

本测试网部署计划提供了CultureBridge项目在BNB链测试网上部署和验证的完整指南。通过严格遵循此计划，我们将确保所有区块链功能在真实环境中得到充分验证，为后续主网部署和大规模用户采用做好准备。
