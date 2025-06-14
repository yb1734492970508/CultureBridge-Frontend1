import React, { useState, useEffect, useCallback } from 'react';
import { useCrossChainAssets } from '../../hooks/useCrossChainAssets';
import ChainSelector from './ChainSelector';
import AssetPortfolio from './AssetPortfolio';
import BridgeInterface from './BridgeInterface';
import TransactionHistory from './TransactionHistory';
import './CrossChainAssetManager.css';

/**
 * 跨链资产管理器组件
 * 提供多链资产查看、跨链转移和管理功能
 */
const CrossChainAssetManager = ({ 
  userAddress,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [bridgeConfig, setBridgeConfig] = useState({
    fromChain: 'ethereum',
    toChain: 'polygon',
    asset: null,
    amount: ''
  });

  const {
    supportedChains,
    assets,
    balances,
    transactions,
    bridgeStatus,
    loading,
    error,
    fetchAssets,
    fetchBalances,
    fetchTransactions,
    initiateBridge,
    checkBridgeStatus,
    refreshData
  } = useCrossChainAssets(userAddress);

  // 初始化数据
  useEffect(() => {
    if (userAddress) {
      fetchAssets();
      fetchBalances();
      fetchTransactions();
    }
  }, [userAddress, fetchAssets, fetchBalances, fetchTransactions]);

  // 处理链选择
  const handleChainSelect = useCallback((chainId) => {
    setSelectedChain(chainId);
    fetchBalances(chainId);
  }, [fetchBalances]);

  // 处理跨链桥接
  const handleBridge = useCallback(async (bridgeData) => {
    try {
      const result = await initiateBridge(bridgeData);
      setBridgeConfig({
        fromChain: 'ethereum',
        toChain: 'polygon',
        asset: null,
        amount: ''
      });
      return result;
    } catch (err) {
      console.error('桥接失败:', err);
      throw err;
    }
  }, [initiateBridge]);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // 获取当前链的资产
  const getCurrentChainAssets = () => {
    return assets.filter(asset => asset.chainId === selectedChain);
  };

  // 获取当前链的余额
  const getCurrentChainBalances = () => {
    return balances[selectedChain] || [];
  };

  // 计算总价值
  const getTotalValue = () => {
    return Object.values(balances).reduce((total, chainBalances) => {
      return total + chainBalances.reduce((chainTotal, balance) => {
        return chainTotal + (balance.value || 0);
      }, 0);
    }, 0);
  };

  // 渲染标签页
  const renderTabs = () => {
    const tabs = [
      { id: 'portfolio', label: '资产组合', icon: '💼' },
      { id: 'bridge', label: '跨链桥接', icon: '🌉' },
      { id: 'history', label: '交易历史', icon: '📋' }
    ];

    return (
      <div className="asset-manager-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return (
          <AssetPortfolio
            chains={supportedChains}
            selectedChain={selectedChain}
            assets={getCurrentChainAssets()}
            balances={getCurrentChainBalances()}
            totalValue={getTotalValue()}
            onChainSelect={handleChainSelect}
            onRefresh={handleRefresh}
          />
        );
      
      case 'bridge':
        return (
          <BridgeInterface
            chains={supportedChains}
            assets={assets}
            balances={balances}
            bridgeStatus={bridgeStatus}
            config={bridgeConfig}
            onConfigChange={setBridgeConfig}
            onBridge={handleBridge}
            onStatusCheck={checkBridgeStatus}
          />
        );
      
      case 'history':
        return (
          <TransactionHistory
            transactions={transactions}
            chains={supportedChains}
            onRefresh={handleRefresh}
          />
        );
      
      default:
        return null;
    }
  };

  if (loading && !assets.length) {
    return (
      <div className="asset-manager-loading">
        <div className="loading-spinner" />
        <p>正在加载跨链资产...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asset-manager-error">
        <div className="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{error.message}</p>
        <button onClick={handleRefresh}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className={`cross-chain-asset-manager ${className}`}>
      {/* 页面头部 */}
      <div className="asset-manager-header">
        <div className="header-content">
          <h1 className="manager-title">跨链资产管理</h1>
          <p className="manager-subtitle">
            管理您在多个区块链网络上的数字资产
          </p>
        </div>

        {/* 总价值显示 */}
        <div className="total-value-display">
          <div className="value-item">
            <div className="value-amount">${getTotalValue().toLocaleString()}</div>
            <div className="value-label">总资产价值</div>
          </div>
          <div className="value-item">
            <div className="value-amount">{Object.keys(balances).length}</div>
            <div className="value-label">支持网络</div>
          </div>
          <div className="value-item">
            <div className="value-amount">{assets.length}</div>
            <div className="value-label">资产类型</div>
          </div>
        </div>

        {/* 刷新按钮 */}
        <button 
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          <span className="refresh-icon">🔄</span>
          {loading ? '刷新中...' : '刷新'}
        </button>
      </div>

      {/* 标签页导航 */}
      {renderTabs()}

      {/* 内容区域 */}
      <div className="asset-manager-content">
        {renderContent()}
      </div>

      {/* 状态指示器 */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner small" />
        </div>
      )}
    </div>
  );
};

export default CrossChainAssetManager;

