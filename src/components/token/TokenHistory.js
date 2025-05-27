import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/token/TokenContext';
import '../../styles/token.css';

/**
 * 通证交易历史组件 - 显示用户的CULT通证交易历史记录
 */
const TokenHistory = () => {
  const { 
    transactions, 
    loading, 
    error, 
    fetchTransactions, 
    formatTokenAmount 
  } = useToken();
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // 计算分页数据
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  
  // 处理页码变化
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // 刷新交易历史
  const handleRefresh = () => {
    fetchTransactions();
  };
  
  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 获取交易类型显示
  const getTransactionTypeDisplay = (type) => {
    switch (type) {
      case 'transfer':
        return '转出';
      case 'receive':
        return '收到';
      case 'stake':
        return '质押';
      case 'unstake':
        return '解除质押';
      case 'reward':
        return '奖励';
      default:
        return type;
    }
  };
  
  return (
    <div className="token-history-card">
      <div className="token-history-header">
        <h3>交易历史</h3>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      
      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>加载中...</span>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="no-transactions">
          <i className="fas fa-info-circle"></i>
          <span>暂无交易记录</span>
        </div>
      ) : (
        <>
          <div className="transaction-list">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>类型</th>
                  <th>金额</th>
                  <th>地址</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((tx, index) => (
                  <tr key={index} className={`transaction-item ${tx.type}`}>
                    <td className="transaction-type">
                      {getTransactionTypeDisplay(tx.type)}
                    </td>
                    <td className="transaction-amount">
                      <span className={tx.type === 'receive' || tx.type === 'reward' ? 'positive' : ''}>
                        {tx.type === 'receive' || tx.type === 'reward' ? '+' : '-'}
                        {formatTokenAmount(tx.amount)} CULT
                      </span>
                    </td>
                    <td className="transaction-address">
                      {tx.type === 'transfer' ? formatAddress(tx.to) : formatAddress(tx.from)}
                    </td>
                    <td className="transaction-time">
                      {formatTimestamp(tx.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <span className="page-info">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
      
      <div className="transaction-note">
        <p>
          <i className="fas fa-info-circle"></i>
          显示最近的交易记录，包括转账、质押和奖励。
        </p>
      </div>
    </div>
  );
};

export default TokenHistory;
