import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain';
import { ethers } from 'ethers';
import './NFTGallery.css';

// NFT合约ABI（简化版，实际使用时需要完整ABI）
const NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

// 文化资产NFT合约地址（测试网）
const NFT_CONTRACT_ADDRESS = "0x8C3bFe3530e92E2B9e8e05a7B97A61AaF6ae8618";

/**
 * NFT画廊组件
 * 展示用户拥有的文化资产NFT
 */
const NFTGallery = () => {
  const { active, account, library } = useBlockchain();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contractInfo, setContractInfo] = useState({ name: '', symbol: '' });

  // 获取NFT元数据
  const fetchNFTMetadata = async (tokenURI) => {
    try {
      // 处理IPFS URI
      if (tokenURI.startsWith('ipfs://')) {
        tokenURI = `https://ipfs.io/ipfs/${tokenURI.split('ipfs://')[1]}`;
      }
      
      const response = await fetch(tokenURI);
      if (!response.ok) throw new Error('获取NFT元数据失败');
      return await response.json();
    } catch (error) {
      console.error('获取NFT元数据错误:', error);
      return { name: '未知NFT', description: '无法加载元数据', image: '' };
    }
  };

  // 加载用户的NFT
  const loadUserNFTs = async () => {
    if (!active || !account || !library) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_ABI,
        library
      );
      
      // 获取合约基本信息
      const name = await nftContract.name();
      const symbol = await nftContract.symbol();
      setContractInfo({ name, symbol });
      
      // 获取用户拥有的NFT数量
      const balance = await nftContract.balanceOf(account);
      const balanceNumber = balance.toNumber();
      
      // 获取每个NFT的详细信息
      const nftPromises = [];
      for (let i = 0; i < balanceNumber; i++) {
        nftPromises.push((async () => {
          try {
            // 获取tokenId
            const tokenId = await nftContract.tokenOfOwnerByIndex(account, i);
            
            // 获取tokenURI
            const tokenURI = await nftContract.tokenURI(tokenId);
            
            // 获取元数据
            const metadata = await fetchNFTMetadata(tokenURI);
            
            return {
              id: tokenId.toString(),
              name: metadata.name || `${contractInfo.symbol} #${tokenId}`,
              description: metadata.description || '无描述',
              image: metadata.image || '',
              attributes: metadata.attributes || []
            };
          } catch (error) {
            console.error(`获取NFT #${i}失败:`, error);
            return null;
          }
        })());
      }
      
      const nftResults = await Promise.all(nftPromises);
      setNfts(nftResults.filter(nft => nft !== null));
    } catch (error) {
      console.error('加载NFT失败:', error);
      setError('加载NFT时出错，请确保您已连接到正确的网络');
    } finally {
      setLoading(false);
    }
  };

  // 当账户或连接状态变化时重新加载NFT
  useEffect(() => {
    loadUserNFTs();
  }, [active, account, library]);

  // 渲染NFT卡片
  const renderNFTCard = (nft) => {
    return (
      <div className="nft-card" key={nft.id}>
        <div className="nft-image-container">
          {nft.image ? (
            <img 
              src={nft.image.startsWith('ipfs://') 
                ? `https://ipfs.io/ipfs/${nft.image.split('ipfs://')[1]}`
                : nft.image
              } 
              alt={nft.name} 
              className="nft-image"
            />
          ) : (
            <div className="nft-image-placeholder">无图片</div>
          )}
        </div>
        <div className="nft-info">
          <h3 className="nft-name">{nft.name}</h3>
          <p className="nft-description">{nft.description}</p>
          <div className="nft-attributes">
            {nft.attributes && nft.attributes.map((attr, index) => (
              <span className="nft-attribute" key={index}>
                {attr.trait_type}: {attr.value}
              </span>
            ))}
          </div>
          <div className="nft-id">ID: {nft.id}</div>
        </div>
      </div>
    );
  };

  // 渲染组件
  return (
    <div className="nft-gallery">
      <div className="nft-gallery-header">
        <h2>我的文化资产</h2>
        {active && account && (
          <div className="nft-contract-info">
            <span>{contractInfo.name} ({contractInfo.symbol})</span>
          </div>
        )}
        <button 
          className="refresh-nfts-btn" 
          onClick={loadUserNFTs} 
          disabled={loading || !active}
        >
          {loading ? '加载中...' : '刷新'}
        </button>
      </div>
      
      {!active ? (
        <div className="nft-gallery-message">
          <p>请连接您的钱包以查看您的文化资产NFT</p>
        </div>
      ) : loading ? (
        <div className="nft-gallery-loading">
          <p>正在加载您的NFT...</p>
        </div>
      ) : error ? (
        <div className="nft-gallery-error">
          <p>{error}</p>
        </div>
      ) : nfts.length === 0 ? (
        <div className="nft-gallery-empty">
          <p>您还没有任何文化资产NFT</p>
          <button className="create-nft-btn">创建我的第一个文化资产</button>
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
