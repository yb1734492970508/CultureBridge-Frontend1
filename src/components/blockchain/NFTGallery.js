import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { getUserNFTs } from '../../contracts/NFT/CultureNFT';

/**
 * NFT展示组件
 * 展示用户拥有的文化NFT
 */
const NFTGallery = () => {
  const { account, active, library, chainId } = useBlockchain();
  
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 加载用户NFT
  useEffect(() => {
    const loadUserNFTs = async () => {
      if (!active || !account || !library || !chainId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const userNFTs = await getUserNFTs(library, chainId, account);
        setNfts(userNFTs);
      } catch (error) {
        console.error('加载NFT失败:', error);
        setError('加载NFT时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserNFTs();
  }, [active, account, library, chainId]);
  
  // 刷新NFT列表
  const refreshNFTs = async () => {
    if (!active || !account || !library || !chainId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const userNFTs = await getUserNFTs(library, chainId, account);
      setNfts(userNFTs);
    } catch (error) {
      console.error('刷新NFT失败:', error);
      setError('刷新NFT时出错，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 渲染NFT卡片
  const renderNFTCard = (nft) => {
    const { tokenId, metadata } = nft;
    const { name, description, image } = metadata;
    
    // 处理IPFS图片URL
    let imageUrl = image;
    if (imageUrl && imageUrl.startsWith('ipfs://')) {
      imageUrl = `https://ipfs.io/ipfs/${imageUrl.replace('ipfs://', '')}`;
    }
    
    return (
      <div key={tokenId} className="nft-card">
        <div className="nft-image">
          {imageUrl && (
            imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm') ? (
              <video src={imageUrl} controls />
            ) : imageUrl.endsWith('.mp3') || imageUrl.endsWith('.wav') ? (
              <div className="audio-container">
                <audio src={imageUrl} controls />
              </div>
            ) : (
              <img src={imageUrl} alt={name} />
            )
          )}
        </div>
        
        <div className="nft-info">
          <h3>{name || `NFT #${tokenId}`}</h3>
          <p className="nft-description">{description || '无描述'}</p>
          
          <div className="nft-attributes">
            {metadata.properties?.attributes?.map((attr, index) => (
              <div key={index} className="nft-attribute">
                <span className="attribute-type">{attr.trait_type}:</span>
                <span className="attribute-value">{attr.value}</span>
              </div>
            ))}
          </div>
          
          <div className="nft-culture">
            {metadata.properties?.culture && (
              <div className="culture-tag">
                文化背景: {metadata.properties.culture}
              </div>
            )}
          </div>
          
          <a href={`/nft/${tokenId}`} className="view-details-btn">
            查看详情
          </a>
        </div>
      </div>
    );
  };
  
  return (
    <div className="nft-gallery">
      <div className="gallery-header">
        <h2>我的文化NFT收藏</h2>
        <button 
          onClick={refreshNFTs} 
          disabled={loading || !active}
          className="refresh-btn"
        >
          {loading ? '加载中...' : '刷新'}
        </button>
      </div>
      
      {!active && (
        <div className="wallet-warning">
          <p>请先连接钱包以查看您的NFT</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <p>加载NFT中...</p>
        </div>
      ) : active && nfts.length === 0 ? (
        <div className="empty-gallery">
          <p>您还没有任何文化NFT</p>
          <a href="/mint" className="create-nft-btn">创建您的第一个NFT</a>
        </div>
      ) : (
        <div className="nft-grid">
          {nfts.map(renderNFTCard)}
        </div>
      )}
    </div>
  );
};

export default NFTGallery;
