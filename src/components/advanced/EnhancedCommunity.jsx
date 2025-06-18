import React, { useState, useEffect } from 'react';
import './EnhancedCommunity.css';

const EnhancedCommunity = () => {
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('group');
  const [loading, setLoading] = useState(false);

  // 获取群组推荐
  const fetchGroupRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/community-enhanced/groups/recommendations');
      if (response.ok) {
        const result = await response.json();
        setGroups(result.data || []);
      }
    } catch (error) {
      console.error('获取群组推荐失败:', error);
      // 模拟数据
      setGroups([
        {
          _id: '1',
          name: '日语学习交流群',
          description: '专注于日语学习的社区，分享学习资源和经验',
          category: '语言学习',
          memberCount: 1250,
          tags: ['日语', '学习', '交流'],
          creator: { username: '田中老师', avatar: '/api/placeholder/40/40' },
          isActive: true
        },
        {
          _id: '2',
          name: '韩国文化探索',
          description: '了解韩国传统文化、现代文化和生活方式',
          category: '文化交流',
          memberCount: 890,
          tags: ['韩国', '文化', '传统'],
          creator: { username: '김민수', avatar: '/api/placeholder/40/40' },
          isActive: true
        },
        {
          _id: '3',
          name: '欧洲旅行分享',
          description: '分享欧洲旅行经验、攻略和美食推荐',
          category: '旅行',
          memberCount: 2100,
          tags: ['欧洲', '旅行', '美食'],
          creator: { username: 'Marco', avatar: '/api/placeholder/40/40' },
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 获取活动推荐
  const fetchEventRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/community-enhanced/events/recommendations');
      if (response.ok) {
        const result = await response.json();
        setEvents(result.data || []);
      }
    } catch (error) {
      console.error('获取活动推荐失败:', error);
      // 模拟数据
      setEvents([
        {
          _id: '1',
          title: '中日文化交流茶话会',
          description: '通过茶道体验，深入了解中日文化差异与共同点',
          startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: '线上 Zoom 会议室',
          category: '文化交流',
          participantCount: 45,
          maxParticipants: 100,
          tags: ['茶道', '文化', '交流'],
          organizer: { username: '文化桥梁', avatar: '/api/placeholder/40/40' },
          status: 'upcoming'
        },
        {
          _id: '2',
          title: '英语口语练习角',
          description: '每周定期的英语口语练习活动，提升口语表达能力',
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          location: '北京朝阳区咖啡厅',
          category: '语言学习',
          participantCount: 12,
          maxParticipants: 20,
          tags: ['英语', '口语', '练习'],
          organizer: { username: 'Sarah', avatar: '/api/placeholder/40/40' },
          status: 'upcoming'
        },
        {
          _id: '3',
          title: '法国美食制作工坊',
          description: '学习制作正宗法式甜点，了解法国饮食文化',
          startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          location: '上海徐汇区烹饪学校',
          category: '美食文化',
          participantCount: 8,
          maxParticipants: 15,
          tags: ['法国', '美食', '烹饪'],
          organizer: { username: 'Pierre', avatar: '/api/placeholder/40/40' },
          status: 'upcoming'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 获取我的群组
  const fetchMyGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/community-enhanced/groups/my');
      if (response.ok) {
        const result = await response.json();
        setMyGroups(result.data || []);
      }
    } catch (error) {
      console.error('获取我的群组失败:', error);
    }
  };

  // 获取我的活动
  const fetchMyEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/community-enhanced/events/my');
      if (response.ok) {
        const result = await response.json();
        setMyEvents(result.data || []);
      }
    } catch (error) {
      console.error('获取我的活动失败:', error);
    }
  };

  // 加入群组
  const joinGroup = async (groupId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/community-enhanced/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: '希望加入这个群组，一起学习交流！' }),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.data.message || '申请已提交');
        // 更新群组列表
        fetchGroupRecommendations();
      }
    } catch (error) {
      console.error('加入群组失败:', error);
      alert('加入群组失败，请稍后重试');
    }
  };

  // 报名活动
  const joinEvent = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/community-enhanced/events/${eventId}/join`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        alert('报名成功！');
        // 更新活动列表
        fetchEventRecommendations();
      }
    } catch (error) {
      console.error('报名活动失败:', error);
      alert('报名失败，请稍后重试');
    }
  };

  // 创建群组或活动
  const handleCreate = async (formData) => {
    const endpoint = createType === 'group' 
      ? 'http://localhost:5000/api/community-enhanced/groups'
      : 'http://localhost:5000/api/community-enhanced/events';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert(`${createType === 'group' ? '群组' : '活动'}创建成功！`);
        setShowCreateModal(false);
        // 刷新列表
        if (createType === 'group') {
          fetchGroupRecommendations();
          fetchMyGroups();
        } else {
          fetchEventRecommendations();
          fetchMyEvents();
        }
      }
    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败，请稍后重试');
    }
  };

  useEffect(() => {
    if (activeTab === 'groups') {
      fetchGroupRecommendations();
    } else if (activeTab === 'events') {
      fetchEventRecommendations();
    } else if (activeTab === 'my-groups') {
      fetchMyGroups();
    } else if (activeTab === 'my-events') {
      fetchMyEvents();
    }
  }, [activeTab]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="enhanced-community">
      <div className="community-header">
        <h2>🌍 增强社区</h2>
        <button 
          className="create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + 创建
        </button>
      </div>

      <div className="community-tabs">
        <button 
          className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          推荐群组
        </button>
        <button 
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          推荐活动
        </button>
        <button 
          className={`tab ${activeTab === 'my-groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-groups')}
        >
          我的群组
        </button>
        <button 
          className={`tab ${activeTab === 'my-events' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-events')}
        >
          我的活动
        </button>
      </div>

      <div className="community-content">
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>加载中...</span>
          </div>
        )}

        {/* 推荐群组 */}
        {activeTab === 'groups' && !loading && (
          <div className="groups-grid">
            {groups.map((group) => (
              <div key={group._id} className="group-card">
                <div className="group-header">
                  <h3>{group.name}</h3>
                  <span className="member-count">{group.memberCount} 成员</span>
                </div>
                <p className="group-description">{group.description}</p>
                <div className="group-tags">
                  {group.tags?.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="group-footer">
                  <div className="creator-info">
                    <img src={group.creator?.avatar} alt="" className="creator-avatar" />
                    <span className="creator-name">{group.creator?.username}</span>
                  </div>
                  <button 
                    className="join-btn"
                    onClick={() => joinGroup(group._id)}
                  >
                    加入群组
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 推荐活动 */}
        {activeTab === 'events' && !loading && (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className="event-time">{formatDate(event.startTime)}</span>
                </div>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                  <div className="event-location">📍 {event.location}</div>
                  <div className="event-participants">
                    👥 {event.participantCount}/{event.maxParticipants} 人
                  </div>
                </div>
                <div className="event-tags">
                  {event.tags?.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="event-footer">
                  <div className="organizer-info">
                    <img src={event.organizer?.avatar} alt="" className="organizer-avatar" />
                    <span className="organizer-name">{event.organizer?.username}</span>
                  </div>
                  <button 
                    className="join-btn"
                    onClick={() => joinEvent(event._id)}
                    disabled={event.participantCount >= event.maxParticipants}
                  >
                    {event.participantCount >= event.maxParticipants ? '已满员' : '立即报名'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 我的群组 */}
        {activeTab === 'my-groups' && !loading && (
          <div className="my-groups">
            {myGroups.length === 0 ? (
              <div className="empty-state">
                <p>您还没有加入任何群组</p>
                <button onClick={() => setActiveTab('groups')}>
                  浏览推荐群组
                </button>
              </div>
            ) : (
              <div className="groups-grid">
                {myGroups.map((group) => (
                  <div key={group._id} className="group-card my-group">
                    <div className="group-header">
                      <h3>{group.name}</h3>
                      <span className="member-count">{group.memberCount} 成员</span>
                    </div>
                    <p className="group-description">{group.description}</p>
                    <div className="group-actions">
                      <button className="action-btn">进入群组</button>
                      <button className="action-btn secondary">群组设置</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 我的活动 */}
        {activeTab === 'my-events' && !loading && (
          <div className="my-events">
            {myEvents.length === 0 ? (
              <div className="empty-state">
                <p>您还没有参与任何活动</p>
                <button onClick={() => setActiveTab('events')}>
                  浏览推荐活动
                </button>
              </div>
            ) : (
              <div className="events-grid">
                {myEvents.map((event) => (
                  <div key={event._id} className="event-card my-event">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span className="event-time">{formatDate(event.startTime)}</span>
                    </div>
                    <p className="event-description">{event.description}</p>
                    <div className="event-actions">
                      <button className="action-btn">查看详情</button>
                      <button className="action-btn secondary">取消报名</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 创建弹窗 */}
      {showCreateModal && (
        <CreateModal
          type={createType}
          onTypeChange={setCreateType}
          onSubmit={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

// 创建弹窗组件
const CreateModal = ({ type, onTypeChange, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    category: '',
    tags: '',
    location: '',
    startTime: '',
    maxParticipants: '',
    requireApproval: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    if (type === 'group') {
      submitData.name = formData.name;
    } else {
      submitData.title = formData.title;
      submitData.maxParticipants = parseInt(formData.maxParticipants) || 50;
    }
    
    onSubmit(submitData);
  };

  return (
    <div className="create-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>创建{type === 'group' ? '群组' : '活动'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="type-selector">
          <button 
            className={`type-btn ${type === 'group' ? 'active' : ''}`}
            onClick={() => onTypeChange('group')}
          >
            群组
          </button>
          <button 
            className={`type-btn ${type === 'event' ? 'active' : ''}`}
            onClick={() => onTypeChange('event')}
          >
            活动
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>{type === 'group' ? '群组名称' : '活动标题'}</label>
            <input
              type="text"
              value={type === 'group' ? formData.name : formData.title}
              onChange={(e) => setFormData({
                ...formData,
                [type === 'group' ? 'name' : 'title']: e.target.value
              })}
              required
            />
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>分类</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">选择分类</option>
              <option value="语言学习">语言学习</option>
              <option value="文化交流">文化交流</option>
              <option value="旅行">旅行</option>
              <option value="美食">美食</option>
              <option value="艺术">艺术</option>
              <option value="音乐">音乐</option>
              <option value="运动">运动</option>
              <option value="技术">技术</option>
            </select>
          </div>

          {type === 'event' && (
            <>
              <div className="form-group">
                <label>活动地点</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>开始时间</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>最大参与人数</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                  min="1"
                  max="1000"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>标签 (用逗号分隔)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="例如: 日语, 学习, 交流"
            />
          </div>

          {type === 'group' && (
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.requireApproval}
                  onChange={(e) => setFormData({...formData, requireApproval: e.target.checked})}
                />
                需要管理员审核新成员
              </label>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              取消
            </button>
            <button type="submit" className="submit-btn">
              创建{type === 'group' ? '群组' : '活动'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedCommunity;

