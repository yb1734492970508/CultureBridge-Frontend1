import React, { useState, useEffect } from 'react';
import '../../styles/components/mobile/BottomNavigation.css';

/**
 * 移动端底部导航组件
 * 提供快速访问主要功能的导航栏，仅在移动设备上显示
 */
const BottomNavigation = ({ activeTab, onTabChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 导航项配置
  const navItems = [
    { id: 'home', label: '首页', icon: 'home-icon' },
    { id: 'forum', label: '论坛', icon: 'forum-icon' },
    { id: 'events', label: '活动', icon: 'events-icon' },
    { id: 'learning', label: '学习', icon: 'learning-icon' },
    { id: 'profile', label: '我的', icon: 'profile-icon' }
  ];

  // 监听滚动事件，实现导航栏的自动隐藏/显示
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 向下滚动超过20px时隐藏导航栏，向上滚动时显示
      if (currentScrollY > lastScrollY + 20) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // 处理导航项点击
  const handleItemClick = (itemId) => {
    if (activeTab !== itemId) {
      onTabChange(itemId);
    }
  };

  return (
    <nav className={`bottom-navigation ${isVisible ? 'visible' : 'hidden'}`}>
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => handleItemClick(item.id)}
          aria-label={item.label}
        >
          <div className={`nav-icon ${item.icon}`}></div>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavigation;
