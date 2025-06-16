import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Calendar, 
  Coins, 
  TrendingUp, 
  Filter,
  Search,
  Download,
  ExternalLink,
  Award,
  MessageCircle,
  Languages,
  Users,
  Star,
  CheckCircle
} from 'lucide-react';

const RewardHistory = ({ user }) => {
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState({
    totalRewards: 0,
    totalAmount: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  // 模拟奖励数据
  useEffect(() => {
    const mockRewards = [
      {
        id: 1,
        type: 'translation',
        category: 'LEARNING_REWARD',
        amount: 1.0,
        description: '语音翻译奖励',
        details: '中文 → 英语翻译',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'completed',
        txHash: '0x1234...5678'
      },
      {
        id: 2,
        type: 'message',
        category: 'GENERAL',
        amount: 0.1,
        description: '发送消息奖励',
        details: '在文化交流群发送消息',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'completed',
        txHash: '0x2345...6789'
      },
      {
        id: 3,
        type: 'daily',
        category: 'GENERAL',
        amount: 0.5,
        description: '每日登录奖励',
        details: '连续登录第7天',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        status: 'completed',
        txHash: '0x3456...7890'
      },
      {
        id: 4,
        type: 'voice',
        category: 'LEARNING_REWARD',
        amount: 0.2,
        description: '语音消息奖励',
        details: '发送语音消息',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        status: 'completed',
        txHash: '0x4567...8901'
      },
      {
        id: 5,
        type: 'cultural',
        category: 'CULTURAL_REWARD',
        amount: 2.0,
        description: '文化分享奖励',
        details: '分享中国传统文化',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        status: 'completed',
        txHash: '0x5678...9012'
      },
      {
        id: 6,
        type: 'referral',
        category: 'REFERRAL_REWARD',
        amount: 5.0,
        description: '推荐好友奖励',
        details: '成功推荐新用户',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        status: 'completed',
        txHash: '0x6789...0123'
      },
      {
        id: 7,
        type: 'achievement',
        category: 'ACHIEVEMENT_REWARD',
        amount: 10.0,
        description: '成就解锁奖励',
        details: '解锁"翻译达人"成就',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        status: 'completed',
        txHash: '0x7890...1234'
      }
    ];

    setRewards(mockRewards);
    setFilteredRewards(mockRewards);

    // 计算统计数据
    const totalAmount = mockRewards.reduce((sum, reward) => sum + reward.amount, 0);
    const thisMonth = mockRewards
      .filter(reward => {
        const rewardDate = new Date(reward.timestamp);
        const now = new Date();
        return rewardDate.getMonth() === now.getMonth() && rewardDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, reward) => sum + reward.amount, 0);

    setStats({
      totalRewards: mockRewards.length,
      totalAmount: totalAmount,
      thisMonth: thisMonth,
      lastMonth: totalAmount - thisMonth
    });
  }, []);

  // 过滤奖励
  useEffect(() => {
    let filtered = rewards;

    // 按类型过滤
    if (filter !== 'all') {
      filtered = filtered.filter(reward => reward.type === filter);
    }

    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(reward =>
        reward.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 按日期范围过滤
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          filterDate = null;
      }

      if (filterDate) {
        filtered = filtered.filter(reward => new Date(reward.timestamp) >= filterDate);
      }
    }

    setFilteredRewards(filtered);
  }, [rewards, filter, searchTerm, dateRange]);

  const getRewardIcon = (type) => {
    const icons = {
      translation: <Languages className="text-blue-500" size={20} />,
      message: <MessageCircle className="text-green-500" size={20} />,
      daily: <Calendar className="text-orange-500" size={20} />,
      voice: <MessageCircle className="text-purple-500" size={20} />,
      cultural: <Star className="text-yellow-500" size={20} />,
      referral: <Users className="text-indigo-500" size={20} />,
      achievement: <Award className="text-red-500" size={20} />
    };
    return icons[type] || <Gift className="text-gray-500" size={20} />;
  };

  const getRewardTypeLabel = (type) => {
    const labels = {
      translation: '翻译奖励',
      message: '消息奖励',
      daily: '每日奖励',
      voice: '语音奖励',
      cultural: '文化奖励',
      referral: '推荐奖励',
      achievement: '成就奖励'
    };
    return labels[type] || '其他奖励';
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

  const exportRewards = () => {
    // 导出奖励记录为CSV
    const csvContent = [
      ['时间', '类型', '描述', '金额', '状态', '交易哈希'],
      ...filteredRewards.map(reward => [
        new Date(reward.timestamp).toLocaleString(),
        getRewardTypeLabel(reward.type),
        reward.description,
        `${reward.amount} CBT`,
        reward.status === 'completed' ? '已完成' : '处理中',
        reward.txHash
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reward_history.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">奖励记录</h1>
          <p className="text-gray-600 mt-2">查看您的CBT代币奖励历史和统计信息</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500">总奖励次数</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalRewards}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Coins className="text-green-600" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500">总奖励金额</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalAmount.toFixed(2)} CBT</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500">本月奖励</div>
                <div className="text-2xl font-bold text-gray-900">{stats.thisMonth.toFixed(2)} CBT</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500">上月奖励</div>
                <div className="text-2xl font-bold text-gray-900">{stats.lastMonth.toFixed(2)} CBT</div>
              </div>
            </div>
          </div>
        </div>

        {/* 过滤和搜索 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="搜索奖励记录..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 类型过滤 */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部类型</option>
                <option value="translation">翻译奖励</option>
                <option value="message">消息奖励</option>
                <option value="daily">每日奖励</option>
                <option value="voice">语音奖励</option>
                <option value="cultural">文化奖励</option>
                <option value="referral">推荐奖励</option>
                <option value="achievement">成就奖励</option>
              </select>
            </div>

            {/* 日期过滤 */}
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部时间</option>
                <option value="today">今天</option>
                <option value="week">最近一周</option>
                <option value="month">最近一月</option>
              </select>
            </div>

            {/* 导出按钮 */}
            <button
              onClick={exportRewards}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              导出
            </button>
          </div>
        </div>

        {/* 奖励列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              奖励记录 ({filteredRewards.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredRewards.length === 0 ? (
              <div className="p-12 text-center">
                <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无奖励记录</h3>
                <p className="text-gray-500">开始使用平台功能来获得CBT奖励吧！</p>
              </div>
            ) : (
              filteredRewards.map((reward) => (
                <div key={reward.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getRewardIcon(reward.type)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{reward.description}</div>
                        <div className="text-sm text-gray-500">{reward.details}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                          <Calendar size={12} />
                          {formatTime(reward.timestamp)}
                          <span className="mx-1">•</span>
                          <span className="font-mono">{reward.txHash}</span>
                          <button className="text-blue-500 hover:text-blue-700">
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-lg">
                        +{reward.amount.toFixed(2)} CBT
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CheckCircle size={14} className="text-green-500" />
                        {reward.status === 'completed' ? '已完成' : '处理中'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 奖励规则说明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">奖励规则说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">基础奖励</h4>
              <ul className="space-y-1">
                <li>• 发送消息：0.1 CBT</li>
                <li>• 语音消息：0.2 CBT</li>
                <li>• 每日登录：0.5 CBT</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">学习奖励</h4>
              <ul className="space-y-1">
                <li>• 文本翻译：0.5-2.0 CBT</li>
                <li>• 语音翻译：1.0-3.0 CBT</li>
                <li>• 文化分享：2.0-5.0 CBT</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardHistory;

