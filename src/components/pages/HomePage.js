import React from 'react';
import '../../styles/pages/HomePage.css';

const HomePage = () => {
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
