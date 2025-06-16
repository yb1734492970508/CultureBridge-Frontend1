import React from 'react';

const LearningDashboard = () => {
  const languages = [
    { name: '中文', progress: 75, color: '#10B981' },
    { name: '西班牙语', progress: 50, color: '#F97316' },
    { name: '法语', progress: 20, color: '#3B82F6' }
  ];

  const achievements = ['🏆', '🎯', '🔥', '⭐'];

  const lessons = [
    {
      id: 1,
      title: '中国菜系',
      description: '学习中国八大菜系的特色',
      icon: '🥢',
      duration: '10分钟'
    },
    {
      id: 2,
      title: '墨西哥旅行',
      description: '掌握旅行中的实用西班牙语',
      icon: '🏛️',
      duration: '15分钟'
    },
    {
      id: 3,
      title: '法语发音',
      description: '练习法语的基础发音技巧',
      icon: '🗣️',
      duration: '12分钟'
    }
  ];

  return (
    <div className="learning-dashboard">
      <div className="feed-header">
        <h1 className="feed-title">学习中心</h1>
        <p className="feed-subtitle">通过文化交流提升语言技能</p>
      </div>

      <div className="progress-rings">
        {languages.map((lang, index) => (
          <div key={index} className="progress-ring">
            <div className="ring-container">
              <div className="ring-background"></div>
              <div 
                className="ring-progress"
                style={{ '--progress': `${lang.progress * 3.6}deg` }}
              ></div>
              <div className="ring-text">{lang.progress}%</div>
            </div>
            <div className="language-label">{lang.name}</div>
          </div>
        ))}
      </div>

      <div className="achievements">
        {achievements.map((achievement, index) => (
          <div key={index} className="achievement-badge">
            {achievement}
          </div>
        ))}
        <div className="achievement-badge" style={{ background: '#6B7280' }}>
          <span style={{ fontSize: '0.8rem' }}>9天连续</span>
        </div>
      </div>

      <section>
        <h2 className="section-title">推荐课程</h2>
        <div className="lesson-cards">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="lesson-card">
              <div className="lesson-icon">
                {lesson.icon}
              </div>
              <div className="lesson-info">
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <small>{lesson.duration}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LearningDashboard;

