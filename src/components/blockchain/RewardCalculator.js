import React from 'react';
import StakingForm from './StakingForm';
import { useBlockchain } from '../../context/blockchain';
import './RewardCalculator.css';

/**
 * 质押奖励计算器组件
 * 提供质押奖励计算和收益模拟功能
 */
const RewardCalculator = () => {
  const { active } = useBlockchain();
  
  // 收益率数据
  const apyData = [
    { period: 7, apy: 5.2 },
    { period: 30, apy: 6.8 },
    { period: 90, apy: 8.5 },
    { period: 180, apy: 10.2 },
    { period: 365, apy: 12.0 }
  ];
  
  // 渲染APY比较表格
  const renderApyTable = () => {
    return (
      <div className="apy-table">
        <div className="table-header">
          <div className="header-cell">质押期限</div>
          <div className="header-cell">年化收益率</div>
          <div className="header-cell">收益倍数</div>
        </div>
        
        {apyData.map((item) => (
          <div className="table-row" key={item.period}>
            <div className="table-cell">{item.period}天</div>
            <div className="table-cell">{item.apy}%</div>
            <div className="table-cell">×{(item.period === 7 ? 1.0 : item.period === 30 ? 1.2 : item.period === 90 ? 1.5 : item.period === 180 ? 1.8 : 2.0).toFixed(1)}</div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染收益说明
  const renderRewardExplanation = () => {
    return (
      <div className="reward-explanation">
        <h4>收益计算说明</h4>
        <p>
          质押奖励根据质押金额、质押期限和收益倍数计算。质押期限越长，收益倍数越高，获得的奖励也越多。
        </p>
        <p>
          <strong>计算公式:</strong> 奖励 = 质押金额 × 基础年化收益率 × (质押天数 / 365) × 收益倍数
        </p>
        <p>
          <strong>提前解除质押:</strong> 如果在锁定期结束前解除质押，将收取一定比例的提前解除费用，具体费率取决于剩余锁定时间。
        </p>
      </div>
    );
  };
  
  // 渲染收益模拟器
  const renderRewardSimulator = () => {
    return (
      <div className="reward-simulator">
        <h3>质押收益模拟器</h3>
        <p className="simulator-description">
          使用下方表单模拟不同质押金额和期限的预期收益
        </p>
        
        <StakingForm />
      </div>
    );
  };
  
  // 渲染收益策略建议
  const renderStrategyTips = () => {
    return (
      <div className="strategy-tips">
        <h4>质押策略建议</h4>
        <ul>
          <li>
            <strong>短期灵活策略:</strong> 选择7-30天的短期质押，保持资金灵活性，适合市场波动较大时期。
          </li>
          <li>
            <strong>中期平衡策略:</strong> 选择90天质押期，平衡收益率和灵活性，适合大多数用户。
          </li>
          <li>
            <strong>长期最大化策略:</strong> 选择180-365天的长期质押，获取最高收益倍数，适合长期持有者。
          </li>
        </ul>
      </div>
    );
  };
  
  // 主渲染函数
  return (
    <div className="reward-calculator">
      <div className="calculator-header">
        <h3>质押奖励计算器</h3>
        <p>了解不同质押期限的收益率和奖励计算方式</p>
      </div>
      
      {!active ? (
        <div className="connect-wallet-message">
          请先连接您的钱包以使用质押奖励计算器
        </div>
      ) : (
        <div className="calculator-content">
          <div className="calculator-main">
            {renderRewardSimulator()}
            
            <div className="calculator-info">
              <div className="info-section">
                {renderApyTable()}
              </div>
              
              <div className="info-section">
                {renderRewardExplanation()}
              </div>
              
              <div className="info-section">
                {renderStrategyTips()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardCalculator;
