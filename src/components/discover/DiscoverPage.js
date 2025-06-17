import React from 'react';

const DiscoverPage = () => {
  const trendingEvents = [
    { id: 1, name: '春节庆典', icon: '🧧' },
    { id: 2, name: '樱花节', icon: '🌸' },
    { id: 3, name: '狂欢节', icon: '🎭' },
    { id: 4, name: '感恩节', icon: '🦃' }
  ];

  const recommendedUsers = [
    { id: 1, name: 'Yuki', country: '🇯🇵', avatar: 'Y' },
    { id: 2, name: 'Pierre', country: '🇫🇷', avatar: 'P' },
    { id: 3, name: 'Sofia', country: '🇮🇹', avatar: 'S' },
    { id: 4, name: 'Chen', country: '🇨🇳', avatar: 'C' }
  ];

  const popularTopics = [
    '#美食', '#音乐', '#艺术', '#节日', '#传统', '#语言学习'
  ];

  return (
    <div className="discover-page">
      <input 
        type="text" 
        placeholder="🔍 搜索文化、用户或话题..." 
        className="search-bar"
      />

      <div className="world-map">
        <div className="map-placeholder">
          🗺️ 互动世界地图
          <br />
          <small>点击探索不同地区的文化</small>
        </div>
      </div>

      <section>
        <h2 className="section-title">热门活动</h2>
        <div className="trending-events">
          {trendingEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {event.icon}
              </div>
              <h4>{event.name}</h4>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">推荐用户</h2>
        <div className="recommended-users">
          {recommendedUsers.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-avatar" style={{ margin: '0 auto 0.5rem' }}>
                {user.avatar}
                <span className="country-flag">{user.country}</span>
              </div>
              <h4>{user.name}</h4>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">热门话题</h2>
        <div className="popular-topics">
          {popularTopics.map((topic, index) => (
            <span key={index} className="topic-tag">
              {topic}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiscoverPage;

