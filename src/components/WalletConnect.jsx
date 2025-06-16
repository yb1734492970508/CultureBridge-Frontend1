import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Coins,
  TrendingUp,
  Award,
  Clock,
  Users,
  Activity
} from 'lucide-react';

const WalletConnect = ({ onWalletConnected, onDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [cbtBalance, setCbtBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [rewardStats, setRewardStats] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // 模拟数据
  const mockRewardStats = {
    totalEarned: 1234.56,
    todayEarned: 45.2,
    weeklyEarned: 234.8,
    rank: 156,
    level: 'Gold',
    nextLevelProgress: 75,
    achievements: [
      { name: '早期用户', icon: '🏆', earned: true },
      { name: '聊天达人', icon: '💬', earned: true },
      { name: '翻译专家', icon: '🌐', earned: false },
      { name: '文化大使', icon: '🎭', earned: false }
    ]
  };

  const mockTransactions = [
    { id: 1, type: 'reward', amount: '+5.0', description: '语音翻译奖励', time: '2分钟前', status: 'completed' },
    { id: 2, type: 'reward', amount: '+10.0', description: '文化交流参与', time: '1小时前', status: 'completed' },
    { id: 3, type: 'transfer', amount: '-20.0', description: '转账给朋友', time: '3小时前', status: 'completed' },
    { id: 4, type: 'reward', amount: '+1.0', description: '每日登录奖励', time: '1天前', status: 'completed' },
    { id: 5, type: 'reward', amount: '+15.0', description: '完成课程学习', time: '2天前', status: 'completed' }
  ];

  useEffect(() => {
    checkWalletConnection();
    setRewardStats(mockRewardStats);
    setTransactions(mockTransactions);
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          await loadWalletData(accounts[0]);
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

    setIsLoading(true);
    setError('');

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        await loadWalletData(accounts[0]);
        onWalletConnected && onWalletConnected(accounts[0]);
      }
    } catch (error) {
      setError('连接钱包失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletData = async (address) => {
    try {
      // 获取网络信息
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkName = chainId === '0x38' ? 'BSC Mainnet' : 
                         chainId === '0x61' ? 'BSC Testnet' : 
                         'Unknown Network';
      
      setNetworkInfo({ chainId, name: networkName });

      // 模拟获取余额
      setBalance('0.1234');
      setCbtBalance('1234.56');
    } catch (error) {
      console.error('加载钱包数据失败:', error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setBalance('0');
    setCbtBalance('0');
    setNetworkInfo(null);
    onDisconnect && onDisconnect();
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'reward':
        return <Award className="h-4 w-4 text-green-500" />;
      case 'transfer':
        return <ExternalLink className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">连接钱包</h2>
          <p className="text-gray-600 mb-6">
            连接您的Web3钱包开始使用CultureBridge平台
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Wallet className="h-5 w-5" />
                <span>连接MetaMask</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            支持MetaMask、WalletConnect等主流钱包
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 钱包信息卡片 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">钱包已连接</h2>
              <p className="text-sm text-gray-600">{networkInfo?.name}</p>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            断开连接
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 钱包地址 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">钱包地址</span>
              <button
                onClick={copyAddress}
                className="text-blue-600 hover:text-blue-700"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-lg font-mono text-gray-900">{formatAddress(walletAddress)}</p>
          </div>

          {/* BNB余额 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-700 block mb-2">BNB余额</span>
            <p className="text-lg font-bold text-gray-900">{balance} BNB</p>
          </div>

          {/* CBT余额 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-700 block mb-2">CBT代币</span>
            <p className="text-lg font-bold text-blue-600">{cbtBalance} CBT</p>
          </div>
        </div>
      </div>

      {/* 奖励统计 */}
      {rewardStats && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">奖励统计</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{rewardStats.totalEarned}</div>
              <div className="text-sm text-gray-600">总收益 (CBT)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{rewardStats.todayEarned}</div>
              <div className="text-sm text-gray-600">今日收益</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">#{rewardStats.rank}</div>
              <div className="text-sm text-gray-600">排名</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{rewardStats.level}</div>
              <div className="text-sm text-gray-600">等级</div>
            </div>
          </div>

          {/* 等级进度 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">下一等级进度</span>
              <span className="text-sm text-gray-600">{rewardStats.nextLevelProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${rewardStats.nextLevelProgress}%` }}
              ></div>
            </div>
          </div>

          {/* 成就徽章 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">成就徽章</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {rewardStats.achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-2 text-center ${
                    achievement.earned 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <div className={`text-sm font-medium ${
                    achievement.earned ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {achievement.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 交易历史 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">最近交易</h3>
        
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getTransactionIcon(tx.type)}
                <div>
                  <div className="font-medium text-gray-900">{tx.description}</div>
                  <div className="text-sm text-gray-600 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{tx.time}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${
                  tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.amount} CBT
                </div>
                <div className="text-xs text-gray-500">{tx.status}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            查看全部交易记录
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;

