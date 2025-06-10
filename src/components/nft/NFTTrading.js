/**
 * NFT交易与转让组件
 * 用于管理和交易文化NFT资产
 */

import React, { useState, useEffect } from 'react';
import BlockchainConnector from '../../utils/BlockchainConnector';
import './NFTTrading.css';

const NFTTrading = ({ account, culturalNFT, cultureToken }) => {
  // 状态变量
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [marketNFTs, setMarketNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [activeTab, setActiveTab] = useState('owned');
  const [transferForm, setTransferForm] = useState({ recipient: '', tokenId: '' });
  const [listingForm, setListingForm] = useState({ tokenId: '', price: '' });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // 初始化
  useEffect(() => {
    if (account && culturalNFT) {
      loadNFTs();
    }
  }, [account, culturalNFT]);

  // 加载NFT
  const loadNFTs = async () => {
    try {
      setIsLoading(true);
      
      // 加载用户拥有的NFT
      const owned = await loadUserNFTs(account);
      setOwnedNFTs(owned);
      
      // 加载市场上的NFT
      const market = await loadMarketNFTs();
      setMarketNFTs(market);
      
    } catch (err) {
      console.error('加载NFT错误:', err);
      setError('加载NFT失败');
      showNotification('加载NFT失败: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 加载用户NFT（示例实现）
  const loadUserNFTs = async (userAccount) => {
    // 模拟数据，实际应从合约获取
    return [
      {
        id: 1,
        name: '中英翻译专家NFT',
        description: '提供高质量的中英文翻译记忆库和文化上下文解释',
        type: 'TranslationMemory',
        language: 'en-zh',
        imageUrl: 'https://example.com/nft1.jpg',
        price: '50',
        isForSale: false,
        owner: userAccount,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        attributes: [
          { trait_type: '准确度', value: 95 },
          { trait_type: '文化敏感度', value: 90 },
          { trait_type: '专业领域', value: '技术文档' }
        ]
      },
      {
        id: 2,
        name: '文化解释器NFT',
        description: '专注于中西方文化差异解释和习语翻译的智能助手',
        type: 'CulturalExplanation',
        language: 'en-zh',
        imageUrl: 'https://example.com/nft2.jpg',
        price: '75',
        isForSale: true,
        owner: userAccount,
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        attributes: [
          { trait_type: '文化覆盖范围', value: 85 },
          { trait_type: '习语解释能力', value: 92 },
          { trait_type: '专业领域', value: '文学作品' }
        ]
      },
      {
        id: 3,
        name: '日语学习助手NFT',
        description: '针对中文用户的日语学习和翻译辅助工具',
        type: 'LanguageLearning',
        language: 'ja-zh',
        imageUrl: 'https://example.com/nft3.jpg',
        price: '60',
        isForSale: false,
        owner: userAccount,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        attributes: [
          { trait_type: '语法准确度', value: 88 },
          { trait_type: '发音指导', value: 90 },
          { trait_type: '专业领域', value: '日常对话' }
        ]
      }
    ];
  };
  
  // 加载市场NFT（示例实现）
  const loadMarketNFTs = async () => {
    // 模拟数据，实际应从合约获取
    return [
      {
        id: 4,
        name: '法语翻译专家NFT',
        description: '专业的中法互译工具，包含大量专业术语库',
        type: 'TranslationMemory',
        language: 'fr-zh',
        imageUrl: 'https://example.com/nft4.jpg',
        price: '65',
        isForSale: true,
        owner: '0x123...456',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        attributes: [
          { trait_type: '准确度', value: 92 },
          { trait_type: '文化敏感度', value: 88 },
          { trait_type: '专业领域', value: '法律文件' }
        ]
      },
      {
        id: 5,
        name: '商务英语助手NFT',
        description: '专注于商务场景的英语翻译和表达优化工具',
        type: 'SpecializedTranslation',
        language: 'en-zh',
        imageUrl: 'https://example.com/nft5.jpg',
        price: '80',
        isForSale: true,
        owner: '0x789...012',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        attributes: [
          { trait_type: '商务术语覆盖', value: 96 },
          { trait_type: '邮件写作辅助', value: 94 },
          { trait_type: '专业领域', value: '商务沟通' }
        ]
      },
      {
        id: 6,
        name: '韩语文化桥梁NFT',
        description: '连接中韩文化的翻译和解释工具，特别关注流行文化元素',
        type: 'CulturalExplanation',
        language: 'ko-zh',
        imageUrl: 'https://example.com/nft6.jpg',
        price: '70',
        isForSale: true,
        owner: '0x345...678',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        attributes: [
          { trait_type: '流行文化覆盖', value: 95 },
          { trait_type: '语言准确度', value: 90 },
          { trait_type: '专业领域', value: '娱乐内容' }
        ]
      }
    ];
  };

  // 转让NFT
  const transferNFT = async () => {
    try {
      setIsLoading(true);
      
      const { recipient, tokenId } = transferForm;
      
      if (!recipient || !tokenId) {
        throw new Error('请填写所有必填字段');
      }
      
      if (!recipient.startsWith('0x') || recipient.length !== 42) {
        throw new Error('请输入有效的接收地址');
      }
      
      // 调用合约转让NFT
      const tx = await culturalNFT.transferFrom(account, recipient, tokenId);
      await tx.wait();
      
      // 重新加载NFT
      await loadNFTs();
      
      // 关闭模态框
      setShowTransferModal(false);
      
      // 重置表单
      setTransferForm({ recipient: '', tokenId: '' });
      
      showNotification('NFT转让成功', 'success');
    } catch (err) {
      console.error('转让NFT错误:', err);
      setError('转让NFT失败');
      showNotification('转让NFT失败: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 上架NFT
  const listNFT = async () => {
    try {
      setIsLoading(true);
      
      const { tokenId, price } = listingForm;
      
      if (!tokenId || !price) {
        throw new Error('请填写所有必填字段');
      }
      
      if (parseFloat(price) <= 0) {
        throw new Error('价格必须大于0');
      }
      
      // 将价格转换为wei
      const priceInWei = BlockchainConnector.ethers.utils.parseEther(price);
      
      // 调用合约上架NFT
      // 注意：这里假设有一个NFT市场合约
      const nftMarket = BlockchainConnector.nftMarket;
      
      // 首先授权市场合约操作NFT
      const approveTx = await culturalNFT.approve(nftMarket.address, tokenId);
      await approveTx.wait();
      
      // 然后上架NFT
      const listTx = await nftMarket.listItem(culturalNFT.address, tokenId, priceInWei);
      await listTx.wait();
      
      // 重新加载NFT
      await loadNFTs();
      
      // 关闭模态框
      setShowListingModal(false);
      
      // 重置表单
      setListingForm({ tokenId: '', price: '' });
      
      showNotification('NFT上架成功', 'success');
    } catch (err) {
      console.error('上架NFT错误:', err);
      setError('上架NFT失败');
      showNotification('上架NFT失败: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 购买NFT
  const buyNFT = async (nft) => {
    try {
      setIsLoading(true);
      
      // 将价格转换为wei
      const priceInWei = BlockchainConnector.ethers.utils.parseEther(nft.price);
      
      // 调用合约购买NFT
      // 注意：这里假设有一个NFT市场合约
      const nftMarket = BlockchainConnector.nftMarket;
      
      // 首先授权市场合约使用代币
      const approveTx = await cultureToken.approve(nftMarket.address, priceInWei);
      await approveTx.wait();
      
      // 然后购买NFT
      const buyTx = await nftMarket.buyItem(culturalNFT.address, nft.id, { value: priceInWei });
      await buyTx.wait();
      
      // 重新加载NFT
      await loadNFTs();
      
      showNotification('NFT购买成功', 'success');
    } catch (err) {
      console.error('购买NFT错误:', err);
      setError('购买NFT失败');
      showNotification('购买NFT失败: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 取消上架
  const cancelListing = async (nft) => {
    try {
      setIsLoading(true);
      
      // 调用合约取消上架
      // 注意：这里假设有一个NFT市场合约
      const nftMarket = BlockchainConnector.nftMarket;
      
      const tx = await nftMarket.cancelListing(culturalNFT.address, nft.id);
      await tx.wait();
      
      // 重新加载NFT
      await loadNFTs();
      
      showNotification('取消上架成功', 'success');
    } catch (err) {
      console.error('取消上架错误:', err);
      setError('取消上架失败');
      showNotification('取消上架失败: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理转让表单变化
  const handleTransferFormChange = (e) => {
    const { name, value } = e.target;
    setTransferForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理上架表单变化
  const handleListingFormChange = (e) => {
    const { name, value } = e.target;
    setListingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 显示通知
  const showNotification = (message, type = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // 3秒后自动关闭
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // 打开NFT详情
  const openNFTDetail = (nft) => {
    setSelectedNFT(nft);
    setShowDetailModal(true);
  };

  // 打开转让模态框
  const openTransferModal = (nft) => {
    setSelectedNFT(nft);
    setTransferForm(prev => ({ ...prev, tokenId: nft.id }));
    setShowTransferModal(true);
  };

  // 打开上架模态框
  const openListingModal = (nft) => {
    setSelectedNFT(nft);
    setListingForm(prev => ({ ...prev, tokenId: nft.id }));
    setShowListingModal(true);
  };

  // 过滤NFT
  const filterNFTs = (nfts) => {
    return nfts.filter(nft => {
      // 搜索过滤
      const searchMatch = searchQuery === '' || 
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 语言过滤
      const languageMatch = filterLanguage === 'all' || nft.language.includes(filterLanguage);
      
      // 类型过滤
      const typeMatch = filterType === 'all' || nft.type === filterType;
      
      return searchMatch && languageMatch && typeMatch;
    });
  };

  // 排序NFT
  const sortNFTs = (nfts) => {
    switch (sortBy) {
      case 'newest':
        return [...nfts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return [...nfts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'price_high':
        return [...nfts].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'price_low':
        return [...nfts].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      default:
        return nfts;
    }
  };

  // 获取当前显示的NFT
  const getCurrentNFTs = () => {
    const nfts = activeTab === 'owned' ? ownedNFTs : marketNFTs;
    const filtered = filterNFTs(nfts);
    return sortNFTs(filtered);
  };

  // 渲染NFT卡片
  const renderNFTCard = (nft) => {
    const isOwner = nft.owner === account;
    
    return (
      <div key={nft.id} className="nft-card">
        <div className="nft-image" onClick={() => openNFTDetail(nft)}>
          <img src={nft.imageUrl} alt={nft.name} />
          {nft.isForSale && <span className="for-sale-badge">出售中</span>}
        </div>
        <div className="nft-info">
          <h3>{nft.name}</h3>
          <p className="nft-description">{nft.description}</p>
          <div className="nft-attributes">
            <span className="nft-language">{nft.language}</span>
            <span className="nft-type">{nft.type}</span>
          </div>
          <div className="nft-price-container">
            <span className="nft-price-label">价格:</span>
            <span className="nft-price-value">{nft.price} CULT</span>
          </div>
          
          <div className="nft-actions">
            {isOwner ? (
              // 用户拥有的NFT
              nft.isForSale ? (
                <button 
                  className="btn-cancel-listing"
                  onClick={() => cancelListing(nft)}
                  disabled={isLoading}
                >
                  取消出售
                </button>
              ) : (
                <>
                  <button 
                    className="btn-transfer"
                    onClick={() => openTransferModal(nft)}
                    disabled={isLoading}
                  >
                    转让
                  </button>
                  <button 
                    className="btn-list"
                    onClick={() => openListingModal(nft)}
                    disabled={isLoading}
                  >
                    出售
                  </button>
                </>
              )
            ) : (
              // 市场上的NFT
              nft.isForSale && (
                <button 
                  className="btn-buy"
                  onClick={() => buyNFT(nft)}
                  disabled={isLoading}
                >
                  购买
                </button>
              )
            )}
            <button 
              className="btn-details"
              onClick={() => openNFTDetail(nft)}
            >
              详情
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染NFT详情模态框
  const renderNFTDetailModal = () => {
    if (!selectedNFT) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
        <div className="modal-content nft-detail-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedNFT.name}</h2>
            <button className="btn-close" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="nft-detail-container">
              <div className="nft-detail-image">
                <img src={selectedNFT.imageUrl} alt={selectedNFT.name} />
              </div>
              <div className="nft-detail-info">
                <div className="nft-detail-section">
                  <h3>基本信息</h3>
                  <p><strong>ID:</strong> {selectedNFT.id}</p>
                  <p><strong>类型:</strong> {selectedNFT.type}</p>
                  <p><strong>语言:</strong> {selectedNFT.language}</p>
                  <p><strong>创建时间:</strong> {new Date(selectedNFT.createdAt).toLocaleString()}</p>
                  <p><strong>拥有者:</strong> {selectedNFT.owner === account ? '你' : `${selectedNFT.owner.substring(0, 6)}...${selectedNFT.owner.substring(38)}`}</p>
                  <p><strong>价格:</strong> {selectedNFT.price} CULT</p>
                  <p><strong>状态:</strong> {selectedNFT.isForSale ? '出售中' : '未出售'}</p>
                </div>
                
                <div className="nft-detail-section">
                  <h3>描述</h3>
                  <p>{selectedNFT.description}</p>
                </div>
                
                <div className="nft-detail-section">
                  <h3>属性</h3>
                  <div className="nft-attributes-grid">
                    {selectedNFT.attributes.map((attr, index) => (
                      <div key={index} className="nft-attribute-item">
                        <div className="attribute-name">{attr.trait_type}</div>
                        <div className="attribute-value">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            {selectedNFT.owner === account ? (
              // 用户拥有的NFT
              selectedNFT.isForSale ? (
                <button 
                  className="btn-cancel-listing"
                  onClick={() => {
                    cancelListing(selectedNFT);
                    setShowDetailModal(false);
                  }}
                  disabled={isLoading}
                >
                  取消出售
                </button>
              ) : (
                <>
                  <button 
                    className="btn-transfer"
                    onClick={() => {
                      openTransferModal(selectedNFT);
                      setShowDetailModal(false);
                    }}
                    disabled={isLoading}
                  >
                    转让
                  </button>
                  <button 
                    className="btn-list"
                    onClick={() => {
                      openListingModal(selectedNFT);
                      setShowDetailModal(false);
                    }}
                    disabled={isLoading}
                  >
                    出售
                  </button>
                </>
              )
            ) : (
              // 市场上的NFT
              selectedNFT.isForSale && (
                <button 
                  className="btn-buy"
                  onClick={() => {
                    buyNFT(selectedNFT);
                    setShowDetailModal(false);
                  }}
                  disabled={isLoading}
                >
                  购买
                </button>
              )
            )}
            <button 
              className="btn-close-detail"
              onClick={() => setShowDetailModal(false)}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染转让模态框
  const renderTransferModal = () => {
    return (
      <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>转让NFT</h2>
            <button className="btn-close" onClick={() => setShowTransferModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="tokenId">NFT ID</label>
              <input
                type="text"
                id="tokenId"
                name="tokenId"
                value={transferForm.tokenId}
                onChange={handleTransferFormChange}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="recipient">接收地址</label>
              <input
                type="text"
                id="recipient"
                name="recipient"
                value={transferForm.recipient}
                onChange={handleTransferFormChange}
                placeholder="0x..."
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn-cancel"
              onClick={() => setShowTransferModal(false)}
            >
              取消
            </button>
            <button 
              className="btn-confirm"
              onClick={transferNFT}
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : '确认转让'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染上架模态框
  const renderListingModal = () => {
    return (
      <div className="modal-overlay" onClick={() => setShowListingModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>出售NFT</h2>
            <button className="btn-close" onClick={() => setShowListingModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="tokenId">NFT ID</label>
              <input
                type="text"
                id="tokenId"
                name="tokenId"
                value={listingForm.tokenId}
                onChange={handleListingFormChange}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">价格 (CULT)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={listingForm.price}
                onChange={handleListingFormChange}
                min="0.1"
                step="0.1"
                placeholder="输入价格"
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn-cancel"
              onClick={() => setShowListingModal(false)}
            >
              取消
            </button>
            <button 
              className="btn-confirm"
              onClick={listNFT}
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : '确认上架'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nft-trading">
      <div className="trading-header">
        <h2>NFT交易中心</h2>
        <div className="trading-tabs">
          <button
            className={`tab-btn ${activeTab === 'owned' ? 'active' : ''}`}
            onClick={() => setActiveTab('owned')}
          >
            我的NFT
            <span className="badge">{ownedNFTs.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            NFT市场
            <span className="badge">{marketNFTs.length}</span>
          </button>
        </div>
      </div>
      
      <div className="trading-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="搜索NFT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-container">
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
          >
            <option value="all">所有语言</option>
            <option value="en">英语</option>
            <option value="zh">中文</option>
            <option value="ja">日语</option>
            <option value="ko">韩语</option>
            <option value="fr">法语</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">所有类型</option>
            <option value="TranslationMemory">翻译记忆库</option>
            <option value="CulturalExplanation">文化解释器</option>
            <option value="LanguageLearning">语言学习</option>
            <option value="SpecializedTranslation">专业翻译</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">最新</option>
            <option value="oldest">最早</option>
            <option value="price_high">价格从高到低</option>
            <option value="price_low">价格从低到高</option>
          </select>
        </div>
      </div>
      
      <div className="trading-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={loadNFTs}>重试</button>
          </div>
        ) : (
          <div className="nft-grid">
            {getCurrentNFTs().length > 0 ? (
              getCurrentNFTs().map(nft => renderNFTCard(nft))
            ) : (
              <div className="empty-message">
                <p>没有找到符合条件的NFT</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 模态框 */}
      {showDetailModal && renderNFTDetailModal()}
      {showTransferModal && renderTransferModal()}
      {showListingModal && renderListingModal()}
      
      {/* 通知 */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(prev => ({ ...prev, show: false }))}>×</button>
        </div>
      )}
    </div>
  );
};

export default NFTTrading;
