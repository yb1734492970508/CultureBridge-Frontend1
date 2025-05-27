import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/token/TokenContext';
import '../../styles/token.css';

/**
 * 通证质押组件 - 允许用户质押CULT通证获取奖励
 */
const TokenStaking = () => {
  const { 
    balance, 
    stakeInfo, 
    loading, 
    error, 
    success, 
    stakeTokens, 
    unstakeTokens, 
    claimRewards, 
    clearMessages, 
    formatTokenAmount 
  } = useToken();
  
  // 表单状态
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake'); // stake, unstake
  const [formError, setFormError] = useState({
    stakeAmount: '',
    unstakeAmount: ''
  });
  
  // 验证质押表单
  const validateStakeForm = () => {
    let isValid = true;
    const errors = {
      stakeAmount: '',
      unstakeAmount: ''
    };
    
    if (!stakeAmount) {
      errors.stakeAmount = '请输入质押金额';
      isValid = false;
    } else if (isNaN(stakeAmount) || parseFloat(stakeAmount) <= 0) {
      errors.stakeAmount = '请输入有效的金额';
      isValid = false;
    } else if (parseFloat(stakeAmount) > parseFloat(balance)) {
      errors.stakeAmount = '余额不足';
      isValid = false;
    }
    
    setFormError(errors);
    return isValid;
  };
  
  // 验证解除质押表单
  const validateUnstakeForm = () => {
    let isValid = true;
    const errors = {
      stakeAmount: '',
      unstakeAmount: ''
    };
    
    if (!unstakeAmount) {
      errors.unstakeAmount = '请输入解除质押金额';
      isValid = false;
    } else if (isNaN(unstakeAmount) || parseFloat(unstakeAmount) <= 0) {
      errors.unstakeAmount = '请输入有效的金额';
      isValid = false;
    } else if (parseFloat(unstakeAmount) > parseFloat(stakeInfo.amount)) {
      errors.unstakeAmount = '质押金额不足';
      isValid = false;
    }
    
    setFormError(errors);
    return isValid;
  };
  
  // 处理质押
  const handleStake = async (e) => {
    e.preventDefault();
    
    // 清除之前的消息
    clearMessages();
    
    // 验证表单
    if (!validateStakeForm()) return;
    
    // 执行质押
    await stakeTokens(stakeAmount);
    
    // 成功后清空表单
    if (!error) {
      setStakeAmount('');
    }
  };
  
  // 处理解除质押
  const handleUnstake = async (e) => {
    e.preventDefault();
    
    // 清除之前的消息
    clearMessages();
    
    // 验证表单
    if (!validateUnstakeForm()) return;
    
    // 执行解除质押
    await unstakeTokens(unstakeAmount);
    
    // 成功后清空表单
    if (!error) {
      setUnstakeAmount('');
    }
  };
  
  // 处理领取奖励
  const handleClaimRewards = async () => {
    // 清除之前的消息
    clearMessages();
    
    // 执行领取奖励
    await claimRewards();
  };
  
  // 计算年化收益率 (示例值，实际应从合约获取)
  const annualYield = '8.0';
  
  return (
    <div className="token-staking-card">
      <h3>CULT通证质押</h3>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}
      
      <div className="staking-info">
        <div className="staking-info-item">
          <span className="info-label">已质押金额</span>
          <span className="info-value">{formatTokenAmount(stakeInfo.amount)} CULT</span>
        </div>
        <div className="staking-info-item">
          <span className="info-label">可领取奖励</span>
          <span className="info-value">{formatTokenAmount(stakeInfo.rewards)} CULT</span>
        </div>
        <div className="staking-info-item">
          <span className="info-label">年化收益率</span>
          <span className="info-value">{annualYield}%</span>
        </div>
      </div>
      
      <div className="staking-tabs">
        <button 
          className={`tab-btn ${activeTab === 'stake' ? 'active' : ''}`}
          onClick={() => setActiveTab('stake')}
        >
          质押
        </button>
        <button 
          className={`tab-btn ${activeTab === 'unstake' ? 'active' : ''}`}
          onClick={() => setActiveTab('unstake')}
        >
          解除质押
        </button>
      </div>
      
      {activeTab === 'stake' ? (
        <form onSubmit={handleStake} className="staking-form">
          <div className="form-group">
            <label htmlFor="stakeAmount">质押金额</label>
            <div className="amount-input-container">
              <input
                type="text"
                id="stakeAmount"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                disabled={loading}
              />
              <span className="amount-symbol">CULT</span>
            </div>
            {formError.stakeAmount && (
              <p className="field-error">{formError.stakeAmount}</p>
            )}
            <p className="balance-info">
              可用余额: {formatTokenAmount(balance)} CULT
            </p>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStakeAmount(balance)}
              disabled={loading || parseFloat(balance) <= 0}
            >
              全部
            </button>
            
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  处理中...
                </>
              ) : (
                '质押'
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleUnstake} className="staking-form">
          <div className="form-group">
            <label htmlFor="unstakeAmount">解除质押金额</label>
            <div className="amount-input-container">
              <input
                type="text"
                id="unstakeAmount"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="0.0"
                disabled={loading}
              />
              <span className="amount-symbol">CULT</span>
            </div>
            {formError.unstakeAmount && (
              <p className="field-error">{formError.unstakeAmount}</p>
            )}
            <p className="balance-info">
              已质押金额: {formatTokenAmount(stakeInfo.amount)} CULT
            </p>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setUnstakeAmount(stakeInfo.amount)}
              disabled={loading || parseFloat(stakeInfo.amount) <= 0}
            >
              全部
            </button>
            
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  处理中...
                </>
              ) : (
                '解除质押'
              )}
            </button>
          </div>
        </form>
      )}
      
      <div className="claim-rewards-section">
        <h4>可领取奖励</h4>
        <div className="rewards-info">
          <span className="rewards-amount">{formatTokenAmount(stakeInfo.rewards)} CULT</span>
          <button
            className="btn-primary"
            onClick={handleClaimRewards}
            disabled={loading || parseFloat(stakeInfo.rewards) <= 0}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                处理中...
              </>
            ) : (
              '领取奖励'
            )}
          </button>
        </div>
      </div>
      
      <div className="staking-note">
        <p>
          <i className="fas fa-info-circle"></i>
          质押CULT通证可以获得平台奖励，同时增加您在平台上的声誉和权益。
        </p>
      </div>
    </div>
  );
};

export default TokenStaking;
