import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HomePage = ({ user, setUser, theme, notifications, setNotifications }) => {
  const [stats, setStats] = useState({
    totalUsers: 125847,
    activeChats: 3421,
    languagesSupported: 25,
    culturalEvents: 156
  });

  const [featuredCultures, setFeaturedCultures] = useState([
    {
      id: 1,
      name: '日本文化',
      image: '/api/placeholder/300/200',
      participants: 1234,
      description: '探索日本传统文化、茶道、武士精神',
      color: '#ff6b6b'
    },
    {
      id: 2,
      name: '法国文化',
      image: '/api/placeholder/300/200',
      participants: 987,
      description: '体验法式浪漫、美食文化、艺术传统',
      color: '#4ecdc4'
    },
    {
      id: 3,
      name: '印度文化',
      image: '/api/placeholder/300/200',
      participants: 756,
      description: '感受印度丰富的宗教文化和传统节日',
      color: '#45b7d1'
    }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'chat', message: '与来自东京的Yuki开始了对话', time: '2分钟前', icon: '💬' },
    { id: 2, type: 'learning', message: '完成了日语基础课程第3章', time: '15分钟前', icon: '📚' },
    { id: 3, type: 'achievement', message: '获得了"文化大使"徽章', time: '1小时前', icon: '🏆' },
    { id: 4, type: 'event', message: '参加了法国料理文化分享会', time: '2小时前', icon: '🍽️' }
  ]);

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="homepage"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 欢迎横幅 */}
      <motion.section
        className="welcome-banner"
        variants={itemVariants}
        style={{
          background: 'var(--primary-gradient)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--spacing-2xl)',
          color: 'white',
          marginBottom: 'var(--spacing-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            marginBottom: 'var(--spacing-md)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            欢迎回来，{user.username}！
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            opacity: 0.9,
            marginBottom: 'var(--spacing-lg)'
          }}>
            今天准备探索哪种文化呢？
          </p>
          <motion.button
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontWeight: '600'
            }}
            whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 开始探索
          </motion.button>
        </div>
        
        {/* 装饰性元素 */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
      </motion.section>

      {/* 统计数据 */}
      <motion.section
        className="stats-section"
        variants={itemVariants}
        style={{ marginBottom: 'var(--spacing-xl)' }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-lg)'
        }}>
          {[
            { label: '全球用户', value: stats.totalUsers.toLocaleString(), icon: '👥', color: '#6366f1' },
            { label: '活跃聊天', value: stats.activeChats.toLocaleString(), icon: '💬', color: '#10b981' },
            { label: '支持语言', value: stats.languagesSupported, icon: '🌍', color: '#f59e0b' },
            { label: '文化活动', value: stats.culturalEvents, icon: '🎭', color: '#ef4444' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="glass-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              style={{
                textAlign: 'center',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <div style={{
                fontSize: '2rem',
                marginBottom: 'var(--spacing-md)'
              }}>
                {stat.icon}
              </div>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: stat.color,
                marginBottom: 'var(--spacing-sm)'
              }}>
                {stat.value}
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.875rem'
              }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 特色文化 */}
      <motion.section
        className="featured-cultures"
        variants={itemVariants}
        style={{ marginBottom: 'var(--spacing-xl)' }}
      >
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--text-primary)'
        }}>
          🌟 特色文化体验
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-lg)'
        }}>
          {featuredCultures.map((culture, index) => (
            <motion.div
              key={culture.id}
              className="glass-card"
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              style={{
                cursor: 'pointer',
                overflow: 'hidden',
                padding: 0
              }}
            >
              <div style={{
                height: '200px',
                background: `linear-gradient(135deg, ${culture.color}80 0%, ${culture.color}40 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'white'
              }}>
                {culture.name.includes('日本') ? '🏯' : 
                 culture.name.includes('法国') ? '🗼' : '🕌'}
              </div>
              
              <div style={{ padding: 'var(--spacing-lg)' }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--text-primary)'
                }}>
                  {culture.name}
                </h3>
                
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  marginBottom: 'var(--spacing-md)',
                  lineHeight: 1.5
                }}>
                  {culture.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem'
                  }}>
                    👥 {culture.participants} 参与者
                  </span>
                  
                  <motion.button
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    加入体验
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 最近活动 */}
      <motion.section
        className="recent-activities"
        variants={itemVariants}
      >
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--text-primary)'
        }}>
          📈 最近活动
        </h2>
        
        <div className="glass-card">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-md) 0',
                borderBottom: index < recentActivities.length - 1 ? '1px solid var(--border-color)' : 'none'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                {activity.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: 0,
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}>
                  {activity.message}
                </p>
                <p style={{
                  margin: 0,
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem'
                }}>
                  {activity.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
};

export default HomePage;

