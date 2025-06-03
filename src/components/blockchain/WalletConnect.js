import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import '../../styles/wallet.css';

/**
 * 钱包连接组件
 * 提供多种钱包连接选项和网络切换功能
 * 
 * @component
 * @version 2.0.0
 */
const WalletConnect = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 支持的网络
  const supportedNetworks = [
    { id: 1, name: 'Ethereum Mainnet', currency: 'ETH', icon: '🔷' },
    { id: 137, name: 'Polygon Mainnet', currency: 'MATIC', icon: '🟣' },
    { id: 56, name: 'Binance Smart Chain', currency: 'BNB', icon: '🟡' },
    { id: 43114, name: 'Avalanche C-Chain', currency: 'AVAX', icon: '🔺' },
    { id: 42161, name: 'Arbitrum One', currency: 'ETH', icon: '🔵' },
    { id: 10, name: 'Optimism', currency: 'ETH', icon: '🔴' },
    { id: 5, name: 'Goerli Testnet', currency: 'ETH', icon: '🧪' },
    { id: 80001, name: 'Mumbai Testnet', currency: 'MATIC', icon: '🧪' }
  ];
  
  // 支持的钱包
  const supportedWallets = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊' },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵' },
    { id: 'trust', name: 'Trust Wallet', icon: '🔐' },
    { id: 'brave', name: 'Brave Wallet', icon: '🦁' }
  ];
  
  // 获取网络名称
  const getNetworkName = (id) => {
    const network = supportedNetworks.find(net => net.id === id);
    return network ? network.name : `未知网络 (ID: ${id})`;
  };
  
  // 获取网络货币
  const getNetworkCurrency = (id) => {
    const network = supportedNetworks.find(net => net.id === id);
    return network ? network.currency : 'ETH';
  };
  
  // 检查是否支持的网络
  const isSupportedNetwork = (id) => {
    return supportedNetworks.some(net => net.id === id);
  };
  
  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 格式化余额
  const formatBalance = (balance, decimals = 18) => {
    if (!balance) return '0.00';
    return parseFloat(ethers.utils.formatUnits(balance, decimals)).toFixed(4);
  };
  
  // 显示通知
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    // 5秒后自动关闭
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  // 初始化钱包状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        
        // 检查本地存储的连接状态
        const savedWalletType = localStorage.getItem('walletType');
        
        if (savedWalletType) {
          // 尝试恢复连接
          await connectWallet(savedWalletType, true);
        }
      } catch (error) {
        console.error('初始化钱包状态失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, []);
  
  // 监听账户变化
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // 用户断开了连接
        disconnectWallet();
      } else if (accounts[0] !== account) {
        // 用户切换了账户
        setAccount(accounts[0]);
        updateBalance(accounts[0]);
        showNotification('已切换到新账户', 'info');
      }
    };
    
    const handleChainChanged = (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      updateBalance(account);
      
      if (!isSupportedNetwork(newChainId)) {
        showNotification(`已连接到不支持的网络: ${getNetworkName(newChainId)}`, 'warning');
      } else {
        showNotification(`已切换到 ${getNetworkName(newChainId)}`, 'info');
      }
    };
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account]);
  
  // 更新余额
  const updateBalance = async (address) => {
    if (!address) return;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(balance);
    } catch (error) {
      console.error('获取余额失败:', error);
    }
  };
  
  // 连接钱包
  const connectWallet = async (type, isAutoConnect = false) => {
    try {
      setError(null);
      setIsConnecting(true);
      
      if (type === 'metamask') {
        if (!window.ethereum) {
          throw new Error('未检测到MetaMask，请安装MetaMask插件');
        }
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const network = await provider.getNetwork();
        
        setAccount(accounts[0]);
        setChainId(network.chainId);
        setWalletType('metamask');
        
        // 获取余额
        await updateBalance(accounts[0]);
        
        // 保存连接状态
        localStorage.setItem('walletType', 'metamask');
        
        if (!isAutoConnect) {
          showNotification('MetaMask钱包已连接', 'success');
        }
      } else if (type === 'walletconnect') {
        // WalletConnect实现
        showNotification('WalletConnect功能即将推出', 'info');
        throw new Error('WalletConnect功能即将推出');
      } else if (type === 'coinbase') {
        // Coinbase Wallet实现
        showNotification('Coinbase Wallet功能即将推出', 'info');
        throw new Error('Coinbase Wallet功能即将推出');
      } else {
        throw new Error('不支持的钱包类型');
      }
      
      setIsWalletModalOpen(false);
    } catch (error) {
      console.error('连接钱包失败:', error);
      setError(error.message);
      
      if (!isAutoConnect) {
        showNotification(`连接钱包失败: ${error.message}`, 'error');
      }
    } finally {
      setIsConnecting(false);
    }
  };
  
  // 断开钱包连接
  const disconnectWallet = () => {
    setAccount('');
    setChainId(null);
    setBalance(null);
    setWalletType(null);
    
    // 清除本地存储
    localStorage.removeItem('walletType');
    
    showNotification('钱包已断开连接', 'info');
  };
  
  // 切换网络
  const switchNetwork = async (networkId) => {
    try {
      if (!window.ethereum) {
        throw new Error('未检测到MetaMask，请安装MetaMask插件');
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // 网络参数
      const networks = {
        1: {
          chainId: '0x1',
          chainName: 'Ethereum Mainnet',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.infura.io/v3/'],
          blockExplorerUrls: ['https://etherscan.io']
        },
        137: {
          chainId: '0x89',
          chainName: 'Polygon Mainnet',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://polygon-rpc.com/'],
          blockExplorerUrls: ['https://polygonscan.com']
        },
        56: {
          chainId: '0x38',
          chainName: 'Binance Smart Chain',
          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          blockExplorerUrls: ['https://bscscan.com']
        },
        43114: {
          chainId: '0xA86A',
          chainName: 'Avalanche C-Chain',
          nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
          rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
          blockExplorerUrls: ['https://snowtrace.io']
        },
        42161: {
          chainId: '0xA4B1',
          chainName: 'Arbitrum One',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://arb1.arbitrum.io/rpc'],
          blockExplorerUrls: ['https://arbiscan.io']
        },
        10: {
          chainId: '0xA',
          chainName: 'Optimism',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.optimism.io'],
          blockExplorerUrls: ['https://optimistic.etherscan.io']
        },
        5: {
          chainId: '0x5',
          chainName: 'Goerli Testnet',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://goerli.infura.io/v3/'],
          blockExplorerUrls: ['https://goerli.etherscan.io']
        },
        80001: {
          chainId: '0x13881',
          chainName: 'Mumbai Testnet',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
          blockExplorerUrls: ['https://mumbai.polygonscan.com']
        }
      };
      
      const hexChainId = `0x${networkId.toString(16)}`;
      
      try {
        // 尝试切换到已有的网络
        await provider.send('wallet_switchEthereumChain', [{ chainId: hexChainId }]);
      } catch (switchError) {
        // 如果网络不存在，则添加网络
        if (switchError.code === 4902) {
          await provider.send('wallet_addEthereumChain', [networks[networkId]]);
        } else {
          throw switchError;
        }
      }
      
      setIsNetworkModalOpen(false);
    } catch (error) {
      console.error('切换网络失败:', error);
      showNotification(`切换网络失败: ${error.message}`, 'error');
    }
  };
  
  // 复制地址到剪贴板
  const copyAddressToClipboard = () => {
    if (!account) return;
    
    navigator.clipboard.writeText(account)
      .then(() => {
        showNotification('地址已复制到剪贴板', 'success');
      })
      .catch(err => {
        console.error('复制地址失败:', err);
        showNotification('复制地址失败', 'error');
      });
  };
  
  // 渲染钱包选择模态框
  const renderWalletModal = () => {
    return (
      <div className={`wallet-modal ${isWalletModalOpen ? 'open' : ''}`}>
        <div className="wallet-modal-content">
          <div className="wallet-modal-header">
            <h3>选择钱包</h3>
            <button 
              className="close-modal-btn"
              onClick={() => setIsWalletModalOpen(false)}
              aria-label="关闭"
            >
              ×
            </button>
          </div>
          
          <div className="wallet-options">
            {supportedWallets.map(wallet => (
              <button
                key={wallet.id}
                className="wallet-option"
                onClick={() => connectWallet(wallet.id)}
                disabled={isConnecting}
              >
                <span className="wallet-icon">{wallet.icon}</span>
                <span className="wallet-name">{wallet.name}</span>
                {wallet.id !== 'metamask' && <span className="coming-soon">即将推出</span>}
              </button>
            ))}
          </div>
          
          <div className="wallet-modal-footer">
            <p>首次连接钱包? <a href="/wallet-guide" target="_blank" rel="noopener noreferrer">查看指南</a></p>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染网络选择模态框
  const renderNetworkModal = () => {
    return (
      <div className={`network-modal ${isNetworkModalOpen ? 'open' : ''}`}>
        <div className="network-modal-content">
          <div className="network-modal-header">
            <h3>选择网络</h3>
            <button 
              className="close-modal-btn"
              onClick={() => setIsNetworkModalOpen(false)}
              aria-label="关闭"
            >
              ×
            </button>
          </div>
          
          <div className="network-options">
            {supportedNetworks.map(network => (
              <button
                key={network.id}
                className={`network-option ${chainId === network.id ? 'active' : ''}`}
                onClick={() => switchNetwork(network.id)}
              >
                <span className="network-icon">{network.icon}</span>
                <span className="network-name">{network.name}</span>
                <span className="network-currency">{network.currency}</span>
                {chainId === network.id && <span className="current-network">当前</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染骨架屏
  const renderSkeleton = () => {
    return (
      <div className="wallet-container">
        <div className="wallet-header-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>
        
        <div className="wallet-content-skeleton">
          <div className="skeleton-card">
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>
    );
  };
  
  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return renderSkeleton();
  }
  
  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1>钱包连接</h1>
        <p className="subtitle">连接您的钱包以访问CultureBridge的全部功能</p>
      </div>
      
      {/* 错误消息 */}
      {error && (
        <div className="error-message" role="alert">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="dismiss-btn">关闭</button>
        </div>
      )}
      
      {/* 通知消息 */}
      {notification && (
        <div className={`notification ${notification.type}`} role="status">
          <p>{notification.message}</p>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}
      
      <div className="wallet-content">
        {!account ? (
          // 未连接状态
          <div className="wallet-connect-card">
            <div className="connect-illustration">
              <div className="illustration-icon">🔗</div>
            </div>
            
            <h2>连接您的钱包</h2>
            <p>连接钱包以访问NFT市场、DAO治理和身份验证等功能</p>
            
            <button
              className="connect-wallet-btn"
              onClick={() => setIsWalletModalOpen(true)}
              disabled={isConnecting}
            >
              {isConnecting ? '连接中...' : '连接钱包'}
            </button>
            
            <div className="wallet-benefits">
              <div className="benefit-item">
                <div className="benefit-icon">🔒</div>
                <div className="benefit-text">安全连接</div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🌐</div>
                <div className="benefit-text">多链支持</div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">💼</div>
                <div className="benefit-text">多钱包选择</div>
              </div>
            </div>
          </div>
        ) : (
          // 已连接状态
          <div className="wallet-info-card">
            <div className="wallet-type">
              <span className="wallet-icon">
                {walletType === 'metamask' ? '🦊' : 
                 walletType === 'walletconnect' ? '🔗' : 
                 walletType === 'coinbase' ? '🔵' : '💼'}
              </span>
              <span className="wallet-name">
                {walletType === 'metamask' ? 'MetaMask' : 
                 walletType === 'walletconnect' ? 'WalletConnect' : 
                 walletType === 'coinbase' ? 'Coinbase Wallet' : '未知钱包'}
              </span>
            </div>
            
            <div className="wallet-details">
              <div className="wallet-address" onClick={copyAddressToClipboard}>
                <span className="address-value" title={account}>{formatAddress(account)}</span>
                <button className="copy-address-btn" aria-label="复制地址">📋</button>
              </div>
              
              <div className="wallet-network" onClick={() => setIsNetworkModalOpen(true)}>
                <span className="network-icon">
                  {chainId && supportedNetworks.find(net => net.id === chainId)?.icon}
                </span>
                <span className="network-name">
                  {chainId ? getNetworkName(chainId) : '未知网络'}
                </span>
                <button className="change-network-btn" aria-label="切换网络">🔄</button>
              </div>
              
              <div className="wallet-balance">
                <span className="balance-value">
                  {balance ? formatBalance(balance) : '0.00'} {chainId ? getNetworkCurrency(chainId) : 'ETH'}
                </span>
                <button 
                  className="refresh-balance-btn" 
                  onClick={() => updateBalance(account)}
                  aria-label="刷新余额"
                >
                  🔄
                </button>
              </div>
            </div>
            
            <div className="wallet-actions">
              <button
                className="disconnect-wallet-btn"
                onClick={disconnectWallet}
              >
                断开连接
              </button>
              <button
                className="view-transactions-btn"
                onClick={() => navigate('/transactions')}
              >
                查看交易历史
              </button>
            </div>
            
            <div className="wallet-features">
              <div className="feature-item" onClick={() => navigate('/nft-marketplace')}>
                <div className="feature-icon">🖼️</div>
                <div className="feature-text">NFT市场</div>
              </div>
              <div className="feature-item" onClick={() => navigate('/dao')}>
                <div className="feature-icon">🏛️</div>
                <div className="feature-text">DAO治理</div>
              </div>
              <div className="feature-item" onClick={() => navigate('/identity')}>
                <div className="feature-icon">🪪</div>
                <div className="feature-text">身份验证</div>
              </div>
              <div className="feature-item" onClick={() => navigate('/staking')}>
                <div className="feature-icon">📈</div>
                <div className="feature-text">质押</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 安全提示 */}
        <div className="wallet-security-tips">
          <h3>钱包安全提示</h3>
          <ul>
            <li>永远不要分享您的私钥或助记词</li>
            <li>连接前请确认网站URL是否正确</li>
            <li>交易前请仔细检查所有详情</li>
            <li>定期备份您的钱包</li>
          </ul>
        </div>
      </div>
      
      {/* 钱包选择模态框 */}
      {renderWalletModal()}
      
      {/* 网络选择模态框 */}
      {renderNetworkModal()}
      
      {/* 模态框背景遮罩 */}
      {(isWalletModalOpen || isNetworkModalOpen) && (
        <div 
          className="modal-backdrop"
          onClick={() => {
            setIsWalletModalOpen(false);
            setIsNetworkModalOpen(false);
          }}
        ></div>
      )}
    </div>
  );
};

export default WalletConnect;
