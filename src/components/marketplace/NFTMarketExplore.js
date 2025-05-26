import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { fetchMarketItems, createMarketSale, placeBid } from '../../contracts/marketplace/CultureMarketplace';
import { getNFTContract } from '../../contracts/NFT/CultureNFT';
import { ethers } from 'ethers';
import '../../styles/blockchain.css';

const NFTMarketExplore = () => {
  const { active, account, library, chainId } = useBlockchain();
  
  const [marketItems, setMarketItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, fixed, auction
  
  // 加载市场项目
  useEffect(() => {
    const loadMarketItems = async () => {
      if (!library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const items = await fetchMarketItems(library, chainId);
        
        // 过滤掉已售出的项目
        const activeItems = items.filter(item => !item.sold);
        
        // 获取每个NFT的元数据
        const itemsWithMetadata = await Promise.all(
          activeItems.map(async (item) => {
            const nftContract = getNFTContract(library, chainId, item.nftContract);
            const tokenURI = await nftContract.tokenURI(item.tokenId);
            
            // 获取元数据
            let metadata = {};
            try {
              const response = await fetch(tokenURI);
              metadata = await response.json();
            } catch (error) {
              console.error(`获取NFT元数据失败: ${item.tokenId}`, error);
              metadata = {
                name: `NFT #${item.tokenId}`,
                description: '无法加载元数据',
                image: ''
              };
            }
            
            return {
              ...item,
              name: metadata.name,
              description: metadata.description,
              image: metadata.image,
              attributes: metadata.attributes || []
            };
          })
        );
        
        setMarketItems(itemsWithMetadata);
      } catch (error) {
        console.error('加载市场项目失败:', error);
        setError('加载市场项目失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadMarketItems();
    
    // 设置定时刷新
    const intervalId = setInterval(loadMarketItems, 60000); // 每分钟刷新一次
    
    return () => clearInterval(intervalId);
  }, [library, chainId]);
  
  // 购买NFT
  const handleBuyNFT = async (item) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    try {
      setLoading(true);
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
        
        // 更新市场项目列表
        setMarketItems(prevItems => prevItems.filter(i => i.itemId !== item.itemId));
      } else {
        setError(`购买失败: ${result.error}`);
      }
    } catch (error) {
      console.error('购买NFT失败:', error);
      setError(error.message || '购买NFT时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 出价
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    if (!selectedItem) {
      setError('请选择要出价的NFT');
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('请输入有效的出价金额');
      return;
    }
    
    // 计算最低出价
    const minBid = selectedItem.highestBid 
      ? (parseFloat(selectedItem.highestBid) * 1.05).toFixed(4) // 最低加价5%
      : selectedItem.price;
    
    if (parseFloat(bidAmount) < parseFloat(minBid)) {
      setError(`出价必须高于当前最高出价的5%，最低出价: ${minBid} ETH`);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // 出价
      const result = await placeBid(
        library,
        chainId,
        selectedItem.itemId,
        bidAmount
      );
      
      if (result.success) {
        setSuccess(`出价成功！交易哈希: ${result.transactionHash}`);
        setShowBidModal(false);
        setBidAmount('');
        
        // 更新市场项目列表中的出价信息
        setMarketItems(prevItems => prevItems.map(item => {
          if (item.itemId === selectedItem.itemId) {
            return {
              ...item,
              highestBid: bidAmount,
              highestBidder: account
            };
          }
          return item;
        }));
      } else {
        setError(`出价失败: ${result.error}`);
      }
    } catch (error) {
      console.error('出价失败:', error);
      setError(error.message || '出价时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 打开出价模态框
  const openBidModal = (item) => {
    setSelectedItem(item);
    setBidAmount('');
    setShowBidModal(true);
  };
  
  // 关闭出价模态框
  const closeBidModal = () => {
    setShowBidModal(false);
    setSelectedItem(null);
    setBidAmount('');
  };
  
  // 过滤市场项目
  const filteredItems = marketItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'fixed') return !item.auction;
    if (filter === 'auction') return item.auction;
    return true;
  });
  
  // 检查拍卖是否已结束
  const isAuctionEnded = (item) => {
    if (!item.auction || !item.auctionEndTime) return false;
    return new Date() > item.auctionEndTime;
  };
  
  return (
    <div className="nft-market-explore">
      <h2>NFT市场 - 浏览</h2>
      
      {loading && <div className="loading">加载中...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {success && <div className="success-message">{success}</div>}
      
      <div className="filter-controls">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
        <button 
          className={`filter-btn ${filter === 'fixed' ? 'active' : ''}`}
          onClick={() => setFilter('fixed')}
        >
          固定价格
        </button>
        <button 
          className={`filter-btn ${filter === 'auction' ? 'active' : ''}`}
          onClick={() => setFilter('auction')}
        >
          拍卖
        </button>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="no-items">
          <p>暂无可用的NFT</p>
        </div>
      ) : (
        <div className="market-items-grid">
          {filteredItems.map(item => (
            <div key={item.itemId} className="market-item-card">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <p className="item-price">
                  价格: {item.price} ETH
                  {item.auction && item.highestBid && (
                    <span className="highest-bid"> (当前最高出价: {item.highestBid} ETH)</span>
                  )}
                </p>
                {item.auction && (
                  <p className="auction-info">
                    {isAuctionEnded(item) ? (
                      <span className="auction-ended">拍卖已结束</span>
                    ) : (
                      <span className="auction-time">
                        结束时间: {item.auctionEndTime.toLocaleString()}
                      </span>
                    )}
                  </p>
                )}
                <p className="seller-info">卖家: {item.seller.substring(0, 6)}...{item.seller.substring(38)}</p>
              </div>
              <div className="item-actions">
                {!item.auction && (
                  <button 
                    className="btn-primary"
                    onClick={() => handleBuyNFT(item)}
                    disabled={loading || !active}
                  >
                    立即购买
                  </button>
                )}
                
                {item.auction && !isAuctionEnded(item) && (
                  <button 
                    className="btn-secondary"
                    onClick={() => openBidModal(item)}
                    disabled={loading || !active}
                  >
                    出价
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 出价模态框 */}
      {showBidModal && selectedItem && (
        <div className="bid-modal">
          <div className="bid-modal-content">
            <span className="close" onClick={closeBidModal}>&times;</span>
            <h3>为 {selectedItem.name} 出价</h3>
            
            <div className="item-image">
              <img src={selectedItem.image} alt={selectedItem.name} />
            </div>
            
            <p className="current-price">
              当前价格: {selectedItem.price} ETH
              {selectedItem.highestBid && (
                <span> (当前最高出价: {selectedItem.highestBid} ETH)</span>
              )}
            </p>
            
            <p className="min-bid">
              最低出价: {selectedItem.highestBid 
                ? (parseFloat(selectedItem.highestBid) * 1.05).toFixed(4) 
                : selectedItem.price} ETH
            </p>
            
            <form onSubmit={handlePlaceBid}>
              <div className="form-group">
                <label htmlFor="bidAmount">您的出价 (ETH)</label>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={selectedItem.highestBid 
                    ? (parseFloat(selectedItem.highestBid) * 1.05).toFixed(4) 
                    : selectedItem.price}
                  step="0.001"
                  required
                />
              </div>
              
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '处理中...' : '确认出价'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMarketExplore;
