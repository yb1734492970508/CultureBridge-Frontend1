import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { fetchMyListedItems, fetchMyPurchasedItems, cancelMarketItem } from '../../contracts/marketplace/CultureMarketplace';
import { getNFTContract } from '../../contracts/NFT/CultureNFT';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import '../../styles/blockchain.css';

const NFTMarketMyItems = () => {
  const { active, account, library, chainId } = useBlockchain();
  
  const [activeTab, setActiveTab] = useState('listed'); // listed, purchased
  const [listedItems, setListedItems] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 加载我的市场项目
  useEffect(() => {
    const loadMyItems = async () => {
      if (!active || !account || !library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        if (activeTab === 'listed') {
          // 获取我的上架项目
          const items = await fetchMyListedItems(library, chainId);
          
          // 获取每个NFT的元数据
          const itemsWithMetadata = await Promise.all(
            items.map(async (item) => {
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
          
          setListedItems(itemsWithMetadata);
        } else if (activeTab === 'purchased') {
          // 获取我的购买项目
          const items = await fetchMyPurchasedItems(library, chainId);
          
          // 获取每个NFT的元数据
          const itemsWithMetadata = await Promise.all(
            items.map(async (item) => {
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
          
          setPurchasedItems(itemsWithMetadata);
        }
      } catch (error) {
        console.error('加载我的市场项目失败:', error);
        setError('加载我的市场项目失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadMyItems();
  }, [active, account, library, chainId, activeTab]);
  
  // 取消上架
  const handleCancelListing = async (item) => {
    if (!active || !account || !library || !chainId) {
      setError('请先连接钱包');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // 取消上架
      const result = await cancelMarketItem(
        library,
        chainId,
        item.itemId
      );
      
      if (result.success) {
        setSuccess(`NFT下架成功！交易哈希: ${result.transactionHash}`);
        
        // 更新列表
        setListedItems(prevItems => prevItems.filter(i => i.itemId !== item.itemId));
      } else {
        setError(`下架失败: ${result.error}`);
      }
    } catch (error) {
      console.error('下架NFT失败:', error);
      setError(error.message || '下架NFT时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 检查拍卖是否已结束
  const isAuctionEnded = (item) => {
    if (!item.auction || !item.auctionEndTime) return false;
    return new Date() > item.auctionEndTime;
  };
  
  return (
    <div className="nft-market-my-items">
      <h2>我的NFT市场项目</h2>
      
      {!active && (
        <div className="connect-wallet-message">
          <p>请连接钱包以查看您的NFT市场项目</p>
        </div>
      )}
      
      {active && (
        <>
          {loading && <div className="loading">加载中...</div>}
          
          {error && <div className="error-message">{error}</div>}
          
          {success && <div className="success-message">{success}</div>}
          
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'listed' ? 'active' : ''}`}
              onClick={() => setActiveTab('listed')}
            >
              我的上架
            </button>
            <button 
              className={`tab-btn ${activeTab === 'purchased' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchased')}
            >
              我的购买
            </button>
          </div>
          
          {activeTab === 'listed' && (
            <div className="listed-items">
              {listedItems.length === 0 ? (
                <div className="no-items">
                  <p>您还没有上架任何NFT</p>
                </div>
              ) : (
                <div className="market-items-grid">
                  {listedItems.map(item => (
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
                        <p className="item-status">
                          状态: {item.sold ? '已售出' : '在售中'}
                        </p>
                      </div>
                      <div className="item-actions">
                        <Link 
                          to={`/marketplace/${item.nftContract}/${item.tokenId}`}
                          className="btn-secondary"
                        >
                          查看详情
                        </Link>
                        
                        {!item.sold && !isAuctionEnded(item) && (
                          <button 
                            className="btn-danger"
                            onClick={() => handleCancelListing(item)}
                            disabled={loading}
                          >
                            下架
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'purchased' && (
            <div className="purchased-items">
              {purchasedItems.length === 0 ? (
                <div className="no-items">
                  <p>您还没有购买任何NFT</p>
                </div>
              ) : (
                <div className="market-items-grid">
                  {purchasedItems.map(item => (
                    <div key={item.itemId} className="market-item-card">
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-info">
                        <h3>{item.name}</h3>
                        <p className="item-description">{item.description}</p>
                        <p className="item-price">
                          购买价格: {item.price} ETH
                        </p>
                        <p className="seller-info">
                          卖家: {item.seller.substring(0, 6)}...{item.seller.substring(38)}
                        </p>
                      </div>
                      <div className="item-actions">
                        <Link 
                          to={`/marketplace/${item.nftContract}/${item.tokenId}`}
                          className="btn-secondary"
                        >
                          查看详情
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NFTMarketMyItems;
