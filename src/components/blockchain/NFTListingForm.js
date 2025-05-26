import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { BlockchainContext } from '../../context/blockchain';
import './NFTMarketplace.css';

/**
 * NFT上架表单组件
 * 允许用户将自己拥有的NFT上架到市场
 */
const NFTListingForm = ({ nft, onListingComplete }) => {
  // 状态管理
  const [listingType, setListingType] = useState('fixed'); // 'fixed' 或 'auction'
  const [price, setPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState(1); // 天数
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // 区块链上下文
  const { account, provider, isConnected } = useContext(BlockchainContext);
  
  // 处理上架提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('请先连接钱包');
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      setError('请输入有效的价格');
      return;
    }
    
    if (listingType === 'auction' && (!auctionDuration || auctionDuration < 1)) {
      setError('请选择有效的拍卖时长');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);
      
      // 计算拍卖结束时间
      const auctionEndTime = listingType === 'auction' 
        ? Date.now() + (auctionDuration * 24 * 60 * 60 * 1000) 
        : 0;
      
      // 模拟区块链交易
      // 实际实现中，这里应该调用市场合约的上架方法
      setTimeout(() => {
        setSuccess(`NFT已成功上架到市场！${listingType === 'fixed' ? '固定价格' : '拍卖'}为 ${price} ETH`);
        setIsProcessing(false);
        
        // 通知父组件上架完成
        if (onListingComplete) {
          onListingComplete({
            ...nft,
            price: ethers.utils.parseEther(price),
            isAuction: listingType === 'auction',
            auctionEndTime: auctionEndTime,
            seller: account
          });
        }
      }, 2000);
      
    } catch (err) {
      console.error('Error listing NFT:', err);
      setError('上架失败，请稍后再试');
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="nft-listing-form">
      <h2>将NFT上架到市场</h2>
      
      {nft && (
        <div className="nft-preview">
          <img src={nft.image} alt={nft.name} className="preview-image" />
          <div className="preview-info">
            <h3>{nft.name}</h3>
            <p className="preview-description">{nft.description.substring(0, 100)}...</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>销售类型</label>
          <div className="listing-type-options">
            <label className={`type-option ${listingType === 'fixed' ? 'active' : ''}`}>
              <input
                type="radio"
                name="listingType"
                value="fixed"
                checked={listingType === 'fixed'}
                onChange={() => setListingType('fixed')}
              />
              <span className="option-label">固定价格</span>
              <span className="option-description">以设定价格直接出售NFT</span>
            </label>
            
            <label className={`type-option ${listingType === 'auction' ? 'active' : ''}`}>
              <input
                type="radio"
                name="listingType"
                value="auction"
                checked={listingType === 'auction'}
                onChange={() => setListingType('auction')}
              />
              <span className="option-label">拍卖</span>
              <span className="option-description">设置起拍价，让买家竞价</span>
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label>{listingType === 'fixed' ? '价格 (ETH)' : '起拍价 (ETH)'}</label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="输入ETH价格"
            className="price-input"
            disabled={isProcessing}
            required
          />
        </div>
        
        {listingType === 'auction' && (
          <div className="form-group">
            <label>拍卖时长</label>
            <select
              value={auctionDuration}
              onChange={(e) => setAuctionDuration(parseInt(e.target.value))}
              className="duration-select"
              disabled={isProcessing}
              required
            >
              <option value="1">1天</option>
              <option value="3">3天</option>
              <option value="5">5天</option>
              <option value="7">7天</option>
              <option value="14">14天</option>
            </select>
          </div>
        )}
        
        <div className="form-group">
          <label>版税比例</label>
          <div className="royalty-info">
            <span className="royalty-value">10%</span>
            <span className="royalty-description">每次二次销售您将获得10%的版税</span>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            {success}
          </div>
        )}
        
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isProcessing}
          >
            {isProcessing ? '处理中...' : '确认上架'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NFTListingForm;
