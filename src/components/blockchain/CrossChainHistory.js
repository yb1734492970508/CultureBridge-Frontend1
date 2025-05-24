import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './CrossChainHistory.css';

/**
 * 跨链交易历史组件
 * 显示用户的跨链转账历史记录和状态
 */
const CrossChainHistory = ({ pendingTxs = [], onClaimToken }) => {
  const { active, account } = useBlockchain();
  
  // 过滤和排序状态
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed', 'failed'
  const [sortBy, setSortBy] = useState('time'); // 'time', 'amount', 'chain'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // 支持的区块链网络
  const supportedNetworks = {
    1: { name: '以太坊主网', icon: '🔷', currency: 'ETH' },
    56: { name: '币安智能链', icon: '🟡', currency: 'BNB' },
    137: { name: 'Polygon', icon: '🟣', currency: 'MATIC' },
    42161: { name: 'Arbitrum', icon: '🔶', currency: 'ETH' },
    10: { name: 'Optimism', icon: '🔴', currency: 'ETH' },
    43114: { name: 'Avalanche', icon: '❄️', currency: 'AVAX' },
    // 测试网络
    5: { name: 'Goerli测试网', icon: '🔷', currency: 'ETH' },
    97: { name: 'BSC测试网', icon: '🟡', currency: 'BNB' },
    80001: { name: 'Mumbai测试网', icon: '🟣', currency: 'MATIC' }
  };
  
  // 获取网络信息
  const getNetworkInfo = (id) => {
    return supportedNetworks[id] || { name: '未知网络', icon: '❓', currency: 'ETH' };
  };
  
  // 过滤交易
  const filteredTransactions = pendingTxs.filter(tx => {
    if (filter === 'all') return true;
    return tx.status === filter;
  });
  
  // 排序交易
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'time') {
      comparison = a.timestamp - b.timestamp;
    } else if (sortBy === 'amount') {
      const amountA = ethers.BigNumber.from(a.amount);
      const amountB = ethers.BigNumber.from(b.amount);
      comparison = amountA.lt(amountB) ? -1 : amountA.gt(amountB) ? 1 : 0;
    } else if (sortBy === 'chain') {
      comparison = a.targetChainId - b.targetChainId;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // 计算分页
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  
  // 切换排序方向
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  // 更改排序字段
  const changeSortBy = (field) => {
    if (sortBy === field) {
      toggleSortDirection();
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // 格式化金额
  const formatAmount = (amount, decimals = 18) => {
    try {
      const formattedAmount = ethers.utils.formatUnits(amount, decimals);
      return parseFloat(formattedAmount).toFixed(6);
    } catch (err) {
      console.error('格式化金额失败:', err);
      return '0';
    }
  };
  
  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };
  
  // 格式化交易哈希
  const formatTxHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };
  
  // 获取交易状态标签
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return { label: '处理中', className: 'status-pending' };
      case 'completed':
        return { label: '已完成', className: 'status-completed' };
      case 'failed':
        return { label: '失败', className: 'status-failed' };
      default:
        return { label: '未知', className: 'status-unknown' };
    }
  };
  
  // 获取交易链接
  const getExplorerLink = (txHash, chainId) => {
    let baseUrl = '';
    
    switch (chainId) {
      case 1:
        baseUrl = 'https://etherscan.io/tx/';
        break;
      case 56:
        baseUrl = 'https://bscscan.com/tx/';
        break;
      case 137:
        baseUrl = 'https://polygonscan.com/tx/';
        break;
      case 42161:
        baseUrl = 'https://arbiscan.io/tx/';
        break;
      case 10:
        baseUrl = 'https://optimistic.etherscan.io/tx/';
        break;
      case 43114:
        baseUrl = 'https://snowtrace.io/tx/';
        break;
      // 测试网
      case 5:
        baseUrl = 'https://goerli.etherscan.io/tx/';
        break;
      case 97:
        baseUrl = 'https://testnet.bscscan.com/tx/';
        break;
      case 80001:
        baseUrl = 'https://mumbai.polygonscan.com/tx/';
        break;
      default:
        baseUrl = 'https://etherscan.io/tx/';
    }
    
    return `${baseUrl}${txHash}`;
  };
  
  // 处理分页
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // 渲染分页控件
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        
        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lsaquo;
        </button>
        
        <span className="pagination-info">
          {currentPage} / {totalPages}
        </span>
        
        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &rsaquo;
        </button>
        
        <button
          className="pagination-button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
      </div>
    );
  };
  
  // 渲染过滤器
  const renderFilters = () => {
    return (
      <div className="history-filters">
        <div className="filter-group">
          <label>状态:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">全部</option>
            <option value="pending">处理中</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>排序:</label>
          <div className="sort-buttons">
            <button
              className={`sort-button ${sortBy === 'time' ? 'active' : ''}`}
              onClick={() => changeSortBy('time')}
            >
              时间 {sortBy === 'time' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`sort-button ${sortBy === 'amount' ? 'active' : ''}`}
              onClick={() => changeSortBy('amount')}
            >
              金额 {sortBy === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`sort-button ${sortBy === 'chain' ? 'active' : ''}`}
              onClick={() => changeSortBy('chain')}
            >
              目标链 {sortBy === 'chain' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染交易列表
  const renderTransactions = () => {
    if (!active) {
      return (
        <div className="connect-wallet-message">
          请连接钱包查看您的跨链交易历史
        </div>
      );
    }
    
    if (filteredTransactions.length === 0) {
      return (
        <div className="no-transactions-message">
          没有找到符合条件的跨链交易
        </div>
      );
    }
    
    return (
      <div className="transactions-list">
        {currentItems.map((tx, index) => {
          const sourceNetwork = getNetworkInfo(tx.sourceChainId);
          const targetNetwork = getNetworkInfo(tx.targetChainId);
          const status = getStatusLabel(tx.status);
          
          return (
            <div key={tx.txHash} className="transaction-item">
              <div className="transaction-header">
                <div className="transaction-networks">
                  <span className="network-badge">
                    {sourceNetwork.icon} {sourceNetwork.name}
                  </span>
                  <span className="network-arrow">→</span>
                  <span className="network-badge">
                    {targetNetwork.icon} {targetNetwork.name}
                  </span>
                </div>
                <div className={`transaction-status ${status.className}`}>
                  {status.label}
                </div>
              </div>
              
              <div className="transaction-details">
                <div className="transaction-info">
                  <div className="info-row">
                    <span className="info-label">金额:</span>
                    <span className="info-value">
                      {formatAmount(tx.amount)} {tx.tokenSymbol}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">交易哈希:</span>
                    <a
                      href={getExplorerLink(tx.txHash, tx.sourceChainId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-value hash-link"
                    >
                      {formatTxHash(tx.txHash)}
                    </a>
                  </div>
                  <div className="info-row">
                    <span className="info-label">时间:</span>
                    <span className="info-value">
                      {formatTime(tx.timestamp)}
                    </span>
                  </div>
                </div>
                
                {tx.status === 'pending' && tx.canClaim && (
                  <button
                    className="claim-button"
                    onClick={() => onClaimToken(tx)}
                  >
                    领取资产
                  </button>
                )}
                
                {tx.status === 'failed' && tx.failReason && (
                  <div className="failure-reason">
                    失败原因: {tx.failReason}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="cross-chain-history">
      <h3>跨链交易历史</h3>
      
      {renderFilters()}
      {renderTransactions()}
      {renderPagination()}
    </div>
  );
};

export default CrossChainHistory;
