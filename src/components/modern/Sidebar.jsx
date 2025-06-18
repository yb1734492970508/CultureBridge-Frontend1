import React from 'react';
import { motion } from 'framer-motion';

const Sidebar = ({ 
  currentPage, 
  setCurrentPage, 
  sidebarOpen, 
  setSidebarOpen, 
  theme 
}) => {
  const navItems = [
    { key: 'home', icon: '🏠', label: '首页', description: '探索文化世界' },
    { key: 'chat', icon: '💬', label: '实时聊天', description: '与全球朋友交流' },
    { key: 'learning', icon: '📚', label: '语言学习', description: '提升语言技能' },
    { key: 'community', icon: '🌍', label: '文化社区', description: '加入文化圈子' },
    { key: 'profile', icon: '👤', label: '个人中心', description: '管理个人信息' },
    { key: 'ai-assistant', icon: '🤖', label: 'AI助手', description: '智能内容创作' },
    { key: 'enhanced-community', icon: '🚀', label: '增强社区', description: '高级社交功能' },
    { key: 'recommendations', icon: '🎯', label: '个性推荐', description: '专属内容推荐' },
    { key: 'real-time', icon: '⚡', label: '实时互动', description: '即时通讯交流' }
  ];

  const handleNavClick = (key) => {
    setCurrentPage(key);
    // 在移动端点击后关闭侧边栏
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      {sidebarOpen && (
        <motion.div
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 850,
            display: window.innerWidth <= 768 ? 'block' : 'none'
          }}
        />
      )}

      {/* 侧边栏 */}
      <motion.aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -280
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* 用户信息卡片 */}
        <motion.div
          className="user-info-card"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-backdrop)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-xl)',
            textAlign: 'center'
          }}
          whileHover={{ scale: 1.02 }}
        >
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'var(--primary-gradient)',
            margin: '0 auto var(--spacing-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            👤
          </div>
          <h3 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '1.1rem' }}>
            文化探索者
          </h3>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.875rem',
            margin: '0 0 var(--spacing-md) 0'
          }}>
            等级 18 • 2847 积分
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <span>🔥 连续7天</span>
            <span>🏆 12个成就</span>
          </div>
        </motion.div>

        {/* 导航菜单 */}
        <nav>
          <ul className="sidebar-nav">
            {navItems.map((item, index) => (
              <motion.li
                key={item.key}
                className="nav-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  className={`nav-link ${currentPage === item.key ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.key)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: currentPage === item.key 
                      ? 'var(--primary-gradient)' 
                      : 'transparent',
                    color: currentPage === item.key 
                      ? 'white' 
                      : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <span className="nav-icon" style={{ fontSize: '1.2rem' }}>
                    {item.icon}
                  </span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div>{item.label}</div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      opacity: 0.8,
                      marginTop: '2px'
                    }}>
                      {item.description}
                    </div>
                  </div>
                </motion.button>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* 底部操作 */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 'var(--spacing-xl)',
            left: 'var(--spacing-xl)',
            right: 'var(--spacing-xl)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="btn btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '0.875rem'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ⚙️ 设置
          </motion.button>
        </motion.div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

