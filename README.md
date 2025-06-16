# CultureBridge Frontend

## 项目简介 | Project Overview

CultureBridge是一个基于区块链技术的文化交流和语言学习平台，旨在连接全球用户，促进跨文化交流和语言学习。

CultureBridge is a blockchain-based cultural exchange and language learning platform designed to connect global users and promote cross-cultural communication and language learning.

## 主要功能 | Key Features

### 🌍 多语言实时聊天 | Multi-language Real-time Chat
- 支持10种主要语言的实时聊天
- 自动翻译功能
- 文化背景注释
- 语音消息支持

### 🎤 智能语音翻译 | Intelligent Voice Translation
- 高质量语音识别
- 实时语音翻译
- 多语言语音合成
- 音频文件上传支持

### 💰 CBT代币奖励系统 | CBT Token Reward System
- 基于BNB链的CBT代币
- 参与聊天和翻译获得奖励
- 用户等级系统
- 区块链钱包集成

### 🔐 Web3钱包集成 | Web3 Wallet Integration
- MetaMask钱包连接
- 安全的身份验证
- 区块链交易支持
- 去中心化身份管理

## 技术栈 | Technology Stack

### 前端 | Frontend
- **React 18** - 用户界面框架
- **Lucide React** - 图标库
- **Web3.js** - 区块链交互
- **WebSocket** - 实时通信
- **Responsive Design** - 响应式设计

### 区块链 | Blockchain
- **BNB Smart Chain** - 区块链网络
- **CBT Token (ERC20)** - 平台代币
- **MetaMask** - 钱包连接
- **Smart Contracts** - 智能合约

## 快速开始 | Quick Start

### 环境要求 | Prerequisites
- Node.js 16+
- npm 或 yarn
- MetaMask浏览器扩展

### 安装步骤 | Installation

1. 克隆仓库 | Clone the repository
```bash
git clone https://github.com/yb1734492970508/CultureBridge-Frontend1.git
cd CultureBridge-Frontend1
```

2. 安装依赖 | Install dependencies
```bash
npm install
```

3. 启动开发服务器 | Start development server
```bash
npm start
```

4. 构建生产版本 | Build for production
```bash
npm run build
```

## 项目结构 | Project Structure

```
src/
├── components/                 # React组件
│   ├── WalletConnect.jsx      # 钱包连接组件
│   ├── EnhancedChatRoom.jsx   # 增强版聊天室
│   ├── EnhancedVoiceTranslation.jsx # 语音翻译组件
│   ├── ChatRoom.jsx           # 基础聊天室
│   └── VoiceTranslation.jsx   # 基础语音翻译
├── SimpleApp.jsx              # 主应用组件
├── EnhancedApp.jsx           # 增强版应用
├── App.jsx                   # 原始应用组件
└── index.js                  # 应用入口
```

## 功能特性 | Features

### 🎯 用户等级系统 | User Level System
- **Bronze** (0-99 CBT) - 青铜等级
- **Silver** (100-499 CBT) - 白银等级  
- **Gold** (500-1999 CBT) - 黄金等级
- **Platinum** (2000-9999 CBT) - 铂金等级
- **Diamond** (10000+ CBT) - 钻石等级

### 💎 奖励机制 | Reward Mechanism
- 发送消息：0.1 CBT
- 语音消息：0.2 CBT
- 文本翻译：0.5 CBT
- 语音翻译：1.0 CBT
- 每日登录：1.0 CBT

### 🌐 支持语言 | Supported Languages
- 中文 (Chinese) 🇨🇳
- English 🇺🇸
- Español 🇪🇸
- Français 🇫🇷
- Deutsch 🇩🇪
- 日本語 🇯🇵
- 한국어 🇰🇷
- Português 🇵🇹
- Русский 🇷🇺
- العربية 🇸🇦

## 配置说明 | Configuration

### 环境变量 | Environment Variables
创建 `.env` 文件并配置以下变量：

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_CHAIN_ID=56
REACT_APP_CBT_CONTRACT_ADDRESS=0x...
```

### 网络配置 | Network Configuration
- **主网**: BNB Smart Chain (Chain ID: 56)
- **测试网**: BNB Smart Chain Testnet (Chain ID: 97)

## 开发指南 | Development Guide

### 代码规范 | Code Standards
- 使用ES6+语法
- 组件采用函数式组件和Hooks
- 遵循React最佳实践
- 使用TypeScript类型注解（推荐）

### 组件开发 | Component Development
- 所有组件都应该是响应式的
- 使用Lucide React图标库
- 遵循统一的样式规范
- 实现无障碍访问支持

## 部署说明 | Deployment

### 构建优化 | Build Optimization
- 代码分割和懒加载
- 图片压缩和优化
- Bundle大小优化
- 缓存策略配置

### 生产部署 | Production Deployment
1. 构建生产版本
2. 配置Web服务器
3. 设置HTTPS
4. 配置CDN（可选）

## 贡献指南 | Contributing

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证 | License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 联系我们 | Contact

- 项目链接: [https://github.com/yb1734492970508/CultureBridge-Frontend1](https://github.com/yb1734492970508/CultureBridge-Frontend1)
- 后端仓库: [https://github.com/yb1734492970508/CultureBridge-Backend](https://github.com/yb1734492970508/CultureBridge-Backend)

## 更新日志 | Changelog

### v2.1.0 (2025-06-16)
- ✨ 新增增强版聊天室功能
- ✨ 新增智能语音翻译功能
- ✨ 新增CBT代币奖励系统
- ✨ 新增用户等级系统
- ✨ 新增实时通知系统
- 🎨 改进用户界面设计
- 🔧 优化性能和响应速度
- 🐛 修复已知问题

### v2.0.0 (2025-06-15)
- 🎉 项目重构，采用现代化架构
- ✨ 集成BNB链区块链技术
- ✨ 实现Web3钱包连接
- ✨ 添加多语言支持
- 📱 实现响应式设计

---

**让我们一起构建连接世界的文化桥梁！**

**Let's build a cultural bridge that connects the world together!**

