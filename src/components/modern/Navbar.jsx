import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Navbar = ({ 
  user, 
  theme, 
  toggleTheme, 
  sidebarOpen, 
  setSidebarOpen, 
  notifications 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="navbar">
      {/* 品牌标识 */}
      <div className="navbar-brand">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🌉 CultureBridge
        </motion.div>
      </div>

      {/* 导航操作 */}
      <div className="navbar-actions">
        {/* 菜单按钮 */}
        <motion.button
          className="navbar-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{sidebarOpen ? '✕' : '☰'}</span>
        </motion.button>

        {/* 主题切换 */}
        <motion.button
          className="navbar-button"
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{theme === 'light' ? '🌙' : '☀️'}</span>
        </motion.button>

        {/* 通知 */}
        <div className="notification-container" style={{ position: 'relative' }}>
          <motion.button
            className="navbar-button"
            onClick={() => setShowNotifications(!showNotifications)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🔔</span>
            {notifications.length > 0 && (
              <span className="notification-badge">
                {notifications.length}
              </span>
            )}
          </motion.button>

          {/* 通知下拉菜单 */}
          {showNotifications && (
            <motion.div
              className="notification-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '300px',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-backdrop)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1001
              }}
            >
              <h3 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '1rem' }}>
                通知
              </h3>
              {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  暂无新通知
                </p>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 'var(--spacing-sm)',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.875rem'
                    }}
                  >
                    {notification.message}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>

        {/* 用户头像 */}
        <motion.img
          src={user.avatar}
          alt={user.username}
          className="user-avatar"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
      </div>

      {/* 通知徽章样式 */}
      <style jsx>{`
        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

