/**
 * 翻译请求状态组件
 * 用于展示翻译请求的实时状态和进度
 */

import React, { useState, useEffect } from 'react';
import { useRequestStatusMonitor, getStatusColor, getStatusIcon, getStatusProgress, getStatusChangeDescription } from '../../utils/RequestStatusNotifier';
import './RequestStatusTracker.css';

const RequestStatusTracker = ({ requestId, onStatusChange }) => {
  const { requestStatus, statusChanged, loading, error } = useRequestStatusMonitor(requestId);
  const [showNotification, setShowNotification] = useState(false);
  const [previousStatus, setPreviousStatus] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);

  // 处理状态变化
  useEffect(() => {
    if (statusChanged && requestStatus && previousStatus) {
      // 显示状态变化通知
      setShowNotification(true);
      
      // 3秒后自动隐藏通知
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      // 更新状态历史
      setStatusHistory(prev => [
        ...prev,
        {
          from: previousStatus,
          to: requestStatus,
          timestamp: new Date().toISOString()
        }
      ]);
      
      // 触发外部状态变化回调
      if (onStatusChange) {
        onStatusChange(previousStatus, requestStatus);
      }
    }
    
    if (requestStatus && requestStatus !== previousStatus) {
      setPreviousStatus(requestStatus);
    }
  }, [requestStatus, statusChanged, previousStatus, onStatusChange]);

  if (loading && !requestStatus) {
    return (
      <div className="request-status-tracker loading">
        <div className="status-spinner"></div>
        <p>加载请求状态...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="request-status-tracker error">
        <div className="status-icon error-icon">!</div>
        <p>加载状态失败: {error}</p>
      </div>
    );
  }

  if (!requestStatus) {
    return (
      <div className="request-status-tracker not-found">
        <div className="status-icon not-found-icon">?</div>
        <p>未找到请求信息</p>
      </div>
    );
  }

  const statusColor = getStatusColor(requestStatus);
  const statusIcon = getStatusIcon(requestStatus);
  const progressPercentage = getStatusProgress(requestStatus);

  return (
    <div className="request-status-tracker">
      {/* 状态变化通知 */}
      {showNotification && previousStatus && (
        <div className="status-notification" style={{ backgroundColor: getStatusColor(requestStatus) }}>
          <span className="notification-icon">{statusIcon}</span>
          <span className="notification-text">
            {getStatusChangeDescription(previousStatus, requestStatus)}
          </span>
        </div>
      )}

      {/* 当前状态展示 */}
      <div className="current-status" style={{ borderColor: statusColor }}>
        <div className="status-icon" style={{ backgroundColor: statusColor }}>
          <i className={`icon-${statusIcon}`}></i>
        </div>
        <div className="status-details">
          <h3 className="status-title" style={{ color: statusColor }}>{requestStatus}</h3>
          <div className="status-progress-container">
            <div 
              className="status-progress-bar" 
              style={{ width: `${progressPercentage}%`, backgroundColor: statusColor }}
            ></div>
          </div>
          <p className="status-description">
            {getStatusChangeDescription(previousStatus, requestStatus)}
          </p>
        </div>
      </div>

      {/* 状态历史时间线 */}
      {statusHistory.length > 0 && (
        <div className="status-history">
          <h4>状态历史</h4>
          <div className="status-timeline">
            {statusHistory.map((change, index) => (
              <div key={index} className="timeline-item">
                <div 
                  className="timeline-point" 
                  style={{ backgroundColor: getStatusColor(change.to) }}
                ></div>
                <div className="timeline-content">
                  <p className="timeline-title">
                    <span style={{ color: getStatusColor(change.from) }}>{change.from}</span>
                    <span className="timeline-arrow">→</span>
                    <span style={{ color: getStatusColor(change.to) }}>{change.to}</span>
                  </p>
                  <p className="timeline-time">
                    {new Date(change.timestamp).toLocaleString()}
                  </p>
                  <p className="timeline-description">
                    {getStatusChangeDescription(change.from, change.to)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestStatusTracker;
