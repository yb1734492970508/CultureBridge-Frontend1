import React, { useContext, useState, useEffect } from 'react';
import { TokenContext } from '../../context/blockchain/TokenContext';
import { BlockchainContext } from '../../context/blockchain';
import './TokenTransactionHistory.css';

/**
 * 文化通证交易历史组件
 * 显示用户的CULT通证交易历史记录
 */
const TokenTransactionHistory = () => {
  const { transactionHistory, fetchTransactionHistory, isLoading, error } = useContext(TokenContext);
  const { isConnected, account } = useContext(BlockchainContext);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // 筛选状态
  const [filter, setFilter] = useState('all'); // 'all', 'sent', 'received'
  
  // 初始加载交易历史
  useEffect(() => {
    if (isConnected && account) {
      fetchTransactionHistory();
    }
  }, [isConnected, account]);
  
  // 处理刷新
  const handleRefresh = () => {
    fetchTransactionHistory();
  };
  
  // 处理筛选变化
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // 重置到第一页
  };
  
  // 筛选交易历史
  const filteredHistory = transactionHistory.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });
  
  // 计算分页
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  
  // 处理页面变化
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // 格式化地址显示
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 格式化日期显示
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };
  
  return (
    <div className="transaction-history-container">
      <div className="transaction-history-header">
        <h2>交易历史</h2>
        <div className="transaction-history-actions">
          <select 
            className="transaction-history-filter"
            value={filter}
            onChange={handleFilterChange}
            disabled={isLoading || !isConnected}
          >
            <option value="all">全部</option>
            <option value="sent">已发送</option>
            <option value="received">已接收</option>
          </select>
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            disabled={isLoading || !isConnected}
          >
            {isLoading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>
      
      <div className="transaction-history-content">
        {!isConnected ? (
          <div className="transaction-history-not-connected">
            <p>请连接钱包查看交易历史</p>
          </div>
        ) : error ? (
          <div className="transaction-history-error">
            <p>获取交易历史失败: {error}</p>
          </div>
        ) : isLoading ? (
          <div className="transaction-history-loading">
            <p>加载中...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="transaction-history-empty">
            <p>暂无交易记录</p>
          </div>
        ) : (
          <>
            <table className="transaction-history-table">
              <thead>
                <tr>
                  <th>类型</th>
                  <th>发送方</th>
                  <th>接收方</th>
                  <th>金额</th>
                  <th>时间</th>
                  <th>详情</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((tx, index) => (
                  <tr key={index} className={tx.type === 'sent' ? 'sent-tx' : 'received-tx'}>
                    <td>
                      <span className={`tx-type ${tx.type}`}>
                        {tx.type === 'sent' ? '发送' : '接收'}
                      </span>
                    </td>
                    <td>{formatAddress(tx.from)}</td>
                    <td>{formatAddress(tx.to)}</td>
                    <td>{parseFloat(tx.value).toFixed(2)} CULT</td>
                    <td>{formatDate(tx.timestamp)}</td>
                    <td>
                      <a 
                        href={`https://etherscan.io/tx/${tx.hash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="tx-link"
                      >
                        查看
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="transaction-history-pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  上一页
                </button>
                <span className="pagination-info">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TokenTransactionHistory;
