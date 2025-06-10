import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain/BlockchainContext';
import './EnhancedCrossChainHistory.css';

/**
 * 增强的跨链交易历史组件
 * 提供更详细的交易历史记录展示和实时状态更新
 */
const EnhancedCrossChainHistory = ({ onTransactionSelect }) => {
  const { account } = useBlockchain();
  
  // 状态管理
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed', 'failed'
  const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp', 'amount', 'status'
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 支持的网络配置
  const supportedNetworks = {
    1: { name: 'Ethereum', icon: '⟠', color: '#627eea', currency: 'ETH' },
    56: { name: 'BNB Chain', icon: '🟡', color: '#f3ba2f', currency: 'BNB' },
    137: { name: 'Polygon', icon: '🟣', color: '#8247e5', currency: 'MATIC' },
    42161: { name: 'Arbitrum', icon: '🔶', color: '#28a0f0', currency: 'ETH' },
    10: { name: 'Optimism', icon: '🔴', color: '#ff0420', currency: 'ETH' },
    43114: { name: 'Avalanche', icon: '❄️', color: '#e84142', currency: 'AVAX' }
  };

  // 模拟交易数据
  const mockTransactions = [
    {
      id: '0x1234567890abcdef1234567890abcdef12345678',
      sourceChain: 1,
      targetChain: 56,
      sourceToken: 'ETH',
      targetToken: 'BNB',
      amount: '2.5',
      fee: '0.01',
      status: 'completed',
      timestamp: Date.now() - 3600000,
      confirmations: 15,
      estimatedTime: 300,
      actualTime: 280,
      bridgeProtocol: 'LayerZero',
      txHash: '0x1234567890abcdef1234567890abcdef12345678',
      targetTxHash: '0xabcdef1234567890abcdef1234567890abcdef12'
    },
    {
      id: '0xabcdef1234567890abcdef1234567890abcdef12',
      sourceChain: 137,
      targetChain: 1,
      sourceToken: 'MATIC',
      targetToken: 'ETH',
      amount: '1000',
      fee: '5.0',
      status: 'pending',
      timestamp: Date.now() - 1800000,
      confirmations: 8,
      estimatedTime: 600,
      actualTime: null,
      bridgeProtocol: 'Polygon Bridge',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      targetTxHash: null
    },
    {
      id: '0x9876543210fedcba9876543210fedcba98765432',
      sourceChain: 56,
      targetChain: 137,
      sourceToken: 'BNB',
      targetToken: 'MATIC',
      amount: '5.0',
      fee: '0.02',
      status: 'failed',
      timestamp: Date.now() - 7200000,
      confirmations: 0,
      estimatedTime: 300,
      actualTime: null,
      bridgeProtocol: 'Multichain',
      txHash: '0x9876543210fedcba9876543210fedcba98765432',
      targetTxHash: null,
      errorMessage: 'Insufficient liquidity on target chain'
    }
  ];

  // 初始化数据
  useEffect(() => {
    if (account) {
      loadTransactionHistory();
    }
  }, [account]);

  // 加载交易历史
  const loadTransactionHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(mockTransactions);
    } catch (err) {
      setError('加载交易历史失败');
      console.error('Error loading transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取网络信息
  const getNetworkInfo = (chainId) => {
    return supportedNetworks[chainId] || { 
      name: `Chain ${chainId}`, 
      icon: '❓', 
      color: '#6c757d', 
      currency: 'ETH' 
    };
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 格式化金额
  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(4);
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#2ed573';
      case 'pending': return '#ffa726';
      case 'failed': return '#ff4757';
      default: return '#6c757d';
    }
  };

  // 获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'pending': return '进行中';
      case 'failed': return '失败';
      default: return '未知';
    }
  };

  // 过滤和排序交易
  const processedTransactions = React.useMemo(() => {
    let filtered = transactions;

    // 状态过滤
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.status === filter);
    }

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.sourceToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.targetToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.bridgeProtocol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'timestamp':
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, filter, searchTerm, sortBy, sortDirection]);

  // 分页
  const paginatedTransactions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);

  // 处理排序
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // 获取排序图标
  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // 处理交易点击
  const handleTransactionClick = (transaction) => {
    if (onTransactionSelect) {
      onTransactionSelect(transaction);
    }
  };

  if (loading) {
    return (
      <div className="enhanced-crosschain-history loading">
        <div className="loading-spinner"></div>
        <p>加载交易历史中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-crosschain-history error">
        <div className="error-message">
          <h3>加载失败</h3>
          <p>{error}</p>
          <button onClick={loadTransactionHistory} className="retry-button">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-crosschain-history">
      <div className="history-header">
        <h2>跨链交易历史</h2>
        <button onClick={loadTransactionHistory} className="refresh-button">
          🔄 刷新
        </button>
      </div>

      <div className="history-controls">
        <div className="filter-controls">
          <div className="status-filters">
            {['all', 'pending', 'completed', 'failed'].map(status => (
              <button
                key={status}
                className={`filter-button ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? '全部' : getStatusText(status)}
              </button>
            ))}
          </div>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索交易..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="sort-controls">
          <button
            className={`sort-button ${sortBy === 'timestamp' ? 'active' : ''}`}
            onClick={() => handleSort('timestamp')}
          >
            时间 {getSortIcon('timestamp')}
          </button>
          <button
            className={`sort-button ${sortBy === 'amount' ? 'active' : ''}`}
            onClick={() => handleSort('amount')}
          >
            金额 {getSortIcon('amount')}
          </button>
          <button
            className={`sort-button ${sortBy === 'status' ? 'active' : ''}`}
            onClick={() => handleSort('status')}
          >
            状态 {getSortIcon('status')}
          </button>
        </div>
      </div>

      <div className="transaction-list">
        {paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              getNetworkInfo={getNetworkInfo}
              formatTime={formatTime}
              formatAmount={formatAmount}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              onClick={() => handleTransactionClick(transaction)}
            />
          ))
        ) : (
          <div className="empty-state">
            <h3>暂无交易记录</h3>
            <p>
              {searchTerm 
                ? `没有找到包含 "${searchTerm}" 的交易` 
                : filter === 'all' 
                  ? '您还没有进行过跨链交易' 
                  : `没有找到${getStatusText(filter)}的交易`
              }
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </button>
          
          <span className="page-info">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          
          <button
            className="page-button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

// 交易卡片组件
const TransactionCard = ({ 
  transaction, 
  getNetworkInfo, 
  formatTime, 
  formatAmount, 
  getStatusColor, 
  getStatusText,
  onClick 
}) => {
  const sourceNetwork = getNetworkInfo(transaction.sourceChain);
  const targetNetwork = getNetworkInfo(transaction.targetChain);

  return (
    <div className="transaction-card" onClick={onClick}>
      <div className="transaction-main">
        <div className="transaction-route">
          <div className="network-info">
            <span className="network-icon" style={{ color: sourceNetwork.color }}>
              {sourceNetwork.icon}
            </span>
            <span className="network-name">{sourceNetwork.name}</span>
          </div>
          
          <div className="route-arrow">→</div>
          
          <div className="network-info">
            <span className="network-icon" style={{ color: targetNetwork.color }}>
              {targetNetwork.icon}
            </span>
            <span className="network-name">{targetNetwork.name}</span>
          </div>
        </div>

        <div className="transaction-details">
          <div className="amount-info">
            <span className="amount">
              {formatAmount(transaction.amount)} {transaction.sourceToken}
            </span>
            <span className="fee">手续费: {transaction.fee} {transaction.sourceToken}</span>
          </div>
          
          <div className="protocol-info">
            <span className="protocol">{transaction.bridgeProtocol}</span>
            <span className="time">{formatTime(transaction.timestamp)}</span>
          </div>
        </div>
      </div>

      <div className="transaction-status">
        <div 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(transaction.status) }}
        >
          {getStatusText(transaction.status)}
        </div>
        
        {transaction.status === 'pending' && (
          <div className="progress-info">
            <div className="confirmations">
              {transaction.confirmations}/15 确认
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(transaction.confirmations / 15) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {transaction.status === 'failed' && transaction.errorMessage && (
          <div className="error-info">
            <span className="error-message">{transaction.errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCrossChainHistory;

