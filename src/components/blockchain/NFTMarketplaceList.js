import React from 'react';
import { ethers } from 'ethers';
import './NFTMarketplace.css';

/**
 * NFT市场列表组件
 * 展示所有上架NFT的列表或网格视图
 */
const NFTMarketplaceList = ({ nfts, viewType }) => {
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
      <div className="nft-grid">
        {nfts.map(nft => (
          <div key={nft.id} className="nft-card">
            <div className="nft-image-container">
              <img src={nft.image} alt={nft.name} className="nft-image" />
              <div className="nft-overlay">
                <button className="view-details-button">查看详情</button>
              </div>
              <div className="nft-like-button">
                <span className="like-icon">♥</span>
                <span className="like-count">{nft.likes}</span>
              </div>
              {nft.isAuction && (
                <div className="auction-badge">
                  <span className="auction-text">拍卖中</span>
                  <span className="auction-time">{formatTimeLeft(nft.auctionEndTime)}</span>
                </div>
              )}
            </div>
            
            <div className="nft-info">
              <h3 className="nft-name">{nft.name}</h3>
              <div className="nft-creator">
                <span className="creator-label">创作者:</span>
                <span className="creator-name">{nft.creator}</span>
              </div>
              <div className="nft-price-row">
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
      <div className="nft-list">
        <div className="list-header">
          <div className="header-item header-image">图片</div>
          <div className="header-item header-name">名称</div>
          <div className="header-item header-creator">创作者</div>
          <div className="header-item header-price">价格</div>
          <div className="header-item header-type">类型</div>
          <div className="header-item header-action">操作</div>
        </div>
        
        {nfts.map(nft => (
          <div key={nft.id} className="nft-list-item">
            <div className="item-image">
              <img src={nft.image} alt={nft.name} className="list-nft-image" />
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
              <button className="list-like-button">
                <span className="like-icon">♥</span>
                <span className="like-count">{nft.likes}</span>
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

  // 根据视图类型渲染不同布局
  return (
    <div className="nft-marketplace-list">
      {nfts.length === 0 ? (
        <div className="empty-list-message">
          <p>暂无NFT作品</p>
        </div>
      ) : (
        viewType === 'grid' ? renderGridView() : renderListView()
      )}
    </div>
  );
};

export default NFTMarketplaceList;
