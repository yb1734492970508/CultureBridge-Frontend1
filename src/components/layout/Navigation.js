import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const navItems = [
    {
      path: '/',
      label: '首页',
      icon: '🏠',
      description: '探索文化世界',
    },
    {
      path: '/learning',
      label: '学习',
      icon: '📚',
      description: '语言与文化课程',
    },
    {
      path: '/community',
      label: '社区',
      icon: '👥',
      description: '文化交流社区',
    },
    {
      path: '/chat',
      label: '聊天',
      icon: '💬',
      description: '实时对话交流',
    },
    {
      path: '/rewards',
      label: '奖励',
      icon: '🎁',
      description: '积分与成就',
    },
    {
      path: '/profile',
      label: '个人',
      icon: '👤',
      description: '个人资料设置',
    },
  ];
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className={`navigation ${isExpanded ? 'expanded' : ''}`}>
      <div className="nav-container">
        {/* 展开/收起按钮 */}
        <button 
          className="nav-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? '收起导航' : '展开导航'}
        >
          <span className="toggle-icon">
            {isExpanded ? '◀' : '▶'}
          </span>
        </button>
        
        {/* 导航项目 */}
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <a 
                href={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                title={item.description}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isExpanded && (
                  <span className="nav-description">{item.description}</span>
                )}
              </a>
              
              {/* 活跃指示器 */}
              {isActive(item.path) && (
                <div className="active-indicator"></div>
              )}
            </li>
          ))}
        </ul>
        
        {/* 底部信息 */}
        {isExpanded && (
          <div className="nav-footer">
            <div className="nav-footer-content">
              <p className="nav-footer-text">
                CultureBridge v2.0
              </p>
              <p className="nav-footer-subtext">
                连接世界文化
              </p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;

