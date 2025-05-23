# CultureBridge 前端

CultureBridge是一个基于区块链技术的跨文化交流平台，旨在连接不同文化背景的人们，促进文化理解与交流。本仓库包含CultureBridge平台的前端代码。

## 功能特点

- **区块链集成**：与BNB Chain（币安智能链）集成，支持去中心化身份和资产管理
- **数字身份**：创建和管理您的区块链身份，安全地管理您的文化身份和声誉
- **文化资产**：将您的文化作品和资源数字化，创建独特的NFT资产
- **文化交流**：参与各种文化交流活动，分享您的文化知识和经验
- **文化市场**：在去中心化市场中交易文化资产，支持文化创作者

## 技术栈

- React.js - 前端框架
- Web3.js/ethers.js - 区块链交互
- CSS3 - 样式和响应式设计

## 安装与设置

### 前提条件

- Node.js (v14.0.0+)
- npm 或 yarn
- MetaMask 或其他Web3钱包浏览器扩展

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/CultureBridge-Frontend.git
cd CultureBridge-Frontend
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 创建环境变量文件
在项目根目录创建`.env`文件，并添加以下内容：
```
REACT_APP_IDENTITY_CONTRACT_ADDRESS=你的身份合约地址
REACT_APP_ASSET_CONTRACT_ADDRESS=你的资产合约地址
REACT_APP_EXCHANGE_CONTRACT_ADDRESS=你的交流合约地址
REACT_APP_TOKEN_CONTRACT_ADDRESS=你的代币合约地址
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=你的市场合约地址
REACT_APP_WEB3_PROVIDER_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

4. 添加合约ABI
将智能合约的ABI文件放置在`src/contracts/`目录下，确保文件名与Web3服务中导入的名称一致。

5. 启动开发服务器
```bash
npm start
# 或
yarn start
```

6. 打开浏览器访问 `http://localhost:3000`

## 使用指南

### 连接钱包

1. 确保您已安装MetaMask或其他Web3钱包浏览器扩展
2. 点击页面顶部的"连接钱包"按钮
3. 在弹出的钱包界面中授权连接

### 身份管理

1. 点击导航栏中的"身份管理"
2. 如果您是新用户，填写注册表单并提交
3. 如果您已注册，可以查看和更新您的个人资料

### 资产管理

1. 点击导航栏中的"资产管理"
2. 填写资产创建表单，上传您的文化资源
3. 查看您已创建的所有资产

### 文化市场

1. 点击导航栏中的"文化市场"
2. 浏览当前可购买的文化资产
3. 挂单出售您的资产或购买其他用户的资产
4. 查看交易历史

## 部署指南

### 测试网部署

1. 确保您的合约已部署到BNB测试网
2. 更新`.env`文件中的合约地址
3. 构建生产版本
```bash
npm run build
# 或
yarn build
```
4. 将`build`目录部署到您的Web服务器

### 主网部署

1. 将您的合约部署到BNB主网
2. 更新`.env`文件中的合约地址和提供者URL
```
REACT_APP_WEB3_PROVIDER_URL=https://bsc-dataseed.binance.org/
```
3. 构建生产版本并部署

## 开发指南

### 项目结构

```
src/
  ├── components/       # React组件
  ├── contracts/        # 合约ABI文件
  ├── services/         # 服务类，包括Web3服务
  ├── styles/           # CSS样式文件
  ├── App.js            # 主应用组件
  └── index.js          # 应用入口点
```

### 添加新功能

1. 在`components`目录中创建新组件
2. 如需与区块链交互，使用`web3Service.js`中的方法
3. 在`App.js`中集成新组件
4. 在`styles/App.css`中添加相应样式

## 贡献指南

1. Fork 仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件

## 联系方式

项目维护者 - [您的名字](mailto:your.email@example.com)

项目链接: [https://github.com/yourusername/CultureBridge-Frontend](https://github.com/yourusername/CultureBridge-Frontend)
