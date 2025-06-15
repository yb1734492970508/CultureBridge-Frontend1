import React, { useState, useEffect } from 'react';
import { blockchainAPI } from '../../services/api';
import socketService from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler, useAsyncError } from '../../utils/errorHandler';
import { Wallet, ExternalLink, Copy, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import './EnhancedWalletConnector.css';

function EnhancedWalletConnector() {
  const { user, isAuthenticated, connectWallet, disconnectWallet } = useAuth();
  const [walletInfo, setWalletInfo] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [supportedWallets, setSupportedWallets] = useState([]);
  const { error, loading, executeAsync, clearError } = useAsyncError();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletInfo();
      fetchNetworkStatus();
    }

    // 监听钱包状态变化
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // 检测支持的钱包
    const wallets = [];
    
    if (window.ethereum) {
      if (window.ethereum.isMetaMask) {
        wallets.push({
          name: 'MetaMask',
          icon: '🦊',
          id: 'metamask',
          installed: true
        });
      }
      if (window.ethereum.isTrustWallet) {
        wallets.push({
          name: 'Trust Wallet',
          icon: '🛡️',
          id: 'trustwallet',
          installed: true
        });
      }
      if (window.ethereum.isBinance) {
        wallets.push({
          name: 'Binance Wallet',
          icon: '🟡',
          id: 'binance',
          installed: true
        });
      }
    }

    // 添加未安装的钱包
    if (!wallets.find(w => w.id === 'metamask')) {
      wallets.push({
        name: 'MetaMask',
        icon: '🦊',
        id: 'metamask',
        installed: false,
        downloadUrl: 'https://metamask.io/download/'
      });
    }

    setSupportedWallets(wallets);
  }, []);

  const fetchWalletInfo = async () => {
    await executeAsync(async () => {
      const response = await blockchainAPI.getWalletInfo();
      setWalletInfo(response.wallet);
    });
  };

  const fetchNetworkStatus = async () => {
    await executeAsync(async () => {
      const response = await blockchainAPI.getNetworkStatus();
      setNetworkStatus(response.network);
    });
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // 用户断开了钱包连接
      handleDisconnect();
    } else {
      // 用户切换了账户
      fetchWalletInfo();
    }
  };

  const handleChainChanged = (chainId) => {
    // 网络切换，刷新页面或重新获取信息
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setWalletInfo(null);
  };

  const connectToWallet = async (walletId) => {
    if (!window.ethereum) {
      alert('请安装MetaMask或其他Web3钱包');
      return;
    }

    setIsConnecting(true);
    try {
      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('未选择账户');
      }

      const address = accounts[0];
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      // 检查是否为BNB链
      const bnbChainId = '0x38'; // BSC Mainnet
      const bnbTestnetChainId = '0x61'; // BSC Testnet

      if (chainId !== bnbChainId && chainId !== bnbTestnetChainId) {
        // 尝试切换到BNB链
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: bnbChainId }],
          });
        } catch (switchError) {
          // 如果网络不存在，添加BNB链
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: bnbChainId,
                chainName: 'BNB Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // 获取签名以验证钱包所有权
      const message = `CultureBridge钱包连接验证\n时间戳: ${Date.now()}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // 调用后端API连接钱包
      await connectWallet({
        address,
        signature,
        message,
        walletType: walletId,
        chainId: parseInt(chainId, 16)
      });

      // 获取钱包信息
      await fetchWalletInfo();
      await fetchNetworkStatus();

    } catch (error) {
      console.error('钱包连接失败:', error);
      errorHandler.handleError(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    // 可以添加复制成功的提示
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatBalance = (balance) => {
    return parseFloat(balance || 0).toFixed(4);
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 56:
        return 'BNB Smart Chain';
      case 97:
        return 'BNB Testnet';
      case 1:
        return 'Ethereum';
      default:
        return `Chain ${chainId}`;
    }
  };

  const getNetworkStatus = () => {
    if (!networkStatus) return { status: 'unknown', color: '#6c757d' };
    
    if (networkStatus.isHealthy) {
      return { status: '正常', color: '#28a745' };
    } else {
      return { status: '异常', color: '#dc3545' };
    }
  };

  if (loading) return <div className="loading">加载钱包信息...</div>;

  return (
    <div className="enhanced-wallet-connector">
      <div className="wallet-header">
        <h2>钱包连接</h2>
        {walletInfo && (
          <button onClick={handleDisconnect} className="disconnect-btn">
            断开连接
          </button>
        )}
      </div>

      {!walletInfo ? (
        <div className="wallet-connection">
          <div className="connection-intro">
            <Wallet size={48} />
            <h3>连接您的钱包</h3>
            <p>选择一个钱包来连接到CultureBridge平台</p>
          </div>

          <div className="wallet-options">
            {supportedWallets.map((wallet) => (
              <div key={wallet.id} className="wallet-option">
                <div className="wallet-info">
                  <span className="wallet-icon">{wallet.icon}</span>
                  <span className="wallet-name">{wallet.name}</span>
                  {wallet.installed && <CheckCircle size={16} className="installed-icon" />}
                </div>
                
                {wallet.installed ? (
                  <button
                    onClick={() => connectToWallet(wallet.id)}
                    disabled={isConnecting}
                    className="connect-btn"
                  >
                    {isConnecting ? '连接中...' : '连接'}
                  </button>
                ) : (
                  <a
                    href={wallet.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="install-btn"
                  >
                    <ExternalLink size={16} />
                    安装
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="connection-tips">
            <h4>连接提示:</h4>
            <ul>
              <li>确保您的钱包已安装并解锁</li>
              <li>建议使用BNB智能链网络以获得最佳体验</li>
              <li>连接钱包不会产生任何费用</li>
              <li>您可以随时断开钱包连接</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-status">
            <div className="status-indicator connected">
              <CheckCircle size={20} />
              <span>已连接</span>
            </div>
            <div className="network-status">
              <div 
                className="network-indicator"
                style={{ backgroundColor: getNetworkStatus().color }}
              ></div>
              <span>网络: {getNetworkName(walletInfo.chainId)} ({getNetworkStatus().status})</span>
            </div>
          </div>

          <div className="wallet-details">
            <div className="wallet-card">
              <div className="wallet-card-header">
                <h3>钱包信息</h3>
                <span className="wallet-type">{walletInfo.walletType || 'MetaMask'}</span>
              </div>
              
              <div className="wallet-address">
                <label>钱包地址:</label>
                <div className="address-display">
                  <span className="address">{formatAddress(walletInfo.address)}</span>
                  <button 
                    onClick={() => copyAddress(walletInfo.address)}
                    className="copy-btn"
                    title="复制地址"
                  >
                    <Copy size={16} />
                  </button>
                  <a
                    href={`https://bscscan.com/address/${walletInfo.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="explorer-btn"
                    title="在区块链浏览器中查看"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              <div className="wallet-balances">
                <div className="balance-item">
                  <label>BNB余额:</label>
                  <span className="balance">{formatBalance(walletInfo.bnbBalance)} BNB</span>
                </div>
                <div className="balance-item">
                  <label>CBT余额:</label>
                  <span className="balance">{formatBalance(walletInfo.cbtBalance)} CBT</span>
                </div>
              </div>
            </div>

            {networkStatus && (
              <div className="network-card">
                <div className="network-card-header">
                  <h3>网络状态</h3>
                  <Zap size={20} />
                </div>
                
                <div className="network-details">
                  <div className="network-item">
                    <label>区块高度:</label>
                    <span>{networkStatus.blockNumber?.toLocaleString()}</span>
                  </div>
                  <div className="network-item">
                    <label>Gas价格:</label>
                    <span>{networkStatus.gasPrice} Gwei</span>
                  </div>
                  <div className="network-item">
                    <label>网络延迟:</label>
                    <span>{networkStatus.latency}ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="wallet-actions">
            <button 
              onClick={fetchWalletInfo} 
              className="refresh-btn"
              disabled={loading}
            >
              刷新余额
            </button>
            <button 
              onClick={() => window.open(`https://bscscan.com/address/${walletInfo.address}`, '_blank')}
              className="explorer-btn"
            >
              查看交易记录
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-display">
          <AlertCircle size={20} />
          <span>{error.message}</span>
          <button onClick={clearError} className="close-error">×</button>
        </div>
      )}
    </div>
  );
}

export default EnhancedWalletConnector;

