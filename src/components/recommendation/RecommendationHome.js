import React, { useState, useEffect, useCallback } from 'react';
import { useRecommendationEngine } from '../../hooks/useRecommendationEngine';
import RecommendationCard from './RecommendationCard';
import './RecommendationHome.css';

/**
 * 推荐首页组件
 * 展示多种类型的NFT推荐内容
 */
const RecommendationHome = ({ userId, className = "" }) => {
  const [activeSection, setActiveSection] = useState('personalized');
  const [refreshing, setRefreshing] = useState({});
  
  const {
    recommendations,
    loading,
    error,
    refreshRecommendations,
    updateUserFeedback
  } = useRecommendationEngine(userId);

  // 推荐板块配置
  const recommendationSections = [
    {
      id: 'personalized',
      title: '为你推荐',
      description: '基于你的浏览历史和偏好精心挑选',
      icon: '🎯',
      type: 'grid',
      limit: 8
    },
    {
      id: 'trending',
      title: '热门趋势',
      description: '当前最受欢迎和热门的NFT',
      icon: '🔥',
      type: 'carousel',
      limit: 12
    },
    {
      id: 'new',
      title: '新品上架',
      description: '最新发布的优质NFT作品',
      icon: '✨',
      type: 'grid',
      limit: 6
    },
    {
      id: 'similar',
      title: '相似推荐',
      description: '与你收藏的NFT风格相似的作品',
      icon: '🎨',
      type: 'carousel',
      limit: 10
    },
    {
      id: 'investment',
      title: '投资潜力',
      description: '具有投资价值和升值潜力的NFT',
      icon: '📈',
      type: 'grid',
      limit: 6
    },
    {
      id: 'community',
      title: '社区推荐',
      description: '社区用户热门收藏和推荐',
      icon: '👥',
      type: 'carousel',
      limit: 8
    }
  ];

  // 处理推荐刷新
  const handleRefreshSection = async (sectionId) => {
    setRefreshing(prev => ({ ...prev, [sectionId]: true }));
    
    try {
      await refreshRecommendations(sectionId);
    } catch (error) {
      console.error('刷新推荐失败:', error);
    } finally {
      setRefreshing(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  // 处理推荐反馈
  const handleRecommendationFeedback = (recommendationId, feedback) => {
    updateUserFeedback(recommendationId, feedback);
  };

  // 渲染推荐卡片网格
  const renderRecommendationGrid = (items, sectionId) => (
    <div className="recommendation-grid">
      {items.map(item => (
        <RecommendationCard
          key={item.id}
          recommendation={item}
          onFeedback={(feedback) => handleRecommendationFeedback(item.id, feedback)}
        />
      ))}
    </div>
  );

  // 渲染推荐轮播
  const renderRecommendationCarousel = (items, sectionId) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerView = 4;
    const maxIndex = Math.max(0, items.length - itemsPerView);

    const handlePrevious = () => {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    };

    const handleNext = () => {
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    };

    return (
      <div className="recommendation-carousel">
        <div 
          className="carousel-container"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {items.map(item => (
            <div key={item.id} className="carousel-item">
              <RecommendationCard
                recommendation={item}
                onFeedback={(feedback) => handleRecommendationFeedback(item.id, feedback)}
              />
            </div>
          ))}
        </div>
        
        {items.length > itemsPerView && (
          <>
            <button
              className="carousel-controls carousel-prev"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              ‹
            </button>
            <button
              className="carousel-controls carousel-next"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
            >
              ›
            </button>
            
            <div className="carousel-indicators">
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <button
                  key={index}
                  className={`carousel-indicator ${
                    index === currentIndex ? 'active' : ''
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // 渲染推荐板块
  const renderRecommendationSection = (section) => {
    const sectionData = recommendations[section.id] || [];
    const isRefreshing = refreshing[section.id];
    
    if (loading[section.id] && sectionData.length === 0) {
      return (
        <div className="recommendation-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">{section.icon}</span>
              {section.title}
              <div className="section-description">{section.description}</div>
            </div>
          </div>
          <div className="recommendation-loading">
            <div className="loading-spinner" />
            <p>正在加载推荐内容...</p>
          </div>
        </div>
      );
    }

    if (error[section.id]) {
      return (
        <div className="recommendation-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">{section.icon}</span>
              {section.title}
              <div className="section-description">{section.description}</div>
            </div>
          </div>
          <div className="recommendation-error">
            <h3>加载失败</h3>
            <p>{error[section.id].message}</p>
            <button onClick={() => handleRefreshSection(section.id)}>
              重试
            </button>
          </div>
        </div>
      );
    }

    if (sectionData.length === 0) {
      return (
        <div className="recommendation-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">{section.icon}</span>
              {section.title}
              <div className="section-description">{section.description}</div>
            </div>
          </div>
          <div className="recommendation-empty">
            <div className="empty-icon">🎨</div>
            <h3>暂无推荐内容</h3>
            <p>我们正在为你寻找更多精彩的NFT</p>
          </div>
        </div>
      );
    }

    return (
      <div className="recommendation-section">
        <div className="section-header">
          <div className="section-title">
            <span className="section-icon">{section.icon}</span>
            {section.title}
            <div className="section-description">{section.description}</div>
          </div>
          <div className="section-actions">
            <button
              className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
              onClick={() => handleRefreshSection(section.id)}
              disabled={isRefreshing}
            >
              <span className="refresh-icon">🔄</span>
              {isRefreshing ? '刷新中...' : '刷新'}
            </button>
            <button className="customize-button">
              <span className="customize-icon">⚙️</span>
              定制
            </button>
            <button className="view-all-button">
              查看全部
            </button>
          </div>
        </div>

        <div className="section-content">
          {section.type === 'grid' 
            ? renderRecommendationGrid(sectionData.slice(0, section.limit), section.id)
            : renderRecommendationCarousel(sectionData.slice(0, section.limit), section.id)
          }
        </div>
      </div>
    );
  };

  if (loading.initial) {
    return (
      <div className="recommendation-home-loading">
        <div className="loading-spinner" />
        <p>正在为你准备个性化推荐...</p>
      </div>
    );
  }

  return (
    <div className={`recommendation-home ${className}`}>
      <div className="recommendation-header">
        <h1 className="recommendation-title">为你推荐</h1>
        <p className="recommendation-subtitle">
          基于你的兴趣和行为，我们为你精心挑选了这些NFT
        </p>
      </div>

      <div className="recommendation-sections">
        {recommendationSections.map(section => (
          <div key={section.id}>
            {renderRecommendationSection(section)}
          </div>
        ))}
      </div>

      {/* 个性化设置快捷入口 */}
      <div className="personalization-cta">
        <div className="cta-content">
          <h3>想要更精准的推荐？</h3>
          <p>告诉我们你的偏好，我们会为你提供更个性化的推荐</p>
          <button className="customize-preferences-button">
            定制推荐偏好
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationHome;

