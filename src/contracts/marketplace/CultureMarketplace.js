// CultureMarketplace.js - NFT市场智能合约接口

import { ethers } from 'ethers';

// NFT市场合约ABI
const CultureMarketplaceABI = [
  // 市场项目管理
  "function createMarketItem(address nftContract, uint256 tokenId, uint256 price, bool isAuction, uint256 auctionEndTime) external returns (uint256)",
  "function createMarketSale(uint256 itemId) external payable",
  "function cancelMarketItem(uint256 itemId) external",
  
  // 拍卖功能
  "function placeBid(uint256 itemId) external payable",
  "function endAuction(uint256 itemId) external",
  "function claimAuction(uint256 itemId) external",
  
  // 查询功能
  "function fetchMarketItems() external view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool auction, uint256 auctionEndTime, uint256 highestBid, address highestBidder)[] memory)",
  "function fetchMyListedItems() external view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool auction, uint256 auctionEndTime, uint256 highestBid, address highestBidder)[] memory)",
  "function fetchMyPurchasedItems() external view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool auction, uint256 auctionEndTime, uint256 highestBid, address highestBidder)[] memory)",
  "function fetchMarketItemByToken(address nftContract, uint256 tokenId) external view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool auction, uint256 auctionEndTime, uint256 highestBid, address highestBidder) memory)",
  "function fetchBidHistory(uint256 itemId) external view returns (tuple(address bidder, uint256 amount, uint256 timestamp)[] memory)",
  
  // 平台费用管理
  "function getListingFee() external view returns (uint256)",
  "function updateListingFee(uint256 _listingFee) external",
  
  // 事件
  "event MarketItemCreated(uint256 indexed itemId, address indexed nftContract, uint256 indexed tokenId, address seller, address owner, uint256 price, bool sold, bool auction, uint256 auctionEndTime)",
  "event MarketItemSold(uint256 indexed itemId, address indexed nftContract, uint256 indexed tokenId, address seller, address owner, uint256 price)",
  "event MarketItemCanceled(uint256 indexed itemId, address indexed nftContract, uint256 indexed tokenId)",
  "event AuctionBid(uint256 indexed itemId, address indexed bidder, uint256 amount)",
  "event AuctionEnded(uint256 indexed itemId, address indexed winner, uint256 amount)"
];

// 测试网络合约地址
const CULTURE_MARKETPLACE_CONTRACT_ADDRESS = {
  1: "0x0000000000000000000000000000000000000000", // 以太坊主网（待部署）
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia测试网（待部署）
  80001: "0x0000000000000000000000000000000000000000" // Polygon Mumbai测试网（待部署）
};

/**
 * 获取市场合约实例
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 合约实例
 */
export const getMarketplaceContract = (provider, chainId) => {
  const address = CULTURE_MARKETPLACE_CONTRACT_ADDRESS[chainId];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`当前网络(chainId: ${chainId})不支持CultureMarketplace合约`);
  }
  
  return new ethers.Contract(address, CultureMarketplaceABI, provider);
};

/**
 * 获取带签名的市场合约实例（用于写操作）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 带签名的合约实例
 */
export const getSignedMarketplaceContract = async (provider, chainId) => {
  const signer = provider.getSigner();
  const contract = getMarketplaceContract(provider, chainId);
  return contract.connect(signer);
};

/**
 * 创建市场项目（上架NFT）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} nftContract - NFT合约地址
 * @param {string} tokenId - 代币ID
 * @param {string} price - 价格（ETH字符串，如"0.1"）
 * @param {boolean} isAuction - 是否为拍卖
 * @param {number} auctionDuration - 拍卖持续时间（小时，仅在isAuction为true时有效）
 * @returns {Promise<Object>} 交易结果
 */
export const createMarketItem = async (provider, chainId, nftContract, tokenId, price, isAuction = false, auctionDuration = 0) => {
  try {
    const contract = await getSignedMarketplaceContract(provider, chainId);
    
    // 获取上架费用
    const listingFee = await contract.getListingFee();
    
    // 计算拍卖结束时间
    let auctionEndTime = 0;
    if (isAuction && auctionDuration > 0) {
      auctionEndTime = Math.floor(Date.now() / 1000) + (auctionDuration * 3600);
    }
    
    // 将价格转换为Wei
    const priceInWei = ethers.utils.parseEther(price);
    
    // 创建市场项目
    const tx = await contract.createMarketItem(
      nftContract,
      tokenId,
      priceInWei,
      isAuction,
      auctionEndTime,
      { value: listingFee }
    );
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    // 从事件中获取itemId
    const event = receipt.events.find(e => e.event === 'MarketItemCreated');
    const itemId = event.args.itemId.toString();
    
    return {
      success: true,
      itemId,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("创建市场项目失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 购买市场项目
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} itemId - 项目ID
 * @param {string} price - 价格（ETH字符串，如"0.1"）
 * @returns {Promise<Object>} 交易结果
 */
export const createMarketSale = async (provider, chainId, itemId, price) => {
  try {
    const contract = await getSignedMarketplaceContract(provider, chainId);
    
    // 将价格转换为Wei
    const priceInWei = ethers.utils.parseEther(price);
    
    // 购买市场项目
    const tx = await contract.createMarketSale(itemId, { value: priceInWei });
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("购买市场项目失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 取消市场项目
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} itemId - 项目ID
 * @returns {Promise<Object>} 交易结果
 */
export const cancelMarketItem = async (provider, chainId, itemId) => {
  try {
    const contract = await getSignedMarketplaceContract(provider, chainId);
    
    // 取消市场项目
    const tx = await contract.cancelMarketItem(itemId);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("取消市场项目失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 出价
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} itemId - 项目ID
 * @param {string} bidAmount - 出价金额（ETH字符串，如"0.1"）
 * @returns {Promise<Object>} 交易结果
 */
export const placeBid = async (provider, chainId, itemId, bidAmount) => {
  try {
    const contract = await getSignedMarketplaceContract(provider, chainId);
    
    // 将出价金额转换为Wei
    const bidAmountInWei = ethers.utils.parseEther(bidAmount);
    
    // 出价
    const tx = await contract.placeBid(itemId, { value: bidAmountInWei });
    
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
 * @param {string} itemId - 项目ID
 * @returns {Promise<Object>} 交易结果
 */
export const endAuction = async (provider, chainId, itemId) => {
  try {
    const contract = await getSignedMarketplaceContract(provider, chainId);
    
    // 结束拍卖
    const tx = await contract.endAuction(itemId);
    
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

/**
 * 领取拍卖品
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} itemId - 项目ID
 * @returns {Promise<Object>} 交易结果
 */
export const claimAuction = async (provider, chainId, itemId) => {
  try {
    const contract = await getSignedMarketplaceContract(provider, chainId);
    
    // 领取拍卖品
    const tx = await contract.claimAuction(itemId);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("领取拍卖品失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取市场项目列表
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {Promise<Array>} 市场项目列表
 */
export const fetchMarketItems = async (provider, chainId) => {
  try {
    const contract = getMarketplaceContract(provider, chainId);
    
    // 获取市场项目
    const items = await contract.fetchMarketItems();
    
    // 处理项目数据
    return items.map(item => ({
      itemId: item.itemId.toString(),
      nftContract: item.nftContract,
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      owner: item.owner,
      price: ethers.utils.formatEther(item.price),
      sold: item.sold,
      auction: item.auction,
      auctionEndTime: item.auctionEndTime.toNumber() > 0 ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
      highestBid: item.highestBid.gt(0) ? ethers.utils.formatEther(item.highestBid) : null,
      highestBidder: item.highestBidder !== ethers.constants.AddressZero ? item.highestBidder : null
    }));
  } catch (error) {
    console.error("获取市场项目列表失败:", error);
    return [];
  }
};

/**
 * 获取我的上架项目
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {Promise<Array>} 我的上架项目列表
 */
export const fetchMyListedItems = async (provider, chainId) => {
  try {
    const contract = await getSignedMarketplaceContract(provider, chainId);
    
    // 获取我的上架项目
    const items = await contract.fetchMyListedItems();
    
    // 处理项目数据
    return items.map(item => ({
      itemId: item.itemId.toString(),
      nftContract: item.nftContract,
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      owner: item.owner,
      price: ethers.utils.formatEther(item.price),
      sold: item.sold,
      auction: item.auction,
      auctionEndTime: item.auctionEndTime.toNumber() > 0 ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
      highestBid: item.highestBid.gt(0) ? ethers.utils.formatEther(item.highestBid) : null,
      highestBidder: item.highestBidder !== ethers.constants.AddressZero ? item.highestBidder : null
    }));
  } catch (error) {
    console.error("获取我的上架项目失败:", error);
    return [];
  }
};

/**
 * 获取我的购买项目
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {Promise<Array>} 我的购买项目列表
 */
export const fetchMyPurchasedItems = async (provider, chainId) => {
  try {
    const contract = await getSignedMarketplaceContract(provider, chainId);
    
    // 获取我的购买项目
    const items = await contract.fetchMyPurchasedItems();
    
    // 处理项目数据
    return items.map(item => ({
      itemId: item.itemId.toString(),
      nftContract: item.nftContract,
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      owner: item.owner,
      price: ethers.utils.formatEther(item.price),
      sold: item.sold,
      auction: item.auction,
      auctionEndTime: item.auctionEndTime.toNumber() > 0 ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
      highestBid: item.highestBid.gt(0) ? ethers.utils.formatEther(item.highestBid) : null,
      highestBidder: item.highestBidder !== ethers.constants.AddressZero ? item.highestBidder : null
    }));
  } catch (error) {
    console.error("获取我的购买项目失败:", error);
    return [];
  }
};

/**
 * 根据NFT合约地址和代币ID获取市场项目
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} nftContract - NFT合约地址
 * @param {string} tokenId - 代币ID
 * @returns {Promise<Object>} 市场项目
 */
export const fetchMarketItemByToken = async (provider, chainId, nftContract, tokenId) => {
  try {
    const contract = getMarketplaceContract(provider, chainId);
    
    // 获取市场项目
    const item = await contract.fetchMarketItemByToken(nftContract, tokenId);
    
    // 检查项目是否存在
    if (item.itemId.toString() === '0') {
      return null;
    }
    
    // 处理项目数据
    return {
      itemId: item.itemId.toString(),
      nftContract: item.nftContract,
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      owner: item.owner,
      price: ethers.utils.formatEther(item.price),
      sold: item.sold,
      auction: item.auction,
      auctionEndTime: item.auctionEndTime.toNumber() > 0 ? new Date(item.auctionEndTime.toNumber() * 1000) : null,
      highestBid: item.highestBid.gt(0) ? ethers.utils.formatEther(item.highestBid) : null,
      highestBidder: item.highestBidder !== ethers.constants.AddressZero ? item.highestBidder : null
    };
  } catch (error) {
    console.error("获取市场项目失败:", error);
    return null;
  }
};

/**
 * 获取拍卖出价历史
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} itemId - 项目ID
 * @returns {Promise<Array>} 出价历史
 */
export const fetchBidHistory = async (provider, chainId, itemId) => {
  try {
    const contract = getMarketplaceContract(provider, chainId);
    
    // 获取出价历史
    const bids = await contract.fetchBidHistory(itemId);
    
    // 处理出价数据
    return bids.map(bid => ({
      bidder: bid.bidder,
      amount: ethers.utils.formatEther(bid.amount),
      timestamp: new Date(bid.timestamp.toNumber() * 1000)
    }));
  } catch (error) {
    console.error("获取出价历史失败:", error);
    return [];
  }
};

/**
 * 获取上架费用
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {Promise<string>} 上架费用（ETH字符串）
 */
export const getListingFee = async (provider, chainId) => {
  try {
    const contract = getMarketplaceContract(provider, chainId);
    
    // 获取上架费用
    const fee = await contract.getListingFee();
    
    return ethers.utils.formatEther(fee);
  } catch (error) {
    console.error("获取上架费用失败:", error);
    return "0";
  }
};

export default {
  getMarketplaceContract,
  getSignedMarketplaceContract,
  createMarketItem,
  createMarketSale,
  cancelMarketItem,
  placeBid,
  endAuction,
  claimAuction,
  fetchMarketItems,
  fetchMyListedItems,
  fetchMyPurchasedItems,
  fetchMarketItemByToken,
  fetchBidHistory,
  getListingFee
};
