# CultureBridge Frontend - 文化桥梁前端应用

## 项目简介 | Project Overview

CultureBridge是一个基于区块链技术的文化交流和语言学习平台，旨在通过优质的文化交流让用户获得CBT代币奖励，同时提供实时聊天和语音翻译功能。

CultureBridge is a blockchain-based cultural exchange and language learning platform that aims to reward users with CBT tokens through quality cultural exchanges while providing real-time chat and voice translation features.

## 主要功能 | Key Features

### 🔗 区块链集成 | Blockchain Integration
- BNB链(BSC)集成
- CBT代币奖励系统
- Web3钱包连接(MetaMask)
- 智能合约交互

### 💬 实时通信 | Real-time Communication
- 多房间聊天系统
- 实时消息同步
- 语音消息支持
- 在线用户状态

### 🌍 语言翻译 | Language Translation
- 支持15种语言
- 实时文本翻译
- 语音翻译功能
- AI驱动的翻译质量评分

### 👤 用户系统 | User System
- 用户等级系统
- 个人资料管理
- 奖励历史记录
- 成就徽章系统

### 🎨 现代化界面 | Modern UI
- 响应式设计
- 深色模式支持
- 流畅的动画效果
- 移动端适配

## 技术栈 | Tech Stack

### 前端技术 | Frontend Technologies
- **React 18** - 用户界面框架
- **JavaScript (ES6+)** - 编程语言
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库
- **Socket.io Client** - 实时通信
- **Web3.js** - 区块链交互

### 开发工具 | Development Tools
- **Create React App** - 项目脚手架
- **npm** - 包管理器
- **Git** - 版本控制

## 项目结构 | Project Structure

```
src/
├── components/          # React组件
│   ├── EnhancedChatRoom.jsx      # 增强版聊天室
│   ├── EnhancedVoiceTranslation.jsx  # 语音翻译
│   ├── WalletConnect.jsx         # 钱包连接
│   ├── TokenBalance.jsx          # 代币余额
│   ├── UserProfile.jsx           # 用户资料
│   └── RewardHistory.jsx         # 奖励历史
├── EnhancedApp.jsx      # 主应用组件
├── EnhancedApp.css      # 应用样式
├── index.js             # 应用入口
└── index.css            # 全局样式
```

## 安装和运行 | Installation & Setup

### 环境要求 | Prerequisites
- Node.js 16.0+
- npm 8.0+
- MetaMask浏览器扩展

### 安装步骤 | Installation Steps

1. **克隆仓库 | Clone Repository**
```bash
git clone https://github.com/yb1734492970508/CultureBridge-Frontend1.git
cd CultureBridge-Frontend1
```

2. **安装依赖 | Install Dependencies**
```bash
npm install
```

3. **启动开发服务器 | Start Development Server**
```bash
npm start
```

4. **访问应用 | Access Application**
打开浏览器访问: http://localhost:3000

### 环境配置 | Environment Configuration

创建 `.env` 文件并配置以下变量：
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
REACT_APP_CBT_CONTRACT_ADDRESS=0x...
```

## 使用指南 | Usage Guide

### 1. 连接钱包 | Connect Wallet
- 点击"连接钱包"按钮
- 选择MetaMask钱包
- 确认连接并切换到BSC测试网

### 2. 查看代币余额 | Check Token Balance
- 连接钱包后自动显示CBT余额
- 查看奖励历史和交易记录

### 3. 参与聊天 | Join Chat
- 选择聊天房间
- 发送文本或语音消息
- 获得CBT代币奖励

### 4. 使用翻译功能 | Use Translation
- 选择源语言和目标语言
- 输入文本或录制语音
- 获得翻译结果和奖励

## 开发指南 | Development Guide

### 代码规范 | Code Standards
- 使用ES6+语法
- 组件采用函数式编程
- 使用React Hooks管理状态
- 遵循Airbnb JavaScript规范

### 组件开发 | Component Development
- 每个组件单独文件
- 使用PropTypes进行类型检查
- 添加详细的注释说明
- 实现响应式设计

### 状态管理 | State Management
- 使用useState管理本地状态
- 使用useEffect处理副作用
- 使用Context API共享全局状态

## 部署指南 | Deployment Guide

### 构建生产版本 | Build for Production
```bash
npm run build
```

### 部署到服务器 | Deploy to Server
1. 将build文件夹上传到服务器
2. 配置Nginx或Apache
3. 设置HTTPS证书
4. 配置域名解析

### 环境变量 | Environment Variables
生产环境需要配置：
- API服务器地址
- 区块链网络配置
- 智能合约地址

## API接口 | API Endpoints

### 区块链相关 | Blockchain APIs
- `GET /api/blockchain/network` - 获取网络信息
- `GET /api/blockchain/balance/:address` - 查询余额
- `POST /api/blockchain/reward/distribute` - 分发奖励

### 翻译相关 | Translation APIs
- `GET /api/translation/languages` - 支持的语言
- `POST /api/translation/translate` - 文本翻译
- `POST /api/translation/voice` - 语音翻译

## 贡献指南 | Contributing

### 提交代码 | Submit Code
1. Fork项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建Pull Request

### 报告问题 | Report Issues
- 使用GitHub Issues报告bug
- 提供详细的复现步骤
- 包含错误截图和日志

## 许可证 | License

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 联系我们 | Contact Us

- **项目主页**: https://github.com/yb1734492970508/CultureBridge-Frontend1
- **问题反馈**: https://github.com/yb1734492970508/CultureBridge-Frontend1/issues
- **邮箱**: developer@culturebridge.com

## 更新日志 | Changelog

### v2.1.0 (2025-06-16)
- ✨ 新增BNB链区块链集成
- ✨ 实现CBT代币奖励系统
- ✨ 添加增强版聊天室功能
- ✨ 集成语音翻译功能
- ✨ 优化用户界面和体验
- 🐛 修复已知问题和性能优化

### v2.0.0 (2024-12-01)
- 🎉 项目重构，采用React 18
- ✨ 新增Web3钱包连接
- ✨ 实现实时聊天功能
- ✨ 添加多语言翻译支持

---

**让文化交流更有价值，让语言学习更有趣！**

**Making cultural exchange more valuable and language learning more fun!**

