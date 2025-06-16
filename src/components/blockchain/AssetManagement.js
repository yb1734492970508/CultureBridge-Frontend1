import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useMultiChainWallet } from './MultiChainWallet';

// 资产数据服务
class AssetDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  }

  // 获取NFT资产
  async getNFTAssets(provider, address, chainId) {
    const cacheKey = `nft_${address}_${chainId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // 这里应该集成实际的NFT API，如Alchemy、Moralis等
      // 目前使用模拟数据
      const mockNFTs = await this.getMockNFTData(address, chainId);
      
      const result = {
        nfts: mockNFTs,
        total: mockNFTs.length,
      };

      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error('获取NFT资产失败:', error);
      return { nfts: [], total: 0 };
    }
  }

  // 获取同质化代币资产
  async getTokenAssets(provider, address, chainId) {
    const cacheKey = `tokens_${address}_${chainId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // 获取ETH/BNB/MATIC余额
      const nativeBalance = await provider.getBalance(address);
      const nativeSymbol = this.getNativeSymbol(chainId);
      
      // 这里应该集成实际的代币API
      // 目前使用模拟数据
      const mockTokens = await this.getMockTokenData(address, chainId);
      
      const tokens = [
        {
          address: 'native',
          name: this.getNativeName(chainId),
          symbol: nativeSymbol,
          decimals: 18,
          balance: ethers.utils.formatEther(nativeBalance),
          price: await this.getTokenPrice(nativeSymbol),
          logo: this.getNativeLogo(chainId),
        },
        ...mockTokens,
      ];

      const result = {
        tokens,
        total: tokens.length,
      };

      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error('获取代币资产失败:', error);
      return { tokens: [], total: 0 };
    }
  }

  // 获取交易历史
  async getTransactionHistory(provider, address, chainId) {
    const cacheKey = `tx_${address}_${chainId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // 这里应该集成区块链浏览器API
      // 目前使用模拟数据
      const mockTransactions = await this.getMockTransactionData(address, chainId);
      
      const result = {
        transactions: mockTransactions,
        total: mockTransactions.length,
      };

      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error('获取交易历史失败:', error);
      return { transactions: [], total: 0 };
    }
  }

  // 获取代币价格
  async getTokenPrice(symbol) {
    try {
      // 这里应该集成价格API，如CoinGecko
      const priceMap = {
        'ETH': 2000,
        'BNB': 300,
        'MATIC': 0.8,
        'USDT': 1,
        'USDC': 1,
      };
      return priceMap[symbol] || 0;
    } catch (error) {
      console.error('获取代币价格失败:', error);
      return 0;
    }
  }

  // 获取原生代币信息
  getNativeSymbol(chainId) {
    const symbolMap = {
      1: 'ETH',
      56: 'BNB',
      137: 'MATIC',
    };
    return symbolMap[chainId] || 'ETH';
  }

  getNativeName(chainId) {
    const nameMap = {
      1: 'Ethereum',
      56: 'Binance Coin',
      137: 'Polygon',
    };
    return nameMap[chainId] || 'Ethereum';
  }

  getNativeLogo(chainId) {
    const logoMap = {
      1: '/images/eth-logo.png',
      56: '/images/bnb-logo.png',
      137: '/images/matic-logo.png',
    };
    return logoMap[chainId] || '/images/eth-logo.png';
  }

  // 模拟NFT数据
  async getMockNFTData(address, chainId) {
    return [
      {
        tokenId: '1',
        name: 'CultureBridge NFT #1',
        description: '这是一个文化桥梁NFT',
        image: '/images/nft-placeholder.png',
        collection: 'CultureBridge Collection',
        attributes: [
          { trait_type: 'Rarity', value: 'Rare' },
          { trait_type: 'Culture', value: 'Chinese' },
        ],
      },
      {
        tokenId: '2',
        name: 'CultureBridge NFT #2',
        description: '另一个文化桥梁NFT',
        image: '/images/nft-placeholder.png',
        collection: 'CultureBridge Collection',
        attributes: [
          { trait_type: 'Rarity', value: 'Common' },
          { trait_type: 'Culture', value: 'Western' },
        ],
      },
    ];
  }

  // 模拟代币数据
  async getMockTokenData(address, chainId) {
    return [
      {
        address: '0xa0b86a33e6441e6c8d3c5b8b6b6b6b6b6b6b6b6b',
        name: 'USD Tether',
        symbol: 'USDT',
        decimals: 6,
        balance: '1000.0',
        price: 1,
        logo: '/images/usdt-logo.png',
      },
      {
        address: '0xa0b86a33e6441e6c8d3c5b8b6b6b6b6b6b6b6b6c',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        balance: '500.0',
        price: 1,
        logo: '/images/usdc-logo.png',
      },
    ];
  }

  // 模拟交易数据
  async getMockTransactionData(address, chainId) {
    return [
      {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: address,
        to: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        value: '0.1',
        timestamp: Date.now() - 3600000,
        status: 'success',
        type: 'transfer',
        gasUsed: '21000',
        gasPrice: '20',
      },
      {
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        from: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        to: address,
        value: '0.5',
        timestamp: Date.now() - 7200000,
        status: 'success',
        type: 'receive',
        gasUsed: '21000',
        gasPrice: '18',
      },
    ];
  }
}

// 资产管理界面组件
const AssetManagement = () => {
  const {
    account,
    provider,
    currentNetwork,
    isSupportedNetwork,
  } = useMultiChainWallet();

  const [activeTab, setActiveTab] = useState('nfts');
  const [nftAssets, setNftAssets] = useState({ nfts: [], total: 0 });
  const [tokenAssets, setTokenAssets] = useState({ tokens: [], total: 0 });
  const [transactions, setTransactions] = useState({ transactions: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const assetService = new AssetDataService();

  // 加载资产数据
  useEffect(() => {
    if (account && provider && isSupportedNetwork()) {
      loadAssets();
    }
  }, [account, provider, currentNetwork]);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);

    try {
      const chainId = parseInt(currentNetwork.chainId, 16);
      
      const [nfts, tokens, txHistory] = await Promise.all([
        assetService.getNFTAssets(provider, account, chainId),
        assetService.getTokenAssets(provider, account, chainId),
        assetService.getTransactionHistory(provider, account, chainId),
      ]);

      setNftAssets(nfts);
      setTokenAssets(tokens);
      setTransactions(txHistory);
    } catch (error) {
      console.error('加载资产失败:', error);
      setError('加载资产失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 格式化地址
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 计算代币价值
  const calculateTokenValue = (balance, price) => {
    return (parseFloat(balance) * price).toFixed(2);
  };

  if (!account) {
    return (
      <div className="asset-management">
        <div className="no-wallet">
          <h3>请先连接钱包</h3>
          <p>连接钱包后即可查看您的资产</p>
        </div>
      </div>
    );
  }

  if (!isSupportedNetwork()) {
    return (
      <div className="asset-management">
        <div className="unsupported-network">
          <h3>不支持的网络</h3>
          <p>请切换到支持的网络以查看资产</p>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-management">
      <div className="asset-header">
        <h2>资产管理</h2>
        <button onClick={loadAssets} className="refresh-button" disabled={loading}>
          {loading ? '刷新中...' : '刷新'}
        </button>
      </div>

      <div className="asset-tabs">
        <button
          className={`tab-button ${activeTab === 'nfts' ? 'active' : ''}`}
          onClick={() => setActiveTab('nfts')}
        >
          NFT ({nftAssets.total})
        </button>
        <button
          className={`tab-button ${activeTab === 'tokens' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          代币 ({tokenAssets.total})
        </button>
        <button
          className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          交易历史 ({transactions.total})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="asset-content">
        {activeTab === 'nfts' && (
          <div className="nft-assets">
            {loading ? (
              <div className="loading">加载NFT中...</div>
            ) : nftAssets.nfts.length > 0 ? (
              <div className="nft-grid">
                {nftAssets.nfts.map((nft, index) => (
                  <div key={index} className="nft-card">
                    <img src={nft.image} alt={nft.name} className="nft-image" />
                    <div className="nft-info">
                      <h4>{nft.name}</h4>
                      <p className="nft-collection">{nft.collection}</p>
                      <p className="nft-description">{nft.description}</p>
                      {nft.attributes && (
                        <div className="nft-attributes">
                          {nft.attributes.map((attr, i) => (
                            <span key={i} className="attribute">
                              {attr.trait_type}: {attr.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">暂无NFT资产</div>
            )}
          </div>
        )}

        {activeTab === 'tokens' && (
          <div className="token-assets">
            {loading ? (
              <div className="loading">加载代币中...</div>
            ) : tokenAssets.tokens.length > 0 ? (
              <div className="token-list">
                {tokenAssets.tokens.map((token, index) => (
                  <div key={index} className="token-item">
                    <img src={token.logo} alt={token.symbol} className="token-logo" />
                    <div className="token-info">
                      <h4>{token.name}</h4>
                      <p className="token-symbol">{token.symbol}</p>
                    </div>
                    <div className="token-balance">
                      <p className="balance">{parseFloat(token.balance).toFixed(4)}</p>
                      <p className="value">${calculateTokenValue(token.balance, token.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">暂无代币资产</div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transaction-history">
            {loading ? (
              <div className="loading">加载交易历史中...</div>
            ) : transactions.transactions.length > 0 ? (
              <div className="transaction-list">
                {transactions.transactions.map((tx, index) => (
                  <div key={index} className="transaction-item">
                    <div className="tx-info">
                      <h4 className={`tx-type ${tx.type}`}>
                        {tx.type === 'transfer' ? '发送' : '接收'}
                      </h4>
                      <p className="tx-hash">{formatAddress(tx.hash)}</p>
                      <p className="tx-time">{formatTime(tx.timestamp)}</p>
                    </div>
                    <div className="tx-details">
                      <p className="tx-amount">{tx.value} ETH</p>
                      <p className={`tx-status ${tx.status}`}>
                        {tx.status === 'success' ? '成功' : '失败'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">暂无交易记录</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetManagement;

