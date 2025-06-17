import React from 'react';

const CulturalFeed = () => {
  const posts = [
    {
      id: 1,
      user: {
        name: 'Kapri Tanaka',
        country: '🇯🇵',
        avatar: 'KT'
      },
      image: '/api/placeholder/400/250',
      title: '富士山的春天',
      description: '樱花盛开的季节，富士山展现出最美的一面',
      likes: 234,
      comments: 45,
      cbtReward: '+2.5 CBT'
    },
    {
      id: 2,
      user: {
        name: 'Maria Rodriguez',
        country: '🇪🇸',
        avatar: 'MR'
      },
      image: '/api/placeholder/400/250',
      title: '弗拉明戈舞蹈',
      description: '传统西班牙弗拉明戈舞蹈的魅力与激情',
      likes: 189,
      comments: 32,
      cbtReward: '+3.0 CBT'
    },
    {
      id: 3,
      user: {
        name: 'Ahmed Hassan',
        country: '🇪🇬',
        avatar: 'AH'
      },
      image: '/api/placeholder/400/250',
      title: '金字塔的秘密',
      description: '探索古埃及文明的神秘与智慧',
      likes: 312,
      comments: 67,
      cbtReward: '+4.0 CBT'
    }
  ];

  return (
    <div className="cultural-feed">
      <div className="feed-header">
        <h1 className="feed-title">文化内容流</h1>
        <p className="feed-subtitle">发现世界各地的精彩文化</p>
      </div>

      {posts.map((post) => (
        <div key={post.id} className="cultural-post">
          <div className="post-header">
            <div className="user-avatar">
              {post.user.avatar}
              <span className="country-flag">{post.user.country}</span>
            </div>
            <div className="user-info">
              <h4>{post.user.name}</h4>
              <p>2小时前</p>
            </div>
          </div>

          <div className="post-content">
            <img 
              src={post.image} 
              alt={post.title}
              className="post-image"
              onError={(e) => {
                e.target.style.background = 'linear-gradient(45deg, #F97316, #1E3A8A)';
                e.target.style.display = 'flex';
                e.target.style.alignItems = 'center';
                e.target.style.justifyContent = 'center';
                e.target.style.color = 'white';
                e.target.style.fontSize = '1.2rem';
                e.target.textContent = '🖼️ 文化图片';
              }}
            />
            <div className="post-overlay">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-description">{post.description}</p>
            </div>
          </div>

          <div className="post-actions">
            <div className="action-buttons">
              <button className="action-btn">
                ❤️ {post.likes}
              </button>
              <button className="action-btn">
                💬 {post.comments}
              </button>
              <button className="action-btn">
                🔄
              </button>
            </div>
            <div className="cbt-reward">
              {post.cbtReward}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CulturalFeed;

