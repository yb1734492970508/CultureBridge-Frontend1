import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProfilePage = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { id: 'overview', label: '概览', icon: '📊' },
    { id: 'achievements', label: '成就', icon: '🏆' },
    { id: 'learning', label: '学习记录', icon: '📚' },
    { id: 'social', label: '社交', icon: '👥' },
    { id: 'settings', label: '设置', icon: '⚙️' }
  ];

  const achievements = [
    { id: 1, name: '初学者', icon: '🌱', description: '完成第一课', date: '2024-01-15', unlocked: true },
    { id: 2, name: '词汇达人', icon: '📚', description: '学会100个单词', date: '2024-02-01', unlocked: true },
    { id: 3, name: '连续学习', icon: '🔥', description: '连续学习7天', date: '2024-02-10', unlocked: true },
    { id: 4, name: '文化探索者', icon: '🏯', description: '完成文化课程', date: '2024-02-15', unlocked: true },
    { id: 5, name: '社交达人', icon: '💬', description: '参与50次对话', date: '2024-02-20', unlocked: true },
    { id: 6, name: '语法大师', icon: '⚡', description: '掌握基础语法', date: null, unlocked: false },
    { id: 7, name: '翻译专家', icon: '🌐', description: '完成100次翻译', date: null, unlocked: false },
    { id: 8, name: '文化大使', icon: '🌍', description: '帮助10个新用户', date: null, unlocked: false }
  ];

  const learningStats = [
    { language: '日语', level: 'N4', progress: 65, lessons: 24, hours: 48 },
    { language: '法语', level: 'A2', progress: 40, lessons: 18, hours: 32 },
    { language: '西班牙语', level: 'A1', progress: 25, lessons: 12, hours: 20 },
    { language: '韩语', level: '初级', progress: 10, lessons: 6, hours: 8 }
  ];

  const friends = [
    { name: 'Yuki', country: 'Japan', avatar: '/api/placeholder/40/40', status: 'online' },
    { name: 'Marie', country: 'France', avatar: '/api/placeholder/40/40', status: 'online' },
    { name: 'Carlos', country: 'Spain', avatar: '/api/placeholder/40/40', status: 'away' },
    { name: 'Ahmed', country: 'Egypt', avatar: '/api/placeholder/40/40', status: 'offline' }
  ];

  const getCountryFlag = (country) => {
    const flags = {
      'Japan': '🇯🇵', 'France': '🇫🇷', 'Spain': '🇪🇸', 'Egypt': '🇪🇬'
    };
    return flags[country] || '🌍';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-content">
            {/* 学习统计 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-xl)'
            }}>
              {[
                { label: '学习天数', value: user.streak || 7, icon: '🔥', color: '#ef4444' },
                { label: '总积分', value: user.points || 2847, icon: '⭐', color: '#f59e0b' },
                { label: '当前等级', value: user.level || 18, icon: '🎯', color: '#10b981' },
                { label: '完成课程', value: 58, icon: '📚', color: '#6366f1' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="glass-card"
                  style={{
                    textAlign: 'center',
                    background: `${stat.color}15`,
                    border: `1px solid ${stat.color}30`
                  }}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>
                    {stat.icon}
                  </div>
                  <div style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: stat.color,
                    marginBottom: 'var(--spacing-xs)'
                  }}>
                    {stat.value.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 最近活动 */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: 'var(--spacing-lg)',
                color: 'var(--text-primary)'
              }}>
                📈 最近活动
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)'
              }}>
                {[
                  { action: '完成了日语基础课程第5章', time: '2小时前', icon: '📚' },
                  { action: '与来自东京的Yuki进行了对话', time: '4小时前', icon: '💬' },
                  { action: '获得了"连续学习7天"成就', time: '1天前', icon: '🏆' },
                  { action: '加入了"日本文化爱好者"社区', time: '2天前', icon: '🏘️' }
                ].map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)',
                      padding: 'var(--spacing-md) 0',
                      borderBottom: index < 3 ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--primary-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}>
                      {activity.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        marginBottom: '2px'
                      }}>
                        {activity.action}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        );

      case 'achievements':
        return (
          <div className="achievements-content">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  className="glass-card achievement-card"
                  style={{
                    opacity: achievement.unlocked ? 1 : 0.6,
                    background: achievement.unlocked 
                      ? 'var(--success-gradient)15' 
                      : 'var(--glass-bg)',
                    border: achievement.unlocked 
                      ? '1px solid var(--success-gradient)30' 
                      : '1px solid var(--border-color)'
                  }}
                  whileHover={{ scale: achievement.unlocked ? 1.02 : 1 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: achievement.unlocked ? 1 : 0.6, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: 'var(--spacing-md)',
                      filter: achievement.unlocked ? 'none' : 'grayscale(100%)'
                    }}>
                      {achievement.icon}
                    </div>
                    
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--spacing-sm)'
                    }}>
                      {achievement.name}
                    </h3>
                    
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--spacing-md)',
                      lineHeight: 1.4
                    }}>
                      {achievement.description}
                    </p>
                    
                    {achievement.unlocked && achievement.date && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        background: 'var(--success-gradient)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-block'
                      }}>
                        获得于 {achievement.date}
                      </div>
                    )}
                    
                    {!achievement.unlocked && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        background: 'var(--border-color)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-block'
                      }}>
                        未解锁
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'learning':
        return (
          <div className="learning-content">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-lg)'
            }}>
              {learningStats.map((lang, index) => (
                <motion.div
                  key={index}
                  className="glass-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-lg)'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--spacing-xs)'
                      }}>
                        {lang.language}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}>
                        当前等级: {lang.level}
                      </p>
                    </div>
                    
                    <div style={{
                      textAlign: 'right',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <div>进度: {lang.progress}%</div>
                      <div>{lang.lessons} 课程 • {lang.hours} 小时</div>
                    </div>
                  </div>
                  
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--border-color)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <motion.div
                      style={{
                        height: '100%',
                        background: 'var(--primary-gradient)',
                        borderRadius: '4px'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${lang.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="social-content">
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: 'var(--spacing-lg)',
                color: 'var(--text-primary)'
              }}>
                👥 我的朋友 ({friends.length})
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-lg)'
              }}>
                {friends.map((friend, index) => (
                  <motion.div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--glass-bg)',
                      backdropFilter: 'var(--glass-backdrop)',
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: '2px solid var(--border-color)'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: friend.status === 'online' ? '#10b981' : 
                                   friend.status === 'away' ? '#f59e0b' : '#6b7280',
                        border: '2px solid var(--bg-primary)'
                      }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        marginBottom: '2px'
                      }}>
                        {friend.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)'
                      }}>
                        <span>{getCountryFlag(friend.country)}</span>
                        <span>{friend.country}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        );

      case 'settings':
        return (
          <div className="settings-content">
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: 'var(--spacing-lg)',
                color: 'var(--text-primary)'
              }}>
                ⚙️ 账户设置
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-lg)'
              }}>
                {[
                  { label: '通知设置', description: '管理推送通知和邮件提醒', icon: '🔔' },
                  { label: '隐私设置', description: '控制个人信息的可见性', icon: '🔒' },
                  { label: '语言偏好', description: '设置界面和学习语言', icon: '🌐' },
                  { label: '学习提醒', description: '设置每日学习提醒时间', icon: '⏰' },
                  { label: '数据导出', description: '下载你的学习数据', icon: '📥' },
                  { label: '账户安全', description: '修改密码和安全设置', icon: '🛡️' }
                ].map((setting, index) => (
                  <motion.div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--glass-bg)',
                      backdropFilter: 'var(--glass-backdrop)',
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.01, x: 4 }}
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
                      {setting.icon}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        marginBottom: '2px'
                      }}>
                        {setting.label}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}>
                        {setting.description}
                      </div>
                    </div>
                    
                    <div style={{
                      color: 'var(--text-muted)',
                      fontSize: '1rem'
                    }}>
                      →
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-page">
      {/* 用户信息头部 */}
      <motion.section
        className="profile-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--spacing-xl)' }}
      >
        <div className="glass-card" style={{
          background: 'var(--primary-gradient)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            margin: '0 auto var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem'
          }}>
            👤
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: 'var(--spacing-sm)'
          }}>
            {user.username}
          </h1>
          
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.9,
            marginBottom: 'var(--spacing-lg)'
          }}>
            等级 {user.level} 文化探索者 • 已学习 {user.streak} 天
          </p>
          
          <motion.button
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
          >
            ✏️ 编辑资料
          </motion.button>
        </div>
      </motion.section>

      {/* 标签页导航 */}
      <motion.nav
        className="profile-tabs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 'var(--spacing-xl)' }}
      >
        <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            overflowX: 'auto'
          }}>
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  background: activeTab === tab.id 
                    ? 'var(--primary-gradient)' 
                    : 'transparent',
                  color: activeTab === tab.id 
                    ? 'white' 
                    : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* 标签页内容 */}
      <motion.section
        className="tab-content"
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.section>
    </div>
  );
};

export default ProfilePage;

