import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

// 支持的链ID（以太坊主网和几个测试网）
export const supportedChainIds = [1, 3, 4, 5, 42, 56, 97];

// 注入连接器（MetaMask）
export const injected = new InjectedConnector({
  supportedChainIds,
});

// 创建区块链上下文
export const BlockchainContext = createContext({
  account: null,
  chainId: null,
  active: false,
  library: null,
  connector: null,
  error: null,
  balance: null,
  connectWallet: () => {},
  disconnectWallet: () => {},
  isConnecting: false,
  isMetaMaskInstalled: false,
});

// 区块链上下文提供者组件
export const BlockchainProvider = ({ children }) => {
  const { 
    active, 
    account, 
    library, 
    connector, 
    activate, 
    deactivate, 
    error, 
    chainId 
  } = useWeb3React();
  
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // 检查MetaMask是否已安装
  useEffect(() => {
    setIsMetaMaskInstalled(typeof window !== 'undefined' && !!window.ethereum);
  }, []);

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      await activate(injected);
    } catch (error) {
      console.error('连接钱包失败:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [activate, isMetaMaskInstalled]);

  // 断开钱包连接
  const disconnectWallet = useCallback(() => {
    try {
      deactivate();
    } catch (error) {
      console.error('断开钱包连接失败:', error);
    }
  }, [deactivate]);

  // 获取账户余额
  useEffect(() => {
    if (active && account && library) {
      let isMounted = true;
      
      library.getBalance(account)
        .then((balance) => {
          if (isMounted) {
            setBalance(ethers.utils.formatEther(balance));
          }
        })
        .catch((error) => {
          console.error('获取余额失败:', error);
        });
      
      return () => {
        isMounted = false;
      };
    } else {
      setBalance(null);
    }
  }, [active, account, library]);

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum && window.ethereum.on) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          // 账户已切换，无需特殊处理，React会自动更新
        } else {
          // 用户在MetaMask中断开了连接
          deactivate();
        }
      };

      const handleChainChanged = () => {
        // 当链变化时，我们需要刷新页面以确保所有状态正确更新
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [deactivate]);

  // 上下文值
  const contextValue = {
    account,
    chainId,
    active,
    library,
    connector,
    error,
    balance,
    connectWallet,
    disconnectWallet,
    isConnecting,
    isMetaMaskInstalled,
  };

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
};

// 自定义Hook，方便在组件中使用区块链上下文
export const useBlockchain = () => {
  const context = React.useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain必须在BlockchainProvider内部使用');
  }
  return context;
};
