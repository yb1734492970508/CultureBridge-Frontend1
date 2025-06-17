import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 移动端导航组件
 */
const MobileNavigation = ({ 
  items = [], 
  className = "",
  onItemClick,
  showLabels = true,
  position = "bottom" // "top" | "bottom"
}) => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('');

  // 默认导航项
  const defaultItems = [
    {
      id: 'home',
      label: '首页',
      icon: '🏠',
      path: '/',
      badge: null
    },
    {
      id: 'marketplace',
      label: '市场',
      icon: '🛒',
      path: '/marketplace',
      badge: null
    },
    {
      id: 'governance',
      label: '治理',
      icon: '🗳️',
      path: '/governance',
      badge: 3
    },
    {
      id: 'social',
      label: '社交',
      icon: '👥',
      path: '/social',
      badge: null
    },
    {
      id: 'profile',
      label: '我的',
      icon: '👤',
      path: '/profile',
      badge: null
    }
  ];

  const navigationItems = items.length > 0 ? items : defaultItems;

  // 根据当前路径设置活跃项
  useEffect(() => {
    const currentItem = navigationItems.find(item => 
      location.pathname === item.path || 
      (item.path !== '/' && location.pathname.startsWith(item.path))
    );
    
    if (currentItem) {
      setActiveItem(currentItem.id);
    }
  }, [location.pathname, navigationItems]);

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const navClass = `mobile-navigation ${position} ${className}`;

  return (
    <nav className={navClass}>
      <div className="mobile-nav-container">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item)}
            aria-label={item.label}
          >
            <div className="nav-item-content">
              <div className="nav-item-icon-container">
                <span className="nav-item-icon">{item.icon}</span>
                {item.badge && (
                  <span className="nav-item-badge">{item.badge}</span>
                )}
              </div>
              {showLabels && (
                <span className="nav-item-label">{item.label}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

/**
 * 移动端顶部导航栏
 */
export const MobileTopBar = ({ 
  title = "CultureBridge",
  leftAction,
  rightActions = [],
  showBack = false,
  onBack,
  className = ""
}) => {
  return (
    <header className={`mobile-top-bar ${className}`}>
      <div className="top-bar-content">
        <div className="top-bar-left">
          {showBack ? (
            <button 
              className="top-bar-back-btn"
              onClick={onBack}
              aria-label="返回"
            >
              ←
            </button>
          ) : leftAction}
        </div>
        
        <div className="top-bar-center">
          <h1 className="top-bar-title">{title}</h1>
        </div>
        
        <div className="top-bar-right">
          {rightActions.map((action, index) => (
            <button
              key={index}
              className="top-bar-action-btn"
              onClick={action.onClick}
              aria-label={action.label}
            >
              {action.icon}
              {action.badge && (
                <span className="action-badge">{action.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

/**
 * 移动端侧边抽屉菜单
 */
export const MobileDrawer = ({ 
  isOpen = false,
  onClose,
  children,
  position = "left", // "left" | "right"
  className = ""
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div 
        className={`mobile-drawer ${position} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <button 
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="关闭菜单"
          >
            ✕
          </button>
        </div>
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * 移动端快速操作按钮
 */
export const MobileFAB = ({ 
  icon = "+",
  onClick,
  className = "",
  position = "bottom-right", // "bottom-right" | "bottom-left" | "bottom-center"
  size = "normal" // "small" | "normal" | "large"
}) => {
  return (
    <button 
      className={`mobile-fab ${position} ${size} ${className}`}
      onClick={onClick}
      aria-label="快速操作"
    >
      <span className="fab-icon">{icon}</span>
    </button>
  );
};

/**
 * 移动端标签页组件
 */
export const MobileTabs = ({ 
  tabs = [],
  activeTab,
  onTabChange,
  className = "",
  scrollable = true
}) => {
  return (
    <div className={`mobile-tabs ${scrollable ? 'scrollable' : ''} ${className}`}>
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
            {tab.badge && <span className="tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * 移动端搜索栏
 */
export const MobileSearchBar = ({ 
  placeholder = "搜索...",
  value = "",
  onChange,
  onSubmit,
  onClear,
  className = "",
  showVoiceSearch = false,
  showCamera = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <form 
      className={`mobile-search-bar ${isFocused ? 'focused' : ''} ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="search-input-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={onClear}
            aria-label="清除搜索"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="search-actions">
        {showVoiceSearch && (
          <button
            type="button"
            className="search-action-btn"
            aria-label="语音搜索"
          >
            🎤
          </button>
        )}
        {showCamera && (
          <button
            type="button"
            className="search-action-btn"
            aria-label="拍照搜索"
          >
            📷
          </button>
        )}
      </div>
    </form>
  );
};

export default MobileNavigation;

