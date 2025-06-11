import React, { useState } from 'react';

/**
 * 快速操作组件
 * 提供常用的快速操作按钮
 */
const QuickActions = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 处理刷新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // 处理其他快速操作
  const handleAction = (action) => {
    console.log(`执行快速操作: ${action}`);
    // 这里可以添加实际的操作逻辑
  };

  return (
    <div className="quick-actions">
      <button 
        className={`action-button refresh ${isRefreshing ? 'refreshing' : ''}`}
        onClick={handleRefresh}
        disabled={isRefreshing}
        title="刷新资产数据"
      >
        <span className="action-icon">🔄</span>
        <span className="action-text">
          {isRefreshing ? '刷新中...' : '刷新'}
        </span>
      </button>
      
      <button 
        className="action-button primary"
        onClick={() => handleAction('bridge')}
        title="跨链转账"
      >
        <span className="action-icon">🌉</span>
        <span className="action-text">跨链</span>
      </button>
      
      <button 
        className="action-button"
        onClick={() => handleAction('swap')}
        title="代币交换"
      >
        <span className="action-icon">🔄</span>
        <span className="action-text">交换</span>
      </button>
      
      <button 
        className="action-button"
        onClick={() => handleAction('stake')}
        title="质押代币"
      >
        <span className="action-icon">🔒</span>
        <span className="action-text">质押</span>
      </button>
      
      <div className="action-dropdown">
        <button 
          className="action-button dropdown-toggle"
          onClick={() => handleAction('more')}
          title="更多操作"
        >
          <span className="action-icon">⋯</span>
          <span className="action-text">更多</span>
        </button>
        
        <div className="dropdown-menu">
          <button 
            className="dropdown-item"
            onClick={() => handleAction('history')}
          >
            📊 交易历史
          </button>
          <button 
            className="dropdown-item"
            onClick={() => handleAction('analytics')}
          >
            📈 数据分析
          </button>
          <button 
            className="dropdown-item"
            onClick={() => handleAction('export')}
          >
            📁 导出数据
          </button>
          <button 
            className="dropdown-item"
            onClick={() => handleAction('settings')}
          >
            ⚙️ 设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;

