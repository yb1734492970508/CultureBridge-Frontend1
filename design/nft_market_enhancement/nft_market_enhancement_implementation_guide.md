# NFT市场增强功能实现指南

## 实现概述

基于前面设计的NFT批量操作功能和NFT收藏夹功能的UI/UX规范，本指南将为CB-FRONTEND团队提供详细的实现建议，包括组件架构、代码示例、集成方案和最佳实践。

## 技术架构

### 1. 组件架构设计

```javascript
// 主要组件层次结构
src/
├── components/
│   ├── nft-market/
│   │   ├── NFTMarketplace.js (主市场页面)
│   │   ├── NFTCard.js (NFT卡片组件)
│   │   ├── NFTBatchSelector.js (批量选择器)
│   │   └── NFTGrid.js (NFT网格布局)
│   ├── batch-operations/
│   │   ├── BatchOperationToolbar.js (批量操作工具栏)
│   │   ├── BatchOperationModal.js (批量操作确认弹窗)
│   │   ├── BatchOperationProgress.js (进度指示器)
│   │   └── BatchOperationResult.js (结果展示)
│   ├── favorites/
│   │   ├── FavoritesOverview.js (收藏夹概览)
│   │   ├── CollectionGrid.js (收藏夹网格)
│   │   ├── CollectionDetail.js (收藏夹详情)
│   │   ├── CollectionModal.js (创建/编辑弹窗)
│   │   └── SmartRecommendations.js (智能推荐)
│   └── shared/
│       ├── LoadingSpinner.js (加载指示器)
│       ├── ErrorBoundary.js (错误边界)
│       └── Toast.js (消息提示)
├── hooks/
│   ├── useBatchOperations.js (批量操作逻辑)
│   ├── useFavorites.js (收藏夹逻辑)
│   ├── useNFTSelection.js (NFT选择逻辑)
│   └── useLocalStorage.js (本地存储)
├── services/
│   ├── NFTBatchOperationService.js (已存在)
│   ├── NFTCollectionService.js (已存在)
│   ├── NFTMarketplaceService.js (市场服务)
│   └── RecommendationService.js (推荐服务)
├── contexts/
│   ├── BatchOperationContext.js (批量操作上下文)
│   ├── FavoritesContext.js (收藏夹上下文)
│   └── NFTMarketContext.js (市场上下文)
└── styles/
    ├── batch-operations.css (批量操作样式)
    ├── favorites.css (收藏夹样式)
    └── nft-market-enhanced.css (增强市场样式)
```

### 2. 状态管理设计

```javascript
// 使用React Context进行状态管理
// contexts/NFTMarketContext.js
import React, { createContext, useContext, useReducer } from 'react';

const NFTMarketContext = createContext();

const initialState = {
  // NFT数据
  nfts: [],
  loading: false,
  error: null,
  
  // 批量操作状态
  selectedNFTs: [],
  batchOperation: {
    type: null,
    isProcessing: false,
    progress: {
      total: 0,
      completed: 0,
      failed: 0
    },
    results: []
  },
  
  // 收藏夹状态
  favorites: {
    collections: [],
    currentCollection: null,
    stats: {
      totalCollections: 0,
      totalNFTs: 0,
      totalValue: 0
    }
  },
  
  // 筛选和搜索
  filters: {
    category: 'all',
    priceRange: [0, 1000],
    sortBy: 'newest',
    searchQuery: ''
  },
  
  // UI状态
  ui: {
    viewMode: 'grid',
    showBatchToolbar: false,
    showCollectionModal: false,
    showBatchModal: false
  }
};

function nftMarketReducer(state, action) {
  switch (action.type) {
    case 'SET_NFTS':
      return {
        ...state,
        nfts: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case 'TOGGLE_NFT_SELECTION':
      const { nftId } = action.payload;
      const isSelected = state.selectedNFTs.includes(nftId);
      const newSelectedNFTs = isSelected
        ? state.selectedNFTs.filter(id => id !== nftId)
        : [...state.selectedNFTs, nftId];
      
      return {
        ...state,
        selectedNFTs: newSelectedNFTs,
        ui: {
          ...state.ui,
          showBatchToolbar: newSelectedNFTs.length > 0
        }
      };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedNFTs: [],
        ui: {
          ...state.ui,
          showBatchToolbar: false
        }
      };
    
    case 'START_BATCH_OPERATION':
      return {
        ...state,
        batchOperation: {
          ...state.batchOperation,
          type: action.payload.type,
          isProcessing: true,
          progress: {
            total: state.selectedNFTs.length,
            completed: 0,
            failed: 0
          },
          results: []
        }
      };
    
    case 'UPDATE_BATCH_PROGRESS':
      return {
        ...state,
        batchOperation: {
          ...state.batchOperation,
          progress: {
            ...state.batchOperation.progress,
            ...action.payload
          }
        }
      };
    
    case 'COMPLETE_BATCH_OPERATION':
      return {
        ...state,
        batchOperation: {
          ...state.batchOperation,
          isProcessing: false,
          results: action.payload.results
        },
        selectedNFTs: [],
        ui: {
          ...state.ui,
          showBatchToolbar: false
        }
      };
    
    case 'UPDATE_FAVORITES':
      return {
        ...state,
        favorites: {
          ...state.favorites,
          ...action.payload
        }
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };
    
    case 'SET_UI_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload
        }
      };
    
    default:
      return state;
  }
}

export function NFTMarketProvider({ children }) {
  const [state, dispatch] = useReducer(nftMarketReducer, initialState);
  
  return (
    <NFTMarketContext.Provider value={{ state, dispatch }}>
      {children}
    </NFTMarketContext.Provider>
  );
}

export function useNFTMarket() {
  const context = useContext(NFTMarketContext);
  if (!context) {
    throw new Error('useNFTMarket must be used within NFTMarketProvider');
  }
  return context;
}
```

## 核心组件实现

### 1. 增强的NFT卡片组件

```javascript
// components/nft-market/NFTCard.js
import React, { useState } from 'react';
import { useNFTMarket } from '../../contexts/NFTMarketContext';
import { useFavorites } from '../../hooks/useFavorites';
import './NFTCard.css';

const NFTCard = ({ nft, showBatchSelector = false }) => {
  const { state, dispatch } = useNFTMarket();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const isSelected = state.selectedNFTs.includes(nft.id);
  const isFav = isFavorite(nft.id);
  
  const handleCardClick = (e) => {
    if (showBatchSelector && !e.target.closest('.nft-card-actions')) {
      handleToggleSelection();
    }
  };
  
  const handleToggleSelection = () => {
    dispatch({
      type: 'TOGGLE_NFT_SELECTION',
      payload: { nftId: nft.id }
    });
  };
  
  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      if (isFav) {
        await removeFromFavorites(nft.id);
      } else {
        await addToFavorites(nft.id);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };
  
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(3);
  };
  
  const formatTimeLeft = (timestamp) => {
    const now = Date.now();
    const timeLeft = timestamp - now;
    
    if (timeLeft <= 0) return '已结束';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}天 ${hours}小时`;
    return `${hours}小时`;
  };
  
  return (
    <div 
      className={`nft-card ${isSelected ? 'selected' : ''} ${showBatchSelector ? 'selectable' : ''}`}
      onClick={handleCardClick}
    >
      {showBatchSelector && (
        <div className={`nft-selector-checkbox ${isSelected ? 'selected' : ''}`}>
          {isSelected && <span className="checkmark">✓</span>}
        </div>
      )}
      
      {isSelected && <div className="nft-selector-overlay" />}
      
      <div className="nft-card-image-container">
        {!imageLoaded && !imageError && (
          <div className="nft-card-image-placeholder">
            <div className="loading-spinner" />
          </div>
        )}
        
        {imageError ? (
          <div className="nft-card-image-error">
            <span>图片加载失败</span>
          </div>
        ) : (
          <img
            src={nft.image}
            alt={nft.name}
            className={`nft-card-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        <div className="nft-card-actions">
          <button
            className={`nft-action-button favorite ${isFav ? 'active' : ''}`}
            onClick={handleToggleFavorite}
            title={isFav ? '取消收藏' : '添加收藏'}
          >
            <span className="heart-icon">{isFav ? '❤️' : '🤍'}</span>
          </button>
          
          <button
            className="nft-action-button share"
            onClick={(e) => {
              e.stopPropagation();
              // 实现分享功能
            }}
            title="分享"
          >
            <span className="share-icon">🔗</span>
          </button>
        </div>
        
        {nft.isAuction && (
          <div className="nft-auction-badge">
            <span className="auction-text">拍卖中</span>
            <span className="auction-time">{formatTimeLeft(nft.auctionEndTime)}</span>
          </div>
        )}
        
        {nft.rarity && (
          <div className={`nft-rarity-badge ${nft.rarity.toLowerCase()}`}>
            {nft.rarity}
          </div>
        )}
      </div>
      
      <div className="nft-card-info">
        <div className="nft-card-header">
          <h3 className="nft-card-name">{nft.name}</h3>
          <div className="nft-card-collection">{nft.collection}</div>
        </div>
        
        <div className="nft-card-creator">
          <img src={nft.creatorAvatar} alt={nft.creator} className="creator-avatar" />
          <span className="creator-name">{nft.creator}</span>
        </div>
        
        <div className="nft-card-price-section">
          <div className="nft-card-price">
            <span className="price-label">{nft.isAuction ? '当前出价' : '价格'}</span>
            <div className="price-value">
              <span className="eth-icon">Ξ</span>
              <span className="price-amount">{formatPrice(nft.price)}</span>
            </div>
          </div>
          
          {nft.lastSalePrice && (
            <div className="nft-card-last-sale">
              <span className="last-sale-label">上次成交</span>
              <span className="last-sale-price">Ξ {formatPrice(nft.lastSalePrice)}</span>
            </div>
          )}
        </div>
        
        <div className="nft-card-footer">
          <div className="nft-card-stats">
            <span className="stat-item">
              <span className="stat-icon">👁️</span>
              <span className="stat-value">{nft.views || 0}</span>
            </span>
            <span className="stat-item">
              <span className="stat-icon">❤️</span>
              <span className="stat-value">{nft.likes || 0}</span>
            </span>
          </div>
          
          <div className="nft-card-category">
            {nft.category}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
```

### 2. 批量操作工具栏组件

```javascript
// components/batch-operations/BatchOperationToolbar.js
import React, { useState, useEffect } from 'react';
import { useNFTMarket } from '../../contexts/NFTMarketContext';
import { useBatchOperations } from '../../hooks/useBatchOperations';
import './BatchOperationToolbar.css';

const BatchOperationToolbar = () => {
  const { state, dispatch } = useNFTMarket();
  const { executeOperation, estimateGas } = useBatchOperations();
  const [gasEstimate, setGasEstimate] = useState(null);
  
  const { selectedNFTs, ui } = state;
  const selectedCount = selectedNFTs.length;
  
  useEffect(() => {
    if (selectedCount > 0) {
      // 估算Gas费用
      estimateGas('batch_favorite', selectedNFTs)
        .then(setGasEstimate)
        .catch(console.error);
    }
  }, [selectedNFTs, estimateGas]);
  
  const handleClearSelection = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
  };
  
  const handleBatchOperation = (operationType) => {
    dispatch({
      type: 'SET_UI_STATE',
      payload: { showBatchModal: true }
    });
    
    dispatch({
      type: 'START_BATCH_OPERATION',
      payload: { type: operationType }
    });
  };
  
  const getSelectedNFTs = () => {
    return state.nfts.filter(nft => selectedNFTs.includes(nft.id));
  };
  
  const canPurchase = () => {
    const selected = getSelectedNFTs();
    return selected.every(nft => !nft.isAuction && nft.isForSale);
  };
  
  const canBid = () => {
    const selected = getSelectedNFTs();
    return selected.every(nft => nft.isAuction);
  };
  
  if (!ui.showBatchToolbar || selectedCount === 0) {
    return null;
  }
  
  return (
    <div className="batch-operation-toolbar">
      <div className="toolbar-content">
        <div className="selected-info">
          <div className="selected-count">
            <span className="selected-count-badge">{selectedCount}</span>
            <span className="selected-text">已选择</span>
          </div>
          
          {gasEstimate && (
            <div className="gas-estimate">
              <span className="gas-label">预估费用:</span>
              <span className="gas-value">{gasEstimate.totalCost}</span>
            </div>
          )}
        </div>
        
        <div className="toolbar-actions">
          <button
            className="batch-action-button primary"
            onClick={() => handleBatchOperation('favorite')}
            title="批量收藏"
          >
            <span className="action-icon">❤️</span>
            <span className="action-text">收藏</span>
          </button>
          
          <button
            className="batch-action-button secondary"
            onClick={() => handleBatchOperation('add_to_collection')}
            title="添加到收藏集"
          >
            <span className="action-icon">📁</span>
            <span className="action-text">收藏集</span>
          </button>
          
          {canPurchase() && (
            <button
              className="batch-action-button primary"
              onClick={() => handleBatchOperation('purchase')}
              title="批量购买"
            >
              <span className="action-icon">🛒</span>
              <span className="action-text">购买</span>
            </button>
          )}
          
          {canBid() && (
            <button
              className="batch-action-button secondary"
              onClick={() => handleBatchOperation('bid')}
              title="批量出价"
            >
              <span className="action-icon">💰</span>
              <span className="action-text">出价</span>
            </button>
          )}
          
          <button
            className="batch-action-button tertiary"
            onClick={() => handleBatchOperation('share')}
            title="批量分享"
          >
            <span className="action-icon">🔗</span>
            <span className="action-text">分享</span>
          </button>
        </div>
        
        <button
          className="clear-selection-button"
          onClick={handleClearSelection}
          title="清除选择"
        >
          <span className="clear-icon">✕</span>
        </button>
      </div>
    </div>
  );
};

export default BatchOperationToolbar;
```

### 3. 收藏夹概览组件

```javascript
// components/favorites/FavoritesOverview.js
import React, { useState, useEffect } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import CollectionGrid from './CollectionGrid';
import CollectionModal from './CollectionModal';
import SmartRecommendations from './SmartRecommendations';
import './FavoritesOverview.css';

const FavoritesOverview = () => {
  const {
    collections,
    stats,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection
  } = useFavorites();
  
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const handleCreateCollection = async (collectionData) => {
    try {
      await createCollection(collectionData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };
  
  const handleEditCollection = async (collectionData) => {
    try {
      await updateCollection(editingCollection.id, collectionData);
      setEditingCollection(null);
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  };
  
  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm('确定要删除这个收藏夹吗？此操作不可撤销。')) {
      try {
        await deleteCollection(collectionId);
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    }
  };
  
  const filteredCollections = collections
    .filter(collection => 
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.nftCount - a.nftCount;
        case 'value':
          return b.totalValue - a.totalValue;
        default:
          return 0;
      }
    });
  
  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="loading-spinner" />
        <p>加载收藏夹中...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="favorites-error">
        <h3>加载失败</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>重试</button>
      </div>
    );
  }
  
  return (
    <div className="favorites-overview">
      <div className="favorites-header">
        <div className="header-content">
          <h1 className="favorites-title">我的收藏</h1>
          <p className="favorites-subtitle">管理和浏览您的NFT收藏夹</p>
        </div>
        
        <div className="favorites-actions">
          <button
            className="create-collection-button"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="button-icon">+</span>
            <span className="button-text">创建收藏夹</span>
          </button>
          
          <div className="view-toggle">
            <button
              className={`view-toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <span className="view-icon">⊞</span>
            </button>
            <button
              className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <span className="view-icon">☰</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="favorites-stats">
        <div className="stat-card">
          <div className="stat-icon collections">📁</div>
          <div className="stat-value">{stats.totalCollections}</div>
          <div className="stat-label">收藏夹</div>
          <div className="stat-change positive">
            <span className="change-icon">↗</span>
            <span className="change-text">+2 本月</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon total-nfts">🎨</div>
          <div className="stat-value">{stats.totalNFTs}</div>
          <div className="stat-label">收藏NFT</div>
          <div className="stat-change positive">
            <span className="change-icon">↗</span>
            <span className="change-text">+{stats.recentlyAdded} 本周</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon total-value">💎</div>
          <div className="stat-value">Ξ {stats.totalValue.toFixed(2)}</div>
          <div className="stat-label">总价值</div>
          <div className={`stat-change ${stats.valueChange >= 0 ? 'positive' : 'negative'}`}>
            <span className="change-icon">{stats.valueChange >= 0 ? '↗' : '↘'}</span>
            <span className="change-text">{stats.valueChange >= 0 ? '+' : ''}{stats.valueChange.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon recent-activity">⚡</div>
          <div className="stat-value">{stats.recentActivity}</div>
          <div className="stat-label">近期活动</div>
          <div className="stat-change">
            <span className="change-text">过去7天</span>
          </div>
        </div>
      </div>
      
      <SmartRecommendations />
      
      <div className="favorites-content">
        <div className="content-header">
          <div className="content-filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="搜索收藏夹..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">最新创建</option>
              <option value="oldest">最早创建</option>
              <option value="name">名称排序</option>
              <option value="size">NFT数量</option>
              <option value="value">总价值</option>
            </select>
          </div>
          
          <div className="content-info">
            <span className="collection-count">
              {filteredCollections.length} 个收藏夹
            </span>
          </div>
        </div>
        
        <CollectionGrid
          collections={filteredCollections}
          viewMode={viewMode}
          onEdit={setEditingCollection}
          onDelete={handleDeleteCollection}
        />
      </div>
      
      {showCreateModal && (
        <CollectionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCollection}
          title="创建新收藏夹"
        />
      )}
      
      {editingCollection && (
        <CollectionModal
          isOpen={!!editingCollection}
          onClose={() => setEditingCollection(null)}
          onSubmit={handleEditCollection}
          initialData={editingCollection}
          title="编辑收藏夹"
        />
      )}
    </div>
  );
};

export default FavoritesOverview;
```

## 自定义Hooks实现

### 1. 批量操作Hook

```javascript
// hooks/useBatchOperations.js
import { useState, useCallback } from 'react';
import NFTBatchOperationService from '../services/NFTBatchOperationService';

export const useBatchOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ total: 0, completed: 0, failed: 0 });
  const [results, setResults] = useState([]);
  
  const executeOperation = useCallback(async (operationType, nftIds, options = {}) => {
    setIsProcessing(true);
    setProgress({ total: nftIds.length, completed: 0, failed: 0 });
    setResults([]);
    
    const operationResults = [];
    
    try {
      switch (operationType) {
        case 'favorite':
          const favoriteResult = await NFTBatchOperationService.addToFavorites(nftIds);
          operationResults.push(favoriteResult);
          break;
          
        case 'add_to_collection':
          const collectionResult = await NFTBatchOperationService.addToCollection(
            nftIds, 
            options.collectionId
          );
          operationResults.push(collectionResult);
          break;
          
        case 'purchase':
          // 批量购买需要逐个处理
          for (let i = 0; i < nftIds.length; i++) {
            try {
              const result = await NFTBatchOperationService.batchPurchase([nftIds[i]]);
              operationResults.push({ nftId: nftIds[i], ...result });
              setProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
            } catch (error) {
              operationResults.push({ 
                nftId: nftIds[i], 
                success: false, 
                error: error.message 
              });
              setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
            }
          }
          break;
          
        case 'bid':
          const bidResult = await NFTBatchOperationService.batchBid(nftIds, options.bidAmount);
          operationResults.push(bidResult);
          break;
          
        default:
          throw new Error(`Unsupported operation type: ${operationType}`);
      }
      
      setResults(operationResults);
      return operationResults;
      
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
  const estimateGas = useCallback(async (operationType, nftIds) => {
    try {
      return await NFTBatchOperationService.estimateBatchGas(operationType, nftIds);
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return null;
    }
  }, []);
  
  const cancelOperation = useCallback(() => {
    // 实现操作取消逻辑
    setIsProcessing(false);
  }, []);
  
  return {
    isProcessing,
    progress,
    results,
    executeOperation,
    estimateGas,
    cancelOperation
  };
};
```

### 2. 收藏夹管理Hook

```javascript
// hooks/useFavorites.js
import { useState, useEffect, useCallback } from 'react';
import NFTCollectionService from '../services/NFTCollectionService';

export const useFavorites = () => {
  const [collections, setCollections] = useState([]);
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalNFTs: 0,
    totalValue: 0,
    recentlyAdded: 0,
    recentActivity: 0,
    valueChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 加载收藏夹数据
  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      const collectionsData = await NFTCollectionService.getUserCollections();
      setCollections(collectionsData);
      
      // 计算统计数据
      const totalNFTs = collectionsData.reduce((sum, col) => sum + col.nftCount, 0);
      const totalValue = collectionsData.reduce((sum, col) => sum + col.totalValue, 0);
      
      setStats({
        totalCollections: collectionsData.length,
        totalNFTs,
        totalValue,
        recentlyAdded: 5, // 示例数据
        recentActivity: 12, // 示例数据
        valueChange: 2.5 // 示例数据
      });
      
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Failed to load collections:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 创建收藏夹
  const createCollection = useCallback(async (collectionData) => {
    try {
      const newCollection = await NFTCollectionService.createCollection(collectionData);
      setCollections(prev => [newCollection, ...prev]);
      setStats(prev => ({
        ...prev,
        totalCollections: prev.totalCollections + 1
      }));
      return newCollection;
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }, []);
  
  // 更新收藏夹
  const updateCollection = useCallback(async (collectionId, updateData) => {
    try {
      const updatedCollection = await NFTCollectionService.updateCollection(
        collectionId, 
        updateData
      );
      setCollections(prev => 
        prev.map(col => col.id === collectionId ? updatedCollection : col)
      );
      return updatedCollection;
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    }
  }, []);
  
  // 删除收藏夹
  const deleteCollection = useCallback(async (collectionId) => {
    try {
      await NFTCollectionService.deleteCollection(collectionId);
      setCollections(prev => prev.filter(col => col.id !== collectionId));
      setStats(prev => ({
        ...prev,
        totalCollections: prev.totalCollections - 1
      }));
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  }, []);
  
  // 添加NFT到收藏
  const addToFavorites = useCallback(async (nftId) => {
    try {
      // 添加到默认收藏夹或创建新的收藏夹
      const result = await NFTCollectionService.addToFavorites(nftId);
      // 更新本地状态
      await loadCollections();
      return result;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  }, [loadCollections]);
  
  // 从收藏中移除NFT
  const removeFromFavorites = useCallback(async (nftId) => {
    try {
      const result = await NFTCollectionService.removeFromFavorites(nftId);
      // 更新本地状态
      await loadCollections();
      return result;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw error;
    }
  }, [loadCollections]);
  
  // 检查NFT是否已收藏
  const isFavorite = useCallback((nftId) => {
    return collections.some(collection => 
      collection.nfts && collection.nfts.some(nft => nft.id === nftId)
    );
  }, [collections]);
  
  // 获取NFT所在的收藏夹
  const getCollectionsForNFT = useCallback((nftId) => {
    return collections.filter(collection => 
      collection.nfts && collection.nfts.some(nft => nft.id === nftId)
    );
  }, [collections]);
  
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);
  
  return {
    collections,
    stats,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getCollectionsForNFT,
    refreshCollections: loadCollections
  };
};
```

## 样式实现

### 1. 批量操作样式

```css
/* styles/batch-operations.css */
.batch-operation-toolbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 16px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  transition: all 0.3s ease;
  max-width: 90vw;
  overflow-x: auto;
}

.toolbar-content {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: max-content;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-weight: 500;
}

.selected-count-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.gas-estimate {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #718096;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.batch-action-button {
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  white-space: nowrap;
}

.batch-action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.batch-action-button.secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.batch-action-button.tertiary {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.batch-action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.batch-action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.clear-selection-button {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 16px;
}

.clear-selection-button:hover {
  background: #f7fafc;
  color: #4a5568;
}

/* NFT卡片选择样式 */
.nft-card {
  position: relative;
  transition: all 0.3s ease;
}

.nft-card.selectable {
  cursor: pointer;
}

.nft-card.selected {
  transform: translateY(-2px);
}

.nft-selector-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid #e1e5e9;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nft-selector-checkbox.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  transform: scale(1.1);
}

.nft-selector-checkbox .checkmark {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.nft-selector-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid #667eea;
  border-radius: 12px;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-operation-toolbar {
    bottom: 16px;
    left: 16px;
    right: 16px;
    transform: none;
    padding: 12px 16px;
  }
  
  .toolbar-content {
    gap: 12px;
  }
  
  .batch-action-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .batch-action-button .action-text {
    display: none;
  }
  
  .selected-info {
    gap: 8px;
  }
  
  .gas-estimate {
    display: none;
  }
}

@media (max-width: 480px) {
  .toolbar-actions {
    gap: 4px;
  }
  
  .batch-action-button {
    padding: 8px;
    min-width: 36px;
  }
}
```

### 2. 收藏夹样式

```css
/* styles/favorites.css */
.favorites-overview {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  flex: 1;
}

.favorites-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.favorites-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 0;
}

.favorites-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.create-collection-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-collection-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.view-toggle {
  display: flex;
  background: #f7fafc;
  border-radius: 10px;
  padding: 4px;
}

.view-toggle-button {
  padding: 8px 12px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #4a5568;
  font-size: 16px;
}

.view-toggle-button.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorites-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 24px;
}

.stat-icon.collections {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.total-nfts {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.total-value {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.recent-activity {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #38a169;
}

.stat-change.negative {
  color: #e53e3e;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
}

.content-filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-container {
  position: relative;
}

.search-input {
  padding: 10px 16px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  width: 250px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.sort-select {
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.collection-count {
  color: #718096;
  font-size: 14px;
}

/* 加载和错误状态 */
.favorites-loading,
.favorites-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.favorites-error h3 {
  color: #e53e3e;
  margin-bottom: 8px;
}

.favorites-error button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .favorites-overview {
    padding: 16px;
  }
  
  .favorites-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .favorites-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .favorites-title {
    font-size: 24px;
  }
  
  .favorites-stats {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .content-filters {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }
  
  .search-input {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .favorites-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .create-collection-button {
    padding: 10px 16px;
    font-size: 14px;
  }
}
```

## 集成和测试建议

### 1. 组件集成步骤

1. **安装依赖**：确保所有必要的依赖包已安装
2. **创建上下文**：设置NFTMarketContext和相关状态管理
3. **实现服务层**：完善NFTBatchOperationService和NFTCollectionService
4. **逐步集成组件**：从基础组件开始，逐步添加复杂功能
5. **样式调整**：根据现有设计系统调整样式
6. **功能测试**：测试各个功能点的正常工作

### 2. 测试用例

```javascript
// 批量操作测试
describe('Batch Operations', () => {
  test('should select multiple NFTs', () => {
    // 测试NFT选择功能
  });
  
  test('should execute batch favorite operation', () => {
    // 测试批量收藏功能
  });
  
  test('should estimate gas correctly', () => {
    // 测试Gas估算功能
  });
});

// 收藏夹测试
describe('Favorites Management', () => {
  test('should create new collection', () => {
    // 测试创建收藏夹
  });
  
  test('should add NFT to collection', () => {
    // 测试添加NFT到收藏夹
  });
  
  test('should display collection stats', () => {
    // 测试统计数据显示
  });
});
```

### 3. 性能优化建议

1. **虚拟滚动**：对于大量NFT的页面使用虚拟滚动
2. **图片懒加载**：实现图片懒加载和占位符
3. **状态缓存**：缓存收藏夹数据和用户偏好
4. **防抖搜索**：搜索功能使用防抖技术
5. **代码分割**：使用React.lazy进行代码分割

这个实现指南为CB-FRONTEND团队提供了详细的技术实现方案，包括组件架构、代码示例、样式实现和集成建议，确保NFT市场增强功能能够高质量地实现并与现有系统无缝集成。

