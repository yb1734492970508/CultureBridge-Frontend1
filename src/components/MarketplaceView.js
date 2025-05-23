import React, { useState, useEffect } from 'react';
import web3Service from '../services/web3Service';

/**
 * 市场组件
 * 提供资产挂单、购买和交易历史查询功能
 */
const MarketplaceView = ({ account }) => {
  const [activeListings, setActiveListings] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [error, setError] = useState(null);
  const [userAssets, setUserAssets] = useState([]);
  
  // 挂单表单数据
  const [listingForm, setListingForm] = useState({
    tokenId: '',
    price: '',
    description: ''
  });

  // 当账户变化时加载市场数据和用户资产
  useEffect(() => {
    if (account) {
      loadMarketData();
      loadUserAssets();
    } else {
      setActiveListings([]);
      setTransactionHistory([]);
      setUserAssets([]);
    }
  }, [account]);

  // 加载市场数据
  const loadMarketData = async () => {
    if (!account) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 加载活跃挂单
      const listings = await web3Service.getActiveListings(0, 20);
      setActiveListings(listings);
      
      // 加载交易历史
      const history = await web3Service.getTransactionHistory(0, 20);
      setTransactionHistory(history);
    } catch (err) {
      console.error('获取市场数据失败:', err);
      setError('获取市场数据失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 加载用户资产
  const loadUserAssets = async () => {
    if (!account) return;
    
    try {
      const assets = await web3Service.getUserAssets();
      setUserAssets(assets);
    } catch (err) {
      console.error('获取用户资产失败:', err);
    }
  };

  // 处理挂单表单输入变化
  const handleListingInputChange = (e) => {
    const { name, value } = e.target;
    setListingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 挂单出售资产
  const handleListAsset = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError('请先连接钱包');
      return;
    }
    
    setIsListing(true);
    setError(null);
    
    try {
      await web3Service.listAsset(
        listingForm.tokenId,
        listingForm.price,
        listingForm.description
      );
      
      // 挂单成功后重置表单并重新加载市场数据
      setListingForm({
        tokenId: '',
        price: '',
        description: ''
      });
      
      await loadMarketData();
    } catch (err) {
      console.error('资产挂单失败:', err);
      setError('资产挂单失败，请稍后再试');
    } finally {
      setIsListing(false);
    }
  };

  // 购买资产
  const handleBuyAsset = async (tokenId) => {
    if (!account) {
      setError('请先连接钱包');
      return;
    }
    
    setIsBuying(true);
    setError(null);
    
    try {
      await web3Service.buyAsset(tokenId);
      
      // 购买成功后重新加载市场数据
      await loadMarketData();
      await loadUserAssets();
    } catch (err) {
      console.error('购买资产失败:', err);
      setError('购买资产失败，请稍后再试');
    } finally {
      setIsBuying(false);
    }
  };

  // 如果未连接钱包，显示提示信息
  if (!account) {
    return (
      <div className="marketplace">
        <div className="notice">请先连接钱包以访问市场功能</div>
      </div>
    );
  }

  return (
    <div className="marketplace">
      <h2>文化资产市场</h2>
      
      <div className="list-asset">
        <h3>挂单出售资产</h3>
        <form onSubmit={handleListAsset}>
          <div className="form-group">
            <label htmlFor="tokenId">资产ID</label>
            <select
              id="tokenId"
              name="tokenId"
              value={listingForm.tokenId}
              onChange={handleListingInputChange}
              required
            >
              <option value="">请选择资产</option>
              {userAssets.map(assetId => (
                <option key={assetId} value={assetId}>
                  资产 #{assetId}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="price">价格 (CBT)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={listingForm.price}
              onChange={handleListingInputChange}
              min="0.000001"
              step="0.000001"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">描述</label>
            <textarea
              id="description"
              name="description"
              value={listingForm.description}
              onChange={handleListingInputChange}
              rows="3"
              required
            />
          </div>
          <button 
            type="submit" 
            className="list-button"
            disabled={isListing || userAssets.length === 0}
          >
            {isListing ? '挂单中...' : '挂单出售'}
          </button>
        </form>
      </div>
      
      <div className="active-listings">
        <h3>活跃挂单</h3>
        
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : activeListings.length > 0 ? (
          <div className="listings-list">
            {activeListings.map((listing, index) => (
              <div key={index} className="listing-item">
                <div className="listing-info">
                  <div className="info-item">
                    <span className="label">资产ID:</span>
                    <span className="value">{listing.tokenId}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">卖家:</span>
                    <span className="value">{`${listing.seller.substring(0, 6)}...${listing.seller.substring(listing.seller.length - 4)}`}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">价格:</span>
                    <span className="value">{listing.price} CBT</span>
                  </div>
                </div>
                <button 
                  className="buy-button"
                  onClick={() => handleBuyAsset(listing.tokenId)}
                  disabled={isBuying || listing.seller.toLowerCase() === account.toLowerCase()}
                >
                  {isBuying ? '购买中...' : '购买'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-listings">当前没有活跃挂单</div>
        )}
      </div>
      
      <div className="transaction-history">
        <h3>交易历史</h3>
        
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : transactionHistory.length > 0 ? (
          <div className="history-list">
            {transactionHistory.map((transaction, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-info">
                  <div className="info-item">
                    <span className="label">资产ID:</span>
                    <span className="value">{transaction.tokenId}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">卖家:</span>
                    <span className="value">{`${transaction.seller.substring(0, 6)}...${transaction.seller.substring(transaction.seller.length - 4)}`}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">买家:</span>
                    <span className="value">{`${transaction.buyer.substring(0, 6)}...${transaction.buyer.substring(transaction.buyer.length - 4)}`}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">价格:</span>
                    <span className="value">{transaction.price} CBT</span>
                  </div>
                  <div className="info-item">
                    <span className="label">时间:</span>
                    <span className="value">
                      {new Date(parseInt(transaction.timestamp) * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-history">暂无交易历史</div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default MarketplaceView;
