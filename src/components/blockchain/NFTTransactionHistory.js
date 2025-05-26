import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { BlockchainContext } from '../../context/blockchain';
import './NFTTransactionHistory.css';

/**
 * NFT交易历史组件
 * 显示用户的NFT交易历史记录，包括购买、出售和竞拍
 */
const NFTTransactionHistory = ({ userAddress }) => {
  // 状态管理
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'purchases', 'sales', 'bids'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' 或 'asc'
  
  // 每页显示的交易数量
  const ITEMS_PER_PAGE = 5;
  
  // 区块链上下文
  const { provider, isConnected } = useContext(BlockchainContext);
  
  // 获取交易历史
  useEffect(() => {
    if (isConnected && provider && userAddress) {
      fetchTransactionHistory();
    }
  }, [isConnected, provider, userAddress, activeTab, currentPage, sortOrder]);
  
  // 获取交易历史数据
  const fetchTransactionHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 模拟从区块链获取数据
      // 实际实现中，这里应该调用市场合约获取交易历史
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟交易数据
      const mockTransactions = [
        {
          id: '1',
          type: 'purchase',
          nftId: '101',
          nftName: '传统中国水墨画',
          nftImage: 'https://example.com/nft1.jpg',
          price: ethers.utils.parseEther('0.5'),
          from: '0x1234...5678',
          to: userAddress,
          timestamp: Date.now() - 86400000 * 2, // 2天前
          txHash: '0xabcd...1234',
          status: 'completed'
        },
        {
          id: '2',
          type: 'sale',
          nftId: '102',
          nftName: '非洲部落面具',
          nftImage: 'https://example.com/nft2.jpg',
          price: ethers.utils.parseEther('0.8'),
          from: userAddress,
          to: '0x2345...6789',
          timestamp: Date.now() - 86400000 * 5, // 5天前
          txHash: '0xbcde...2345',
          status: 'completed'
        },
        {
          id: '3',
          type: 'bid',
          nftId: '103',
          nftName: '印度古典舞蹈瞬间',
          nftImage: 'https://example.com/nft3.jpg',
          price: ethers.utils.parseEther('0.3'),
          from: userAddress,
          to: null, // 竞拍中没有接收方
          timestamp: Date.now() - 86400000, // 1天前
          txHash: '0xcdef...3456',
          status: 'pending' // 竞拍状态：pending, won, outbid
        },
        {
          id: '4',
          type: 'purchase',
          nftId: '104',
          nftName: '日本浮世绘现代诠释',
          nftImage: 'https://example.com/nft4.jpg',
          price: ethers.utils.parseEther('1.2'),
          from: '0x3456...7890',
          to: userAddress,
          timestamp: Date.now() - 86400000 * 7, // 7天前
          txHash: '0xdefg...4567',
          status: 'completed'
        },
        {
          id: '5',
          type: 'bid',
          nftId: '105',
          nftName: '墨西哥传统节日面具',
          nftImage: 'https://example.com/nft5.jpg',
          price: ethers.utils.parseEther('0.7'),
          from: userAddress,
          to: null,
          timestamp: Date.now() - 86400000 * 3, // 3天前
          txHash: '0xefgh...5678',
          status: 'outbid' // 已被超出
        },
        {
          id: '6',
          type: 'sale',
          nftId: '106',
          nftName: '俄罗斯民间故事插画',
          nftImage: 'https://example.com/nft6.jpg',
          price: ethers.utils.parseEther('0.6'),
          from: userAddress,
          to: '0x4567...8901',
          timestamp: Date.now() - 86400000 * 10, // 10天前
          txHash: '0xfghi...6789',
          status: 'completed'
        }
      ];
      
      // 根据活动标签筛选交易
      let filteredTransactions = [...mockTransactions];
      if (activeTab !== 'all') {
        filteredTransactions = mockTransactions.filter(tx => tx.type === activeTab);
      }
      
      // 根据排序顺序排序
      filteredTransactions.sort((a, b) => {
        return sortOrder === 'desc' 
          ? b.timestamp - a.timestamp 
          : a.timestamp - b.timestamp;
      });
      
      // 计算总页数
      const total = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
      setTotalPages(total || 1);
      
      // 分页
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginatedTransactions = filteredTransactions.slice(
        startIndex, 
        startIndex + ITEMS_PER_PAGE
      );
      
      setTransactions(paginatedTransactions);
      setIsLoading(false);
    } catch (err) {
      console.error('获取交易历史失败:', err);
      setError('加载交易历史失败，请稍后再试');
      setIsLoading(false);
    }
  };
  
  // 处理标签切换
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // 重置为第一页
  };
  
  // 处理页面切换
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // 处理排序切换
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };
  
  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '-';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 获取交易类型标签
  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'purchase':
        return '购买';
      case 'sale':
        return '出售';
      case 'bid':
        return '竞拍';
      default:
        return type;
    }
  };
  
  // 获取交易状态标签
  const getTransactionStatusLabel = (status, type) => {
    if (type === 'bid') {
      switch (status) {
        case 'pending':
          return '竞拍中';
        case 'won':
          return '已中标';
        case 'outbid':
          return '已被超出';
        default:
          return status;
      }
    } else {
      switch (status) {
        case 'completed':
          return '已完成';
        case 'pending':
          return '处理中';
        case 'failed':
          return '失败';
        default:
          return status;
      }
    }
  };
  
  // 获取交易状态类名
  const getStatusClassName = (status, type) => {
    if (type === 'bid') {
      switch (status) {
        case 'pending':
          return 'status-pending';
        case 'won':
          return 'status-completed';
        case 'outbid':
          return 'status-failed';
        default:
          return '';
      }
    } else {
      switch (status) {
        case 'completed':
          return 'status-completed';
        case 'pending':
          return 'status-pending';
        case 'failed':
          return 'status-failed';
        default:
          return '';
      }
    }
  };
  
  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="nft-transaction-history">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载交易历史...</p>
        </div>
      </div>
    );
  }
  
  // 渲染错误状态
  if (error) {
    return (
      <div className="nft-transaction-history">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchTransactionHistory}>
            重试
          </button>
        </div>
      </div>
    );
  }
  
  // 渲染未连接钱包状态
  if (!isConnected) {
    return (
      <div className="nft-transaction-history">
        <div className="wallet-connect-prompt">
          <h3>连接钱包以查看交易历史</h3>
          <p>请连接您的钱包以查看您的NFT交易历史记录</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="nft-transaction-history">
      <div className="history-header">
        <h2>NFT 交易历史</h2>
        <div className="sort-control">
          <button 
            className="sort-button" 
            onClick={toggleSortOrder}
            title={sortOrder === 'desc' ? '最新在前' : '最早在前'}
          >
            {sortOrder === 'desc' ? '↓ 最新在前' : '↑ 最早在前'}
          </button>
        </div>
      </div>
      
      <div className="history-tabs">
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          全部
        </button>
        <button 
          className={`tab-button ${activeTab === 'purchase' ? 'active' : ''}`}
          onClick={() => handleTabChange('purchase')}
        >
          购买
        </button>
        <button 
          className={`tab-button ${activeTab === 'sale' ? 'active' : ''}`}
          onClick={() => handleTabChange('sale')}
        >
          出售
        </button>
        <button 
          className={`tab-button ${activeTab === 'bid' ? 'active' : ''}`}
          onClick={() => handleTabChange('bid')}
        >
          竞拍
        </button>
      </div>
      
      {transactions.length === 0 ? (
        <div className="empty-history">
          <p>暂无交易记录</p>
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map(tx => (
            <div key={tx.id} className="transaction-item">
              <div className="transaction-image">
                <img src={tx.nftImage} alt={tx.nftName} />
              </div>
              
              <div className="transaction-details">
                <div className="transaction-header">
                  <h3 className="nft-name">{tx.nftName}</h3>
                  <div className={`transaction-status ${getStatusClassName(tx.status, tx.type)}`}>
                    {getTransactionStatusLabel(tx.status, tx.type)}
                  </div>
                </div>
                
                <div className="transaction-info">
                  <div className="info-row">
                    <span className="info-label">交易类型:</span>
                    <span className="info-value">
                      <span className={`transaction-type ${tx.type}`}>
                        {getTransactionTypeLabel(tx.type)}
                      </span>
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">价格:</span>
                    <span className="info-value price">
                      {ethers.utils.formatEther(tx.price)} ETH
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">从:</span>
                    <span className="info-value address">
                      {formatAddress(tx.from)}
                      {tx.from === userAddress && <span className="you-tag">（您）</span>}
                    </span>
                  </div>
                  
                  {tx.to && (
                    <div className="info-row">
                      <span className="info-label">至:</span>
                      <span className="info-value address">
                        {formatAddress(tx.to)}
                        {tx.to === userAddress && <span className="you-tag">（您）</span>}
                      </span>
                    </div>
                  )}
                  
                  <div className="info-row">
                    <span className="info-label">时间:</span>
                    <span className="info-value time">
                      {formatTimestamp(tx.timestamp)}
                    </span>
                  </div>
                </div>
                
                <div className="transaction-actions">
                  <a 
                    href={`https://etherscan.io/tx/${tx.txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-tx-button"
                  >
                    查看交易
                  </a>
                  <a 
                    href={`/nft/${tx.nftId}`} 
                    className="view-nft-button"
                  >
                    查看NFT
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-button prev"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            上一页
          </button>
          
          <div className="page-info">
            第 {currentPage} 页，共 {totalPages} 页
          </div>
          
          <button 
            className="page-button next"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default NFTTransactionHistory;
