import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LearningPage = ({ user, setUser }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('japanese');
  const [currentLesson, setCurrentLesson] = useState(null);

  const languages = [
    {
      id: 'japanese',
      name: '日语',
      flag: '🇯🇵',
      progress: 65,
      level: 'N4',
      lessons: 24,
      color: '#ff6b6b'
    },
    {
      id: 'french',
      name: '法语',
      flag: '🇫🇷',
      progress: 40,
      level: 'A2',
      lessons: 18,
      color: '#4ecdc4'
    },
    {
      id: 'spanish',
      name: '西班牙语',
      flag: '🇪🇸',
      progress: 25,
      level: 'A1',
      lessons: 12,
      color: '#45b7d1'
    },
    {
      id: 'korean',
      name: '韩语',
      flag: '🇰🇷',
      progress: 10,
      level: '初级',
      lessons: 6,
      color: '#f39c12'
    }
  ];

  const lessons = {
    japanese: [
      {
        id: 1,
        title: '基础问候语',
        description: '学习日常问候和自我介绍',
        duration: '15分钟',
        type: 'vocabulary',
        completed: true,
        cultural: '了解日本的礼仪文化'
      },
      {
        id: 2,
        title: '数字和时间',
        description: '掌握数字表达和时间概念',
        duration: '20分钟',
        type: 'grammar',
        completed: true,
        cultural: '日本的时间观念'
      },
      {
        id: 3,
        title: '家庭成员',
        description: '学习家庭关系词汇',
        duration: '18分钟',
        type: 'vocabulary',
        completed: false,
        cultural: '日本家庭结构'
      },
      {
        id: 4,
        title: '茶道用语',
        description: '茶道相关的专业词汇',
        duration: '25分钟',
        type: 'cultural',
        completed: false,
        cultural: '深入了解茶道文化'
      }
    ]
  };

  const achievements = [
    { id: 1, name: '初学者', icon: '🌱', description: '完成第一课', unlocked: true },
    { id: 2, name: '词汇达人', icon: '📚', description: '学会100个单词', unlocked: true },
    { id: 3, name: '连续学习', icon: '🔥', description: '连续学习7天', unlocked: true },
    { id: 4, name: '文化探索者', icon: '🏯', description: '完成文化课程', unlocked: false },
    { id: 5, name: '语法大师', icon: '⚡', description: '掌握基础语法', unlocked: false },
    { id: 6, name: '对话高手', icon: '💬', description: '进行实时对话', unlocked: false }
  ];

  const currentLanguage = languages.find(lang => lang.id === selectedLanguage);
  const currentLessons = lessons[selectedLanguage] || [];

  const startLesson = (lesson) => {
    setCurrentLesson(lesson);
    // 这里可以跳转到具体的学习界面
  };

  return (
    <div className="learning-page">
      {/* 学习统计 */}
      <motion.section
        className="learning-stats"
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
            🎓 语言学习中心
          </h1>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginTop: 'var(--spacing-xl)'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                {user.streak || 7}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                连续学习天数
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                {user.points || 2847}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                学习积分
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                {user.level || 18}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                当前等级
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                {languages.length}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                学习语言
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: 'var(--spacing-xl)'
      }}>
        {/* 语言选择侧边栏 */}
        <motion.aside
          className="language-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="glass-card">
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--text-primary)'
            }}>
              🌍 选择语言
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)'
            }}>
              {languages.map((language) => (
                <motion.button
                  key={language.id}
                  className={`language-card ${selectedLanguage === language.id ? 'active' : ''}`}
                  onClick={() => setSelectedLanguage(language.id)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    border: selectedLanguage === language.id 
                      ? `2px solid ${language.color}` 
                      : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    background: selectedLanguage === language.id 
                      ? `${language.color}15` 
                      : 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-backdrop)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-sm)'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{language.flag}</span>
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem'
                      }}>
                        {language.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}>
                        {language.level} • {language.lessons}课
                      </div>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'var(--border-color)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <motion.div
                      style={{
                        height: '100%',
                        background: language.color,
                        borderRadius: '3px'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${language.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: 'var(--spacing-xs)'
                  }}>
                    进度: {language.progress}%
                  </div>
                </motion.button>
              ))}
            </div>

            {/* 成就展示 */}
            <div style={{ marginTop: 'var(--spacing-xl)' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: 'var(--spacing-md)',
                color: 'var(--text-primary)'
              }}>
                🏆 成就徽章
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--spacing-sm)'
              }}>
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className="achievement-badge"
                    style={{
                      padding: 'var(--spacing-sm)',
                      borderRadius: 'var(--radius-md)',
                      background: achievement.unlocked 
                        ? 'var(--success-gradient)' 
                        : 'var(--border-color)',
                      color: achievement.unlocked ? 'white' : 'var(--text-muted)',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      opacity: achievement.unlocked ? 1 : 0.5
                    }}
                    whileHover={achievement.unlocked ? { scale: 1.05 } : {}}
                    title={achievement.description}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>
                      {achievement.icon}
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      {achievement.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* 课程内容主区域 */}
        <motion.main
          className="lessons-main"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="glass-card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-xl)'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: 0
                }}>
                  {currentLanguage?.flag} {currentLanguage?.name} 课程
                </h2>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  margin: '4px 0 0 0'
                }}>
                  当前等级: {currentLanguage?.level} • 进度: {currentLanguage?.progress}%
                </p>
              </div>

              <motion.button
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📊 查看统计
              </motion.button>
            </div>

            {/* 课程列表 */}
            <div style={{
              display: 'grid',
              gap: 'var(--spacing-lg)'
            }}>
              {currentLessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  className="lesson-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-lg)',
                    padding: 'var(--spacing-lg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    background: lesson.completed 
                      ? 'var(--success-gradient)15' 
                      : 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-backdrop)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => startLesson(lesson)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* 课程图标 */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: lesson.completed 
                      ? 'var(--success-gradient)' 
                      : currentLanguage?.color + '30',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: lesson.completed ? 'white' : currentLanguage?.color
                  }}>
                    {lesson.completed ? '✓' : 
                     lesson.type === 'vocabulary' ? '📝' :
                     lesson.type === 'grammar' ? '⚡' : '🏯'}
                  </div>

                  {/* 课程信息 */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      margin: '0 0 var(--spacing-xs) 0'
                    }}>
                      {lesson.title}
                    </h3>
                    
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      margin: '0 0 var(--spacing-sm) 0'
                    }}>
                      {lesson.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      gap: 'var(--spacing-md)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      <span>⏱️ {lesson.duration}</span>
                      <span>🎭 {lesson.cultural}</span>
                    </div>
                  </div>

                  {/* 开始按钮 */}
                  <motion.button
                    className="btn"
                    style={{
                      background: lesson.completed 
                        ? 'var(--success-gradient)' 
                        : 'var(--primary-gradient)',
                      color: 'white',
                      minWidth: '100px'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      startLesson(lesson);
                    }}
                  >
                    {lesson.completed ? '复习' : '开始'}
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* 每日挑战 */}
            <motion.div
              className="daily-challenge"
              style={{
                marginTop: 'var(--spacing-xl)',
                padding: 'var(--spacing-xl)',
                background: 'var(--secondary-gradient)',
                borderRadius: 'var(--radius-xl)',
                color: 'white',
                textAlign: 'center'
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: 'var(--spacing-md)'
              }}>
                🎯 今日挑战
              </h3>
              
              <p style={{
                fontSize: '0.875rem',
                opacity: 0.9,
                marginBottom: 'var(--spacing-lg)'
              }}>
                完成3个词汇练习，获得额外50积分！
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
              >
                接受挑战 🚀
              </motion.button>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default LearningPage;

