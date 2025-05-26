import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/blockchain';
import { 
  fetchMarketItemByToken, 
  createMarketSale, 
  placeBid, 
  fetchBidHistory,
  endAuction,
  claimAuction
} from '../../contracts/marketplace/CultureMarketplace';
import { getNFTContract } from '../../contracts/NFT/CultureNFT';
import { ethers } from 'ethers';
import '../../styles/blockchain.css';

const NFTMarketDetail = () => {
  const { contractAddress, tokenId } = useParams();
  const navigate = useNavigate();
  const { active, account, library, chainId } = useBlockchain();
  
  const [item, setItem] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 加载市场项目详情
  useEffect(() => {
    const loadItemDetails = async () => {
      if (!library || !chainId || !contractAddress || !tokenId) return;
      
      try {
        setLoading(true);
        setError('');
        
        // 获取市场项目
        const marketItem = await fetchMarketItemByToken(library, chainId, contractAddress, tokenId);
        
        if (!marketItem) {
          setError('找不到该NFT的市场信息');
          setLoading(false);
          return;
        }
        
        setItem(marketItem);
        
        // 获取NFT元数据
        const nftContract = getNFTContract(library, chainId, contractAddress);
        const tokenURI = await nftContract.tokenURI(tokenId);
        
        try {
          const response = await fetch(tokenURI);
          const metadata = await response.json();
          setMetadata(metadata);
        } catch (error) {
          console.error(`获取NFT元数据失败: ${tokenId}`, error);
          setMetadata({
            name: `NFT #${tokenId}`,
            description: '无法加载元数据',
            image: ''
          });
        }
        
        // 如果是拍卖，获取出价历史
        if (marketItem.auction) {
          const bids = await fetchBidHistory(library, chainId, marketItem.itemId);
          setBidHistory(bids);
        }
      } catch (error) {
        console.error('加载市场项目详情失败:', error);
        setError('加载市场项目详情失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadItemDetails();
    
    // 设置定时刷新
    const intervalId = setInterval(loadItemDetails, 30000); // 每30秒刷新一次
    
    return () => clearInterval(intervalId);
  }, [library, chainId, contractAddress, tokenId]);
  
  // 购买NFT
  const handleBuyNFT = async () => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (!item) {
      setError('找不到该NFT的市场信息');
      return;
    }
    
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      // 购买NFT
      const result = await createMarketSale(
        library,
        chainId,
        item.itemId,
        item.price
      );
      
      if (result.success) {
        setSuccess(`NFT购买成功！交易哈希: ${result.transactionHash}`);
        
        // 更新项目状态
        setTimeout(() => {
          navigate('/marketplace');
        }, 3000);
      } else {
        setError(`购买失败: ${result.error}`);
      }
    } catch (error) {
      console.error('购买NFT失败:', error);
      setError(error.message || '购买NFT时出错，请稍后再试');
    } finally {
      setActionLoading(false);
    }
  };
  
  // 出价
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (!item) {
      setError('找不到该NFT的市场信息');
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('请输入有效的出价金额');
      return;
    }
    
    // 计算最低出价
    const minBid = item.highestBid 
      ? (parseFloat(item.highestBid) * 1.05).toFixed(4) // 最低加价5%
      : item.price;
    
    if (parseFloat(bidAmount) < parseFloat(minBid)) {
      setError(`出价必须高于当前最高出价的5%，最低出价: ${minBid} ETH`);
      return;
    }
    
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      // 出价
      const result = await placeBid(
        library,
        chainId,
        item.itemId,
        bidAmount
      );
      
      if (result.success) {
        setSuccess(`出价成功！交易哈希: ${result.transactionHash}`);
        setBidAmount('');
        
        // 更新项目状态和出价历史
        setTimeout(async () => {
          const updatedItem = await fetchMarketItemByToken(library, chainId, contractAddress, tokenId);
          setItem(updatedItem);
          
          const bids = await fetchBidHistory(library, chainId, item.itemId);
          setBidHistory(bids);
        }, 2000);
      } else {
        setError(`出价失败: ${result.error}`);
      }
    } catch (error) {
      console.error('出价失败:', error);
      setError(error.message || '出价时出错，请稍后再试');
    } finally {
      setActionLoading(false);
    }
  };
  
  // 结束拍卖
  const handleEndAuction = async () => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (!item) {
      setError('找不到该NFT的市场信息');
      return;
    }
    
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      // 结束拍卖
      const result = await endAuction(
        library,
        chainId,
        item.itemId
      );
      
      if (result.success) {
        setSuccess(`拍卖结束成功！交易哈希: ${result.transactionHash}`);
        
        // 更新项目状态
        setTimeout(async () => {
          const updatedItem = await fetchMarketItemByToken(library, chainId, contractAddress, tokenId);
          setItem(updatedItem);
        }, 2000);
      } else {
        setError(`结束拍卖失败: ${result.error}`);
      }
    } catch (error) {
      console.error('结束拍卖失败:', error);
      setError(error.message || '结束拍卖时出错，请稍后再试');
    } finally {
      setActionLoading(false);
    }
  };
  
  // 领取拍卖品
  const handleClaimAuction = async () => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (!item) {
      setError('找不到该NFT的市场信息');
      return;
    }
    
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      // 领取拍卖品
      const result = await claimAuction(
        library,
        chainId,
        item.itemId
      );
      
      if (result.success) {
        setSuccess(`领取拍卖品成功！交易哈希: ${result.transactionHash}`);
        
        // 更新项目状态
        setTimeout(() => {
          navigate('/marketplace');
        }, 3000);
      } else {
        setError(`领取拍卖品失败: ${result.error}`);
      }
    } catch (error) {
      console.error('领取拍卖品失败:', error);
      setError(error.message || '领取拍卖品时出错，请稍后再试');
    } finally {
      setActionLoading(false);
    }
  };
  
  // 检查拍卖是否已结束
  const isAuctionEnded = () => {
    if (!item || !item.auction || !item.auctionEndTime) return false;
    return new Date() > item.auctionEndTime;
  };
  
  // 检查是否是卖家
  const isSeller = () => {
    return active && account && item && item.seller.toLowerCase() === account.toLowerCase();
  };
  
  // 检查是否是最高出价者
  const isHighestBidder = () => {
    return active && account && item && item.highestBidder && item.highestBidder.toLowerCase() === account.toLowerCase();
  };
  
  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };
  
  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };
  
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  if (error && !item) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!item || !metadata) {
    return <div className="error-message">无法加载NFT信息</div>;
  }
  
  return (
    <div className="nft-market-detail">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="detail-container">
        <div className="detail-image">
          <img src={metadata.image} alt={metadata.name} />
        </div>
        
        <div className="detail-info">
          <h2>{metadata.name}</h2>
          
          <p className="detail-description">{metadata.description}</p>
          
          <div className="detail-metadata">
            <p><strong>代币ID:</strong> {tokenId}</p>
            <p><strong>合约地址:</strong> {formatAddress(contractAddress)}</p>
            <p><strong>卖家:</strong> {formatAddress(item.seller)}</p>
            
            {item.auction ? (
              <>
                <p><strong>起始价格:</strong> {item.price} ETH</p>
                {item.highestBid && (
                  <p><strong>当前最高出价:</strong> {item.highestBid} ETH</p>
                )}
                {item.highestBidder && (
                  <p><strong>最高出价者:</strong> {formatAddress(item.highestBidder)}</p>
                )}
                <p>
                  <strong>拍卖状态:</strong> 
                  {isAuctionEnded() ? (
                    <span className="auction-ended">已结束</span>
                  ) : (
                    <span className="auction-active">进行中</span>
                  )}
                </p>
                <p><strong>结束时间:</strong> {formatTime(item.auctionEndTime)}</p>
              </>
            ) : (
              <p><strong>价格:</strong> {item.price} ETH</p>
            )}
          </div>
          
          {metadata.attributes && metadata.attributes.length > 0 && (
            <div className="detail-attributes">
              <h3>属性</h3>
              <div className="attributes-grid">
                {metadata.attributes.map((attr, index) => (
                  <div key={index} className="attribute-item">
                    <span className="attribute-type">{attr.trait_type}</span>
                    <span className="attribute-value">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="detail-actions">
            {!item.auction && !item.sold && !isSeller() && (
              <button 
                className="btn-primary"
                onClick={handleBuyNFT}
                disabled={actionLoading || !active}
              >
                {actionLoading ? '处理中...' : `购买 (${item.price} ETH)`}
              </button>
            )}
            
            {item.auction && !isAuctionEnded() && !isSeller() && (
              <div className="bid-form">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={item.highestBid 
                    ? (parseFloat(item.highestBid) * 1.05).toFixed(4) 
                    : item.price}
                  step="0.001"
                  placeholder={`最低出价: ${item.highestBid 
                    ? (parseFloat(item.highestBid) * 1.05).toFixed(4) 
                    : item.price} ETH`}
                />
                <button 
                  className="btn-secondary"
                  onClick={handlePlaceBid}
                  disabled={actionLoading || !active}
                >
                  {actionLoading ? '处理中...' : '出价'}
                </button>
              </div>
            )}
            
            {item.auction && isAuctionEnded() && isSeller() && (
              <button 
                className="btn-primary"
                onClick={handleEndAuction}
                disabled={actionLoading || !active}
              >
                {actionLoading ? '处理中...' : '结束拍卖'}
              </button>
            )}
            
            {item.auction && isAuctionEnded() && isHighestBidder() && (
              <button 
                className="btn-primary"
                onClick={handleClaimAuction}
                disabled={actionLoading || !active}
              >
                {actionLoading ? '处理中...' : '领取NFT'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {item.auction && bidHistory.length > 0 && (
        <div className="bid-history">
          <h3>出价历史</h3>
          <table className="bid-table">
            <thead>
              <tr>
                <th>出价者</th>
                <th>金额</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {bidHistory.map((bid, index) => (
                <tr key={index}>
                  <td>{formatAddress(bid.bidder)}</td>
                  <td>{bid.amount} ETH</td>
                  <td>{formatTime(bid.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NFTMarketDetail;
