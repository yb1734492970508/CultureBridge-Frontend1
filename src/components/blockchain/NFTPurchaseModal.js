import React, { useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { BlockchainContext } from '../../context/blockchain';
import './NFTPurchaseModal.css';

/**
 * NFT购买模态框组件
 * 允许用户购买固定价格的NFT
 */
const NFTPurchaseModal = ({ nft, isOpen, onClose, onPurchaseComplete }) => {
  // 状态管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gasFee, setGasFee] = useState('0');
  const [totalCost, setTotalCost] = useState('0');
  const [isConfirming, setIsConfirming] = useState(false);
  
  // 区块链上下文
  const { account, provider, isConnected } = useContext(BlockchainContext);
  
  // 计算总成本（NFT价格 + 预估gas费）
  useEffect(() => {
    if (nft && nft.price) {
      const nftPrice = ethers.utils.formatEther(nft.price);
      
      // 预估gas费用（实际应用中应该调用estimateGas）
      const estimatedGasFee = '0.002'; // 示例值，实际应用中应动态计算
      setGasFee(estimatedGasFee);
      
      const total = (parseFloat(nftPrice) + parseFloat(estimatedGasFee)).toFixed(4);
      setTotalCost(total);
    }
  }, [nft]);
  
  // 处理购买确认
  const handleConfirmPurchase = () => {
    setIsConfirming(true);
  };
  
  // 处理购买提交
  const handleSubmit = async () => {
    // 验证连接状态
    if (!isConnected) {
      setError('请先连接钱包');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      // 实际应用中，这里应该调用NFT市场合约的购买函数
      // const marketplaceContract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      // const purchaseTx = await marketplaceContract.purchaseItem(nft.contractAddress, nft.tokenId, {
      //   value: nft.price
      // });
      // await purchaseTx.wait();
      
      // 模拟区块链交互延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 成功处理
      setSuccess('购买成功！NFT已添加到您的收藏中');
      
      // 通知父组件
      if (onPurchaseComplete) {
        onPurchaseComplete({
          nftId: nft.id,
          buyer: account,
          price: nft.price,
          timestamp: Date.now()
        });
      }
      
      // 延迟关闭模态框
      setTimeout(() => {
        onClose();
        setSuccess('');
        setIsConfirming(false);
      }, 2000);
      
    } catch (err) {
      console.error('购买错误:', err);
      setError(err.message || '购买失败，请重试');
      setIsConfirming(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 如果模态框未打开，不渲染内容
  if (!isOpen || !nft) return null;
  
  return (
    <div className="nft-purchase-modal-overlay">
      <div className="nft-purchase-modal">
        <div className="modal-header">
          <h3>{isConfirming ? '确认购买' : '购买 NFT'}</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
        
        <div className="modal-content">
          {!isConfirming ? (
            <>
              <div className="nft-preview">
                <div className="nft-image">
                  <img src={nft.image} alt={nft.name} />
                </div>
                <div className="nft-info">
                  <h4>{nft.name}</h4>
                  <p className="nft-creator">创作者: {nft.creator}</p>
                  <p className="nft-description">{nft.description}</p>
                  <div className="nft-price">
                    <span className="price-label">价格:</span>
                    <span className="price-value">{ethers.utils.formatEther(nft.price)} ETH</span>
                  </div>
                </div>
              </div>
              
              <div className="purchase-details">
                <h5>购买详情</h5>
                <div className="details-row">
                  <span>NFT 价格:</span>
                  <span>{ethers.utils.formatEther(nft.price)} ETH</span>
                </div>
                <div className="details-row">
                  <span>预估 Gas 费用:</span>
                  <span>{gasFee} ETH</span>
                </div>
                <div className="details-row total">
                  <span>总计:</span>
                  <span>{totalCost} ETH</span>
                </div>
              </div>
              
              <div className="purchase-notice">
                <p>
                  <strong>注意:</strong> 购买后，此NFT将立即转移到您的钱包地址。
                  交易一旦确认无法撤销。
                </p>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  取消
                </button>
                <button 
                  type="button" 
                  className="confirm-button"
                  onClick={handleConfirmPurchase}
                  disabled={isSubmitting || !isConnected}
                >
                  继续购买
                </button>
              </div>
            </>
          ) : (
            <div className="confirmation-view">
              <div className="confirmation-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h4 className="confirmation-title">确认购买</h4>
              
              <div className="confirmation-details">
                <div className="confirmation-item">
                  <span>NFT 名称:</span>
                  <span>{nft.name}</span>
                </div>
                <div className="confirmation-item">
                  <span>价格:</span>
                  <span>{ethers.utils.formatEther(nft.price)} ETH</span>
                </div>
                <div className="confirmation-item">
                  <span>卖家:</span>
                  <span className="address">{nft.seller}</span>
                </div>
                <div className="confirmation-item">
                  <span>买家:</span>
                  <span className="address">{account}</span>
                </div>
                <div className="confirmation-item">
                  <span>总计支付:</span>
                  <span className="total-amount">{totalCost} ETH</span>
                </div>
              </div>
              
              <div className="confirmation-actions">
                <button 
                  type="button" 
                  className="back-button"
                  onClick={() => setIsConfirming(false)}
                  disabled={isSubmitting}
                >
                  返回
                </button>
                <button 
                  type="button" 
                  className="purchase-button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      处理中...
                    </>
                  ) : '确认购买'}
                </button>
              </div>
            </div>
          )}
          
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </div>
      </div>
    </div>
  );
};

export default NFTPurchaseModal;
