import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { createMarketItem } from '../../contracts/marketplace/CultureMarketplace';
import { getNFTContract } from '../../contracts/NFT/CultureNFT';
import { ethers } from 'ethers';
import '../../styles/blockchain.css';

const NFTMarketplace = () => {
  const { active, account, library, chainId } = useBlockchain();
  
  const [nfts, setNfts] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [price, setPrice] = useState('');
  const [isAuction, setIsAuction] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState(24); // 默认24小时
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 加载用户拥有的NFT
  useEffect(() => {
    const loadUserNFTs = async () => {
      if (!active || !account || !library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const nftContract = getNFTContract(library, chainId);
        
        // 获取用户拥有的NFT数量
        const balance = await nftContract.balanceOf(account);
        
        // 获取每个NFT的详情
        const userNFTs = [];
        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(account, i);
          const tokenURI = await nftContract.tokenURI(tokenId);
          
          // 获取元数据
          let metadata = {};
          try {
            const response = await fetch(tokenURI);
            metadata = await response.json();
          } catch (error) {
            console.error(`获取NFT元数据失败: ${tokenId}`, error);
            metadata = {
              name: `NFT #${tokenId}`,
              description: '无法加载元数据',
              image: ''
            };
          }
          
          userNFTs.push({
            tokenId: tokenId.toString(),
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            attributes: metadata.attributes || []
          });
        }
        
        setNfts(userNFTs);
      } catch (error) {
        console.error('加载用户NFT失败:', error);
        setError('加载用户NFT失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserNFTs();
  }, [active, account, library, chainId]);
  
  // 上架NFT
  const handleListNFT = async (e) => {
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
      setLoading(true);
      setError('');
      setSuccess('');
      
      const nftContract = getNFTContract(library, chainId);
      
      // 检查是否已授权市场合约
      const isApproved = await nftContract.isApprovedForAll(account, process.env.REACT_APP_MARKETPLACE_ADDRESS);
      
      if (!isApproved) {
        // 授权市场合约
        const approveTx = await nftContract.setApprovalForAll(process.env.REACT_APP_MARKETPLACE_ADDRESS, true);
        await approveTx.wait();
      }
      
      // 上架NFT
      const result = await createMarketItem(
        library,
        chainId,
        nftContract.address,
        selectedNFT.tokenId,
        price,
        isAuction,
        isAuction ? auctionDuration : 0
      );
      
      if (result.success) {
        setSuccess(`NFT上架成功！市场项目ID: ${result.itemId}`);
        
        // 重置表单
        setSelectedNFT(null);
        setPrice('');
        setIsAuction(false);
        setAuctionDuration(24);
        
        // 重新加载用户NFT
        // 这里可以优化为只移除已上架的NFT，而不是重新加载所有NFT
        const updatedNFTs = nfts.filter(nft => nft.tokenId !== selectedNFT.tokenId);
        setNfts(updatedNFTs);
      } else {
        setError(`上架失败: ${result.error}`);
      }
    } catch (error) {
      console.error('上架NFT失败:', error);
      setError(error.message || '上架NFT时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="nft-marketplace">
      <h2>NFT市场 - 上架您的NFT</h2>
      
      {!active && (
        <div className="connect-wallet-message">
          <p>请连接钱包以访问NFT市场功能</p>
        </div>
      )}
      
      {active && (
        <>
          {loading && <div className="loading">加载中...</div>}
          
          {error && <div className="error-message">{error}</div>}
          
          {success && <div className="success-message">{success}</div>}
          
          <div className="nft-list">
            <h3>您的NFT</h3>
            
            {nfts.length === 0 ? (
              <p>您还没有任何NFT，请先创建或获取NFT</p>
            ) : (
              <div className="nft-grid">
                {nfts.map(nft => (
                  <div 
                    key={nft.tokenId} 
                    className={`nft-card ${selectedNFT && selectedNFT.tokenId === nft.tokenId ? 'selected' : ''}`}
                    onClick={() => setSelectedNFT(nft)}
                  >
                    <div className="nft-image">
                      <img src={nft.image} alt={nft.name} />
                    </div>
                    <div className="nft-info">
                      <h4>{nft.name}</h4>
                      <p className="nft-id">ID: {nft.tokenId}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedNFT && (
            <div className="listing-form">
              <h3>上架NFT</h3>
              
              <div className="selected-nft">
                <div className="nft-image">
                  <img src={selectedNFT.image} alt={selectedNFT.name} />
                </div>
                <div className="nft-info">
                  <h4>{selectedNFT.name}</h4>
                  <p>{selectedNFT.description}</p>
                  <p className="nft-id">ID: {selectedNFT.tokenId}</p>
                </div>
              </div>
              
              <form onSubmit={handleListNFT}>
                <div className="form-group">
                  <label htmlFor="price">价格 (ETH)</label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.001"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="isAuction">销售类型</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="saleType"
                        checked={!isAuction}
                        onChange={() => setIsAuction(false)}
                      />
                      固定价格
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="saleType"
                        checked={isAuction}
                        onChange={() => setIsAuction(true)}
                      />
                      拍卖
                    </label>
                  </div>
                </div>
                
                {isAuction && (
                  <div className="form-group">
                    <label htmlFor="auctionDuration">拍卖持续时间 (小时)</label>
                    <select
                      id="auctionDuration"
                      value={auctionDuration}
                      onChange={(e) => setAuctionDuration(parseInt(e.target.value))}
                    >
                      <option value="1">1小时</option>
                      <option value="6">6小时</option>
                      <option value="12">12小时</option>
                      <option value="24">24小时</option>
                      <option value="48">48小时</option>
                      <option value="72">72小时</option>
                      <option value="168">7天</option>
                    </select>
                  </div>
                )}
                
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '处理中...' : '上架NFT'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NFTMarketplace;
