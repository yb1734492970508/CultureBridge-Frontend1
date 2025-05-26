import React, { useState } from 'react';
import { useToken } from '../../context/token/TokenContext';
import { useBlockchain } from '../../context/blockchain';
import TokenTransfer from './TokenTransfer';
import TokenHistory from './TokenHistory';
import '../../styles/token.css';

/**
 * 文化通证钱包组件
 * 展示用户的代币余额和基本操作
 */
const TokenWallet = () => {
  const { account, active } = useBlockchain();
  const { 
    balance, 
    isLoading, 
    error, 
    successMessage, 
    refreshBalance, 
    clearMessages 
  } = useToken();
  
  const [showTransfer, setShowTransfer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // 处理转账完成
  const handleTransferComplete = () => {
    refreshBalance();
  };
  
  // 处理显示/隐藏转账表单
  const toggleTransfer = () => {
    setShowTransfer(!showTransfer);
    if (showTransfer) {
      clearMessages();
    }
  };
  
  // 处理显示/隐藏交易历史
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };
  
  return (
    <div className="token-container">
      <div className="token-header">
        <h2>文化通证钱包</h2>
        <button 
          onClick={refreshBalance} 
          disabled={isLoading || !active}
          className="token-btn refresh-btn"
        >
          {isLoading ? '加载中...' : '刷新余额'}
        </button>
      </div>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以查看您的代币余额</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={clearMessages} className="token-btn secondary-btn">关闭</button>
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
          <button onClick={clearMessages} className="token-btn secondary-btn">关闭</button>
        </div>
      )}
      
      {active && (
        <div className="balance-card">
          <div className="balance-info">
            <h3>您的余额</h3>
            <div className="token-balance">
              <span className="balance-amount">{balance}</span>
              <span className="token-symbol">CULT</span>
            </div>
            <p className="balance-address">钱包地址: {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'N/A'}</p>
          </div>
          
          <div className="wallet-actions">
            <button 
              onClick={toggleTransfer} 
              className="action-btn transfer-btn"
            >
              {showTransfer ? '取消转账' : '转账代币'}
            </button>
            <button 
              onClick={toggleHistory} 
              className="action-btn history-btn"
            >
              {showHistory ? '隐藏历史' : '交易历史'}
            </button>
            <a 
              href="/token/staking" 
              className="action-btn stake-btn"
            >
              质押代币
            </a>
            <a 
              href="/token/rewards" 
              className="action-btn rewards-btn"
            >
              奖励中心
            </a>
          </div>
        </div>
      )}
      
      {showTransfer && (
        <div className="transfer-section">
          <TokenTransfer onTransferComplete={handleTransferComplete} />
        </div>
      )}
      
      {showHistory && (
        <div className="history-section">
          <TokenHistory />
        </div>
      )}
      
      <div className="token-section">
        <h3 className="token-section-title">关于文化通证</h3>
        <div className="token-info">
          <p>文化通证(CULT)是CultureBridge平台的原生代币，用于激励用户参与文化交流和创作。</p>
          <p>您可以通过以下方式获得CULT代币：</p>
          <ul>
            <li>创作和分享文化内容</li>
            <li>翻译和验证其他用户的内容</li>
            <li>参与平台治理和投票</li>
            <li>质押代币获取奖励</li>
          </ul>
          <p>CULT代币可用于：</p>
          <ul>
            <li>购买NFT和数字文化资产</li>
            <li>支付平台服务费用</li>
            <li>参与DAO治理投票</li>
            <li>获取平台特权和功能</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TokenWallet;
