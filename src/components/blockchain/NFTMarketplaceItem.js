import React, { useState } from 'react';
import { ethers } from 'ethers';
import './NFTMarketplaceItem.css';

/**
 * NFT市场项目组件
 * 显示单个NFT项目，包括图片、名称、价格和操作按钮
 */
const NFTMarketplaceItem = ({ nft, onViewDetails, onPurchase, onBid, onToggleFavorite }) => {
  // 状态管理
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // 处理收藏切换
  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    const newState = !isFavorite;
    setIsFavorite(newState);
    
    // 通知父组件
    if (onToggleFavorite) {
      onToggleFavorite(nft.id, newState);
    }
  };
  
  // 处理查看详情
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(nft);
    }
  };
  
  // 处理购买按钮点击
  const handlePurchase = (e) => {
    e.stopPropagation();
    if (onPurchase) {
      onPurchase(nft);
    }
  };
  
  // 处理竞价按钮点击
  const handleBid = (e) => {
    e.stopPropagation();
    if (onBid) {
      onBid(nft);
    }
  };
  
  // 格式化剩余时间
  const formatTimeLeft = (endTime) => {
    const now = Date.now();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) return '已结束';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}天 ${hours}小时`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };
  
  return (
    <div 
      className={`nft-marketplace-item ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      <div className="nft-image-container">
        {!isImageLoaded && (
          <div className="image-placeholder">
            <div className="loading-spinner"></div>
          </div>
        )}
        <img 
          src={nft.image} 
          alt={nft.name} 
          className={`nft-image ${isImageLoaded ? 'loaded' : ''}`}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        <button 
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? '取消收藏' : '添加到收藏'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
        
        {nft.isAuction && (
          <div className="auction-badge">
            <span className="auction-icon">🔨</span>
            <span className="auction-text">拍卖中</span>
          </div>
        )}
      </div>
      
      <div className="nft-info">
        <h3 className="nft-name">{nft.name}</h3>
        <p className="nft-creator">创作者: {nft.creator}</p>
        
        <div className="nft-price-container">
          <div className="price-label">
            {nft.isAuction ? '当前出价:' : '价格:'}
          </div>
          <div className="price-value">
            {ethers.utils.formatEther(nft.price)} ETH
          </div>
        </div>
        
        {nft.isAuction && nft.auctionEndTime && (
          <div className="auction-time-left">
            <span className="time-icon">⏱️</span>
            <span className="time-text">
              剩余: {formatTimeLeft(nft.auctionEndTime)}
            </span>
          </div>
        )}
      </div>
      
      <div className={`nft-actions ${isHovered ? 'visible' : ''}`}>
        <button 
          className="view-details-button"
          onClick={handleViewDetails}
        >
          查看详情
        </button>
        
        {nft.isAuction ? (
          <button 
            className="bid-button"
            onClick={handleBid}
          >
            参与竞拍
          </button>
        ) : (
          <button 
            className="purchase-button"
            onClick={handlePurchase}
          >
            立即购买
          </button>
        )}
      </div>
    </div>
  );
};

export default NFTMarketplaceItem;
