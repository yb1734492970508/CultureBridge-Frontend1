import React, { useState, useEffect } from 'react';
import './PersonalizedRecommendation.css';

const PersonalizedRecommendation = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [contentRecommendations, setContentRecommendations] = useState([]);
  const [socialRecommendations, setSocialRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    interests: [],
    contentTypes: [],
    difficultyLevel: 'medium',
    socialLevel: 'medium'
  });
  const [showPreferences, setShowPreferences] = useState(false);

  // 获取内容推荐
  const fetchContentRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/recommendations/content?limit=20');
      if (response.ok) {
        const result = await response.json();
        setContentRecommendations(result.data.recommendations || []);
      }
    } catch (error) {
      console.error('获取内容推荐失败:', error);
      // 模拟数据
      setContentRecommendations([
        {
          _id: '1',
          title: '日本茶道的精神内涵',
          content: '探索日本茶道背后的哲学思想和文化意义...',
          author: { username: '茶道师傅', avatar: '/api/placeholder/40/40', country: '日本' },
          tags: ['茶道', '日本文化', '哲学'],
          language: '中文',
          type: 'article',
          viewCount: 1250,
          likeCount: 89,
          commentCount: 23,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          recommendationScore: 95,
          reason: '因为您对日本文化感兴趣'
        },
        {
          _id: '2',
          title: '韩语发音技巧分享',
          content: '掌握韩语发音的关键要点和练习方法...',
          author: { username: '김선생', avatar: '/api/placeholder/40/40', country: '韩国' },
          tags: ['韩语', '发音', '学习技巧'],
          language: '韩语',
          type: 'video',
          viewCount: 890,
          likeCount: 67,
          commentCount: 15,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          recommendationScore: 88,
          reason: '因为您正在学习韩语'
        },
        {
          _id: '3',
          title: '法国美食文化探索',
          content: '从历史角度了解法国美食的发展和特色...',
          author: { username: 'Pierre', avatar: '/api/placeholder/40/40', country: '法国' },
          tags: ['法国', '美食', '文化'],
          language: '法语',
          type: 'article',
          viewCount: 1100,
          likeCount: 78,
          commentCount: 19,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          recommendationScore: 82,
          reason: '来自法国的文化分享'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 获取社交推荐
  const fetchSocialRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/recommendations/social?limit=10');
      if (response.ok) {
        const result = await response.json();
        setSocialRecommendations(result.data || {});
      }
    } catch (error) {
      console.error('获取社交推荐失败:', error);
      // 模拟数据
      setSocialRecommendations({
        users: [
          {
            _id: '1',
            username: 'Sakura_Tokyo',
            avatar: '/api/placeholder/60/60',
            country: '日本',
            nativeLanguage: '日语',
            learningLanguages: ['中文', '英语'],
            interests: ['茶道', '动漫', '旅行'],
            recommendationScore: 92,
            reason: '可以帮助您学习日语'
          },
          {
            _id: '2',
            username: 'Marie_Paris',
            avatar: '/api/placeholder/60/60',
            country: '法国',
            nativeLanguage: '法语',
            learningLanguages: ['中文'],
            interests: ['美食', '艺术', '文学'],
            recommendationScore: 85,
            reason: '你们都对美食感兴趣'
          }
        ],
        groups: [
          {
            _id: '1',
            name: '日语学习互助群',
            description: '专注于日语学习的友好社区',
            memberCount: 1250,
            tags: ['日语', '学习', '互助'],
            language: '日语',
            recommendationScore: 90,
            reason: '日语学习交流群'
          },
          {
            _id: '2',
            name: '世界美食文化',
            description: '分享各国美食文化和制作方法',
            memberCount: 890,
            tags: ['美食', '文化', '制作'],
            language: '中文',
            recommendationScore: 78,
            reason: '美食爱好者聚集地'
          }
        ],
        events: [
          {
            _id: '1',
            title: '中日文化交流会',
            description: '线上文化交流活动，促进中日友好',
            startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: '线上',
            participantCount: 45,
            maxParticipants: 100,
            tags: ['文化交流', '中日'],
            language: '中文',
            recommendationScore: 88,
            reason: '文化交流主题活动'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取用户画像
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recommendations/profile');
      if (response.ok) {
        const result = await response.json();
        setUserProfile(result.data);
        setPreferences({
          interests: result.data.demographics?.interests || [],
          contentTypes: result.data.preferences?.contentTypes || [],
          difficultyLevel: result.data.preferences?.difficultyLevel || 'medium',
          socialLevel: result.data.preferences?.socialLevel || 'medium'
        });
      }
    } catch (error) {
      console.error('获取用户画像失败:', error);
    }
  };

  // 用户反馈
  const handleFeedback = async (itemId, itemType, action) => {
    try {
      await fetch('http://localhost:5000/api/recommendations/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, itemType, action }),
      });
      
      // 刷新推荐
      if (activeTab === 'content') {
        fetchContentRecommendations();
      } else {
        fetchSocialRecommendations();
      }
    } catch (error) {
      console.error('反馈失败:', error);
    }
  };

  // 更新偏好设置
  const updatePreferences = async (newPreferences) => {
    try {
      const response = await fetch('http://localhost:5000/api/recommendations/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });
      
      if (response.ok) {
        setPreferences(newPreferences);
        setShowPreferences(false);
        // 刷新推荐
        if (activeTab === 'content') {
          fetchContentRecommendations();
        } else {
          fetchSocialRecommendations();
        }
        alert('偏好设置已更新');
      }
    } catch (error) {
      console.error('更新偏好失败:', error);
      alert('更新失败，请稍后重试');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'content') {
      fetchContentRecommendations();
    } else if (activeTab === 'social') {
      fetchSocialRecommendations();
    }
  }, [activeTab]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1天前';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`;
    return `${Math.ceil(diffDays / 30)}个月前`;
  };

  return (
    <div className="personalized-recommendation">
      <div className="recommendation-header">
        <h2>🎯 个性化推荐</h2>
        <button 
          className="preferences-btn"
          onClick={() => setShowPreferences(true)}
        >
          ⚙️ 偏好设置
        </button>
      </div>

      <div className="recommendation-tabs">
        <button 
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📚 内容推荐
        </button>
        <button 
          className={`tab ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          👥 社交推荐
        </button>
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          📊 我的画像
        </button>
      </div>

      <div className="recommendation-content">
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>正在为您生成个性化推荐...</span>
          </div>
        )}

        {/* 内容推荐 */}
        {activeTab === 'content' && !loading && (
          <div className="content-recommendations">
            <div className="recommendations-grid">
              {contentRecommendations.map((content) => (
                <div key={content._id} className="content-card">
                  <div className="content-header">
                    <div className="content-meta">
                      <span className={`content-type ${content.type}`}>
                        {content.type === 'article' ? '📄' : 
                         content.type === 'video' ? '🎥' : 
                         content.type === 'audio' ? '🎵' : '📷'} 
                        {content.type}
                      </span>
                      <span className="recommendation-score">
                        匹配度: {content.recommendationScore}%
                      </span>
                    </div>
                    <div className="recommendation-reason">
                      💡 {content.reason}
                    </div>
                  </div>

                  <h3 className="content-title">{content.title}</h3>
                  <p className="content-preview">{content.content}</p>

                  <div className="content-tags">
                    {content.tags?.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div className="content-stats">
                    <span>👁️ {content.viewCount}</span>
                    <span>❤️ {content.likeCount}</span>
                    <span>💬 {content.commentCount}</span>
                    <span className="content-time">{formatDate(content.createdAt)}</span>
                  </div>

                  <div className="content-footer">
                    <div className="author-info">
                      <img src={content.author?.avatar} alt="" className="author-avatar" />
                      <div className="author-details">
                        <span className="author-name">{content.author?.username}</span>
                        <span className="author-country">📍 {content.author?.country}</span>
                      </div>
                    </div>
                    <div className="content-actions">
                      <button 
                        className="action-btn like"
                        onClick={() => handleFeedback(content._id, 'content', 'like')}
                        title="喜欢"
                      >
                        👍
                      </button>
                      <button 
                        className="action-btn dislike"
                        onClick={() => handleFeedback(content._id, 'content', 'dislike')}
                        title="不喜欢"
                      >
                        👎
                      </button>
                      <button 
                        className="action-btn hide"
                        onClick={() => handleFeedback(content._id, 'content', 'hide')}
                        title="隐藏"
                      >
                        🙈
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 社交推荐 */}
        {activeTab === 'social' && !loading && (
          <div className="social-recommendations">
            {/* 用户推荐 */}
            <div className="recommendation-section">
              <h3>👤 推荐用户</h3>
              <div className="users-grid">
                {socialRecommendations.users?.map((user) => (
                  <div key={user._id} className="user-card">
                    <div className="user-header">
                      <img src={user.avatar} alt="" className="user-avatar" />
                      <div className="user-info">
                        <h4>{user.username}</h4>
                        <span className="user-country">📍 {user.country}</span>
                      </div>
                      <span className="match-score">{user.recommendationScore}%</span>
                    </div>
                    
                    <div className="user-languages">
                      <div className="language-item">
                        <span className="label">母语:</span>
                        <span className="value">{user.nativeLanguage}</span>
                      </div>
                      <div className="language-item">
                        <span className="label">学习:</span>
                        <span className="value">{user.learningLanguages?.join(', ')}</span>
                      </div>
                    </div>

                    <div className="user-interests">
                      {user.interests?.map((interest, index) => (
                        <span key={index} className="interest-tag">{interest}</span>
                      ))}
                    </div>

                    <div className="recommendation-reason">
                      💡 {user.reason}
                    </div>

                    <div className="user-actions">
                      <button className="connect-btn">
                        🤝 连接
                      </button>
                      <button 
                        className="feedback-btn"
                        onClick={() => handleFeedback(user._id, 'user', 'not_interested')}
                      >
                        不感兴趣
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 群组推荐 */}
            <div className="recommendation-section">
              <h3>👥 推荐群组</h3>
              <div className="groups-grid">
                {socialRecommendations.groups?.map((group) => (
                  <div key={group._id} className="group-card">
                    <div className="group-header">
                      <h4>{group.name}</h4>
                      <span className="member-count">{group.memberCount} 成员</span>
                    </div>
                    
                    <p className="group-description">{group.description}</p>
                    
                    <div className="group-tags">
                      {group.tags?.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>

                    <div className="recommendation-reason">
                      💡 {group.reason}
                    </div>

                    <div className="group-actions">
                      <button className="join-btn">
                        加入群组
                      </button>
                      <button 
                        className="feedback-btn"
                        onClick={() => handleFeedback(group._id, 'group', 'not_interested')}
                      >
                        不感兴趣
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 活动推荐 */}
            <div className="recommendation-section">
              <h3>🎉 推荐活动</h3>
              <div className="events-grid">
                {socialRecommendations.events?.map((event) => (
                  <div key={event._id} className="event-card">
                    <div className="event-header">
                      <h4>{event.title}</h4>
                      <span className="event-time">
                        {new Date(event.startTime).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-details">
                      <span>📍 {event.location}</span>
                      <span>👥 {event.participantCount}/{event.maxParticipants}</span>
                    </div>

                    <div className="event-tags">
                      {event.tags?.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>

                    <div className="recommendation-reason">
                      💡 {event.reason}
                    </div>

                    <div className="event-actions">
                      <button className="join-btn">
                        报名参加
                      </button>
                      <button 
                        className="feedback-btn"
                        onClick={() => handleFeedback(event._id, 'event', 'not_interested')}
                      >
                        不感兴趣
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 用户画像 */}
        {activeTab === 'profile' && userProfile && (
          <div className="user-profile">
            <div className="profile-section">
              <h3>📊 用户画像分析</h3>
              <div className="profile-grid">
                <div className="profile-card">
                  <h4>🌍 基本信息</h4>
                  <div className="profile-item">
                    <span className="label">国家:</span>
                    <span className="value">{userProfile.demographics?.country || '未设置'}</span>
                  </div>
                  <div className="profile-item">
                    <span className="label">母语:</span>
                    <span className="value">{userProfile.demographics?.nativeLanguage || '未设置'}</span>
                  </div>
                  <div className="profile-item">
                    <span className="label">学习语言:</span>
                    <span className="value">
                      {userProfile.demographics?.learningLanguages?.join(', ') || '未设置'}
                    </span>
                  </div>
                </div>

                <div className="profile-card">
                  <h4>🎯 兴趣偏好</h4>
                  <div className="interests-cloud">
                    {userProfile.demographics?.interests?.map((interest, index) => (
                      <span key={index} className="interest-bubble">{interest}</span>
                    )) || <span className="no-data">暂无数据</span>}
                  </div>
                </div>

                <div className="profile-card">
                  <h4>📈 行为分析</h4>
                  <div className="behavior-stats">
                    <div className="stat-item">
                      <span className="stat-label">评论频率</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill"
                          style={{ width: `${Math.min(100, (userProfile.behavior?.socialActivity?.commentFrequency || 0) * 10)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">分享频率</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill"
                          style={{ width: `${Math.min(100, (userProfile.behavior?.socialActivity?.shareFrequency || 0) * 10)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">群组活跃度</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill"
                          style={{ width: `${Math.min(100, (userProfile.behavior?.socialActivity?.groupActivity || 0) * 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <h4>⚙️ 推荐偏好</h4>
                  <div className="preference-item">
                    <span className="label">内容类型:</span>
                    <span className="value">
                      {userProfile.preferences?.contentTypes?.join(', ') || '未设置'}
                    </span>
                  </div>
                  <div className="preference-item">
                    <span className="label">难度级别:</span>
                    <span className="value">{userProfile.preferences?.difficultyLevel || '中等'}</span>
                  </div>
                  <div className="preference-item">
                    <span className="label">社交级别:</span>
                    <span className="value">{userProfile.preferences?.socialLevel || '中等'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 偏好设置弹窗 */}
      {showPreferences && (
        <PreferencesModal
          preferences={preferences}
          onSave={updatePreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </div>
  );
};

// 偏好设置弹窗组件
const PreferencesModal = ({ preferences, onSave, onClose }) => {
  const [formData, setFormData] = useState(preferences);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleInterest = (interest) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: newInterests });
  };

  const toggleContentType = (type) => {
    const newTypes = formData.contentTypes.includes(type)
      ? formData.contentTypes.filter(t => t !== type)
      : [...formData.contentTypes, type];
    setFormData({ ...formData, contentTypes: newTypes });
  };

  const availableInterests = [
    '语言学习', '文化交流', '旅行', '美食', '音乐', '艺术', 
    '电影', '读书', '运动', '科技', '摄影', '手工'
  ];

  const availableContentTypes = [
    'article', 'video', 'audio', 'image', 'discussion'
  ];

  const contentTypeLabels = {
    article: '文章',
    video: '视频',
    audio: '音频',
    image: '图片',
    discussion: '讨论'
  };

  return (
    <div className="preferences-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>⚙️ 偏好设置</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="preferences-form">
          <div className="form-section">
            <h4>🎯 兴趣标签</h4>
            <div className="interests-grid">
              {availableInterests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={`interest-btn ${formData.interests.includes(interest) ? 'active' : ''}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h4>📚 内容类型偏好</h4>
            <div className="content-types-grid">
              {availableContentTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`content-type-btn ${formData.contentTypes.includes(type) ? 'active' : ''}`}
                  onClick={() => toggleContentType(type)}
                >
                  {contentTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h4>📊 难度级别</h4>
            <div className="radio-group">
              {['easy', 'medium', 'hard'].map((level) => (
                <label key={level} className="radio-label">
                  <input
                    type="radio"
                    name="difficultyLevel"
                    value={level}
                    checked={formData.difficultyLevel === level}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                  />
                  <span className="radio-text">
                    {level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h4>👥 社交级别</h4>
            <div className="radio-group">
              {['low', 'medium', 'high'].map((level) => (
                <label key={level} className="radio-label">
                  <input
                    type="radio"
                    name="socialLevel"
                    value={level}
                    checked={formData.socialLevel === level}
                    onChange={(e) => setFormData({ ...formData, socialLevel: e.target.value })}
                  />
                  <span className="radio-text">
                    {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              取消
            </button>
            <button type="submit" className="save-btn">
              保存设置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalizedRecommendation;

