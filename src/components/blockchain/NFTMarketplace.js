import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { formatAddress } from '../../utils/formatters';
import '../../styles/marketplace.css';
import NFTSearchBar from './NFTSearchBar';
import NFTFilterPanel from './NFTFilterPanel';
import NFTSearchService from './NFTSearchService';
import NFTFilterService from './NFTFilterService';
import NFTRecommendationService from './NFTRecommendationService';

// 懒加载组件
const NFTDetailModal = lazy(() => import('./NFTDetailModal'));
const NFTBidModal = lazy(() => import('./NFTBidModal'));
const NFTPurchaseModal = lazy(() => import('./NFTPurchaseModal'));
const NFTMarketplaceList = lazy(() => import('./NFTMarketplaceList'));
const NFTRecommendationPanel = lazy(() => import('./NFTRecommendationPanel'));

// 骨架屏组件
const NFTMarketplaceSkeleton = () => (
  <div className="nft-marketplace-container">
    <div className="marketplace-header-skeleton">
      <div className="skeleton-title"></div>
      <div className="skeleton-actions">
        <div className="skeleton-search"></div>
        <div className="skeleton-filter"></div>
      </div>
    </div>
    <div className="marketplace-content-skeleton">
      <div className="skeleton-sidebar">
        <div className="skeleton-category"></div>
        <div className="skeleton-category"></div>
        <div className="skeleton-category"></div>
        <div className="skeleton-price-range"></div>
      </div>
      <div className="skeleton-items-grid">
        {Array(8).fill(0).map((_, index) => (
          <div key={index} className="skeleton-nft-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-info">
              <div className="skeleton-title"></div>
              <div className="skeleton-price"></div>
              <div className="skeleton-actions"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * NFT市场组件
 * 提供NFT浏览、筛选、购买和竞价功能
 * 
 * @component
 * @version 3.0.0
 */
const NFTMarketplace = () => {
  const navigate = useNavigate();
  const { account, active } = useBlockchain();
  
  // 服务实例
  const searchService = useMemo(() => new NFTSearchService({
    maxHistoryItems: 10,
    minSearchLength: 2,
    enableFuzzySearch: true,
    fuzzyThreshold: 0.3
  }), []);
  
  const filterService = useMemo(() => new NFTFilterService({
    maxSavedFilters: 5,
    enableMultiSelect: true,
    rememberLastFilter: true
  }), []);
  
  const recommendationService = useMemo(() => new NFTRecommendationService({
    maxRecommendations: 10,
    enablePersonalization: true,
    similarityThreshold: 0.3,
    maxHistoryItems: 50
  }), []);
  
  // 状态管理
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [displayedNfts, setDisplayedNfts] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(filterService.getCurrentFilters());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [modalState, setModalState] = useState({
    detail: false,
    bid: false,
    purchase: false
  });
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  
  // 从NFTMarketplaceContract导入的合约接口
  const { 
    fetchMarketItems, 
    fetchUserNFTs,
    fetchItemMetadata,
    purchaseItem,
    placeBid,
    cancelListing,
    isApprovedForAll,
    approveMarketplace
  } = require('./NFTMarketplaceContract');
  
  // 加载NFT数据
  useEffect(() => {
    let isMounted = true;
    
    const loadNFTs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 获取市场上的NFT
        const marketItems = await fetchMarketItems();
        
        // 获取NFT元数据
        const itemsWithMetadata = await Promise.all(
          marketItems.map(async (item) => {
            const metadata = await fetchItemMetadata(item.tokenURI);
            return { ...item, ...metadata };
          })
        );
        
        if (isMounted) {
          setNfts(itemsWithMetadata);
          setFilteredNfts(itemsWithMetadata);
          setDisplayedNfts(itemsWithMetadata);
        }
      } catch (error) {
        console.error('加载NFT失败:', error);
        if (isMounted) {
          setError('加载NFT时出错，请刷新页面重试');
        }
      } finally {
        if (isMounted) {
          // 使用setTimeout模拟更真实的加载体验，实际生产环境可移除
          setTimeout(() => {
            setIsLoading(false);
          }, 800);
        }
      }
    };
    
    loadNFTs();
    
    // 加载用户收藏
    const loadFavorites = () => {
      const savedFavorites = localStorage.getItem('nftFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    };
    
    loadFavorites();
    
    return () => {
      isMounted = false;
    };
  }, [fetchMarketItems, fetchItemMetadata]);
  
  // 监听筛选条件变化
  useEffect(() => {
    applyFiltersAndSearch();
  }, [filters, searchTerm, nfts]);
  
  // 保存收藏到本地存储
  useEffect(() => {
    localStorage.setItem('nftFavorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // 应用筛选和搜索
  const applyFiltersAndSearch = () => {
    // 先应用筛选条件
    let result = filterService.applyFilters(nfts);
    
    // 再应用搜索
    if (searchTerm) {
      result = searchService.search(result, searchTerm);
    }
    
    // 应用排序
    result = filterService.sortNFTs(result);
    
    setFilteredNfts(result);
    setDisplayedNfts(result);
  };
  
  // 处理搜索
  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  
  // 处理筛选变化
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    filterService.setCurrentFilters(newFilters);
  };
  
  // 处理视图模式切换
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // 处理NFT点击
  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
    setModalState(prev => ({ ...prev, detail: true }));
    
    // 增加浏览量
    const updatedNfts = nfts.map(item => {
      if (item.id === nft.id) {
        return { ...item, views: (item.views || 0) + 1 };
      }
      return item;
    });
    
    setNfts(updatedNfts);
    
    // 记录浏览历史用于推荐
    recommendationService.recordView(nft);
  };
  
  // 处理收藏切换
  const handleToggleFavorite = (nftId) => {
    setFavorites(prev => {
      if (prev.includes(nftId)) {
        return prev.filter(id => id !== nftId);
      } else {
        return [...prev, nftId];
      }
    });
  };
  
  // 处理购买
  const handlePurchase = async (nft) => {
    if (!active) {
      showNotification('请先连接钱包', 'warning');
      return;
    }
    
    setSelectedNFT(nft);
    setModalState(prev => ({ ...prev, purchase: true }));
  };
  
  // 处理竞价
  const handleBid = (nft) => {
    if (!active) {
      showNotification('请先连接钱包', 'warning');
      return;
    }
    
    setSelectedNFT(nft);
    setModalState(prev => ({ ...prev, bid: true }));
  };
  
  // 处理购买确认
  const handleConfirmPurchase = async (nft, amount) => {
    try {
      setIsLoading(true);
      const result = await purchaseItem(nft.itemId, amount);
      
      if (result.success) {
        showNotification(`成功购买 ${nft.name}!`, 'success');
        
        // 更新NFT列表
        const updatedNfts = nfts.filter(item => item.id !== nft.id);
        setNfts(updatedNfts);
        setFilteredNfts(prev => prev.filter(item => item.id !== nft.id));
        setDisplayedNfts(prev => prev.filter(item => item.id !== nft.id));
      } else {
        showNotification(`购买失败: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('购买失败:', error);
      showNotification('购买过程中发生错误', 'error');
    } finally {
      setIsLoading(false);
      closeAllModals();
    }
  };
  
  // 处理竞价确认
  const handleConfirmBid = async (nft, amount) => {
    try {
      setIsLoading(true);
      const result = await placeBid(nft.itemId, amount);
      
      if (result.success) {
        showNotification(`成功对 ${nft.name} 出价!`, 'success');
        
        // 更新NFT竞价信息
        const updatedNfts = nfts.map(item => {
          if (item.id === nft.id) {
            return { 
              ...item, 
              highestBid: amount,
              highestBidder: account
            };
          }
          return item;
        });
        
        setNfts(updatedNfts);
        applyFiltersAndSearch();
      } else {
        showNotification(`出价失败: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('出价失败:', error);
      showNotification('出价过程中发生错误', 'error');
    } finally {
      setIsLoading(false);
      closeAllModals();
    }
  };
  
  // 处理取消上架
  const handleCancelListing = async (nft) => {
    try {
      setIsLoading(true);
      const result = await cancelListing(nft.itemId);
      
      if (result.success) {
        showNotification(`成功取消 ${nft.name} 的上架!`, 'success');
        
        // 更新NFT列表
        const updatedNfts = nfts.filter(item => item.id !== nft.id);
        setNfts(updatedNfts);
        setFilteredNfts(prev => prev.filter(item => item.id !== nft.id));
        setDisplayedNfts(prev => prev.filter(item => item.id !== nft.id));
      } else {
        showNotification(`取消上架失败: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('取消上架失败:', error);
      showNotification('取消上架过程中发生错误', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 显示通知
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    // 5秒后自动关闭
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  // 关闭所有模态框
  const closeAllModals = () => {
    setModalState({
      detail: false,
      bid: false,
      purchase: false
    });
  };
  
  // 检查NFT是否已收藏
  const isNFTFavorite = (nftId) => {
    return favorites.includes(nftId);
  };
  
  // 切换筛选面板显示
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  // 切换推荐面板显示
  const toggleRecommendations = () => {
    setShowRecommendations(prev => !prev);
  };
  
  // 渲染加载状态
  if (isLoading && nfts.length === 0) {
    return <NFTMarketplaceSkeleton />;
  }
  
  return (
    <div className="nft-marketplace-container">
      {/* 顶部导航和搜索 */}
      <div className="marketplace-header">
        <h1>NFT 市场</h1>
        
        <div className="marketplace-actions">
          <div className="search-container">
            <NFTSearchBar
              onSearch={handleSearch}
              nfts={nfts}
              placeholder="搜索NFT、创作者..."
              autoFocus={false}
              enableHistory={true}
              enableSuggestions={true}
              maxSuggestions={5}
            />
          </div>
          
          <div className="view-controls">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('grid')}
                aria-label="网格视图"
                aria-pressed={viewMode === 'grid'}
              >
                <span className="view-icon">▦</span>
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('list')}
                aria-label="列表视图"
                aria-pressed={viewMode === 'list'}
              >
                <span className="view-icon">☰</span>
              </button>
            </div>
            
            <button
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={toggleFilters}
              aria-label="筛选器"
              aria-expanded={showFilters}
            >
              <span className="filter-icon">⚙</span>
              <span className="filter-text">筛选</span>
            </button>
            
            {active && (
              <button
                className="create-nft-btn"
                onClick={() => navigate('/create-nft')}
                aria-label="创建NFT"
              >
                创建NFT
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 错误消息 */}
      {error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
          <button onClick={() => setError(null)}>关闭</button>
        </div>
      )}
      
      {/* 通知消息 */}
      {notification && (
        <div className={`notification ${notification.type}`} role="status">
          <p>{notification.message}</p>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}
      
      {/* 主要内容 */}
      <div className="marketplace-content">
        {/* 侧边栏筛选器 */}
        {showFilters && (
          <div className="marketplace-sidebar">
            <NFTFilterPanel
              nfts={nfts}
              onFilterChange={handleFilterChange}
              enableMultiSelect={true}
              enableSavedFilters={true}
              currentAccount={account}
            />
          </div>
        )}
        
        {/* NFT列表 */}
        <div className={`marketplace-main ${showFilters ? 'with-sidebar' : ''}`}>
          <div className="marketplace-results">
            <div className="results-header">
              <div className="results-count">
                {displayedNfts.length} 个NFT
              </div>
              <div className="results-actions">
                <button
                  className={`recommendations-toggle-btn ${showRecommendations ? 'active' : ''}`}
                  onClick={toggleRecommendations}
                  aria-label="推荐"
                  aria-pressed={showRecommendations}
                >
                  <span className="recommendations-icon">★</span>
                  <span className="recommendations-text">推荐</span>
                </button>
              </div>
            </div>
            
            <Suspense fallback={<div className="loading-list">加载中...</div>}>
              <NFTMarketplaceList
                nfts={displayedNfts}
                viewMode={viewMode}
                onNFTClick={handleNFTClick}
                onToggleFavorite={handleToggleFavorite}
                onPurchase={handlePurchase}
                onBid={handleBid}
                onCancelListing={handleCancelListing}
                isNFTFavorite={isNFTFavorite}
                currentAccount={account}
              />
            </Suspense>
          </div>
          
          {/* 推荐面板 */}
          {showRecommendations && displayedNfts.length > 0 && (
            <Suspense fallback={<div className="loading-recommendations">加载推荐中...</div>}>
              <NFTRecommendationPanel
                nfts={nfts}
                currentNFT={selectedNFT}
                maxRecommendations={4}
                onNFTClick={handleNFTClick}
                currentAccount={account}
              />
            </Suspense>
          )}
        </div>
      </div>
      
      {/* 模态框 */}
      <Suspense fallback={<div className="loading-modal">加载中...</div>}>
        {modalState.detail && selectedNFT && (
          <NFTDetailModal
            nft={selectedNFT}
            isOpen={modalState.detail}
            onClose={() => setModalState(prev => ({ ...prev, detail: false }))}
            onPurchase={handlePurchase}
            onBid={handleBid}
            onToggleFavorite={handleToggleFavorite}
            isNFTFavorite={isNFTFavorite(selectedNFT.id)}
            currentAccount={account}
          />
        )}
        
        {modalState.purchase && selectedNFT && (
          <NFTPurchaseModal
            nft={selectedNFT}
            isOpen={modalState.purchase}
            onClose={() => setModalState(prev => ({ ...prev, purchase: false }))}
            onConfirm={handleConfirmPurchase}
            currentAccount={account}
          />
        )}
        
        {modalState.bid && selectedNFT && (
          <NFTBidModal
            nft={selectedNFT}
            isOpen={modalState.bid}
            onClose={() => setModalState(prev => ({ ...prev, bid: false }))}
            onConfirm={handleConfirmBid}
            currentAccount={account}
          />
        )}
      </Suspense>
    </div>
  );
};

export default NFTMarketplace;
