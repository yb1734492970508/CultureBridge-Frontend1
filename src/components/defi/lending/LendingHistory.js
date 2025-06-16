import React from 'react';
import './styles/LendingHistory.css';

const LendingHistory = () => {
  // Dummy data for demonstration
  const history = [
    { id: 1, type: 'Supply', asset: 'ETH', amount: 1.5, date: '2024-06-01', status: 'Completed' },
    { id: 2, type: 'Borrow', asset: 'USDT', amount: 500, date: '2024-06-05', status: 'Completed' },
    { id: 3, type: 'Repay', asset: 'USDT', amount: 100, date: '2024-06-10', status: 'Completed' },
    { id: 4, type: 'Withdraw', asset: 'ETH', amount: 0.5, date: '2024-06-12', status: 'Pending' },
  ];

  return (
    <div className="lending-history">
      <h2>借贷历史记录</h2>
      <div className="history-list">
        {history.length > 0 ? (
          history.map((item) => (
            <div key={item.id} className="history-item">
              <span className={`history-type ${item.type.toLowerCase()}`}>{item.type}</span>
              <span className="history-asset">{item.amount} {item.asset}</span>
              <span className="history-date">{item.date}</span>
              <span className={`history-status ${item.status.toLowerCase()}`}>{item.status}</span>
            </div>
          ))
        ) : (
          <p>暂无借贷历史记录。</p>
        )}
      </div>
    </div>
  );
};

export default LendingHistory;


