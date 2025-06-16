import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/discover', icon: '🗺️', label: '发现' },
    { path: '/chat', icon: '💬', label: '聊天' },
    { path: '/learn', icon: '📚', label: '学习' },
    { path: '/profile', icon: '👤', label: '我的' },
  ];

  return (
    <nav className="bottom-navigation">
      <div className="nav-container">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;

