import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BlockchainContext } from '../../context/blockchain';
import { NFTMarketplaceProvider } from '../../context/blockchain/NFTMarketplaceContext';
import NFTMarketplace from './NFTMarketplace';
import NFTMarketplaceDetail from './NFTMarketplaceDetail';
import NFTListingForm from './NFTListingForm';
import NFTFavorites from './NFTFavorites';

/**
 * NFT市场集成组件
 * 整合NFT市场相关路由和上下文提供者
 */
const NFTMarketplaceIntegration = () => {
  // 区块链上下文
  const { isConnected, account } = useContext(BlockchainContext);
  
  // 检查钱包连接状态
  useEffect(() => {
    if (!isConnected) {
      console.log('请连接钱包以使用NFT市场功能');
    } else {
      console.log(`钱包已连接: ${account}`);
    }
  }, [isConnected, account]);
  
  return (
    <NFTMarketplaceProvider>
      <div className="nft-marketplace-integration">
        <Routes>
          <Route path="/" element={<NFTMarketplace />} />
          <Route path="/detail/:id" element={<NFTMarketplaceDetail />} />
          <Route path="/list" element={<NFTListingForm />} />
          <Route path="/favorites" element={<NFTFavorites />} />
        </Routes>
      </div>
    </NFTMarketplaceProvider>
  );
};

export default NFTMarketplaceIntegration;
