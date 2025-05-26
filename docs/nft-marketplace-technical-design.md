# CultureBridge NFT市场技术方案设计

## 1. 概述

本文档详细描述CultureBridge平台NFT市场功能的技术实现方案，包括智能合约接口设计、前端组件结构和数据流设计。NFT市场将允许用户上架、购买、竞价文化NFT资产，实现文化价值的流通与交换。

## 2. 智能合约接口设计

### 2.1 NFT市场合约接口

```javascript
// CultureMarket.js - NFT市场智能合约接口

import { ethers } from 'ethers';

// NFT市场合约ABI
const CultureMarketABI = [
  // 查询功能
  "function getListedNFTs() view returns (tuple(uint256 tokenId, address seller, address nftContract, uint256 price, bool isAuction, uint256 auctionEndTime, address highestBidder, uint256 highestBid)[] memory)",
  "function getMyListedNFTs() view returns (tuple(uint256 tokenId, address seller, address nftContract, uint256 price, bool isAuction, uint256 auctionEndTime, address highestBidder, uint256 highestBid)[] memory)",
  "function getMyPurchasedNFTs() view returns (tuple(uint256 tokenId, address seller, address nftContract, uint256 price)[] memory)",
  "function getNFTItem(address nftContract, uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, address nftContract, uint256 price, bool isAuction, uint256 auctionEndTime, address highestBidder, uint256 highestBid) memory)",
  "function getAuctionBids(address nftContract, uint256 tokenId) view returns (tuple(address bidder, uint256 bid, uint256 timestamp)[] memory)",
  
  // 上架功能
  "function listNFT(address nftContract, uint256 tokenId, uint256 price) returns (bool)",
  "function listNFTForAuction(address nftContract, uint256 tokenId, uint256 startPrice, uint256 auctionDuration) returns (bool)",
  "function cancelListing(address nftContract, uint256 tokenId) returns (bool)",
  
  // 购买功能
  "function buyNFT(address nftContract, uint256 tokenId) payable returns (bool)",
  
  // 拍卖功能
  "function placeBid(address nftContract, uint256 tokenId) payable returns (bool)",
  "function withdrawBid(address nftContract, uint256 tokenId) returns (bool)",
  "function endAuction(address nftContract, uint256 tokenId) returns (bool)",
  
  // 平台费用设置
  "function setPlatformFee(uint256 fee) returns (bool)",
  "function getPlatformFee() view returns (uint256)",
  
  // 事件
  "event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price, bool isAuction, uint256 auctionEndTime)",
  "event NFTSold(address indexed seller, address indexed buyer, address indexed nftContract, uint256 tokenId, uint256 price)",
  "event NFTListingCancelled(address indexed seller, address indexed nftContract, uint256 indexed tokenId)",
  "event BidPlaced(address indexed bidder, address indexed nftContract, uint256 indexed tokenId, uint256 bidAmount)",
  "event BidWithdrawn(address indexed bidder, address indexed nftContract, uint256 indexed tokenId, uint256 bidAmount)",
  "event AuctionEnded(address indexed seller, address indexed winner, address indexed nftContract, uint256 tokenId, uint256 winningBid)"
];

// 测试网络合约地址
const CULTURE_MARKET_CONTRACT_ADDRESS = {
  1: "0x0000000000000000000000000000000000000000", // 以太坊主网（待部署）
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia测试网（待部署）
  80001: "0x0000000000000000000000000000000000000000" // Polygon Mumbai测试网（待部署）
};

/**
 * 获取NFT市场合约实例
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 合约实例
 */
export const getCultureMarketContract = (provider, chainId) => {
  const address = CULTURE_MARKET_CONTRACT_ADDRESS[chainId];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`当前网络(chainId: ${chainId})不支持CultureMarket合约`);
  }
  
  return new ethers.Contract(address, CultureMarketABI, provider);
};

/**
 * 获取带签名的NFT市场合约实例（用于写操作）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 带签名的合约实例
 */
export const getSignedCultureMarketContract = async (provider, chainId) => {
  const signer = provider.getSigner();
  const contract = getCultureMarketContract(provider, chainId);
  return contract.connect(signer);
};

/**
 * 获取所有上架的NFT
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {Promise<Array>} 上架的NFT列表
 */
export const getListedNFTs = async (provider, chainId) => {
  try {
    const contract = getCultureMarketContract(provider, chainId);
    const listedNFTs = await contract.getListedNFTs();
    
    return listedNFTs.map(item => ({
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      nftContract: item.nftContract,
      price: ethers.utils.formatEther(item.price),
      isAuction: item.isAuction,
      auctionEndTime: item.isAuction ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
      highestBidder: item.isAuction ? item.highestBidder : null,
      highestBid: item.isAuction ? ethers.utils.formatEther(item.highestBid) : null
    }));
  } catch (error) {
    console.error("获取上架NFT失败:", error);
    return [];
  }
};

/**
 * 获取用户上架的NFT
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {Promise<Array>} 用户上架的NFT列表
 */
export const getMyListedNFTs = async (provider, chainId) => {
  try {
    const contract = await getSignedCultureMarketContract(provider, chainId);
    const myListedNFTs = await contract.getMyListedNFTs();
    
    return myListedNFTs.map(item => ({
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      nftContract: item.nftContract,
      price: ethers.utils.formatEther(item.price),
      isAuction: item.isAuction,
      auctionEndTime: item.isAuction ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
      highestBidder: item.isAuction ? item.highestBidder : null,
      highestBid: item.isAuction ? ethers.utils.formatEther(item.highestBid) : null
    }));
  } catch (error) {
    console.error("获取我的上架NFT失败:", error);
    return [];
  }
};

/**
 * 获取用户购买的NFT
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {Promise<Array>} 用户购买的NFT列表
 */
export const getMyPurchasedNFTs = async (provider, chainId) => {
  try {
    const contract = await getSignedCultureMarketContract(provider, chainId);
    const myPurchasedNFTs = await contract.getMyPurchasedNFTs();
    
    return myPurchasedNFTs.map(item => ({
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      nftContract: item.nftContract,
      price: ethers.utils.formatEther(item.price)
    }));
  } catch (error) {
    console.error("获取我购买的NFT失败:", error);
    return [];
  }
};

/**
 * 上架NFT（固定价格）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} nftContract - NFT合约地址
 * @param {string} tokenId - NFT的tokenId
 * @param {string} price - 价格（ETH）
 * @returns {Promise<Object>} 交易结果
 */
export const listNFT = async (provider, chainId, nftContract, tokenId, price) => {
  try {
    const contract = await getSignedCultureMarketContract(provider, chainId);
    
    // 将ETH转换为Wei
    const priceInWei = ethers.utils.parseEther(price);
    
    // 发送上架交易
    const tx = await contract.listNFT(nftContract, tokenId, priceInWei);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("上架NFT失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 上架NFT（拍卖）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} nftContract - NFT合约地址
 * @param {string} tokenId - NFT的tokenId
 * @param {string} startPrice - 起拍价（ETH）
 * @param {number} auctionDuration - 拍卖持续时间（秒）
 * @returns {Promise<Object>} 交易结果
 */
export const listNFTForAuction = async (provider, chainId, nftContract, tokenId, startPrice, auctionDuration) => {
  try {
    const contract = await getSignedCultureMarketContract(provider, chainId);
    
    // 将ETH转换为Wei
    const priceInWei = ethers.utils.parseEther(startPrice);
    
    // 发送上架拍卖交易
    const tx = await contract.listNFTForAuction(nftContract, tokenId, priceInWei, auctionDuration);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("上架NFT拍卖失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 取消NFT上架
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} nftContract - NFT合约地址
 * @param {string} tokenId - NFT的tokenId
 * @returns {Promise<Object>} 交易结果
 */
export const cancelListing = async (provider, chainId, nftContract, tokenId) => {
  try {
    const contract = await getSignedCultureMarketContract(provider, chainId);
    
    // 发送取消上架交易
    const tx = await contract.cancelListing(nftContract, tokenId);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("取消上架NFT失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 购买NFT
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} nftContract - NFT合约地址
 * @param {string} tokenId - NFT的tokenId
 * @param {string} price - NFT价格（ETH）
 * @returns {Promise<Object>} 交易结果
 */
export const buyNFT = async (provider, chainId, nftContract, tokenId, price) => {
  try {
    const contract = await getSignedCultureMarketContract(provider, chainId);
    
    // 将ETH转换为Wei
    const priceInWei = ethers.utils.parseEther(price);
    
    // 发送购买交易
    const tx = await contract.buyNFT(nftContract, tokenId, { value: priceInWei });
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("购买NFT失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 对NFT出价
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} nftContract - NFT合约地址
 * @param {string} tokenId - NFT的tokenId
 * @param {string} bidAmount - 出价金额（ETH）
 * @returns {Promise<Object>} 交易结果
 */
export const placeBid = async (provider, chainId, nftContract, tokenId, bidAmount) => {
  try {
    const contract = await getSignedCultureMarketContract(provider, chainId);
    
    // 将ETH转换为Wei
    const bidInWei = ethers.utils.parseEther(bidAmount);
    
    // 发送出价交易
    const tx = await contract.placeBid(nftContract, tokenId, { value: bidInWei });
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("出价失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 结束拍卖
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} nftContract - NFT合约地址
 * @param {string} tokenId - NFT的tokenId
 * @returns {Promise<Object>} 交易结果
 */
export const endAuction = async (provider, chainId, nftContract, tokenId) => {
  try {
    const contract = await getSignedCultureMarketContract(provider, chainId);
    
    // 发送结束拍卖交易
    const tx = await contract.endAuction(nftContract, tokenId);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("结束拍卖失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  getCultureMarketContract,
  getSignedCultureMarketContract,
  getListedNFTs,
  getMyListedNFTs,
  getMyPurchasedNFTs,
  listNFT,
  listNFTForAuction,
  cancelListing,
  buyNFT,
  placeBid,
  endAuction
};
```

### 2.2 与现有NFT合约的集成

NFT市场合约将与现有的CultureNFT合约集成，实现NFT的上架、交易和拍卖功能。在上架NFT时，用户需要先授权市场合约操作其NFT，然后才能将NFT上架到市场。

```javascript
// 授权市场合约操作NFT
export const approveMarketForNFT = async (provider, chainId, tokenId) => {
  try {
    const nftContract = await getSignedCultureNFTContract(provider, chainId);
    const marketAddress = CULTURE_MARKET_CONTRACT_ADDRESS[chainId];
    
    // 发送授权交易
    const tx = await nftContract.approve(marketAddress, tokenId);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("授权市场合约失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

## 3. 前端组件设计

### 3.1 组件结构

NFT市场功能将包含以下主要组件：

```
src/
  ├── components/
  │   ├── marketplace/
  │   │   ├── MarketplaceHome.js       # 市场首页
  │   │   ├── NFTCard.js               # NFT卡片组件
  │   │   ├── NFTListingForm.js        # NFT上架表单
  │   │   ├── NFTAuctionForm.js        # NFT拍卖表单
  │   │   ├── NFTMarketDetail.js       # NFT市场详情
  │   │   ├── BidHistory.js            # 竞价历史
  │   │   ├── MyListings.js            # 我的上架
  │   │   ├── MyPurchases.js           # 我的购买
  │   │   ├── MarketplaceFilters.js    # 市场筛选器
  │   │   └── MarketplaceStats.js      # 市场统计
  ├── contracts/
  │   ├── NFT/
  │   │   └── CultureNFT.js            # 现有NFT合约接口
  │   ├── marketplace/
  │   │   └── CultureMarket.js         # NFT市场合约接口
  ├── context/
  │   ├── blockchain/
  │   │   └── BlockchainContext.js     # 现有区块链上下文
  │   ├── marketplace/
  │   │   └── MarketplaceContext.js    # 市场上下文
  ├── styles/
  │   ├── blockchain.css               # 现有区块链样式
  │   └── marketplace.css              # 市场样式
```

### 3.2 主要组件详细设计

#### 3.2.1 MarketplaceHome.js

市场首页组件，展示所有上架的NFT，并提供筛选和搜索功能。

```jsx
import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { getListedNFTs } from '../../contracts/marketplace/CultureMarket';
import NFTCard from './NFTCard';
import MarketplaceFilters from './MarketplaceFilters';
import MarketplaceStats from './MarketplaceStats';

const MarketplaceHome = () => {
  const { active, library, chainId } = useBlockchain();
  
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 100],
    sortBy: 'newest',
    onlyAuctions: false
  });
  
  // 加载上架的NFT
  useEffect(() => {
    const loadListedNFTs = async () => {
      if (!active || !library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const listedNFTs = await getListedNFTs(library, chainId);
        setNfts(listedNFTs);
      } catch (error) {
        console.error('加载市场NFT失败:', error);
        setError('加载市场NFT时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadListedNFTs();
  }, [active, library, chainId]);
  
  // 应用筛选器
  const filteredNFTs = nfts.filter(nft => {
    // 应用类别筛选
    if (filters.category !== 'all' && nft.metadata?.properties?.category !== filters.category) {
      return false;
    }
    
    // 应用价格范围筛选
    const price = parseFloat(nft.price);
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }
    
    // 应用拍卖筛选
    if (filters.onlyAuctions && !nft.isAuction) {
      return false;
    }
    
    return true;
  });
  
  // 应用排序
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (filters.sortBy) {
      case 'priceAsc':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'priceDesc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'oldest':
        return new Date(a.listingTime) - new Date(b.listingTime);
      case 'newest':
      default:
        return new Date(b.listingTime) - new Date(a.listingTime);
    }
  });
  
  return (
    <div className="marketplace-home">
      <div className="marketplace-header">
        <h1>文化NFT市场</h1>
        <p>探索、收藏和交易独特的文化NFT资产</p>
      </div>
      
      <div className="marketplace-stats-container">
        <MarketplaceStats />
      </div>
      
      <div className="marketplace-content">
        <div className="marketplace-sidebar">
          <MarketplaceFilters 
            filters={filters} 
            setFilters={setFilters} 
          />
        </div>
        
        <div className="marketplace-main">
          {!active ? (
            <div className="wallet-warning">
              <p>请先连接钱包以访问NFT市场</p>
            </div>
          ) : loading ? (
            <div className="loading-container">
              <p>加载NFT市场中...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : sortedNFTs.length === 0 ? (
            <div className="empty-marketplace">
              <p>当前没有符合条件的NFT</p>
            </div>
          ) : (
            <div className="nft-grid">
              {sortedNFTs.map(nft => (
                <NFTCard 
                  key={`${nft.nftContract}-${nft.tokenId}`} 
                  nft={nft} 
                  isMarketItem={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHome;
```

#### 3.2.2 NFTListingForm.js

NFT上架表单组件，允许用户将NFT上架到市场。

```jsx
import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { getUserNFTs } from '../../contracts/NFT/CultureNFT';
import { approveMarketForNFT } from '../../contracts/NFT/CultureNFT';
import { listNFT } from '../../contracts/marketplace/CultureMarket';

const NFTListingForm = () => {
  const { account, active, library, chainId } = useBlockchain();
  
  const [userNFTs, setUserNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [listing, setListing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 加载用户拥有的NFT
  useEffect(() => {
    const loadUserNFTs = async () => {
      if (!active || !account || !library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const nfts = await getUserNFTs(library, chainId, account);
        setUserNFTs(nfts);
      } catch (error) {
        console.error('加载用户NFT失败:', error);
        setError('加载NFT时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserNFTs();
  }, [active, account, library, chainId]);
  
  // 处理NFT选择
  const handleNFTSelect = (nft) => {
    setSelectedNFT(nft);
    setError('');
    setSuccess('');
  };
  
  // 处理上架
  const handleListing = async (e) => {
    e.preventDefault();
    
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (!selectedNFT) {
      setError('请选择要上架的NFT');
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      setError('请输入有效的价格');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      
      // 先授权市场合约
      setApproving(true);
      const approveResult = await approveMarketForNFT(
        library,
        chainId,
        selectedNFT.tokenId
      );
      setApproving(false);
      
      if (!approveResult.success) {
        setError(`授权失败: ${approveResult.error}`);
        return;
      }
      
      // 上架NFT
      setListing(true);
      const nftContractAddress = "0x..."; // 替换为实际的NFT合约地址
      const listResult = await listNFT(
        library,
        chainId,
        nftContractAddress,
        selectedNFT.tokenId,
        price
      );
      setListing(false);
      
      if (listResult.success) {
        setSuccess(`NFT上架成功！交易哈希: ${listResult.transactionHash}`);
        setSelectedNFT(null);
        setPrice('');
        
        // 重新加载用户NFT
        const nfts = await getUserNFTs(library, chainId, account);
        setUserNFTs(nfts);
      } else {
        setError(`上架失败: ${listResult.error}`);
      }
    } catch (error) {
      setApproving(false);
      setListing(false);
      setError(`操作失败: ${error.message}`);
      console.error(error);
    }
  };
  
  return (
    <div className="nft-listing-form">
      <h2>上架NFT到市场</h2>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以上架NFT</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <p>加载您的NFT中...</p>
        </div>
      ) : userNFTs.length === 0 ? (
        <div className="empty-nfts">
          <p>您还没有任何NFT可以上架</p>
          <a href="/mint" className="create-nft-btn">创建您的第一个NFT</a>
        </div>
      ) : (
        <div className="listing-container">
          <div className="nft-selection">
            <h3>选择要上架的NFT</h3>
            <div className="nft-grid">
              {userNFTs.map(nft => (
                <div 
                  key={nft.tokenId} 
                  className={`nft-select-card ${selectedNFT?.tokenId === nft.tokenId ? 'selected' : ''}`}
                  onClick={() => handleNFTSelect(nft)}
                >
                  <img 
                    src={nft.metadata.image.startsWith('ipfs://') 
                      ? `https://ipfs.io/ipfs/${nft.metadata.image.replace('ipfs://', '')}` 
                      : nft.metadata.image} 
                    alt={nft.metadata.name} 
                  />
                  <div className="nft-select-info">
                    <h4>{nft.metadata.name}</h4>
                    <p>Token ID: {nft.tokenId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedNFT && (
            <form onSubmit={handleListing} className="listing-form">
              <h3>设置上架价格</h3>
              
              <div className="selected-nft-preview">
                <img 
                  src={selectedNFT.metadata.image.startsWith('ipfs://') 
                    ? `https://ipfs.io/ipfs/${selectedNFT.metadata.image.replace('ipfs://', '')}` 
                    : selectedNFT.metadata.image} 
                  alt={selectedNFT.metadata.name} 
                />
                <div className="selected-nft-info">
                  <h4>{selectedNFT.metadata.name}</h4>
                  <p>{selectedNFT.metadata.description}</p>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="price">价格 (ETH) *</label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0.001"
                  step="0.001"
                  disabled={approving || listing}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={!active || approving || listing || !selectedNFT || !price}
                className="list-button"
              >
                {approving ? '授权中...' : listing ? '上架中...' : '上架NFT'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default NFTListingForm;
```

#### 3.2.3 NFTMarketDetail.js

NFT市场详情组件，展示NFT详情并提供购买或竞价功能。

```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { getNFTDetails } from '../../contracts/NFT/CultureNFT';
import { 
  getCultureMarketContract, 
  buyNFT, 
  placeBid, 
  endAuction 
} from '../../contracts/marketplace/CultureMarket';
import BidHistory from './BidHistory';

const NFTMarketDetail = () => {
  const { nftContract, tokenId } = useParams();
  const navigate = useNavigate();
  const { account, active, library, chainId } = useBlockchain();
  
  const [nft, setNft] = useState(null);
  const [marketItem, setMarketItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  
  // 加载NFT详情和市场信息
  useEffect(() => {
    const loadNFTDetails = async () => {
      if (!library || !chainId || !nftContract || !tokenId) return;
      
      try {
        setLoading(true);
        setError('');
        
        // 获取NFT详情
        const details = await getNFTDetails(library, chainId, tokenId);
        setNft(details);
        
        // 获取市场信息
        const marketContract = getCultureMarketContract(library, chainId);
        const item = await marketContract.getNFTItem(nftContract, tokenId);
        
        setMarketItem({
          tokenId: item.tokenId.toString(),
          seller: item.seller,
          nftContract: item.nftContract,
          price: ethers.utils.formatEther(item.price),
          isAuction: item.isAuction,
          auctionEndTime: item.isAuction ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
          highestBidder: item.isAuction ? item.highestBidder : null,
          highestBid: item.isAuction ? ethers.utils.formatEther(item.highestBid) : null
        });
      } catch (error) {
        console.error('加载NFT详情失败:', error);
        setError('加载NFT详情时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadNFTDetails();
  }, [library, chainId, nftContract, tokenId]);
  
  // 处理购买
  const handleBuy = async () => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      const result = await buyNFT(
        library,
        chainId,
        nftContract,
        tokenId,
        marketItem.price
      );
      
      if (result.success) {
        setSuccess(`NFT购买成功！交易哈希: ${result.transactionHash}`);
        // 延迟后跳转到我的收藏页面
        setTimeout(() => {
          navigate('/my-purchases');
        }, 3000);
      } else {
        setError(`购买失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };
  
  // 处理竞价
  const handleBid = async (e) => {
    e.preventDefault();
    
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('请输入有效的竞价金额');
      return;
    }
    
    // 检查竞价是否高于当前最高价
    if (marketItem.highestBid && parseFloat(bidAmount) <= parseFloat(marketItem.highestBid)) {
      setError(`竞价必须高于当前最高价 ${marketItem.highestBid} ETH`);
      return;
    }
    
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      const result = await placeBid(
        library,
        chainId,
        nftContract,
        tokenId,
        bidAmount
      );
      
      if (result.success) {
        setSuccess(`竞价成功！交易哈希: ${result.transactionHash}`);
        setBidAmount('');
        
        // 重新加载市场信息
        const marketContract = getCultureMarketContract(library, chainId);
        const item = await marketContract.getNFTItem(nftContract, tokenId);
        
        setMarketItem({
          tokenId: item.tokenId.toString(),
          seller: item.seller,
          nftContract: item.nftContract,
          price: ethers.utils.formatEther(item.price),
          isAuction: item.isAuction,
          auctionEndTime: item.isAuction ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
          highestBidder: item.isAuction ? item.highestBidder : null,
          highestBid: item.isAuction ? ethers.utils.formatEther(item.highestBid) : null
        });
      } else {
        setError(`竞价失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };
  
  // 处理结束拍卖
  const handleEndAuction = async () => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    // 检查是否是卖家
    if (account.toLowerCase() !== marketItem.seller.toLowerCase()) {
      setError('只有卖家可以结束拍卖');
      return;
    }
    
    // 检查拍卖是否已结束
    const now = new Date();
    if (now < marketItem.auctionEndTime) {
      setError('拍卖尚未结束，无法手动结束');
      return;
    }
    
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      const result = await endAuction(
        library,
        chainId,
        nftContract,
        tokenId
      );
      
      if (result.success) {
        setSuccess(`拍卖结束成功！交易哈希: ${result.transactionHash}`);
        // 延迟后跳转到我的上架页面
        setTimeout(() => {
          navigate('/my-listings');
        }, 3000);
      } else {
        setError(`结束拍卖失败: ${result.error}`);
      }
    } catch (error) {
      setError(`操作失败: ${error.message}`);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };
  
  // 检查拍卖是否已结束
  const isAuctionEnded = marketItem?.isAuction && new Date() > marketItem.auctionEndTime;
  
  // 检查当前用户是否是卖家
  const isSeller = active && account && marketItem?.seller && account.toLowerCase() === marketItem.seller.toLowerCase();
  
  // 检查当前用户是否是最高出价者
  const isHighestBidder = active && account && marketItem?.highestBidder && account.toLowerCase() === marketItem.highestBidder.toLowerCase();
  
  if (loading) {
    return (
      <div className="nft-market-detail loading">
        <p>加载NFT详情中...</p>
      </div>
    );
  }
  
  if (error && !nft && !marketItem) {
    return (
      <div className="nft-market-detail error">
        <h2>加载失败</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/marketplace')} className="back-btn">
          返回市场
        </button>
      </div>
    );
  }
  
  if (!nft || !marketItem) {
    return (
      <div className="nft-market-detail not-found">
        <h2>NFT不存在或未上架</h2>
        <button onClick={() => navigate('/marketplace')} className="back-btn">
          返回市场
        </button>
      </div>
    );
  }
  
  return (
    <div className="nft-market-detail">
      <div className="market-detail-header">
        <h2>{nft.metadata.name}</h2>
        <button onClick={() => navigate('/marketplace')} className="back-btn">
          返回市场
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}
      
      <div className="market-detail-content">
        <div className="nft-media">
          <img 
            src={nft.metadata.image.startsWith('ipfs://') 
              ? `https://ipfs.io/ipfs/${nft.metadata.image.replace('ipfs://', '')}` 
              : nft.metadata.image} 
            alt={nft.metadata.name} 
            className="nft-image"
          />
        </div>
        
        <div className="nft-market-info">
          <div className="info-section">
            <h3>描述</h3>
            <p>{nft.metadata.description || '无描述'}</p>
          </div>
          
          <div className="info-section">
            <h3>卖家</h3>
            <p className="seller-address">
              {marketItem.seller}
              {isSeller && <span className="seller-badge">（您）</span>}
            </p>
          </div>
          
          <div className="info-section">
            <h3>价格</h3>
            <p className="nft-price">
              {marketItem.isAuction 
                ? `起拍价: ${marketItem.price} ETH` 
                : `${marketItem.price} ETH`}
            </p>
          </div>
          
          {marketItem.isAuction && (
            <div className="info-section">
              <h3>拍卖信息</h3>
              <p>
                <strong>当前最高价:</strong> {marketItem.highestBid ? `${marketItem.highestBid} ETH` : '暂无出价'}
              </p>
              <p>
                <strong>最高出价者:</strong> {marketItem.highestBidder || '暂无'}
                {isHighestBidder && <span className="bidder-badge">（您）</span>}
              </p>
              <p>
                <strong>拍卖结束时间:</strong> {marketItem.auctionEndTime.toLocaleString()}
              </p>
              <p>
                <strong>状态:</strong> {isAuctionEnded ? '已结束' : '进行中'}
              </p>
            </div>
          )}
          
          {nft.metadata.properties?.culture && (
            <div className="info-section">
              <h3>文化背景</h3>
              <p>{nft.metadata.properties.culture}</p>
            </div>
          )}
          
          {nft.metadata.properties?.attributes && nft.metadata.properties.attributes.length > 0 && (
            <div className="info-section">
              <h3>属性</h3>
              <div className="attributes-grid">
                {nft.metadata.properties.attributes.map((attr, index) => (
                  <div key={index} className="attribute-item">
                    <span className="attribute-name">{attr.trait_type}</span>
                    <span className="attribute-value">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="action-section">
            {!active ? (
              <div className="wallet-warning">
                <p>请先连接钱包以交易NFT</p>
              </div>
            ) : isSeller ? (
              <div className="seller-actions">
                <p>您是此NFT的卖家</p>
                {marketItem.isAuction && isAuctionEnded && (
                  <button 
                    onClick={handleEndAuction} 
                    disabled={processing}
                    className="end-auction-btn"
                  >
                    {processing ? '处理中...' : '结束拍卖'}
                  </button>
                )}
              </div>
            ) : marketItem.isAuction ? (
              <div className="auction-actions">
                {isAuctionEnded ? (
                  <p>拍卖已结束</p>
                ) : (
                  <form onSubmit={handleBid} className="bid-form">
                    <div className="form-group">
                      <label htmlFor="bidAmount">出价 (ETH) *</label>
                      <input
                        type="number"
                        id="bidAmount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={marketItem.highestBid ? parseFloat(marketItem.highestBid) + 0.01 : parseFloat(marketItem.price)}
                        step="0.01"
                        disabled={processing}
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={processing}
                      className="bid-button"
                    >
                      {processing ? '处理中...' : '出价'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="buy-actions">
                <button
                  onClick={handleBuy}
                  disabled={processing}
                  className="buy-button"
                >
                  {processing ? '处理中...' : `购买 (${marketItem.price} ETH)`}
                </button>
              </div>
            )}
          </div>
          
          {marketItem.isAuction && (
            <div className="bid-history-section">
              <h3>竞价历史</h3>
              <BidHistory nftContract={nftContract} tokenId={tokenId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTMarketDetail;
```

### 3.3 市场上下文设计

创建市场上下文，管理市场状态和数据。

```jsx
// MarketplaceContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useBlockchain } from '../blockchain';
import { 
  getListedNFTs, 
  getMyListedNFTs, 
  getMyPurchasedNFTs 
} from '../../contracts/marketplace/CultureMarket';

// 创建市场上下文
export const MarketplaceContext = createContext({
  listedNFTs: [],
  myListedNFTs: [],
  myPurchasedNFTs: [],
  loading: false,
  error: null,
  refreshMarketplace: () => {},
  refreshMyListings: () => {},
  refreshMyPurchases: () => {}
});

// 市场上下文提供者组件
export const MarketplaceProvider = ({ children }) => {
  const { active, library, chainId } = useBlockchain();
  
  const [listedNFTs, setListedNFTs] = useState([]);
  const [myListedNFTs, setMyListedNFTs] = useState([]);
  const [myPurchasedNFTs, setMyPurchasedNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 加载市场NFT
  const refreshMarketplace = async () => {
    if (!active || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const nfts = await getListedNFTs(library, chainId);
      setListedNFTs(nfts);
    } catch (error) {
      console.error('加载市场NFT失败:', error);
      setError('加载市场NFT时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 加载我的上架NFT
  const refreshMyListings = async () => {
    if (!active || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const nfts = await getMyListedNFTs(library, chainId);
      setMyListedNFTs(nfts);
    } catch (error) {
      console.error('加载我的上架NFT失败:', error);
      setError('加载我的上架NFT时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 加载我购买的NFT
  const refreshMyPurchases = async () => {
    if (!active || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const nfts = await getMyPurchasedNFTs(library, chainId);
      setMyPurchasedNFTs(nfts);
    } catch (error) {
      console.error('加载我购买的NFT失败:', error);
      setError('加载我购买的NFT时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    if (active && library && chainId) {
      refreshMarketplace();
    }
  }, [active, library, chainId]);
  
  // 上下文值
  const contextValue = {
    listedNFTs,
    myListedNFTs,
    myPurchasedNFTs,
    loading,
    error,
    refreshMarketplace,
    refreshMyListings,
    refreshMyPurchases
  };
  
  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
};

// 自定义Hook，方便在组件中使用市场上下文
export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace必须在MarketplaceProvider内部使用');
  }
  return context;
};
```

## 4. 路由与应用集成

### 4.1 路由设计

在App.js中添加NFT市场相关路由。

```jsx
// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WalletConnector from './components/blockchain/WalletConnector';
import NFTMinter from './components/blockchain/NFTMinter';
import NFTGallery from './components/blockchain/NFTGallery';
import NFTDetail from './components/blockchain/NFTDetail';
import MarketplaceHome from './components/marketplace/MarketplaceHome';
import NFTListingForm from './components/marketplace/NFTListingForm';
import NFTAuctionForm from './components/marketplace/NFTAuctionForm';
import NFTMarketDetail from './components/marketplace/NFTMarketDetail';
import MyListings from './components/marketplace/MyListings';
import MyPurchases from './components/marketplace/MyPurchases';
import { MarketplaceProvider } from './context/marketplace/MarketplaceContext';
import './App.css';
import './styles/blockchain.css';
import './styles/marketplace.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>CultureBridge</h1>
        <div className="wallet-section">
          <WalletConnector />
        </div>
      </header>
      
      <main className="App-main">
        <MarketplaceProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mint" element={<NFTMinter />} />
            <Route path="/gallery" element={<NFTGallery />} />
            <Route path="/nft/:tokenId" element={<NFTDetailWrapper />} />
            <Route path="/marketplace" element={<MarketplaceHome />} />
            <Route path="/list-nft" element={<NFTListingForm />} />
            <Route path="/list-auction" element={<NFTAuctionForm />} />
            <Route path="/market-item/:nftContract/:tokenId" element={<NFTMarketDetail />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/my-purchases" element={<MyPurchases />} />
          </Routes>
        </MarketplaceProvider>
      </main>
      
      <footer className="App-footer">
        <p>CultureBridge - 基于区块链的跨文化交流平台</p>
      </footer>
    </div>
  );
}

// 首页组件
function Home() {
  return (
    <div className="home-container">
      <h2>欢迎来到CultureBridge</h2>
      <p>探索基于区块链的跨文化交流新体验</p>
      
      <div className="feature-cards">
        <div className="feature-card">
          <h3>创建文化NFT</h3>
          <p>将您的文化作品铸造为NFT，确保数字所有权</p>
          <a href="/mint" className="feature-link">开始创建</a>
        </div>
        
        <div className="feature-card">
          <h3>浏览NFT画廊</h3>
          <p>探索来自世界各地的文化艺术品</p>
          <a href="/gallery" className="feature-link">查看画廊</a>
        </div>
        
        <div className="feature-card">
          <h3>NFT市场</h3>
          <p>交易独特的文化NFT资产</p>
          <a href="/marketplace" className="feature-link">进入市场</a>
        </div>
      </div>
    </div>
  );
}

// NFT详情包装组件，用于获取路由参数
function NFTDetailWrapper() {
  const tokenId = window.location.pathname.split('/').pop();
  return <NFTDetail tokenId={tokenId} />;
}

export default App;
```

### 4.2 样式设计

创建marketplace.css样式文件，为NFT市场组件提供样式。

```css
/* marketplace.css */

/* 市场首页样式 */
.marketplace-home {
  padding: 20px;
}

.marketplace-header {
  text-align: center;
  margin-bottom: 30px;
}

.marketplace-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.marketplace-header p {
  color: #666;
  font-size: 18px;
}

.marketplace-stats-container {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.marketplace-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
}

.marketplace-sidebar {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.marketplace-main {
  min-height: 500px;
}

/* 筛选器样式 */
.marketplace-filters {
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 15px;
}

.filter-group h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-option {
  display: flex;
  align-items: center;
}

.filter-option input[type="checkbox"] {
  margin-right: 8px;
}

.price-range {
  margin-top: 10px;
}

.price-range-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 5px;
}

.price-range-inputs input {
  width: 80px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.sort-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
}

/* NFT卡片样式 */
.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.nft-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.nft-card:hover {
  transform: translateY(-5px);
}

.nft-card.auction {
  border: 2px solid #6f42c1;
}

.nft-image-container {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.nft-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auction-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #6f42c1;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.nft-card-info {
  padding: 15px;
}

.nft-card-info h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  color: #333;
}

.nft-card-price {
  font-weight: 500;
  color: #007bff;
  margin-bottom: 10px;
}

.nft-card-seller {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nft-card-culture {
  display: inline-block;
  background-color: #e6f7ff;
  color: #0070f3;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 15px;
}

.nft-card-actions {
  display: flex;
  justify-content: space-between;
}

.view-nft-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.buy-now-btn {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

/* NFT上架表单样式 */
.nft-listing-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nft-listing-form h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
  font-size: 28px;
}

.nft-selection {
  margin-bottom: 30px;
}

.nft-selection h3 {
  margin-bottom: 15px;
  color: #333;
}

.nft-select-card {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.nft-select-card:hover {
  transform: translateY(-5px);
}

.nft-select-card.selected {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3);
}

.nft-select-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.nft-select-info {
  padding: 10px;
}

.nft-select-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.nft-select-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.listing-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.listing-form h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.selected-nft-preview {
  display: flex;
  margin-bottom: 20px;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
}

.selected-nft-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.selected-nft-info {
  flex: 1;
}

.selected-nft-info h4 {
  margin-top: 0;
  margin-bottom: 5px;
}

.selected-nft-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.list-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 18px;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.list-button:hover {
  background-color: #0069d9;
}

.list-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* NFT市场详情页样式 */
.nft-market-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.market-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.market-detail-header h2 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.back-btn {
  background-color: #6c757d;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.market-detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.nft-media {
  background-color: #f8f9fa;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nft-image {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.nft-market-info {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nft-price {
  font-size: 24px;
  font-weight: 500;
  color: #007bff;
}

.seller-badge,
.bidder-badge {
  display: inline-block;
  background-color: #28a745;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 8px;
}

.action-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.buy-button,
.bid-button,
.end-auction-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.buy-button {
  background-color: #28a745;
  color: white;
}

.buy-button:hover {
  background-color: #218838;
}

.bid-button {
  background-color: #6f42c1;
  color: white;
}

.bid-button:hover {
  background-color: #5e35b1;
}

.end-auction-btn {
  background-color: #dc3545;
  color: white;
}

.end-auction-btn:hover {
  background-color: #c82333;
}

.buy-button:disabled,
.bid-button:disabled,
.end-auction-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.bid-form {
  margin-top: 15px;
}

.bid-history-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.bid-history-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.bid-history-table th,
.bid-history-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.bid-history-table th {
  font-weight: 500;
  color: #555;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .marketplace-content {
    grid-template-columns: 1fr;
  }
  
  .market-detail-content {
    grid-template-columns: 1fr;
  }
  
  .nft-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .nft-grid {
    grid-template-columns: 1fr;
  }
  
  .selected-nft-preview {
    flex-direction: column;
  }
  
  .selected-nft-preview img {
    width: 100%;
    height: auto;
    margin-right: 0;
    margin-bottom: 10px;
  }
}
```

## 5. 数据流设计

### 5.1 NFT市场数据流

```
用户操作 -> 前端组件 -> 市场上下文 -> 合约接口 -> 区块链网络
                                  -> 本地状态管理

区块链网络 -> 合约接口 -> 市场上下文 -> 前端组件 -> 用户界面
```

### 5.2 状态管理

- **全局状态**：通过MarketplaceContext管理市场全局状态
- **组件状态**：各组件通过useState管理本地状态
- **区块链状态**：通过BlockchainContext管理钱包连接和网络状态

### 5.3 事件监听

监听区块链事件，实时更新市场状态。

```javascript
// 在MarketplaceContext中添加事件监听
useEffect(() => {
  if (active && library && chainId) {
    const contract = getCultureMarketContract(library, chainId);
    
    // 监听NFT上架事件
    const listedFilter = contract.filters.NFTListed();
    const soldFilter = contract.filters.NFTSold();
    const cancelledFilter = contract.filters.NFTListingCancelled();
    
    const handleNFTListed = () => refreshMarketplace();
    const handleNFTSold = () => {
      refreshMarketplace();
      refreshMyPurchases();
    };
    const handleNFTCancelled = () => refreshMarketplace();
    
    contract.on(listedFilter, handleNFTListed);
    contract.on(soldFilter, handleNFTSold);
    contract.on(cancelledFilter, handleNFTCancelled);
    
    return () => {
      contract.off(listedFilter, handleNFTListed);
      contract.off(soldFilter, handleNFTSold);
      contract.off(cancelledFilter, handleNFTCancelled);
    };
  }
}, [active, library, chainId]);
```

## 6. 实施计划

### 6.1 开发阶段

1. **第一阶段**：实现NFT市场合约接口和基础组件
   - 开发CultureMarket.js合约接口
   - 实现MarketplaceContext上下文
   - 开发NFTCard和MarketplaceHome组件

2. **第二阶段**：实现NFT上架和购买功能
   - 开发NFTListingForm组件
   - 开发NFTMarketDetail组件
   - 实现购买功能

3. **第三阶段**：实现拍卖功能和用户管理页面
   - 开发NFTAuctionForm组件
   - 实现竞价和拍卖结束功能
   - 开发MyListings和MyPurchases组件

4. **第四阶段**：优化和测试
   - 完善错误处理和用户反馈
   - 优化用户界面和交互体验
   - 全面测试各功能模块

### 6.2 测试计划

- **单元测试**：测试各合约接口函数
- **集成测试**：测试组件与合约的交互
- **用户流程测试**：测试完整的用户操作流程
- **兼容性测试**：测试不同浏览器和设备的兼容性

## 7. 总结

本技术方案详细设计了CultureBridge平台NFT市场功能的实现方案，包括智能合约接口、前端组件结构和数据流设计。通过实现NFT上架、购买、拍卖等功能，将为用户提供完整的文化NFT交易体验，促进文化资产的流通与交换。

后续将按照实施计划逐步开发和测试各功能模块，确保NFT市场功能的稳定性和用户体验。
