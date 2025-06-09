import React, { useState, useEffect } from 'react';
import { useNFTMarket } from '../../contexts/NFTMarketContext';
import { useBatchOperations } from '../../hooks/useBatchOperations';
import NFTCard from '../nft-market/NFTCard';
import BatchOperationToolbar from '../batch-operations/BatchOperationToolbar';
import BatchOperationModal from '../batch-operations/BatchOperationModal';
import './NFTMarketplaceEnhanced.css';

/**
 * 增强的NFT市场组件
 * 集成批量操作和收藏夹功能
 */
const NFTMarketplaceEnhanced = () => {
  const { state, dispatch } = useNFTMarket();
  const { executeOperation } = useBatchOperations();
  const [showBatchSelector, setShowBatchSelector] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    category: 'all',
    priceRange: [0, 1000],
    sortBy: 'newest',
    searchQuery: ''
  });

  const {
    nfts,
    loading,
    error,
    selectedNFTs,
    batchOperation,
    filters,
    ui
  } = state;

  // 加载NFT数据
  useEffect(() => {
    loadNFTs();
  }, [filters]);

  const loadNFTs = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // 模拟API调用
      const mockNFTs = generateMockNFTs();
      dispatch({ type: 'SET_NFTS', payload: mockNFTs });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error });
    }
  };

  const generateMockNFTs = () => {
    const categories = ['visual-art', 'sculpture', 'photography', 'music', 'literature'];
    const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];
    const creators = ['Alice Chen', 'Bob Wang', 'Carol Li', 'David Zhang', 'Eva Liu'];
    
    return Array.from({ length: 50 }, (_, index) => ({
      id: `nft-${index + 1}`,
      name: `Cultural NFT #${index + 1}`,
      description: `A unique cultural artifact representing traditional art form #${index + 1}`,
      image: `https://picsum.photos/400/400?random=${index + 1}`,
      price: (Math.random() * 10 + 0.1).toFixed(3),
      creator: creators[Math.floor(Math.random() * creators.length)],
      creatorAvatar: `https://picsum.photos/40/40?random=${index + 100}`,
      collection: `Collection ${Math.floor(index / 10) + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
      isAuction: Math.random() > 0.7,
      auctionEndTime: Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000,
      isForSale: Math.random() > 0.2,
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100),
      lastSalePrice: Math.random() > 0.5 ? (Math.random() * 5 + 0.1).toFixed(3) : null
    }));
  };

  const handleToggleBatchMode = () => {
    setShowBatchSelector(!showBatchSelector);
    if (showBatchSelector) {
      dispatch({ type: 'CLEAR_SELECTION' });
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }));
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  };

  const handleBatchOperationComplete = (results) => {
    dispatch({
      type: 'COMPLETE_BATCH_OPERATION',
      payload: { results }
    });
    
    // 显示成功消息
    console.log('Batch operation completed:', results);
  };

  const filteredNFTs = nfts.filter(nft => {
    // 应用搜索过滤
    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      if (!nft.name.toLowerCase().includes(query) && 
          !nft.creator.toLowerCase().includes(query) &&
          !nft.collection.toLowerCase().includes(query)) {
        return false;
      }
    }

    // 应用分类过滤
    if (filterOptions.category !== 'all' && nft.category !== filterOptions.category) {
      return false;
    }

    // 应用价格范围过滤
    const price = parseFloat(nft.price);
    if (price < filterOptions.priceRange[0] || price > filterOptions.priceRange[1]) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filterOptions.sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'newest':
        return b.id.localeCompare(a.id);
      case 'oldest':
        return a.id.localeCompare(b.id);
      case 'popular':
        return (b.views + b.likes) - (a.views + a.likes);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="marketplace-loading">
        <div className="loading-spinner" />
        <p>加载NFT市场中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketplace-error">
        <h3>加载失败</h3>
        <p>{error.message}</p>
        <button onClick={loadNFTs}>重试</button>
      </div>
    );
  }

  return (
    <div className="nft-marketplace-enhanced">
      <div className="marketplace-header">
        <div className="header-content">
          <h1 className="marketplace-title">NFT市场</h1>
          <p className="marketplace-subtitle">发现和收藏独特的文化数字艺术品</p>
        </div>
        
        <div className="marketplace-actions">
          <button
            className={`batch-mode-toggle ${showBatchSelector ? 'active' : ''}`}
            onClick={handleToggleBatchMode}
          >
            <span className="toggle-icon">{showBatchSelector ? '✓' : '☐'}</span>
            <span className="toggle-text">批量选择</span>
          </button>
        </div>
      </div>

      <div className="marketplace-filters">
        <div className="filter-group">
          <div className="search-container">
            <input
              type="text"
              placeholder="搜索NFT、创作者或收藏..."
              value={filterOptions.searchQuery}
              onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select
            value={filterOptions.category}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
            className="filter-select"
          >
            <option value="all">所有分类</option>
            <option value="visual-art">视觉艺术</option>
            <option value="sculpture">雕塑</option>
            <option value="photography">摄影</option>
            <option value="music">音乐</option>
            <option value="literature">文学</option>
          </select>

          <select
            value={filterOptions.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
            className="filter-select"
          >
            <option value="newest">最新上架</option>
            <option value="oldest">最早上架</option>
            <option value="price-low">价格从低到高</option>
            <option value="price-high">价格从高到低</option>
            <option value="popular">最受欢迎</option>
          </select>
        </div>

        <div className="filter-stats">
          <span className="results-count">
            {filteredNFTs.length} 个NFT
          </span>
          {selectedNFTs.length > 0 && (
            <span className="selected-count">
              已选择 {selectedNFTs.length} 个
            </span>
          )}
        </div>
      </div>

      <div className="marketplace-content">
        <div className="nft-grid">
          {filteredNFTs.map(nft => (
            <NFTCard
              key={nft.id}
              nft={nft}
              showBatchSelector={showBatchSelector}
            />
          ))}
        </div>

        {filteredNFTs.length === 0 && (
          <div className="empty-results">
            <div className="empty-icon">🎨</div>
            <h3>未找到匹配的NFT</h3>
            <p>尝试调整搜索条件或浏览其他分类</p>
            <button onClick={() => handleFilterChange({ 
              searchQuery: '', 
              category: 'all' 
            })}>
              清除筛选
            </button>
          </div>
        )}
      </div>

      {/* 批量操作工具栏 */}
      <BatchOperationToolbar />

      {/* 批量操作确认弹窗 */}
      {ui.showBatchModal && (
        <BatchOperationModal
          isOpen={ui.showBatchModal}
          operationType={batchOperation.type}
          selectedNFTs={selectedNFTs.map(id => nfts.find(nft => nft.id === id))}
          onConfirm={handleBatchOperationComplete}
          onCancel={() => dispatch({
            type: 'SET_UI_STATE',
            payload: { showBatchModal: false }
          })}
        />
      )}
    </div>
  );
};

export default NFTMarketplaceEnhanced;

