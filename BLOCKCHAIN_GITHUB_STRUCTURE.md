# CultureBridge区块链协作GitHub结构

## 概述

本文档定义了CultureBridge项目转向区块链技术后的GitHub协作结构，包括分支策略、代码审核流程、提交规范和文档标准，确保8个账号能够高效协作开发基于区块链的去中心化跨文化交流平台。

## 仓库结构

### 主仓库
- **CultureBridge-Blockchain**: 主仓库，包含所有区块链相关代码

### 子仓库
- **CultureBridge-SmartContracts**: 智能合约代码
- **CultureBridge-Frontend-Web3**: Web3前端代码
- **CultureBridge-Mobile-DApp**: 移动端DApp代码
- **CultureBridge-Docs**: 技术文档和规范

## 分支策略

### 长期分支
- **blockchain-main**: 主分支，包含稳定代码
- **blockchain-dev**: 开发分支，集成已验证的功能
- **blockchain-testnet**: 测试网部署分支

### 功能分支命名规范
- **blockchain-[账号ID]-[功能]**: 例如 `blockchain-CB-MOBILE-wallet-integration`
- **contract-[合约名称]**: 智能合约开发分支，例如 `contract-translation-market`
- **feature-[功能名称]**: 通用功能开发分支

### 版本分支
- **release-v[主版本].[次版本]**: 发布准备分支
- **hotfix-v[主版本].[次版本].[修复版本]**: 紧急修复分支

## 提交规范

### 提交信息格式
```
[账号ID] <类型>: <简短描述>

<详细描述>

<相关问题>
```

### 类型定义
- **feat**: 新功能
- **fix**: 错误修复
- **contract**: 智能合约变更
- **docs**: 文档变更
- **style**: 代码格式变更
- **refactor**: 代码重构
- **test**: 测试相关
- **chore**: 构建过程或辅助工具变更

### 示例
```
[CB-BACKEND] contract: 实现TranslationMarket智能合约基础功能

- 添加翻译请求创建功能
- 实现翻译提供机制
- 添加质量验证逻辑

Closes #123
```

## 代码审核流程

### 智能合约审核
1. 至少2个CB-BACKEND账号必须审核通过
2. 必须通过自动化测试（覆盖率>90%）
3. 必须通过静态分析工具检查
4. 重大合约变更需要CB-AI-TEST账号进行安全审计

### 前端代码审核
1. 至少1个CB-FRONTEND账号必须审核通过
2. 必须通过UI/UX审核（CB-DESIGN账号）
3. 必须通过Web3交互测试

### 移动端代码审核
1. CB-MOBILE账号必须审核通过
2. 必须通过多设备兼容性测试
3. 必须通过钱包集成测试

## 问题跟踪

### 标签系统
- **blockchain-core**: 核心区块链功能
- **smart-contract**: 智能合约相关
- **web3-frontend**: Web3前端相关
- **mobile-dapp**: 移动端DApp相关
- **security**: 安全相关问题
- **performance**: 性能相关问题
- **ux**: 用户体验相关

### 优先级
- **P0**: 阻塞发布的关键问题
- **P1**: 高优先级，应在当前迭代解决
- **P2**: 中优先级，计划在未来迭代解决
- **P3**: 低优先级，有时间再解决

## 持续集成/持续部署

### 自动化测试
- 智能合约测试：Hardhat + Waffle
- 前端测试：Jest + React Testing Library
- 移动端测试：Detox

### 部署流程
- 测试网自动部署：合并到`blockchain-testnet`分支触发
- 主网部署：手动触发，需多重签名确认

## 文档规范

### 智能合约文档
- 必须使用NatSpec格式
- 必须包含函数参数和返回值说明
- 必须说明状态变量用途
- 必须包含安全考虑

### API文档
- 使用OpenAPI规范
- 包含请求/响应示例
- 说明错误处理

### 架构文档
- 使用架构决策记录(ADR)格式
- 包含上下文、决策和后果
- 记录所有重要技术决策

## 开发环境

### 本地开发
- Hardhat本地区块链
- MetaMask开发环境
- IPFS本地节点

### 测试网
- 以太坊Goerli测试网
- Polygon Mumbai测试网
- 测试网水龙头资源

## 安全实践

### 代码安全
- 使用OpenZeppelin合约库
- 遵循已知安全模式
- 避免常见漏洞（重入、溢出等）

### 审计流程
- 内部安全审计（CB-AI-TEST负责）
- 关键合约外部审计
- 漏洞赏金计划

## 发布流程

### 测试网发布
1. 功能分支合并到`blockchain-dev`
2. 完成集成测试
3. 合并到`blockchain-testnet`
4. 自动部署到测试网

### 主网发布
1. 从`blockchain-testnet`创建`release`分支
2. 完成最终测试和审计
3. 创建发布标签
4. 多重签名部署到主网

## 紧急响应

### 安全漏洞
1. 立即创建`hotfix`分支
2. 实施修复并测试
3. 紧急部署到受影响环境
4. 发布安全公告

### 回滚流程
1. 识别需要回滚的提交
2. 创建回滚分支
3. 测试回滚影响
4. 部署回滚版本

## 协作工具

### 代码协作
- GitHub: 代码托管和协作
- Hardhat: 智能合约开发环境
- Remix: 智能合约在线IDE

### 沟通协作
- GitHub Discussions: 技术讨论
- Discord: 实时沟通
- Notion: 知识库和文档

## 下一步行动

1. 创建区块链主仓库和子仓库
2. 设置分支保护规则
3. 配置CI/CD流程
4. 创建初始项目结构和文档
