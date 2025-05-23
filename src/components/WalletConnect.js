import React, { useState, useEffect } from 'react';
import web3Service from '../services/web3Service';

/**
 * 钱包连接组件
 * 提供连接/断开钱包功能，显示账户地址和余额
 */
const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // 监听账户变化
  useEffect(() => {
    const handleAccountChanged = (event) => {
      setAccount(event.detail);
      updateBalances(event.detail);
    };

    const handleDisconnect = () => {
      setAccount(null);
      setBalance(null);
      setTokenBalance(null);
    };

    window.addEventListener('accountChanged', handleAccountChanged);
    window.addEventListener('walletDisconnected', handleDisconnect);

    return () => {
      window.removeEventListener('accountChanged', handleAccountChanged);
      window.removeEventListener('walletDisconnected', handleDisconnect);
    };
  }, []);

  // 更新余额信息
  const updateBalances = async (address) => {
    if (!address) return;
    
    try {
      const bnbBalance = await web3Service.getBalance();
      setBalance(bnbBalance);
      
      const cbtBalance = await web3Service.getTokenBalance();
      setTokenBalance(cbtBalance);
    } catch (err) {
      console.error('获取余额失败:', err);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const address = await web3Service.connectWallet();
      setAccount(address);
      await updateBalances(address);
    } catch (err) {
      console.error('钱包连接失败:', err);
      setError('钱包连接失败，请确保已安装MetaMask并授权访问');
    } finally {
      setIsConnecting(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    web3Service.disconnectWallet();
    setAccount(null);
    setBalance(null);
    setTokenBalance(null);
  };

  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="wallet-connect">
      {!account ? (
        <button 
          className="connect-button" 
          onClick={connectWallet} 
          disabled={isConnecting}
        >
          {isConnecting ? '连接中...' : '连接钱包'}
        </button>
      ) : (
        <div className="wallet-info">
          <div className="account-info">
            <span className="address">{formatAddress(account)}</span>
            <button className="disconnect-button" onClick={disconnectWallet}>
              断开连接
            </button>
          </div>
          <div className="balance-info">
            {balance && <div className="balance">BNB: {parseFloat(balance).toFixed(4)}</div>}
            {tokenBalance && <div className="token-balance">CBT: {parseFloat(tokenBalance).toFixed(2)}</div>}
          </div>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default WalletConnect;
