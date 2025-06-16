import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle, Loader, ExternalLink } from 'lucide-react';

const WalletConnect = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    // 检查MetaMask是否已安装
    setIsMetaMaskInstalled(typeof window.ethereum !== 'undefined');
    
    // 检查是否已经连接
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          onConnect({
            address: accounts[0],
            provider: window.ethereum
          });
        }
      } catch (error) {
        console.error('检查连接失败:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError('请先安装MetaMask钱包');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('未选择任何账户');
      }

      const address = accounts[0];
      setWalletAddress(address);

      // 检查网络
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = '0x61'; // BSC Testnet (97)
      
      if (chainId !== targetChainId) {
        try {
          // 尝试切换到BSC测试网
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError) {
          // 如果网络不存在，添加网络
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: 'BSC Testnet',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18
                },
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                blockExplorerUrls: ['https://testnet.bscscan.com']
              }]
            });
          } else {
            throw switchError;
          }
        }
      }

      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setWalletAddress('');
          setError('钱包已断开连接');
        } else {
          setWalletAddress(accounts[0]);
          onConnect({
            address: accounts[0],
            provider: window.ethereum
          });
        }
      });

      // 监听网络变化
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      onConnect({
        address,
        provider: window.ethereum
      });

    } catch (error) {
      console.error('连接钱包失败:', error);
      setError(error.message || '连接钱包失败');
    } finally {
      setIsConnecting(false);
    }
  };

  const installMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">需要安装MetaMask</h2>
          <p className="text-gray-600 mb-6">
            CultureBridge需要MetaMask钱包来连接区块链网络。请先安装MetaMask浏览器扩展。
          </p>
          <button
            onClick={installMetaMask}
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <ExternalLink size={20} />
            安装MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center">
        <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">连接钱包</h2>
        <p className="text-gray-600 mb-6">
          连接您的MetaMask钱包以开始使用CultureBridge平台
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span className="font-medium">连接失败</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {walletAddress && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle size={20} />
              <span className="font-medium">钱包已连接</span>
            </div>
            <p className="text-green-600 text-sm font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        )}

        <button
          onClick={connectWallet}
          disabled={isConnecting || walletAddress}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <Loader className="animate-spin" size={20} />
              连接中...
            </>
          ) : walletAddress ? (
            <>
              <CheckCircle size={20} />
              已连接
            </>
          ) : (
            <>
              <Wallet size={20} />
              连接MetaMask
            </>
          )}
        </button>

        <div className="mt-6 text-sm text-gray-500">
          <p>支持的网络：</p>
          <div className="flex justify-center gap-4 mt-2">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">BSC主网</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">BSC测试网</span>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <p>连接钱包即表示您同意我们的服务条款和隐私政策</p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;

