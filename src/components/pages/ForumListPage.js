import React from 'react';
import '../../styles/pages/ForumListPage.css';

const ForumListPage = () => {
  // 模拟论坛数据
  const forumCategories = [
    {
      id: 1,
      title: '文化交流',
      description: '讨论不同国家和地区的文化差异、习俗和传统',
      topics: 156,
      posts: 2345,
      icon: 'culture-icon'
    },
    {
      id: 2,
      title: '语言学习',
      description: '分享语言学习经验、资源和技巧',
      topics: 98,
      posts: 1876,
      icon: 'language-icon'
    },
    {
      id: 3,
      title: '留学生活',
      description: '交流留学经历、适应新环境的心得和建议',
      topics: 124,
      posts: 2089,
      icon: 'study-icon'
    },
    {
      id: 4,
      title: '美食世界',
      description: '探索全球各地的美食文化和烹饪技巧',
      topics: 87,
      posts: 1543,
      icon: 'food-icon'
    },
    {
      id: 5,
      title: '艺术与音乐',
      description: '分享各国艺术形式、音乐风格和创作灵感',
      topics: 76,
      posts: 1298,
      icon: 'art-icon'
    },
    {
      id: 6,
      title: '节日与庆典',
      description: '了解世界各地的传统节日和庆祝活动',
      topics: 64,
      posts: 1132,
      icon: 'festival-icon'
    }
  ];

  // 模拟热门话题数据
  const hotTopics = [
    {
      id: 101,
      title: '中国春节习俗大盘点',
      author: '文化达人',
      replies: 48,
      views: 1256,
      lastActivity: '2小时前'
    },
    {
      id: 102,
      title: '如何快速掌握一门外语？',
      author: '语言学习者',
      replies: 36,
      views: 982,
      lastActivity: '5小时前'
    },
    {
      id: 103,
      title: '各国餐桌礼仪对比',
      author: '环球旅行家',
      replies: 29,
      views: 876,
      lastActivity: '昨天'
    },
    {
      id: 104,
      title: '留学生如何克服思乡情绪',
      author: '心理顾问',
      replies: 52,
      views: 1378,
      lastActivity: '3天前'
    },
    {
      id: 105,
      title: '不同文化中的颜色象征意义',
      author: '艺术研究者',
      replies: 41,
      views: 1089,
      lastActivity: '4天前'
    }
  ];

  return (
    <div className="forum-list-page">
      <section className="forum-header">
        <h1>文化交流论坛</h1>
        <p>探索不同文化，分享您的见解和经验</p>
        <div className="forum-actions">
          <button className="primary-button">发布新主题</button>
          <div className="search-box">
            <input type="text" placeholder="搜索论坛..." />
            <button className="search-button">搜索</button>
          </div>
        </div>
      </section>

      <section className="forum-categories">
        <h2 className="section-title">论坛分类</h2>
        <div className="categories-container">
          {forumCategories.map(category => (
            <div className="category-card" key={category.id}>
              <div className={`category-icon ${category.icon}`}></div>
              <div className="category-content">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <div className="category-stats">
                  <span>{category.topics} 主题</span>
                  <span>{category.posts} 帖子</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="hot-topics">
        <h2 className="section-title">热门话题</h2>
        <div className="topics-container">
          <table className="topics-table">
            <thead>
              <tr>
                <th>话题</th>
                <th>作者</th>
                <th>回复</th>
                <th>浏览</th>
                <th>最后活动</th>
              </tr>
            </thead>
            <tbody>
              {hotTopics.map(topic => (
                <tr key={topic.id} className="topic-row">
                  <td className="topic-title">{topic.title}</td>
                  <td className="topic-author">{topic.author}</td>
                  <td className="topic-replies">{topic.replies}</td>
                  <td className="topic-views">{topic.views}</td>
                  <td className="topic-activity">{topic.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="forum-stats">
        <div className="stats-container">
          <div className="stat-item">
            <h4>605</h4>
            <p>主题</p>
          </div>
          <div className="stat-item">
            <h4>10,283</h4>
            <p>帖子</p>
          </div>
          <div className="stat-item">
            <h4>3,542</h4>
            <p>用户</p>
          </div>
          <div className="stat-item">
            <h4>文化达人</h4>
            <p>最活跃用户</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForumListPage;
