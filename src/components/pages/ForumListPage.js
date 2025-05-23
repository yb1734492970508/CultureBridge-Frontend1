import React, { useState } from 'react';
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
  const allTopics = [
    {
      id: 101,
      title: '中国春节习俗大盘点',
      author: '文化达人',
      replies: 48,
      views: 1256,
      lastActivity: '2小时前',
      category: '文化交流'
    },
    {
      id: 102,
      title: '如何快速掌握一门外语？',
      author: '语言学习者',
      replies: 36,
      views: 982,
      lastActivity: '5小时前',
      category: '语言学习'
    },
    {
      id: 103,
      title: '各国餐桌礼仪对比',
      author: '环球旅行家',
      replies: 29,
      views: 876,
      lastActivity: '昨天',
      category: '文化交流'
    },
    {
      id: 104,
      title: '留学生如何克服思乡情绪',
      author: '心理顾问',
      replies: 52,
      views: 1378,
      lastActivity: '3天前',
      category: '留学生活'
    },
    {
      id: 105,
      title: '不同文化中的颜色象征意义',
      author: '艺术研究者',
      replies: 41,
      views: 1089,
      lastActivity: '4天前',
      category: '艺术与音乐'
    },
    {
      id: 106,
      title: '法国葡萄酒文化探索',
      author: '美食爱好者',
      replies: 27,
      views: 843,
      lastActivity: '1周前',
      category: '美食世界'
    },
    {
      id: 107,
      title: '日本动漫对全球流行文化的影响',
      author: '文化评论家',
      replies: 63,
      views: 1567,
      lastActivity: '2天前',
      category: '艺术与音乐'
    },
    {
      id: 108,
      title: '印度排灯节的庆祝方式',
      author: '文化探索者',
      replies: 19,
      views: 721,
      lastActivity: '5天前',
      category: '节日与庆典'
    },
    {
      id: 109,
      title: '西班牙语和葡萄牙语的异同',
      author: '语言学家',
      replies: 31,
      views: 876,
      lastActivity: '3天前',
      category: '语言学习'
    },
    {
      id: 110,
      title: '在国外租房的经验分享',
      author: '留学顾问',
      replies: 45,
      views: 1243,
      lastActivity: '1天前',
      category: '留学生活'
    }
  ];

  // 状态管理
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const topicsPerPage = 5;

  // 根据分类和搜索过滤话题
  const filteredTopics = allTopics.filter(topic => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topic.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 分页处理
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = filteredTopics.slice(indexOfFirstTopic, indexOfLastTopic);
  const totalPages = Math.ceil(filteredTopics.length / topicsPerPage);

  // 页面切换
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // 处理分类变更
  const handleCategoryChange = (categoryTitle) => {
    setSelectedCategory(categoryTitle === '全部' ? 'all' : categoryTitle);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    // 搜索已经通过状态实时过滤，这里只需重置页码
    setCurrentPage(1);
  };

  return (
    <div className="forum-list-page">
      <section className="forum-header">
        <h1>文化交流论坛</h1>
        <p>探索不同文化，分享您的见解和经验</p>
        <div className="forum-actions">
          <button className="primary-button">发布新主题</button>
          <form className="search-box" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="搜索论坛..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">搜索</button>
          </form>
        </div>
      </section>

      <section className="forum-categories">
        <h2 className="section-title">论坛分类</h2>
        <div className="category-filter">
          <button 
            className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('全部')}
          >
            全部
          </button>
          {forumCategories.map(category => (
            <button 
              key={category.id}
              className={`filter-button ${selectedCategory === category.title ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.title)}
            >
              {category.title}
            </button>
          ))}
        </div>
        <div className="categories-container">
          {forumCategories.map(category => (
            <div 
              className={`category-card ${selectedCategory === category.title ? 'highlighted' : ''}`} 
              key={category.id}
              onClick={() => handleCategoryChange(category.title)}
            >
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
        <h2 className="section-title">
          {selectedCategory === 'all' ? '热门话题' : `${selectedCategory}话题`}
          {searchQuery && ` - 搜索结果: "${searchQuery}"`}
        </h2>
        {filteredTopics.length > 0 ? (
          <div className="topics-container">
            <table className="topics-table">
              <thead>
                <tr>
                  <th>话题</th>
                  <th>作者</th>
                  <th>分类</th>
                  <th>回复</th>
                  <th>浏览</th>
                  <th>最后活动</th>
                </tr>
              </thead>
              <tbody>
                {currentTopics.map(topic => (
                  <tr key={topic.id} className="topic-row">
                    <td className="topic-title">{topic.title}</td>
                    <td className="topic-author">{topic.author}</td>
                    <td className="topic-category">{topic.category}</td>
                    <td className="topic-replies">{topic.replies}</td>
                    <td className="topic-views">{topic.views}</td>
                    <td className="topic-activity">{topic.lastActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* 分页控件 */}
            <div className="pagination">
              <button 
                className="pagination-button" 
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                上一页
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                className="pagination-button" 
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                下一页
              </button>
            </div>
          </div>
        ) : (
          <div className="no-topics">
            <p>没有找到符合条件的话题</p>
            <button 
              className="reset-button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              重置筛选条件
            </button>
          </div>
        )}
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
