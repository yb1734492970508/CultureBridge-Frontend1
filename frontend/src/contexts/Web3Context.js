import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// 创建Web3上下文
const Web3Context = React.createContext();

// 主题配置
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0080ff',
      600: '#0066cc',
      700: '#004d99',
      800: '#003366',
      900: '#001a33',
    },
  },
  fonts: {
    heading: `'Noto Sans SC', sans-serif`,
    body: `'Noto Sans SC', sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      }
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

// Web3提供者组件
export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // 连接钱包
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        setError(null);
        
        // 请求账户访问
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        const ethersSigner = ethersProvider.getSigner();
        const network = await ethersProvider.getNetwork();
        
        setProvider(ethersProvider);
        setSigner(ethersSigner);
        setAccount(accounts[0]);
        setChainId(network.chainId);
      } catch (err) {
        console.error('连接钱包失败:', err);
        setError(err.message || '连接钱包时发生错误');
      } finally {
        setIsConnecting(false);
      }
    } else {
      setError('请安装MetaMask或其他兼容的钱包');
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
  };

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // 用户断开了连接
          disconnectWallet();
        } else {
          // 账户已切换
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainIdHex) => {
        // 网络已切换，刷新页面
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // 清理监听器
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // 自动连接钱包（如果之前已连接）
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
            const ethersSigner = ethersProvider.getSigner();
            const network = await ethersProvider.getNetwork();
            
            setProvider(ethersProvider);
            setSigner(ethersSigner);
            setAccount(accounts[0]);
            setChainId(network.chainId);
          }
        } catch (err) {
          console.error('自动连接钱包失败:', err);
        }
      }
    };

    autoConnect();
  }, []);

  // 切换到BNB链
  const switchToBNBChain = async () => {
    if (!window.ethereum) return;
    
    try {
      // BNB Chain (BSC) 主网参数
      const bscMainnet = {
        chainId: '0x38', // 56 in decimal
        chainName: 'BNB Smart Chain',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/']
      };
      
      // BNB Chain (BSC) 测试网参数
      const bscTestnet = {
        chainId: '0x61', // 97 in decimal
        chainName: 'BNB Smart Chain Testnet',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com/']
      };
      
      // 先尝试切换到BSC
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: bscTestnet.chainId }]
      });
    } catch (switchError) {
      // 如果链不存在，则添加链
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [bscTestnet]
          });
        } catch (addError) {
          console.error('添加BSC网络失败:', addError);
          setError('添加BSC网络失败');
        }
      } else {
        console.error('切换到BSC网络失败:', switchError);
        setError('切换到BSC网络失败');
      }
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Web3Context.Provider value={{
        provider,
        signer,
        account,
        chainId,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        switchToBNBChain,
        formatAddress
      }}>
        {children}
      </Web3Context.Provider>
    </ChakraProvider>
  );
};

// 自定义Hook，用于在组件中访问Web3上下文
export const useWeb3 = () => {
  const context = React.useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
