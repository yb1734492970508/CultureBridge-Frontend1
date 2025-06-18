import React from 'react';

const TopHeader = () => {
  return (
    <header className="top-header">
      <div className="header-logo">
        <span>🌍</span>
        <span>CultureBridge</span>
      </div>
      <div className="header-actions">
        <div className="cbt-balance">
          💰 1,250 CBT
        </div>
        <button className="notification-btn">
          🔔
        </button>
      </div>
    </header>
  );
};

export default TopHeader;

