import React, { useState } from 'react';
import './RecommendationCard.css';

/**
 * 推荐卡片组件
 * 展示单个NFT推荐项目
 */
const RecommendationCard = ({ 
  recommendation, 
  onFeedback,
  className = ""
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const {
    id,
    name,
    image,
    creator,
    price,
    priceChange,
    recommendationType,
    recommendationScore,
    recommendationReason,
    stats,
    collection,
    rarity
  } = recommendation;

  // 获取推荐类型的样式和标签
  const getRecommendationBadge = (type) => {
    const badges = {
      trending: { label: '热门', className: 'trending' },
      similar: { label: '相似', className: 'similar' },
      personalized: { label: '推荐', className: 'personalized' },
      new: { label: '新品', className: 'new' },
      investment: { label: '潜力', className: 'investment' },
      community: { label: '社区', className: 'community' }
    };
    
    return badges[type] || { label: '推荐', className: 'default' };
  };

  // 处理图片加载
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // 处理收藏
  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    
    if (onFeedback) {
      onFeedback({
        type: 'favorite',
        value: !isFavorited,
        timestamp: Date.now()
      });
    }
  };

  // 处理分享
  const handleShare = (e) => {
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `查看这个精彩的NFT: ${name}`,
        url: window.location.href
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }

    if (onFeedback) {
      onFeedback({
        type: 'share',
        value: true,
        timestamp: Date.now()
      });
    }
  };

  // 处理卡片点击
  const handleCardClick = () => {
    if (onFeedback) {
      onFeedback({
        type: 'click',
        value: true,
        timestamp: Date.now()
      });
    }
    
    // 这里可以导航到NFT详情页
    console.log('Navigate to NFT detail:', id);
  };

  // 格式化价格变化
  const formatPriceChange = (change) => {
    if (!change) return null;
    
    const isPositive = change > 0;
    const className = isPositive ? 'positive' : 'negative';
    const symbol = isPositive ? '+' : '';
    
    return (
      <span className={`price-change ${className}`}>
        {symbol}{change.toFixed(1)}%
      </span>
    );
  };

  const badge = getRecommendationBadge(recommendationType);

  return (
    <div 
      className={`recommendation-card ${className}`}
      onClick={handleCardClick}
    >
      <div className="recommendation-image-container">
        {!imageLoaded && !imageError && (
          <div className="recommendation-image-placeholder">
            <div className="loading-spinner" />
          </div>
        )}
        
        {imageError ? (
          <div className="recommendation-image-error">
            <span>图片加载失败</span>
          </div>
        ) : (
          <img
            src={image}
            alt={name}
            className={`recommendation-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* 推荐类型徽章 */}
        <div className={`recommendation-badge ${badge.className}`}>
          {badge.label}
        </div>

        {/* 推荐评分 */}
        {recommendationScore && (
          <div className="recommendation-score">
            <span className="score-icon">⭐</span>
            {(recommendationScore * 100).toFixed(0)}%
          </div>
        )}

        {/* 操作按钮 */}
        <div className="recommendation-actions">
          <button
            className={`recommendation-action favorite ${isFavorited ? 'active' : ''}`}
            onClick={handleFavorite}
            title="收藏"
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
          <button
            className="recommendation-action share"
            onClick={handleShare}
            title="分享"
          >
            📤
          </button>
        </div>
      </div>

      <div className="recommendation-info">
        <div className="recommendation-name">{name}</div>
        
        {creator && (
          <div className="recommendation-creator">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="creator-avatar"
            />
            <span className="creator-name">{creator.name}</span>
          </div>
        )}

        {price && (
          <div className="recommendation-price">
            <div className="price-value">
              <span className="eth-icon">Ξ</span>
              <span className="price-amount">{price}</span>
            </div>
            {priceChange && formatPriceChange(priceChange)}
          </div>
        )}

        {/* 推荐理由 */}
        {recommendationReason && (
          <div className="recommendation-reason">
            <span className="reason-icon">💡</span>
            <span className="reason-text">{recommendationReason}</span>
          </div>
        )}

        {/* 统计信息 */}
        {stats && (
          <div className="recommendation-stats">
            {stats.views && (
              <div className="stat-item">
                <span className="stat-icon">👁️</span>
                <span>{stats.views}</span>
              </div>
            )}
            {stats.likes && (
              <div className="stat-item">
                <span className="stat-icon">❤️</span>
                <span>{stats.likes}</span>
              </div>
            )}
            {stats.comments && (
              <div className="stat-item">
                <span className="stat-icon">💬</span>
                <span>{stats.comments}</span>
              </div>
            )}
          </div>
        )}

        {/* 收藏信息 */}
        {collection && (
          <div className="recommendation-collection">
            来自 <span className="collection-name">{collection}</span>
          </div>
        )}

        {/* 稀有度 */}
        {rarity && (
          <div className={`recommendation-rarity ${rarity.toLowerCase()}`}>
            {rarity}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;

