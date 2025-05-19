import React, { useState, useEffect } from 'react';
import '../../styles/components/mobile/SwipeGesture.css';

/**
 * 滑动手势组件
 * 为移动端提供左右滑动手势支持
 * 
 * @param {Object} props
 * @param {Function} props.onSwipeLeft - 向左滑动的回调函数
 * @param {Function} props.onSwipeRight - 向右滑动的回调函数
 * @param {number} props.threshold - 触发滑动的阈值（像素）
 * @param {React.ReactNode} props.children - 组件内容
 */
const SwipeGesture = ({ 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 50, 
  children 
}) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // 处理触摸开始事件
  const handleTouchStart = (e) => {
    setTouchStart({ 
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    });
    setTouchEnd(null);
    setSwiping(false);
    setSwipeOffset(0);
  };

  // 处理触摸移动事件
  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    // 计算水平和垂直移动距离
    const deltaX = currentX - touchStart.x;
    const deltaY = Math.abs(currentY - touchStart.y);
    
    // 如果垂直移动大于水平移动，则不处理滑动
    if (deltaY > Math.abs(deltaX)) return;
    
    // 设置滑动状态和偏移量
    setSwiping(true);
    setSwipeOffset(deltaX * 0.5); // 应用阻尼效果
    
    setTouchEnd({
      x: currentX,
      y: currentY,
      time: Date.now()
    });
    
    // 防止页面滚动
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  };

  // 处理触摸结束事件
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !swiping) {
      setSwipeOffset(0);
      setSwiping(false);
      return;
    }
    
    // 计算滑动距离和速度
    const deltaX = touchEnd.x - touchStart.x;
    const deltaTime = touchEnd.time - touchStart.time;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    // 判断是否触发滑动事件
    // 满足条件：滑动距离超过阈值 或 滑动速度足够快
    if (Math.abs(deltaX) > threshold || velocity > 0.5) {
      if (deltaX > 0) {
        onSwipeRight && onSwipeRight();
      } else {
        onSwipeLeft && onSwipeLeft();
      }
    }
    
    // 重置状态
    setSwipeOffset(0);
    setSwiping(false);
  };

  return (
    <div 
      className="swipe-gesture-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="swipe-gesture-content"
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeGesture;
