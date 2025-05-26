import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { BlockchainContext } from '../../context/blockchain';
import NFTMarketplaceContract from './NFTMarketplaceContract';
import NFTMarketplaceABI from './NFTMarketplaceABI';
import NFTMarketplaceList from './NFTMarketplaceList';
import NFTMarketplaceFilters from './NFTMarketplaceFilters';
import NFTDetailModal from './NFTDetailModal';
import NFTPurchaseModal from './NFTPurchaseModal';
import NFTBidModal from './NFTBidModal';
import './NFTMarketplace.css';

/**
 * NFT市场主容器组件
 * 整合所有NFT市场相关子组件，管理全局市场状态
 */
const NFTMarketplace = () => {
  // 状态管理
  const [listedNFTs, setListedNFTs] = useState([]);
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('grid'); // 'grid' 或 'list'
  const [sortOption, setSortOption] = useState('newest');
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: { min: 0, max: 0 },
    saleType: 'all', // 'fixed', 'auction', 'all'
    creator: '',
    searchQuery: '',
    onlyFavorites: false
  });
  
  // 模态框状态
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // 合约状态
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 区块链上下文
  const { account, provider, isConnected } = useContext(BlockchainContext);
  
  // NFT市场合约地址（实际应用中应从配置或环境变量获取）
  const MARKETPLACE_ADDRESS = '0x123456789abcdef123456789abcdef123456789a';

  // 初始化合约
  useEffect(() => {
    if (provider) {
      try {
        const contract = new NFTMarketplaceContract(
          provider,
          MARKETPLACE_ADDRESS,
          NFTMarketplaceABI
        );
        setMarketplaceContract(contract);
      } catch (err) {
        console.error('初始化合约失败:', err);
        setError('初始化NFT市场合约失败，请刷新页面重试');
      }
    }
  }, [provider]);

  // 加载NFT列表
  useEffect(() => {
    if (marketplaceContract) {
      fetchListedNFTs();
    }
  }, [marketplaceContract, account]);

  // 应用筛选条件
  useEffect(() => {
    if (listedNFTs.length > 0) {
      applyFilters();
    }
  }, [listedNFTs, filters, sortOption, favorites]);
  
  // 加载收藏列表
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('nftFavorites') || '[]');
    setFavorites(savedFavorites);
  }, []);
  
  // 监听链上事件
  useEffect(() => {
    if (marketplaceContract) {
      // 监听NFT上架事件
      const listingCleanup = marketplaceContract.listenToListingEvents((event) => {
        console.log('New NFT listed:', event);
        // 刷新NFT列表或添加新上架的NFT
        fetchListedNFTs();
        showNotification('有新的NFT上架了！', 'info');
      });
      
      // 监听NFT售出事件
      const saleCleanup = marketplaceContract.listenToSaleEvents((event) => {
        console.log('NFT sold:', event);
        // 刷新NFT列表或更新已售出的NFT
        fetchListedNFTs();
        
        // 如果是当前用户购买的，显示通知
        if (account && event.buyer.toLowerCase() === account.toLowerCase()) {
          showNotification('恭喜！您成功购买了NFT', 'success');
        }
      });
      
      // 监听竞价事件
      const bidCleanup = marketplaceContract.listenToBidEvents((event) => {
        console.log('New bid placed:', event);
        // 更新拍卖中的NFT
        updateAuctionNFT(event.tokenAddress, event.tokenId, event.bidder, event.bidAmount);
        
        // 如果是当前用户的出价被超过，显示通知
        if (account && 
            selectedNFT && 
            selectedNFT.contractAddress === event.tokenAddress && 
            selectedNFT.tokenId === event.tokenId && 
            selectedNFT.highestBidder && 
            selectedNFT.highestBidder.toLowerCase() === account.toLowerCase() && 
            event.bidder.toLowerCase() !== account.toLowerCase()) {
          showNotification('您的出价已被超过！', 'warning');
        }
      });
      
      // 清理函数
      return () => {
        listingCleanup();
        saleCleanup();
        bidCleanup();
      };
    }
  }, [marketplaceContract, account, selectedNFT]);
  
  // 通知计时器
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 获取所有上架的NFT
  const fetchListedNFTs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!marketplaceContract) {
        throw new Error('合约未初始化');
      }
      
      // 从区块链获取上架的NFT
      const nfts = await marketplaceContract.getListedNFTs();
      
      setListedNFTs(nfts);
      setFilteredNFTs(nfts);
      setIsLoading(false);
    } catch (err) {
      console.error('获取NFT列表失败:', err);
      setError('加载NFT列表失败，请稍后再试');
      setIsLoading(false);
      
      // 如果链上调用失败，使用模拟数据（仅用于开发和测试）
      if (process.env.NODE_ENV === 'development') {
        useMockData();
      }
    }
  };
  
  // 使用模拟数据（仅用于开发和测试）
  const useMockData = () => {
    const mockNFTs = [
      {
        id: '1',
        name: '传统中国水墨画',
        description: '融合传统与现代的水墨艺术作品',
        image: 'https://example.com/nft1.jpg',
        price: ethers.utils.parseEther('0.5'),
        seller: '0x1234...5678',
        owner: '0x1234...5678',
        tokenId: '1',
        contractAddress: '0xabcd...efgh',
        isAuction: false,
        category: 'visual-art',
        creator: '张艺术家',
        createdAt: Date.now() - 86400000 * 2, // 2天前
        likes: 24
      },
      {
        id: '2',
        name: '非洲部落面具',
        description: '来自西非的传统部落面具数字复刻',
        image: 'https://example.com/nft2.jpg',
        price: ethers.utils.parseEther('0.8'),
        seller: '0x2345...6789',
        owner: '0x2345...6789',
        tokenId: '2',
        contractAddress: '0xbcde...fghi',
        isAuction: true,
        auctionEndTime: Date.now() + 86400000 * 3, // 3天后结束
        highestBid: ethers.utils.parseEther('0.8'),
        highestBidder: '0x3456...7890',
        category: 'sculpture',
        creator: 'Adebayo Olatunji',
        createdAt: Date.now() - 86400000 * 5, // 5天前
        likes: 18
      },
      {
        id: '3',
        name: '印度古典舞蹈瞬间',
        description: '记录印度古典舞蹈中的优美姿态',
        image: 'https://example.com/nft3.jpg',
        price: ethers.utils.parseEther('0.3'),
        seller: '0x3456...7890',
        owner: '0x3456...7890',
        tokenId: '3',
        contractAddress: '0xcdef...ghij',
        isAuction: false,
        category: 'photography',
        creator: 'Priya Sharma',
        createdAt: Date.now() - 86400000, // 1天前
        likes: 32
      },
      {
        id: '4',
        name: '日本浮世绘现代诠释',
        description: '传统浮世绘艺术的数字化现代演绎',
        image: 'https://example.com/nft4.jpg',
        price: ethers.utils.parseEther('1.2'),
        seller: '0x4567...8901',
        owner: '0x4567...8901',
        tokenId: '4',
        contractAddress: '0xdefg...hijk',
        isAuction: true,
        auctionEndTime: Date.now() + 86400000 * 1, // 1天后结束
        highestBid: ethers.utils.parseEther('1.2'),
        highestBidder: '0x5678...9012',
        category: 'visual-art',
        creator: '佐藤雅人',
        createdAt: Date.now() - 86400000 * 7, // 7天前
        likes: 45
      }
    ];
    
    setListedNFTs(mockNFTs);
    setFilteredNFTs(mockNFTs);
    setIsLoading(false);
    setError('使用模拟数据（链上数据获取失败）');
  };
  
  // 更新拍卖中的NFT
  const updateAuctionNFT = (tokenAddress, tokenId, bidder, bidAmount) => {
    setListedNFTs(prev => prev.map(nft => {
      if (nft.contractAddress === tokenAddress && nft.tokenId === tokenId) {
        return {
          ...nft,
          highestBid: bidAmount,
          highestBidder: bidder,
          price: bidAmount // 更新当前价格为最高出价
        };
      }
      return nft;
    }));
  };

  // 应用筛选条件
  const applyFilters = () => {
    let result = [...listedNFTs];
    
    // 应用类别筛选
    if (filters.category !== 'all') {
      result = result.filter(nft => nft.category === filters.category);
    }
    
    // 应用价格范围筛选
    if (filters.priceRange.max > 0) {
      result = result.filter(nft => {
        const priceInEth = parseFloat(ethers.utils.formatEther(nft.price));
        return priceInEth >= filters.priceRange.min && priceInEth <= filters.priceRange.max;
      });
    }
    
    // 应用销售类型筛选
    if (filters.saleType !== 'all') {
      const isAuction = filters.saleType === 'auction';
      result = result.filter(nft => nft.isAuction === isAuction);
    }
    
    // 应用创作者筛选
    if (filters.creator) {
      result = result.filter(nft => 
        nft.creator.toLowerCase().includes(filters.creator.toLowerCase())
      );
    }
    
    // 应用搜索查询
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(nft => 
        nft.name.toLowerCase().includes(query) || 
        nft.description.toLowerCase().includes(query)
      );
    }
    
    // 应用收藏筛选
    if (filters.onlyFavorites) {
      result = result.filter(nft => favorites.includes(nft.id));
    }
    
    // 应用排序
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'priceHighToLow':
        result.sort((a, b) => {
          const priceA = ethers.BigNumber.from(a.price);
          const priceB = ethers.BigNumber.from(b.price);
          return priceB.gt(priceA) ? 1 : -1;
        });
        break;
      case 'priceLowToHigh':
        result.sort((a, b) => {
          const priceA = ethers.BigNumber.from(a.price);
          const priceB = ethers.BigNumber.from(b.price);
          return priceA.gt(priceB) ? 1 : -1;
        });
        break;
      case 'mostLiked':
        result.sort((a, b) => b.likes - a.likes);
        break;
      default:
        break;
    }
    
    setFilteredNFTs(result);
  };

  // 处理筛选条件变更
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 处理排序选项变更
  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // 处理视图切换
  const handleViewChange = (view) => {
    setActiveView(view);
  };

  // 处理搜索查询
  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };
  
  // 处理查看NFT详情
  const handleViewDetails = (nft) => {
    setSelectedNFT(nft);
    setIsDetailModalOpen(true);
  };
  
  // 处理购买NFT
  const handlePurchase = (nft) => {
    if (!isConnected) {
      showNotification('请先连接钱包', 'error');
      return;
    }
    
    setSelectedNFT(nft);
    setIsPurchaseModalOpen(true);
  };
  
  // 处理竞价NFT
  const handleBid = (nft) => {
    if (!isConnected) {
      showNotification('请先连接钱包', 'error');
      return;
    }
    
    setSelectedNFT(nft);
    setIsBidModalOpen(true);
  };
  
  // 处理收藏切换
  const handleToggleFavorite = (nftId, isFavorite) => {
    let newFavorites = [...favorites];
    
    if (isFavorite) {
      if (!newFavorites.includes(nftId)) {
        newFavorites.push(nftId);
        showNotification('已添加到收藏', 'success');
      }
    } else {
      newFavorites = newFavorites.filter(id => id !== nftId);
      showNotification('已从收藏中移除', 'info');
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('nftFavorites', JSON.stringify(newFavorites));
    
    // 如果当前正在筛选收藏，需要重新应用筛选
    if (filters.onlyFavorites) {
      applyFilters();
    }
  };
  
  // 处理分享NFT
  const handleShare = (nftId, platform) => {
    showNotification(`已分享到 ${platform}`, 'success');
  };
  
  // 处理购买完成
  const handlePurchaseComplete = async (purchaseData) => {
    try {
      setIsProcessing(true);
      
      if (!marketplaceContract) {
        throw new Error('合约未初始化');
      }
      
      // 调用合约购买方法
      const result = await marketplaceContract.purchaseNFT(
        selectedNFT.contractAddress,
        selectedNFT.tokenId,
        selectedNFT.price
      );
      
      console.log('Purchase completed:', result);
      showNotification('购买成功！NFT已添加到您的收藏中', 'success');
      
      // 关闭模态框
      setIsPurchaseModalOpen(false);
      setIsDetailModalOpen(false);
      
      // 刷新NFT列表
      fetchListedNFTs();
    } catch (err) {
      console.error('购买NFT失败:', err);
      showNotification(`购买失败: ${err.message || '请稍后再试'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 处理竞价完成
  const handleBidPlaced = async (bidData) => {
    try {
      setIsProcessing(true);
      
      if (!marketplaceContract) {
        throw new Error('合约未初始化');
      }
      
      // 调用合约竞价方法
      const result = await marketplaceContract.placeBid(
        selectedNFT.contractAddress,
        selectedNFT.tokenId,
        bidData.bidAmount
      );
      
      console.log('Bid placed:', result);
      showNotification('出价成功！您现在是最高出价者', 'success');
      
      // 关闭模态框
      setIsBidModalOpen(false);
      
      // 更新NFT数据
      updateAuctionNFT(
        selectedNFT.contractAddress,
        selectedNFT.tokenId,
        account,
        bidData.bidAmount
      );
    } catch (err) {
      console.error('出价失败:', err);
      showNotification(`出价失败: ${err.message || '请稍后再试'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 显示通知
  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type
    });
  };

  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="nft-marketplace-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载NFT市场...</p>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (error && !listedNFTs.length) {
    return (
      <div className="nft-marketplace-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchListedNFTs}>
            重试
          </button>
        </div>
      </div>
    );
  }

  // 渲染未连接钱包状态
  if (!isConnected) {
    return (
      <div className="nft-marketplace-container">
        <div className="wallet-connect-prompt">
          <h2>连接钱包以访问NFT市场</h2>
          <p>请连接您的钱包以浏览、购买和出售文化NFT</p>
          <button className="connect-wallet-button">
            连接钱包
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-marketplace-container">
      <div className="marketplace-header">
        <h1>文化NFT市场</h1>
        <p className="marketplace-description">
          探索和交易来自世界各地的文化艺术品、音乐、文学和传统工艺NFT
        </p>
      </div>
      
      {error && (
        <div className="warning-banner">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchListedNFTs}>
            重试
          </button>
        </div>
      )}
      
      <div className="marketplace-controls">
        <div className="view-controls">
          <button 
            className={`view-button ${activeView === 'grid' ? 'active' : ''}`}
            onClick={() => handleViewChange('grid')}
          >
            网格视图
          </button>
          <button 
            className={`view-button ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => handleViewChange('list')}
          >
            列表视图
          </button>
        </div>
        
        <div className="sort-controls">
          <label htmlFor="sort-select">排序方式:</label>
          <select 
            id="sort-select" 
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="newest">最新上架</option>
            <option value="oldest">最早上架</option>
            <option value="priceHighToLow">价格从高到低</option>
            <option value="priceLowToHigh">价格从低到高</option>
            <option value="mostLiked">最受欢迎</option>
          </select>
        </div>
      </div>
      
      <div className="marketplace-content">
        <NFTMarketplaceFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
        
        <NFTMarketplaceList 
          nfts={filteredNFTs}
          viewType={activeView}
          onViewDetails={handleViewDetails}
          onPurchase={handlePurchase}
          onBid={handleBid}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
      
      {filteredNFTs.length === 0 && !isLoading && (
        <div className="no-results">
          <p>没有找到符合条件的NFT</p>
          <button 
            className="clear-filters-button"
            onClick={() => setFilters({
              category: 'all',
              priceRange: { min: 0, max: 0 },
              saleType: 'all',
              creator: '',
              searchQuery: '',
              onlyFavorites: false
            })}
          >
            清除所有筛选条件
          </button>
        </div>
      )}
      
      {/* 通知提示 */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {/* NFT详情模态框 */}
      <NFTDetailModal 
        nft={selectedNFT}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onPurchase={handlePurchase}
        onBid={handleBid}
        onShare={handleShare}
        onToggleFavorite={handleToggleFavorite}
      />
      
      {/* NFT购买模态框 */}
      <NFTPurchaseModal 
        nft={selectedNFT}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
        isProcessing={isProcessing}
      />
      
      {/* NFT竞价模态框 */}
      <NFTBidModal 
        nft={selectedNFT}
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onBidPlaced={handleBidPlaced}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default NFTMarketplace;
