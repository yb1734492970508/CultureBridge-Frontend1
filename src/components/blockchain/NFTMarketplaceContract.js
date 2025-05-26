import { ethers } from 'ethers';

/**
 * NFT市场合约交互服务
 * 提供与NFT市场智能合约交互的方法
 */
class NFTMarketplaceContract {
  constructor(provider, marketplaceAddress, marketplaceABI) {
    this.provider = provider;
    this.marketplaceAddress = marketplaceAddress;
    this.marketplaceABI = marketplaceABI;
    this.contract = null;
    this.signer = null;
    
    this.initContract();
  }
  
  // 初始化合约实例
  initContract() {
    if (this.provider) {
      // 只读合约实例
      this.contract = new ethers.Contract(
        this.marketplaceAddress,
        this.marketplaceABI,
        this.provider
      );
      
      // 尝试获取签名者
      try {
        this.signer = this.provider.getSigner();
        // 可写合约实例
        this.contract = this.contract.connect(this.signer);
      } catch (error) {
        console.log('No signer available, using read-only mode');
      }
    }
  }
  
  // 更新提供者和签名者
  updateProvider(provider) {
    this.provider = provider;
    this.initContract();
  }
  
  // 获取所有上架的NFT
  async getListedNFTs() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // 调用合约方法获取上架NFT
      const listedNFTs = await this.contract.getAllListedNFTs();
      
      // 处理返回数据
      return Promise.all(listedNFTs.map(async (nft) => {
        // 获取NFT元数据
        const tokenURI = await this.getNFTMetadata(nft.tokenAddress, nft.tokenId);
        const metadata = await this.fetchMetadata(tokenURI);
        
        return {
          id: `${nft.tokenAddress}-${nft.tokenId}`,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          price: nft.price,
          seller: nft.seller,
          owner: nft.seller,
          tokenId: nft.tokenId.toString(),
          contractAddress: nft.tokenAddress,
          isAuction: nft.isAuction,
          auctionEndTime: nft.isAuction ? nft.auctionEndTime.toNumber() * 1000 : null,
          highestBid: nft.isAuction ? nft.highestBid : null,
          highestBidder: nft.isAuction ? nft.highestBidder : null,
          category: metadata.properties?.category || 'other',
          creator: metadata.creator || 'Unknown',
          createdAt: nft.listingTime.toNumber() * 1000,
          likes: 0 // 从单独的服务获取
        };
      }));
    } catch (error) {
      console.error('Error fetching listed NFTs:', error);
      throw error;
    }
  }
  
  // 获取NFT元数据URI
  async getNFTMetadata(tokenAddress, tokenId) {
    try {
      // 创建ERC721合约实例
      const nftContract = new ethers.Contract(
        tokenAddress,
        [
          'function tokenURI(uint256 tokenId) external view returns (string memory)'
        ],
        this.provider
      );
      
      // 获取tokenURI
      const tokenURI = await nftContract.tokenURI(tokenId);
      return tokenURI;
    } catch (error) {
      console.error('Error fetching NFT metadata URI:', error);
      throw error;
    }
  }
  
  // 获取元数据内容
  async fetchMetadata(tokenURI) {
    try {
      // 处理IPFS URI
      if (tokenURI.startsWith('ipfs://')) {
        tokenURI = `https://ipfs.io/ipfs/${tokenURI.slice(7)}`;
      }
      
      const response = await fetch(tokenURI);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metadata = await response.json();
      
      // 处理IPFS图片链接
      if (metadata.image && metadata.image.startsWith('ipfs://')) {
        metadata.image = `https://ipfs.io/ipfs/${metadata.image.slice(7)}`;
      }
      
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return {
        name: 'Unknown NFT',
        description: 'Metadata could not be loaded',
        image: '/placeholder.png'
      };
    }
  }
  
  // 购买NFT
  async purchaseNFT(tokenAddress, tokenId, price) {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or no signer available');
      }
      
      // 调用合约购买方法
      const tx = await this.contract.purchaseItem(tokenAddress, tokenId, {
        value: price
      });
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      throw error;
    }
  }
  
  // 对NFT出价
  async placeBid(tokenAddress, tokenId, bidAmount) {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or no signer available');
      }
      
      // 调用合约竞价方法
      const tx = await this.contract.placeBid(tokenAddress, tokenId, {
        value: bidAmount
      });
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  }
  
  // 获取用户的NFT交易历史
  async getUserTransactionHistory(userAddress) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // 获取购买事件
      const purchaseFilter = this.contract.filters.ItemSold(null, null, userAddress);
      const purchaseEvents = await this.contract.queryFilter(purchaseFilter);
      
      // 获取出售事件
      const saleFilter = this.contract.filters.ItemSold(null, userAddress);
      const saleEvents = await this.contract.queryFilter(saleFilter);
      
      // 获取竞价事件
      const bidFilter = this.contract.filters.BidPlaced(null, null, userAddress);
      const bidEvents = await this.contract.queryFilter(bidFilter);
      
      // 处理事件数据
      const purchases = await Promise.all(purchaseEvents.map(async (event) => {
        const block = await event.getBlock();
        return {
          id: `purchase-${event.transactionHash}`,
          type: 'purchase',
          nftId: `${event.args.tokenAddress}-${event.args.tokenId}`,
          price: event.args.price,
          from: event.args.seller,
          to: event.args.buyer,
          timestamp: block.timestamp * 1000,
          txHash: event.transactionHash,
          status: 'completed'
        };
      }));
      
      const sales = await Promise.all(saleEvents.map(async (event) => {
        const block = await event.getBlock();
        return {
          id: `sale-${event.transactionHash}`,
          type: 'sale',
          nftId: `${event.args.tokenAddress}-${event.args.tokenId}`,
          price: event.args.price,
          from: event.args.seller,
          to: event.args.buyer,
          timestamp: block.timestamp * 1000,
          txHash: event.transactionHash,
          status: 'completed'
        };
      }));
      
      const bids = await Promise.all(bidEvents.map(async (event) => {
        const block = await event.getBlock();
        // 检查竞价状态
        let status = 'pending';
        try {
          const auction = await this.contract.getAuction(event.args.tokenAddress, event.args.tokenId);
          if (auction.ended) {
            status = auction.winner === userAddress ? 'won' : 'outbid';
          }
        } catch (error) {
          console.error('Error checking auction status:', error);
        }
        
        return {
          id: `bid-${event.transactionHash}`,
          type: 'bid',
          nftId: `${event.args.tokenAddress}-${event.args.tokenId}`,
          price: event.args.bidAmount,
          from: event.args.bidder,
          to: null,
          timestamp: block.timestamp * 1000,
          txHash: event.transactionHash,
          status
        };
      }));
      
      // 合并所有交易历史
      return [...purchases, ...sales, ...bids].sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }
  
  // 估算Gas费用
  async estimateGasFee(method, ...args) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // 估算Gas用量
      const gasEstimate = await this.contract.estimateGas[method](...args);
      
      // 获取当前Gas价格
      const gasPrice = await this.provider.getGasPrice();
      
      // 计算总Gas费用
      const gasFee = gasEstimate.mul(gasPrice);
      
      return ethers.utils.formatEther(gasFee);
    } catch (error) {
      console.error('Error estimating gas fee:', error);
      return '0.002'; // 返回默认估算值
    }
  }
  
  // 监听NFT上架事件
  listenToListingEvents(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    // 监听ItemListed事件
    this.contract.on('ItemListed', (seller, tokenAddress, tokenId, price, isAuction, event) => {
      callback({
        seller,
        tokenAddress,
        tokenId: tokenId.toString(),
        price,
        isAuction,
        transactionHash: event.transactionHash
      });
    });
    
    return () => {
      // 返回清理函数
      this.contract.removeAllListeners('ItemListed');
    };
  }
  
  // 监听NFT售出事件
  listenToSaleEvents(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    // 监听ItemSold事件
    this.contract.on('ItemSold', (tokenAddress, seller, buyer, tokenId, price, event) => {
      callback({
        tokenAddress,
        seller,
        buyer,
        tokenId: tokenId.toString(),
        price,
        transactionHash: event.transactionHash
      });
    });
    
    return () => {
      // 返回清理函数
      this.contract.removeAllListeners('ItemSold');
    };
  }
  
  // 监听竞价事件
  listenToBidEvents(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    // 监听BidPlaced事件
    this.contract.on('BidPlaced', (tokenAddress, tokenId, bidder, bidAmount, event) => {
      callback({
        tokenAddress,
        tokenId: tokenId.toString(),
        bidder,
        bidAmount,
        transactionHash: event.transactionHash
      });
    });
    
    return () => {
      // 返回清理函数
      this.contract.removeAllListeners('BidPlaced');
    };
  }
}

export default NFTMarketplaceContract;
