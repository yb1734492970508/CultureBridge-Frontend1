import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/blockchain/BlockchainContext';
import { useToken } from '../../context/token/TokenContext';
import AssetOverview from './AssetOverview';
import ChainSelector from './ChainSelector';
import AssetList from './AssetList';
import QuickActions from './QuickActions';
import './MultiChainAssetManager.css';

/**
 * 多链资产管理器组件
 * 提供统一的多链资产管理界面
 */
const MultiChainAssetManager = () => {
  const { account, chainId } = useBlockchain();
  const { balance, formatTokenAmount } = useToken();
  
  // 组件状态
  const [selectedChain, setSelectedChain] = useState('all');
  const [assets, setAssets] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceData, setPriceData] = useState({});

  // 支持的链
  const supportedChains = [
    { 
      id: 'all', 
      name: '全部链', 
      icon: '🌐', 
      chainId: null,
      color: '#6c757d'
    },
    { 
      id: 'ethereum', 
      name: 'Ethereum', 
      icon: '⟠', 
      chainId: '0x1',
      color: '#627eea'
    },
    { 
      id: 'bnb', 
      name: 'BNB Chain', 
      icon: '🟡', 
      chainId: '0x38',
      color: '#f3ba2f'
    },
    { 
      id: 'polygon', 
      name: 'Polygon', 
      icon: '🟣', 
      chainId: '0x89',
      color: '#8247e5'
    }
  ];

  // 模拟资产数据
  const mockAssets = [
    {
      chainId: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 2.5,
      price: 2000,
      value: 5000,
      change24h: 5.2,
      address: 'native',
      decimals: 18,
      icon: '⟠'
    },
    {
      chainId: 'ethereum',
      symbol: 'CBT',
      name: 'CultureBridge Token',
      balance: 1000,
      price: 0.5,
      value: 500,
      change24h: -2.1,
      address: '0x1234...5678',
      decimals: 18,
      icon: '🎭'
    },
    {
      chainId: 'bnb',
      symbol: 'BNB',
      name: 'BNB',
      balance: 5.0,
      price: 300,
      value: 1500,
      change24h: 3.8,
      address: 'native',
      decimals: 18,
      icon: '🟡'
    },
    {
      chainId: 'bnb',
      symbol: 'CBT',
      name: 'CultureBridge Token',
      balance: 2000,
      price: 0.48,
      value: 960,
      change24h: -1.5,
      address: '0xabcd...ef01',
      decimals: 18,
      icon: '🎭'
    },
    {
      chainId: 'polygon',
      symbol: 'MATIC',
      name: 'Polygon',
      balance: 1000,
      price: 0.8,
      value: 800,
      change24h: 7.2,
      address: 'native',
      decimals: 18,
      icon: '🟣'
    }
  ];

  // 初始化数据
  useEffect(() => {
    if (account) {
      loadAssets();
      loadPriceData();
    }
  }, [account, selectedChain]);

  // 加载资产数据
  const loadAssets = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 过滤资产
      let filteredAssets = mockAssets;
      if (selectedChain !== 'all') {
        filteredAssets = mockAssets.filter(asset => asset.chainId === selectedChain);
      }
      
      setAssets(filteredAssets);
      
      // 计算总价值
      const total = filteredAssets.reduce((sum, asset) => sum + asset.value, 0);
      setTotalValue(total);
      
    } catch (err) {
      setError('加载资产数据失败');
      console.error('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载价格数据
  const loadPriceData = async () => {
    try {
      // 模拟价格数据
      const prices = {
        ETH: { price: 2000, change24h: 5.2 },
        BNB: { price: 300, change24h: 3.8 },
        MATIC: { price: 0.8, change24h: 7.2 },
        CBT: { price: 0.5, change24h: -2.1 }
      };
      
      setPriceData(prices);
    } catch (err) {
      console.error('Error loading price data:', err);
    }
  };

  // 刷新资产
  const refreshAssets = () => {
    loadAssets();
    loadPriceData();
  };

  // 处理链选择
  const handleChainSelect = (chainId) => {
    setSelectedChain(chainId);
  };

  // 获取资产分布数据
  const getAssetDistribution = () => {
    const distribution = {};
    
    assets.forEach(asset => {
      const chainName = supportedChains.find(chain => chain.id === asset.chainId)?.name || asset.chainId;
      if (!distribution[chainName]) {
        distribution[chainName] = 0;
      }
      distribution[chainName] += asset.value;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue * 100).toFixed(1) : 0
    }));
  };

  // 获取总变化
  const getTotalChange = () => {
    if (assets.length === 0) return 0;
    
    const totalChange = assets.reduce((sum, asset) => {
      return sum + (asset.value * asset.change24h / 100);
    }, 0);
    
    return totalValue > 0 ? (totalChange / totalValue * 100) : 0;
  };

  return (
    <div className="multi-chain-asset-manager">
      <div className="asset-manager-header">
        <h2>多链资产管理</h2>
        <QuickActions onRefresh={refreshAssets} />
      </div>
      
      <AssetOverview 
        totalValue={totalValue}
        totalChange={getTotalChange()}
        distribution={getAssetDistribution()}
        loading={loading}
      />
      
      <div className="asset-manager-content">
        <ChainSelector 
          chains={supportedChains}
          selectedChain={selectedChain}
          onChainSelect={handleChainSelect}
        />
        
        <AssetList 
          assets={assets}
          selectedChain={selectedChain}
          loading={loading}
          error={error}
          onRefresh={refreshAssets}
        />
      </div>
    </div>
  );
};

export default MultiChainAssetManager;

