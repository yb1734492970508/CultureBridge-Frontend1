import React, { useState, useEffect, useCallback } from 'react';
import { useNotificationSystem } from '../../hooks/useNotificationSystem';
import NotificationItem from './NotificationItem';
import NotificationSettings from './NotificationSettings';
import './NotificationCenter.css';

/**
 * 通知中心组件
 * 管理和显示用户的所有通知
 */
const NotificationCenter = ({
  currentUser,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('all'); // all, unread, mentions, likes, follows, governance
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const {
    notifications,
    unreadCount,
    settings,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    updateSettings,
    subscribeToRealtime,
    unsubscribeFromRealtime
  } = useNotificationSystem(currentUser?.address);

  // 初始化和实时订阅
  useEffect(() => {
    if (currentUser?.address) {
      fetchNotifications();
      subscribeToRealtime();
      
      return () => {
        unsubscribeFromRealtime();
      };
    }
  }, [currentUser?.address, fetchNotifications, subscribeToRealtime, unsubscribeFromRealtime]);

  // 筛选通知
  const getFilteredNotifications = () => {
    let filtered = notifications;

    switch (activeTab) {
      case 'unread':
        filtered = notifications.filter(n => !n.read);
        break;
      case 'mentions':
        filtered = notifications.filter(n => n.type === 'mention');
        break;
      case 'likes':
        filtered = notifications.filter(n => n.type === 'like');
        break;
      case 'follows':
        filtered = notifications.filter(n => n.type === 'follow');
        break;
      case 'governance':
        filtered = notifications.filter(n => n.type === 'governance');
        break;
      default:
        filtered = notifications;
    }

    return filtered;
  };

  // 处理标记为已读
  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  }, [markAsRead]);

  // 处理全部标记为已读
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('全部标记已读失败:', err);
    }
  }, [markAllAsRead]);

  // 处理删除通知
  const handleDeleteNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error('删除通知失败:', err);
    }
  }, [deleteNotification]);

  // 处理批量操作
  const handleBatchOperation = useCallback(async (operation) => {
    if (selectedNotifications.length === 0) return;

    try {
      switch (operation) {
        case 'markRead':
          await Promise.all(selectedNotifications.map(id => markAsRead(id)));
          break;
        case 'delete':
          await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
          break;
      }
      setSelectedNotifications([]);
    } catch (err) {
      console.error('批量操作失败:', err);
    }
  }, [selectedNotifications, markAsRead, deleteNotification]);

  // 处理通知选择
  const handleNotificationSelect = useCallback((notificationId, selected) => {
    setSelectedNotifications(prev => 
      selected 
        ? [...prev, notificationId]
        : prev.filter(id => id !== notificationId)
    );
  }, []);

  // 渲染标签页
  const renderTabs = () => {
    const tabs = [
      { id: 'all', label: '全部', count: notifications.length },
      { id: 'unread', label: '未读', count: unreadCount },
      { id: 'mentions', label: '提及', count: notifications.filter(n => n.type === 'mention').length },
      { id: 'likes', label: '点赞', count: notifications.filter(n => n.type === 'like').length },
      { id: 'follows', label: '关注', count: notifications.filter(n => n.type === 'follow').length },
      { id: 'governance', label: '治理', count: notifications.filter(n => n.type === 'governance').length }
    ];

    return (
      <div className="notification-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            {tab.count > 0 && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  // 渲染操作栏
  const renderActionBar = () => (
    <div className="notification-actions">
      <div className="actions-left">
        {selectedNotifications.length > 0 && (
          <div className="batch-actions">
            <span className="selected-count">
              已选择 {selectedNotifications.length} 条通知
            </span>
            <button
              className="batch-button"
              onClick={() => handleBatchOperation('markRead')}
            >
              标记已读
            </button>
            <button
              className="batch-button delete"
              onClick={() => handleBatchOperation('delete')}
            >
              删除
            </button>
          </div>
        )}
      </div>

      <div className="actions-right">
        <button
          className="action-button"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          全部已读
        </button>
        <button
          className="action-button"
          onClick={() => setShowSettings(true)}
        >
          通知设置
        </button>
      </div>
    </div>
  );

  // 渲染通知列表
  const renderNotificationList = () => {
    const filteredNotifications = getFilteredNotifications();

    if (loading && notifications.length === 0) {
      return (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>正在加载通知...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>加载失败</h3>
          <p>{error.message}</p>
          <button onClick={fetchNotifications}>
            重试
          </button>
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <div className="empty-notifications">
          <div className="empty-icon">🔔</div>
          <h3>暂无通知</h3>
          <p>
            {activeTab === 'all' 
              ? '您还没有收到任何通知'
              : `暂无${activeTab === 'unread' ? '未读' : activeTab === 'mentions' ? '提及' : activeTab === 'likes' ? '点赞' : activeTab === 'follows' ? '关注' : '治理'}通知`
            }
          </p>
        </div>
      );
    }

    return (
      <div className="notifications-list">
        {filteredNotifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            selected={selectedNotifications.includes(notification.id)}
            onSelect={handleNotificationSelect}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
          />
        ))}
      </div>
    );
  };

  // 渲染统计信息
  const renderStats = () => (
    <div className="notification-stats">
      <div className="stat-item">
        <div className="stat-value">{notifications.length}</div>
        <div className="stat-label">总通知</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{unreadCount}</div>
        <div className="stat-label">未读</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">
          {notifications.filter(n => n.createdAt > Date.now() - 24 * 60 * 60 * 1000).length}
        </div>
        <div className="stat-label">今日</div>
      </div>
    </div>
  );

  return (
    <div className={`notification-center ${className}`}>
      {/* 页面头部 */}
      <div className="notification-header">
        <div className="header-content">
          <h1 className="notification-title">
            通知中心
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </h1>
          <p className="notification-subtitle">
            管理您的所有通知和提醒
          </p>
        </div>

        {/* 统计信息 */}
        {renderStats()}
      </div>

      {/* 标签页 */}
      {renderTabs()}

      {/* 操作栏 */}
      {renderActionBar()}

      {/* 通知列表 */}
      {renderNotificationList()}

      {/* 通知设置模态框 */}
      {showSettings && (
        <NotificationSettings
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 状态指示器 */}
      {loading && notifications.length > 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner small" />
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

