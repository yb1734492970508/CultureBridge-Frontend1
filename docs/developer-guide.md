# CultureBridge 开发者文档

## 项目概述

CultureBridge 是一个基于区块链技术的跨文化交流平台，旨在通过去中心化技术连接全球文化创作者和爱好者。平台集成了NFT市场、DAO治理、身份验证和声誉系统等核心功能，为用户提供安全、透明的文化交流环境。

本文档面向开发者，提供项目架构、组件库、API接口和开发指南，帮助您快速理解和参与CultureBridge的开发。

## 技术栈

- **前端框架**: React 18
- **状态管理**: Context API + Hooks
- **样式方案**: CSS Modules + CSS Variables
- **区块链交互**: ethers.js
- **路由管理**: React Router v6
- **构建工具**: Webpack 5
- **测试框架**: Jest + React Testing Library
- **代码规范**: ESLint + Prettier

## 项目结构

```
CultureBridge-Frontend/
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── assets/             # 图片、字体等资源
│   ├── components/         # 组件
│   │   ├── blockchain/     # 区块链相关组件
│   │   ├── common/         # 通用UI组件
│   │   ├── dao/            # DAO治理组件
│   │   ├── identity/       # 身份与声誉组件
│   │   ├── layout/         # 布局组件
│   │   └── marketplace/    # NFT市场组件
│   ├── context/            # 上下文管理
│   │   ├── blockchain/     # 区块链上下文
│   │   ├── dao/            # DAO上下文
│   │   └── identity/       # 身份上下文
│   ├── contracts/          # 智能合约接口
│   ├── hooks/              # 自定义Hooks
│   ├── pages/              # 页面组件
│   ├── styles/             # 全局样式
│   ├── utils/              # 工具函数
│   ├── App.js              # 应用入口
│   └── index.js            # 渲染入口
├── design/                 # 设计文档
├── docs/                   # 开发文档
├── tests/                  # 测试文件
├── .eslintrc.js            # ESLint配置
├── .prettierrc             # Prettier配置
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 核心模块

### 1. 组件库

CultureBridge使用模块化的组件设计，所有组件分为以下几类：

#### 通用组件 (common)

基础UI组件，如按钮、输入框、卡片等，位于 `src/components/common/` 目录。

```jsx
// 按钮组件示例
import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  ...props 
}) => {
  return (
    <button 
      className={`cb-button ${variant} ${size}`} 
      disabled={disabled} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

#### 区块链组件 (blockchain)

与区块链交互的组件，如钱包连接、NFT铸造、交易历史等，位于 `src/components/blockchain/` 目录。

```jsx
// 钱包连接组件示例（简化版）
import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import './WalletConnect.css';

const WalletConnect = () => {
  const { account, connectWallet, disconnectWallet } = useBlockchain();
  
  return (
    <div className="wallet-connect">
      {!account ? (
        <button onClick={connectWallet}>连接钱包</button>
      ) : (
        <div className="wallet-info">
          <span>{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
          <button onClick={disconnectWallet}>断开连接</button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
```

#### DAO治理组件 (dao)

DAO治理相关组件，如提案创建、投票界面等，位于 `src/components/dao/` 目录。

#### 身份与声誉组件 (identity)

身份验证和声誉系统相关组件，位于 `src/components/identity/` 目录。

#### NFT市场组件 (marketplace)

NFT市场相关组件，如NFT列表、详情页等，位于 `src/components/marketplace/` 目录。

### 2. 上下文管理

CultureBridge使用React Context API进行状态管理，主要包括以下上下文：

#### 区块链上下文 (BlockchainContext)

管理钱包连接、网络状态等区块链相关状态。

```jsx
// 区块链上下文示例（简化版）
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';

const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  
  // 连接钱包
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const network = await provider.getNetwork();
        
        setAccount(accounts[0]);
        setChainId(network.chainId);
        setProvider(provider);
      } else {
        throw new Error('未检测到以太坊钱包');
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };
  
  // 断开钱包连接
  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
  };
  
  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });
      
      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16));
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);
  
  return (
    <BlockchainContext.Provider
      value={{
        account,
        chainId,
        provider,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => useContext(BlockchainContext);
```

#### DAO上下文 (DAOContext)

管理DAO治理相关状态，如提案列表、投票等。

#### 身份上下文 (IdentityContext)

管理用户身份和声誉相关状态。

### 3. 智能合约接口

CultureBridge通过 `src/contracts/` 目录下的接口文件与区块链智能合约交互。

```jsx
// NFT市场合约接口示例（简化版）
import { ethers } from 'ethers';
import NFTMarketplaceABI from './NFTMarketplaceABI';

const NFT_MARKETPLACE_ADDRESS = '0x...'; // 合约地址

export const fetchMarketItems = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      NFT_MARKETPLACE_ADDRESS,
      NFTMarketplaceABI,
      provider
    );
    
    const items = await contract.fetchMarketItems();
    return items.map(item => ({
      itemId: item.itemId.toString(),
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      owner: item.owner,
      price: ethers.utils.formatEther(item.price),
      sold: item.sold
    }));
  } catch (error) {
    console.error('获取市场项目失败:', error);
    throw error;
  }
};

export const purchaseItem = async (itemId, price) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      NFT_MARKETPLACE_ADDRESS,
      NFTMarketplaceABI,
      signer
    );
    
    const transaction = await contract.createMarketSale(
      itemId,
      { value: ethers.utils.parseEther(price) }
    );
    
    await transaction.wait();
    return { success: true };
  } catch (error) {
    console.error('购买项目失败:', error);
    return { success: false, error: error.message };
  }
};
```

## 样式系统

CultureBridge使用CSS变量实现主题定制，主要变量定义在 `src/styles/variables.css` 文件中。

```css
:root {
  /* 颜色 */
  --color-primary: #3f51b5;
  --color-primary-light: #757de8;
  --color-primary-dark: #002984;
  --color-secondary: #f50057;
  --color-secondary-light: #ff5983;
  --color-secondary-dark: #bb002f;
  
  --color-success: #4caf50;
  --color-success-light: #e8f5e9;
  --color-success-dark: #2e7d32;
  --color-warning: #ff9800;
  --color-warning-light: #fff3e0;
  --color-warning-dark: #ef6c00;
  --color-danger: #f44336;
  --color-danger-light: #ffebee;
  --color-danger-dark: #c62828;
  --color-info: #2196f3;
  --color-info-light: #e3f2fd;
  --color-info-dark: #0d47a1;
  
  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e0e0e0;
  --bg-quaternary: #d0d0d0;
  --bg-card: #ffffff;
  
  /* 文本颜色 */
  --text-primary: #212121;
  --text-secondary: #757575;
  --text-disabled: #9e9e9e;
  
  /* 边框 */
  --border-light: #e0e0e0;
  --border-medium: #bdbdbd;
  --border-dark: #9e9e9e;
  
  /* 字体 */
  --font-primary: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  --font-secondary: 'Montserrat', 'Helvetica', 'Arial', sans-serif;
  --font-mono: 'Roboto Mono', monospace;
  
  /* 字体大小 */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-3xl: 2.5rem;
  
  /* 间距 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* 圆角 */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  
  /* 过渡 */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
  
  /* Z-index */
  --z-index-dropdown: 1000;
  --z-index-sticky: 1100;
  --z-index-fixed: 1200;
  --z-index-modal-backdrop: 1300;
  --z-index-modal: 1400;
  --z-index-popover: 1500;
  --z-index-tooltip: 1600;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #121212;
    --bg-secondary: #1e1e1e;
    --bg-tertiary: #2c2c2c;
    --bg-quaternary: #3a3a3a;
    --bg-card: #1e1e1e;
    
    --text-primary: #e0e0e0;
    --text-secondary: #a0a0a0;
    --text-disabled: #6c6c6c;
    
    --border-light: #2c2c2c;
    --border-medium: #3a3a3a;
    --border-dark: #4a4a4a;
    
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
    --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.3);
  }
}
```

## 开发指南

### 环境设置

1. 克隆仓库
```bash
git clone https://github.com/username/CultureBridge-Frontend.git
cd CultureBridge-Frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

### 添加新组件

1. 在适当的目录下创建组件文件
```jsx
// src/components/common/Badge.js
import React from 'react';
import './Badge.css';

const Badge = ({ children, variant = 'primary', size = 'medium' }) => {
  return (
    <span className={`cb-badge ${variant} ${size}`}>
      {children}
    </span>
  );
};

export default Badge;
```

2. 创建对应的样式文件
```css
/* src/components/common/Badge.css */
.cb-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.cb-badge.primary {
  background-color: var(--color-primary);
  color: white;
}

.cb-badge.secondary {
  background-color: var(--color-secondary);
  color: white;
}

.cb-badge.success {
  background-color: var(--color-success);
  color: white;
}

.cb-badge.warning {
  background-color: var(--color-warning);
  color: white;
}

.cb-badge.danger {
  background-color: var(--color-danger);
  color: white;
}

.cb-badge.small {
  padding: 0.125rem 0.375rem;
  font-size: calc(var(--font-size-xs) * 0.85);
}

.cb-badge.medium {
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-xs);
}

.cb-badge.large {
  padding: 0.375rem 0.75rem;
  font-size: var(--font-size-sm);
}
```

### 与区块链交互

1. 创建合约接口
```jsx
// src/contracts/TokenContract.js
import { ethers } from 'ethers';
import TokenABI from './TokenABI';

const TOKEN_ADDRESS = '0x...'; // 代币合约地址

export const getTokenBalance = async (address) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      TOKEN_ADDRESS,
      TokenABI,
      provider
    );
    
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('获取代币余额失败:', error);
    throw error;
  }
};

export const transferToken = async (to, amount) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      TOKEN_ADDRESS,
      TokenABI,
      signer
    );
    
    const transaction = await contract.transfer(
      to,
      ethers.utils.parseEther(amount)
    );
    
    await transaction.wait();
    return { success: true };
  } catch (error) {
    console.error('转账失败:', error);
    return { success: false, error: error.message };
  }
};
```

2. 在组件中使用合约接口
```jsx
// src/components/blockchain/TokenTransfer.js
import React, { useState } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { transferToken } from '../../contracts/TokenContract';
import Button from '../common/Button';
import Input from '../common/Input';
import './TokenTransfer.css';

const TokenTransfer = () => {
  const { account } = useBlockchain();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleTransfer = async () => {
    if (!account || !recipient || !amount) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await transferToken(recipient, amount);
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="token-transfer">
      <h2>转账</h2>
      
      <div className="form-group">
        <label>接收地址</label>
        <Input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label>金额</label>
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          type="number"
          disabled={isLoading}
        />
      </div>
      
      <Button
        onClick={handleTransfer}
        disabled={!account || !recipient || !amount || isLoading}
      >
        {isLoading ? '处理中...' : '转账'}
      </Button>
      
      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? '转账成功!' : `转账失败: ${result.error}`}
        </div>
      )}
    </div>
  );
};

export default TokenTransfer;
```

## 最佳实践

### 性能优化

1. **组件懒加载**

使用React.lazy和Suspense实现组件懒加载，减少初始加载时间。

```jsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from './components/common/Loading';

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'));
const NFTMarketplace = lazy(() => import('./pages/NFTMarketplace'));
const DAOGovernance = lazy(() => import('./pages/DAOGovernance'));
const Identity = lazy(() => import('./pages/Identity'));

const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<NFTMarketplace />} />
        <Route path="/dao" element={<DAOGovernance />} />
        <Route path="/identity" element={<Identity />} />
      </Routes>
    </Suspense>
  );
};

export default App;
```

2. **使用useMemo和useCallback**

对于计算密集型操作或需要避免不必要重渲染的场景，使用useMemo和useCallback。

```jsx
import React, { useState, useMemo, useCallback } from 'react';

const ExpensiveComponent = ({ data, onItemClick }) => {
  // 使用useMemo缓存计算结果
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: expensiveCalculation(item)
    }));
  }, [data]);
  
  // 使用useCallback避免函数重新创建
  const handleItemClick = useCallback((id) => {
    onItemClick(id);
  }, [onItemClick]);
  
  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleItemClick(item.id)}>
          {item.processed}
        </div>
      ))}
    </div>
  );
};

// 模拟昂贵计算
const expensiveCalculation = (item) => {
  // 假设这是一个复杂计算
  return item.value * 2;
};
```

3. **使用骨架屏**

在数据加载过程中显示骨架屏，提升用户体验。

```jsx
import React, { useState, useEffect } from 'react';
import './NFTCard.css';

// 骨架屏组件
const NFTCardSkeleton = () => (
  <div className="nft-card skeleton">
    <div className="nft-image-skeleton"></div>
    <div className="nft-info-skeleton">
      <div className="nft-title-skeleton"></div>
      <div className="nft-price-skeleton"></div>
      <div className="nft-button-skeleton"></div>
    </div>
  </div>
);

// NFT卡片组件
const NFTCard = ({ id }) => {
  const [nft, setNft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchNFT = async () => {
      try {
        // 模拟API请求
        const response = await fetch(`/api/nfts/${id}`);
        const data = await response.json();
        setNft(data);
      } catch (error) {
        console.error('获取NFT失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNFT();
  }, [id]);
  
  if (isLoading) {
    return <NFTCardSkeleton />;
  }
  
  return (
    <div className="nft-card">
      <img src={nft.image} alt={nft.name} className="nft-image" />
      <div className="nft-info">
        <h3 className="nft-title">{nft.name}</h3>
        <p className="nft-price">{nft.price} ETH</p>
        <button className="nft-buy-button">购买</button>
      </div>
    </div>
  );
};
```

### 无障碍性

1. **语义化HTML**

使用语义化HTML标签，提高页面的可访问性。

```jsx
// 不推荐
<div className="header">
  <div className="title">页面标题</div>
  <div className="nav">
    <div className="nav-item">首页</div>
    <div className="nav-item">关于</div>
  </div>
</div>

// 推荐
<header>
  <h1>页面标题</h1>
  <nav>
    <ul>
      <li><a href="/">首页</a></li>
      <li><a href="/about">关于</a></li>
    </ul>
  </nav>
</header>
```

2. **ARIA属性**

使用ARIA属性增强组件的可访问性。

```jsx
import React, { useState } from 'react';

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="accordion">
      <button
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="accordion-content"
      >
        {title}
        <span className="accordion-icon">{isOpen ? '▲' : '▼'}</span>
      </button>
      <div
        id="accordion-content"
        className={`accordion-content ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
};
```

3. **键盘导航**

确保组件可以通过键盘导航。

```jsx
import React, { useState, useRef } from 'react';

const Dropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  
  const handleSelect = (option) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const firstOption = dropdownRef.current.querySelector('.dropdown-option');
      if (firstOption) {
        firstOption.focus();
      }
    }
  };
  
  const handleOptionKeyDown = (e, option, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(option);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextOption = dropdownRef.current.querySelector(`.dropdown-option:nth-child(${index + 2})`);
      if (nextOption) {
        nextOption.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        dropdownRef.current.querySelector('.dropdown-button').focus();
      } else {
        const prevOption = dropdownRef.current.querySelector(`.dropdown-option:nth-child(${index})`);
        if (prevOption) {
          prevOption.focus();
        }
      }
    }
  };
  
  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedOption ? selectedOption.label : '请选择'}
      </button>
      
      {isOpen && (
        <ul className="dropdown-menu" role="listbox">
          {options.map((option, index) => (
            <li
              key={option.value}
              className="dropdown-option"
              role="option"
              tabIndex={0}
              aria-selected={selectedOption?.value === option.value}
              onClick={() => handleSelect(option)}
              onKeyDown={(e) => handleOptionKeyDown(e, option, index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 响应式设计

使用媒体查询和弹性布局实现响应式设计。

```css
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

@media (max-width: 1200px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .container {
    grid-template-columns: 1fr;
  }
}
```

## 测试指南

CultureBridge使用Jest和React Testing Library进行单元测试和集成测试。

### 组件测试

```jsx
// src/components/common/Button.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button组件', () => {
  test('渲染按钮文本', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });
  
  test('点击按钮触发onClick事件', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>点击我</Button>);
    
    fireEvent.click(screen.getByText('点击我'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('禁用状态下按钮不可点击', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>点击我</Button>);
    
    fireEvent.click(screen.getByText('点击我'));
    expect(handleClick).not.toHaveBeenCalled();
  });
  
  test('应用不同的变体样式', () => {
    const { rerender } = render(<Button variant="primary">主要按钮</Button>);
    expect(screen.getByText('主要按钮')).toHaveClass('primary');
    
    rerender(<Button variant="secondary">次要按钮</Button>);
    expect(screen.getByText('次要按钮')).toHaveClass('secondary');
  });
});
```

### 钩子测试

```jsx
// src/hooks/useLocalStorage.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import useLocalStorage from './useLocalStorage';

describe('useLocalStorage钩子', () => {
  beforeEach(() => {
    // 清空localStorage
    localStorage.clear();
    
    // 模拟localStorage
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem');
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('初始化时返回默认值', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('defaultValue');
    expect(localStorage.getItem).toHaveBeenCalledWith('testKey');
  });
  
  test('更新值时同时更新localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    act(() => {
      result.current[1]('newValue');
    });
    
    expect(result.current[0]).toBe('newValue');
    expect(localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
  });
  
  test('从localStorage读取已存在的值', () => {
    localStorage.setItem('testKey', JSON.stringify('existingValue'));
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('existingValue');
  });
});
```

## 部署指南

### 生产构建

```bash
npm run build
```

这将在 `build` 目录下生成优化后的生产构建文件。

### 部署到静态托管服务

可以将构建文件部署到任何静态托管服务，如Netlify、Vercel、GitHub Pages等。

#### Netlify部署示例

1. 创建 `netlify.toml` 文件
```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. 将代码推送到GitHub仓库

3. 在Netlify上连接GitHub仓库并部署

### 环境变量配置

在不同环境中使用不同的配置，可以使用环境变量。

1. 创建环境变量文件
```
# .env.development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_NETWORK_ID=5
REACT_APP_NFT_MARKETPLACE_ADDRESS=0x...

# .env.production
REACT_APP_API_URL=https://api.culturebridge.com
REACT_APP_NETWORK_ID=1
REACT_APP_NFT_MARKETPLACE_ADDRESS=0x...
```

2. 在代码中使用环境变量
```jsx
const API_URL = process.env.REACT_APP_API_URL;
const NETWORK_ID = process.env.REACT_APP_NETWORK_ID;
const NFT_MARKETPLACE_ADDRESS = process.env.REACT_APP_NFT_MARKETPLACE_ADDRESS;
```

## 贡献指南

### 代码规范

CultureBridge使用ESLint和Prettier确保代码质量和一致性。

```bash
# 运行代码检查
npm run lint

# 自动修复代码风格问题
npm run lint:fix

# 格式化代码
npm run format
```

### 提交规范

使用约定式提交规范（Conventional Commits）进行代码提交。

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

类型包括：
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码风格更改（不影响代码功能）
- refactor: 代码重构
- perf: 性能优化
- test: 添加或修改测试
- build: 构建系统或外部依赖更改
- ci: CI配置更改
- chore: 其他更改

示例：
```
feat(marketplace): 添加NFT搜索功能

实现了按名称、创建者和属性搜索NFT的功能。

Closes #123
```

### 分支策略

- `main`: 主分支，包含稳定版本的代码
- `develop`: 开发分支，包含最新的开发代码
- `feature/*`: 功能分支，用于开发新功能
- `bugfix/*`: 修复分支，用于修复bug
- `release/*`: 发布分支，用于准备新版本发布

## 常见问题

### 1. 如何处理钱包未安装的情况？

```jsx
const connectWallet = async () => {
  try {
    if (window.ethereum) {
      // 连接钱包的代码
    } else {
      // 提示用户安装钱包
      alert('请安装MetaMask或其他以太坊钱包以使用此功能');
      // 可以提供钱包下载链接
      window.open('https://metamask.io/download.html', '_blank');
    }
  } catch (error) {
    console.error('连接钱包失败:', error);
  }
};
```

### 2. 如何处理网络切换？

```jsx
const switchNetwork = async (chainId) => {
  try {
    if (!window.ethereum) {
      throw new Error('未检测到以太坊钱包');
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // 将chainId转换为十六进制
    const hexChainId = `0x${chainId.toString(16)}`;
    
    try {
      // 尝试切换到指定网络
      await provider.send('wallet_switchEthereumChain', [{ chainId: hexChainId }]);
    } catch (switchError) {
      // 如果网络不存在，则添加网络
      if (switchError.code === 4902) {
        // 网络参数
        const networkParams = {
          chainId: hexChainId,
          chainName: getNetworkName(chainId),
          nativeCurrency: {
            name: getNetworkCurrencyName(chainId),
            symbol: getNetworkCurrencySymbol(chainId),
            decimals: 18
          },
          rpcUrls: [getNetworkRpcUrl(chainId)],
          blockExplorerUrls: [getNetworkExplorerUrl(chainId)]
        };
        
        await provider.send('wallet_addEthereumChain', [networkParams]);
      } else {
        throw switchError;
      }
    }
  } catch (error) {
    console.error('切换网络失败:', error);
    throw error;
  }
};
```

### 3. 如何处理交易等待状态？

```jsx
const purchaseNFT = async (nftId, price) => {
  try {
    setIsLoading(true);
    setTransactionStatus('pending');
    
    const transaction = await contract.purchaseNFT(nftId, {
      value: ethers.utils.parseEther(price)
    });
    
    setTransactionStatus('mining');
    setTransactionHash(transaction.hash);
    
    // 等待交易确认
    const receipt = await transaction.wait();
    
    setTransactionStatus('success');
    return receipt;
  } catch (error) {
    setTransactionStatus('error');
    setTransactionError(error.message);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

// 在UI中显示交易状态
const renderTransactionStatus = () => {
  switch (transactionStatus) {
    case 'pending':
      return <div className="status pending">交易准备中...</div>;
    case 'mining':
      return (
        <div className="status mining">
          <div>交易已提交，等待确认...</div>
          <a
            href={`https://etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            在Etherscan上查看
          </a>
        </div>
      );
    case 'success':
      return <div className="status success">交易成功!</div>;
    case 'error':
      return <div className="status error">交易失败: {transactionError}</div>;
    default:
      return null;
  }
};
```

## 联系与支持

如有任何问题或建议，请通过以下方式联系我们：

- GitHub Issues: [https://github.com/username/CultureBridge-Frontend/issues](https://github.com/username/CultureBridge-Frontend/issues)
- 电子邮件: support@culturebridge.com
- 社区论坛: [https://forum.culturebridge.com](https://forum.culturebridge.com)

## 许可证

CultureBridge前端项目采用MIT许可证。详情请参阅[LICENSE](LICENSE)文件。
