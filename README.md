# CultureBridge Frontend

CultureBridge is a blockchain-based cross-cultural exchange platform designed to connect people from different cultural backgrounds and promote cultural understanding and exchange. This repository contains the frontend code for the CultureBridge platform.

CultureBridge是一个基于区块链技术的跨文化交流平台，旨在连接不同文化背景的人们，促进文化理解与交流。本仓库包含CultureBridge平台的前端代码。

## Features
## 功能特点

- **Blockchain Integration**：Integrated with BNB Chain (Binance Smart Chain) to support decentralized identity and asset management.
- **区块链集成**：与BNB Chain（币安智能链）集成，支持去中心化身份和资产管理。
- **Digital Identity**：Create and manage your blockchain identity, securely managing your cultural identity and reputation.
- **数字身份**：创建和管理您的区块链身份，安全地管理您的文化身份和声誉。
- **Cultural Assets**：Digitize your cultural works and resources, creating unique NFT assets.
- **文化资产**：将您的文化作品和资源数字化，创建独特的NFT资产。
- **Cultural Exchange**：Participate in various cultural exchange activities, sharing your cultural knowledge and experience.
- **文化交流**：参与各种文化交流活动，分享您的文化知识和经验。
- **Cultural Marketplace**：Trade cultural assets in a decentralized marketplace, supporting cultural creators.
- **文化市场**：在去中心化市场中交易文化资产，支持文化创作者。

## Tech Stack
## 技术栈

- React.js - Frontend framework
- React.js - 前端框架
- Web3.js/ethers.js - Blockchain interaction
- Web3.js/ethers.js - 区块链交互
- CSS3 - Styling and responsive design
- CSS3 - 样式和响应式设计

## Installation and Setup
## 安装与设置

### Prerequisites
### 前提条件

- Node.js (v14.0.0+)
- Node.js (v14.0.0+)
- npm or yarn
- npm 或 yarn
- MetaMask or other Web3 wallet browser extension
- MetaMask 或其他Web3钱包浏览器扩展

### Installation Steps
### 安装步骤

1. Clone the repository
1. 克隆仓库
```bash
git clone https://github.com/yourusername/CultureBridge-Frontend.git
cd CultureBridge-Frontend
```

2. Install dependencies
2. 安装依赖
```bash
npm install
# or
# 或
yarn install
```

3. Create environment file
3. 创建环境变量文件
Create a `.env` file in the project root directory and add the following content:
在项目根目录创建`.env`文件，并添加以下内容：
```
REACT_APP_IDENTITY_CONTRACT_ADDRESS=Your Identity Contract Address
REACT_APP_IDENTITY_CONTRACT_ADDRESS=你的身份合约地址
REACT_APP_ASSET_CONTRACT_ADDRESS=Your Asset Contract Address
REACT_APP_ASSET_CONTRACT_ADDRESS=你的资产合约地址
REACT_APP_EXCHANGE_CONTRACT_ADDRESS=Your Exchange Contract Address
REACT_APP_EXCHANGE_CONTRACT_ADDRESS=你的交流合约地址
REACT_APP_TOKEN_CONTRACT_ADDRESS=Your Token Contract Address
REACT_APP_TOKEN_CONTRACT_ADDRESS=你的代币合约地址
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=Your Marketplace Contract Address
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=你的市场合约地址
REACT_APP_WEB3_PROVIDER_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
REACT_APP_WEB3_PROVIDER_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

4. Add Contract ABI
4. 添加合约ABI
Place the smart contract ABI files in the `src/contracts/` directory, ensuring that the file names match the names imported in the Web3 service.
将智能合约的ABI文件放置在`src/contracts/`目录下，确保文件名与Web3服务中导入的名称一致。

5. Start development server
5. 启动开发服务器
```bash
npm start
# or
# 或
yarn start
```

6. Open your browser and visit `http://localhost:3000`
6. 打开浏览器访问 `http://localhost:3000`

## Usage Guide
## 使用指南

### Connect Wallet
### 连接钱包

1. Ensure you have MetaMask or other Web3 wallet browser extension installed.
1. 确保您已安装MetaMask或其他Web3钱包浏览器扩展。
2. Click the "Connect Wallet" button at the top of the page.
2. 点击页面顶部的"连接钱包"按钮。
3. Authorize the connection in the pop-up wallet interface.
3. 在弹出的钱包界面中授权连接。

### Identity Management
### 身份管理

1. Click "Identity Management" in the navigation bar.
1. 点击导航栏中的"身份管理"。
2. If you are a new user, fill out the registration form and submit.
2. 如果您是新用户，填写注册表单并提交。
3. If you are already registered, you can view and update your profile.
3. 如果您已注册，可以查看和更新您的个人资料。

### Asset Management
### 资产管理

1. Click "Asset Management" in the navigation bar.
1. 点击导航栏中的"资产管理"。
2. Fill out the asset creation form and upload your cultural resources.
2. 填写资产创建表单，上传您的文化资源。
3. View all assets you have created.
3. 查看您已创建的所有资产。

### Cultural Marketplace
### 文化市场

1. Click "Cultural Marketplace" in the navigation bar.
1. 点击导航栏中的"文化市场"。
2. Browse currently available cultural assets for purchase.
2. 浏览当前可购买的文化资产。
3. List your assets for sale or purchase assets from other users.
3. 挂单出售您的资产或购买其他用户的资产。
4. View transaction history.
4. 查看交易历史。

## Deployment Guide
## 部署指南

### Testnet Deployment
### 测试网部署

1. Ensure your contracts are deployed to the BNB Testnet.
1. 确保您的合约已部署到BNB测试网。
2. Update contract addresses in the `.env` file.
2. 更新`.env`文件中的合约地址。
3. Build production version.
3. 构建生产版本。
```bash
npm run build
# or
# 或
yarn build
```
4. Deploy the `build` directory to your web server.
4. 将`build`目录部署到您的Web服务器。

### Mainnet Deployment
### 主网部署

1. Deploy your contracts to the BNB Mainnet.
1. 将您的合约部署到BNB主网。
2. Update contract addresses and provider URL in the `.env` file.
2. 更新`.env`文件中的合约地址和提供者URL。
```
REACT_APP_WEB3_PROVIDER_URL=https://bsc-dataseed.binance.org/
```
3. Build production version and deploy.
3. 构建生产版本并部署。

## Development Guide
## 开发指南

### Project Structure
### 项目结构

```
src/
  ├── components/       # React components
  ├── components/       # React组件
  ├── contracts/        # Contract ABI files
  ├── contracts/        # 合约ABI文件
  ├── services/         # Service classes, including Web3 services
  ├── services/         # 服务类，包括Web3服务
  ├── styles/           # CSS style files
  ├── styles/           # CSS样式文件
  ├── App.js            # Main application component
  ├── App.js            # 主应用组件
  └── index.js          # Application entry point
  └── index.js          # 应用入口点
```

### Adding New Features
### 添加新功能

1. Create new components in the `components` directory.
1. 在`components`目录中创建新组件。
2. If interaction with the blockchain is required, use methods from `web3Service.js`.
2. 如需与区块链交互，使用`web3Service.js`中的方法。
3. Integrate new components into `App.js`.
3. 在`App.js`中集成新组件。
4. Add corresponding styles in `styles/App.css`.
4. 在`styles/App.css`中添加相应样式。

## Contribution Guide
## 贡献指南

1. Fork the repository.
1. Fork 仓库。
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)。
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)。
4. Push to the branch (`git push origin feature/amazing-feature`).
4. 推送到分支 (`git push origin feature/amazing-feature`)。
5. Open a Pull Request.
5. 打开一个 Pull Request。

## License
## 许可证

This project is licensed under the MIT License - see the LICENSE file for details.
本项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件。

## Contact
## 联系方式

Project Maintainer - [Your Name](mailto:your.email@example.com)
项目维护者 - [您的名字](mailto:your.email@example.com)

Project Link: [https://github.com/yourusername/CultureBridge-Frontend](https://github.com/yourusername/CultureBridge-Frontend)
项目链接: [https://github.com/yourusername/CultureBridge-Frontend](https://github.com/yourusername/CultureBridge-Frontend)


