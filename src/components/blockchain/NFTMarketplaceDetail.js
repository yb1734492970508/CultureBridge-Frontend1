import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { BlockchainContext } from '../../context/blockchain';
import './NFTMarketplace.css';

/**
 * NFT详情组件
 * 展示单个NFT的详细信息，包括购买/出价功能
 */
const NFTMarketplaceDetail = () => {
  // 获取路由参数
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 状态管理
  const [nft, setNft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  
  // 区块链上下文
  const { account, provider, isConnected } = useContext(BlockchainContext);
  
  // 加载NFT详情
  useEffect(() => {
    if (id) {
      fetchNFTDetails(id);
    }
  }, [id, provider]);
  
  // 获取NFT详情
  const fetchNFTDetails = async (nftId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 模拟从区块链获取数据
      // 实际实现中，这里应该调用市场合约获取NFT详情
      setTimeout(() => {
        const mockNFT = {
          id: nftId,
          name: '传统中国水墨画',
          description: '这幅作品融合了传统中国水墨画技法与现代数字艺术元素，展现了山水之间的和谐与宁静。艺术家通过细腻的笔触和独特的构图，传达出东方哲学中天人合一的境界。每一笔都蕴含着深厚的文化底蕴，是传统与现代完美结合的典范。',
          image: 'https://example.com/nft1.jpg',
          price: ethers.utils.parseEther('0.5'),
          seller: '0x1234567890123456789012345678901234567890',
          tokenId: 1,
          contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          isAuction: true,
          auctionEndTime: Date.now() + 86400000 * 2, // 2天后结束
          highestBid: ethers.utils.parseEther('0.5'),
          highestBidder: '0x2345678901234567890123456789012345678901',
          category: 'visual-art',
          creator: '张艺术家',
          createdAt: Date.now() - 86400000 * 5, // 5天前
          likes: 24,
          attributes: [
            { trait_type: '风格', value: '水墨' },
            { trait_type: '年代', value: '现代' },
            { trait_type: '材质', value: '数字' },
            { trait_type: '文化背景', value: '中国' }
          ],
          history: [
            { 
              type: 'mint', 
              from: '0x0000000000000000000000000000000000000000', 
              to: '0x1234567890123456789012345678901234567890',
              price: ethers.utils.parseEther('0'),
              timestamp: Date.now() - 86400000 * 10
            },
            { 
              type: 'list', 
              from: '0x1234567890123456789012345678901234567890', 
              to: '0x0000000000000000000000000000000000000000',
              price: ethers.utils.parseEther('0.5'),
              timestamp: Date.now() - 86400000 * 5
            },
            { 
              type: 'bid', 
              from: '0x2345678901234567890123456789012345678901', 
              to: '0x0000000000000000000000000000000000000000',
              price: ethers.utils.parseEther('0.5'),
              timestamp: Date.now() - 86400000 * 2
            }
          ]
        };
        
        setNft(mockNFT);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching NFT details:', err);
      setError('加载NFT详情失败，请稍后再试');
      setIsLoading(false);
    }
  };
  
  // 处理购买NFT
  const handleBuyNFT = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }
    
    try {
      setIsProcessing(true);
      setTransactionStatus('正在处理购买交易...');
      
      // 模拟区块链交易
      // 实际实现中，这里应该调用市场合约的购买方法
      setTimeout(() => {
        setTransactionStatus('购买成功！NFT已转入您的钱包');
        setIsProcessing(false);
        setShowBuyModal(false);
        
        // 更新NFT状态
        setNft(prev => ({
          ...prev,
          seller: account,
          history: [
            ...prev.history,
            {
              type: 'sale',
              from: prev.seller,
              to: account,
              price: prev.price,
              timestamp: Date.now()
            }
          ]
        }));
      }, 2000);
      
    } catch (err) {
      console.error('Error buying NFT:', err);
      setTransactionStatus('购买失败，请稍后再试');
      setIsProcessing(false);
    }
  };
  
  // 处理NFT出价
  const handlePlaceBid = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('请输入有效的出价金额');
      return;
    }
    
    const bidAmountWei = ethers.utils.parseEther(bidAmount);
    const currentHighestBid = nft.highestBid;
    
    if (bidAmountWei.lte(currentHighestBid)) {
      alert('出价必须高于当前最高出价');
      return;
    }
    
    try {
      setIsProcessing(true);
      setTransactionStatus('正在处理出价交易...');
      
      // 模拟区块链交易
      // 实际实现中，这里应该调用市场合约的出价方法
      setTimeout(() => {
        setTransactionStatus('出价成功！您现在是最高出价者');
        setIsProcessing(false);
        setShowBidModal(false);
        
        // 更新NFT状态
        setNft(prev => ({
          ...prev,
          highestBid: bidAmountWei,
          highestBidder: account,
          history: [
            ...prev.history,
            {
              type: 'bid',
              from: account,
              to: '0x0000000000000000000000000000000000000000',
              price: bidAmountWei,
              timestamp: Date.now()
            }
          ]
        }));
        
        setBidAmount('');
      }, 2000);
      
    } catch (err) {
      console.error('Error placing bid:', err);
      setTransactionStatus('出价失败，请稍后再试');
      setIsProcessing(false);
    }
  };
  
  // 格式化ETH价格显示
  const formatPrice = (price) => {
    return parseFloat(ethers.utils.formatEther(price)).toFixed(3);
  };
  
  // 格式化时间显示
  const formatTimeLeft = (timestamp) => {
    const now = Date.now();
    const timeLeft = timestamp - now;
    
    if (timeLeft <= 0) return '已结束';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}天 ${hours}小时`;
    if (hours > 0) return `${hours}小时 ${minutes}分钟`;
    return `${minutes}分钟`;
  };
  
  // 格式化时间戳为日期
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };
  
  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="nft-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载NFT详情...</p>
        </div>
      </div>
    );
  }
  
  // 渲染错误状态
  if (error) {
    return (
      <div className="nft-detail-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button className="retry-button" onClick={() => fetchNFTDetails(id)}>
            重试
          </button>
          <button className="back-button" onClick={() => navigate('/marketplace')}>
            返回市场
          </button>
        </div>
      </div>
    );
  }
  
  // 渲染NFT未找到状态
  if (!nft) {
    return (
      <div className="nft-detail-container">
        <div className="not-found-container">
          <h2>NFT未找到</h2>
          <p>无法找到ID为 {id} 的NFT</p>
          <button className="back-button" onClick={() => navigate('/marketplace')}>
            返回市场
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="nft-detail-container">
      <div className="nft-detail-header">
        <button className="back-button" onClick={() => navigate('/marketplace')}>
          ← 返回市场
        </button>
        <h1 className="nft-detail-title">{nft.name}</h1>
      </div>
      
      <div className="nft-detail-content">
        <div className="nft-detail-image-container">
          <img src={nft.image} alt={nft.name} className="nft-detail-image" />
          <div className="nft-like-button detail-like">
            <span className="like-icon">♥</span>
            <span className="like-count">{nft.likes}</span>
          </div>
        </div>
        
        <div className="nft-detail-info">
          <div className="nft-creator-section">
            <h3>创作者</h3>
            <div className="creator-info">
              <div className="creator-avatar">
                {nft.creator.charAt(0)}
              </div>
              <div className="creator-name">{nft.creator}</div>
            </div>
          </div>
          
          <div className="nft-description-section">
            <h3>描述</h3>
            <p className="nft-description">{nft.description}</p>
          </div>
          
          <div className="nft-attributes-section">
            <h3>属性</h3>
            <div className="attributes-grid">
              {nft.attributes.map((attr, index) => (
                <div key={index} className="attribute-item">
                  <div className="attribute-type">{attr.trait_type}</div>
                  <div className="attribute-value">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="nft-price-section">
            <h3>{nft.isAuction ? '当前出价' : '价格'}</h3>
            <div className="price-display">
              <span className="eth-icon">Ξ</span>
              <span className="price-value">{formatPrice(nft.isAuction ? nft.highestBid : nft.price)}</span>
              <span className="price-usd">(约 $1,500 USD)</span>
            </div>
            
            {nft.isAuction && (
              <div className="auction-info">
                <div className="auction-time-left">
                  <span className="time-label">拍卖结束时间:</span>
                  <span className="time-value">{formatTimeLeft(nft.auctionEndTime)}</span>
                </div>
                <div className="highest-bidder">
                  <span className="bidder-label">最高出价者:</span>
                  <span className="bidder-address">{formatAddress(nft.highestBidder)}</span>
                </div>
              </div>
            )}
            
            <div className="nft-actions">
              {nft.isAuction ? (
                <button 
                  className="bid-button"
                  onClick={() => setShowBidModal(true)}
                  disabled={isProcessing}
                >
                  出价
                </button>
              ) : (
                <button 
                  className="buy-button"
                  onClick={() => setShowBuyModal(true)}
                  disabled={isProcessing}
                >
                  立即购买
                </button>
              )}
            </div>
          </div>
          
          <div className="nft-details-section">
            <h3>详细信息</h3>
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">合约地址</div>
                <div className="detail-value address">{formatAddress(nft.contractAddress)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">代币ID</div>
                <div className="detail-value">{nft.tokenId}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">代币标准</div>
                <div className="detail-value">ERC-721</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">区块链</div>
                <div className="detail-value">以太坊</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">创建时间</div>
                <div className="detail-value">{formatDate(nft.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="nft-history-section">
        <h2>交易历史</h2>
        <div className="history-table">
          <div className="history-header">
            <div className="history-cell">事件</div>
            <div className="history-cell">价格</div>
            <div className="history-cell">来源</div>
            <div className="history-cell">目标</div>
            <div className="history-cell">时间</div>
          </div>
          {nft.history.map((event, index) => (
            <div key={index} className="history-row">
              <div className="history-cell event-type">
                <span className={`event-badge ${event.type}`}>
                  {event.type === 'mint' ? '铸造' : 
                   event.type === 'list' ? '上架' : 
                   event.type === 'sale' ? '售出' : '出价'}
                </span>
              </div>
              <div className="history-cell">
                <span className="eth-icon">Ξ</span>
                <span>{formatPrice(event.price)}</span>
              </div>
              <div className="history-cell address">{formatAddress(event.from)}</div>
              <div className="history-cell address">{formatAddress(event.to)}</div>
              <div className="history-cell">{formatDate(event.timestamp)}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 出价模态框 */}
      {showBidModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>出价</h3>
              <button 
                className="close-button"
                onClick={() => !isProcessing && setShowBidModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="nft-preview">
                <img src={nft.image} alt={nft.name} className="modal-nft-image" />
                <div className="modal-nft-info">
                  <h4>{nft.name}</h4>
                  <p>当前最高出价: {formatPrice(nft.highestBid)} ETH</p>
                </div>
              </div>
              
              <div className="bid-form">
                <div className="form-group">
                  <label>您的出价 (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    min={parseFloat(formatPrice(nft.highestBid)) + 0.001}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    disabled={isProcessing}
                    className="bid-input"
                  />
                </div>
                
                {transactionStatus && (
                  <div className="transaction-status">
                    {transactionStatus}
                  </div>
                )}
                
                <div className="modal-actions">
                  <button
                    className="cancel-button"
                    onClick={() => !isProcessing && setShowBidModal(false)}
                    disabled={isProcessing}
                  >
                    取消
                  </button>
                  <button
                    className="confirm-button"
                    onClick={handlePlaceBid}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '处理中...' : '确认出价'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 购买模态框 */}
      {showBuyModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>购买NFT</h3>
              <button 
                className="close-button"
                onClick={() => !isProcessing && setShowBuyModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="nft-preview">
                <img src={nft.image} alt={nft.name} className="modal-nft-image" />
                <div className="modal-nft-info">
                  <h4>{nft.name}</h4>
                  <p>价格: {formatPrice(nft.price)} ETH</p>
                </div>
              </div>
              
              <div className="purchase-summary">
                <div className="summary-item">
                  <span>NFT价格</span>
                  <span>{formatPrice(nft.price)} ETH</span>
                </div>
                <div className="summary-item">
                  <span>平台费用 (2.5%)</span>
                  <span>{(parseFloat(formatPrice(nft.price)) * 0.025).toFixed(3)} ETH</span>
                </div>
                <div className="summary-item total">
                  <span>总计</span>
                  <span>{(parseFloat(formatPrice(nft.price)) * 1.025).toFixed(3)} ETH</span>
                </div>
              </div>
              
              {transactionStatus && (
                <div className="transaction-status">
                  {transactionStatus}
                </div>
              )}
              
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => !isProcessing && setShowBuyModal(false)}
                  disabled={isProcessing}
                >
                  取消
                </button>
                <button
                  className="confirm-button"
                  onClick={handleBuyNFT}
                  disabled={isProcessing}
                >
                  {isProcessing ? '处理中...' : '确认购买'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMarketplaceDetail;
