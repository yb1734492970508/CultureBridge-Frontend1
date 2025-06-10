/**
 * 翻译请求状态通知系统
 * 用于实时监控和通知翻译请求状态变化
 */

import { useEffect, useState } from 'react';
import BlockchainConnector from './BlockchainConnector';

/**
 * 请求状态监控钩子
 * @param {string} requestId 请求ID
 * @param {number} pollingInterval 轮询间隔(毫秒)
 * @returns {Object} 请求状态和通知信息
 */
export const useRequestStatusMonitor = (requestId, pollingInterval = 10000) => {
  const [requestStatus, setRequestStatus] = useState(null);
  const [previousStatus, setPreviousStatus] = useState(null);
  const [statusChanged, setStatusChanged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;
    let isMounted = true;

    const fetchRequestStatus = async () => {
      if (!requestId) return;
      
      try {
        setLoading(true);
        
        // 获取请求详情
        const translationMarket = BlockchainConnector.translationMarket;
        if (!translationMarket) {
          throw new Error('TranslationMarket合约实例未初始化');
        }
        
        const request = await translationMarket.requests(requestId);
        const currentStatus = BlockchainConnector.getRequestStatusString(request.status);
        
        if (isMounted) {
          // 检查状态是否变化
          if (previousStatus && previousStatus !== currentStatus) {
            setStatusChanged(true);
            // 触发浏览器通知
            triggerNotification(requestId, previousStatus, currentStatus);
          } else {
            setStatusChanged(false);
          }
          
          setRequestStatus(currentStatus);
          setPreviousStatus(currentStatus);
          setLoading(false);
        }
      } catch (err) {
        console.error('获取请求状态失败:', err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    // 初始获取状态
    fetchRequestStatus();
    
    // 设置轮询
    if (requestId) {
      intervalId = setInterval(fetchRequestStatus, pollingInterval);
    }
    
    // 清理函数
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [requestId, pollingInterval, previousStatus]);

  return { requestStatus, statusChanged, loading, error };
};

/**
 * 触发浏览器通知
 * @param {string} requestId 请求ID
 * @param {string} oldStatus 旧状态
 * @param {string} newStatus 新状态
 */
const triggerNotification = (requestId, oldStatus, newStatus) => {
  // 检查浏览器通知权限
  if (!('Notification' in window)) {
    console.log('此浏览器不支持通知');
    return;
  }
  
  if (Notification.permission === 'granted') {
    createNotification(requestId, oldStatus, newStatus);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        createNotification(requestId, oldStatus, newStatus);
      }
    });
  }
};

/**
 * 创建通知
 * @param {string} requestId 请求ID
 * @param {string} oldStatus 旧状态
 * @param {string} newStatus 新状态
 */
const createNotification = (requestId, oldStatus, newStatus) => {
  const title = '翻译请求状态更新';
  const options = {
    body: `请求 ${requestId.substring(0, 6)}... 状态从 ${oldStatus} 变更为 ${newStatus}`,
    icon: '/logo192.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    tag: `request-${requestId}`,
    renotify: true
  };
  
  const notification = new Notification(title, options);
  
  notification.onclick = function() {
    window.focus();
    this.close();
  };
};

/**
 * 获取状态变更描述
 * @param {string} oldStatus 旧状态
 * @param {string} newStatus 新状态
 * @returns {string} 状态变更描述
 */
export const getStatusChangeDescription = (oldStatus, newStatus) => {
  const statusTransitions = {
    'Created_Assigned': '您的翻译请求已被接受，翻译人员正在处理中',
    'Created_Cancelled': '您的翻译请求已被取消',
    'Assigned_Completed': '您的翻译请求已完成，请查看翻译结果',
    'Completed_Verified': '您的翻译已通过验证',
    'Completed_Disputed': '您的翻译存在争议，请查看详情',
    'Disputed_Verified': '争议已解决，翻译已通过验证',
    'Disputed_Cancelled': '争议导致请求被取消，代币已退还'
  };
  
  const transitionKey = `${oldStatus}_${newStatus}`;
  return statusTransitions[transitionKey] || `状态从 ${oldStatus} 变更为 ${newStatus}`;
};

/**
 * 获取状态颜色
 * @param {string} status 状态
 * @returns {string} 颜色代码
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'Created': '#3498db',    // 蓝色
    'Assigned': '#f39c12',   // 橙色
    'Completed': '#2ecc71',  // 绿色
    'Verified': '#27ae60',   // 深绿色
    'Disputed': '#e74c3c',   // 红色
    'Cancelled': '#95a5a6'   // 灰色
  };
  
  return statusColors[status] || '#7f8c8d';
};

/**
 * 获取状态图标
 * @param {string} status 状态
 * @returns {string} 图标名称
 */
export const getStatusIcon = (status) => {
  const statusIcons = {
    'Created': 'file-text',
    'Assigned': 'user-check',
    'Completed': 'check-circle',
    'Verified': 'award',
    'Disputed': 'alert-triangle',
    'Cancelled': 'x-circle'
  };
  
  return statusIcons[status] || 'help-circle';
};

/**
 * 获取状态进度百分比
 * @param {string} status 状态
 * @returns {number} 进度百分比
 */
export const getStatusProgress = (status) => {
  const statusProgress = {
    'Created': 0,
    'Assigned': 25,
    'Completed': 75,
    'Verified': 100,
    'Disputed': 60,
    'Cancelled': 100
  };
  
  return statusProgress[status] || 0;
};

export default {
  useRequestStatusMonitor,
  getStatusChangeDescription,
  getStatusColor,
  getStatusIcon,
  getStatusProgress
};
