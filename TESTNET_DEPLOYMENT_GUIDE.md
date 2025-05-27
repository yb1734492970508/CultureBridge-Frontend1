# CultureBridge BNB链测试网部署指南

## 概述

本指南提供了CultureBridge项目在BNB链测试网上的详细部署步骤，包括环境准备、合约部署、验证和测试流程。通过本指南，开发团队可以在真实区块链环境中验证所有功能，为后续主网部署做好准备。

## 前置准备

### 1. 测试网账户设置

1. 准备MetaMask钱包并配置BNB链测试网
   - 网络名称: BNB Chain Testnet
   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
   - 链ID: 97
   - 符号: tBNB
   - 区块浏览器: https://testnet.bscscan.com

2. 从测试网水龙头获取测试BNB
   - 访问 https://testnet.bnbchain.org/faucet-smart
   - 输入钱包地址获取测试BNB

3. 准备多个测试账户（至少4个）
   - 管理员账户
   - 服务提供商账户
   - 普通用户账户
   - 审核员账户

### 2. 开发环境配置

1. 安装必要依赖
```bash
# 安装Hardhat和相关插件
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-etherscan dotenv
```

2. 配置环境变量
```bash
# 复制环境变量模板
cp src/config/.env.example .env

# 编辑.env文件，填入私钥和API密钥
nano .env
```

3. 确认Hardhat配置
```bash
# 检查Hardhat配置是否正确
cat src/config/hardhat.config.js
```

## 部署流程

### 1. 部署智能合约

使用自动化部署脚本部署所有合约：

```bash
# 确保在项目根目录
cd /path/to/CultureBridge

# 复制Hardhat配置到根目录
cp src/config/hardhat.config.js hardhat.config.js

# 运行部署脚本
npx hardhat run src/scripts/deploy_contracts.js --network bscTestnet
```

部署脚本会自动执行以下操作：
- 部署CultureToken合约
- 部署AIRegistry合约
- 部署CulturalNFT合约
- 部署TranslationMarket合约
- 更新前端配置文件
- 在BscScan上验证合约
- 生成部署日志

### 2. 验证合约部署

1. 检查部署日志
```bash
cat TESTNET_DEPLOYMENT_LOG.md
```

2. 在BscScan上验证合约
   - 访问 https://testnet.bscscan.com
   - 搜索部署的合约地址
   - 确认合约已验证且可读

3. 确认前端配置已更新
```bash
cat src/config/contracts.js
```

### 3. 运行功能测试

使用自动化测试脚本验证合约功能：

```bash
# 运行测试脚本
npx hardhat run src/scripts/test_contracts.js --network bscTestnet
```

测试脚本会验证以下功能：
- CultureToken基本功能
- AIRegistry服务注册与管理
- CulturalNFT铸造与转移
- TranslationMarket翻译请求流程

### 4. 前端集成测试

1. 更新前端配置
```bash
# 确认前端配置指向测试网合约
cat src/config/contracts.js
```

2. 启动前端应用
```bash
npm start
```

3. 测试前端功能
   - 钱包连接
   - 服务注册与查询
   - 翻译请求创建与处理
   - 实时通知与状态更新

## 测试场景

### 1. 基础功能测试

- **钱包连接**
  - 连接MetaMask到应用
  - 切换账户
  - 网络检测与切换

- **代币功能**
  - 查看余额
  - 转账
  - 授权与代理转账

### 2. AIRegistry功能测试

- **服务注册**
  - 使用服务提供商账户注册新服务
  - 填写完整服务信息
  - 支付注册费用

- **服务管理**
  - 更新服务信息
  - 修改服务价格
  - 停用/激活服务

- **服务查询与筛选**
  - 按语言筛选
  - 按能力筛选
  - 按价格范围筛选
  - 分页加载与无限滚动

- **服务评分**
  - 用户对服务评分
  - 查看服务平均评分
  - 评分历史记录

### 3. 高级功能测试

- **角色权限**
  - 管理员功能测试
  - 审核员功能测试
  - 普通用户权限限制

- **批量操作**
  - 批量选择服务
  - 批量状态更新
  - 批量评分

- **事件监听**
  - 服务注册事件
  - 状态更新事件
  - 评分更新事件
  - 实时通知显示

## 问题排查

### 常见问题与解决方案

1. **合约部署失败**
   - 检查账户余额是否足够
   - 确认网络连接稳定
   - 验证合约代码无编译错误

2. **合约验证失败**
   - 确认BscScan API密钥正确
   - 检查构造函数参数是否匹配
   - 尝试手动验证合约

3. **前端连接问题**
   - 确认合约地址配置正确
   - 检查网络配置是否匹配
   - 验证ABI文件是否最新

4. **交易失败**
   - 检查Gas设置
   - 确认账户权限
   - 验证函数调用参数

## 部署后操作

### 1. 记录部署信息

确保以下信息已记录在部署日志中：
- 所有合约地址
- 部署账户地址
- 部署日期和时间
- 初始配置参数
- 验证状态

### 2. 安全检查

- 确认合约所有权设置正确
- 验证紧急暂停功能可用
- 测试权限控制机制
- 确认敏感操作有适当的访问控制

### 3. 性能监控

- 监控交易确认时间
- 测试高并发场景
- 验证大数据量下的性能
- 记录Gas消耗情况

## 主网部署准备

基于测试网部署经验，准备主网部署计划：

1. 完成全面安全审计
2. 准备多重签名钱包
3. 制定详细部署步骤
4. 准备应急响应方案
5. 规划代币经济模型参数

## 结论

通过本指南完成的测试网部署和验证，将确保CultureBridge项目在BNB链上的稳定运行，为后续主网部署和用户采用奠定坚实基础。所有测试结果和发现的问题都应详细记录，并用于改进合约和前端实现。
