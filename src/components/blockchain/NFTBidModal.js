import React, { useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { BlockchainContext } from '../../context/blockchain';
import './NFTBidModal.css';

/**
 * NFT竞价模态框组件
 * 允许用户对拍卖类型的NFT进行出价
 */
const NFTBidModal = ({ nft, isOpen, onClose, onBidPlaced }) => {
  // 状态管理
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [minBidAmount, setMinBidAmount] = useState('0');
  const [gasFee, setGasFee] = useState('0');
  const [totalCost, setTotalCost] = useState('0');
  
  // 区块链上下文
  const { account, provider, isConnected } = useContext(BlockchainContext);
  
  // 初始化最低出价金额
  useEffect(() => {
    if (nft && nft.isAuction) {
      // 最低出价为当前最高出价的105%
      const currentHighestBid = ethers.utils.formatEther(nft.highestBid || '0');
      const minBid = parseFloat(currentHighestBid) * 1.05;
      setMinBidAmount(minBid.toFixed(4));
    }
  }, [nft]);
  
  // 计算总成本（出价金额 + 预估gas费）
  useEffect(() => {
    if (bidAmount && !isNaN(bidAmount)) {
      // 预估gas费用（实际应用中应该调用estimateGas）
      const estimatedGasFee = '0.002'; // 示例值，实际应用中应动态计算
      setGasFee(estimatedGasFee);
      
      const total = (parseFloat(bidAmount) + parseFloat(estimatedGasFee)).toFixed(4);
      setTotalCost(total);
    } else {
      setGasFee('0');
      setTotalCost('0');
    }
  }, [bidAmount]);
  
  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setBidAmount(value);
    
    // 验证输入
    if (value && !isNaN(value)) {
      if (parseFloat(value) < parseFloat(minBidAmount)) {
        setError(`出价必须至少为 ${minBidAmount} ETH`);
      } else {
        setError('');
      }
    } else {
      setError('请输入有效的出价金额');
    }
  };
  
  // 处理出价提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证连接状态
    if (!isConnected) {
      setError('请先连接钱包');
      return;
    }
    
    // 验证输入
    if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
      setError('请输入有效的出价金额');
      return;
    }
    
    if (parseFloat(bidAmount) < parseFloat(minBidAmount)) {
      setError(`出价必须至少为 ${minBidAmount} ETH`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      // 实际应用中，这里应该调用NFT市场合约的竞价函数
      // const marketplaceContract = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
      // const bidTx = await marketplaceContract.placeBid(nft.contractAddress, nft.tokenId, {
      //   value: ethers.utils.parseEther(bidAmount)
      // });
      // await bidTx.wait();
      
      // 模拟区块链交互延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 成功处理
      setSuccess('出价成功！您现在是最高出价者');
      
      // 通知父组件
      if (onBidPlaced) {
        onBidPlaced({
          nftId: nft.id,
          bidAmount: ethers.utils.parseEther(bidAmount),
          bidder: account
        });
      }
      
      // 延迟关闭模态框
      setTimeout(() => {
        onClose();
        setSuccess('');
        setBidAmount('');
      }, 2000);
      
    } catch (err) {
      console.error('出价错误:', err);
      setError(err.message || '出价失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 如果模态框未打开，不渲染内容
  if (!isOpen || !nft) return null;
  
  return (
    <div className="nft-bid-modal-overlay">
      <div className="nft-bid-modal">
        <div className="modal-header">
          <h3>为 NFT 出价</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="nft-preview">
            <div className="nft-image">
              <img src={nft.image} alt={nft.name} />
            </div>
            <div className="nft-info">
              <h4>{nft.name}</h4>
              <p className="nft-creator">创作者: {nft.creator}</p>
              <div className="bid-info">
                <p className="current-bid">
                  当前最高出价: <span>{ethers.utils.formatEther(nft.highestBid || '0')} ETH</span>
                </p>
                <p className="min-bid">
                  最低出价要求: <span>{minBidAmount} ETH</span>
                </p>
                {nft.auctionEndTime && (
                  <p className="auction-ends">
                    拍卖结束时间: <span>{new Date(nft.auctionEndTime).toLocaleString()}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="bid-form">
            <div className="form-group">
              <label htmlFor="bid-amount">您的出价 (ETH)</label>
              <div className="input-with-icon">
                <input
                  id="bid-amount"
                  type="number"
                  step="0.001"
                  min={minBidAmount}
                  value={bidAmount}
                  onChange={handleInputChange}
                  placeholder={`最低 ${minBidAmount} ETH`}
                  disabled={isSubmitting}
                  required
                />
                <span className="currency-icon">ETH</span>
              </div>
              {error && <p className="error-message">{error}</p>}
            </div>
            
            <div className="bid-summary">
              <div className="summary-row">
                <span>您的出价:</span>
                <span>{bidAmount || '0'} ETH</span>
              </div>
              <div className="summary-row">
                <span>预估 Gas 费用:</span>
                <span>{gasFee} ETH</span>
              </div>
              <div className="summary-row total">
                <span>总计:</span>
                <span>{totalCost} ETH</span>
              </div>
            </div>
            
            <div className="bid-notice">
              <p>
                <strong>注意:</strong> 出价一旦提交无法撤回。如果您的出价被超过，
                您的资金将自动退回到您的钱包。
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
                type="submit" 
                className="submit-button"
                disabled={isSubmitting || !!error}
              >
                {isSubmitting ? '处理中...' : '确认出价'}
              </button>
            </div>
            
            {success && <p className="success-message">{success}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default NFTBidModal;
