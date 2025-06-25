/**
 * 通知管理器组件
 * 管理全局通知的显示和处理
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  Bell,
  X
} from 'lucide-react';

import { 
  selectNotifications, 
  removeNotification, 
  markAsRead 
} from '../store/slices/uiSlice';

const NotificationManager = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  useEffect(() => {
    // 处理新通知
    notifications.forEach(notification => {
      if (!notification.displayed) {
        showToast(notification);
        
        // 标记为已显示
        dispatch(markAsRead(notification.id));
      }
    });
  }, [notifications, dispatch]);

  const showToast = (notification) => {
    const { type, title, message, duration = 4000, actions } = notification;

    // 选择图标
    const getIcon = () => {
      switch (type) {
        case 'success':
          return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'error':
          return <XCircle className="w-5 h-5 text-red-500" />;
        case 'warning':
          return <AlertCircle className="w-5 h-5 text-yellow-500" />;
        case 'info':
        default:
          return <Info className="w-5 h-5 text-blue-500" />;
      }
    };

    // 创建自定义toast内容
    const toastContent = (
      <div className="flex items-start space-x-3 w-full">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-medium text-gray-900 dark:text-white mb-1">
              {title}
            </div>
          )}
          {message && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {message}
            </div>
          )}
          {actions && actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    toast.dismiss();
                  }}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            toast.dismiss();
            dispatch(removeNotification(notification.id));
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );

    // 显示toast
    toast.custom(toastContent, {
      duration: duration === 0 ? Infinity : duration,
      position: 'top-right',
      className: 'w-full max-w-md',
    });
  };

  // 这个组件不渲染任何可见内容，只处理通知逻辑
  return null;
};

export default NotificationManager;

