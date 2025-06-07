import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import './NFTMarketplaceItem.css';

/**
 * NFT市场项目组件 - 极致优化版
 * 显示单个NFT项目，包括图片、名称、价格和操作按钮
 * 支持批量选择和收藏夹功能
 * 
 * 优化点：
 * 1. 图片懒加载与渐进式加载
 * 2. 性能优化（防抖、引用缓存）
 * 3. 无障碍支持增强
 * 4. 动画效果优化
 * 5. 移动端交互优化
 * 6. 批量选择支持
 * 7. 收藏夹集成
 */
const NFTMarketplaceItem = ({ 
  nft, 
  onViewDetails, 
  onPurchase, 
  onBid, 
  onToggleFavorite,
  selectionMode = false,
  isSelected = false,
  onToggleSelection = null
}) => {
  // 状态管理
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageLoadProgress, setImageLoadProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // 引用缓存
  const itemRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // 初始化收藏状态（从本地存储加载）
  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem('nftFavorites')) || [];
      setIsFavorite(favorites.includes(nft.id));
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
    
    // 设置交叉观察器实现懒加载
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (itemRef.current) {
      observer.observe(itemRef.current);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      observer.disconnect();
    };
  }, [nft.id]);
  
  // 处理收藏切换（带本地存储）
  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    const newState = !isFavorite;
    setIsFavorite(newState);
    
    // 更新本地存储
    try {
      const favorites = JSON.parse(localStorage.getItem('nftFavorites')) || [];
      const updatedFavorites = newState 
        ? [...favorites, nft.id] 
        : favorites.filter(id => id !== nft.id);
      localStorage.setItem('nftFavorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
    
    // 通知父组件
    if (onToggleFavorite) {
      onToggleFavorite(nft.id, newState);
    }
    
    // 添加收藏动画反馈
    const button = e.currentTarget;
    button.classList.add('animate-favorite');
    setTimeout(() => {
      button.classList.remove('animate-favorite');
    }, 500);
  };
  
  // 处理查看详情（防抖）
  const handleViewDetails = () => {
    // 如果处于选择模式，则切换选择状态
    if (selectionMode && onToggleSelection) {
      onToggleSelection();
      return;
    }
    
    // 否则查看详情
    if (onViewDetails) {
      onViewDetails(nft);
    }
  };
  
  // 处理购买按钮点击（带确认反馈）
  const handlePurchase = (e) => {
    e.stopPropagation();
    const button = e.currentTarget;
    button.classList.add('button-clicked');
    
    timeoutRef.current = setTimeout(() => {
      button.classList.remove('button-clicked');
      if (onPurchase) {
        onPurchase(nft);
      }
    }, 150);
  };
  
  // 处理竞价按钮点击（带确认反馈）
  const handleBid = (e) => {
    e.stopPropagation();
    const button = e.currentTarget;
    button.classList.add('button-clicked');
    
    timeoutRef.current = setTimeout(() => {
      button.classList.remove('button-clicked');
      if (onBid) {
        onBid(nft);
      }
    }, 150);
  };
  
  // 模拟图片渐进式加载
  const handleImageLoad = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setImageLoadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsImageLoaded(true);
      }
    }, 100);
  };
  
  // 格式化剩余时间（优化显示）
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
    } else if (minutes > 0) {
      return `${minutes}分钟`;
    } else {
      return '即将结束';
    }
  };
  
  // 计算价格显示（添加货币符号和格式化）
  const formattedPrice = () => {
    const priceInEth = ethers.utils.formatEther(nft.price);
    // 格式化为最多4位小数
    const formattedValue = parseFloat(priceInEth).toFixed(4).replace(/\.?0+$/, '');
    return `${formattedValue} ETH`;
  };
  
  return (
    <div 
      ref={itemRef}
      className={`nft-marketplace-item ${isHovered ? 'hovered' : ''} ${isVisible ? 'visible' : ''} ${selectionMode ? 'selection-mode' : ''} ${isSelected ? 'selected' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
      tabIndex="0"
      role="button"
      aria-label={`NFT: ${nft.name}, 创作者: ${nft.creator}, 价格: ${formattedPrice()}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleViewDetails();
        }
      }}
    >
      {/* 选择模式下的复选框 */}
      {selectionMode && (
        <div className="selection-checkbox" onClick={(e) => {
          e.stopPropagation();
          if (onToggleSelection) onToggleSelection();
        }}>
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={() => {}} 
            aria-label={`选择 ${nft.name}`}
          />
          <span className="checkmark"></span>
        </div>
      )}
      
      <div className="nft-image-container">
        {!isImageLoaded && isVisible && (
          <div className="image-placeholder">
            <div className="loading-spinner"></div>
            <div className="loading-progress" style={{width: `${imageLoadProgress}%`}}></div>
          </div>
        )}
        {isVisible && (
          <img 
            src={nft.image} 
            alt={`${nft.name} by ${nft.creator}`} 
            className={`nft-image ${isImageLoaded ? 'loaded' : ''}`}
            onLoad={() => handleImageLoad()}
            loading="lazy"
          />
        )}
        
        <button 
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? '取消收藏' : '添加到收藏'}
          aria-pressed={isFavorite}
        >
          <span className="favorite-icon">{isFavorite ? '★' : '☆'}</span>
          <span className="favorite-tooltip">{isFavorite ? '已收藏' : '收藏'}</span>
        </button>
        
        {nft.isAuction && (
          <div className="auction-badge" role="status">
            <span className="auction-icon" aria-hidden="true">🔨</span>
            <span className="auction-text">拍卖中</span>
          </div>
        )}
        
        {nft.rarity && (
          <div className={`rarity-badge ${nft.rarity.toLowerCase()}`}>
            <span className="rarity-text">{nft.rarity}</span>
          </div>
        )}
        
        {/* 收藏夹标签 */}
        {nft.collections && nft.collections.length > 0 && (
          <div className="collection-tags">
            {nft.collections.slice(0, 2).map((collection, index) => (
              <div key={index} className="collection-tag" title={collection.name}>
                <span className="collection-icon">📁</span>
                <span className="collection-name">{collection.name}</span>
              </div>
            ))}
            {nft.collections.length > 2 && (
              <div className="collection-tag more-collections" title={`在${nft.collections.length - 2}个收藏夹中`}>
                <span className="collection-icon">+</span>
                <span className="collection-name">{nft.collections.length - 2}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="nft-info">
        <h3 className="nft-name" title={nft.name}>{nft.name}</h3>
        <p className="nft-creator" title={`创作者: ${nft.creator}`}>
          <span className="creator-label">创作者:</span> 
          <span className="creator-name">{nft.creator}</span>
        </p>
        
        <div className="nft-price-container">
          <div className="price-label">
            {nft.isAuction ? '当前出价:' : '价格:'}
          </div>
          <div className="price-value" title={formattedPrice()}>
            {formattedPrice()}
          </div>
        </div>
        
        {nft.isAuction && nft.auctionEndTime && (
          <div className="auction-time-left" role="timer">
            <span className="time-icon" aria-hidden="true">⏱️</span>
            <span className="time-text">
              剩余: {formatTimeLeft(nft.auctionEndTime)}
            </span>
          </div>
        )}
      </div>
      
      {/* 非选择模式下显示操作按钮 */}
      {!selectionMode && (
        <div className={`nft-actions ${isHovered ? 'visible' : ''}`}>
          <button 
            className="view-details-button"
            onClick={handleViewDetails}
            aria-label={`查看 ${nft.name} 详情`}
          >
            <span className="button-icon" aria-hidden="true">👁️</span>
            <span className="button-text">查看详情</span>
          </button>
          
          {nft.isAuction ? (
            <button 
              className="bid-button"
              onClick={handleBid}
              aria-label={`参与 ${nft.name} 的竞拍`}
            >
              <span className="button-icon" aria-hidden="true">🔨</span>
              <span className="button-text">参与竞拍</span>
            </button>
          ) : (
            <button 
              className="purchase-button"
              onClick={handlePurchase}
              aria-label={`以 ${formattedPrice()} 购买 ${nft.name}`}
            >
              <span className="button-icon" aria-hidden="true">💰</span>
              <span className="button-text">立即购买</span>
            </button>
          )}
        </div>
      )}
      
      {/* 选择模式下显示选择状态 */}
      {selectionMode && (
        <div className="selection-indicator">
          {isSelected ? '已选择' : '点击选择'}
        </div>
      )}
      
      {/* 快速预览悬浮卡片 */}
      <div className="quick-preview">
        <div className="preview-header">
          <h4>{nft.name}</h4>
          <span className="preview-close" aria-label="关闭预览">×</span>
        </div>
        <div className="preview-content">
          <p className="preview-description">{nft.description}</p>
          {nft.attributes && nft.attributes.length > 0 && (
            <div className="preview-attributes">
              {nft.attributes.slice(0, 3).map((attr, index) => (
                <div key={index} className="preview-attribute">
                  <span className="attribute-name">{attr.trait_type}:</span>
                  <span className="attribute-value">{attr.value}</span>
                </div>
              ))}
              {nft.attributes.length > 3 && (
                <div className="more-attributes">+{nft.attributes.length - 3}个属性</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(NFTMarketplaceItem);
