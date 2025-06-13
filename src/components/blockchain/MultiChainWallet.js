import React, { useState, useEffect, useContext, createContext } from 'react';
import { ethers } from 'ethers';

// 多链钱包上下文
const MultiChainWalletContext = createContext();

// 支持的网络配置
const SUPPORTED_NETWORKS = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  bsc: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
};

// 多链钱包提供者组件
export const MultiChainWalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState('0');

  // 检查是否已连接钱包
  useEffect(() => {
    checkConnection();
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
  }, []);

  // 检查连接状态
  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const network = await provider.getNetwork();
          
          setAccount(accounts[0]);
          setProvider(provider);
          setSigner(signer);
          setCurrentNetwork(getNetworkInfo(network.chainId));
          
          // 获取余额
          const balance = await provider.getBalance(accounts[0]);
          setBalance(ethers.utils.formatEther(balance));
        }
      } catch (error) {
        console.error('检查连接状态失败:', error);
        setError('检查连接状态失败');
      }
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('请安装MetaMask钱包');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const network = await provider.getNetwork();
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setCurrentNetwork(getNetworkInfo(network.chainId));
        
        // 获取余额
        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(balance));
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      setError('连接钱包失败: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setCurrentNetwork(null);
    setBalance('0');
    setError(null);
  };

  // 切换网络
  const switchNetwork = async (networkKey) => {
    if (!window.ethereum) {
      setError('请安装MetaMask钱包');
      return;
    }

    const network = SUPPORTED_NETWORKS[networkKey];
    if (!network) {
      setError('不支持的网络');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (switchError) {
      // 如果网络不存在，尝试添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
        } catch (addError) {
          console.error('添加网络失败:', addError);
          setError('添加网络失败: ' + addError.message);
        }
      } else {
        console.error('切换网络失败:', switchError);
        setError('切换网络失败: ' + switchError.message);
      }
    }
  };

  // 处理账户变更
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      // 重新获取余额
      if (provider) {
        provider.getBalance(accounts[0]).then(balance => {
          setBalance(ethers.utils.formatEther(balance));
        });
      }
    }
  };

  // 处理网络变更
  const handleChainChanged = (chainId) => {
    setCurrentNetwork(getNetworkInfo(parseInt(chainId, 16)));
    // 重新获取余额
    if (provider && account) {
      provider.getBalance(account).then(balance => {
        setBalance(ethers.utils.formatEther(balance));
      });
    }
  };

  // 获取网络信息
  const getNetworkInfo = (chainId) => {
    const networkMap = {
      1: 'ethereum',
      56: 'bsc',
      137: 'polygon',
    };
    
    const networkKey = networkMap[chainId];
    return networkKey ? SUPPORTED_NETWORKS[networkKey] : null;
  };

  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 获取网络显示名称
  const getNetworkDisplayName = () => {
    if (!currentNetwork) return '未知网络';
    return currentNetwork.chainName;
  };

  // 检查是否为支持的网络
  const isSupportedNetwork = () => {
    if (!currentNetwork) return false;
    return Object.values(SUPPORTED_NETWORKS).some(
      network => network.chainId === currentNetwork.chainId
    );
  };

  const value = {
    // 状态
    account,
    provider,
    signer,
    currentNetwork,
    isConnecting,
    error,
    balance,
    
    // 方法
    connectWallet,
    disconnectWallet,
    switchNetwork,
    formatAddress,
    getNetworkDisplayName,
    isSupportedNetwork,
    
    // 常量
    SUPPORTED_NETWORKS,
  };

  return (
    <MultiChainWalletContext.Provider value={value}>
      {children}
    </MultiChainWalletContext.Provider>
  );
};

// 使用多链钱包的Hook
export const useMultiChainWallet = () => {
  const context = useContext(MultiChainWalletContext);
  if (!context) {
    throw new Error('useMultiChainWallet must be used within a MultiChainWalletProvider');
  }
  return context;
};

// 多链钱包组件
const MultiChainWallet = () => {
  const {
    account,
    currentNetwork,
    isConnecting,
    error,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    formatAddress,
    getNetworkDisplayName,
    isSupportedNetwork,
    SUPPORTED_NETWORKS,
  } = useMultiChainWallet();

  const [showNetworkSelector, setShowNetworkSelector] = useState(false);

  return (
    <div className="multichain-wallet">
      {!account ? (
        // 未连接状态
        <div className="wallet-connect-section">
          <h3>连接钱包</h3>
          <p>请连接您的钱包以开始使用多链功能</p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="connect-button"
          >
            {isConnecting ? '连接中...' : '连接MetaMask'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        // 已连接状态
        <div className="wallet-connected-section">
          <div className="wallet-info">
            <div className="account-info">
              <h4>钱包地址</h4>
              <span className="address">{formatAddress(account)}</span>
              <button
                onClick={() => navigator.clipboard.writeText(account)}
                className="copy-button"
                title="复制地址"
              >
                📋
              </button>
            </div>
            
            <div className="network-info">
              <h4>当前网络</h4>
              <div className="network-display">
                <span className={`network-status ${isSupportedNetwork() ? 'supported' : 'unsupported'}`}>
                  {getNetworkDisplayName()}
                </span>
                <button
                  onClick={() => setShowNetworkSelector(!showNetworkSelector)}
                  className="network-switch-button"
                >
                  切换网络
                </button>
              </div>
              
              {showNetworkSelector && (
                <div className="network-selector">
                  {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
                    <button
                      key={key}
                      onClick={() => {
                        switchNetwork(key);
                        setShowNetworkSelector(false);
                      }}
                      className={`network-option ${
                        currentNetwork?.chainId === network.chainId ? 'active' : ''
                      }`}
                    >
                      {network.chainName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="balance-info">
              <h4>余额</h4>
              <span className="balance">
                {parseFloat(balance).toFixed(4)} {currentNetwork?.nativeCurrency?.symbol || 'ETH'}
              </span>
            </div>
          </div>
          
          {!isSupportedNetwork() && (
            <div className="unsupported-network-warning">
              ⚠️ 当前网络不受支持，请切换到支持的网络
            </div>
          )}
          
          <div className="wallet-actions">
            <button onClick={disconnectWallet} className="disconnect-button">
              断开连接
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default MultiChainWallet;

