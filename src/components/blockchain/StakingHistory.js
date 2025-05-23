import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './StakingHistory.css';

// 质押合约ABI（简化版，实际使用时需要完整ABI）
const STAKING_ABI = [
  "function getUserStakingHistory(address user) external view returns (tuple(uint256 id, uint256 amount, uint256 startTime, uint256 endTime, uint256 lockPeriod, uint256 reward, bool claimed, uint256 withdrawTime, uint256 penaltyAmount)[])",
  "function getUserRewardHistory(address user) external view returns (tuple(uint256 stakeId, uint256 amount, uint256 timestamp)[])"
];

// 质押合约地址（测试网）
const STAKING_ADDRESS = "0x9C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

/**
 * 质押历史记录组件
 * 显示用户的质押历史和奖励领取记录
 */
const StakingHistory = () => {
  const { active, account, library } = useBlockchain();
  
  // 历史记录状态
  const [stakingHistory, setStakingHistory] = useState([]);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('staking'); // 'staking' 或 'rewards'
  
  // 初始化合约实例
  const getStakingContract = () => {
    if (!library || !active) return null;
    return new ethers.Contract(
      STAKING_ADDRESS,
      STAKING_ABI,
      library.getSigner()
    );
  };
  
  // 加载历史记录
  useEffect(() => {
    if (!active || !account || !library) return;
    
    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const stakingContract = getStakingContract();
        
        if (!stakingContract) {
          throw new Error('无法连接质押合约');
        }
        
        // 获取质押历史
        const stakingHistoryData = await stakingContract.getUserStakingHistory(account);
        
        // 处理质押历史数据
        const formattedStakingHistory = stakingHistoryData.map(item => ({
          id: item.id.toString(),
          amount: ethers.utils.formatEther(item.amount),
          startTime: new Date(item.startTime.toNumber() * 1000),
          endTime: new Date(item.endTime.toNumber() * 1000),
          lockPeriod: item.lockPeriod.toNumber() / 86400, // 转换为天数
          reward: ethers.utils.formatEther(item.reward),
          claimed: item.claimed,
          withdrawTime: item.withdrawTime.toNumber() > 0 
            ? new Date(item.withdrawTime.toNumber() * 1000) 
            : null,
          penaltyAmount: ethers.utils.formatEther(item.penaltyAmount),
          isEarlyWithdrawal: item.withdrawTime.toNumber() > 0 && 
            item.withdrawTime.toNumber() < item.endTime.toNumber()
        }));
        
        // 按开始时间降序排序
        formattedStakingHistory.sort((a, b) => b.startTime - a.startTime);
        
        setStakingHistory(formattedStakingHistory);
        
        // 获取奖励历史
        const rewardHistoryData = await stakingContract.getUserRewardHistory(account);
        
        // 处理奖励历史数据
        const formattedRewardHistory = rewardHistoryData.map(item => ({
          stakeId: item.stakeId.toString(),
          amount: ethers.utils.formatEther(item.amount),
          timestamp: new Date(item.timestamp.toNumber() * 1000)
        }));
        
        // 按时间戳降序排序
        formattedRewardHistory.sort((a, b) => b.timestamp - a.timestamp);
        
        setRewardHistory(formattedRewardHistory);
      } catch (err) {
        console.error('加载历史记录失败:', err);
        setError('加载历史记录失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, [active, account, library]);
  
  // 格式化日期
  const formatDate = (date) => {
    if (!date) return '未解除质押';
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 计算质押状态
  const getStakingStatus = (stake) => {
    const now = new Date();
    
    if (stake.withdrawTime) {
      return stake.isEarlyWithdrawal ? '提前解除' : '已完成';
    } else if (now > stake.endTime) {
      return '可解除';
    } else {
      return '锁定中';
    }
  };
  
  // 获取状态类名
  const getStatusClass = (stake) => {
    if (stake.withdrawTime) {
      return stake.isEarlyWithdrawal ? 'status-early-withdrawn' : 'status-completed';
    } else if (new Date() > stake.endTime) {
      return 'status-unlocked';
    } else {
      return 'status-locked';
    }
  };
  
  // 渲染质押历史标签页
  const renderStakingHistoryTab = () => {
    if (stakingHistory.length === 0) {
      return (
        <div className="empty-history">
          <p>暂无质押记录</p>
        </div>
      );
    }
    
    return (
      <div className="staking-history-list">
        {stakingHistory.map((stake) => (
          <div key={stake.id} className="history-item">
            <div className="history-header">
              <div className="history-id">质押 #{stake.id}</div>
              <div className={`history-status ${getStatusClass(stake)}`}>
                {getStakingStatus(stake)}
              </div>
            </div>
            
            <div className="history-details">
              <div className="history-detail">
                <span className="detail-label">质押金额</span>
                <span className="detail-value">{parseFloat(stake.amount).toLocaleString()} CBT</span>
              </div>
              
              <div className="history-detail">
                <span className="detail-label">锁定期</span>
                <span className="detail-value">{stake.lockPeriod} 天</span>
              </div>
              
              <div className="history-detail">
                <span className="detail-label">开始日期</span>
                <span className="detail-value">{formatDate(stake.startTime)}</span>
              </div>
              
              <div className="history-detail">
                <span className="detail-label">结束日期</span>
                <span className="detail-value">{formatDate(stake.endTime)}</span>
              </div>
              
              <div className="history-detail">
                <span className="detail-label">解除日期</span>
                <span className="detail-value">{formatDate(stake.withdrawTime)}</span>
              </div>
              
              <div className="history-detail">
                <span className="detail-label">奖励</span>
                <span className="detail-value">
                  {stake.withdrawTime && stake.isEarlyWithdrawal 
                    ? '0 CBT (提前解除)' 
                    : `${parseFloat(stake.reward).toLocaleString()} CBT ${stake.claimed ? '(已领取)' : '(未领取)'}`}
                </span>
              </div>
              
              {stake.withdrawTime && stake.isEarlyWithdrawal && parseFloat(stake.penaltyAmount) > 0 && (
                <div className="history-detail penalty">
                  <span className="detail-label">惩罚金额</span>
                  <span className="detail-value">{parseFloat(stake.penaltyAmount).toLocaleString()} CBT</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染奖励历史标签页
  const renderRewardHistoryTab = () => {
    if (rewardHistory.length === 0) {
      return (
        <div className="empty-history">
          <p>暂无奖励领取记录</p>
        </div>
      );
    }
    
    return (
      <div className="reward-history-list">
        {rewardHistory.map((reward, index) => (
          <div key={`${reward.stakeId}-${index}`} className="history-item">
            <div className="history-header">
              <div className="history-id">质押 #{reward.stakeId} 奖励</div>
              <div className="history-timestamp">{formatDate(reward.timestamp)}</div>
            </div>
            
            <div className="history-details">
              <div className="history-detail">
                <span className="detail-label">领取金额</span>
                <span className="detail-value reward-amount">{parseFloat(reward.amount).toLocaleString()} CBT</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="staking-history">
      <div className="history-header">
        <h3>质押历史记录</h3>
      </div>
      
      {!active ? (
        <div className="history-message">
          <p>请连接您的钱包以查看质押历史</p>
        </div>
      ) : (
        <div className="history-content">
          <div className="history-tabs">
            <button 
              className={`tab-button ${activeTab === 'staking' ? 'active' : ''}`}
              onClick={() => setActiveTab('staking')}
            >
              质押记录
            </button>
            <button 
              className={`tab-button ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => setActiveTab('rewards')}
            >
              奖励记录
            </button>
          </div>
          
          {isLoading ? (
            <div className="history-loading">
              <div className="loading-spinner"></div>
              <p>加载历史记录...</p>
            </div>
          ) : error ? (
            <div className="history-error">
              <p>{error}</p>
            </div>
          ) : (
            <div className="history-tab-content">
              {activeTab === 'staking' ? renderStakingHistoryTab() : renderRewardHistoryTab()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StakingHistory;
