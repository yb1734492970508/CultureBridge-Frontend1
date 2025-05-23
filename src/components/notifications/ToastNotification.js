import React, { useState, useEffect } from 'react';
import '../../styles/components/notifications/ToastNotification.css';

/**
 * 链上事件通知组件
 * 用于显示区块链交易和事件的实时通知
 */
const ToastNotification = ({ notifications, position = 'top-right' }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // 当有新通知时，添加到可见通知列表
    if (notifications && notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      
      // 添加唯一ID和自动消失时间
      const notificationWithId = {
        ...latestNotification,
        id: `notification-${Date.now()}`,
        timestamp: Date.now()
      };
      
      setVisibleNotifications(prev => [...prev, notificationWithId]);
      
      // 设置自动消失定时器
      const timeout = setTimeout(() => {
        setVisibleNotifications(prev => 
          prev.filter(n => n.id !== notificationWithId.id)
        );
      }, latestNotification.duration || 5000);
      
      // 清理定时器
      return () => clearTimeout(timeout);
    }
  }, [notifications]);
  
  // 手动关闭通知
  const closeNotification = (id) => {
    setVisibleNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };
  
  // 获取通知类型对应的图标
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };
  
  // 获取交易状态对应的进度指示器
  const getTransactionProgress = (status) => {
    if (!status || status === 'pending') {
      return (
        <div className="transaction-progress pending">
          <div className="spinner"></div>
          <span>交易处理中...</span>
        </div>
      );
    } else if (status === 'confirmed') {
      return (
        <div className="transaction-progress confirmed">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>交易已确认</span>
        </div>
      );
    } else if (status === 'failed') {
      return (
        <div className="transaction-progress failed">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span>交易失败</span>
        </div>
      );
    }
    return null;
  };
  
  // 如果没有可见通知，不渲染任何内容
  if (visibleNotifications.length === 0) {
    return null;
  }
  
  return (
    <div className={`toast-container ${position}`}>
      {visibleNotifications.map(notification => (
        <div 
          key={notification.id} 
          className={`toast-notification ${notification.type || 'info'} ${notification.animate ? 'animate' : ''}`}
        >
          <div className="toast-icon">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="toast-content">
            {notification.title && (
              <div className="toast-title">{notification.title}</div>
            )}
            
            <div className="toast-message">{notification.message}</div>
            
            {notification.txHash && (
              <div className="toast-transaction">
                <a 
                  href={`https://testnet.bscscan.com/tx/${notification.txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transaction-link"
                >
                  查看交易
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                {getTransactionProgress(notification.status)}
              </div>
            )}
          </div>
          
          <button 
            className="toast-close" 
            onClick={() => closeNotification(notification.id)}
            aria-label="关闭通知"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;
