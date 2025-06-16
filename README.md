# CultureBridge - 文化桥梁 🌍

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)
[![BNB Chain](https://img.shields.io/badge/blockchain-BNB%20Chain-yellow)](https://www.bnbchain.org/)

> 基于区块链的跨文化交流平台，通过智能语音翻译和CBT代币奖励机制，促进全球文化交流与语言学习。

## ✨ 核心特性

### 🌐 多语言支持
- **16种语言**：中文、英语、西班牙语、法语、德语、日语、韩语、葡萄牙语、俄语、阿拉伯语等
- **实时翻译**：智能语音识别与翻译
- **文化背景**：提供文化背景注释和解释

### 💰 CBT代币经济
- **奖励机制**：参与文化交流获得CBT代币
- **等级系统**：Bronze、Silver、Gold、Platinum、Diamond
- **多种奖励**：聊天、翻译、分享、学习等活动奖励
- **区块链集成**：基于BNB链的智能合约

### 🎤 智能语音翻译
- **实时语音识别**：支持16种主要语言
- **高质量翻译**：AI驱动的翻译引擎
- **语音合成**：自然流畅的语音输出
- **离线支持**：部分功能支持离线使用

### 💬 实时聊天系统
- **多房间聊天**：综合讨论、语言交换、文化分享等
- **自动翻译**：消息自动翻译功能
- **语音消息**：支持语音消息发送
- **文化注释**：智能文化背景解释

### 🔗 区块链集成
- **BNB链支持**：基于币安智能链
- **智能合约**：CBT代币管理和奖励分发
- **钱包连接**：支持MetaMask等主流钱包
- **去中心化**：用户数据和资产安全

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 4.4
- MetaMask钱包（可选）

### 前端安装

```bash
# 克隆前端仓库
git clone https://github.com/yb1734492970508/CultureBridge-Frontend1.git
cd CultureBridge-Frontend1

# 安装依赖
npm install

# 启动开发服务器
npm start
```

访问 http://localhost:3000

### 后端安装

```bash
# 克隆后端仓库
git clone https://github.com/yb1734492970508/CultureBridge-Backend.git
cd CultureBridge-Backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和其他服务

# 启动服务器
npm start
```

API服务运行在 http://localhost:5000

## 📁 项目结构

### 前端结构
```
CultureBridge-Frontend1/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── WalletConnect.jsx    # 钱包连接
│   │   ├── ChatRoom.jsx         # 聊天室
│   │   └── VoiceTranslation.jsx # 语音翻译
│   ├── services/          # 服务层
│   │   └── web3Service.js      # Web3集成
│   ├── contracts/         # 智能合约ABI
│   └── App.jsx           # 主应用组件
└── package.json
```

### 后端结构
```
CultureBridge-Backend/
├── src/
│   ├── controllers/       # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # API路由
│   ├── services/         # 业务服务
│   │   ├── cbtRewardService.js    # CBT奖励服务
│   │   ├── blockchainService.js   # 区块链服务
│   │   └── voiceTranslationService.js # 语音翻译服务
│   ├── middleware/       # 中间件
│   └── app.js           # 主应用文件
└── package.json
```

## 🔧 配置说明

### 环境变量配置

```env
# 数据库配置
MONGO_URI=mongodb://localhost:27017/culturebridge

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# 区块链配置
BLOCKCHAIN_ENABLED=true
BSC_RPC_URL=https://bsc-dataseed1.binance.org:443
PRIVATE_KEY=your_private_key
CBT_TOKEN_ADDRESS=your_contract_address

# Google Cloud配置（语音翻译）
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account-key.json
```

## 🎯 功能详解

### CBT代币奖励系统

| 活动类型 | 奖励金额 | 每日限制 | 描述 |
|---------|---------|---------|------|
| 每日登录 | 1.0 CBT | 1次 | 每天首次登录 |
| 发送消息 | 0.1 CBT | 50次 | 聊天室发送消息 |
| 语音翻译 | 0.5 CBT | 30次 | 使用语音翻译功能 |
| 文化分享 | 3.0 CBT | 无限制 | 分享文化内容 |
| 语言里程碑 | 20.0 CBT | 无限制 | 达成学习目标 |

### 用户等级系统

| 等级 | 所需CBT | 奖励倍数 | 特权 |
|-----|--------|---------|------|
| Bronze | 0 | 1.0x | 基础功能 |
| Silver | 100 | 1.2x | 20%奖励加成 |
| Gold | 500 | 1.5x | 50%奖励加成 + 专属徽章 |
| Platinum | 2000 | 2.0x | 100%奖励加成 + 优先客服 |
| Diamond | 10000 | 3.0x | 200%奖励加成 + 专属活动 |

## 🛠️ 技术栈

### 前端技术
- **React 18** - 用户界面框架
- **Tailwind CSS** - 样式框架
- **Web3.js** - 区块链交互
- **Socket.IO Client** - 实时通信
- **Lucide React** - 图标库

### 后端技术
- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **MongoDB** - 数据库
- **Socket.IO** - 实时通信
- **Web3** - 区块链集成
- **JWT** - 身份认证

### 区块链技术
- **BNB Chain** - 区块链网络
- **Solidity** - 智能合约语言
- **MetaMask** - 钱包集成
- **CBT Token** - 平台代币

## 📊 API文档

### 认证相关
```
POST /api/v1/auth/register    # 用户注册
POST /api/v1/auth/login       # 用户登录
GET  /api/v1/auth/me          # 获取当前用户信息
```

### 代币相关
```
GET  /api/v1/tokens/balance        # 获取代币余额
GET  /api/v1/tokens/rewards/stats  # 获取奖励统计
POST /api/v1/tokens/transfer       # 转账代币
GET  /api/v1/tokens/transactions   # 交易历史
```

### 聊天相关
```
GET  /api/v1/chat/rooms        # 获取聊天室列表
POST /api/v1/chat/messages     # 发送消息
GET  /api/v1/chat/history      # 获取聊天历史
```

### 翻译相关
```
POST /api/v1/voice/translate   # 语音翻译
POST /api/v1/voice/synthesize  # 语音合成
GET  /api/v1/voice/languages   # 支持的语言
```

## 🔐 安全特性

- **JWT认证** - 安全的用户身份验证
- **API限流** - 防止API滥用
- **数据验证** - 输入数据验证和清理
- **XSS防护** - 跨站脚本攻击防护
- **CORS配置** - 跨域资源共享控制
- **加密存储** - 敏感数据加密存储

## 🌟 路线图

### 已完成 ✅
- [x] 基础架构搭建
- [x] 用户认证系统
- [x] CBT代币奖励机制
- [x] 实时聊天功能
- [x] 语音翻译功能
- [x] 区块链集成
- [x] 响应式设计

### 开发中 🚧
- [ ] 移动端APP
- [ ] 高级AI翻译
- [ ] NFT文化收藏品
- [ ] 社区治理功能
- [ ] 多链支持

### 计划中 📋
- [ ] VR/AR文化体验
- [ ] AI文化导师
- [ ] 去中心化存储
- [ ] 跨链桥接
- [ ] 机构合作功能

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

### 贡献方式
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 团队

- **Bin Yi** - 项目创始人 & 首席开发者
- **CultureBridge Team** - 开发团队

## 📞 联系我们

- **项目主页**: https://github.com/yb1734492970508/CultureBridge-Frontend1
- **问题反馈**: https://github.com/yb1734492970508/CultureBridge-Frontend1/issues
- **邮箱**: developer@culturebridge.com

## 🙏 致谢

感谢所有为CultureBridge项目做出贡献的开发者和用户！

特别感谢：
- React团队提供优秀的前端框架
- Node.js社区的技术支持
- BNB Chain提供的区块链基础设施
- 所有测试用户的宝贵反馈

---

**让我们一起构建一个没有语言障碍的世界！** 🌍✨

