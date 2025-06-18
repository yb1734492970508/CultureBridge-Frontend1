import React, { useState, useEffect } from 'react';
import { useReward } from '../context/reward/RewardContext';
import './Home.css';

function Home() {
  const { user, addPoints } = useReward();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 125000,
    totalLessons: 2500,
    totalCommunities: 180,
    totalCountries: 45,
  });
  
  const heroSlides = [
    {
      title: '连接世界文化',
      subtitle: '通过学习赚取积分，在交流中成长',
      description: '加入全球最大的文化交流学习平台，与来自世界各地的朋友一起学习语言、分享文化、收获友谊。',
      image: '/images/hero/culture-bridge.jpg',
      cta: '开始学习之旅',
      ctaLink: '/learning',
    },
    {
      title: '智能语言学习',
      subtitle: '个性化课程，高效学习体验',
      description: '基于AI的个性化学习路径，让每个人都能找到最适合自己的学习方式，轻松掌握新语言。',
      image: '/images/hero/language-learning.jpg',
      cta: '探索课程',
      ctaLink: '/learning',
    },
    {
      title: '实时文化交流',
      subtitle: '与全球用户即时互动',
      description: '通过实时聊天、视频通话、文化分享等方式，与世界各地的文化爱好者建立真实的连接。',
      image: '/images/hero/cultural-exchange.jpg',
      cta: '加入社区',
      ctaLink: '/community',
    },
  ];
  
  const features = [
    {
      icon: '🎓',
      title: '智能学习系统',
      description: '基于AI的个性化学习路径，适应每个人的学习节奏和偏好。',
      benefits: ['个性化课程推荐', 'AI智能纠错', '学习进度跟踪', '成就激励系统'],
    },
    {
      icon: '🌍',
      title: '全球文化社区',
      description: '连接来自世界各地的文化爱好者，分享独特的文化体验。',
      benefits: ['多元文化交流', '实时语言练习', '文化活动参与', '国际友谊建立'],
    },
    {
      icon: '🎁',
      title: '丰富奖励系统',
      description: '通过学习和互动获得积分，兑换实用奖励和专属特权。',
      benefits: ['学习积分奖励', '互动积分获取', '贡献积分认可', '专属特权解锁'],
    },
    {
      icon: '💬',
      title: '实时翻译聊天',
      description: '突破语言障碍，与任何人都能流畅交流的智能翻译系统。',
      benefits: ['实时语音翻译', '文本智能翻译', '多语言支持', '文化背景解释'],
    },
  ];
  
  const testimonials = [
    {
      name: '李小明',
      avatar: '/images/avatars/user1.jpg',
      location: '北京，中国',
      rating: 5,
      content: '通过CultureBridge，我不仅学会了日语，还结识了很多日本朋友。这里的学习氛围特别好，每天都有新的收获！',
      achievement: '日语达人',
    },
    {
      name: 'Sarah Johnson',
      avatar: '/images/avatars/user2.jpg',
      location: 'New York, USA',
      rating: 5,
      content: 'Amazing platform! I\'ve learned so much about Chinese culture and improved my Mandarin significantly. The reward system keeps me motivated every day.',
      achievement: '文化探索者',
    },
    {
      name: '田中太郎',
      avatar: '/images/avatars/user3.jpg',
      location: '東京，日本',
      rating: 5,
      content: '中国の文化を学ぶのにとても良いプラットフォームです。リアルタイムの翻訳機能が素晴らしく、言語の壁を感じません。',
      achievement: '语言大师',
    },
  ];
  
  // 轮播图自动切换
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [heroSlides.length]);
  
  // 模拟统计数据更新
  useEffect(() => {
    const updateStats = () => {
      setStats(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 10),
        totalLessons: prev.totalLessons + Math.floor(Math.random() * 5),
        totalCommunities: prev.totalCommunities + Math.floor(Math.random() * 2),
        totalCountries: prev.totalCountries,
      }));
    };
    
    const timer = setInterval(updateStats, 10000);
    return () => clearInterval(timer);
  }, []);
  
  const handleGetStarted = () => {
    // 新用户奖励
    addPoints('learningPoints', 10, '欢迎加入CultureBridge');
    window.location.href = '/learning';
  };
  
  return (
    <div className="home">
      {/* 英雄区域 */}
      <section className="hero">
        <div className="hero-slider">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hero-overlay">
                <div className="container">
                  <div className="hero-content">
                    <h1 className="hero-title">{slide.title}</h1>
                    <h2 className="hero-subtitle">{slide.subtitle}</h2>
                    <p className="hero-description">{slide.description}</p>
                    <div className="hero-actions">
                      <button 
                        className="btn btn-primary btn-large"
                        onClick={handleGetStarted}
                      >
                        {slide.cta}
                      </button>
                      <a href="/about" className="btn btn-outline btn-large">
                        了解更多
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 轮播指示器 */}
        <div className="hero-indicators">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>
      
      {/* 统计数据 */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
              <div className="stat-label">注册用户</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalLessons.toLocaleString()}</div>
              <div className="stat-label">学习课程</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalCommunities}</div>
              <div className="stat-label">文化社区</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalCountries}</div>
              <div className="stat-label">覆盖国家</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 功能特色 */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">为什么选择CultureBridge</h2>
            <p className="section-description">
              我们致力于打造最优秀的文化交流学习平台，让每个人都能在这里找到属于自己的学习乐趣
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <ul className="feature-benefits">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="benefit-item">
                      <span className="benefit-check">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 用户评价 */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">用户真实评价</h2>
            <p className="section-description">
              听听我们的用户怎么说，他们的成功故事激励着我们不断前进
            </p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                  </div>
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-location">{testimonial.location}</p>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="star">⭐</span>
                      ))}
                    </div>
                  </div>
                  <div className="testimonial-achievement">
                    <span className="achievement-badge">{testimonial.achievement}</span>
                  </div>
                </div>
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 行动号召 */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">准备好开始你的文化学习之旅了吗？</h2>
            <p className="cta-description">
              加入我们的全球社区，与来自世界各地的朋友一起学习、交流、成长。
              现在注册即可获得新手大礼包！
            </p>
            <div className="cta-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={handleGetStarted}
              >
                立即开始学习
              </button>
              <div className="cta-bonus">
                <span className="bonus-icon">🎁</span>
                <span className="bonus-text">新用户专享10积分奖励</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

