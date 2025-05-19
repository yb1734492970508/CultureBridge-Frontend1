import React, { useState, useEffect } from 'react';
import '../../styles/components/mobile/PullToRefresh.css';

/**
 * 下拉刷新组件
 * 为移动端提供下拉刷新功能，增强用户体验
 * 
 * @param {Object} props
 * @param {Function} props.onRefresh - 刷新触发时的回调函数
 * @param {React.ReactNode} props.children - 组件内容
 * @param {number} props.threshold - 触发刷新的阈值（像素）
 * @param {number} props.maxPull - 最大下拉距离（像素）
 */
const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 80, 
  maxPull = 120 
}) => {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [enabled, setEnabled] = useState(true);

  // 处理触摸开始事件
  const handleTouchStart = (e) => {
    // 只有在页面顶部才启用下拉刷新
    if (window.scrollY <= 0) {
      setStartY(e.touches[0].clientY);
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  };

  // 处理触摸移动事件
  const handleTouchMove = (e) => {
    if (!enabled || refreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    // 应用阻尼效果，使下拉越来越难
    const dampedDistance = Math.min(maxPull, distance * 0.5);
    
    setPullDistance(dampedDistance);
    
    // 防止页面滚动
    if (dampedDistance > 0) {
      e.preventDefault();
    }
  };

  // 处理触摸结束事件
  const handleTouchEnd = () => {
    if (!enabled) return;
    
    if (pullDistance >= threshold) {
      // 触发刷新
      setRefreshing(true);
      onRefresh().then(() => {
        // 刷新完成后重置状态
        setTimeout(() => {
          setRefreshing(false);
          setPullDistance(0);
        }, 300);
      }).catch(() => {
        // 处理刷新失败
        setRefreshing(false);
        setPullDistance(0);
      });
    } else {
      // 未达到阈值，重置状态
      setPullDistance(0);
    }
  };

  // 计算刷新指示器的旋转角度
  const getRotation = () => {
    if (refreshing) return 0;
    return (pullDistance / threshold) * 180;
  };

  // 计算刷新进度
  const getProgress = () => {
    return Math.min(1, pullDistance / threshold);
  };

  return (
    <div 
      className="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="pull-to-refresh-indicator"
        style={{ 
          transform: `translateY(${refreshing ? 20 : pullDistance - 60}px)`,
          opacity: refreshing || pullDistance > 0 ? 1 : 0
        }}
      >
        <div 
          className={`refresh-icon ${refreshing ? 'refreshing' : ''}`}
          style={{ transform: `rotate(${getRotation()}deg)` }}
        ></div>
        <svg className="progress-circle" width="40" height="40" viewBox="0 0 40 40">
          <circle
            className="progress-circle-bg"
            cx="20"
            cy="20"
            r="18"
            fill="none"
            strokeWidth="2"
          />
          <circle
            className="progress-circle-path"
            cx="20"
            cy="20"
            r="18"
            fill="none"
            strokeWidth="2"
            strokeDasharray="113"
            strokeDashoffset={113 * (1 - getProgress())}
          />
        </svg>
      </div>
      
      <div 
        className="pull-to-refresh-content"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance > 0 ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
