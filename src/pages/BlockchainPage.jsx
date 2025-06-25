/**
 * 区块链页面组件
 * 展示区块链功能和代币系统
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  Coins, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Users,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Star,
  Trophy,
  Zap
} from 'lucide-react';

const BlockchainPage = () => {
  const [activeTab, setActiveTab] = useState('wallet');
  const [walletData, setWalletData] = useState({
    balance: 2850,
    usdValue: 142.50,
    stakingRewards: 125,
    totalEarned: 3200
  });

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'reward',
      amount: 50,
      description: '完成文化学习任务',
      time: '2小时前',
      status: 'completed'
    },
    {
      id: 2,
      type: 'stake',
      amount: -100,
      description: '质押代币获得奖励',
      time: '1天前',
      status: 'completed'
    },
    {
      id: 3,
      type: 'transfer',
      amount: -25,
      description: '转账给朋友',
      time: '2天前',
      status: 'completed'
    }
  ]);

  const [stakingPools, setStakingPools] = useState([
    {
      id: 1,
      name: '文化探索池',
      apy: 12.5,
      totalStaked: 150000,
      myStake: 500,
      rewards: 25,
      lockPeriod: '30天'
    },
    {
      id: 2,
      name: '语言学习池',
      apy: 15.2,
      totalStaked: 80000,
      myStake: 0,
      rewards: 0,
      lockPeriod: '60天'
    },
    {
      id: 3,
      name: '社区贡献池',
      apy: 18.7,
      totalStaked: 200000,
      myStake: 1000,
      rewards: 75,
      lockPeriod: '90天'
    }
  ]);

  const WalletOverview = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">CBT 钱包</h2>
              <p className="opacity-90">CultureBridge Token</p>
            </div>
            <Wallet className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl font-bold">{walletData.balance.toLocaleString()} CBT</div>
            <div className="text-lg opacity-90">≈ ${walletData.usdValue}</div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <Button variant="secondary" className="flex-1">
              <ArrowDownLeft className="w-4 h-4 mr-1" />
              接收
            </Button>
            <Button variant="secondary" className="flex-1">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              发送
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{walletData.stakingRewards}</div>
            <div className="text-sm text-gray-600">质押奖励</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{walletData.totalEarned}</div>
            <div className="text-sm text-gray-600">总收益</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">Gold</div>
            <div className="text-sm text-gray-600">会员等级</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const TransactionHistory = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">交易记录</h3>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-1" />
          查看全部
        </Button>
      </div>
      
      {transactions.map((tx) => (
        <Card key={tx.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'reward' ? 'bg-green-100 text-green-600' :
                  tx.type === 'stake' ? 'bg-blue-100 text-blue-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {tx.type === 'reward' ? <Gift className="w-5 h-5" /> :
                   tx.type === 'stake' ? <Shield className="w-5 h-5" /> :
                   <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-medium">{tx.description}</div>
                  <div className="text-sm text-gray-500">{tx.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} CBT
                </div>
                <Badge variant="outline" className="text-xs">
                  {tx.status === 'completed' ? '已完成' : '处理中'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const StakingPools = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">质押挖矿</h2>
        <p className="text-gray-600">质押CBT代币，获得丰厚奖励</p>
      </div>
      
      {stakingPools.map((pool) => (
        <Card key={pool.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{pool.name}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    APY {pool.apy}%
                  </Badge>
                  <span className="text-sm text-gray-600">锁定期: {pool.lockPeriod}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{pool.apy}%</div>
                <div className="text-sm text-gray-500">年化收益</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">总质押量</div>
                <div className="font-semibold">{pool.totalStaked.toLocaleString()} CBT</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">我的质押</div>
                <div className="font-semibold">{pool.myStake.toLocaleString()} CBT</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">待领取奖励</div>
                <div className="font-semibold text-green-600">{pool.rewards} CBT</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">质押进度</div>
                <Progress value={(pool.totalStaked / 300000) * 100} className="mt-1" />
              </div>
            </div>
            
            <div className="flex gap-2">
              {pool.myStake > 0 ? (
                <>
                  <Button size="sm" className="flex-1">增加质押</Button>
                  <Button size="sm" variant="outline">领取奖励</Button>
                  <Button size="sm" variant="outline">解除质押</Button>
                </>
              ) : (
                <Button size="sm" className="flex-1">开始质押</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const RewardsCenter = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">奖励中心</h2>
              <p className="opacity-90">完成任务，赚取CBT代币</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">125 CBT</div>
              <div className="text-sm opacity-90">今日可获得</div>
            </div>
            <div>
              <div className="text-2xl font-bold">3,200 CBT</div>
              <div className="text-sm opacity-90">累计获得</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { task: '每日签到', reward: 10, progress: 100, icon: '📅' },
          { task: '完成文化学习', reward: 25, progress: 60, icon: '📚' },
          { task: '参与社区讨论', reward: 15, progress: 80, icon: '💬' },
          { task: '分享文化内容', reward: 20, progress: 40, icon: '📤' },
          { task: '邀请新用户', reward: 50, progress: 20, icon: '👥' },
          { task: '语言练习', reward: 30, progress: 90, icon: '🗣️' }
        ].map((task, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{task.icon}</span>
                  <div>
                    <div className="font-medium">{task.task}</div>
                    <div className="text-sm text-gray-600">+{task.reward} CBT</div>
                  </div>
                </div>
                <Badge variant={task.progress === 100 ? "default" : "outline"}>
                  {task.progress === 100 ? '已完成' : '进行中'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>进度</span>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} />
              </div>
              
              {task.progress === 100 && (
                <Button size="sm" className="w-full mt-3">
                  <Coins className="w-4 h-4 mr-1" />
                  领取奖励
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部横幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <Coins className="inline-block w-10 h-10 mr-3" />
            区块链钱包
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            管理你的CBT代币，参与质押挖矿，获得丰厚奖励
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wallet">钱包</TabsTrigger>
            <TabsTrigger value="staking">质押</TabsTrigger>
            <TabsTrigger value="rewards">奖励</TabsTrigger>
            <TabsTrigger value="history">记录</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-6">
            <WalletOverview />
          </TabsContent>

          <TabsContent value="staking" className="space-y-6">
            <StakingPools />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <RewardsCenter />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlockchainPage;

