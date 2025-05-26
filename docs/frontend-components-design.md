# CultureBridge 前端组件与页面结构设计

## 1. 概述

本文档详细规划CultureBridge平台的前端组件与页面结构，整合NFT市场、文化通证、身份与声誉系统以及DAO治理等功能模块，确保用户体验的一致性和流畅性。

## 2. 整体架构

### 2.1 技术栈

- **前端框架**：React.js
- **路由管理**：React Router
- **状态管理**：Context API + React Hooks
- **UI组件库**：自定义组件 + Material-UI
- **Web3交互**：ethers.js + web3-react
- **样式管理**：CSS Modules + SCSS
- **响应式设计**：Flexbox + Grid + Media Queries

### 2.2 目录结构

```
src/
  ├── assets/                 # 静态资源
  │   ├── images/             # 图片资源
  │   ├── icons/              # 图标资源
  │   └── fonts/              # 字体资源
  ├── components/             # 组件
  │   ├── common/             # 通用组件
  │   ├── layout/             # 布局组件
  │   ├── blockchain/         # 区块链基础组件
  │   ├── marketplace/        # NFT市场组件
  │   ├── token/              # 文化通证组件
  │   ├── identity/           # 身份与声誉组件
  │   └── dao/                # DAO治理组件
  ├── contracts/              # 合约接口
  │   ├── NFT/                # NFT相关合约
  │   ├── marketplace/        # 市场相关合约
  │   ├── token/              # 通证相关合约
  │   ├── identity/           # 身份相关合约
  │   └── dao/                # DAO相关合约
  ├── context/                # 上下文管理
  │   ├── blockchain/         # 区块链上下文
  │   ├── marketplace/        # 市场上下文
  │   ├── token/              # 通证上下文
  │   ├── identity/           # 身份上下文
  │   └── dao/                # DAO上下文
  ├── hooks/                  # 自定义Hooks
  ├── pages/                  # 页面组件
  │   ├── Home.js             # 首页
  │   ├── NFT/                # NFT相关页面
  │   ├── Marketplace/        # 市场相关页面
  │   ├── Token/              # 通证相关页面
  │   ├── Identity/           # 身份相关页面
  │   └── DAO/                # DAO相关页面
  ├── routes/                 # 路由配置
  ├── services/               # 服务
  │   ├── api.js              # API服务
  │   ├── ipfs.js             # IPFS服务
  │   └── web3.js             # Web3服务
  ├── styles/                 # 样式文件
  │   ├── global.css          # 全局样式
  │   ├── variables.scss      # 样式变量
  │   ├── blockchain.css      # 区块链相关样式
  │   ├── marketplace.css     # 市场相关样式
  │   ├── token.css           # 通证相关样式
  │   ├── identity.css        # 身份相关样式
  │   └── dao.css             # DAO相关样式
  ├── utils/                  # 工具函数
  │   ├── formatters.js       # 格式化工具
  │   ├── validators.js       # 验证工具
  │   └── helpers.js          # 辅助函数
  ├── App.js                  # 应用入口
  ├── index.js                # 渲染入口
  └── config.js               # 配置文件
```

## 3. 核心组件设计

### 3.1 通用组件

#### 3.1.1 布局组件

```jsx
// Layout.js
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
```

#### 3.1.2 导航组件

```jsx
// Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import WalletConnector from '../blockchain/WalletConnector';
import Logo from '../../assets/images/logo.png';

const Header = () => {
  const location = useLocation();
  const { active, account } = useBlockchain();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { title: '首页', path: '/' },
    { title: 'NFT画廊', path: '/gallery' },
    { title: 'NFT市场', path: '/marketplace' },
    { title: '文化通证', path: '/token' },
    { title: '身份系统', path: '/identity' },
    { title: 'DAO治理', path: '/dao' }
  ];
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/">
            <img src={Logo} alt="CultureBridge Logo" className="logo" />
          </Link>
        </div>
        
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="menu-icon"></span>
        </button>
        
        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-list">
            {navItems.map((item, index) => (
              <li key={index} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="wallet-section">
          <WalletConnector />
          
          {active && account && (
            <div className="user-menu">
              <Link to="/profile" className="profile-link">
                <span className="account-display">
                  {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
```

#### 3.1.3 通用UI组件

```jsx
// Button.js
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'primary', 
  size = 'medium', 
  disabled = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${type} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

// Card.js
import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  ...props 
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;

// Modal.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className = '' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-container ${className}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
```

### 3.2 区块链基础组件

#### 3.2.1 钱包连接组件

```jsx
// WalletConnector.js
import React, { useState } from 'react';
import { useBlockchain } from '../../context/blockchain';
import Button from '../common/Button';
import Modal from '../common/Modal';

const WalletConnector = () => {
  const { active, account, activate, deactivate, error, chainId, switchNetwork } = useBlockchain();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const supportedNetworks = [
    { id: 1, name: '以太坊主网' },
    { id: 11155111, name: 'Sepolia测试网' },
    { id: 80001, name: 'Polygon Mumbai' }
  ];
  
  const isNetworkSupported = supportedNetworks.some(network => network.id === chainId);
  
  const handleConnect = async (connector) => {
    try {
      await activate(connector);
      setIsModalOpen(false);
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      deactivate();
    } catch (error) {
      console.error('断开钱包失败:', error);
    }
  };
  
  return (
    <div className="wallet-connector">
      {!active ? (
        <Button 
          onClick={() => setIsModalOpen(true)}
          type="primary"
          size="small"
        >
          连接钱包
        </Button>
      ) : (
        <div className="wallet-info">
          {!isNetworkSupported && (
            <div className="network-warning">
              <span>不支持的网络</span>
              <Button 
                onClick={() => switchNetwork(supportedNetworks[0].id)}
                type="warning"
                size="small"
              >
                切换网络
              </Button>
            </div>
          )}
          
          <Button 
            onClick={handleDisconnect}
            type="secondary"
            size="small"
          >
            断开连接
          </Button>
        </div>
      )}
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="连接钱包"
      >
        <div className="wallet-options">
          <button 
            className="wallet-option metamask"
            onClick={() => handleConnect('injected')}
          >
            <img src="/assets/images/metamask.svg" alt="MetaMask" />
            <span>MetaMask</span>
          </button>
          
          <button 
            className="wallet-option walletconnect"
            onClick={() => handleConnect('walletconnect')}
          >
            <img src="/assets/images/walletconnect.svg" alt="WalletConnect" />
            <span>WalletConnect</span>
          </button>
          
          <button 
            className="wallet-option coinbase"
            onClick={() => handleConnect('coinbasewallet')}
          >
            <img src="/assets/images/coinbase.svg" alt="Coinbase Wallet" />
            <span>Coinbase Wallet</span>
          </button>
        </div>
        
        {error && (
          <div className="wallet-error">
            <p>{error.message || '连接钱包时出错，请重试'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WalletConnector;
```

#### 3.2.2 交易状态组件

```jsx
// TransactionStatus.js
import React from 'react';

const TransactionStatus = ({ 
  status, 
  txHash,
  errorMessage,
  resetStatus
}) => {
  if (!status) return null;
  
  return (
    <div className={`transaction-status status-${status}`}>
      {status === 'pending' && (
        <div className="status-content">
          <div className="spinner"></div>
          <p>交易处理中...</p>
          {txHash && (
            <a 
              href={`https://etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="tx-link"
            >
              查看交易
            </a>
          )}
        </div>
      )}
      
      {status === 'success' && (
        <div className="status-content">
          <div className="success-icon">✓</div>
          <p>交易成功!</p>
          {txHash && (
            <a 
              href={`https://etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="tx-link"
            >
              查看交易
            </a>
          )}
          <button onClick={resetStatus} className="status-close">
            关闭
          </button>
        </div>
      )}
      
      {status === 'error' && (
        <div className="status-content">
          <div className="error-icon">✗</div>
          <p>交易失败</p>
          <p className="error-message">{errorMessage || '发生错误，请重试'}</p>
          <button onClick={resetStatus} className="status-close">
            关闭
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;
```

### 3.3 NFT市场组件

#### 3.3.1 NFT卡片组件

```jsx
// NFTCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';

const NFTCard = ({ 
  nft, 
  isMarketItem = false,
  onAction,
  actionLabel
}) => {
  return (
    <Card className="nft-card">
      <div className="nft-image-container">
        <img 
          src={nft.image || '/assets/images/placeholder.png'} 
          alt={nft.name} 
          className="nft-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/images/placeholder.png';
          }}
        />
      </div>
      
      <div className="nft-info">
        <h3 className="nft-name">{nft.name}</h3>
        
        {nft.creator && (
          <div className="nft-creator">
            <span>创作者:</span>
            <Link to={`/identity/profile/${nft.creator.id}`} className="creator-link">
              {nft.creator.name || nft.creator.address.substring(0, 6) + '...'}
            </Link>
          </div>
        )}
        
        {isMarketItem && nft.price && (
          <div className="nft-price">
            <span>{nft.price} ETH</span>
            {nft.auction && <span className="auction-badge">拍卖</span>}
          </div>
        )}
      </div>
      
      <div className="nft-actions">
        <Link to={isMarketItem ? `/market-item/${nft.contractAddress}/${nft.tokenId}` : `/nft/${nft.tokenId}`} className="view-details-btn">
          查看详情
        </Link>
        
        {onAction && actionLabel && (
          <button onClick={() => onAction(nft)} className="action-btn">
            {actionLabel}
          </button>
        )}
      </div>
    </Card>
  );
};

export default NFTCard;
```

#### 3.3.2 NFT市场列表组件

```jsx
// MarketplaceList.js
import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../../context/marketplace';
import NFTCard from './NFTCard';
import Filters from './Filters';
import Pagination from '../common/Pagination';

const MarketplaceList = () => {
  const { fetchMarketItems, marketItems, loading, error } = useMarketplace();
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'newest',
    priceRange: [0, 100],
    onlyAuctions: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  useEffect(() => {
    fetchMarketItems(filters);
  }, [filters]);
  
  // 应用过滤器
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setCurrentPage(1);
  };
  
  // 计算分页
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = marketItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(marketItems.length / itemsPerPage);
  
  return (
    <div className="marketplace-list">
      <div className="marketplace-header">
        <h2>NFT市场</h2>
        <p>探索和交易独特的文化NFT资产</p>
      </div>
      
      <Filters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : marketItems.length === 0 ? (
        <div className="empty-container">
          <p>没有找到符合条件的NFT</p>
        </div>
      ) : (
        <>
          <div className="nft-grid">
            {currentItems.map((item) => (
              <NFTCard 
                key={`${item.contractAddress}-${item.tokenId}`}
                nft={item}
                isMarketItem={true}
              />
            ))}
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default MarketplaceList;
```

### 3.4 文化通证组件

#### 3.4.1 代币余额组件

```jsx
// TokenBalance.js
import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/token';
import { useBlockchain } from '../../context/blockchain';
import Card from '../common/Card';

const TokenBalance = () => {
  const { active, account } = useBlockchain();
  const { getBalance, tokenSymbol } = useToken();
  
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (!active || !account) return;
      
      try {
        setLoading(true);
        setError('');
        
        const userBalance = await getBalance(account);
        setBalance(userBalance);
      } catch (error) {
        console.error('获取代币余额失败:', error);
        setError('获取代币余额时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
    
    // 设置定时刷新
    const intervalId = setInterval(fetchBalance, 30000); // 每30秒刷新一次
    
    return () => clearInterval(intervalId);
  }, [active, account, getBalance]);
  
  return (
    <Card className="token-balance-card">
      <div className="token-balance-content">
        <div className="token-icon">
          <img src="/assets/images/token-icon.png" alt={tokenSymbol} />
        </div>
        
        <div className="token-info">
          <h3>我的{tokenSymbol}余额</h3>
          
          {!active ? (
            <p className="connect-wallet-message">请连接钱包查看余额</p>
          ) : loading ? (
            <div className="balance-loading">
              <div className="spinner-small"></div>
              <span>加载中...</span>
            </div>
          ) : error ? (
            <p className="balance-error">{error}</p>
          ) : (
            <div className="balance-amount">
              <span className="amount">{balance}</span>
              <span className="symbol">{tokenSymbol}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TokenBalance;
```

#### 3.4.2 代币交易组件

```jsx
// TokenTransfer.js
import React, { useState } from 'react';
import { useToken } from '../../context/token';
import { useBlockchain } from '../../context/blockchain';
import Button from '../common/Button';
import TransactionStatus from '../blockchain/TransactionStatus';

const TokenTransfer = () => {
  const { active, account } = useBlockchain();
  const { transfer, tokenSymbol } = useToken();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!active || !account) {
      setErrorMessage('请先连接钱包');
      return;
    }
    
    if (!recipient || !amount) {
      setErrorMessage('请填写接收地址和金额');
      return;
    }
    
    try {
      setTxStatus('pending');
      setErrorMessage('');
      
      const result = await transfer(recipient, amount);
      
      if (result.success) {
        setTxStatus('success');
        setTxHash(result.transactionHash);
        
        // 重置表单
        setRecipient('');
        setAmount('');
      } else {
        setTxStatus('error');
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error('转账失败:', error);
      setTxStatus('error');
      setErrorMessage(error.message || '转账失败，请重试');
    }
  };
  
  const resetStatus = () => {
    setTxStatus(null);
    setTxHash('');
    setErrorMessage('');
  };
  
  return (
    <div className="token-transfer">
      <h3>转账{tokenSymbol}</h3>
      
      <TransactionStatus 
        status={txStatus}
        txHash={txHash}
        errorMessage={errorMessage}
        resetStatus={resetStatus}
      />
      
      <form onSubmit={handleTransfer} className="transfer-form">
        <div className="form-group">
          <label htmlFor="recipient">接收地址</label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            disabled={txStatus === 'pending'}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">金额</label>
          <div className="amount-input">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              min="0"
              step="any"
              disabled={txStatus === 'pending'}
              required
            />
            <span className="token-symbol">{tokenSymbol}</span>
          </div>
        </div>
        
        <Button
          type="primary"
          fullWidth
          disabled={!active || txStatus === 'pending'}
        >
          {txStatus === 'pending' ? '处理中...' : '转账'}
        </Button>
      </form>
    </div>
  );
};

export default TokenTransfer;
```

### 3.5 身份与声誉组件

#### 3.5.1 身份卡片组件

```jsx
// IdentityCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';

const IdentityCard = ({ identity, showActions = true }) => {
  return (
    <Card className="identity-card">
      <div className="identity-avatar">
        <img 
          src={identity.avatar || '/assets/images/default-avatar.png'} 
          alt={identity.name || '用户'} 
          className="avatar-image"
        />
        
        {identity.verified && (
          <div className="verified-badge" title="已验证身份">✓</div>
        )}
      </div>
      
      <div className="identity-info">
        <h3 className="identity-name">
          {identity.name || `用户 ${identity.address.substring(0, 6)}...`}
        </h3>
        
        <div className="identity-address">
          {`${identity.address.substring(0, 6)}...${identity.address.substring(identity.address.length - 4)}`}
        </div>
        
        <div className="identity-reputation">
          <div className="reputation-score">
            <span className="score-label">声誉分数:</span>
            <span className="score-value">{identity.reputation || 0}</span>
          </div>
          
          <div className="reputation-level">
            <span className="level-label">等级:</span>
            <span className="level-value">{identity.level || '新手'}</span>
          </div>
        </div>
        
        {identity.bio && (
          <p className="identity-bio">{identity.bio}</p>
        )}
      </div>
      
      {showActions && (
        <div className="identity-actions">
          <Link to={`/identity/profile/${identity.id}`} className="view-profile-btn">
            查看资料
          </Link>
        </div>
      )}
    </Card>
  );
};

export default IdentityCard;
```

#### 3.5.2 声誉展示组件

```jsx
// ReputationDisplay.js
import React from 'react';

const ReputationDisplay = ({ 
  reputation, 
  level, 
  badges = [],
  showDetails = false
}) => {
  // 根据声誉值计算进度
  const calculateProgress = (rep) => {
    // 假设每个等级需要100点声誉
    const levelThreshold = 100;
    const currentLevelRep = rep % levelThreshold;
    return (currentLevelRep / levelThreshold) * 100;
  };
  
  return (
    <div className="reputation-display">
      <div className="reputation-header">
        <div className="reputation-score">
          <span className="score-value">{reputation || 0}</span>
          <span className="score-label">声誉分数</span>
        </div>
        
        <div className="reputation-level">
          <span className="level-value">{level || '新手'}</span>
          <span className="level-label">等级</span>
        </div>
      </div>
      
      <div className="reputation-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${calculateProgress(reputation)}%` }}
          ></div>
        </div>
        <div className="progress-text">
          距离下一等级: {calculateProgress(reputation).toFixed(0)}%
        </div>
      </div>
      
      {badges.length > 0 && (
        <div className="reputation-badges">
          <h4>成就徽章</h4>
          <div className="badges-grid">
            {badges.map((badge, index) => (
              <div key={index} className="badge-item" title={badge.description}>
                <img src={badge.icon} alt={badge.name} className="badge-icon" />
                <span className="badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showDetails && (
        <div className="reputation-details">
          <h4>声誉明细</h4>
          <ul className="reputation-list">
            <li className="reputation-item">
              <span className="item-label">创作内容:</span>
              <span className="item-value">+{reputation * 0.4}</span>
            </li>
            <li className="reputation-item">
              <span className="item-label">社区贡献:</span>
              <span className="item-value">+{reputation * 0.3}</span>
            </li>
            <li className="reputation-item">
              <span className="item-label">交易活跃度:</span>
              <span className="item-value">+{reputation * 0.2}</span>
            </li>
            <li className="reputation-item">
              <span className="item-label">身份验证:</span>
              <span className="item-value">+{reputation * 0.1}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReputationDisplay;
```

### 3.6 DAO治理组件

DAO治理组件已在之前的DAO治理机制技术方案中详细设计，包括ProposalList、ProposalDetail、CreateProposalForm、VoteComponent等组件。

## 4. 页面结构设计

### 4.1 首页

```jsx
// Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import NFTCard from '../components/marketplace/NFTCard';
import IdentityCard from '../components/identity/IdentityCard';
import TokenBalance from '../components/token/TokenBalance';
import { useMarketplace } from '../context/marketplace';
import { useIdentity } from '../context/identity';

const Home = () => {
  const { featuredNFTs, loading: nftLoading } = useMarketplace();
  const { featuredIdentities, loading: identityLoading } = useIdentity();
  
  return (
    <Layout>
      <div className="home-page">
        <section className="hero-section">
          <div className="hero-content">
            <h1>CultureBridge</h1>
            <p>基于区块链的跨文化交流平台</p>
            <div className="hero-buttons">
              <Link to="/gallery" className="primary-btn">
                探索NFT画廊
              </Link>
              <Link to="/marketplace" className="secondary-btn">
                进入NFT市场
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/assets/images/hero-image.png" alt="CultureBridge" />
          </div>
        </section>
        
        <section className="features-section">
          <h2>平台特色</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🖼️</div>
              <h3>文化资产NFT</h3>
              <p>将文化内容铸造为NFT，确保数字所有权</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <h3>NFT市场交易</h3>
              <p>买卖独特的文化NFT资产，支持固定价格和拍卖</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🪙</div>
              <h3>文化通证系统</h3>
              <p>基于ERC-20代币的激励机制</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👤</div>
              <h3>去中心化身份</h3>
              <p>创建您的去中心化身份，建立声誉</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🏛️</div>
              <h3>DAO治理</h3>
              <p>参与平台决策，共建社区未来</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3>知识产权保护</h3>
              <p>利用区块链技术保护文化创作者权益</p>
            </div>
          </div>
        </section>
        
        <section className="featured-nfts-section">
          <div className="section-header">
            <h2>精选NFT</h2>
            <Link to="/marketplace" className="view-all-link">
              查看全部
            </Link>
          </div>
          
          <div className="featured-nfts-grid">
            {nftLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>加载中...</p>
              </div>
            ) : featuredNFTs && featuredNFTs.length > 0 ? (
              featuredNFTs.slice(0, 4).map((nft) => (
                <NFTCard 
                  key={`${nft.contractAddress}-${nft.tokenId}`}
                  nft={nft}
                  isMarketItem={true}
                />
              ))
            ) : (
              <div className="empty-container">
                <p>暂无精选NFT</p>
              </div>
            )}
          </div>
        </section>
        
        <section className="featured-creators-section">
          <div className="section-header">
            <h2>活跃创作者</h2>
            <Link to="/identity/creators" className="view-all-link">
              查看全部
            </Link>
          </div>
          
          <div className="featured-creators-grid">
            {identityLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>加载中...</p>
              </div>
            ) : featuredIdentities && featuredIdentities.length > 0 ? (
              featuredIdentities.slice(0, 4).map((identity) => (
                <IdentityCard 
                  key={identity.id}
                  identity={identity}
                />
              ))
            ) : (
              <div className="empty-container">
                <p>暂无活跃创作者</p>
              </div>
            )}
          </div>
        </section>
        
        <section className="token-section">
          <div className="section-header">
            <h2>文化通证</h2>
            <Link to="/token" className="view-all-link">
              了解更多
            </Link>
          </div>
          
          <div className="token-content">
            <div className="token-info">
              <h3>CULT代币</h3>
              <p>CULT是CultureBridge平台的原生代币，用于激励创作者、参与治理和获取平台服务。</p>
              <ul className="token-benefits">
                <li>创作奖励</li>
                <li>交易手续费折扣</li>
                <li>DAO投票权</li>
                <li>质押收益</li>
                <li>独家内容访问</li>
              </ul>
              <Link to="/token/staking" className="token-action-btn">
                开始质押
              </Link>
            </div>
            
            <div className="token-balance-container">
              <TokenBalance />
            </div>
          </div>
        </section>
        
        <section className="dao-section">
          <div className="section-header">
            <h2>DAO治理</h2>
            <Link to="/dao" className="view-all-link">
              参与治理
            </Link>
          </div>
          
          <div className="dao-content">
            <div className="dao-info">
              <h3>社区自治</h3>
              <p>CultureBridge DAO允许代币持有者参与平台决策，共同塑造平台未来。</p>
              <ul className="dao-features">
                <li>提案投票</li>
                <li>平台参数调整</li>
                <li>资金分配</li>
                <li>功能升级</li>
              </ul>
            </div>
            
            <div className="dao-stats">
              <div className="stat-item">
                <span className="stat-value">12</span>
                <span className="stat-label">活跃提案</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">1,245</span>
                <span className="stat-label">投票人数</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">45%</span>
                <span className="stat-label">参与率</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
```

### 4.2 NFT市场页面

```jsx
// MarketplacePage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import MarketplaceList from '../components/marketplace/MarketplaceList';
import Button from '../components/common/Button';
import { useBlockchain } from '../context/blockchain';

const MarketplacePage = () => {
  const { active } = useBlockchain();
  const [activeTab, setActiveTab] = useState('all');
  
  return (
    <Layout>
      <div className="marketplace-page">
        <div className="marketplace-header">
          <div className="header-content">
            <h1>NFT市场</h1>
            <p>探索和交易独特的文化NFT资产</p>
          </div>
          
          <div className="header-actions">
            {active ? (
              <div className="action-buttons">
                <Link to="/list-nft">
                  <Button type="primary">出售NFT</Button>
                </Link>
                <Link to="/my-listings">
                  <Button type="secondary">我的上架</Button>
                </Link>
                <Link to="/my-purchases">
                  <Button type="secondary">我的购买</Button>
                </Link>
              </div>
            ) : (
              <p className="connect-wallet-message">请连接钱包以出售或管理NFT</p>
            )}
          </div>
        </div>
        
        <div className="marketplace-tabs">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            全部
          </button>
          <button 
            className={`tab-button ${activeTab === 'art' ? 'active' : ''}`}
            onClick={() => setActiveTab('art')}
          >
            艺术
          </button>
          <button 
            className={`tab-button ${activeTab === 'music' ? 'active' : ''}`}
            onClick={() => setActiveTab('music')}
          >
            音乐
          </button>
          <button 
            className={`tab-button ${activeTab === 'literature' ? 'active' : ''}`}
            onClick={() => setActiveTab('literature')}
          >
            文学
          </button>
          <button 
            className={`tab-button ${activeTab === 'photography' ? 'active' : ''}`}
            onClick={() => setActiveTab('photography')}
          >
            摄影
          </button>
          <button 
            className={`tab-button ${activeTab === 'auction' ? 'active' : ''}`}
            onClick={() => setActiveTab('auction')}
          >
            拍卖
          </button>
        </div>
        
        <MarketplaceList category={activeTab} />
      </div>
    </Layout>
  );
};

export default MarketplacePage;
```

### 4.3 文化通证页面

```jsx
// TokenPage.js
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import TokenBalance from '../components/token/TokenBalance';
import TokenTransfer from '../components/token/TokenTransfer';
import TokenStaking from '../components/token/TokenStaking';
import RewardCenter from '../components/token/RewardCenter';
import { useToken } from '../context/token';
import { useBlockchain } from '../context/blockchain';

const TokenPage = () => {
  const { active } = useBlockchain();
  const { tokenSymbol, tokenName } = useToken();
  const [activeTab, setActiveTab] = useState('wallet');
  
  return (
    <Layout>
      <div className="token-page">
        <div className="token-header">
          <div className="header-content">
            <h1>{tokenName} ({tokenSymbol})</h1>
            <p>CultureBridge平台的原生代币</p>
          </div>
        </div>
        
        <div className="token-tabs">
          <button 
            className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            钱包
          </button>
          <button 
            className={`tab-button ${activeTab === 'staking' ? 'active' : ''}`}
            onClick={() => setActiveTab('staking')}
          >
            质押
          </button>
          <button 
            className={`tab-button ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            奖励
          </button>
          <button 
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            代币信息
          </button>
        </div>
        
        <div className="token-content">
          {activeTab === 'wallet' && (
            <div className="wallet-tab">
              <div className="balance-section">
                <TokenBalance />
              </div>
              
              <div className="transfer-section">
                <TokenTransfer />
              </div>
              
              <div className="transaction-history">
                <h3>交易历史</h3>
                {!active ? (
                  <p className="connect-wallet-message">请连接钱包查看交易历史</p>
                ) : (
                  <div className="history-list">
                    {/* 交易历史列表 */}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'staking' && (
            <TokenStaking />
          )}
          
          {activeTab === 'rewards' && (
            <RewardCenter />
          )}
          
          {activeTab === 'info' && (
            <div className="token-info-tab">
              <div className="info-card">
                <h3>关于{tokenName}</h3>
                <p>{tokenName} ({tokenSymbol})是CultureBridge平台的原生代币，基于ERC-20标准。它用于激励创作者、参与治理和获取平台服务。</p>
                
                <div className="token-metrics">
                  <div className="metric-item">
                    <span className="metric-label">总供应量:</span>
                    <span className="metric-value">100,000,000 {tokenSymbol}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">流通供应量:</span>
                    <span className="metric-value">25,000,000 {tokenSymbol}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">合约地址:</span>
                    <span className="metric-value address">0x1234...5678</span>
                  </div>
                </div>
                
                <h3>代币分配</h3>
                <div className="token-allocation">
                  <div className="allocation-item">
                    <div className="allocation-bar" style={{ width: '30%' }}></div>
                    <div className="allocation-info">
                      <span className="allocation-label">社区奖励:</span>
                      <span className="allocation-value">30%</span>
                    </div>
                  </div>
                  <div className="allocation-item">
                    <div className="allocation-bar" style={{ width: '25%' }}></div>
                    <div className="allocation-info">
                      <span className="allocation-label">团队与顾问:</span>
                      <span className="allocation-value">25%</span>
                    </div>
                  </div>
                  <div className="allocation-item">
                    <div className="allocation-bar" style={{ width: '20%' }}></div>
                    <div className="allocation-info">
                      <span className="allocation-label">生态系统发展:</span>
                      <span className="allocation-value">20%</span>
                    </div>
                  </div>
                  <div className="allocation-item">
                    <div className="allocation-bar" style={{ width: '15%' }}></div>
                    <div className="allocation-info">
                      <span className="allocation-label">流动性提供:</span>
                      <span className="allocation-value">15%</span>
                    </div>
                  </div>
                  <div className="allocation-item">
                    <div className="allocation-bar" style={{ width: '10%' }}></div>
                    <div className="allocation-info">
                      <span className="allocation-label">战略合作伙伴:</span>
                      <span className="allocation-value">10%</span>
                    </div>
                  </div>
                </div>
                
                <h3>代币用途</h3>
                <ul className="token-utilities">
                  <li>创作奖励 - 创作者发布内容获得代币奖励</li>
                  <li>交易手续费折扣 - 持有代币可享受交易手续费折扣</li>
                  <li>DAO投票权 - 代币持有者可参与平台治理决策</li>
                  <li>质押收益 - 质押代币获得额外收益</li>
                  <li>独家内容访问 - 持有一定数量代币可访问独家内容</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TokenPage;
```

### 4.4 身份与声誉页面

```jsx
// IdentityProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ReputationDisplay from '../components/identity/ReputationDisplay';
import NFTCard from '../components/marketplace/NFTCard';
import Button from '../components/common/Button';
import { useIdentity } from '../context/identity';
import { useBlockchain } from '../context/blockchain';

const IdentityProfilePage = () => {
  const { identityId } = useParams();
  const { active, account } = useBlockchain();
  const { 
    getIdentity, 
    getUserNFTs, 
    isCurrentUser,
    loading, 
    error 
  } = useIdentity();
  
  const [identity, setIdentity] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [activeTab, setActiveTab] = useState('nfts');
  
  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        // 如果没有指定identityId，则获取当前用户的身份
        const id = identityId || (active && account ? account : null);
        
        if (!id) return;
        
        const identityData = await getIdentity(id);
        setIdentity(identityData);
        
        const nfts = await getUserNFTs(id);
        setUserNFTs(nfts);
      } catch (error) {
        console.error('获取身份信息失败:', error);
      }
    };
    
    fetchIdentity();
  }, [identityId, active, account, getIdentity, getUserNFTs]);
  
  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }
  
  if (!identity && !loading) {
    return (
      <Layout>
        <div className="identity-not-found">
          <h2>未找到身份信息</h2>
          {!active && (
            <p>请连接钱包查看您的身份信息</p>
          )}
          {active && !identityId && (
            <div className="create-identity-section">
              <p>您还没有创建身份</p>
              <Link to="/identity/create">
                <Button type="primary">创建身份</Button>
              </Link>
            </div>
          )}
        </div>
      </Layout>
    );
  }
  
  const isOwner = isCurrentUser(identity?.address);
  
  return (
    <Layout>
      <div className="identity-profile-page">
        <div className="profile-header">
          <div className="profile-avatar">
            <img 
              src={identity.avatar || '/assets/images/default-avatar.png'} 
              alt={identity.name || '用户'} 
              className="avatar-image"
            />
            
            {identity.verified && (
              <div className="verified-badge" title="已验证身份">✓</div>
            )}
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">
              {identity.name || `用户 ${identity.address.substring(0, 6)}...`}
            </h1>
            
            <div className="profile-address">
              {identity.address}
            </div>
            
            {identity.bio && (
              <p className="profile-bio">{identity.bio}</p>
            )}
            
            {isOwner && (
              <div className="profile-actions">
                <Link to="/identity/edit">
                  <Button type="secondary">编辑资料</Button>
                </Link>
                {!identity.verified && (
                  <Link to="/identity/verify">
                    <Button type="primary">验证身份</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-reputation">
          <ReputationDisplay 
            reputation={identity.reputation} 
            level={identity.level}
            badges={identity.badges}
            showDetails={isOwner}
          />
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'nfts' ? 'active' : ''}`}
            onClick={() => setActiveTab('nfts')}
          >
            NFT收藏 ({userNFTs.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            创作的NFT
          </button>
          <button 
            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            活动记录
          </button>
          {isOwner && (
            <button 
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              设置
            </button>
          )}
        </div>
        
        <div className="profile-content">
          {activeTab === 'nfts' && (
            <div className="nfts-tab">
              {userNFTs.length === 0 ? (
                <div className="empty-container">
                  <p>暂无NFT收藏</p>
                </div>
              ) : (
                <div className="nft-grid">
                  {userNFTs.map((nft) => (
                    <NFTCard 
                      key={`${nft.contractAddress}-${nft.tokenId}`}
                      nft={nft}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'created' && (
            <div className="created-tab">
              {/* 创作的NFT内容 */}
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="activity-tab">
              {/* 活动记录内容 */}
            </div>
          )}
          
          {activeTab === 'settings' && isOwner && (
            <div className="settings-tab">
              {/* 设置内容 */}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default IdentityProfilePage;
```

### 4.5 DAO治理页面

DAO治理页面已在之前的DAO治理机制技术方案中详细设计，包括ProposalList、ProposalDetail、CreateProposalForm等页面。

## 5. 路由设计

```jsx
// routes/index.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 页面组件
import Home from '../pages/Home';
import NFTGallery from '../pages/NFT/NFTGallery';
import NFTDetail from '../pages/NFT/NFTDetail';
import NFTMinter from '../pages/NFT/NFTMinter';
import MarketplacePage from '../pages/Marketplace/MarketplacePage';
import NFTMarketDetail from '../pages/Marketplace/NFTMarketDetail';
import NFTListingForm from '../pages/Marketplace/NFTListingForm';
import NFTAuctionForm from '../pages/Marketplace/NFTAuctionForm';
import MyListings from '../pages/Marketplace/MyListings';
import MyPurchases from '../pages/Marketplace/MyPurchases';
import TokenPage from '../pages/Token/TokenPage';
import TokenStakingPage from '../pages/Token/TokenStakingPage';
import RewardCenterPage from '../pages/Token/RewardCenterPage';
import IdentityProfilePage from '../pages/Identity/IdentityProfilePage';
import IdentityCreatorPage from '../pages/Identity/IdentityCreatorPage';
import IdentityEditorPage from '../pages/Identity/IdentityEditorPage';
import IdentityVerifierPage from '../pages/Identity/IdentityVerifierPage';
import ProposalListPage from '../pages/DAO/ProposalListPage';
import ProposalDetailPage from '../pages/DAO/ProposalDetailPage';
import CreateProposalPage from '../pages/DAO/CreateProposalPage';
import NotFound from '../pages/NotFound';

// 上下文提供者
import { BlockchainProvider } from '../context/blockchain';
import { MarketplaceProvider } from '../context/marketplace';
import { TokenProvider } from '../context/token';
import { IdentityProvider } from '../context/identity';
import { DAOProvider } from '../context/dao';

const AppRoutes = () => {
  return (
    <BlockchainProvider>
      <TokenProvider>
        <IdentityProvider>
          <MarketplaceProvider>
            <DAOProvider>
              <Routes>
                {/* 首页 */}
                <Route path="/" element={<Home />} />
                
                {/* NFT相关路由 */}
                <Route path="/gallery" element={<NFTGallery />} />
                <Route path="/nft/:tokenId" element={<NFTDetail />} />
                <Route path="/mint" element={<NFTMinter />} />
                
                {/* 市场相关路由 */}
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/market-item/:contractAddress/:tokenId" element={<NFTMarketDetail />} />
                <Route path="/list-nft" element={<NFTListingForm />} />
                <Route path="/list-auction" element={<NFTAuctionForm />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/my-purchases" element={<MyPurchases />} />
                
                {/* 通证相关路由 */}
                <Route path="/token" element={<TokenPage />} />
                <Route path="/token/staking" element={<TokenStakingPage />} />
                <Route path="/token/rewards" element={<RewardCenterPage />} />
                
                {/* 身份相关路由 */}
                <Route path="/identity/profile" element={<IdentityProfilePage />} />
                <Route path="/identity/profile/:identityId" element={<IdentityProfilePage />} />
                <Route path="/identity/create" element={<IdentityCreatorPage />} />
                <Route path="/identity/edit" element={<IdentityEditorPage />} />
                <Route path="/identity/verify" element={<IdentityVerifierPage />} />
                
                {/* DAO相关路由 */}
                <Route path="/dao" element={<ProposalListPage />} />
                <Route path="/dao/proposal/:proposalId" element={<ProposalDetailPage />} />
                <Route path="/dao/create-proposal" element={<CreateProposalPage />} />
                
                {/* 404页面 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DAOProvider>
          </MarketplaceProvider>
        </IdentityProvider>
      </TokenProvider>
    </BlockchainProvider>
  );
};

export default AppRoutes;
```

## 6. 响应式设计

为确保在不同设备上的良好体验，我们将采用以下响应式设计策略：

### 6.1 断点设置

```scss
// variables.scss
$breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

@mixin media-breakpoint-up($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  } @else {
    @media (min-width: $breakpoint) {
      @content;
    }
  }
}

@mixin media-breakpoint-down($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (max-width: map-get($breakpoints, $breakpoint) - 0.02) {
      @content;
    }
  } @else {
    @media (max-width: $breakpoint - 0.02) {
      @content;
    }
  }
}
```

### 6.2 响应式布局

```css
/* 响应式网格布局 */
.nft-grid, .featured-nfts-grid, .featured-creators-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
}

@media (min-width: 576px) {
  .nft-grid, .featured-nfts-grid, .featured-creators-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .nft-grid, .featured-nfts-grid, .featured-creators-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 992px) {
  .nft-grid, .featured-nfts-grid, .featured-creators-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 响应式导航 */
.header {
  padding: 15px;
}

.main-nav {
  display: flex;
}

.mobile-menu-toggle {
  display: none;
}

@media (max-width: 768px) {
  .main-nav {
    display: none;
    position: absolute;
    top: 70px;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }
  
  .main-nav.mobile-open {
    display: block;
  }
  
  .nav-list {
    flex-direction: column;
    padding: 0;
  }
  
  .nav-item {
    width: 100%;
    text-align: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
}

/* 响应式表单 */
.form-group {
  margin-bottom: 20px;
}

@media (max-width: 576px) {
  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
  }
  
  .action-fields {
    flex-direction: column;
  }
  
  .field {
    width: 100%;
    margin-bottom: 10px;
  }
}
```

## 7. 数据流与状态管理方案

### 7.1 上下文设计

#### 7.1.1 区块链上下文

```jsx
// blockchain/BlockchainContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { ethers } from 'ethers';

// 创建区块链上下文
export const BlockchainContext = createContext({
  active: false,
  account: null,
  library: null,
  chainId: null,
  error: null,
  activate: () => {},
  deactivate: () => {},
  switchNetwork: () => {}
});

// 支持的链ID
const supportedChainIds = [1, 11155111, 80001]; // 以太坊主网, Sepolia测试网, Polygon Mumbai

// 连接器配置
const injected = new InjectedConnector({ supportedChainIds });

const walletconnect = new WalletConnectConnector({
  rpc: {
    1: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    11155111: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    80001: 'https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY'
  },
  qrcode: true,
  pollingInterval: 12000
});

// 区块链上下文提供者组件
export const BlockchainProvider = ({ children }) => {
  const web3React = useWeb3React();
  const { 
    active, 
    account, 
    library, 
    chainId, 
    error, 
    activate, 
    deactivate 
  } = web3React;
  
  // 自动连接钱包
  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          console.log('自动连接失败');
        });
      }
    });
  }, [activate]);
  
  // 切换网络
  const switchNetwork = async (targetChainId) => {
    if (!library || !library.provider || !library.provider.request) {
      console.error('不支持的提供者');
      return;
    }
    
    try {
      await library.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      });
    } catch (error) {
      console.error('切换网络失败:', error);
      
      // 如果链不存在，尝试添加链
      if (error.code === 4902) {
        try {
          const networkParams = getNetworkParams(targetChainId);
          
          if (networkParams) {
            await library.provider.request({
              method: 'wallet_addEthereumChain',
              params: [networkParams]
            });
          }
        } catch (addError) {
          console.error('添加网络失败:', addError);
        }
      }
    }
  };
  
  // 获取网络参数
  const getNetworkParams = (chainId) => {
    switch (chainId) {
      case 1:
        return {
          chainId: '0x1',
          chainName: 'Ethereum Mainnet',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
          blockExplorerUrls: ['https://etherscan.io']
        };
      case 11155111:
        return {
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        };
      case 80001:
        return {
          chainId: '0x13881',
          chainName: 'Polygon Mumbai',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
          },
          rpcUrls: ['https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY'],
          blockExplorerUrls: ['https://mumbai.polygonscan.com']
        };
      default:
        return null;
    }
  };
  
  // 上下文值
  const contextValue = {
    active,
    account,
    library,
    chainId,
    error,
    activate: async (connector) => {
      try {
        if (connector === 'injected') {
          await activate(injected);
        } else if (connector === 'walletconnect') {
          await activate(walletconnect);
        }
      } catch (error) {
        console.error('激活连接器失败:', error);
        throw error;
      }
    },
    deactivate,
    switchNetwork
  };
  
  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
};

// 自定义Hook，方便在组件中使用区块链上下文
export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain必须在BlockchainProvider内部使用');
  }
  return context;
};

// Web3React提供者包装
export const Web3Provider = ({ children }) => {
  const getLibrary = (provider) => {
    const library = new ethers.providers.Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
  };
  
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <BlockchainProvider>
        {children}
      </BlockchainProvider>
    </Web3ReactProvider>
  );
};
```

#### 7.1.2 市场上下文

```jsx
// marketplace/MarketplaceContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useBlockchain } from '../blockchain';
import { getMarketplaceContract, getSignedMarketplaceContract } from '../../contracts/marketplace/Marketplace';
import { getNFTContract, getSignedNFTContract } from '../../contracts/NFT/CultureNFT';

// 创建市场上下文
export const MarketplaceContext = createContext({
  marketItems: [],
  featuredNFTs: [],
  loading: false,
  error: null,
  fetchMarketItems: () => {},
  fetchItemDetails: () => {},
  listItem: () => {},
  createAuction: () => {},
  buyItem: () => {},
  placeBid: () => {},
  cancelListing: () => {},
  fetchMyListings: () => {},
  fetchMyPurchases: () => {}
});

// 市场上下文提供者组件
export const MarketplaceProvider = ({ children }) => {
  const { active, account, library, chainId } = useBlockchain();
  
  const [marketItems, setMarketItems] = useState([]);
  const [featuredNFTs, setFeaturedNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 获取市场项目
  const fetchMarketItems = async (filters = {}) => {
    if (!active || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const contract = getMarketplaceContract(library, chainId);
      
      // 获取所有市场项目
      const items = await contract.fetchMarketItems();
      
      // 处理项目数据
      const processedItems = await Promise.all(items.map(async (item) => {
        const nftContract = getNFTContract(library, item.nftContract);
        const tokenURI = await nftContract.tokenURI(item.tokenId);
        
        // 获取元数据
        let metadata = {};
        try {
          const response = await fetch(tokenURI);
          metadata = await response.json();
        } catch (error) {
          console.error('获取元数据失败:', error);
        }
        
        return {
          itemId: item.itemId.toString(),
          seller: item.seller,
          owner: item.owner,
          contractAddress: item.nftContract,
          tokenId: item.tokenId.toString(),
          price: ethers.utils.formatEther(item.price),
          sold: item.sold,
          auction: item.auction,
          auctionEndTime: item.auctionEndTime ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
          highestBid: item.highestBid ? ethers.utils.formatEther(item.highestBid) : null,
          highestBidder: item.highestBidder || null,
          name: metadata.name || `NFT #${item.tokenId}`,
          description: metadata.description || '',
          image: metadata.image || '',
          attributes: metadata.attributes || [],
          creator: metadata.creator || { address: item.seller }
        };
      }));
      
      // 应用过滤器
      let filteredItems = processedItems;
      
      if (filters.category && filters.category !== 'all') {
        filteredItems = filteredItems.filter(item => {
          const category = item.attributes.find(attr => attr.trait_type === 'Category')?.value;
          return category && category.toLowerCase() === filters.category.toLowerCase();
        });
      }
      
      if (filters.onlyAuctions) {
        filteredItems = filteredItems.filter(item => item.auction);
      }
      
      if (filters.priceRange && filters.priceRange.length === 2) {
        filteredItems = filteredItems.filter(item => {
          const price = parseFloat(item.price);
          return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });
      }
      
      // 排序
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'newest':
            // 假设itemId越大，创建时间越新
            filteredItems.sort((a, b) => parseInt(b.itemId) - parseInt(a.itemId));
            break;
          case 'oldest':
            filteredItems.sort((a, b) => parseInt(a.itemId) - parseInt(b.itemId));
            break;
          case 'priceAsc':
            filteredItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
          case 'priceDesc':
            filteredItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
          default:
            break;
        }
      }
      
      setMarketItems(filteredItems);
      
      // 设置精选NFT（例如，取前8个）
      setFeaturedNFTs(processedItems.slice(0, 8));
    } catch (error) {
      console.error('获取市场项目失败:', error);
      setError('获取市场项目时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取项目详情
  const fetchItemDetails = async (contractAddress, tokenId) => {
    if (!active || !library || !chainId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const contract = getMarketplaceContract(library, chainId);
      
      // 获取市场项目
      const item = await contract.fetchMarketItemByToken(contractAddress, tokenId);
      
      if (!item || item.itemId.toString() === '0') {
        throw new Error('项目不存在');
      }
      
      const nftContract = getNFTContract(library, contractAddress);
      const tokenURI = await nftContract.tokenURI(tokenId);
      
      // 获取元数据
      let metadata = {};
      try {
        const response = await fetch(tokenURI);
        metadata = await response.json();
      } catch (error) {
        console.error('获取元数据失败:', error);
      }
      
      // 获取拍卖出价历史（如果是拍卖）
      let bidHistory = [];
      if (item.auction) {
        const bids = await contract.fetchBidHistory(item.itemId);
        bidHistory = bids.map(bid => ({
          bidder: bid.bidder,
          amount: ethers.utils.formatEther(bid.amount),
          timestamp: new Date(bid.timestamp.toNumber() * 1000)
        }));
      }
      
      return {
        itemId: item.itemId.toString(),
        seller: item.seller,
        owner: item.owner,
        contractAddress,
        tokenId: tokenId.toString(),
        price: ethers.utils.formatEther(item.price),
        sold: item.sold,
        auction: item.auction,
        auctionEndTime: item.auctionEndTime ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
        highestBid: item.highestBid ? ethers.utils.formatEther(item.highestBid) : null,
        highestBidder: item.highestBidder || null,
        bidHistory,
        name: metadata.name || `NFT #${tokenId}`,
        description: metadata.description || '',
        image: metadata.image || '',
        attributes: metadata.attributes || [],
        creator: metadata.creator || { address: item.seller }
      };
    } catch (error) {
      console.error('获取项目详情失败:', error);
      setError('获取项目详情时出错，请稍后再试');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // 上架NFT
  const listItem = async (contractAddress, tokenId, price) => {
    if (!active || !account || !library || !chainId) {
      throw new Error('请先连接钱包');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 检查是否已授权
      const nftContract = getSignedNFTContract(library, contractAddress);
      const marketplaceAddress = getMarketplaceContract(library, chainId).address;
      
      const isApproved = await nftContract.isApprovedForAll(account, marketplaceAddress);
      
      if (!isApproved) {
        const approveTx = await nftContract.setApprovalForAll(marketplaceAddress, true);
        await approveTx.wait();
      }
      
      // 上架NFT
      const marketplaceContract = getSignedMarketplaceContract(library, chainId);
      const priceInWei = ethers.utils.parseEther(price.toString());
      
      const tx = await marketplaceContract.createMarketItem(
        contractAddress,
        tokenId,
        priceInWei,
        false, // 不是拍卖
        0 // 拍卖结束时间为0
      );
      
      const receipt = await tx.wait();
      
      // 从事件中获取itemId
      const event = receipt.events.find(e => e.event === 'MarketItemCreated');
      const itemId = event.args.itemId.toString();
      
      return {
        success: true,
        itemId,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('上架NFT失败:', error);
      setError('上架NFT时出错，请稍后再试');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // 创建拍卖
  const createAuction = async (contractAddress, tokenId, startPrice, duration) => {
    if (!active || !account || !library || !chainId) {
      throw new Error('请先连接钱包');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 检查是否已授权
      const nftContract = getSignedNFTContract(library, contractAddress);
      const marketplaceAddress = getMarketplaceContract(library, chainId).address;
      
      const isApproved = await nftContract.isApprovedForAll(account, marketplaceAddress);
      
      if (!isApproved) {
        const approveTx = await nftContract.setApprovalForAll(marketplaceAddress, true);
        await approveTx.wait();
      }
      
      // 创建拍卖
      const marketplaceContract = getSignedMarketplaceContract(library, chainId);
      const priceInWei = ethers.utils.parseEther(startPrice.toString());
      
      // 计算拍卖结束时间（当前时间 + 持续时间（小时））
      const endTime = Math.floor(Date.now() / 1000) + (duration * 3600);
      
      const tx = await marketplaceContract.createMarketItem(
        contractAddress,
        tokenId,
        priceInWei,
        true, // 是拍卖
        endTime
      );
      
      const receipt = await tx.wait();
      
      // 从事件中获取itemId
      const event = receipt.events.find(e => e.event === 'MarketItemCreated');
      const itemId = event.args.itemId.toString();
      
      return {
        success: true,
        itemId,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('创建拍卖失败:', error);
      setError('创建拍卖时出错，请稍后再试');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // 购买NFT
  const buyItem = async (itemId, price) => {
    if (!active || !account || !library || !chainId) {
      throw new Error('请先连接钱包');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const marketplaceContract = getSignedMarketplaceContract(library, chainId);
      const priceInWei = ethers.utils.parseEther(price.toString());
      
      const tx = await marketplaceContract.createMarketSale(itemId, {
        value: priceInWei
      });
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('购买NFT失败:', error);
      setError('购买NFT时出错，请稍后再试');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // 出价
  const placeBid = async (itemId, bidAmount) => {
    if (!active || !account || !library || !chainId) {
      throw new Error('请先连接钱包');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const marketplaceContract = getSignedMarketplaceContract(library, chainId);
      const bidAmountInWei = ethers.utils.parseEther(bidAmount.toString());
      
      const tx = await marketplaceContract.placeBid(itemId, {
        value: bidAmountInWei
      });
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('出价失败:', error);
      setError('出价时出错，请稍后再试');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // 取消上架
  const cancelListing = async (itemId) => {
    if (!active || !account || !library || !chainId) {
      throw new Error('请先连接钱包');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const marketplaceContract = getSignedMarketplaceContract(library, chainId);
      
      const tx = await marketplaceContract.cancelMarketItem(itemId);
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('取消上架失败:', error);
      setError('取消上架时出错，请稍后再试');
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // 获取我的上架
  const fetchMyListings = async () => {
    if (!active || !account || !library || !chainId) return [];
    
    try {
      setLoading(true);
      setError(null);
      
      const contract = getMarketplaceContract(library, chainId);
      
      // 获取我的上架
      const items = await contract.fetchMyListedItems();
      
      // 处理项目数据
      const processedItems = await Promise.all(items.map(async (item) => {
        const nftContract = getNFTContract(library, item.nftContract);
        const tokenURI = await nftContract.tokenURI(item.tokenId);
        
        // 获取元数据
        let metadata = {};
        try {
          const response = await fetch(tokenURI);
          metadata = await response.json();
        } catch (error) {
          console.error('获取元数据失败:', error);
        }
        
        return {
          itemId: item.itemId.toString(),
          seller: item.seller,
          owner: item.owner,
          contractAddress: item.nftContract,
          tokenId: item.tokenId.toString(),
          price: ethers.utils.formatEther(item.price),
          sold: item.sold,
          auction: item.auction,
          auctionEndTime: item.auctionEndTime ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
          highestBid: item.highestBid ? ethers.utils.formatEther(item.highestBid) : null,
          highestBidder: item.highestBidder || null,
          name: metadata.name || `NFT #${item.tokenId}`,
          description: metadata.description || '',
          image: metadata.image || '',
          attributes: metadata.attributes || [],
          creator: metadata.creator || { address: item.seller }
        };
      }));
      
      return processedItems;
    } catch (error) {
      console.error('获取我的上架失败:', error);
      setError('获取我的上架时出错，请稍后再试');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // 获取我的购买
  const fetchMyPurchases = async () => {
    if (!active || !account || !library || !chainId) return [];
    
    try {
      setLoading(true);
      setError(null);
      
      const contract = getMarketplaceContract(library, chainId);
      
      // 获取我的购买
      const items = await contract.fetchMyPurchasedItems();
      
      // 处理项目数据
      const processedItems = await Promise.all(items.map(async (item) => {
        const nftContract = getNFTContract(library, item.nftContract);
        const tokenURI = await nftContract.tokenURI(item.tokenId);
        
        // 获取元数据
        let metadata = {};
        try {
          const response = await fetch(tokenURI);
          metadata = await response.json();
        } catch (error) {
          console.error('获取元数据失败:', error);
        }
        
        return {
          itemId: item.itemId.toString(),
          seller: item.seller,
          owner: item.owner,
          contractAddress: item.nftContract,
          tokenId: item.tokenId.toString(),
          price: ethers.utils.formatEther(item.price),
          sold: item.sold,
          auction: item.auction,
          auctionEndTime: item.auctionEndTime ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
          highestBid: item.highestBid ? ethers.utils.formatEther(item.highestBid) : null,
          highestBidder: item.highestBidder || null,
          name: metadata.name || `NFT #${item.tokenId}`,
          description: metadata.description || '',
          image: metadata.image || '',
          attributes: metadata.attributes || [],
          creator: metadata.creator || { address: item.seller }
        };
      }));
      
      return processedItems;
    } catch (error) {
      console.error('获取我的购买失败:', error);
      setError('获取我的购买时出错，请稍后再试');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    if (active && library && chainId) {
      fetchMarketItems();
    }
  }, [active, library, chainId]);
  
  // 上下文值
  const contextValue = {
    marketItems,
    featuredNFTs,
    loading,
    error,
    fetchMarketItems,
    fetchItemDetails,
    listItem,
    createAuction,
    buyItem,
    placeBid,
    cancelListing,
    fetchMyListings,
    fetchMyPurchases
  };
  
  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
};

// 自定义Hook，方便在组件中使用市场上下文
export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace必须在MarketplaceProvider内部使用');
  }
  return context;
};
```

### 7.2 数据流图

```
用户操作 -> 前端组件 -> 上下文API -> 合约接口 -> 区块链网络
                                  -> 本地状态管理

区块链网络 -> 合约接口 -> 上下文API -> 前端组件 -> 用户界面
```

### 7.3 状态管理策略

1. **全局状态**：使用Context API管理全局状态，如区块链连接状态、用户身份、市场数据等。
2. **组件状态**：使用useState和useReducer管理组件内部状态。
3. **缓存策略**：使用React.memo和useMemo优化渲染性能。
4. **数据持久化**：使用localStorage存储非敏感数据，如用户偏好设置。
5. **事件监听**：监听区块链事件，实时更新状态。

## 8. 总结

本文档详细规划了CultureBridge平台的前端组件与页面结构，整合了NFT市场、文化通证、身份与声誉系统以及DAO治理等功能模块。通过合理的组件设计、路由配置、响应式布局和状态管理策略，确保了用户体验的一致性和流畅性。

前端架构采用了模块化和组件化的设计理念，使用Context API进行状态管理，实现了清晰的数据流和良好的代码组织。响应式设计确保了在不同设备上的良好体验，而统一的UI组件库保证了界面风格的一致性。

后续开发将按照本文档的规划，逐步实现各功能模块，并进行持续的优化和改进，为用户提供高质量的区块链文化交流平台体验。
