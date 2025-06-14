import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3 from 'web3';

// 创建Web3上下文
const Web3Context = createContext();

// 初始状态
const initialState = {
  web3: null,
  provider: null,
  account: null,
  chainId: null,
  balance: '0',
  isConnected: false,
  isConnecting: false,
  error: null,
  contracts: {}
};

// Web3 reducer
const web3Reducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONNECTING':
      return {
        ...state,
        isConnecting: action.payload,
        error: null
      };
    case 'WALLET_CONNECTED':
      return {
        ...state,
        web3: action.payload.web3,
        provider: action.payload.provider,
        account: action.payload.account,
        chainId: action.payload.chainId,
        balance: action.payload.balance,
        isConnected: true,
        isConnecting: false,
        error: null
      };
    case 'WALLET_DISCONNECTED':
      return {
        ...state,
        web3: null,
        provider: null,
        account: null,
        chainId: null,
        balance: '0',
        isConnected: false,
        isConnecting: false,
        contracts: {}
      };
    case 'ACCOUNT_CHANGED':
      return {
        ...state,
        account: action.payload.account,
        balance: action.payload.balance
      };
    case 'CHAIN_CHANGED':
      return {
        ...state,
        chainId: action.payload
      };
    case 'BALANCE_UPDATED':
      return {
        ...state,
        balance: action.payload
      };
    case 'CONTRACT_LOADED':
      return {
        ...state,
        contracts: {
          ...state.contracts,
          [action.payload.name]: action.payload.contract
        }
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isConnecting: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Web3Provider组件
export const Web3Provider = ({ children }) => {
  const [state, dispatch] = useReducer(web3Reducer, initialState);

  // 检查MetaMask是否安装
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // 连接钱包
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      dispatch({
        type: 'SET_ERROR',
        payload: '请安装MetaMask钱包'
      });
      return { success: false, message: '请安装MetaMask钱包' };
    }

    try {
      dispatch({ type: 'SET_CONNECTING', payload: true });

      // 请求账户访问权限
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('未找到账户');
      }

      // 创建Web3实例
      const web3 = new Web3(window.ethereum);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // 获取网络信息
      const network = await provider.getNetwork();
      const chainId = network.chainId;

      // 获取账户余额
      const balance = await provider.getBalance(accounts[0]);
      const balanceInEth = ethers.utils.formatEther(balance);

      dispatch({
        type: 'WALLET_CONNECTED',
        payload: {
          web3,
          provider,
          account: accounts[0],
          chainId,
          balance: balanceInEth
        }
      });

      // 保存连接状态到localStorage
      localStorage.setItem('walletConnected', 'true');

      return { success: true, account: accounts[0] };
    } catch (error) {
      console.error('连接钱包失败:', error);
      const message = error.message || '连接钱包失败';
      dispatch({
        type: 'SET_ERROR',
        payload: message
      });
      return { success: false, message };
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    dispatch({ type: 'WALLET_DISCONNECTED' });
    localStorage.removeItem('walletConnected');
  };

  // 切换网络
  const switchNetwork = async (chainId) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
    } catch (error) {
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        await addNetwork(chainId);
      } else {
        throw error;
      }
    }
  };

  // 添加网络
  const addNetwork = async (chainId) => {
    const networks = {
      97: {
        chainId: '0x61',
        chainName: 'BSC Testnet',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com/']
      },
      56: {
        chainId: '0x38',
        chainName: 'BSC Mainnet',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/']
      }
    };

    const networkConfig = networks[chainId];
    if (!networkConfig) {
      throw new Error('不支持的网络');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig]
    });
  };

  // 获取合约实例
  const getContract = async (contractAddress, abi, name) => {
    if (!state.provider) {
      throw new Error('钱包未连接');
    }

    try {
      const signer = state.provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      dispatch({
        type: 'CONTRACT_LOADED',
        payload: { name, contract }
      });

      return contract;
    } catch (error) {
      console.error(`加载合约${name}失败:`, error);
      throw error;
    }
  };

  // 发送交易
  const sendTransaction = async (to, value, data = '0x') => {
    if (!state.provider || !state.account) {
      throw new Error('钱包未连接');
    }

    try {
      const signer = state.provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(value.toString()),
        data
      });

      return tx;
    } catch (error) {
      console.error('发送交易失败:', error);
      throw error;
    }
  };

  // 更新余额
  const updateBalance = async () => {
    if (!state.provider || !state.account) return;

    try {
      const balance = await state.provider.getBalance(state.account);
      const balanceInEth = ethers.utils.formatEther(balance);
      
      dispatch({
        type: 'BALANCE_UPDATED',
        payload: balanceInEth
      });
    } catch (error) {
      console.error('更新余额失败:', error);
    }
  };

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== state.account) {
          const balance = await state.provider.getBalance(accounts[0]);
          const balanceInEth = ethers.utils.formatEther(balance);
          
          dispatch({
            type: 'ACCOUNT_CHANGED',
            payload: {
              account: accounts[0],
              balance: balanceInEth
            }
          });
        }
      };

      const handleChainChanged = (chainId) => {
        dispatch({
          type: 'CHAIN_CHANGED',
          payload: parseInt(chainId, 16)
        });
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.account, state.provider]);

  // 自动重连
  useEffect(() => {
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem('walletConnected');
      if (wasConnected === 'true' && isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('自动重连失败:', error);
        }
      }
    };

    autoConnect();
  }, []);

  const value = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    addNetwork,
    getContract,
    sendTransaction,
    updateBalance,
    isMetaMaskInstalled,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// 使用Web3上下文的Hook
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;

