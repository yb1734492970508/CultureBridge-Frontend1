import React, { useState } from 'react';
import { ethers } from 'ethers';
import './NFTMarketplace.css';

/**
 * NFT收藏夹组件
 * 用户收藏的NFT列表，支持添加/移除收藏
 */
const NFTFavorites = ({ favorites, onRemoveFavorite }) => {
  // 状态管理
  const [viewType, setViewType] = useState('grid'); // 'grid' 或 'list'
  
  // 格式化ETH价格显示
  const formatPrice = (price) => {
    return parseFloat(ethers.utils.formatEther(price)).toFixed(3);
  };
  
  // 格式化时间显示
  const formatTimeLeft = (timestamp) => {
    const now = Date.now();
    const timeLeft = timestamp - now;
    
    if (timeLeft <= 0) return '已结束';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}天 ${hours}小时`;
    if (hours > 0) return `${hours}小时 ${minutes}分钟`;
    return `${minutes}分钟`;
  };
  
  // 渲染网格视图
  const renderGridView = () => {
    return (
      <div className="favorites-grid">
        {favorites.map(nft => (
          <div key={nft.id} className="favorite-card">
            <div className="favorite-image-container">
              <img src={nft.image} alt={nft.name} className="favorite-image" />
              <div className="favorite-overlay">
                <button className="view-details-button">查看详情</button>
              </div>
              <button 
                className="remove-favorite-button"
                onClick={() => onRemoveFavorite(nft.id)}
              >
                ×
              </button>
              {nft.isAuction && (
                <div className="auction-badge">
                  <span className="auction-text">拍卖中</span>
                  <span className="auction-time">{formatTimeLeft(nft.auctionEndTime)}</span>
                </div>
              )}
            </div>
            
            <div className="favorite-info">
              <h3 className="favorite-name">{nft.name}</h3>
              <div className="favorite-creator">
                <span className="creator-label">创作者:</span>
                <span className="creator-name">{nft.creator}</span>
              </div>
              <div className="favorite-price-row">
                <div className="price-container">
                  <span className="price-label">{nft.isAuction ? '当前出价' : '价格'}</span>
                  <span className="price-value">{formatPrice(nft.price)} ETH</span>
                </div>
                <div className="category-tag">{getCategoryName(nft.category)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染列表视图
  const renderListView = () => {
    return (
      <div className="favorites-list">
        <div className="list-header">
          <div className="header-item header-image">图片</div>
          <div className="header-item header-name">名称</div>
          <div className="header-item header-creator">创作者</div>
          <div className="header-item header-price">价格</div>
          <div className="header-item header-type">类型</div>
          <div className="header-item header-action">操作</div>
        </div>
        
        {favorites.map(nft => (
          <div key={nft.id} className="favorite-list-item">
            <div className="item-image">
              <img src={nft.image} alt={nft.name} className="list-favorite-image" />
            </div>
            <div className="item-name">{nft.name}</div>
            <div className="item-creator">{nft.creator}</div>
            <div className="item-price">
              <span className="eth-icon">Ξ</span>
              <span>{formatPrice(nft.price)}</span>
              {nft.isAuction && (
                <span className="auction-timer">{formatTimeLeft(nft.auctionEndTime)}</span>
              )}
            </div>
            <div className="item-type">
              <span className={`type-badge ${nft.isAuction ? 'auction' : 'fixed'}`}>
                {nft.isAuction ? '拍卖' : '固定价格'}
              </span>
            </div>
            <div className="item-action">
              <button className="list-view-button">查看</button>
              <button 
                className="list-remove-button"
                onClick={() => onRemoveFavorite(nft.id)}
              >
                移除
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 获取分类名称
  const getCategoryName = (category) => {
    const categories = {
      'visual-art': '视觉艺术',
      'sculpture': '雕塑',
      'photography': '摄影',
      'music': '音乐',
      'literature': '文学',
      'performance': '表演艺术',
      'traditional-craft': '传统工艺'
    };
    
    return categories[category] || category;
  };
  
  return (
    <div className="nft-favorites-container">
      <div className="favorites-header">
        <h2>我的收藏</h2>
        <div className="view-controls">
          <button 
            className={`view-button ${viewType === 'grid' ? 'active' : ''}`}
            onClick={() => setViewType('grid')}
          >
            网格视图
          </button>
          <button 
            className={`view-button ${viewType === 'list' ? 'active' : ''}`}
            onClick={() => setViewType('list')}
          >
            列表视图
          </button>
        </div>
      </div>
      
      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">♡</div>
          <h3>您的收藏夹为空</h3>
          <p>浏览市场并收藏您喜欢的NFT</p>
          <button className="browse-market-button">浏览市场</button>
        </div>
      ) : (
        viewType === 'grid' ? renderGridView() : renderListView()
      )}
    </div>
  );
};

export default NFTFavorites;
