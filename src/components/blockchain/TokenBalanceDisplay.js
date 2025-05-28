import React, { useContext, useState } from 'react';
import { TokenContext } from '../../context/blockchain/TokenContext';
import { BlockchainContext } from '../../context/blockchain';
import './TokenBalance.css';

/**
 * 文化通证余额显示组件
 * 显示用户的CULT通证余额和相关信息
 */
const TokenBalanceDisplay = () => {
  const { userBalance, isLoading, error, fetchUserData } = useContext(TokenContext);
  const { isConnected, account } = useContext(BlockchainContext);
  
  // 刷新余额
  const handleRefresh = () => {
    fetchUserData();
  };
  
  // 格式化余额显示，保留2位小数
  const formatBalance = (balance) => {
    return parseFloat(balance).toFixed(2);
  };
  
  return (
    <div className="token-balance-container">
      <div className="token-balance-header">
        <h2>文化通证余额</h2>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={isLoading || !isConnected}
        >
          {isLoading ? '刷新中...' : '刷新'}
        </button>
      </div>
      
      <div className="token-balance-content">
        {!isConnected ? (
          <div className="token-balance-not-connected">
            <p>请连接钱包查看通证余额</p>
          </div>
        ) : error ? (
          <div className="token-balance-error">
            <p>获取余额失败: {error}</p>
          </div>
        ) : (
          <div className="token-balance-info">
            <div className="token-balance-amount">
              <span className="token-balance-value">{formatBalance(userBalance)}</span>
              <span className="token-balance-symbol">CULT</span>
            </div>
            <div className="token-balance-account">
              <p>账户: {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : ''}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenBalanceDisplay;
