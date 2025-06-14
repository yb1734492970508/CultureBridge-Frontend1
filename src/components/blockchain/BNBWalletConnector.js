import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain/BlockchainContext';
import './BNBWalletConnector.css';

/**
 * 简化版BNB链钱包连接器组件
 */
const BNBWalletConnector = () => {
  const { 
    account, 
    chainId, 
    active, 
    library, 
    connectWallet, 
    disconnectWallet,
    isConnecting,
    isMetaMaskInstalled 
  } = useBlockchain();

  const [bnbBalance, setBnbBalance] = useState('0');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // 检查是否在BNB链上
  const isBNBChain = (chainId) => {
    return chainId === 56 || chainId === 97;
  };

  const isCorrectNetwork = isBNBChain(chainId);

  // 获取余额
  const fetchBalances = useCallback(async () => {
    if (!active || !account || !library || !isCorrectNetwork) {
      setBnbBalance('0');
      return;
    }

    setIsLoadingBalances(true);
    try {
      const bnbBal = await library.getBalance(account);
      setBnbBalance(ethers.utils.formatEther(bnbBal));
    } catch (error) {
      console.error('获取余额失败:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [active, account, library, isCorrectNetwork]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // 连接钱包
  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };

  // 切换到BNB链
  const switchToBNBChain = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC主网
      });
    } catch (error) {
      if (error.code === 4902) {
        // 添加BNB链
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: ['https://bsc-dataseed1.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/'],
            }],
          });
        } catch (addError) {
          console.error('添加BNB链失败:', addError);
        }
      }
    }
  };

  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 获取网络名称
  const getNetworkName = () => {
    switch (chainId) {
      case 56:
        return 'BNB Smart Chain';
      case 97:
        return 'BSC Testnet';
      default:
        return '未知网络';
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className="bnb-wallet-connector">
        <div className="wallet-status">
          <div className="status-text">
            <div className="status-title">需要安装MetaMask</div>
          </div>
          <button 
            className="install-button"
            onClick={() => window.open('https://metamask.io/download.html', '_blank')}
          >
            安装MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="bnb-wallet-connector">
        <div className="wallet-status">
          <div className="status-text">
            <div className="status-title">连接钱包</div>
          </div>
          <button 
            className="connect-button"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? '连接中...' : '连接钱包'}
          </button>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bnb-wallet-connector">
        <div className="wallet-status">
          <div className="status-text">
            <div className="status-title">网络错误</div>
            <div className="status-subtitle">请切换到BNB智能链</div>
          </div>
          <button 
            className="switch-button"
            onClick={switchToBNBChain}
          >
            切换到BNB链
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bnb-wallet-connector connected">
      <div className="wallet-info">
        <div className="network-indicator">
          <div className={`network-dot ${chainId === 56 ? 'mainnet' : 'testnet'}`}></div>
          <span className="network-name">{getNetworkName()}</span>
        </div>
        
        <div className="account-info">
          <div className="account-address">{formatAddress(account)}</div>
          <div className="balances">
            <div className="balance-item">
              <span className="balance-label">BNB:</span>
              <span className="balance-value">
                {isLoadingBalances ? '...' : parseFloat(bnbBalance).toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        <div className="wallet-actions">
          <button 
            className="refresh-button"
            onClick={fetchBalances}
            disabled={isLoadingBalances}
            title="刷新余额"
          >
            🔄
          </button>
          <button 
            className="disconnect-button"
            onClick={disconnectWallet}
            title="断开连接"
          >
            🔌
          </button>
        </div>
      </div>
    </div>
  );
};

export default BNBWalletConnector;

