import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState({
    cbt: '0',
    bnb: '0'
  });
  const [networkStatus, setNetworkStatus] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 后端API基础URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // 连接钱包
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window.ethereum !== 'undefined') {
        // 请求连接MetaMask
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts.length > 0) {
          const account = accounts[0];
          setAccount(account);
          
          // 检查网络
          await checkNetwork();
          
          // 获取余额
          await fetchBalance(account);
          
          return account;
        }
      } else {
        throw new Error('请安装MetaMask钱包');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setAccount(null);
    setBalance({ cbt: '0', bnb: '0' });
    setError(null);
  };

  // 检查网络
  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const BSC_TESTNET_CHAIN_ID = '0x61'; // 97 in hex
      
      if (chainId !== BSC_TESTNET_CHAIN_ID) {
        // 尝试切换到BSC测试网
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BSC_TESTNET_CHAIN_ID }],
          });
        } catch (switchError) {
          // 如果网络不存在，添加网络
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: BSC_TESTNET_CHAIN_ID,
                chainName: 'BSC Testnet',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18
                },
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                blockExplorerUrls: ['https://testnet.bscscan.com/']
              }]
            });
          }
        }
      }
    } catch (err) {
      console.error('网络检查失败:', err);
      setError('请切换到BSC测试网');
    }
  };

  // 获取网络状态
  const fetchNetworkStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/network/status`);
      setNetworkStatus(response.data);
      return response.data;
    } catch (err) {
      console.error('获取网络状态失败:', err);
      setError('无法连接到区块链网络');
    }
  };

  // 获取代币信息
  const fetchTokenInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/token/info`);
      setTokenInfo(response.data);
      return response.data;
    } catch (err) {
      console.error('获取代币信息失败:', err);
      // 不设置错误，因为合约可能还未部署
    }
  };

  // 获取余额
  const fetchBalance = async (address) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/token/balance/${address}`);
      setBalance({
        cbt: response.data.cbtBalance,
        bnb: response.data.bnbBalance
      });
      return response.data;
    } catch (err) {
      console.error('获取余额失败:', err);
      // 不设置错误，因为合约可能还未部署
    }
  };

  // 转账代币
  const transferToken = async (to, amount, privateKey) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/api/blockchain/token/transfer`, {
        from: account,
        to,
        amount,
        privateKey
      });

      // 转账成功后刷新余额
      await fetchBalance(account);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 获取交易详情
  const getTransaction = async (txHash) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/transaction/${txHash}`);
      return response.data;
    } catch (err) {
      console.error('获取交易详情失败:', err);
      throw err;
    }
  };

  // 监听账户变化
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          fetchBalance(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  // 初始化时获取网络状态和代币信息
  useEffect(() => {
    fetchNetworkStatus();
    fetchTokenInfo();
  }, []);

  const value = {
    account,
    balance,
    networkStatus,
    tokenInfo,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    checkNetwork,
    fetchNetworkStatus,
    fetchTokenInfo,
    fetchBalance,
    transferToken,
    getTransaction,
    setError
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

