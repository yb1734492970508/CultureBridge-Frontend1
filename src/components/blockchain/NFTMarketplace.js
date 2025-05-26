import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { BlockchainContext } from '../../context/blockchain';
import NFTMarketplaceList from './NFTMarketplaceList';
import NFTMarketplaceFilters from './NFTMarketplaceFilters';
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
    searchQuery: ''
  });

  // 区块链上下文
  const { account, provider, isConnected } = useContext(BlockchainContext);

  // 加载NFT列表
  useEffect(() => {
    if (provider) {
      fetchListedNFTs();
    }
  }, [provider, account]);

  // 应用筛选条件
  useEffect(() => {
    if (listedNFTs.length > 0) {
      applyFilters();
    }
  }, [listedNFTs, filters, sortOption]);

  // 获取所有上架的NFT
  const fetchListedNFTs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 模拟从区块链获取数据
      // 实际实现中，这里应该调用市场合约获取上架NFT列表
      const mockNFTs = [
        {
          id: '1',
          name: '传统中国水墨画',
          description: '融合传统与现代的水墨艺术作品',
          image: 'https://example.com/nft1.jpg',
          price: ethers.utils.parseEther('0.5'),
          seller: '0x1234...5678',
          tokenId: 1,
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
          tokenId: 2,
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
          tokenId: 3,
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
          tokenId: 4,
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
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('加载NFT列表失败，请稍后再试');
      setIsLoading(false);
    }
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
  if (error) {
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
              searchQuery: ''
            })}
          >
            清除所有筛选条件
          </button>
        </div>
      )}
    </div>
  );
};

export default NFTMarketplace;
