import React, { useState, useEffect } from 'react';
import { tokenAPI, blockchainAPI } from '../../services/api';
import socketService from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler, useAsyncError } from '../../utils/errorHandler';
import { Wallet, Send, Gift, TrendingUp, Award, Clock, RefreshCw } from 'lucide-react';
import './EnhancedCBTManager.css';

function EnhancedCBTManager() {
  const { user, isAuthenticated } = useAuth();
  const [tokenBalance, setTokenBalance] = useState('0');
  const [walletInfo, setWalletInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [tokenStats, setTokenStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const { error, loading, executeAsync, clearError } = useAsyncError();

  // 转账状态
  const [transferForm, setTransferForm] = useState({
    recipient: '',
    amount: '',
    note: ''
  });
  const [transferLoading, setTransferLoading] = useState(false);

  // 质押状态
  const [stakeForm, setStakeForm] = useState({
    amount: '',
    duration: '30' // 默认30天
  });
  const [stakeLoading, setStakeLoading] = useState(false);
  const [stakedAmount, setStakedAmount] = useState('0');
  const [stakingRewards, setStakingRewards] = useState('0');

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();

      // 监听实时更新
      socketService.on('token:balance_updated', handleBalanceUpdate);
      socketService.on('token:reward_received', handleRewardReceived);
      socketService.on('token:transfer_complete', handleTransferComplete);
      socketService.on('blockchain:transaction_update', handleTransactionUpdate);

      return () => {
        socketService.off('token:balance_updated', handleBalanceUpdate);
        socketService.off('token:reward_received', handleRewardReceived);
        socketService.off('token:transfer_complete', handleTransferComplete);
        socketService.off('blockchain:transaction_update', handleTransactionUpdate);
      };
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    await executeAsync(async () => {
      const [balanceRes, walletRes, transactionsRes, rewardsRes, statsRes] = await Promise.all([
        tokenAPI.getBalance(),
        blockchainAPI.getWalletInfo(),
        tokenAPI.getTransactions({ limit: 10 }),
        tokenAPI.getRewardHistory({ limit: 5 }),
        tokenAPI.getTokenStats()
      ]);

      setTokenBalance(balanceRes.balance);
      setWalletInfo(walletRes.wallet);
      setTransactions(transactionsRes.transactions);
      setRewards(rewardsRes.rewards);
      setTokenStats(statsRes.stats);
      setStakedAmount(balanceRes.staked || '0');
      setStakingRewards(balanceRes.stakingRewards || '0');
    });
  };

  const handleBalanceUpdate = (data) => {
    setTokenBalance(data.balance);
    if (data.staked) setStakedAmount(data.staked);
    if (data.stakingRewards) setStakingRewards(data.stakingRewards);
  };

  const handleRewardReceived = (data) => {
    setRewards(prev => [data, ...prev.slice(0, 4)]);
    // 可以显示通知
    console.log('收到奖励:', data);
  };

  const handleTransferComplete = (data) => {
    setTransactions(prev => [data, ...prev.slice(0, 9)]);
    fetchAllData(); // 刷新余额
  };

  const handleTransactionUpdate = (data) => {
    setTransactions(prev => 
      prev.map(tx => tx.hash === data.hash ? { ...tx, ...data } : tx)
    );
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferForm.recipient || !transferForm.amount) return;

    setTransferLoading(true);
    await executeAsync(async () => {
      const response = await tokenAPI.transfer({
        to: transferForm.recipient,
        amount: transferForm.amount,
        note: transferForm.note
      });
      
      setTransferForm({ recipient: '', amount: '', note: '' });
      // 交易完成会通过socket更新
    });
    setTransferLoading(false);
  };

  const handleStake = async (e) => {
    e.preventDefault();
    if (!stakeForm.amount) return;

    setStakeLoading(true);
    await executeAsync(async () => {
      const response = await tokenAPI.stake({
        amount: stakeForm.amount,
        duration: parseInt(stakeForm.duration)
      });
      
      setStakeForm({ amount: '', duration: '30' });
      fetchAllData(); // 刷新数据
    });
    setStakeLoading(false);
  };

  const handleUnstake = async (amount) => {
    await executeAsync(async () => {
      const response = await tokenAPI.unstake({ amount });
      fetchAllData(); // 刷新数据
    });
  };

  const handleDailyCheckIn = async () => {
    await executeAsync(async () => {
      const response = await tokenAPI.dailyCheckIn();
      // 奖励会通过socket更新
    });
  };

  const claimReward = async (rewardType) => {
    await executeAsync(async () => {
      const response = await tokenAPI.claimReward(rewardType);
      fetchAllData(); // 刷新数据
    });
  };

  if (loading) return <div className="loading">加载CBT代币信息...</div>;
  if (error) return <div className="error-message">错误: {error.message}</div>;
  if (!isAuthenticated) return <div className="not-authenticated">请登录以查看CBT代币管理。</div>;

  return (
    <div className="enhanced-cbt-manager">
      <div className="manager-header">
        <h2>CBT代币管理中心</h2>
        <button onClick={fetchAllData} className="refresh-btn">
          <RefreshCw size={20} /> 刷新
        </button>
      </div>

      {/* 余额概览 */}
      <div className="balance-overview">
        <div className="balance-card main-balance">
          <div className="balance-icon">
            <Wallet size={32} />
          </div>
          <div className="balance-info">
            <h3>可用余额</h3>
            <p className="balance-amount">{parseFloat(tokenBalance).toLocaleString()} CBT</p>
            <span className="balance-usd">≈ ${(parseFloat(tokenBalance) * (tokenStats.price || 0)).toFixed(2)}</span>
          </div>
        </div>

        <div className="balance-card staked-balance">
          <div className="balance-icon">
            <TrendingUp size={32} />
          </div>
          <div className="balance-info">
            <h3>质押余额</h3>
            <p className="balance-amount">{parseFloat(stakedAmount).toLocaleString()} CBT</p>
            <span className="balance-rewards">奖励: {parseFloat(stakingRewards).toFixed(4)} CBT</span>
          </div>
        </div>

        <div className="balance-card total-balance">
          <div className="balance-icon">
            <Award size={32} />
          </div>
          <div className="balance-info">
            <h3>总资产</h3>
            <p className="balance-amount">
              {(parseFloat(tokenBalance) + parseFloat(stakedAmount)).toLocaleString()} CBT
            </p>
            <span className="balance-growth">+{parseFloat(stakingRewards).toFixed(4)} 待领取</span>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="quick-actions">
        <button onClick={handleDailyCheckIn} className="quick-action-btn">
          <Gift size={20} />
          每日签到
        </button>
        <button onClick={() => claimReward('staking')} className="quick-action-btn" disabled={parseFloat(stakingRewards) === 0}>
          <Award size={20} />
          领取奖励
        </button>
        <button onClick={() => setActiveTab('transfer')} className="quick-action-btn">
          <Send size={20} />
          转账
        </button>
        <button onClick={() => setActiveTab('staking')} className="quick-action-btn">
          <TrendingUp size={20} />
          质押
        </button>
      </div>

      {/* 标签页 */}
      <div className="manager-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          概览
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfer')}
        >
          转账
        </button>
        <button 
          className={`tab-btn ${activeTab === 'staking' ? 'active' : ''}`}
          onClick={() => setActiveTab('staking')}
        >
          质押
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          历史记录
        </button>
      </div>

      {/* 标签页内容 */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>代币价格</h4>
                <p>${tokenStats.price || '0.00'}</p>
                <span className={`price-change ${(tokenStats.priceChange || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {(tokenStats.priceChange || 0) >= 0 ? '+' : ''}{(tokenStats.priceChange || 0).toFixed(2)}%
                </span>
              </div>
              <div className="stat-card">
                <h4>市值</h4>
                <p>${(tokenStats.marketCap || 0).toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h4>24h交易量</h4>
                <p>${(tokenStats.volume24h || 0).toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h4>流通供应量</h4>
                <p>{(tokenStats.circulatingSupply || 0).toLocaleString()} CBT</p>
              </div>
            </div>

            <div className="recent-activity">
              <h3>最近奖励</h3>
              <div className="rewards-list">
                {rewards.length === 0 ? (
                  <p className="no-data">暂无奖励记录</p>
                ) : (
                  rewards.map((reward, index) => (
                    <div key={index} className="reward-item">
                      <div className="reward-icon">
                        <Gift size={20} />
                      </div>
                      <div className="reward-info">
                        <p className="reward-type">{reward.type}</p>
                        <span className="reward-time">{new Date(reward.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="reward-amount">
                        +{reward.amount} CBT
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div className="transfer-tab">
            <form onSubmit={handleTransfer} className="transfer-form">
              <h3>转账CBT代币</h3>
              
              <div className="form-group">
                <label>接收地址</label>
                <input
                  type="text"
                  value={transferForm.recipient}
                  onChange={(e) => setTransferForm({...transferForm, recipient: e.target.value})}
                  placeholder="输入钱包地址或用户名"
                  required
                />
              </div>

              <div className="form-group">
                <label>转账数量</label>
                <div className="amount-input-group">
                  <input
                    type="number"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                    placeholder="0.00"
                    step="0.0001"
                    min="0"
                    max={tokenBalance}
                    required
                  />
                  <span className="token-symbol">CBT</span>
                  <button 
                    type="button" 
                    onClick={() => setTransferForm({...transferForm, amount: tokenBalance})}
                    className="max-btn"
                  >
                    最大
                  </button>
                </div>
                <span className="available-balance">可用: {parseFloat(tokenBalance).toLocaleString()} CBT</span>
              </div>

              <div className="form-group">
                <label>备注 (可选)</label>
                <input
                  type="text"
                  value={transferForm.note}
                  onChange={(e) => setTransferForm({...transferForm, note: e.target.value})}
                  placeholder="转账备注"
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={transferLoading || !transferForm.recipient || !transferForm.amount}
              >
                {transferLoading ? '转账中...' : '确认转账'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'staking' && (
          <div className="staking-tab">
            <div className="staking-overview">
              <div className="staking-stats">
                <div className="staking-stat">
                  <h4>已质押</h4>
                  <p>{parseFloat(stakedAmount).toLocaleString()} CBT</p>
                </div>
                <div className="staking-stat">
                  <h4>待领取奖励</h4>
                  <p>{parseFloat(stakingRewards).toFixed(4)} CBT</p>
                </div>
                <div className="staking-stat">
                  <h4>年化收益率</h4>
                  <p>{tokenStats.stakingAPY || '12.5'}%</p>
                </div>
              </div>

              {parseFloat(stakingRewards) > 0 && (
                <button 
                  onClick={() => claimReward('staking')} 
                  className="claim-rewards-btn"
                >
                  领取奖励
                </button>
              )}
            </div>

            <form onSubmit={handleStake} className="staking-form">
              <h3>质押CBT代币</h3>
              
              <div className="form-group">
                <label>质押数量</label>
                <div className="amount-input-group">
                  <input
                    type="number"
                    value={stakeForm.amount}
                    onChange={(e) => setStakeForm({...stakeForm, amount: e.target.value})}
                    placeholder="0.00"
                    step="0.0001"
                    min="0"
                    max={tokenBalance}
                    required
                  />
                  <span className="token-symbol">CBT</span>
                  <button 
                    type="button" 
                    onClick={() => setStakeForm({...stakeForm, amount: tokenBalance})}
                    className="max-btn"
                  >
                    最大
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>质押期限</label>
                <select 
                  value={stakeForm.duration}
                  onChange={(e) => setStakeForm({...stakeForm, duration: e.target.value})}
                >
                  <option value="30">30天 (10% APY)</option>
                  <option value="90">90天 (12.5% APY)</option>
                  <option value="180">180天 (15% APY)</option>
                  <option value="365">365天 (20% APY)</option>
                </select>
              </div>

              <div className="staking-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={stakeLoading || !stakeForm.amount}
                >
                  {stakeLoading ? '质押中...' : '开始质押'}
                </button>
                
                {parseFloat(stakedAmount) > 0 && (
                  <button 
                    type="button"
                    onClick={() => handleUnstake(stakedAmount)}
                    className="unstake-btn"
                  >
                    取消质押
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <h3>交易历史</h3>
            <div className="transactions-list">
              {transactions.length === 0 ? (
                <p className="no-data">暂无交易记录</p>
              ) : (
                transactions.map((tx, index) => (
                  <div key={index} className="transaction-item">
                    <div className="tx-icon">
                      {tx.type === 'send' ? <Send size={20} /> : 
                       tx.type === 'receive' ? <TrendingUp size={20} /> : 
                       <Award size={20} />}
                    </div>
                    <div className="tx-info">
                      <p className="tx-type">{tx.type === 'send' ? '转出' : tx.type === 'receive' ? '转入' : '奖励'}</p>
                      <span className="tx-time">{new Date(tx.timestamp).toLocaleString()}</span>
                      {tx.note && <span className="tx-note">{tx.note}</span>}
                    </div>
                    <div className="tx-amount">
                      <span className={tx.type === 'send' ? 'negative' : 'positive'}>
                        {tx.type === 'send' ? '-' : '+'}{tx.amount} CBT
                      </span>
                      <span className="tx-status">{tx.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedCBTManager;

