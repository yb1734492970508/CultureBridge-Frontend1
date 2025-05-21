import React from 'react';
import { useBlockchain } from '../../context/blockchain';
import './VotingPower.css';

/**
 * 投票权重组件
 * 显示用户当前投票权重和增益因素
 */
const VotingPower = () => {
  const { active, account, votingPower, stakingBoost, holdingBoost } = useBlockchain();
  
  // 基础投票权重（1 CBT = 1票）
  const baseVotingPower = votingPower || 0;
  
  // 质押增益（质押代币获得1.5x投票权重）
  const stakingBoostValue = stakingBoost || 1.5;
  
  // 长期持有增益（持有时间每增加3个月，投票权重增加0.1x，最高2x）
  const holdingBoostValue = holdingBoost || 1.2;
  
  // 总投票权重
  const totalVotingPower = baseVotingPower * stakingBoostValue * holdingBoostValue;
  
  // 渲染组件
  return (
    <div className="voting-power">
      <div className="voting-power-header">
        <h3>我的投票权重</h3>
      </div>
      
      {!active ? (
        <div className="connect-wallet-message">
          <p>请连接您的钱包以查看投票权重</p>
        </div>
      ) : (
        <div className="voting-power-content">
          <div className="total-power">
            <div className="power-label">总投票权重</div>
            <div className="power-value">{totalVotingPower.toLocaleString()} 票</div>
          </div>
          
          <div className="power-breakdown">
            <div className="breakdown-item">
              <div className="breakdown-label">基础投票权重</div>
              <div className="breakdown-value">{baseVotingPower.toLocaleString()} CBT</div>
              <div className="breakdown-formula">1 CBT = 1 票</div>
            </div>
            
            <div className="breakdown-item">
              <div className="breakdown-label">质押增益</div>
              <div className="breakdown-value">x{stakingBoostValue.toFixed(1)}</div>
              <div className="breakdown-formula">质押代币获得额外投票权重</div>
            </div>
            
            <div className="breakdown-item">
              <div className="breakdown-label">长期持有增益</div>
              <div className="breakdown-value">x{holdingBoostValue.toFixed(1)}</div>
              <div className="breakdown-formula">持有时间越长，投票权重越高</div>
            </div>
          </div>
          
          <div className="power-calculation">
            <div className="calculation-label">计算公式</div>
            <div className="calculation-formula">
              {baseVotingPower.toLocaleString()} × {stakingBoostValue.toFixed(1)} × {holdingBoostValue.toFixed(1)} = {totalVotingPower.toLocaleString()} 票
            </div>
          </div>
          
          <div className="power-tips">
            <h4>如何增加投票权重?</h4>
            <ul>
              <li>质押更多CBT代币，获得1.5倍投票权重</li>
              <li>长期持有CBT，每3个月增加0.1倍权重（最高2倍）</li>
              <li>参与社区活动，获得特殊投票权NFT</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPower;
