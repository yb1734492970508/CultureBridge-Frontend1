import React, { useState } from 'react';
import './styles/NFTLoanHistory.css';

const NFTLoanHistory = () => {
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'liquidated'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount', 'status'

  // 模拟历史记录数据
  const loanHistory = [
    {
      id: 1,
      nft: {
        tokenId: '1234',
        collection: 'CryptoPunks',
        name: 'CryptoPunk #1234',
        image: 'https://via.placeholder.com/80x80/667eea/ffffff?text=1234'
      },
      borrowedAmount: 22.6,
      borrowedToken: 'ETH',
      interestRate: 8.5,
      borrowDate: '2024-05-15',
      repayDate: null,
      status: 'active',
      healthFactor: 1.8,
      totalInterest: 1.2,
      daysActive: 32
    },
    {
      id: 2,
      nft: {
        tokenId: '5678',
        collection: 'Bored Ape Yacht Club',
        name: 'Bored Ape #5678',
        image: 'https://via.placeholder.com/80x80/764ba2/ffffff?text=5678'
      },
      borrowedAmount: 17.2,
      borrowedToken: 'ETH',
      interestRate: 9.2,
      borrowDate: '2024-06-01',
      repayDate: null,
      status: 'active',
      healthFactor: 1.4,
      totalInterest: 0.8,
      daysActive: 15
    },
    {
      id: 3,
      nft: {
        tokenId: '9999',
        collection: 'Azuki',
        name: 'Azuki #9999',
        image: 'https://via.placeholder.com/80x80/ff6b6b/ffffff?text=9999'
      },
      borrowedAmount: 8.5,
      borrowedToken: 'ETH',
      interestRate: 10.1,
      borrowDate: '2024-04-20',
      repayDate: '2024-05-10',
      status: 'completed',
      healthFactor: null,
      totalInterest: 0.6,
      daysActive: 20
    },
    {
      id: 4,
      nft: {
        tokenId: '7777',
        collection: 'Doodles',
        name: 'Doodle #7777',
        image: 'https://via.placeholder.com/80x80/ffa500/ffffff?text=7777'
      },
      borrowedAmount: 5.2,
      borrowedToken: 'ETH',
      interestRate: 11.5,
      borrowDate: '2024-03-15',
      repayDate: null,
      status: 'liquidated',
      healthFactor: null,
      totalInterest: 1.1,
      daysActive: 45
    },
    {
      id: 5,
      nft: {
        tokenId: '3333',
        collection: 'CloneX',
        name: 'CloneX #3333',
        image: 'https://via.placeholder.com/80x80/9c27b0/ffffff?text=3333'
      },
      borrowedAmount: 12.8,
      borrowedToken: 'ETH',
      interestRate: 9.8,
      borrowDate: '2024-02-28',
      repayDate: '2024-04-05',
      status: 'completed',
      healthFactor: null,
      totalInterest: 1.4,
      daysActive: 37
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: '进行中', class: 'status-active' },
      completed: { text: '已完成', class: 'status-completed' },
      liquidated: { text: '已清算', class: 'status-liquidated' }
    };
    return badges[status] || badges.active;
  };

  const getHealthFactorColor = (healthFactor) => {
    if (!healthFactor) return '';
    if (healthFactor >= 1.5) return 'healthy';
    if (healthFactor >= 1.2) return 'warning';
    return 'danger';
  };

  const filteredHistory = loanHistory.filter(loan => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.borrowDate) - new Date(a.borrowDate);
      case 'amount':
        return b.borrowedAmount - a.borrowedAmount;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatsSummary = () => {
    const totalLoans = loanHistory.length;
    const activeLoans = loanHistory.filter(loan => loan.status === 'active').length;
    const completedLoans = loanHistory.filter(loan => loan.status === 'completed').length;
    const liquidatedLoans = loanHistory.filter(loan => loan.status === 'liquidated').length;
    const totalBorrowed = loanHistory.reduce((sum, loan) => sum + loan.borrowedAmount, 0);
    const totalInterest = loanHistory.reduce((sum, loan) => sum + loan.totalInterest, 0);

    return {
      totalLoans,
      activeLoans,
      completedLoans,
      liquidatedLoans,
      totalBorrowed,
      totalInterest
    };
  };

  const stats = getStatsSummary();

  return (
    <div className="nft-loan-history">
      <h2>NFT借贷历史记录</h2>
      <p className="section-description">
        查看您的所有NFT抵押借贷记录和统计信息
      </p>

      {/* 统计概览 */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>总借贷次数</h3>
            <p className="stat-value">{stats.totalLoans}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>进行中</h3>
            <p className="stat-value active">{stats.activeLoans}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>已完成</h3>
            <p className="stat-value completed">{stats.completedLoans}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>已清算</h3>
            <p className="stat-value liquidated">{stats.liquidatedLoans}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>总借款额</h3>
            <p className="stat-value">{stats.totalBorrowed.toFixed(2)} ETH</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>总利息</h3>
            <p className="stat-value">{stats.totalInterest.toFixed(2)} ETH</p>
          </div>
        </div>
      </div>

      {/* 筛选和排序 */}
      <div className="controls">
        <div className="filter-controls">
          <label>筛选状态:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">全部</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="liquidated">已清算</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <label>排序方式:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">按日期</option>
            <option value="amount">按金额</option>
            <option value="status">按状态</option>
          </select>
        </div>
      </div>

      {/* 历史记录列表 */}
      <div className="history-list">
        {sortedHistory.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">📋</div>
            <h3>暂无记录</h3>
            <p>没有找到符合条件的借贷记录</p>
          </div>
        ) : (
          sortedHistory.map((loan) => (
            <div key={loan.id} className="history-item">
              <div className="loan-nft-info">
                <img src={loan.nft.image} alt={loan.nft.name} className="nft-thumbnail" />
                <div className="nft-details">
                  <h4>{loan.nft.name}</h4>
                  <p>{loan.nft.collection}</p>
                </div>
              </div>
              
              <div className="loan-summary">
                <div className="summary-row">
                  <span className="label">借款金额:</span>
                  <span className="value">{loan.borrowedAmount} {loan.borrowedToken}</span>
                </div>
                <div className="summary-row">
                  <span className="label">利率:</span>
                  <span className="value">{loan.interestRate}%</span>
                </div>
                <div className="summary-row">
                  <span className="label">借款日期:</span>
                  <span className="value">{loan.borrowDate}</span>
                </div>
                {loan.repayDate && (
                  <div className="summary-row">
                    <span className="label">还款日期:</span>
                    <span className="value">{loan.repayDate}</span>
                  </div>
                )}
              </div>
              
              <div className="loan-metrics">
                <div className="metric">
                  <span className="metric-label">总利息:</span>
                  <span className="metric-value">{loan.totalInterest} ETH</span>
                </div>
                <div className="metric">
                  <span className="metric-label">借款天数:</span>
                  <span className="metric-value">{loan.daysActive} 天</span>
                </div>
                {loan.healthFactor && (
                  <div className="metric">
                    <span className="metric-label">健康因子:</span>
                    <span className={`metric-value health-factor ${getHealthFactorColor(loan.healthFactor)}`}>
                      {loan.healthFactor}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="loan-status">
                <span className={`status-badge ${getStatusBadge(loan.status).class}`}>
                  {getStatusBadge(loan.status).text}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NFTLoanHistory;

