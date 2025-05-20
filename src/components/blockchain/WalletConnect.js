import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import './WalletConnect.css';

// 支持的钱包提供商
const WALLET_PROVIDERS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
    description: '最流行的以太坊钱包',
    detectMethod: () => typeof window !== 'undefined' && !!window.ethereum && window.ethereum.isMetaMask,
    installUrl: 'https://metamask.io/download.html'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Blue%20(Default)/Icon.svg',
    description: '连接到移动钱包应用',
    detectMethod: () => false, // 需要实际集成WalletConnect库
    installUrl: 'https://walletconnect.com/registry/wallets'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: 'https://raw.githubusercontent.com/coinbase/wallet-assets/master/wallet/android/res/mipmap-xxxhdpi/ic_launcher.png',
    description: 'Coinbase官方钱包',
    detectMethod: () => typeof window !== 'undefined' && !!window.ethereum && window.ethereum.isCoinbaseWallet,
    installUrl: 'https://www.coinbase.com/wallet/downloads'
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    icon: 'https://trustwallet.com/assets/images/favicon.png',
    description: '币安推荐的多链钱包',
    detectMethod: () => typeof window !== 'undefined' && !!window.ethereum && window.ethereum.isTrust,
    installUrl: 'https://trustwallet.com/download'
  }
];

/**
 * 增强版钱包连接组件
 * 支持多种钱包提供商，提供更好的用户体验
 */
const WalletConnect = () => {
  const { 
    account, 
    active, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    isConnecting,
    chainId
  } = useBlockchain();
  
  const [showProviders, setShowProviders] = useState(false);
  const [detectedProviders, setDetectedProviders] = useState([]);
  
  // 检测已安装的钱包提供商
  useEffect(() => {
    const detected = WALLET_PROVIDERS.filter(provider => provider.detectMethod());
    setDetectedProviders(detected);
  }, []);
  
  // 格式化账户地址，显示前6位和后4位
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 获取当前连接的网络名称
  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return '以太坊主网';
      case 3:
        return 'Ropsten测试网';
      case 4:
        return 'Rinkeby测试网';
      case 5:
        return 'Goerli测试网';
      case 42:
        return 'Kovan测试网';
      case 56:
        return '币安智能链';
      case 97:
        return '币安测试网';
      default:
        return '未知网络';
    }
  };
  
  // 处理钱包提供商选择
  const handleProviderSelect = (provider) => {
    if (provider.detectMethod()) {
      // 如果已安装，直接连接
      connectWallet();
    } else {
      // 如果未安装，打开安装页面
      window.open(provider.installUrl, '_blank');
    }
    setShowProviders(false);
  };
  
  // 渲染钱包提供商选择器
  const renderProviderSelector = () => {
    return (
      <div className="wallet-providers">
        <div className="providers-header">
          <h3>选择钱包</h3>
          <button 
            className="close-providers-btn"
            onClick={() => setShowProviders(false)}
          >
            ×
          </button>
        </div>
        
        <div className="providers-list">
          {WALLET_PROVIDERS.map(provider => {
            const isDetected = provider.detectMethod();
            
            return (
              <div 
                key={provider.id}
                className={`provider-item ${isDetected ? 'provider-detected' : ''}`}
                onClick={() => handleProviderSelect(provider)}
              >
                <div className="provider-icon">
                  <img src={provider.icon} alt={provider.name} />
                </div>
                <div className="provider-info">
                  <div className="provider-name">
                    {provider.name}
                    {isDetected && <span className="provider-badge">已安装</span>}
                  </div>
                  <div className="provider-description">{provider.description}</div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="providers-footer">
          <p>首次连接钱包需要在钱包应用中确认</p>
        </div>
      </div>
    );
  };
  
  // 渲染连接按钮或账户信息
  return (
    <div className="wallet-connect">
      {active && account ? (
        <div className="wallet-info">
          <div className="wallet-account">
            <span className="wallet-address">{formatAddress(account)}</span>
            <span className="wallet-network">{getNetworkName(chainId)}</span>
          </div>
          <div className="wallet-balance">
            {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '加载中...'}
          </div>
          <button 
            className="wallet-disconnect-btn" 
            onClick={disconnectWallet}
          >
            断开连接
          </button>
        </div>
      ) : (
        <div className="wallet-connect-container">
          <button 
            className="wallet-connect-btn" 
            onClick={() => setShowProviders(true)}
            disabled={isConnecting}
          >
            {isConnecting ? '连接中...' : '连接钱包'}
          </button>
          
          {showProviders && renderProviderSelector()}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
