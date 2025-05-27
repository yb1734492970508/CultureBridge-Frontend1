import React from 'react';
import { useToken } from '../../context/token/TokenContext';
import { useBlockchain } from '../../context/blockchain/BlockchainContext';
import '../../styles/token.css';

/**
 * NFT市场通证集成组件 - 将通证功能集成到NFT市场
 * 用于NFT购买、竞价等操作中的通证授权和支付
 */
const NFTMarketTokenIntegration = ({ nftPrice, marketContractAddress, onApproveSuccess, onApproveError }) => {
  const { 
    balance, 
    loading, 
    error, 
    success, 
    approve, 
    checkAllowance, 
    formatTokenAmount, 
    clearMessages 
  } = useToken();
  
  const { active, account } = useBlockchain();
  
  // 处理授权
  const handleApprove = async () => {
    // 清除之前的消息
    clearMessages();
    
    if (!active || !account) {
      onApproveError && onApproveError('请先连接钱包');
      return;
    }
    
    if (parseFloat(balance) < parseFloat(nftPrice)) {
      onApproveError && onApproveError('CULT通证余额不足');
      return;
    }
    
    try {
      // 检查当前授权额度
      const currentAllowance = await checkAllowance(marketContractAddress);
      
      // 如果授权额度已足够，直接返回成功
      if (parseFloat(currentAllowance) >= parseFloat(nftPrice)) {
        onApproveSuccess && onApproveSuccess();
        return;
      }
      
      // 执行授权，授权金额为价格的120%，以应对可能的价格波动
      const approveAmount = parseFloat(nftPrice) * 1.2;
      const result = await approve(marketContractAddress, approveAmount.toString());
      
      if (result.success) {
        onApproveSuccess && onApproveSuccess();
      } else {
        onApproveError && onApproveError('授权失败，请稍后再试');
      }
    } catch (error) {
      console.error('授权失败:', error);
      onApproveError && onApproveError(error.message || '授权失败，请稍后再试');
    }
  };
  
  return (
    <div className="nft-market-token-integration">
      <div className="token-balance-info">
        <span className="balance-label">CULT余额:</span>
        <span className="balance-value">{formatTokenAmount(balance)} CULT</span>
      </div>
      
      {parseFloat(balance) < parseFloat(nftPrice) ? (
        <div className="insufficient-balance-warning">
          <i className="fas fa-exclamation-triangle"></i>
          <span>余额不足，需要 {formatTokenAmount(nftPrice)} CULT</span>
        </div>
      ) : (
        <div className="sufficient-balance">
          <i className="fas fa-check-circle"></i>
          <span>余额充足</span>
        </div>
      )}
      
      <button
        className="btn-primary approve-button"
        onClick={handleApprove}
        disabled={loading || parseFloat(balance) < parseFloat(nftPrice)}
      >
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            授权中...
          </>
        ) : (
          '授权CULT通证'
        )}
      </button>
      
      <div className="token-integration-note">
        <p>
          <i className="fas fa-info-circle"></i>
          购买NFT需要先授权市场合约使用您的CULT通证。
        </p>
      </div>
    </div>
  );
};

export default NFTMarketTokenIntegration;
