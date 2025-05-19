import React, { useState, useEffect } from 'react';
import BottomNavigation from '../components/mobile/BottomNavigation';
import PullToRefresh from '../components/mobile/PullToRefresh';
import SwipeGesture from '../components/mobile/SwipeGesture';
import '../styles/components/mobile/MobileLayout.css';

/**
 * 移动端布局容器组件
 * 为移动设备提供统一的布局结构和导航
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 页面内容
 */
const MobileLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 处理导航标签变更
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // 在实际应用中，这里会触发路由导航
    // history.push(`/${tabId === 'home' ? '' : tabId}`);
  };

  // 处理下拉刷新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // 模拟刷新操作
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsRefreshing(false);
        resolve();
      }, 1500);
    });
  };

  // 处理左右滑动
  const handleSwipeLeft = () => {
    // 根据当前标签确定下一个标签
    const tabs = ['home', 'forum', 'events', 'learning', 'profile'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    // 根据当前标签确定上一个标签
    const tabs = ['home', 'forum', 'events', 'learning', 'profile'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1]);
    }
  };

  return (
    <div className={`mobile-layout ${isMobile ? 'is-mobile' : ''}`}>
      {isMobile ? (
        <>
          <SwipeGesture
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          >
            <PullToRefresh onRefresh={handleRefresh}>
              <div className="mobile-content">
                {children}
              </div>
            </PullToRefresh>
          </SwipeGesture>
          
          <BottomNavigation 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </>
      ) : (
        // 在非移动设备上，不显示移动端特定组件
        <div className="desktop-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
