import React from 'react';
import { useToken } from '../../context/token/TokenContext';
import TokenBalance from './TokenBalance';
import TokenTransfer from './TokenTransfer';
import TokenStaking from './TokenStaking';
import TokenHistory from './TokenHistory';
import '../../styles/token.css';

/**
 * 通证钱包页面 - 集成所有通证相关功能的主页面
 */
const TokenWallet = () => {
  const { loading, error } = useToken();
  
  return (
    <div className="token-wallet-container">
      <div className="token-wallet-header">
        <h2>CULT通证钱包</h2>
        <p className="wallet-description">
          管理您的文化通证(CULT)，进行转账、质押和查看交易历史。
        </p>
      </div>
      
      <div className="token-wallet-content">
        <div className="token-wallet-main">
          <div className="token-balance-section">
            <TokenBalance />
          </div>
          
          <div className="token-actions-section">
            <div className="token-transfer-section">
              <TokenTransfer />
            </div>
            
            <div className="token-staking-section">
              <TokenStaking />
            </div>
          </div>
        </div>
        
        <div className="token-history-section">
          <TokenHistory />
        </div>
      </div>
    </div>
  );
};

export default TokenWallet;
