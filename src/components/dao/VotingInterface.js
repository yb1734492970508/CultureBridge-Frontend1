import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { useToken } from '../../context/token/TokenContext';
import { formatEther } from '../../utils/formatters';
import '../../styles/dao.css';

/**
 * 投票界面组件
 * 提供用户投票的交互界面
 */
const VotingInterface = ({ proposalId, onVote, onClose, userReputation }) => {
  // 区块链上下文
  const { account, active } = useBlockchain();
  
  // 通证上下文
  const { tokenBalance, stakedTokens, getVotingPower } = useToken();
  
  // 本地状态
  const [selectedOption, setSelectedOption] = useState(null);
  const [reason, setReason] = useState('');
  const [votingPower, setVotingPower] = useState(0);
  const [reputationBoost, setReputationBoost] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 加载投票权重
  useEffect(() => {
    const loadVotingPower = async () => {
      if (active && account) {
        try {
          const power = await getVotingPower(account);
          setVotingPower(power);
          
          // 根据声誉计算加成
          if (userReputation) {
            const boost = userReputation > 80 ? 1.2 : 
                          userReputation > 60 ? 1.1 : 
                          userReputation > 40 ? 1.0 : 0.9;
            setReputationBoost(boost);
          }
        } catch (error) {
          console.error('获取投票权重失败:', error);
          setError('获取投票权重失败，请稍后再试');
        }
      }
    };
    
    loadVotingPower();
  }, [active, account, getVotingPower, userReputation]);
  
  // 处理投票选项变更
  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };
  
  // 处理理由变更
  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };
  
  // 处理投票提交
  const handleSubmit = async () => {
    if (selectedOption === null) {
      setError('请选择投票选项');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await onVote(selectedOption, reason);
    } catch (error) {
      console.error('投票失败:', error);
      setError(`投票失败: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 计算最终投票权重
  const finalVotingPower = votingPower * reputationBoost;
  
  return (
    <div className="voting-interface-overlay">
      <div className="voting-interface">
        <div className="voting-interface-header">
          <h2>投票 - 提案 #{proposalId}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <div className="voting-interface-content">
          <div className="voting-power-info">
            <h3>您的投票权重</h3>
            <div className="voting-power-details">
              <div className="power-detail">
                <span className="detail-label">基础投票权重:</span>
                <span className="detail-value">{formatEther(votingPower)}</span>
              </div>
              <div className="power-detail">
                <span className="detail-label">声誉加成:</span>
                <span className="detail-value">{reputationBoost.toFixed(2)}x</span>
              </div>
              <div className="power-detail final-power">
                <span className="detail-label">最终投票权重:</span>
                <span className="detail-value">{formatEther(finalVotingPower)}</span>
              </div>
            </div>
          </div>
          
          <div className="voting-options">
            <h3>选择您的投票</h3>
            <div className="options-container">
              <div 
                className={`voting-option ${selectedOption === 1 ? 'selected' : ''}`}
                onClick={() => handleOptionChange(1)}
              >
                <div className="option-icon">👍</div>
                <div className="option-label">支持</div>
              </div>
              <div 
                className={`voting-option ${selectedOption === 0 ? 'selected' : ''}`}
                onClick={() => handleOptionChange(0)}
              >
                <div className="option-icon">👎</div>
                <div className="option-label">反对</div>
              </div>
              <div 
                className={`voting-option ${selectedOption === 2 ? 'selected' : ''}`}
                onClick={() => handleOptionChange(2)}
              >
                <div className="option-icon">🤔</div>
                <div className="option-label">弃权</div>
              </div>
            </div>
          </div>
          
          <div className="voting-reason">
            <h3>投票理由 (可选)</h3>
            <textarea 
              value={reason}
              onChange={handleReasonChange}
              placeholder="请输入您的投票理由..."
              maxLength={200}
              className="reason-input"
            />
            <div className="reason-char-count">
              {reason.length}/200
            </div>
          </div>
          
          {error && (
            <div className="voting-error">
              <p>{error}</p>
            </div>
          )}
          
          <div className="voting-actions">
            <button 
              onClick={onClose} 
              className="dao-btn secondary-btn"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button 
              onClick={handleSubmit} 
              className="dao-btn primary-btn"
              disabled={isSubmitting || selectedOption === null}
            >
              {isSubmitting ? '提交中...' : '提交投票'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingInterface;
