import { useState, useEffect, useCallback } from 'react';

/**
 * 推荐引擎Hook
 * 管理NFT推荐系统的状态和逻辑
 */
export const useRecommendationEngine = (userId) => {
  const [recommendations, setRecommendations] = useState({
    personalized: [],
    trending: [],
    new: [],
    similar: [],
    investment: [],
    community: []
  });

  const [loading, setLoading] = useState({
    initial: true,
    personalized: false,
    trending: false,
    new: false,
    similar: false,
    investment: false,
    community: false
  });

  const [error, setError] = useState({});

  // 模拟推荐API
  const fetchRecommendations = useCallback(async (type, limit = 10) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setError(prev => ({ ...prev, [type]: null }));

    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // 生成模拟推荐数据
      const mockRecommendations = generateMockRecommendations(type, limit);
      
      setRecommendations(prev => ({
        ...prev,
        [type]: mockRecommendations
      }));

    } catch (err) {
      setError(prev => ({
        ...prev,
        [type]: err
      }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  // 生成模拟推荐数据
  const generateMockRecommendations = (type, limit) => {
    const categories = ['visual-art', 'sculpture', 'photography', 'music', 'literature'];
    const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];
    const creators = ['Alice Chen', 'Bob Wang', 'Carol Li', 'David Zhang', 'Eva Liu'];
    const collections = ['CultureBridge Genesis', 'Digital Heritage', 'Modern Masters', 'Pixel Legends'];

    const getRecommendationReason = (type) => {
      const reasons = {
        personalized: [
          '基于你对数字艺术的喜好',
          '与你收藏的作品风格相似',
          '你关注的创作者的新作品',
          '符合你的价格偏好范围'
        ],
        trending: [
          '24小时内浏览量最高',
          '社区讨论度最高的作品',
          '价格涨幅最大的NFT',
          '新晋热门创作者作品'
        ],
        new: [
          '刚刚上架的新作品',
          '知名创作者的最新发布',
          '限量版首发作品',
          '独家合作系列'
        ],
        similar: [
          '与你收藏的《数字梦境》相似',
          '同一创作者的其他作品',
          '相同艺术风格的作品',
          '同系列的其他NFT'
        ],
        investment: [
          '历史价格表现优秀',
          '创作者作品升值潜力大',
          '稀有度高，供应量有限',
          '市场需求持续增长'
        ],
        community: [
          '社区成员热门收藏',
          '专家推荐的优质作品',
          '用户评分最高的NFT',
          '收藏家青睐的系列'
        ]
      };
      
      const typeReasons = reasons[type] || reasons.personalized;
      return typeReasons[Math.floor(Math.random() * typeReasons.length)];
    };

    return Array.from({ length: limit }, (_, index) => ({
      id: `${type}-${index + 1}`,
      name: `${type === 'trending' ? '热门' : type === 'new' ? '新品' : '精选'} NFT #${index + 1}`,
      image: `https://picsum.photos/400/400?random=${Date.now() + index}`,
      creator: {
        name: creators[Math.floor(Math.random() * creators.length)],
        avatar: `https://picsum.photos/40/40?random=${Date.now() + index + 1000}`
      },
      price: (Math.random() * 10 + 0.1).toFixed(3),
      priceChange: type === 'trending' ? (Math.random() * 50 - 10) : null,
      recommendationType: type,
      recommendationScore: Math.random() * 0.4 + 0.6, // 0.6-1.0
      recommendationReason: getRecommendationReason(type),
      stats: {
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100)
      },
      collection: collections[Math.floor(Math.random() * collections.length)],
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
      category: categories[Math.floor(Math.random() * categories.length)]
    }));
  };

  // 初始化推荐数据
  useEffect(() => {
    const initializeRecommendations = async () => {
      setLoading(prev => ({ ...prev, initial: true }));
      
      try {
        // 并行加载所有推荐类型
        await Promise.all([
          fetchRecommendations('personalized', 8),
          fetchRecommendations('trending', 12),
          fetchRecommendations('new', 6),
          fetchRecommendations('similar', 10),
          fetchRecommendations('investment', 6),
          fetchRecommendations('community', 8)
        ]);
      } catch (error) {
        console.error('初始化推荐失败:', error);
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };

    if (userId) {
      initializeRecommendations();
    }
  }, [userId, fetchRecommendations]);

  // 刷新特定类型的推荐
  const refreshRecommendations = useCallback(async (type) => {
    const limits = {
      personalized: 8,
      trending: 12,
      new: 6,
      similar: 10,
      investment: 6,
      community: 8
    };
    
    await fetchRecommendations(type, limits[type]);
  }, [fetchRecommendations]);

  // 更新用户反馈
  const updateUserFeedback = useCallback((recommendationId, feedback) => {
    // 这里可以发送反馈到后端
    console.log('用户反馈:', { recommendationId, feedback });
    
    // 模拟反馈处理
    if (feedback.type === 'favorite' && feedback.value) {
      // 用户收藏了推荐，可以用来改进算法
      console.log('用户收藏了推荐:', recommendationId);
    }
    
    if (feedback.type === 'click') {
      // 用户点击了推荐，记录点击行为
      console.log('用户点击了推荐:', recommendationId);
    }
  }, []);

  // 获取推荐统计信息
  const getRecommendationStats = useCallback(() => {
    const totalRecommendations = Object.values(recommendations)
      .reduce((total, items) => total + items.length, 0);
    
    const loadingCount = Object.values(loading)
      .filter(isLoading => isLoading).length;
    
    const errorCount = Object.values(error)
      .filter(err => err !== null).length;
    
    return {
      total: totalRecommendations,
      loading: loadingCount,
      errors: errorCount
    };
  }, [recommendations, loading, error]);

  return {
    recommendations,
    loading,
    error,
    refreshRecommendations,
    updateUserFeedback,
    getRecommendationStats
  };
};

