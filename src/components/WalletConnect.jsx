import React, { useState, createContext, useContext } from 'react';
import { Wallet, Shield, Zap, Globe, ChevronRight } from 'lucide-react';

// 创建钱包上下文
const WalletContext = createContext();

// 钱包提供者组件
export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = (walletData) => {
    setWallet(walletData);
    setIsConnected(true);
  };

  const disconnectWallet = () => {
    setWallet(null);
    setIsConnected(false);
  };

  const value = {
    wallet,
    isConnected,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// 使用钱包的Hook
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

const WalletConnect = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: '连接到MetaMask钱包',
      popular: true
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: '扫码连接移动钱包',
      popular: false
    },
    {
      id: 'binance',
      name: 'Binance Wallet',
      icon: '🟡',
      description: '使用币安钱包',
      popular: true
    }
  ];

  const handleConnect = async (walletId) => {
    setIsConnecting(true);
    setSelectedWallet(walletId);

    try {
      // 模拟钱包连接过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟成功连接
      const mockWalletData = {
        address: '0x1234567890123456789012345678901234567890',
        balance: 125.5,
        network: 'BNB Smart Chain'
      };
      
      if (onConnect) {
        onConnect(mockWalletData);
      }
    } catch (error) {
      console.error('钱包连接失败:', error);
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">连接钱包</h2>
        <p className="text-gray-600">选择您的钱包开始文化交流之旅</p>
      </div>

      <div className="space-y-4 mb-8">
        {walletOptions.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleConnect(wallet.id)}
            disabled={isConnecting}
            className={`w-full p-4 border-2 rounded-xl transition-all duration-200 ${
              selectedWallet === wallet.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            } ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{wallet.icon}</div>
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{wallet.name}</span>
                    {wallet.popular && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        推荐
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{wallet.description}</p>
                </div>
              </div>
              <div className="flex items-center">
                {isConnecting && selectedWallet === wallet.id ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-xs text-gray-600">安全可靠</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="w-6 h-6 text-yellow-600 mb-2" />
            <span className="text-xs text-gray-600">快速连接</span>
          </div>
          <div className="flex flex-col items-center">
            <Globe className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs text-gray-600">全球通用</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          连接钱包即表示您同意我们的
          <a href="#" className="text-blue-600 hover:underline">服务条款</a>
          和
          <a href="#" className="text-blue-600 hover:underline">隐私政策</a>
        </p>
      </div>
    </div>
  );
};

export default WalletConnect;

