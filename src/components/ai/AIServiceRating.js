/**
 * AI服务评分与推荐组件
 * 用于评价和推荐AI翻译服务
 */

import React, { useState, useEffect } from 'react';
import BlockchainConnector from '../../utils/BlockchainConnector';
import './AIServiceRating.css';

const AIServiceRating = ({ account, aiRegistry }) => {
  // 状态变量
  const [aiServices, setAIServices] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [selectedService, setSelectedService] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [ratingForm, setRatingForm] = useState({ serviceId: '', rating: 0, comment: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [recommendedServices, setRecommendedServices] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    languages: [],
    serviceTypes: [],
    priceRange: [0, 100]
  });

  // 初始化
  useEffect(() => {
    if (account && aiRegistry) {
      loadServices();
      loadUserRatings();
      loadUserPreferences();
    }
  }, [account, aiRegistry]);

  // 加载AI服务
  const loadServices = async () => {
    try {
      setIsLoading(true);
      
      // 从合约加载AI服务
      const services = await loadAIServices();
      setAIServices(services);
      
      // 生成推荐服务
      generateRecommendations(services);
      
    } catch (err) {
      console.error('加载AI服务错误:', err);
      setError('加载AI服务失败');
      showNotification('加载AI服务失败: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 加载用户评分
  const loadUserRatings = async () => {
    try {
      // 从合约加载用户评分
      const ratings = await loadUserServiceRatings(account);
      
      // 转换为以serviceId为键的对象
      const ratingsMap = {};
      ratings.forEach(rating => {
        ratingsMap[rating.serviceId] = rating;
      });
      
      setUserRatings(ratingsMap);
    } catch (err) {
      console.error('加载用户评分错误:', err);
    }
  };

  // 加载用户偏好
  const loadUserPreferences = async () => {
    try {
      // 从本地存储或合约加载用户偏好
      // 这里使用模拟数据
      setUserPreferences({
        languages: ['en-zh', 'ja-zh'],
        serviceTypes: ['TranslationService', 'CulturalExplanation'],
        priceRange: [0, 50]
      });
    } catch (err) {
      console.error('加载用户偏好错误:', err);
    }
  };

  // 加载AI服务（示例实现）
  const loadAIServices = async () => {
    // 模拟数据，实际应从合约获取
    return [
      {
        id: 1,
        name: 'AI翻译大师',
        provider: '0x123...456',
        serviceType: 'TranslationService',
        description: '专业的AI翻译服务，支持多种语言和专业领域',
        languages: ['en-zh', 'zh-en', 'ja-zh', 'zh-ja'],
        pricePerToken: '0.1',
        totalUsers: 1245,
        totalTranslations: 15678,
        averageRating: 4.7,
        reviewCount: 328,
        createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
        features: [
          '专业术语库支持',
          '上下文理解',
          '文化适应性翻译',
          '24小时客户支持'
        ],
        performanceMetrics: {
          accuracy: 95,
          speed: 92,
          consistency: 90
        }
      },
      {
        id: 2,
        name: '文化桥梁AI',
        provider: '0x789...012',
        serviceType: 'CulturalExplanation',
        description: '专注于跨文化交流的AI服务，提供文化背景解释和习语翻译',
        languages: ['en-zh', 'zh-en', 'fr-zh', 'zh-fr'],
        pricePerToken: '0.15',
        totalUsers: 876,
        totalTranslations: 9543,
        averageRating: 4.5,
        reviewCount: 215,
        createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
        features: [
          '文化背景解释',
          '习语和俚语翻译',
          '历史文化参考',
          '文化敏感性检查'
        ],
        performanceMetrics: {
          accuracy: 92,
          speed: 88,
          consistency: 94
        }
      },
      {
        id: 3,
        name: '技术文档翻译器',
        provider: '0x345...678',
        serviceType: 'SpecializedTranslation',
        description: '专门针对技术文档、API文档和软件界面的专业翻译服务',
        languages: ['en-zh', 'zh-en', 'ja-zh'],
        pricePerToken: '0.2',
        totalUsers: 543,
        totalTranslations: 6789,
        averageRating: 4.8,
        reviewCount: 178,
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        features: [
          '技术术语库',
          '代码片段保留',
          '格式保持',
          '技术准确性验证'
        ],
        performanceMetrics: {
          accuracy: 97,
          speed: 90,
          consistency: 95
        }
      },
      {
        id: 4,
        name: '实时对话翻译',
        provider: '0x901...234',
        serviceType: 'ConversationalTranslation',
        description: '实时对话翻译服务，适用于会议、聊天和视频通话',
        languages: ['en-zh', 'zh-en', 'ja-zh', 'ko-zh'],
        pricePerToken: '0.12',
        totalUsers: 1876,
        totalTranslations: 28954,
        averageRating: 4.3,
        reviewCount: 456,
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        features: [
          '低延迟实时翻译',
          '语音识别集成',
          '多人对话支持',
          '方言识别'
        ],
        performanceMetrics: {
          accuracy: 89,
          speed: 96,
          consistency: 87
        }
      },
      {
        id: 5,
        name: '文学翻译助手',
        provider: '0x567...890',
        serviceType: 'LiteraryTranslation',
        description: '专注于文学作品、诗歌和创意内容的翻译服务',
        languages: ['en-zh', 'zh-en', 'fr-zh', 'ru-zh'],
        pricePerToken: '0.25',
        totalUsers: 432,
        totalTranslations: 3567,
        averageRating: 4.6,
        reviewCount: 132,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        features: [
          '风格保留',
          '韵律和节奏分析',
          '文学手法翻译',
          '作者风格模拟'
        ],
        performanceMetrics: {
          accuracy: 93,
          speed: 85,
          consistency: 92
        }
      }
    ];
  };

  // 加载用户服务评分（示例实现）
  const loadUserServiceRatings = async (userAccount) => {
    // 模拟数据，实际应从合约获取
    return [
      {
        serviceId: 1,
        rating: 5,
        comment: '翻译质量非常高，专业术语的处理很准确',
        timestamp: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        serviceId: 3,
        rating: 4,
        comment: '技术文档翻译很专业，但有时速度较慢',
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString()
      }
    ];
  };

  // 生成推荐服务
  const generateRecommendations = (services) => {
    try {
      // 基于用户偏好和历史评分生成推荐
      const { languages, serviceTypes, priceRange } = userPreferences;
      
      // 过滤符合用户偏好的服务
      let filtered = services.filter(service => {
        // 检查语言偏好
        const languageMatch = languages.length === 0 || 
          service.languages.some(lang => languages.includes(lang));
        
        // 检查服务类型偏好
        const typeMatch = serviceTypes.length === 0 || 
          serviceTypes.includes(service.serviceType);
        
        // 检查价格范围
        const price = parseFloat(service.pricePerToken);
        const priceMatch = price >= priceRange[0] && price <= priceRange[1];
        
        return languageMatch && typeMatch && priceMatch;
      });
      
      // 如果用户有评分，考虑评分因素
      if (Object.keys(userRatings).length > 0) {
        // 找出用户高评分的服务类型
        const highRatedTypes = Object.entries(userRatings)
          .filter(([_, rating]) => rating.rating >= 4)
          .map(([serviceId]) => {
            const service = services.find(s => s.id === parseInt(serviceId));
            return service ? service.serviceType : null;
          })
          .filter(Boolean);
        
        // 提升同类型服务的权重
        filtered = filtered.map(service => ({
          ...service,
          weight: highRatedTypes.includes(service.serviceType) ? 2 : 1
        }));
      } else {
        // 没有评分历史，使用默认权重
        filtered = filtered.map(service => ({
          ...service,
          weight: 1
        }));
      }
      
      // 根据评分和权重排序
      filtered.sort((a, b) => {
        return (b.averageRating * b.weight) - (a.averageRating * a.weight);
      });
      
      // 取前3个作为推荐
      setRecommendedServices(filtered.slice(0, 3));
    } catch (err) {
      console.error('生成推荐错误:', err);
    }
  };

  // 提交评分
  const submitRating = async () => {
    try {
      setIsLoading(true);
      
      const { serviceId, rating, comment } = ratingForm;
      
      if (!serviceId || rating === 0) {
        throw new Error('请提供评分');
      }
      
      // 调用合约提交评分
      const tx = await aiRegistry.rateService(serviceId, rating, comment || '');
      await tx.wait();
      
      // 更新用户评分
      setUserRatings(prev => ({
        ...prev,
        [serviceId]: {
          serviceId: parseInt(serviceId),
          rating,
          comment,
          timestamp: new Date().toISOString()
        }
      }));
      
      // 更新服务评分
      setAIServices(prev => {
        return prev.map(service => {
          if (service.id === parseInt(serviceId)) {
            const newReviewCount = service.reviewCount + 1;
            const newTotalRating = service.averageRating * service.reviewCount + rating;
            const newAverageRating = newTotalRating / newReviewCount;
            
            return {
              ...service,
              reviewCount: newReviewCount,
              averageRating: newAverageRating
            };
          }
          return service;
        });
      });
      
      // 关闭模态框
      setShowRatingModal(false);
      
      // 重置表单
      setRatingForm({ serviceId: '', rating: 0, comment: '' });
      
      // 重新生成推荐
      generateRecommendations(aiServices);
      
      showNotification('评分提交成功', 'success');
    } catch (err) {
      console.error('提交评分错误:', err);
      setError('提交评分失败');
      showNotification('提交评分失败: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 使用AI服务
  const useService = async (service) => {
    try {
      setIsLoading(true);
      
      // 这里应该跳转到翻译界面或集成服务
      // 示例实现只显示通知
      showNotification(`正在使用 ${service.name} 服务`, 'info');
      
      // 实际应用中应该跳转或集成
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('使用服务错误:', err);
      setError('使用服务失败');
      showNotification('使用服务失败: ' + err.message, 'error');
      setIsLoading(false);
    }
  };

  // 更新用户偏好
  const updateUserPreferences = (newPreferences) => {
    try {
      setUserPreferences(prev => ({
        ...prev,
        ...newPreferences
      }));
      
      // 重新生成推荐
      generateRecommendations(aiServices);
      
      showNotification('偏好设置已更新', 'success');
    } catch (err) {
      console.error('更新偏好错误:', err);
      showNotification('更新偏好失败: ' + err.message, 'error');
    }
  };

  // 处理评分表单变化
  const handleRatingFormChange = (e) => {
    const { name, value } = e.target;
    setRatingForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  // 设置评分星级
  const handleSetRating = (rating) => {
    setRatingForm(prev => ({
      ...prev,
      rating
    }));
  };

  // 显示通知
  const showNotification = (message, type = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // 3秒后自动关闭
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // 打开评分模态框
  const openRatingModal = (service) => {
    setSelectedService(service);
    setRatingForm({
      serviceId: service.id.toString(),
      rating: userRatings[service.id]?.rating || 0,
      comment: userRatings[service.id]?.comment || ''
    });
    setShowRatingModal(true);
  };

  // 打开服务详情模态框
  const openServiceDetail = (service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  // 过滤服务
  const filterServices = (services) => {
    return services.filter(service => {
      // 搜索过滤
      const searchMatch = searchQuery === '' || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 语言过滤
      const languageMatch = filterLanguage === 'all' || 
        service.languages.some(lang => lang.includes(filterLanguage));
      
      // 评分过滤
      const ratingMatch = service.averageRating >= filterMinRating;
      
      return searchMatch && languageMatch && ratingMatch;
    });
  };

  // 排序服务
  const sortServices = (services) => {
    switch (sortBy) {
      case 'rating':
        return [...services].sort((a, b) => b.averageRating - a.averageRating);
      case 'price_high':
        return [...services].sort((a, b) => parseFloat(b.pricePerToken) - parseFloat(a.pricePerToken));
      case 'price_low':
        return [...services].sort((a, b) => parseFloat(a.pricePerToken) - parseFloat(b.pricePerToken));
      case 'popularity':
        return [...services].sort((a, b) => b.totalUsers - a.totalUsers);
      default:
        return services;
    }
  };

  // 获取当前显示的服务
  const getCurrentServices = () => {
    const filtered = filterServices(aiServices);
    return sortServices(filtered);
  };

  // 渲染服务卡片
  const renderServiceCard = (service, isRecommended = false) => {
    const userRating = userRatings[service.id];
    
    return (
      <div key={service.id} className={`service-card ${isRecommended ? 'recommended' : ''}`}>
        {isRecommended && <div className="recommended-badge">推荐</div>}
        
        <div className="service-header">
          <h3>{service.name}</h3>
          <div className="service-type">{service.serviceType}</div>
        </div>
        
        <div className="service-rating">
          <div className="rating-stars">
            {Array(5).fill().map((_, i) => (
              <span 
                key={i} 
                className={`star ${i < Math.floor(service.averageRating) ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rating-score">{service.averageRating.toFixed(1)}</span>
          <span className="rating-count">({service.reviewCount})</span>
        </div>
        
        <p className="service-description">{service.description}</p>
        
        <div className="service-languages">
          <span className="label">支持语言:</span>
          <div className="language-tags">
            {service.languages.map((lang, index) => (
              <span key={index} className="language-tag">{lang}</span>
            ))}
          </div>
        </div>
        
        <div className="service-metrics">
          <div className="metric">
            <span className="metric-label">用户数:</span>
            <span className="metric-value">{service.totalUsers}</span>
          </div>
          <div className="metric">
            <span className="metric-label">翻译量:</span>
            <span className="metric-value">{service.totalTranslations}</span>
          </div>
          <div className="metric">
            <span className="metric-label">价格:</span>
            <span className="metric-value">{service.pricePerToken} CULT/token</span>
          </div>
        </div>
        
        {userRating && (
          <div className="user-rating">
            <div className="user-rating-header">
              <span className="label">您的评分:</span>
              <div className="user-rating-stars">
                {Array(5).fill().map((_, i) => (
                  <span 
                    key={i} 
                    className={`star ${i < userRating.rating ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            {userRating.comment && (
              <p className="user-comment">{userRating.comment}</p>
            )}
          </div>
        )}
        
        <div className="service-actions">
          <button 
            className="btn-use-service"
            onClick={() => useService(service)}
            disabled={isLoading}
          >
            使用服务
          </button>
          <button 
            className="btn-rate-service"
            onClick={() => openRatingModal(service)}
            disabled={isLoading}
          >
            {userRating ? '修改评分' : '评分'}
          </button>
          <button 
            className="btn-view-details"
            onClick={() => openServiceDetail(service)}
          >
            详情
          </button>
        </div>
      </div>
    );
  };

  // 渲染服务详情模态框
  const renderServiceDetailModal = () => {
    if (!selectedService) return null;
    
    const userRating = userRatings[selectedService.id];
    
    return (
      <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
        <div className="modal-content service-detail-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedService.name}</h2>
            <button className="btn-close" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="service-detail-container">
              <div className="service-detail-section">
                <h3>基本信息</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">服务类型</span>
                    <span className="detail-value">{selectedService.serviceType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">提供者</span>
                    <span className="detail-value">{selectedService.provider}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">创建时间</span>
                    <span className="detail-value">{new Date(selectedService.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">价格</span>
                    <span className="detail-value">{selectedService.pricePerToken} CULT/token</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">用户数</span>
                    <span className="detail-value">{selectedService.totalUsers}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">翻译总量</span>
                    <span className="detail-value">{selectedService.totalTranslations}</span>
                  </div>
                </div>
              </div>
              
              <div className="service-detail-section">
                <h3>评分与评价</h3>
                <div className="rating-summary">
                  <div className="rating-big">
                    <span className="rating-number">{selectedService.averageRating.toFixed(1)}</span>
                    <div className="rating-stars large">
                      {Array(5).fill().map((_, i) => (
                        <span 
                          key={i} 
                          className={`star ${i < Math.floor(selectedService.averageRating) ? 'filled' : ''}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="rating-count">基于 {selectedService.reviewCount} 条评价</span>
                  </div>
                  
                  {userRating && (
                    <div className="user-rating-detail">
                      <h4>您的评价</h4>
                      <div className="user-rating-stars">
                        {Array(5).fill().map((_, i) => (
                          <span 
                            key={i} 
                            className={`star ${i < userRating.rating ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {userRating.comment && (
                        <p className="user-comment">{userRating.comment}</p>
                      )}
                      <p className="rating-date">评价于 {new Date(userRating.timestamp).toLocaleDateString()}</p>
                      <button 
                        className="btn-edit-rating"
                        onClick={() => {
                          setShowDetailModal(false);
                          openRatingModal(selectedService);
                        }}
                      >
                        修改评价
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="service-detail-section">
                <h3>支持语言</h3>
                <div className="language-tags large">
                  {selectedService.languages.map((lang, index) => (
                    <span key={index} className="language-tag">{lang}</span>
                  ))}
                </div>
              </div>
              
              <div className="service-detail-section">
                <h3>服务特点</h3>
                <ul className="feature-list">
                  {selectedService.features.map((feature, index) => (
                    <li key={index} className="feature-item">{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="service-detail-section">
                <h3>性能指标</h3>
                <div className="performance-metrics">
                  <div className="performance-metric">
                    <span className="metric-label">准确度</span>
                    <div className="metric-bar-container">
                      <div 
                        className="metric-bar" 
                        style={{ width: `${selectedService.performanceMetrics.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="metric-value">{selectedService.performanceMetrics.accuracy}%</span>
                  </div>
                  <div className="performance-metric">
                    <span className="metric-label">速度</span>
                    <div className="metric-bar-container">
                      <div 
                        className="metric-bar" 
                        style={{ width: `${selectedService.performanceMetrics.speed}%` }}
                      ></div>
                    </div>
                    <span className="metric-value">{selectedService.performanceMetrics.speed}%</span>
                  </div>
                  <div className="performance-metric">
                    <span className="metric-label">一致性</span>
                    <div className="metric-bar-container">
                      <div 
                        className="metric-bar" 
                        style={{ width: `${selectedService.performanceMetrics.consistency}%` }}
                      ></div>
                    </div>
                    <span className="metric-value">{selectedService.performanceMetrics.consistency}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn-use-service"
              onClick={() => {
                useService(selectedService);
                setShowDetailModal(false);
              }}
              disabled={isLoading}
            >
              使用服务
            </button>
            {!userRating && (
              <button 
                className="btn-rate-service"
                onClick={() => {
                  setShowDetailModal(false);
                  openRatingModal(selectedService);
                }}
                disabled={isLoading}
              >
                评分
              </button>
            )}
            <button 
              className="btn-close-detail"
              onClick={() => setShowDetailModal(false)}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染评分模态框
  const renderRatingModal = () => {
    return (
      <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>评价服务</h2>
            <button className="btn-close" onClick={() => setShowRatingModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="service-name">{selectedService?.name}</div>
            
            <div className="rating-form">
              <div className="rating-selection">
                <span className="rating-label">您的评分:</span>
                <div className="rating-stars interactive">
                  {Array(5).fill().map((_, i) => (
                    <span 
                      key={i} 
                      className={`star ${i < ratingForm.rating ? 'filled' : ''}`}
                      onClick={() => handleSetRating(i + 1)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-value">{ratingForm.rating} / 5</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="comment">评价内容 (可选)</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={ratingForm.comment}
                  onChange={handleRatingFormChange}
                  placeholder="请分享您对这个服务的评价..."
                  rows={4}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn-cancel"
              onClick={() => setShowRatingModal(false)}
            >
              取消
            </button>
            <button 
              className="btn-submit"
              onClick={submitRating}
              disabled={isLoading || ratingForm.rating === 0}
            >
              {isLoading ? '提交中...' : '提交评价'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染用户偏好设置
  const renderPreferencesSection = () => {
    return (
      <div className="preferences-section">
        <h3>个性化推荐设置</h3>
        
        <div className="preferences-form">
          <div className="preference-group">
            <label>语言偏好</label>
            <div className="language-checkboxes">
              {['en-zh', 'zh-en', 'ja-zh', 'fr-zh', 'ko-zh'].map(lang => (
                <div key={lang} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`lang-${lang}`}
                    checked={userPreferences.languages.includes(lang)}
                    onChange={(e) => {
                      const newLanguages = e.target.checked
                        ? [...userPreferences.languages, lang]
                        : userPreferences.languages.filter(l => l !== lang);
                      
                      updateUserPreferences({ languages: newLanguages });
                    }}
                  />
                  <label htmlFor={`lang-${lang}`}>{lang}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="preference-group">
            <label>服务类型偏好</label>
            <div className="type-checkboxes">
              {[
                'TranslationService', 
                'CulturalExplanation', 
                'SpecializedTranslation',
                'ConversationalTranslation',
                'LiteraryTranslation'
              ].map(type => (
                <div key={type} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`type-${type}`}
                    checked={userPreferences.serviceTypes.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...userPreferences.serviceTypes, type]
                        : userPreferences.serviceTypes.filter(t => t !== type);
                      
                      updateUserPreferences({ serviceTypes: newTypes });
                    }}
                  />
                  <label htmlFor={`type-${type}`}>{type}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="preference-group">
            <label>价格范围 (CULT/token)</label>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={userPreferences.priceRange[1]}
                onChange={(e) => {
                  updateUserPreferences({ 
                    priceRange: [0, parseFloat(e.target.value)] 
                  });
                }}
              />
              <div className="price-labels">
                <span>0</span>
                <span>{userPreferences.priceRange[1]}</span>
                <span>0.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ai-service-rating">
      <div className="rating-header">
        <h2>AI服务评分与推荐</h2>
      </div>
      
      {/* 推荐服务 */}
      {recommendedServices.length > 0 && (
        <div className="recommended-services">
          <div className="section-header">
            <h3>为您推荐</h3>
            <button 
              className="btn-refresh-recommendations"
              onClick={() => generateRecommendations(aiServices)}
              disabled={isLoading}
            >
              刷新推荐
            </button>
          </div>
          
          <div className="recommended-grid">
            {recommendedServices.map(service => renderServiceCard(service, true))}
          </div>
        </div>
      )}
      
      {/* 用户偏好设置 */}
      {renderPreferencesSection()}
      
      {/* 服务列表 */}
      <div className="all-services">
        <div className="section-header">
          <h3>所有服务</h3>
          <div className="service-filters">
            <input
              type="text"
              placeholder="搜索服务..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
            >
              <option value="all">所有语言</option>
              <option value="en-zh">英译中</option>
              <option value="zh-en">中译英</option>
              <option value="ja-zh">日译中</option>
              <option value="fr-zh">法译中</option>
              <option value="ko-zh">韩译中</option>
            </select>
            
            <select
              value={filterMinRating}
              onChange={(e) => setFilterMinRating(parseFloat(e.target.value))}
            >
              <option value="0">所有评分</option>
              <option value="3">3星以上</option>
              <option value="4">4星以上</option>
              <option value="4.5">4.5星以上</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">按评分排序</option>
              <option value="popularity">按人气排序</option>
              <option value="price_low">价格从低到高</option>
              <option value="price_high">价格从高到低</option>
            </select>
          </div>
        </div>
        
        <div className="services-grid">
          {isLoading && aiServices.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>加载中...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={loadServices}>重试</button>
            </div>
          ) : getCurrentServices().length > 0 ? (
            getCurrentServices().map(service => renderServiceCard(service))
          ) : (
            <div className="empty-message">
              <p>没有找到符合条件的服务</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 模态框 */}
      {showDetailModal && renderServiceDetailModal()}
      {showRatingModal && renderRatingModal()}
      
      {/* 通知 */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(prev => ({ ...prev, show: false }))}>×</button>
        </div>
      )}
    </div>
  );
};

export default AIServiceRating;
