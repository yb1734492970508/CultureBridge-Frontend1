import React from 'react';
import { motion } from 'framer-motion';

const CommunityPage = ({ user }) => {
  const communities = [
    {
      id: 1,
      name: '日本文化爱好者',
      description: '分享日本传统文化、现代生活和语言学习心得',
      members: 15420,
      posts: 2847,
      image: '🏯',
      color: '#ff6b6b',
      tags: ['文化', '语言', '传统'],
      isJoined: true
    },
    {
      id: 2,
      name: '法语学习交流',
      description: '法语学习者的聚集地，从入门到精通',
      members: 8934,
      posts: 1256,
      image: '🗼',
      color: '#4ecdc4',
      tags: ['法语', '学习', '交流'],
      isJoined: false
    },
    {
      id: 3,
      name: '全球美食文化',
      description: '探索世界各地的美食文化和烹饪技巧',
      members: 12567,
      posts: 3421,
      image: '🍜',
      color: '#45b7d1',
      tags: ['美食', '文化', '烹饪'],
      isJoined: true
    },
    {
      id: 4,
      name: '韩流文化圈',
      description: '韩国文化、K-pop、韩语学习讨论区',
      members: 23456,
      posts: 5678,
      image: '🎭',
      color: '#f39c12',
      tags: ['韩国', 'K-pop', '韩语'],
      isJoined: false
    }
  ];

  const trendingPosts = [
    {
      id: 1,
      title: '日本茶道体验分享：从零基础到入门',
      author: 'Yuki_Tokyo',
      avatar: '/api/placeholder/32/32',
      community: '日本文化爱好者',
      likes: 234,
      comments: 45,
      time: '2小时前',
      image: '/api/placeholder/400/200',
      tags: ['茶道', '体验', '文化']
    },
    {
      id: 2,
      title: '法语发音技巧：如何练就地道的法式口音',
      author: 'Marie_Paris',
      avatar: '/api/placeholder/32/32',
      community: '法语学习交流',
      likes: 189,
      comments: 32,
      time: '4小时前',
      image: '/api/placeholder/400/200',
      tags: ['发音', '技巧', '法语']
    },
    {
      id: 3,
      title: '韩国传统节日介绍：中秋节的独特习俗',
      author: 'Seoul_Kim',
      avatar: '/api/placeholder/32/32',
      community: '韩流文化圈',
      likes: 156,
      comments: 28,
      time: '6小时前',
      image: '/api/placeholder/400/200',
      tags: ['节日', '传统', '韩国']
    }
  ];

  const events = [
    {
      id: 1,
      title: '在线日语角',
      time: '今天 20:00',
      participants: 45,
      maxParticipants: 50,
      type: 'online',
      host: 'Yuki_Tokyo'
    },
    {
      id: 2,
      title: '法国文化分享会',
      time: '明天 19:30',
      participants: 23,
      maxParticipants: 30,
      type: 'online',
      host: 'Marie_Paris'
    },
    {
      id: 3,
      title: '全球美食制作直播',
      time: '周六 15:00',
      participants: 67,
      maxParticipants: 100,
      type: 'live',
      host: 'Chef_Global'
    }
  ];

  return (
    <div className="community-page">
      {/* 页面标题 */}
      <motion.section
        className="page-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--spacing-xl)' }}
      >
        <div className="glass-card" style={{
          background: 'var(--primary-gradient)',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: 'var(--spacing-md)'
          }}>
            🌍 文化社区
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.9
          }}>
            与全球文化爱好者一起探索、学习、分享
          </p>
        </div>
      </motion.section>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 'var(--spacing-xl)'
      }}>
        {/* 主内容区域 */}
        <div className="main-content">
          {/* 热门帖子 */}
          <motion.section
            className="trending-posts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 'var(--spacing-xl)' }}
          >
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--text-primary)'
            }}>
              🔥 热门讨论
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-lg)'
            }}>
              {trendingPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  className="glass-card post-card"
                  style={{
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-lg)'
                  }}>
                    {/* 帖子图片 */}
                    <div style={{
                      width: '120px',
                      height: '80px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--border-color)',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem'
                      }}>
                        📸
                      </div>
                    </div>

                    {/* 帖子内容 */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--spacing-sm)',
                        lineHeight: 1.4
                      }}>
                        {post.title}
                      </h3>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-sm)',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-sm)'
                        }}>
                          <img
                            src={post.avatar}
                            alt={post.author}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%'
                            }}
                          />
                          <span>{post.author}</span>
                        </div>
                        <span>•</span>
                        <span>{post.community}</span>
                        <span>•</span>
                        <span>{post.time}</span>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: 'var(--spacing-sm)'
                        }}>
                          {post.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              style={{
                                padding: '2px 8px',
                                background: 'var(--primary-gradient)',
                                color: 'white',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: 'var(--spacing-md)',
                          fontSize: '0.875rem',
                          color: 'var(--text-muted)'
                        }}>
                          <span>👍 {post.likes}</span>
                          <span>💬 {post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* 社区列表 */}
          <motion.section
            className="communities-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--text-primary)'
            }}>
              🏘️ 推荐社区
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              {communities.map((community, index) => (
                <motion.div
                  key={community.id}
                  className="glass-card community-card"
                  style={{
                    cursor: 'pointer',
                    border: community.isJoined 
                      ? `2px solid ${community.color}` 
                      : '1px solid var(--border-color)',
                    background: community.isJoined 
                      ? `${community.color}10` 
                      : 'var(--glass-bg)'
                  }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div style={{
                    textAlign: 'center',
                    marginBottom: 'var(--spacing-lg)'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: community.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      margin: '0 auto var(--spacing-md)'
                    }}>
                      {community.image}
                    </div>
                    
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--spacing-sm)'
                    }}>
                      {community.name}
                    </h3>
                    
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      marginBottom: 'var(--spacing-md)'
                    }}>
                      {community.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-md)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>👥 {community.members.toLocaleString()} 成员</span>
                    <span>📝 {community.posts.toLocaleString()} 帖子</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-xs)',
                    marginBottom: 'var(--spacing-lg)',
                    flexWrap: 'wrap'
                  }}>
                    {community.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        style={{
                          padding: '2px 6px',
                          background: 'var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <motion.button
                    className="btn"
                    style={{
                      width: '100%',
                      background: community.isJoined 
                        ? 'var(--success-gradient)' 
                        : 'var(--primary-gradient)',
                      color: 'white'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {community.isJoined ? '已加入 ✓' : '加入社区'}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* 侧边栏 */}
        <aside className="sidebar">
          {/* 即将开始的活动 */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: 'var(--spacing-lg)' }}
          >
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--text-primary)'
            }}>
              📅 即将开始
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)'
            }}>
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  style={{
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-backdrop)',
                    cursor: 'pointer'
                  }}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--spacing-xs)'
                  }}>
                    {event.title}
                  </h4>
                  
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--spacing-sm)'
                  }}>
                    ⏰ {event.time}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>
                      👥 {event.participants}/{event.maxParticipants}
                    </span>
                    <span style={{
                      padding: '2px 6px',
                      background: event.type === 'live' 
                        ? '#ef4444' 
                        : '#10b981',
                      color: 'white',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {event.type === 'live' ? '直播' : '在线'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 社区统计 */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--text-primary)'
            }}>
              📊 社区数据
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)'
            }}>
              {[
                { label: '总用户数', value: '125,847', icon: '👥' },
                { label: '活跃社区', value: '156', icon: '🏘️' },
                { label: '今日帖子', value: '1,234', icon: '📝' },
                { label: '在线活动', value: '23', icon: '🎭' }
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--spacing-sm) 0',
                    borderBottom: index < 3 ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {stat.icon} {stat.label}
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
};

export default CommunityPage;

