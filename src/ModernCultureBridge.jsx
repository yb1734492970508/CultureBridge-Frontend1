import React, { useState, useEffect } from 'react';
import './ModernCultureBridge.css';

// 现代化CultureBridge应用组件
const ModernCultureBridge = () => {
  const [currentView, setCurrentView] = useState('profile');
  const [user, setUser] = useState({
    name: 'Sarah',
    username: '@sarah_s',
    avatar: '/api/placeholder/150/150',
    learningProgress: 'Intermediate',
    culturalExchangeAchievements: 12,
    points: 2300,
    level: 5,
    experience: 2550,
    nextLevelExp: 3000
  });

  // 导航项
  const navigationItems = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'feed', icon: '🌍', label: 'Feed' },
    { id: 'learning', icon: '📚', label: 'Learning' },
    { id: 'chat', icon: '💬', label: 'Chat' }
  ];

  // 文化内容数据
  const culturalContent = [
    {
      id: 1,
      title: 'Exploring Balinese Dance',
      image: '/api/placeholder/400/300',
      author: 'Kapri Tanaka',
      country: 'Indonesia',
      duration: '2:06',
      type: 'video'
    },
    {
      id: 2,
      title: 'Traditional Tea Ceremony',
      image: '/api/placeholder/200/200',
      author: 'esrrucbo',
      country: 'Japan',
      duration: '41:05',
      type: 'video'
    },
    {
      id: 3,
      title: 'African Storytelling',
      image: '/api/placeholder/200/200',
      author: 'Etrakatia bmos',
      country: 'Ghana',
      duration: '12:09',
      type: 'audio'
    }
  ];

  // 学习内容
  const learningContent = [
    {
      id: 1,
      type: 'culture',
      title: 'Exploring Balinese Dance',
      image: '/api/placeholder/400/200',
      description: 'Learn about traditional Indonesian dance forms'
    },
    {
      id: 2,
      type: 'translation',
      title: 'Translate the following',
      question: "'a pomme",
      options: ['apple', 'pear', 'graps'],
      correct: 0
    },
    {
      id: 3,
      type: 'chat',
      title: 'Language Exchange Chat',
      partner: 'Santiago',
      age: 21,
      message: "Hello! Would you like to practice Spanish?",
      response: "Sure! Let's get started."
    }
  ];

  // 渲染用户个人资料页面
  const renderProfileView = () => (
    <div className="profile-view">
      <div className="profile-header">
        <div className="app-logo">
          <span className="logo-icon">🌈</span>
          <span className="logo-text">CultureBridge</span>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="user-avatar">
          <img src={user.avatar} alt={user.name} />
        </div>
        
        <h1 className="user-name">{user.name}</h1>
        <p className="user-username">{user.username}</p>
        
        <div className="stats-grid">
          <div className="stat-card learning-progress">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>Learning Progress</h3>
              <p className="stat-value">{user.learningProgress}</p>
            </div>
          </div>
          
          <div className="stat-card cultural-exchange">
            <div className="stat-icon">🤝</div>
            <div className="stat-content">
              <h3>Cultural Exchange</h3>
              <p className="stat-value">{user.culturalExchangeAchievements} achievements</p>
            </div>
          </div>
          
          <div className="stat-card points-earnings">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>积分收益</h3>
              <p className="stat-value">{user.points} 积分</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染内容信息流页面
  const renderFeedView = () => (
    <div className="feed-view">
      <div className="feed-header">
        <div className="app-logo">
          <span className="logo-icon">🌉</span>
          <span className="logo-text">CultureBridge</span>
        </div>
        <button className="book-button">9BOOK</button>
      </div>
      
      <h1 className="feed-title">Cultural Content Feed</h1>
      
      <div className="content-grid">
        <div className="featured-content">
          <img src={culturalContent[0].image} alt={culturalContent[0].title} />
          <div className="content-overlay">
            <div className="author-info">
              <div className="author-avatar"></div>
              <span className="author-name">{culturalContent[0].author}</span>
              <span className="content-duration">⏱️ {culturalContent[0].duration}</span>
            </div>
            <h3 className="content-title">{culturalContent[0].title}</h3>
          </div>
        </div>
        
        <div className="content-row">
          {culturalContent.slice(1).map(content => (
            <div key={content.id} className="content-card">
              <img src={content.image} alt={content.title} />
              <div className="content-info">
                <div className="author-info">
                  <div className="author-avatar"></div>
                  <span className="author-name">{content.author}</span>
                </div>
                <span className="content-duration">{content.duration}</span>
              </div>
              {content.type === 'video' && <div className="play-button">▶️</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 渲染学习页面
  const renderLearningView = () => (
    <div className="learning-view">
      <div className="learning-header">
        <h1 className="app-title">CultureBridge</h1>
        <button className="chat-button">💬</button>
      </div>
      
      <div className="learning-tabs">
        <button className="tab active">Culture</button>
        <button className="tab">Language</button>
        <button className="tab">Chat</button>
      </div>
      
      <div className="learning-content">
        <div className="culture-section">
          <div className="culture-card">
            <img src={learningContent[0].image} alt={learningContent[0].title} />
            <h3>{learningContent[0].title}</h3>
          </div>
        </div>
        
        <div className="translation-section">
          <div className="translation-card">
            <h3>{learningContent[1].title}</h3>
            <p className="question">Q. {learningContent[1].question}</p>
            <div className="options">
              {learningContent[1].options.map((option, index) => (
                <button key={index} className="option-button">{option}</button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="chat-section">
          <div className="chat-card">
            <div className="chat-partner">
              <img src="/api/placeholder/80/80" alt="Chat partner" />
              <h3>Chat</h3>
            </div>
            <div className="chat-info">
              <h4>{learningContent[2].partner}</h4>
              <p>{learningContent[2].message}</p>
              <span className="age">{learningContent[2].age} age</span>
            </div>
            <div className="chat-response">
              <p>{learningContent[2].response}</p>
              <span className="age">{learningContent[2].age} age</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="media-controls">
        <button className="control-button">🏠</button>
        <button className="control-button">⏸️</button>
        <button className="control-button">▶️</button>
      </div>
    </div>
  );

  // 渲染聊天页面
  const renderChatView = () => (
    <div className="chat-view">
      <div className="chat-header">
        <h1>Global Chat Rooms</h1>
      </div>
      <div className="chat-rooms">
        <div className="room-card">
          <h3>🇯🇵 Japanese Culture</h3>
          <p>24 members online</p>
        </div>
        <div className="room-card">
          <h3>🇫🇷 French Learning</h3>
          <p>18 members online</p>
        </div>
        <div className="room-card">
          <h3>🇪🇸 Spanish Exchange</h3>
          <p>31 members online</p>
        </div>
      </div>
    </div>
  );

  // 渲染当前视图
  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return renderProfileView();
      case 'feed':
        return renderFeedView();
      case 'learning':
        return renderLearningView();
      case 'chat':
        return renderChatView();
      default:
        return renderProfileView();
    }
  };

  return (
    <div className="modern-culture-bridge">
      <div className="app-container">
        {renderCurrentView()}
        
        <nav className="bottom-navigation">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ModernCultureBridge;

