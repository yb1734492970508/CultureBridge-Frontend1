import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './UnstakeModal.css';

// 质押合约ABI（简化版，实际使用时需要完整ABI）
const STAKING_ABI = [
  "function withdraw(uint256 stakeId) external",
  "function emergencyWithdraw(uint256 stakeId) external",
  "function getStakeDetails(uint256 stakeId) external view returns (tuple(uint256 id, uint256 amount, uint256 startTime, uint256 endTime, uint256 lockPeriod, uint256 reward, bool claimed))",
  "function calculateWithdrawPenalty(uint256 stakeId) external view returns (uint256)"
];

// 质押合约地址（测试网）
const STAKING_ADDRESS = "0x9C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

/**
 * 解除质押模态框组件
 * 处理正常解除质押和提前解除质押（含惩罚）的逻辑
 */
const UnstakeModal = ({ isOpen, onClose, stakeId, onSuccess }) => {
  const { active, account, library } = useBlockchain();
  
  // 质押详情
  const [stakeDetails, setStakeDetails] = useState(null);
  const [penalty, setPenalty] = useState('0');
  const [isEarlyWithdrawal, setIsEarlyWithdrawal] = useState(false);
  
  // 操作状态
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // 确认状态
  const [confirmEarlyWithdrawal, setConfirmEarlyWithdrawal] = useState(false);
  
  // 初始化合约实例
  const getStakingContract = () => {
    if (!library || !active) return null;
    return new ethers.Contract(
      STAKING_ADDRESS,
      STAKING_ABI,
      library.getSigner()
    );
  };
  
  // 加载质押详情
  useEffect(() => {
    if (!isOpen || !stakeId || !active || !account || !library) return;
    
    const loadStakeDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const stakingContract = getStakingContract();
        
        if (!stakingContract) {
          throw new Error('无法连接质押合约');
        }
        
        // 获取质押详情
        const details = await stakingContract.getStakeDetails(stakeId);
        
        const formattedDetails = {
          id: details.id.toString(),
          amount: ethers.utils.formatEther(details.amount),
          startTime: new Date(details.startTime.toNumber() * 1000),
          endTime: new Date(details.endTime.toNumber() * 1000),
          lockPeriod: details.lockPeriod.toNumber() / 86400, // 转换为天数
          reward: ethers.utils.formatEther(details.reward),
          claimed: details.claimed
        };
        
        setStakeDetails(formattedDetails);
        
        // 检查是否为提前解除质押
        const now = new Date();
        const isEarly = now < formattedDetails.endTime;
        setIsEarlyWithdrawal(isEarly);
        
        // 如果是提前解除，计算惩罚金额
        if (isEarly) {
          const penaltyAmount = await stakingContract.calculateWithdrawPenalty(stakeId);
          setPenalty(ethers.utils.formatEther(penaltyAmount));
        } else {
          setPenalty('0');
        }
      } catch (err) {
        console.error('加载质押详情失败:', err);
        setError('加载质押详情失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStakeDetails();
  }, [isOpen, stakeId, active, account, library]);
  
  // 解除质押
  const handleWithdraw = async (isEmergency = false) => {
    if (!active || !account || !stakeId) {
      setError('请先连接钱包');
      return;
    }
    
    // 如果是提前解除质押但未确认
    if (isEarlyWithdrawal && !confirmEarlyWithdrawal && !isEmergency) {
      setConfirmEarlyWithdrawal(true);
      return;
    }
    
    setIsWithdrawing(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const stakingContract = getStakingContract();
      
      if (!stakingContract) {
        throw new Error('无法连接质押合约');
      }
      
      // 解除质押
      let tx;
      if (isEmergency) {
        tx = await stakingContract.emergencyWithdraw(stakeId);
      } else {
        tx = await stakingContract.withdraw(stakeId);
      }
      
      setSuccessMessage('解除质押交易已提交，请等待确认...');
      
      // 等待交易确认
      await tx.wait();
      
      setSuccessMessage('解除质押成功！');
      
      // 通知父组件成功
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('解除质押失败:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setError('您拒绝了交易签名');
      } else {
        setError(`解除质押失败: ${err.message || '请检查您的钱包连接并重试'}`);
      }
    } finally {
      setIsWithdrawing(false);
    }
  };
  
  // 格式化日期
  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 计算剩余时间
  const calculateTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) {
      return '已结束';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };
  
  // 如果模态框未打开，不渲染内容
  if (!isOpen) return null;
  
  return (
    <div className="unstake-modal-overlay">
      <div className="unstake-modal">
        <div className="modal-header">
          <h3>解除质押</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {isLoading ? (
            <div className="loading-spinner">加载中...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : stakeDetails ? (
            <>
              <div className="stake-details">
                <div className="detail-item">
                  <span className="detail-label">质押金额:</span>
                  <span className="detail-value">{parseFloat(stakeDetails.amount).toLocaleString()} CBT</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">质押日期:</span>
                  <span className="detail-value">{formatDate(stakeDetails.startTime)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">解锁日期:</span>
                  <span className="detail-value">{formatDate(stakeDetails.endTime)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">锁定期:</span>
                  <span className="detail-value">{stakeDetails.lockPeriod} 天</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">预计奖励:</span>
                  <span className="detail-value">{parseFloat(stakeDetails.reward).toLocaleString()} CBT</span>
                </div>
                
                {isEarlyWithdrawal && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">剩余锁定时间:</span>
                      <span className="detail-value">{calculateTimeRemaining(stakeDetails.endTime)}</span>
                    </div>
                    
                    <div className="detail-item penalty">
                      <span className="detail-label">提前解除惩罚:</span>
                      <span className="detail-value">{parseFloat(penalty).toLocaleString()} CBT</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">实际可获得:</span>
                      <span className="detail-value">
                        {(parseFloat(stakeDetails.amount) - parseFloat(penalty)).toLocaleString()} CBT
                      </span>
                    </div>
                    
                    <div className="early-withdrawal-warning">
                      <p>⚠️ 提前解除质押将导致部分代币被扣除作为惩罚，且无法获得任何奖励。</p>
                    </div>
                  </>
                )}
              </div>
              
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
              
              <div className="modal-actions">
                {isEarlyWithdrawal && confirmEarlyWithdrawal ? (
                  <>
                    <p className="confirm-message">确认提前解除质押并接受惩罚?</p>
                    <div className="confirm-buttons">
                      <button 
                        className="confirm-button"
                        onClick={() => handleWithdraw()}
                        disabled={isWithdrawing}
                      >
                        {isWithdrawing ? '处理中...' : '确认'}
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => setConfirmEarlyWithdrawal(false)}
                        disabled={isWithdrawing}
                      >
                        取消
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      className={`withdraw-button ${isEarlyWithdrawal ? 'early' : ''}`}
                      onClick={() => handleWithdraw()}
                      disabled={isWithdrawing}
                    >
                      {isWithdrawing ? '处理中...' : isEarlyWithdrawal ? '提前解除质押' : '解除质押'}
                    </button>
                    
                    {isEarlyWithdrawal && (
                      <button 
                        className="emergency-withdraw-button"
                        onClick={() => handleWithdraw(true)}
                        disabled={isWithdrawing}
                      >
                        {isWithdrawing ? '处理中...' : '紧急解除质押'}
                      </button>
                    )}
                    
                    <button 
                      className="cancel-button"
                      onClick={onClose}
                      disabled={isWithdrawing}
                    >
                      取消
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="error-message">无法加载质押详情</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnstakeModal;
