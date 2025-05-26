/**
 * NFT市场智能合约ABI
 * 用于与NFT市场合约交互
 */
const NFTMarketplaceABI = [
  // 查询函数
  "function getAllListedNFTs() external view returns (tuple(address tokenAddress, uint256 tokenId, address seller, uint256 price, bool isAuction, uint256 auctionEndTime, address highestBidder, uint256 highestBid, uint256 listingTime)[])",
  "function getListedNFT(address tokenAddress, uint256 tokenId) external view returns (address seller, uint256 price, bool isAuction, uint256 auctionEndTime, address highestBidder, uint256 highestBid, uint256 listingTime)",
  "function getAuction(address tokenAddress, uint256 tokenId) external view returns (bool isActive, bool ended, address highestBidder, uint256 highestBid, uint256 endTime, address winner)",
  "function getUserListedNFTs(address user) external view returns (tuple(address tokenAddress, uint256 tokenId, address seller, uint256 price, bool isAuction, uint256 auctionEndTime, address highestBidder, uint256 highestBid, uint256 listingTime)[])",
  "function getUserPurchasedNFTs(address user) external view returns (tuple(address tokenAddress, uint256 tokenId, address seller, uint256 price, uint256 purchaseTime)[])",
  
  // 交易函数
  "function listItem(address tokenAddress, uint256 tokenId, uint256 price, bool isAuction, uint256 auctionDuration) external",
  "function purchaseItem(address tokenAddress, uint256 tokenId) external payable",
  "function cancelListing(address tokenAddress, uint256 tokenId) external",
  "function placeBid(address tokenAddress, uint256 tokenId) external payable",
  "function endAuction(address tokenAddress, uint256 tokenId) external",
  "function withdrawBid(address tokenAddress, uint256 tokenId) external",
  
  // 事件
  "event ItemListed(address indexed seller, address indexed tokenAddress, uint256 indexed tokenId, uint256 price, bool isAuction)",
  "event ItemCanceled(address indexed seller, address indexed tokenAddress, uint256 indexed tokenId)",
  "event ItemSold(address indexed tokenAddress, address indexed seller, address indexed buyer, uint256 tokenId, uint256 price)",
  "event BidPlaced(address indexed tokenAddress, uint256 indexed tokenId, address indexed bidder, uint256 bidAmount)",
  "event AuctionEnded(address indexed tokenAddress, uint256 indexed tokenId, address winner, uint256 price)",
  "event BidWithdrawn(address indexed tokenAddress, uint256 indexed tokenId, address indexed bidder, uint256 bidAmount)"
];

export default NFTMarketplaceABI;
