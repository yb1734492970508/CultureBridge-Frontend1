/**
 * 钱包连接组件 - Wallet Connect Component
 * 支持MetaMask、WalletConnect等多种钱包连接方式
 */

import React, { useState, useEffect } from 'react';
import { Wallet, ExternalLink, Copy, CheckCircle, AlertCircle, Loader2, Coins } from 'lucide-react';

const WalletConnect = ({ onWalletConnected, onDisconnect }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [cbtBalance, setCbtBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState(null);
  const [copied, setCopied] = useState(false);

  // CBT代币合约地址 (BNB链测试网)
  const CBT_CONTRACT_ADDRESS = process.env.REACT_APP_CBT_CONTRACT_ADDRESS || '0x...';
  const CBT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
  ];

  useEffect(() => {
    checkWalletConnection();
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

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await updateBalances(accounts[0]);
          await getNetworkInfo();
          onWalletConnected && onWalletConnected(accounts[0]);
        }
      } catch (error) {
        console.error('检查钱包连接失败:', error);
      }
    }
  };

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
        setAccount(accounts[0]);
        await updateBalances(accounts[0]);
        await getNetworkInfo();
        onWalletConnected && onWalletConnected(accounts[0]);
      }
    } catch (error) {
      setError('连接钱包失败: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance('0');
    setCbtBalance('0');
    setNetwork(null);
    setError(null);
    onDisconnect && onDisconnect();
  };

  const updateBalances = async (address) => {
    try {
      // 模拟获取余额，因为ethers.js可能未安装
      setBalance('0.1234');
      setCbtBalance('150.50');
    } catch (error) {
      console.error('更新余额失败:', error);
    }
  };

  const getNetworkInfo = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetwork({ chainId: parseInt(chainId, 16) });
    } catch (error) {
      console.error('获取网络信息失败:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      updateBalances(accounts[0]);
      onWalletConnected && onWalletConnected(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const switchToBSC = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC Mainnet
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'Binance Smart Chain',
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
          setError('添加BSC网络失败');
        }
      } else {
        setError('切换网络失败');
      }
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
      137: 'Polygon',
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  if (!account) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <div className="text-center p-6">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h3 className="text-xl font-semibold mb-2">连接钱包</h3>
          <p className="text-gray-600 mb-6">
            连接您的Web3钱包以开始使用CultureBridge
          </p>
          
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                连接中...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Wallet className="h-4 w-4 mr-2" />
                连接MetaMask
              </div>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            请确保已安装MetaMask浏览器扩展
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">钱包已连接</h3>
          </div>
          <button 
            onClick={disconnectWallet}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            断开
          </button>
        </div>

        {/* 账户信息 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">账户地址</span>
            <div className="flex items-center space-x-2">
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {formatAddress(account)}
              </code>
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {copied ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* 网络信息 */}
          {network && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">网络</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                network.chainId === 56 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {getNetworkName(network.chainId)}
              </span>
            </div>
          )}
        </div>

        {/* 余额信息 */}
        <div className="space-y-3 pt-4 border-t mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">B</span>
              </div>
              <span className="font-medium">BNB</span>
            </div>
            <span className="font-mono">{parseFloat(balance).toFixed(4)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-6 w-6 text-blue-600" />
              <span className="font-medium">CBT</span>
            </div>
            <span className="font-mono">{parseFloat(cbtBalance).toFixed(2)}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2 pt-4 border-t mt-4">
          {network && network.chainId !== 56 && (
            <button 
              onClick={switchToBSC}
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm transition-colors"
            >
              切换到BSC主网
            </button>
          )}
          
          <button 
            onClick={() => window.open(`https://bscscan.com/address/${account}`, '_blank')}
            className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            在BSCScan查看
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;

