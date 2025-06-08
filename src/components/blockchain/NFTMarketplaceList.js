import React, { useState, useEffect } from 'react';
import NFTMarketplaceItem from './NFTMarketplaceItem';
import './NFTMarketplaceList.css';

/**
 * NFT市场列表组件
 * 以网格或列表形式展示NFT项目
 * 支持批量操作和收藏夹功能
 */
const NFTMarketplaceList = ({ 
  nfts, 
  viewType, 
  onViewDetails, 
  onPurchase, 
  onBid, 
  onToggleFavorite,
  collections = [] // 用户的收藏夹列表
}) => {
  // 批量选择状态
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [activeCollection, setActiveCollection] = useState(null);
  
  // 重置选择状态
  const resetSelection = () => {
    setSelectionMode(false);
    setSelectedNFTs([]);
  };
  
  // 切换NFT选择状态
  const toggleNFTSelection = (nftId) => {
    if (selectedNFTs.includes(nftId)) {
      setSelectedNFTs(selectedNFTs.filter(id => id !== nftId));
    } else {
      setSelectedNFTs([...selectedNFTs, nftId]);
    }
  };
  
  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedNFTs.length === nfts.length) {
      setSelectedNFTs([]);
    } else {
      setSelectedNFTs(nfts.map(nft => nft.id));
    }
  };
  
  // 批量添加到收藏夹
  const addToCollection = (collectionId) => {
    if (selectedNFTs.length === 0) return;
    
    // 这里应调用实际的添加到收藏夹API
    console.log(`添加NFTs ${selectedNFTs.join(', ')} 到收藏夹 ${collectionId}`);
    
    // 操作完成后重置选择状态
    resetSelection();
    setShowCollectionModal(false);
  };
  
  // 创建新收藏夹并添加选中的NFT
  const createNewCollection = () => {
    if (!newCollectionName.trim() || selectedNFTs.length === 0) return;
    
    // 这里应调用实际的创建收藏夹API
    const newCollectionId = `collection-${Date.now()}`;
    console.log(`创建新收藏夹 "${newCollectionName}" (${newCollectionId}) 并添加NFTs ${selectedNFTs.join(', ')}`);
    
    // 重置状态
    setNewCollectionName('');
    resetSelection();
    setShowCollectionModal(false);
  };
  
  // 批量操作菜单
  const renderBatchActionMenu = () => {
    if (!selectionMode) return null;
    
    return (
      <div className="batch-action-menu">
        <div className="selection-info">
          已选择 <span className="selected-count">{selectedNFTs.length}</span> 个NFT
        </div>
        <div className="batch-actions">
          <button 
            className="batch-action-btn select-all"
            onClick={toggleSelectAll}
          >
            {selectedNFTs.length === nfts.length ? '取消全选' : '全选'}
          </button>
          <button 
            className="batch-action-btn add-to-collection"
            onClick={() => setShowCollectionModal(true)}
            disabled={selectedNFTs.length === 0}
          >
            添加到收藏夹
          </button>
          <button 
            className="batch-action-btn batch-favorite"
            onClick={() => {
              // 批量添加到收藏
              selectedNFTs.forEach(id => onToggleFavorite(id, true));
              resetSelection();
            }}
            disabled={selectedNFTs.length === 0}
          >
            批量收藏
          </button>
          <button 
            className="batch-action-btn cancel"
            onClick={resetSelection}
          >
            取消
          </button>
        </div>
      </div>
    );
  };
  
  // 收藏夹选择模态框
  const renderCollectionModal = () => {
    if (!showCollectionModal) return null;
    
    return (
      <div className="collection-modal-overlay">
        <div className="collection-modal">
          <div className="modal-header">
            <h3>添加到收藏夹</h3>
            <button className="close-btn" onClick={() => setShowCollectionModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="create-collection">
              <input
                type="text"
                placeholder="创建新收藏夹..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
              <button 
                className="create-btn"
                onClick={createNewCollection}
                disabled={!newCollectionName.trim()}
              >
                创建
              </button>
            </div>
            <div className="collection-list">
              <h4>选择现有收藏夹</h4>
              {collections.length === 0 ? (
                <p className="no-collections">暂无收藏夹</p>
              ) : (
                <ul>
                  {collections.map(collection => (
                    <li 
                      key={collection.id}
                      className={activeCollection === collection.id ? 'active' : ''}
                      onClick={() => setActiveCollection(collection.id)}
                    >
                      <span className="collection-name">{collection.name}</span>
                      <span className="collection-count">{collection.count || 0}个NFT</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="cancel-btn"
              onClick={() => setShowCollectionModal(false)}
            >
              取消
            </button>
            <button 
              className="confirm-btn"
              onClick={() => addToCollection(activeCollection)}
              disabled={!activeCollection}
            >
              确认添加
            </button>
          </div>
        </div>
      </div>
    );
  };
  
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
    <>
      <div className="nft-list-actions">
        <button 
          className={`batch-select-btn ${selectionMode ? 'active' : ''}`}
          onClick={() => setSelectionMode(!selectionMode)}
        >
          {selectionMode ? '退出批量选择' : '批量选择'}
        </button>
      </div>
      
      {renderBatchActionMenu()}
      
      <div className={`nft-marketplace-list ${viewType === 'grid' ? 'grid-view' : 'list-view'}`}>
        {nfts.map(nft => (
          <div key={nft.id} className="nft-item-wrapper">
            <NFTMarketplaceItem 
              nft={nft}
              onViewDetails={onViewDetails}
              onPurchase={onPurchase}
              onBid={onBid}
              onToggleFavorite={onToggleFavorite}
              selectionMode={selectionMode}
              isSelected={selectedNFTs.includes(nft.id)}
              onToggleSelection={() => toggleNFTSelection(nft.id)}
            />
          </div>
        ))}
      </div>
      
      {renderCollectionModal()}
    </>
  );
};

export default NFTMarketplaceList;
