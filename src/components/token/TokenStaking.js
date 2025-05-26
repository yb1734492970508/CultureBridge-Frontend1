import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/token/TokenContext';
import { useBlockchain } from '../../context/blockchain';
import '../../styles/token.css';

/**
 * 文化通证质押组件
 * 允许用户质押代币获取奖励
 */
const TokenStaking = () => {
  const { account, active } = useBlockchain();
  const { 
    balance, 
    stakedAmount, 
    stakingReward, 
    isLoading, 
    error, 
    successMessage, 
    stake, 
    unstake, 
    claimReward, 
    refreshStakingInfo, 
    clearMessages 
  } = useToken();
  
  // 表单状态
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [apy, setApy] = useState(12); // 年化收益率，实际应从合约获取
  
  // 定时刷新质押信息
  useEffect(() => {
    if (active) {
      refreshStakingInfo();
      
      // 设置定时刷新
      const intervalId = setInterval(refreshStakingInfo, 60000); // 每分钟刷新一次
      
      return () => clearInterval(intervalId);
    }
  }, [active, refreshStakingInfo]);
  
  // 验证质押表单
  const validateStakeForm = () => {
    const newErrors = {};
    
    if (!stakeAmount) {
      newErrors.stake = '请输入质押金额';
    } else if (isNaN(parseFloat(stakeAmount)) || parseFloat(stakeAmount) <= 0) {
      newErrors.stake = '请输入有效的金额';
    } else if (parseFloat(stakeAmount) > parseFloat(balance)) {
      newErrors.stake = '余额不足';
    }
    
    setErrors(prev => ({ ...prev, stake: newErrors.stake }));
    return !newErrors.stake;
  };
  
  // 验证解除质押表单
  const validateUnstakeForm = () => {
    const newErrors = {};
    
    if (!unstakeAmount) {
      newErrors.unstake = '请输入解除质押金额';
    } else if (isNaN(parseFloat(unstakeAmount)) || parseFloat(unstakeAmount) <= 0) {
      newErrors.unstake = '请输入有效的金额';
    } else if (parseFloat(unstakeAmount) > parseFloat(stakedAmount)) {
      newErrors.unstake = '质押金额不足';
    }
    
    setErrors(prev => ({ ...prev, unstake: newErrors.unstake }));
    return !newErrors.unstake;
  };
  
  // 处理质押
  const handleStake = async (e) => {
    e.preventDefault();
    
    if (!validateStakeForm()) {
      return;
    }
    
    const result = await stake(stakeAmount);
    
    if (result.success) {
      setStakeAmount('');
    }
  };
  
  // 处理解除质押
  const handleUnstake = async (e) => {
    e.preventDefault();
    
    if (!validateUnstakeForm()) {
      return;
    }
    
    const result = await unstake(unstakeAmount);
    
    if (result.success) {
      setUnstakeAmount('');
    }
  };
  
  // 处理领取奖励
  const handleClaimReward = async () => {
    await claimReward();
  };
  
  // 设置最大质押金额
  const setMaxStakeAmount = () => {
    setStakeAmount(balance);
    setErrors(prev => ({ ...prev, stake: undefined }));
  };
  
  // 设置最大解除质押金额
  const setMaxUnstakeAmount = () => {
    setUnstakeAmount(stakedAmount);
    setErrors(prev => ({ ...prev, unstake: undefined }));
  };
  
  // 计算每日预计收益
  const calculateDailyReward = () => {
    if (!stakedAmount || parseFloat(stakedAmount) === 0) return '0';
    
    const dailyRate = apy / 365 / 100;
    const dailyReward = parseFloat(stakedAmount) * dailyRate;
    
    return dailyReward.toFixed(4);
  };
  
  return (
    <div className="token-container">
      <div className="token-header">
        <h2>代币质押</h2>
        <button 
          onClick={refreshStakingInfo} 
          disabled={isLoading || !active}
          className="token-btn refresh-btn"
        >
          {isLoading ? '加载中...' : '刷新数据'}
        </button>
      </div>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以使用质押功能</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={clearMessages} className="token-btn secondary-btn">关闭</button>
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
          <button onClick={clearMessages} className="token-btn secondary-btn">关闭</button>
        </div>
      )}
      
      {active && (
        <div className="staking-container">
          <div className="staking-card">
            <div className="staking-info">
              <h3>质押统计</h3>
              <div className="staking-stats">
                <div className="stat-item">
                  <div className="stat-label">已质押金额</div>
                  <div className="stat-value">
                    <span className="staked-amount">{stakedAmount}</span>
                    <span className="token-symbol">CULT</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">可用余额</div>
                  <div className="stat-value">
                    <span className="balance-amount">{balance}</span>
                    <span className="token-symbol">CULT</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">当前奖励</div>
                  <div className="stat-value">
                    <span className="reward-amount">{stakingReward}</span>
                    <span className="token-symbol">CULT</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">年化收益率</div>
                  <div className="stat-value">
                    <span className="apy-amount">{apy}%</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">每日预计收益</div>
                  <div className="stat-value">
                    <span className="daily-reward">{calculateDailyReward()}</span>
                    <span className="token-symbol">CULT</span>
                  </div>
                </div>
              </div>
              
              {parseFloat(stakingReward) > 0 && (
                <div className="claim-reward-section">
                  <button 
                    onClick={handleClaimReward} 
                    className="token-btn primary-btn"
                    disabled={isLoading || parseFloat(stakingReward) <= 0}
                    style={{ marginTop: '15px' }}
                  >
                    {isLoading ? '处理中...' : `领取 ${stakingReward} CULT 奖励`}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="staking-card">
            <div className="staking-actions-container">
              <div className="staking-form">
                <h3>质押代币</h3>
                <form onSubmit={handleStake}>
                  <div className="form-group">
                    <label htmlFor="stakeAmount">质押金额</label>
                    <div className="amount-input-container" style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="stakeAmount"
                        className={`form-control ${errors.stake ? 'error' : ''}`}
                        value={stakeAmount}
                        onChange={(e) => {
                          setStakeAmount(e.target.value);
                          if (errors.stake) {
                            setErrors(prev => ({ ...prev, stake: undefined }));
                          }
                        }}
                        placeholder="输入质押金额"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={setMaxStakeAmount}
                        className="max-btn"
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: '#1890ff',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        disabled={isLoading}
                      >
                        最大
                      </button>
                    </div>
                    {errors.stake && <div className="form-error">{errors.stake}</div>}
                    <div className="balance-hint" style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      可用余额: {balance} CULT
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="token-btn primary-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? '处理中...' : '质押'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="unstaking-form" style={{ marginTop: '20px' }}>
                <h3>解除质押</h3>
                <form onSubmit={handleUnstake}>
                  <div className="form-group">
                    <label htmlFor="unstakeAmount">解除金额</label>
                    <div className="amount-input-container" style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="unstakeAmount"
                        className={`form-control ${errors.unstake ? 'error' : ''}`}
                        value={unstakeAmount}
                        onChange={(e) => {
                          setUnstakeAmount(e.target.value);
                          if (errors.unstake) {
                            setErrors(prev => ({ ...prev, unstake: undefined }));
                          }
                        }}
                        placeholder="输入解除质押金额"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={setMaxUnstakeAmount}
                        className="max-btn"
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: '#1890ff',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        disabled={isLoading}
                      >
                        最大
                      </button>
                    </div>
                    {errors.unstake && <div className="form-error">{errors.unstake}</div>}
                    <div className="balance-hint" style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      已质押: {stakedAmount} CULT
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="token-btn danger-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? '处理中...' : '解除质押'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="token-section">
        <h3 className="token-section-title">质押说明</h3>
        <div className="staking-info-text">
          <p>通过质押CULT代币，您可以：</p>
          <ul>
            <li>获得年化{apy}%的质押奖励</li>
            <li>参与平台治理投票</li>
            <li>解锁平台特权功能</li>
            <li>提高声誉系统评分</li>
          </ul>
          <p>质押注意事项：</p>
          <ul>
            <li>质押奖励每天计算，可随时领取</li>
            <li>解除质押无锁定期，可随时取回</li>
            <li>质押和解除质押操作均需支付少量gas费用</li>
            <li>质押金额越多，获得的投票权重越高</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TokenStaking;
