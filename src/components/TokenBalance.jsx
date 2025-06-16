import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Award,
  Calendar,
  Activity,
  BarChart3,
  Wallet,
  Send,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

const TokenBalance = ({ user }) => {
  const [balance, setBalance] = useState(user?.balance || 0);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: user?.totalEarned || 0,
    totalSpent: user?.totalSpent || 0,
    transactionCount: user?.transactionCount || 0,
    weeklyChange: 12.5
  });

  // 模拟交易历史
  useEffect(() => {
    const mockTransactions = [
      {
        id: 1,
        type: 'reward',
        amount: 1.0,
        description: '语音翻译奖励',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'completed'
      },
      {
        id: 2,
        type: 'reward',
        amount: 0.5,
        description: '文本翻译奖励',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'completed'
      },
      {
        id: 3,
        type: 'reward',
        amount: 0.2,
        description: '发送语音消息奖励',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        status: 'completed'
      },
      {
        id: 4,
        type: 'transfer',
        amount: -5.0,
        description: '文化交流转账',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        status: 'completed'
      },
      {
        id: 5,
        type: 'reward',
        amount: 1.0,
        description: '每日登录奖励',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        status: 'completed'
      }
    ];
    setTransactions(mockTransactions);
  }, []);

  const refreshBalance = async () => {
    setIsLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setBalance(balance + Math.random() * 0.1);
      setIsLoading(false);
    }, 1000);
  };

  const formatAmount = (amount) => {
    return Math.abs(amount).toFixed(2);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      return `${days}天前`;
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'reward':
        return <ArrowDownLeft className="text-green-500" size={16} />;
      case 'transfer':
        return <ArrowUpRight className="text-red-500" size={16} />;
      default:
        return <Activity className="text-gray-500" size={16} />;
    }
  };

  const getUserLevel = (balance) => {
    if (balance >= 10000) return { name: '钻石', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (balance >= 2000) return { name: '铂金', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (balance >= 500) return { name: '黄金', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (balance >= 100) return { name: '白银', color: 'text-gray-600', bg: 'bg-gray-100' };
    return { name: '青铜', color: 'text-amber-600', bg: 'bg-amber-100' };
  };

  const level = getUserLevel(balance);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">代币余额</h1>
          <p className="text-gray-600 mt-2">查看您的CBT代币余额和交易记录</p>
        </div>

        {/* 余额卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 主余额卡片 */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Coins size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">CBT余额</h2>
                  <p className="text-blue-100">CultureBridge Token</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isBalanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button
                  onClick={refreshBalance}
                  disabled={isLoading}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-4xl font-bold mb-2">
                {isBalanceVisible ? `${balance.toFixed(2)} CBT` : '••••••'}
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-300" />
                <span className="text-green-300">+{stats.weeklyChange}%</span>
                <span className="text-blue-100">本周</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className={`px-3 py-1 rounded-full ${level.bg} ${level.color} text-sm font-medium`}>
                {level.name}等级
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">钱包地址</div>
                <div className="font-mono text-sm">
                  {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
                </div>
              </div>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">总收入</div>
                  <div className="text-xl font-bold text-gray-900">{stats.totalEarned.toFixed(2)} CBT</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="text-red-600" size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">总支出</div>
                  <div className="text-xl font-bold text-gray-900">{stats.totalSpent.toFixed(2)} CBT</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-blue-600" size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">交易次数</div>
                  <div className="text-xl font-bold text-gray-900">{stats.transactionCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 交易历史 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">交易记录</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                查看全部
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar size={14} />
                        {formatTime(transaction.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} CBT
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.status === 'completed' ? '已完成' : '处理中'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3">
            <Send size={20} />
            <span className="font-medium">转账CBT</span>
          </button>
          <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3">
            <Award size={20} />
            <span className="font-medium">领取奖励</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenBalance;

