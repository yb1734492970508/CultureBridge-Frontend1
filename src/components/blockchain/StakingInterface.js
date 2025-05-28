import React, { useContext, useState } from 'react';
import { TokenContext } from '../../context/blockchain/TokenContext';
import { BlockchainContext } from '../../context/blockchain';
import './StakingInterface.css';

/**
 * 文化通证质押界面组件
 * 允许用户质押CULT通证、解除质押和领取奖励
 */
const StakingInterface = () => {
  const { 
    userBalance, 
    stakedAmount, 
    pendingRewards, 
    allowance,
    approveContract, 
    stakeTokens, 
    unstakeTokens, 
    claimStakingRewards, 
    isLoading, 
    error 
  } = useContext(TokenContext);
  const { isConnected } = useContext(BlockchainContext);
  
  // 表单状态
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState('stake'); // 'stake', 'unstake', 'rewards'
  const [txHash, setTxHash] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);
  
  // 质押合约地址
  const stakingContractAddress = "0x0987654321098765432109876543210987654321"; // 示例地址
  
  // 处理质押
  const handleStake = async (e) => {
    e.preventDefault();
    
    // 重置状态
    setFormError('');
    setTxHash('');
    setTxSuccess(false);
    
    // 表单验证
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setFormError('请输入有效的质押金额');
      return;
    }
    
    if (parseFloat(stakeAmount) > parseFloat(userBalance)) {
      setFormError('余额不足');
      return;
    }
    
    try {
      // 检查授权
      if (parseFloat(allowance) < parseFloat(stakeAmount)) {
        // 需要先授权
        await approveContract(stakingContractAddress, stakeAmount);
      }
      
      // 执行质押
      const tx = await stakeTokens(stakeAmount);
      setTxHash(tx.hash);
      setTxSuccess(true);
      
      // 清空表单
      setStakeAmount('');
    } catch (err) {
      console.error('质押失败:', err);
      setFormError(err.message || '质押失败，请重试');
    }
  };
  
  // 处理解除质押
  const handleUnstake = async (e) => {
    e.preventDefault();
    
    // 重置状态
    setFormError('');
    setTxHash('');
    setTxSuccess(false);
    
    // 表单验证
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setFormError('请输入有效的解除质押金额');
      return;
    }
    
    if (parseFloat(unstakeAmount) > parseFloat(stakedAmount)) {
      setFormError('解除质押金额超过已质押金额');
      return;
    }
    
    try {
      // 执行解除质押
      const tx = await unstakeTokens(unstakeAmount);
      setTxHash(tx.hash);
      setTxSuccess(true);
      
      // 清空表单
      setUnstakeAmount('');
    } catch (err) {
      console.error('解除质押失败:', err);
      setFormError(err.message || '解除质押失败，请重试');
    }
  };
  
  // 处理领取奖励
  const handleClaimRewards = async () => {
    // 重置状态
    setFormError('');
    setTxHash('');
    setTxSuccess(false);
    
    // 验证是否有可领取的奖励
    if (parseFloat(pendingRewards) <= 0) {
      setFormError('没有可领取的奖励');
      return;
    }
    
    try {
      // 执行领取奖励
      const tx = await claimStakingRewards();
      setTxHash(tx.hash);
      setTxSuccess(true);
    } catch (err) {
      console.error('领取奖励失败:', err);
      setFormError(err.message || '领取奖励失败，请重试');
    }
  };
  
  // 格式化数字显示，保留2位小数
  const formatNumber = (num) => {
    return parseFloat(num).toFixed(2);
  };
  
  return (
    <div className="staking-interface-container">
      <h2>文化通证质押</h2>
      
      {!isConnected ? (
        <div className="staking-not-connected">
          <p>请连接钱包使用质押功能</p>
        </div>
      ) : (
        <>
          <div className="staking-summary">
            <div className="staking-summary-item">
              <h3>可用余额</h3>
              <p>{formatNumber(userBalance)} CULT</p>
            </div>
            <div className="staking-summary-item">
              <h3>已质押</h3>
              <p>{formatNumber(stakedAmount)} CULT</p>
            </div>
            <div className="staking-summary-item">
              <h3>待领取奖励</h3>
              <p>{formatNumber(pendingRewards)} CULT</p>
            </div>
          </div>
          
          <div className="staking-tabs">
            <button 
              className={`staking-tab ${activeTab === 'stake' ? 'active' : ''}`}
              onClick={() => setActiveTab('stake')}
            >
              质押
            </button>
            <button 
              className={`staking-tab ${activeTab === 'unstake' ? 'active' : ''}`}
              onClick={() => setActiveTab('unstake')}
            >
              解除质押
            </button>
            <button 
              className={`staking-tab ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => setActiveTab('rewards')}
            >
              奖励
            </button>
          </div>
          
          <div className="staking-content">
            {activeTab === 'stake' && (
              <form className="staking-form" onSubmit={handleStake}>
                <div className="form-group">
                  <label htmlFor="stakeAmount">质押金额</label>
                  <div className="amount-input-container">
                    <input
                      type="number"
                      id="stakeAmount"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={isLoading}
                    />
                    <span className="amount-symbol">CULT</span>
                  </div>
                  <div className="balance-info">
                    <button 
                      type="button" 
                      className="max-button"
                      onClick={() => setStakeAmount(userBalance)}
                      disabled={isLoading}
                    >
                      最大
                    </button>
                  </div>
                </div>
                
                {formError && (
                  <div className="staking-error">
                    <p>{formError}</p>
                  </div>
                )}
                
                {error && (
                  <div className="staking-error">
                    <p>{error}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="staking-button"
                  disabled={isLoading || !isConnected}
                >
                  {isLoading ? '处理中...' : parseFloat(allowance) < parseFloat(stakeAmount || 0) ? '授权并质押' : '质押'}
                </button>
              </form>
            )}
            
            {activeTab === 'unstake' && (
              <form className="staking-form" onSubmit={handleUnstake}>
                <div className="form-group">
                  <label htmlFor="unstakeAmount">解除质押金额</label>
                  <div className="amount-input-container">
                    <input
                      type="number"
                      id="unstakeAmount"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={isLoading}
                    />
                    <span className="amount-symbol">CULT</span>
                  </div>
                  <div className="balance-info">
                    <button 
                      type="button" 
                      className="max-button"
                      onClick={() => setUnstakeAmount(stakedAmount)}
                      disabled={isLoading}
                    >
                      最大
                    </button>
                  </div>
                </div>
                
                {formError && (
                  <div className="staking-error">
                    <p>{formError}</p>
                  </div>
                )}
                
                {error && (
                  <div className="staking-error">
                    <p>{error}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="staking-button"
                  disabled={isLoading || !isConnected || parseFloat(stakedAmount) <= 0}
                >
                  {isLoading ? '处理中...' : '解除质押'}
                </button>
              </form>
            )}
            
            {activeTab === 'rewards' && (
              <div className="rewards-container">
                <div className="rewards-info">
                  <h3>待领取奖励</h3>
                  <p className="rewards-amount">{formatNumber(pendingRewards)} CULT</p>
                </div>
                
                {formError && (
                  <div className="staking-error">
                    <p>{formError}</p>
                  </div>
                )}
                
                {error && (
                  <div className="staking-error">
                    <p>{error}</p>
                  </div>
                )}
                
                <button
                  className="claim-button"
                  onClick={handleClaimRewards}
                  disabled={isLoading || !isConnected || parseFloat(pendingRewards) <= 0}
                >
                  {isLoading ? '处理中...' : '领取奖励'}
                </button>
              </div>
            )}
            
            {txSuccess && (
              <div className="staking-success">
                <p>操作成功!</p>
                <p>
                  交易哈希: 
                  <a 
                    href={`https://etherscan.io/tx/${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {`${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`}
                  </a>
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StakingInterface;
