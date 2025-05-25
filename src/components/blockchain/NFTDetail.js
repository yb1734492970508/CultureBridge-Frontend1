import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { getNFTDetails, transferNFT } from '../../contracts/NFT/CultureNFT';

/**
 * NFT详情组件
 * 展示单个NFT的详细信息和交易功能
 */
const NFTDetail = ({ tokenId }) => {
  const { account, active, library, chainId } = useBlockchain();
  
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState('');
  const [transferError, setTransferError] = useState('');
  
  // 加载NFT详情
  useEffect(() => {
    const loadNFTDetails = async () => {
      if (!library || !chainId || !tokenId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const details = await getNFTDetails(library, chainId, tokenId);
        if (details) {
          setNft(details);
        } else {
          setError('无法加载NFT详情，可能不存在或已被转移');
        }
      } catch (error) {
        console.error('加载NFT详情失败:', error);
        setError('加载NFT详情时出错，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadNFTDetails();
  }, [library, chainId, tokenId]);
  
  // 处理NFT转移
  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!active || !account || !library || !chainId || !tokenId) {
      setTransferError('请先连接钱包');
      return;
    }
    
    if (!transferTo || !transferTo.startsWith('0x') || transferTo.length !== 42) {
      setTransferError('请输入有效的以太坊地址');
      return;
    }
    
    try {
      setIsTransferring(true);
      setTransferError('');
      setTransferSuccess('');
      
      const result = await transferNFT(library, chainId, transferTo, tokenId);
      
      if (result.success) {
        setTransferSuccess(`NFT已成功转移到地址: ${transferTo}`);
        setTransferTo('');
        
        // 重新加载NFT详情
        const details = await getNFTDetails(library, chainId, tokenId);
        if (details) {
          setNft(details);
        }
      } else {
        setTransferError(`转移失败: ${result.error}`);
      }
    } catch (error) {
      console.error('转移NFT失败:', error);
      setTransferError(`转移失败: ${error.message}`);
    } finally {
      setIsTransferring(false);
    }
  };
  
  // 检查当前用户是否是NFT所有者
  const isOwner = nft && active && account && nft.owner.toLowerCase() === account.toLowerCase();
  
  // 处理IPFS URL
  const getFormattedUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
    }
    return url;
  };
  
  if (loading) {
    return (
      <div className="nft-detail loading">
        <p>加载NFT详情中...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="nft-detail error">
        <h2>加载失败</h2>
        <p>{error}</p>
        <a href="/gallery" className="back-btn">返回画廊</a>
      </div>
    );
  }
  
  if (!nft) {
    return (
      <div className="nft-detail not-found">
        <h2>NFT不存在</h2>
        <p>找不到ID为 {tokenId} 的NFT</p>
        <a href="/gallery" className="back-btn">返回画廊</a>
      </div>
    );
  }
  
  const { metadata } = nft;
  const imageUrl = getFormattedUrl(metadata.image);
  
  return (
    <div className="nft-detail">
      <div className="nft-detail-header">
        <h2>{metadata.name || `NFT #${tokenId}`}</h2>
        <a href="/gallery" className="back-btn">返回画廊</a>
      </div>
      
      <div className="nft-detail-content">
        <div className="nft-media">
          {imageUrl && (
            imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm') ? (
              <video src={imageUrl} controls className="nft-video" />
            ) : imageUrl.endsWith('.mp3') || imageUrl.endsWith('.wav') ? (
              <div className="audio-container">
                <div className="audio-placeholder">
                  <i className="audio-icon">🎵</i>
                </div>
                <audio src={imageUrl} controls className="nft-audio" />
              </div>
            ) : (
              <img src={imageUrl} alt={metadata.name} className="nft-image" />
            )
          )}
        </div>
        
        <div className="nft-info">
          <div className="info-section">
            <h3>描述</h3>
            <p>{metadata.description || '无描述'}</p>
          </div>
          
          <div className="info-section">
            <h3>所有者</h3>
            <p className="owner-address">
              {nft.owner}
              {isOwner && <span className="owner-badge">（您）</span>}
            </p>
          </div>
          
          <div className="info-section">
            <h3>Token ID</h3>
            <p>{tokenId}</p>
          </div>
          
          {metadata.properties?.culture && (
            <div className="info-section">
              <h3>文化背景</h3>
              <p>{metadata.properties.culture}</p>
            </div>
          )}
          
          {metadata.properties?.category && (
            <div className="info-section">
              <h3>类别</h3>
              <p>{metadata.properties.category}</p>
            </div>
          )}
          
          {metadata.properties?.attributes && metadata.properties.attributes.length > 0 && (
            <div className="info-section">
              <h3>属性</h3>
              <div className="attributes-grid">
                {metadata.properties.attributes.map((attr, index) => (
                  <div key={index} className="attribute-item">
                    <span className="attribute-name">{attr.trait_type}</span>
                    <span className="attribute-value">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isOwner && (
            <div className="transfer-section">
              <h3>转移NFT</h3>
              
              {transferSuccess && (
                <div className="success-message">
                  <p>{transferSuccess}</p>
                </div>
              )}
              
              {transferError && (
                <div className="error-message">
                  <p>{transferError}</p>
                </div>
              )}
              
              <form onSubmit={handleTransfer}>
                <div className="form-group">
                  <label htmlFor="transferTo">接收者地址</label>
                  <input
                    type="text"
                    id="transferTo"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    placeholder="0x..."
                    disabled={isTransferring}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isTransferring || !active}
                  className="transfer-btn"
                >
                  {isTransferring ? '转移中...' : '转移NFT'}
                </button>
              </form>
            </div>
          )}
          
          <div className="blockchain-info">
            <h3>区块链信息</h3>
            <p>
              <strong>合约地址:</strong>{' '}
              <a
                href={`https://etherscan.io/token/${nft.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {nft.contractAddress}
              </a>
            </p>
            <p>
              <strong>Token标准:</strong> ERC-721
            </p>
            <p>
              <strong>区块链:</strong> {chainId === 1 ? '以太坊主网' : chainId === 11155111 ? 'Sepolia测试网' : chainId === 80001 ? 'Polygon Mumbai测试网' : '未知网络'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetail;
