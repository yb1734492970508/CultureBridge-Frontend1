import React from 'react';
import NFTMarketplaceItem from './NFTMarketplaceItem';
import './NFTMarketplaceList.css';

/**
 * NFT市场列表组件
 * 以网格或列表形式展示NFT项目
 */
const NFTMarketplaceList = ({ 
  nfts, 
  viewType, 
  onViewDetails, 
  onPurchase, 
  onBid, 
  onToggleFavorite 
}) => {
  // 如果没有NFT，显示空状态
  if (!nfts || nfts.length === 0) {
    return (
      <div className="nft-marketplace-empty">
        <div className="empty-icon">🔍</div>
        <h3>未找到NFT</h3>
        <p>尝试调整筛选条件或稍后再查看</p>
      </div>
    );
  }
  
  return (
    <div className={`nft-marketplace-list ${viewType === 'grid' ? 'grid-view' : 'list-view'}`}>
      {nfts.map(nft => (
        <div key={nft.id} className="nft-item-wrapper">
          <NFTMarketplaceItem 
            nft={nft}
            onViewDetails={onViewDetails}
            onPurchase={onPurchase}
            onBid={onBid}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      ))}
    </div>
  );
};

export default NFTMarketplaceList;
