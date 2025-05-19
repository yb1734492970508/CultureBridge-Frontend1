import React, { useState, useEffect } from 'react';
import '../../styles/pages/HomePage.css';

const HomePage = () => {
  // 文化推荐卡片数据
  const [culturalRecommendations, setCulturalRecommendations] = useState([
    {
      id: 1,
      title: '中国传统节日：端午节',
      description: '了解端午节的起源、传统习俗和美食，探索这一重要文化遗产的现代意义。',
      image: 'dragon-boat-festival.jpg',
      category: '传统节日'
    },
    {
      id: 2,
      title: '日本茶道艺术',
      description: '深入了解日本茶道的历史、仪式和哲学，体验这一传统艺术形式的精髓。',
      image: 'japanese-tea-ceremony.jpg',
      category: '传统艺术'
    },
    {
      id: 3,
      title: '印度古典舞蹈：巴拉塔纳提亚姆',
      description: '探索印度最古老的古典舞蹈形式之一，了解其丰富的历史和表现技巧。',
      image: 'bharatanatyam.jpg',
      category: '舞蹈艺术'
    },
    {
      id: 4,
      title: '意大利美食文化',
      description: '从披萨到意大利面，探索意大利美食背后的历史、地区差异和文化意义。',
      image: 'italian-cuisine.jpg',
      category: '美食文化'
    }
  ]);

  // 热门活动数据
  const [featuredEvents, setFeaturedEvents] = useState([
    {
      id: 101,
      title: '全球文化节',
      date: '2025年6月15日',
      location: '北京，中国',
      image: 'global-culture-festival.jpg'
    },
    {
      id: 102,
      title: '国际语言交流日',
      date: '2025年6月21日',
      location: '线上活动',
      image: 'language-exchange-day.jpg'
    },
    {
      id: 103,
      title: '世界音乐嘉年华',
      date: '2025年7月5日',
      location: '巴黎，法国',
      image: 'world-music-carnival.jpg'
    }
  ]);

  // 轮播图状态
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 自动轮播效果
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredEvents.length]);

  // 手动切换轮播图
  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // 10秒后恢复自动播放
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // 下一张轮播图
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // 上一张轮播图
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>连接世界，促进文化交流</h1>
          <p>CultureBridge 是一个致力于促进不同文化背景人群交流与理解的平台</p>
          <div className="hero-buttons">
            <a href="/forum" className="primary-button">探索论坛</a>
            <a href="/learning" className="secondary-button">开始学习</a>
          </div>
        </div>
      </section>

      {/* 热门活动轮播 */}
      <section className="featured-events-section">
        <h2 className="section-title">热门活动</h2>
        <div className="carousel-container">
          <button className="carousel-arrow carousel-arrow-left" onClick={prevSlide}>
            &lt;
          </button>
          
          <div className="carousel-content">
            {featuredEvents.map((event, index) => (
              <div 
                key={event.id} 
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                style={{transform: `translateX(${100 * (index - currentSlide)}%)`}}
              >
                <div className="event-card">
                  <div className="event-card-image"></div>
                  <div className="event-card-content">
                    <h3>{event.title}</h3>
                    <div className="event-card-details">
                      <span className="event-date">{event.date}</span>
                      <span className="event-location">{event.location}</span>
                    </div>
                    <a href={`/events/${event.id}`} className="event-card-button">了解详情</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="carousel-arrow carousel-arrow-right" onClick={nextSlide}>
            &gt;
          </button>
          
          <div className="carousel-indicators">
            {featuredEvents.map((_, index) => (
              <button 
                key={index} 
                className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">我们的特色</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon forum-icon"></div>
            <h3>文化交流论坛</h3>
            <p>与来自世界各地的用户讨论文化差异、习俗和传统，分享您的经验和见解。</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon learning-icon"></div>
            <h3>语言学习资源</h3>
            <p>获取丰富的语言学习材料，与母语者交流，提高您的语言技能。</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon events-icon"></div>
            <h3>文化活动日历</h3>
            <p>发现并参与各种文化活动，从传统节日到现代庆典，拓展您的文化视野。</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon community-icon"></div>
            <h3>跨文化社区</h3>
            <p>加入志同道合的社区，建立跨文化友谊，共同成长和学习。</p>
          </div>
        </div>
      </section>

      {/* 文化推荐卡片 */}
      <section className="cultural-recommendations-section">
        <h2 className="section-title">文化推荐</h2>
        <div className="recommendations-container">
          {culturalRecommendations.map(recommendation => (
            <div key={recommendation.id} className="recommendation-card">
              <div className="recommendation-image"></div>
              <div className="recommendation-content">
                <span className="recommendation-category">{recommendation.category}</span>
                <h3>{recommendation.title}</h3>
                <p>{recommendation.description}</p>
                <a href={`/culture/${recommendation.id}`} className="recommendation-link">
                  阅读更多
                  <span className="arrow-icon">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all-container">
          <a href="/culture" className="view-all-link">查看全部推荐</a>
        </div>
      </section>

      <section className="join-section">
        <div className="join-content">
          <h2>加入我们的全球社区</h2>
          <p>成为CultureBridge的一员，开启您的跨文化交流之旅</p>
          <a href="/auth" className="primary-button">立即注册</a>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-title">用户心声</h2>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <p className="testimonial-text">"通过CultureBridge，我不仅学习了新的语言，还结交了来自世界各地的朋友。这个平台真的改变了我对其他文化的理解。"</p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>李明</h4>
                <p>中国，北京</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <p className="testimonial-text">"作为一名留学生，CultureBridge帮助我更好地融入当地文化，理解当地习俗，这对我的学习和生活都有很大帮助。"</p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <p>美国，纽约</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <p className="testimonial-text">"我在这里找到了志同道合的朋友，我们一起学习语言，分享文化，这是一段非常宝贵的经历。"</p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Carlos Rodriguez</h4>
                <p>西班牙，马德里</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
