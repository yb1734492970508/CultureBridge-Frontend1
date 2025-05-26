import React, { useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { BlockchainContext } from '../../context/blockchain';
import './NFTDetailModal.css';

/**
 * NFT详情模态框组件
 * 显示NFT的详细信息，包括元数据、交易历史、所有权等
 */
const NFTDetailModal = ({ nft, isOpen, onClose, onBid, onPurchase, onShare, onToggleFavorite }) => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'history', 'properties'
  const [isOwner, setIsOwner] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareOptions, setShareOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  
  // 区块链上下文
  const { account, isConnected } = useContext(BlockchainContext);
  
  // 检查是否为NFT所有者
  useEffect(() => {
    if (nft && account) {
      setIsOwner(nft.owner === account);
    }
  }, [nft, account]);
  
  // 检查是否已收藏
  useEffect(() => {
    if (nft) {
      // 这里应该从本地存储或API检查是否已收藏
      const favorites = JSON.parse(localStorage.getItem('nftFavorites') || '[]');
      setIsFavorite(favorites.includes(nft.id));
    }
  }, [nft]);
  
  // 处理收藏切换
  const handleToggleFavorite = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    
    // 更新本地存储
    const favorites = JSON.parse(localStorage.getItem('nftFavorites') || '[]');
    if (newState) {
      if (!favorites.includes(nft.id)) {
        favorites.push(nft.id);
      }
    } else {
      const index = favorites.indexOf(nft.id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    localStorage.setItem('nftFavorites', JSON.stringify(favorites));
    
    // 通知父组件
    if (onToggleFavorite) {
      onToggleFavorite(nft.id, newState);
    }
  };
  
  // 处理分享选项显示
  const handleShareClick = () => {
    setShareOptions(!shareOptions);
  };
  
  // 处理链接复制
  const handleCopyLink = () => {
    const url = `${window.location.origin}/nft/${nft.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess('链接已复制！');
      setTimeout(() => setCopySuccess(''), 2000);
    }, (err) => {
      console.error('无法复制链接: ', err);
    });
  };
  
  // 处理社交媒体分享
  const handleShare = (platform) => {
    const url = encodeURIComponent(`${window.location.origin}/nft/${nft.id}`);
    const text = encodeURIComponent(`查看这个文化NFT: ${nft.name}`);
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'weibo':
        shareUrl = `http://service.weibo.com/share/share.php?url=${url}&title=${text}`;
        break;
      case 'wechat':
        // 微信分享通常需要生成二维码，这里简化处理
        alert('请截屏分享或复制链接到微信');
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
    setShareOptions(false);
    
    // 通知父组件
    if (onShare) {
      onShare(nft.id, platform);
    }
  };
  
  // 处理购买按钮点击
  const handlePurchaseClick = () => {
    if (onPurchase) {
      onPurchase(nft);
    }
  };
  
  // 处理竞价按钮点击
  const handleBidClick = () => {
    if (onBid) {
      onBid(nft);
    }
  };
  
  // 格式化日期
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // 如果模态框未打开，不渲染内容
  if (!isOpen || !nft) return null;
  
  return (
    <div className="nft-detail-modal-overlay" onClick={onClose}>
      <div className="nft-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>NFT 详情</h3>
          <div className="modal-actions">
            <button 
              className={`favorite-button ${isFavorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              title={isFavorite ? '取消收藏' : '添加到收藏'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
            <div className="share-container">
              <button 
                className="share-button"
                onClick={handleShareClick}
                title="分享"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {shareOptions && (
                <div className="share-options">
                  <button onClick={handleCopyLink} className="share-option">
                    复制链接
                  </button>
                  <button onClick={() => handleShare('twitter')} className="share-option">
                    Twitter
                  </button>
                  <button onClick={() => handleShare('facebook')} className="share-option">
                    Facebook
                  </button>
                  <button onClick={() => handleShare('weibo')} className="share-option">
                    微博
                  </button>
                  <button onClick={() => handleShare('wechat')} className="share-option">
                    微信
                  </button>
                  {copySuccess && <div className="copy-success">{copySuccess}</div>}
                </div>
              )}
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="modal-content">
          <div className="nft-preview-container">
            <div className="nft-image-container">
              <img src={nft.image} alt={nft.name} className="nft-image" />
              {nft.isAuction && (
                <div className="auction-badge">
                  拍卖中
                </div>
              )}
            </div>
            
            <div className="nft-action-buttons">
              {!isOwner && !nft.isAuction && (
                <button 
                  className="purchase-button"
                  onClick={handlePurchaseClick}
                  disabled={!isConnected}
                >
                  立即购买
                </button>
              )}
              
              {!isOwner && nft.isAuction && (
                <button 
                  className="bid-button"
                  onClick={handleBidClick}
                  disabled={!isConnected}
                >
                  参与竞拍
                </button>
              )}
              
              {isOwner && (
                <div className="owner-badge">
                  您拥有此NFT
                </div>
              )}
            </div>
          </div>
          
          <div className="nft-info-container">
            <div className="nft-tabs">
              <button 
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                详情
              </button>
              <button 
                className={`tab-button ${activeTab === 'properties' ? 'active' : ''}`}
                onClick={() => setActiveTab('properties')}
              >
                属性
              </button>
              <button 
                className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                历史
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'details' && (
                <div className="details-tab">
                  <h2 className="nft-title">{nft.name}</h2>
                  
                  <div className="nft-price-container">
                    <div className="price-label">价格:</div>
                    <div className="price-value">
                      {ethers.utils.formatEther(nft.price)} ETH
                      {nft.isAuction && <span className="auction-note">（当前最高出价）</span>}
                    </div>
                  </div>
                  
                  <div className="nft-creator">
                    <div className="creator-label">创作者:</div>
                    <div className="creator-value">{nft.creator}</div>
                  </div>
                  
                  <div className="nft-owner">
                    <div className="owner-label">当前所有者:</div>
                    <div className="owner-value">
                      {nft.seller === account ? '您' : nft.seller}
                    </div>
                  </div>
                  
                  {nft.isAuction && nft.auctionEndTime && (
                    <div className="auction-end-time">
                      <div className="time-label">拍卖结束时间:</div>
                      <div className="time-value">{formatDate(nft.auctionEndTime)}</div>
                    </div>
                  )}
                  
                  <div className="nft-description">
                    <h4>描述</h4>
                    <p>{nft.description}</p>
                  </div>
                  
                  <div className="nft-metadata">
                    <h4>元数据</h4>
                    <div className="metadata-item">
                      <span className="metadata-label">代币ID:</span>
                      <span className="metadata-value">{nft.tokenId}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">合约地址:</span>
                      <span className="metadata-value address">{nft.contractAddress}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">代币标准:</span>
                      <span className="metadata-value">ERC-721</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">区块链:</span>
                      <span className="metadata-value">以太坊</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">创建时间:</span>
                      <span className="metadata-value">{formatDate(nft.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'properties' && (
                <div className="properties-tab">
                  <h4>NFT 属性</h4>
                  
                  <div className="properties-grid">
                    <div className="property-item">
                      <div className="property-type">类别</div>
                      <div className="property-value">{nft.category}</div>
                      <div className="property-rarity">10% 拥有此特征</div>
                    </div>
                    
                    <div className="property-item">
                      <div className="property-type">文化起源</div>
                      <div className="property-value">中国</div>
                      <div className="property-rarity">15% 拥有此特征</div>
                    </div>
                    
                    <div className="property-item">
                      <div className="property-type">年代</div>
                      <div className="property-value">现代</div>
                      <div className="property-rarity">25% 拥有此特征</div>
                    </div>
                    
                    <div className="property-item">
                      <div className="property-type">材质</div>
                      <div className="property-value">数字</div>
                      <div className="property-rarity">40% 拥有此特征</div>
                    </div>
                    
                    <div className="property-item">
                      <div className="property-type">稀有度</div>
                      <div className="property-value">罕见</div>
                      <div className="property-rarity">5% 拥有此特征</div>
                    </div>
                    
                    <div className="property-item">
                      <div className="property-type">文化价值</div>
                      <div className="property-value">高</div>
                      <div className="property-rarity">8% 拥有此特征</div>
                    </div>
                  </div>
                  
                  <div className="nft-stats">
                    <h4>统计数据</h4>
                    
                    <div className="stat-item">
                      <div className="stat-label">查看次数:</div>
                      <div className="stat-value">1,245</div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-label">收藏次数:</div>
                      <div className="stat-value">87</div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-label">转手次数:</div>
                      <div className="stat-value">3</div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-label">首次上架:</div>
                      <div className="stat-value">{formatDate(nft.createdAt)}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'history' && (
                <div className="history-tab">
                  <h4>交易历史</h4>
                  
                  <div className="transaction-history">
                    <div className="transaction-item">
                      <div className="transaction-type mint">铸造</div>
                      <div className="transaction-details">
                        <div className="transaction-from">由 {nft.creator} 创建</div>
                        <div className="transaction-date">{formatDate(nft.createdAt - 86400000 * 30)}</div>
                      </div>
                    </div>
                    
                    <div className="transaction-item">
                      <div className="transaction-type list">上架</div>
                      <div className="transaction-details">
                        <div className="transaction-from">由 {nft.creator} 以 {ethers.utils.formatEther(nft.price)} ETH 上架</div>
                        <div className="transaction-date">{formatDate(nft.createdAt - 86400000 * 20)}</div>
                      </div>
                    </div>
                    
                    <div className="transaction-item">
                      <div className="transaction-type sale">出售</div>
                      <div className="transaction-details">
                        <div className="transaction-from">从 {nft.creator} 到 0x5678...9012</div>
                        <div className="transaction-price">{ethers.utils.formatEther(nft.price)} ETH</div>
                        <div className="transaction-date">{formatDate(nft.createdAt - 86400000 * 15)}</div>
                      </div>
                    </div>
                    
                    <div className="transaction-item">
                      <div className="transaction-type list">上架</div>
                      <div className="transaction-details">
                        <div className="transaction-from">由 0x5678...9012 以 {ethers.utils.formatEther(nft.price)} ETH 上架</div>
                        <div className="transaction-date">{formatDate(nft.createdAt - 86400000 * 10)}</div>
                      </div>
                    </div>
                    
                    <div className="transaction-item">
                      <div className="transaction-type sale">出售</div>
                      <div className="transaction-details">
                        <div className="transaction-from">从 0x5678...9012 到 {nft.seller}</div>
                        <div className="transaction-price">{ethers.utils.formatEther(nft.price)} ETH</div>
                        <div className="transaction-date">{formatDate(nft.createdAt - 86400000 * 5)}</div>
                      </div>
                    </div>
                    
                    {nft.isAuction && (
                      <div className="transaction-item">
                        <div className="transaction-type auction">拍卖</div>
                        <div className="transaction-details">
                          <div className="transaction-from">由 {nft.seller} 开始拍卖</div>
                          <div className="transaction-price">起拍价 {ethers.utils.formatEther(nft.price)} ETH</div>
                          <div className="transaction-date">{formatDate(nft.createdAt)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetailModal;
