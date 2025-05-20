import React from 'react';
import { useBlockchain } from '../../context/blockchain/BlockchainContext';
import './WalletConnect.css';

/**
 * 钱包连接组件
 * 提供连接/断开以太坊钱包的功能，并显示账户信息
 */
const WalletConnect = () => {
  const { 
    account, 
    active, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    isConnecting,
    isMetaMaskInstalled,
    chainId
  } = useBlockchain();

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
        <button 
          className="wallet-connect-btn" 
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? '连接中...' : isMetaMaskInstalled ? '连接钱包' : '安装MetaMask'}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
