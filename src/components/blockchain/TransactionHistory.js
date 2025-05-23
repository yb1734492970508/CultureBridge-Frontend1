import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './TransactionHistory.css';

/**
 * 交易历史记录组件
 * 显示用户的以太坊交易历史
 */
const TransactionHistory = () => {
  const { active, account, library, chainId } = useBlockchain();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // 获取交易历史
  const fetchTransactions = async (pageNum = 1) => {
    if (!active || !account || !library) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 在实际应用中，应该使用Etherscan API或其他区块链浏览器API
      // 这里我们模拟获取交易历史
      const pageSize = 10;
      const startBlock = 'latest'; // 或者指定一个起始区块
      
      // 获取最新区块号
      const blockNumber = await library.getBlockNumber();
      
      // 模拟交易数据
      // 在实际应用中，这里应该调用API获取真实数据
      const mockTransactions = Array(pageSize).fill(0).map((_, index) => {
        const txIndex = (pageNum - 1) * pageSize + index;
        const randomHash = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        const randomValue = Math.random() * 2;
        const isOutgoing = Math.random() > 0.5;
        const randomAddress = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        
        return {
          hash: randomHash,
          blockNumber: blockNumber - txIndex,
          timeStamp: Math.floor(Date.now() / 1000) - txIndex * 3600,
          from: isOutgoing ? account : randomAddress,
          to: isOutgoing ? randomAddress : account,
          value: ethers.utils.parseEther(randomValue.toFixed(6).toString()),
          gasPrice: ethers.utils.parseUnits('50', 'gwei'),
          gasUsed: '21000',
          confirmations: txIndex < 5 ? txIndex + 1 : 12,
          isError: Math.random() > 0.9 ? '1' : '0', // 10%的概率是失败的交易
        };
      });
      
      // 更新状态
      if (pageNum === 1) {
        setTransactions(mockTransactions);
      } else {
        setTransactions(prev => [...prev, ...mockTransactions]);
      }
      
      // 模拟是否有更多数据
      setHasMore(pageNum < 3); // 假设只有3页数据
      
    } catch (err) {
      console.error('获取交易历史失败:', err);
      setError('无法加载交易历史，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 当账户或链ID变化时重新获取交易
  useEffect(() => {
    if (active && account) {
      setPage(1);
      fetchTransactions(1);
    } else {
      setTransactions([]);
    }
  }, [active, account, chainId]);
  
  // 加载更多交易
  const loadMore = () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage);
  };
  
  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };
  
  // 格式化ETH值
  const formatEther = (value) => {
    if (!value) return '0';
    return parseFloat(ethers.utils.formatEther(value)).toFixed(6);
  };
  
  // 获取交易类型
  const getTransactionType = (tx) => {
    if (tx.from.toLowerCase() === account.toLowerCase() && tx.to.toLowerCase() === account.toLowerCase()) {
      return 'self';
    } else if (tx.from.toLowerCase() === account.toLowerCase()) {
      return 'outgoing';
    } else {
      return 'incoming';
    }
  };
  
  // 获取交易状态类名
  const getStatusClass = (tx) => {
    const type = getTransactionType(tx);
    if (tx.isError === '1') return 'tx-failed';
    if (type === 'incoming') return 'tx-incoming';
    if (type === 'outgoing') return 'tx-outgoing';
    return 'tx-self';
  };
  
  // 获取交易状态文本
  const getStatusText = (tx) => {
    if (tx.isError === '1') return '失败';
    
    const type = getTransactionType(tx);
    if (type === 'incoming') return '收款';
    if (type === 'outgoing') return '转账';
    return '自我转账';
  };
  
  // 获取交易确认状态
  const getConfirmationStatus = (tx) => {
    if (tx.confirmations < 1) return '待确认';
    if (tx.confirmations < 6) return `${tx.confirmations}个确认`;
    return '已确认';
  };
  
  // 获取区块浏览器URL
  const getExplorerUrl = (txHash) => {
    let baseUrl;
    
    switch (chainId) {
      case 1:
        baseUrl = 'https://etherscan.io';
        break;
      case 3:
        baseUrl = 'https://ropsten.etherscan.io';
        break;
      case 4:
        baseUrl = 'https://rinkeby.etherscan.io';
        break;
      case 5:
        baseUrl = 'https://goerli.etherscan.io';
        break;
      case 42:
        baseUrl = 'https://kovan.etherscan.io';
        break;
      case 56:
        baseUrl = 'https://bscscan.com';
        break;
      case 97:
        baseUrl = 'https://testnet.bscscan.com';
        break;
      default:
        baseUrl = 'https://etherscan.io';
    }
    
    return `${baseUrl}/tx/${txHash}`;
  };
  
  // 渲染交易列表
  const renderTransactions = () => {
    if (!active) {
      return (
        <div className="tx-message">
          <p>请连接您的钱包以查看交易历史</p>
        </div>
      );
    }
    
    if (isLoading && transactions.length === 0) {
      return (
        <div className="tx-loading">
          <div className="tx-loading-spinner"></div>
          <p>加载交易历史...</p>
        </div>
      );
    }
    
    if (error && transactions.length === 0) {
      return (
        <div className="tx-error">
          <p>{error}</p>
          <button onClick={() => fetchTransactions(1)}>重试</button>
        </div>
      );
    }
    
    if (transactions.length === 0) {
      return (
        <div className="tx-empty">
          <p>没有找到交易记录</p>
        </div>
      );
    }
    
    return (
      <>
        <div className="tx-list">
          {transactions.map((tx, index) => (
            <div key={`${tx.hash}-${index}`} className={`tx-item ${getStatusClass(tx)}`}>
              <div className="tx-icon">
                {getTransactionType(tx) === 'incoming' ? (
                  <span className="icon-incoming">↓</span>
                ) : getTransactionType(tx) === 'outgoing' ? (
                  <span className="icon-outgoing">↑</span>
                ) : (
                  <span className="icon-self">↻</span>
                )}
              </div>
              
              <div className="tx-details">
                <div className="tx-header">
                  <span className="tx-status">{getStatusText(tx)}</span>
                  <span className="tx-time">{formatTimestamp(tx.timeStamp)}</span>
                </div>
                
                <div className="tx-addresses">
                  <div className="tx-from">
                    <span className="address-label">从:</span>
                    <span className="address-value">{formatAddress(tx.from)}</span>
                  </div>
                  <div className="tx-to">
                    <span className="address-label">至:</span>
                    <span className="address-value">{formatAddress(tx.to)}</span>
                  </div>
                </div>
                
                <div className="tx-footer">
                  <span className="tx-confirmation">{getConfirmationStatus(tx)}</span>
                  <a 
                    href={getExplorerUrl(tx.hash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="tx-explorer-link"
                  >
                    查看详情
                  </a>
                </div>
              </div>
              
              <div className="tx-amount">
                <span className={`amount-value ${getTransactionType(tx)}`}>
                  {getTransactionType(tx) === 'incoming' ? '+' : 
                   getTransactionType(tx) === 'outgoing' ? '-' : ''}
                  {formatEther(tx.value)} ETH
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="tx-load-more">
            <button 
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? '加载中...' : '加载更多'}
            </button>
          </div>
        )}
      </>
    );
  };
  
  return (
    <div className="transaction-history">
      <div className="tx-header">
        <h2>交易历史</h2>
        <p>查看您的以太坊交易记录</p>
      </div>
      
      <div className="tx-content">
        {renderTransactions()}
      </div>
    </div>
  );
};

export default TransactionHistory;
