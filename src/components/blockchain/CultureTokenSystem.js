import React from 'react';
import { TokenProvider } from '../../context/blockchain/TokenContext';
import TokenBalanceDisplay from './TokenBalanceDisplay';
import TokenTransferForm from './TokenTransferForm';
import StakingInterface from './StakingInterface';
import TokenTransactionHistory from './TokenTransactionHistory';
import './TokenStyles.css';

/**
 * 文化通证系统主组件
 * 集成所有通证相关功能组件
 */
const CultureTokenSystem = () => {
  return (
    <TokenProvider>
      <div className="culture-token-system-container">
        <h1 className="culture-token-system-title">文化通证系统</h1>
        <p className="culture-token-system-description">
          文化通证(CULT)是CultureBridge平台的核心经济激励机制，用于奖励文化贡献、参与平台治理和交易文化资产。
        </p>
        
        <div className="culture-token-system-grid">
          <div className="culture-token-system-column">
            <TokenBalanceDisplay />
            <TokenTransferForm />
          </div>
          <div className="culture-token-system-column">
            <StakingInterface />
          </div>
        </div>
        
        <TokenTransactionHistory />
      </div>
    </TokenProvider>
  );
};

export default CultureTokenSystem;
