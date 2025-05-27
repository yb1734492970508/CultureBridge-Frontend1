import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/token/TokenContext';
import '../../styles/token.css';

/**
 * 通证余额组件 - 显示用户的CULT通证余额
 */
const TokenBalance = () => {
  const { 
    balance, 
    loading, 
    error, 
    fetchBalance, 
    formatTokenAmount 
  } = useToken();
  
  // 刷新余额
  const handleRefresh = () => {
    fetchBalance();
  };
  
  return (
    <div className="token-balance-card">
      <div className="token-balance-header">
        <h3>我的CULT通证余额</h3>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      
      <div className="token-balance-content">
        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        ) : (
          <div className="balance-display">
            <span className="balance-amount">{formatTokenAmount(balance)}</span>
            <span className="balance-symbol">CULT</span>
          </div>
        )}
      </div>
      
      <div className="token-balance-footer">
        <p className="last-updated">
          上次更新: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default TokenBalance;
