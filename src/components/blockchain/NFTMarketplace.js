import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { formatAddress } from '../../utils/formatters';
import '../../styles/marketplace.css';

// 懒加载组件
const NFTDetailModal = lazy(() => import('./NFTDetailModal'));
const NFTBidModal = lazy(() => import('./NFTBidModal'));
const NFTPurchaseModal = lazy(() => import('./NFTPurchaseModal'));
const NFTMarketplaceList = lazy(() => import('./NFTMarketplaceList'));

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
 * @version 2.0.0
 */
const NFTMarketplace = () => {
  const navigate = useNavigate();
  const { account, active } = useBlockchain();
  
  // 状态管理
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 1000],
    sortBy: 'newest',
    onlyVerified: false,
    showOwned: false
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [modalState, setModalState] = useState({
    detail: false,
    bid: false,
    purchase: false
  });
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
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
    filterNFTs();
  }, [filters, searchTerm, nfts]);
  
  // 保存收藏到本地存储
  useEffect(() => {
    localStorage.setItem('nftFavorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // 筛选NFT
  const filterNFTs = () => {
    let result = [...nfts];
    
    // 搜索筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(nft => 
        nft.name.toLowerCase().includes(term) || 
        nft.description.toLowerCase().includes(term) ||
        nft.creator.toLowerCase().includes(term)
      );
    }
    
    // 类别筛选
    if (filters.category !== 'all') {
      result = result.filter(nft => nft.category === filters.category);
    }
    
    // 价格范围筛选
    result = result.filter(nft => 
      parseFloat(nft.price) >= filters.priceRange[0] && 
      parseFloat(nft.price) <= filters.priceRange[1]
    );
    
    // 仅显示已验证筛选
    if (filters.onlyVerified) {
      result = result.filter(nft => nft.isVerified);
    }
    
    // 仅显示拥有的NFT
    if (filters.showOwned && account) {
      result = result.filter(nft => nft.seller.toLowerCase() === account.toLowerCase());
    }
    
    // 排序
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'priceAsc':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'priceDesc':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }
    
    setFilteredNfts(result);
  };
  
  // 处理搜索
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 处理筛选变化
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
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
        setFilteredNfts(updatedNfts.filter(nft => 
          // 应用当前筛选条件
          (filters.category === 'all' || nft.category === filters.category) &&
          parseFloat(nft.price) >= filters.priceRange[0] && 
          parseFloat(nft.price) <= filters.priceRange[1]
        ));
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
  
  // 使用useMemo缓存类别列表
  const categories = useMemo(() => {
    const categorySet = new Set(nfts.map(nft => nft.category));
    return ['all', ...Array.from(categorySet)];
  }, [nfts]);
  
  // 使用useMemo缓存价格范围
  const priceRange = useMemo(() => {
    if (nfts.length === 0) return [0, 1000];
    
    const prices = nfts.map(nft => parseFloat(nft.price));
    return [
      Math.floor(Math.min(...prices)),
      Math.ceil(Math.max(...prices))
    ];
  }, [nfts]);
  
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
            <input
              type="text"
              placeholder="搜索NFT、创作者..."
              value={searchTerm}
              onChange={handleSearch}
              aria-label="搜索NFT"
            />
            <span className="search-icon">🔍</span>
          </div>
          
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
        <div className="marketplace-sidebar">
          <div className="filter-section">
            <h3>类别</h3>
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${filters.category === category ? 'active' : ''}`}
                  onClick={() => handleFilterChange('category', category)}
                  aria-pressed={filters.category === category}
                >
                  {category === 'all' ? '全部' : category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>价格范围</h3>
            <div className="price-range-filter">
              <div className="price-inputs">
                <input
                  type="number"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.priceRange[0]}
                  onChange={(e) => handleFilterChange('priceRange', [
                    parseFloat(e.target.value),
                    filters.priceRange[1]
                  ])}
                  aria-label="最低价格"
                />
                <span>至</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [
                    filters.priceRange[0],
                    parseFloat(e.target.value)
                  ])}
                  aria-label="最高价格"
                />
              </div>
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [
                  filters.priceRange[0],
                  parseFloat(e.target.value)
                ])}
                className="price-slider"
                aria-label="价格滑块"
              />
            </div>
          </div>
          
          <div className="filter-section">
            <h3>排序方式</h3>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              aria-label="排序方式"
            >
              <option value="newest">最新上架</option>
              <option value="oldest">最早上架</option>
              <option value="priceAsc">价格从低到高</option>
              <option value="priceDesc">价格从高到低</option>
              <option value="popular">最受欢迎</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h3>其他筛选</h3>
            <div className="checkbox-filter">
              <input
                type="checkbox"
                id="verified-filter"
                checked={filters.onlyVerified}
                onChange={(e) => handleFilterChange('onlyVerified', e.target.checked)}
                aria-label="仅显示已验证"
              />
              <label htmlFor="verified-filter">仅显示已验证</label>
            </div>
            
            {active && (
              <div className="checkbox-filter">
                <input
                  type="checkbox"
                  id="owned-filter"
                  checked={filters.showOwned}
                  onChange={(e) => handleFilterChange('showOwned', e.target.checked)}
                  aria-label="仅显示我的NFT"
                />
                <label htmlFor="owned-filter">仅显示我的NFT</label>
              </div>
            )}
          </div>
          
          <div className="filter-section">
            <button
              className="reset-filters-btn"
              onClick={() => setFilters({
                category: 'all',
                priceRange: priceRange,
                sortBy: 'newest',
                onlyVerified: false,
                showOwned: false
              })}
              aria-label="重置筛选"
            >
              重置筛选
            </button>
          </div>
        </div>
        
        {/* NFT列表 */}
        <div className="marketplace-main">
          {filteredNfts.length === 0 ? (
            <div className="no-results">
              <p>没有找到符合条件的NFT</p>
              <button
                onClick={() => setFilters({
                  category: 'all',
                  priceRange: priceRange,
                  sortBy: 'newest',
                  onlyVerified: false,
                  showOwned: false
                })}
              >
                清除筛选条件
              </button>
            </div>
          ) : (
            <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div></div>}>
              <NFTMarketplaceList
                nfts={filteredNfts}
                viewMode={viewMode}
                onNFTClick={handleNFTClick}
                onToggleFavorite={handleToggleFavorite}
                onPurchase={handlePurchase}
                onBid={handleBid}
                onCancelListing={handleCancelListing}
                isNFTFavorite={isNFTFavorite}
                currentAccount={account}
                isLoading={isLoading}
              />
            </Suspense>
          )}
        </div>
      </div>
      
      {/* 模态框 */}
      {modalState.detail && selectedNFT && (
        <Suspense fallback={<div className="loading-overlay"><div className="loading-spinner"></div></div>}>
          <NFTDetailModal
            nft={selectedNFT}
            onClose={() => setModalState(prev => ({ ...prev, detail: false }))}
            onPurchase={() => {
              setModalState({
                detail: false,
                purchase: true,
                bid: false
              });
            }}
            onBid={() => {
              setModalState({
                detail: false,
                purchase: false,
                bid: true
              });
            }}
            onToggleFavorite={() => handleToggleFavorite(selectedNFT.id)}
            isFavorite={isNFTFavorite(selectedNFT.id)}
            currentAccount={account}
          />
        </Suspense>
      )}
      
      {modalState.purchase && selectedNFT && (
        <Suspense fallback={<div className="loading-overlay"><div className="loading-spinner"></div></div>}>
          <NFTPurchaseModal
            nft={selectedNFT}
            onClose={() => setModalState(prev => ({ ...prev, purchase: false }))}
            onConfirm={handleConfirmPurchase}
            isLoading={isLoading}
          />
        </Suspense>
      )}
      
      {modalState.bid && selectedNFT && (
        <Suspense fallback={<div className="loading-overlay"><div className="loading-spinner"></div></div>}>
          <NFTBidModal
            nft={selectedNFT}
            onClose={() => setModalState(prev => ({ ...prev, bid: false }))}
            onConfirm={handleConfirmBid}
            isLoading={isLoading}
          />
        </Suspense>
      )}
    </div>
  );
};

export default NFTMarketplace;
